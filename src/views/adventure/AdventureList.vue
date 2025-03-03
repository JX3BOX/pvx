<template>
    <div class="p-adventure-List p-common-list" v-loading="loading" ref="listRef">
        <AdventureTabs :active="active" :body_types="list" @setActive="setActive" @change="onSearch" />
        <div class="m-type-list">
            <div
                class="u-type-item"
                :class="{
                    'is-active': active === item.value,
                }"
                v-for="(item, index) in list"
                :key="'l' + index"
                @click="setActive(item.value)"
            >
                {{ item.label }}
            </div>
        </div>
        <template v-if="active === 'all'">
            <div
                v-for="(item, index) in list"
                :key="'l' + index"
                class="m-adventure-list"
                :class="`m-adventure-list-${index}`"
            >
                <template v-if="item.list.length">
                    <CardBannerList
                        :class="{ search: tabsData.name }"
                        :count="count"
                        :minw="212"
                        :data="{ ...itemData, type: item.value }"
                        @update:load="handleLoad"
                        :items="item.list"
                    >
                        <template v-slot:title>
                            <div>{{ item.label + "奇遇" }}</div>
                        </template>
                        <template v-slot:action>
                            <div @click="setActive(item.value)">查看全部</div>
                        </template>
                        <template v-slot="{ item }">
                            <AdventureItem :key="item.id" :item="item" :reporter="{ aggregate: listId(list) }" />
                        </template>
                    </CardBannerList>
                </template>
            </div>
        </template>
        <div class="m-adventure-list" v-else>
            <div class="u-type u-all-type">
                <div class="u-title">{{ typeName + "奇遇" }}</div>
            </div>
            <div class="m-face-list--all" v-if="subList.length">
                <AdventureItem
                    v-for="item in subList"
                    :key="item.id"
                    :item="item"
                    :reporter="{ aggregate: listId(subList) }"
                />
            </div>
            <el-button
                class="m-archive-more"
                v-show="hasNextPage"
                type="primary"
                @click="appendPage"
                :loading="loading"
                icon="el-icon-arrow-down"
                >加载更多</el-button
            >
            <el-pagination
                class="m-archive-pages"
                background
                layout="total, prev, pager, next, jumper"
                :hide-on-single-page="true"
                :page-size="per"
                :total="total"
                :current-page="page"
                @current-change="changePage"
            ></el-pagination>
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
import { cloneDeep, omit, concat } from "lodash";
import { isPhone } from "@/utils/index";
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
                {
                    value: "all",
                    label: "全部",
                    client: ["std", "origin"],
                    list: [],
                },
                {
                    value: "perfect",
                    label: "绝世",
                    client: ["std", "origin"],
                    list: [],
                    pages: 1,
                    page: 1,
                },
                {
                    value: "normal",
                    label: "普通",
                    client: ["std", "origin"],
                    list: [],
                    page: 1,
                    pages: 1,
                },
                {
                    value: "pet",
                    label: "宠物",
                    client: ["std", "origin"],
                    list: [],
                    page: 1,
                    pages: 1,
                },
            ],
            active: "all",

            page: 1, //当前页数
            total: 0, //总条目数
            per: 8, //每页条目
            count: 0, // 自动判断最多显示几个

            appendMode: false,
            school: "2",

            itemData: {
                color: "#E86F00",
                width: "210",
                height: "224",
            },
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },

        params({ tabsData }) {
            return {
                ...tabsData,
                per: this.per,
                client: this.client,
            };
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
        hasNextPage: function () {
            const pages = this.list.filter((e) => e.value == this.active)[0].pages;
            return pages > 1 && this.page < pages;
        },
        camp() {
            return dayjs.tz().date() % 2 ? 1 : 2;
        },
    },
    watch: {
        params: {
            deep: true,
            handler() {
                this.loadData();
            },
        },
        active: {
            immediate: true,
            handler: function (val) {
                this.per = val == "all" ? this.count : this.count * 3;
                this.page = 1;
            },
        },
    },
    methods: {
        // 设置当前tab
        setActive(val) {
            this.active = val;
            document.documentElement.scrollTop = 0;
        },
        // 加载数据
        loadData() {
            this.loading = true;
            let params = omit(this.params, ["type"]);
            if (this.active === "all") {
                const list = this.list.filter((e) => e.value !== "all");
                list.forEach((e) => {
                    params.page = e.page;
                    params.type = e.value;
                    this.loadList(params, e.value);
                });
            } else {
                params.page = this.page;
                this.loadList({ ...params, type: this.active }, this.active);
            }
        },
        // 加载type对应的数据
        loadList(params, key) {
            const index = this.list.findIndex((e) => e.value == key);
            if (this.list[index].pages < params.page && this.active === "all") params.page = 1;
            getAdventures(params)
                .then((res) => {
                    const { list, total, pages, page } = res.data;
                    const _list = this.appendMode ? concat(this.list[index].list, list) : list;
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
        //处理特殊的链接
        toSpecial(data) {
            const type = data.szRewardType;
            let str = data.szOpenRewardPath;
            const name = data.szOpenRewardPath.split("\\").filter(Boolean).pop();
            if (type == "school") str = `ui/Image/Adventure/reward/Open/${name}/school_${this.school}_Open.tga`;
            if (type == "camp") {
                data.bHide;
                str = `ui/Image/Adventure/reward/Open/${name}/camp_${this.camp}_Open.tga`;
            }
            data.szOpenRewardPath = str;
            return data;
        },
        // 切换页数
        changePage(i) {
            this.page = i;
            this.loadData();
        },
        // 加载更多
        appendPage() {
            this.appendMode = true;
            this.handleLoad(this.active);
        },
        // 搜索toolbar传值
        onSearch(params) {
            this.page = 1;
            this.tabsData = params;
        },
        // 按宽度显示个数
        showCount() {
            if (isPhone()) {
                this.per = 8;
                return;
            }
            const listWidth = this.$refs.listRef?.clientWidth - 120;
            this.count = Math.floor(listWidth / this.itemData.width);
            this.per = this.active == "all" ? this.count : this.count * 3;
        },
        // 单独加载
        handleLoad(type) {
            const page = this.list.filter((e) => e.value == type)[0].page;
            let params = cloneDeep(this.params);
            params.per = this.per;
            params.page = page + 1;
            params.type = type;
            this.loadList(params, type);
        },
        listId(list) {
            return list.map((e) => e.id);
        },
    },
    mounted: function () {
        this.showCount();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/list.less";
</style>
