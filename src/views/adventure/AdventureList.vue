<template>
    <div class="p-adventure-List p-common-list" v-loading="loading" ref="listRef">
        <AdventureTabs :active="active" :body_types="list" @setActive="setActive" @change="onSearch" />
        <template v-if="active === 'all'">
            <div v-for="(item, index) in list" :key="'l' + index" class="m-pvx-adventure-list"
                :class="`m-pvx-adventure-list-${index}`">
                <template v-if="item.list.length">
                    <CardBannerList :class="{ search: tabsData.name }" :count="count" :minw="212"
                        :data="{ ...itemData, type: item.value }" @update:load="handleLoad" :items="item.list.slice(0, count)">
                        <template v-slot:title>
                            <div>{{ item.label + "奇遇" }}</div>
                        </template>
                        <template v-slot:action>
                            <div @click="setActive(item.value)">查看全部</div>
                        </template>
                        <template v-slot="{ item }">
                            <AdventureItem :key="item.id" :item="item" />
                        </template>
                    </CardBannerList>
                </template>
            </div>
        </template>
        <div class="m-pvx-adventure-list" v-else>
            <div class="u-type u-pvx-all-type">
                <div class="u-title">{{ typeName + "奇遇" }}</div>
            </div>
            <div class="m-pvx-face-list--all" v-if="subList.length"
                :style="`grid-template-columns: repeat(${count}, 1fr)`">
                <AdventureItem v-for="item in subList" :key="item.id" :item="item" />
            </div>
            <el-button class="m-pvx-adventure-more" v-show="hasNextPage" type="primary" @click="appendPage"
                :loading="loading" icon="el-icon-arrow-down">加载更多</el-button>
            <el-pagination class="m-pvx-adventure-pages" background layout="total, prev, pager, next, jumper"
                :hide-on-single-page="true" :page-size="per" :total="total" :current-page="page"
                @current-change="changePage"></el-pagination>
        </div>
        <div class="u-archive-alert" v-if="noList || (subList && !subList.length)">
            <el-alert title="没有对应的奇遇，请重新查找" type="info" center show-icon />
        </div>
    </div>
</template>

<script>
import CardBannerList from "@/components/common/card_banner_list.vue";
import AdventureTabs from "@/components/adventure/tabs.vue";
import AdventureItem from "@/components/adventure/item.vue";
import { getAdventures } from "@/service/adventure/adventure";
import dayjs from "@/utils/day";
export default {
    name: "adventureList",
    props: [],
    components: { CardBannerList, AdventureTabs, AdventureItem },
    data: function () {
        return {
            loading: false,
            tabsData: {},
            list: [
                { value: "all", label: "全部", client: ["std", "origin"], list: [] },
                { value: "perfect", label: "绝世", client: ["std", "origin"], list: [], pages: 1, page: 1 },
                { value: "normal", label: "普通", client: ["std", "origin"], list: [], page: 1, pages: 1 },
                { value: "pet", label: "宠物", client: ["std", "origin"], list: [], page: 1, pages: 1 },
            ],
            active: "all",
            page: 1,
            total: 0,
            per: 8,
            count: 0,
            appendMode: false,
            itemData: {
                color: "#E86F00",
                width: "220",
                height: "224",
            },
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        params({ tabsData }) {
            return { ...tabsData, per: this.per, client: this.client };
        },
        typeName() {
            return this.list.filter((e) => e.value == this.active)[0].label;
        },
        subList() {
            if (this.active === "all") return null;
            return this.list.filter((e) => e.value == this.active)[0].list;
        },
        noList() {
            return this.list.filter((e) => e.value !== "all").every((e) => !e.list.length);
        },
        hasNextPage() {
            const pages = this.list.filter((e) => e.value == this.active)[0].pages;
            return pages > 1 && this.page < pages;
        },
        camp() {
            return dayjs.tz().date() % 2 ? 1 : 2;
        },
    },
    watch: {
        active: {
            immediate: true,
            handler: function () {
                this.page = 1;
            },
        },
    },
    methods: {
        setActive(val) {
            if (val === this.active) return;
            this.active = val;
            this.showCount();
            this.page = 1;
            document.documentElement.scrollTop = 0;
            this.loadData();
        },
        loadData() {
            this.loading = true;
            let params = { ...this.params };
            const { type, ...rest } = params;
            if (this.active === "all") {
                const list = this.list.filter((e) => e.value !== "all");
                list.forEach((e) => {
                    rest.page = e.page;
                    rest.type = e.value;
                    this.loadList(rest, e.value);
                });
            } else {
                this.loadList({ ...rest, type: this.active, page: this.page }, this.active);
            }
        },
        loadList(params, key) {
            const index = this.list.findIndex((e) => e.value == key);
            if (this.list[index].pages < params.page && this.active === "all") params.page = 1;
            getAdventures(params)
                .then((res) => {
                    const { list, total, pages, page } = res.data;
                    const _list = this.appendMode ? [...this.list[index].list, ...list] : list;
                    this.list[index].list = _list || [];
                    this.list[index].page = page || 1;
                    this.list[index].pages = pages || 1;
                    if (this.active !== "all") this.page = page || 1;
                    this.total = total;
                })
                .finally(() => {
                    this.loading = false;
                    this.appendMode = false;
                });
        },
        changePage(i) {
            this.page = i;
            this.loadData();
        },
        appendPage() {
            this.appendMode = true;
            this.handleLoad(this.active);
        },
        onSearch(params) {
            const isEvent = params instanceof Event;
            if (isEvent) return;
            this.page = 1;
            this.tabsData = params;
            this.loadData();
        },
        handleResize() {
            this.showCount();
        },
        showCount() {
            const listWidth = this.$refs.listRef?.clientWidth || 1200;
            const cardWidth = Number(this.itemData.width);
            const gridGap = 12;

            if (listWidth <= 520) {
                this.count = 1;
                this.per = 8;
                return;
            }
            if (listWidth <= 1024) {
                this.count = 2;
                this.per = 16;
                return;
            }

            if (this.active === "all") {
                const availableWidth = listWidth - 120;
                this.count = Math.max(Math.floor(availableWidth / (cardWidth + gridGap)), 1);
                this.per = this.count;
            } else {
                this.count = Math.max(Math.floor(listWidth / (cardWidth + gridGap)), 1);
                this.per = this.count * 3;
            }
        },
        handleLoad(type) {
            const entry = this.list.filter((e) => e.value == type)[0];
            const page = entry.page;
            let params = { ...this.params };
            if (this.active === "all") {
                params.per = this.count;
                params.page = page + 1 > entry.pages ? 1 : page + 1;
            } else {
                params.per = this.count * 3;
                params.page = page + 1;
            }
            params.type = type;
            this.loadList(params, type);
        },
    },
    mounted: function () {
        this.showCount();
        this.loadData();
        window.addEventListener("resize", this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/pc/list.less";
@import "~@/assets/css/common/drawer.less";
</style>
