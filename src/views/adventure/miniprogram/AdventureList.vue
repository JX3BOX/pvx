<template>
    <div class="p-adventure-List p-common-list" v-loading="loading" ref="listRef">
        <AdventureTabs :active="active" :body_types="list" @setActive="setActive" @change="onSearch" />
        <template v-if="active === 'all'">
            <div v-for="(item, index) in list" :key="'l' + index" class="m-pvx-adventure-list"
                :class="`m-pvx-adventure-list-${index}`">
                <template v-if="item.list.length">
                    <CardBannerList :class="{ search: tabsData.name }" :count="count" :minw="212"
                        :data="{ ...itemData, type: item.value }" @update:load="handleLoad" :items="item.list">
                        <template v-slot:title>
                            <div>{{ item.label + "奇遇" }}</div>
                        </template>
                        <template v-slot:action>
                            <div @click="setActive(item.value)">查看全部</div>
                        </template>
                        <template v-slot="{ item }">
                            <AdventureItem :key="item.id" :item="item" :useWxNav="true" />
                        </template>
                    </CardBannerList>
                </template>
            </div>
        </template>
        <div class="m-pvx-adventure-list" v-else>
            <div class="u-type u-pvx-all-type">
                <div class="u-title">{{ typeName + "奇遇" }}</div>
            </div>
            <div class="m-pvx-face-list--all" v-if="subList.length">
                <AdventureItem v-for="item in subList" :key="item.id" :item="item" :useWxNav="true" />
            </div>
            <div class="m-get-more" v-if="hasNextPage">
                <el-link type="primary" @click="appendPage">加载更多</el-link>
            </div>
        </div>
        <div class="u-archive-alert" v-if="noList || (subList && !subList.length)">
            <el-alert title="没有对应的奇遇，请重新查找" type="info" center show-icon />
        </div>

        <SuspendCommon :btnOptions="{ showHome: true }" :drawerOptions="{ hideType: hideType }">
            <template #default>
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="showTypeForm = true">
                        <img class="u-icon" src="@/assets/img/adventure/switch_icon.svg" />
                        <span>{{ typeName }}</span>
                    </div>
                    <div class="u-btn-item" @click="showSearchForm = true">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/search.svg" svg-inline />
                        <span>搜索</span>
                    </div>
                </div>
            </template>
        </SuspendCommon>

        <!-- 奇遇切换 -->
        <el-drawer v-model="showTypeForm" direction="btt" :with-header="false" :modal-append-to-body="false"
            append-to-body class="c-drawer p-adventure-drawer-type">
            <div class="u-drawer-title">类型</div>
            <div class="m-drawer-content">
                <div class="m-type-item" :class="{ 'is-active': active === 'all' }" @click="setActive('all')">
                    <img class="u-type-icon" src="@/assets/img/pvxsuspension/all.svg" svg-inline />
                    <div class="u-type-name">全部</div>
                </div>
                <div class="m-type-item" :class="{ 'is-active': active === 'perfect' }" @click="setActive('perfect')">
                    <img class="u-type-icon" src="@/assets/img/adventure/perfect.svg" svg-inline />
                    <div class="u-type-name">绝世</div>
                </div>
                <div class="m-type-item" :class="{ 'is-active': active === 'normal' }" @click="setActive('normal')">
                    <img class="u-type-icon" src="@/assets/img/adventure/normal.svg" svg-inline />
                    <div class="u-type-name">普通</div>
                </div>
                <div class="m-type-item" :class="{ 'is-active': active === 'pet' }" @click="setActive('pet')">
                    <img class="u-type-icon" src="@/assets/img/adventure/pet.svg" svg-inline />
                    <div class="u-type-name">宠物</div>
                </div>
            </div>
        </el-drawer>

        <!-- 奇遇搜索 -->
        <el-drawer v-model="showSearchForm" direction="btt" :with-header="false" :modal-append-to-body="false"
            append-to-body class="c-drawer p-adventure-drawer-type">
            <div class="u-drawer-title">搜索</div>
            <div class="m-search-input">
                <input type="text" class="u-input" placeholder="请输入搜索内容" @input="onMiniSearch" />
            </div>
        </el-drawer>
    </div>
</template>

<script>
import CardBannerList from "@/components/common/card_banner_list.vue";
import AdventureTabs from "@/components/adventure/tabs.vue";
import AdventureItem from "@/components/adventure/item.vue";
import { getAdventures } from "@/service/adventure/adventure";
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
export default {
    name: "adventureListMini",
    props: [],
    components: { CardBannerList, AdventureTabs, AdventureItem, SuspendCommon },
    data: function () {
        return {
            hideType: ["collect", "rss", "laterOn", "pin", "user", "report"],
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
            count: 2,
            appendMode: false,
            itemData: {
                color: "#E86F00",
                width: "220",
                height: "224",
            },
            showTypeForm: false,
            showSearchForm: false,
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
            this.page = 1;
            this.showTypeForm = false;
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
        onMiniSearch(event) {
            this.page = 1;
            this.tabsData = { name: event.target.value, type: this.active };
            this.loadData();
        },
        handleLoad(type) {
            const page = this.list.filter((e) => e.value == type)[0].page;
            let params = { ...this.params };
            params.per = this.count * 3;
            params.page = page + 1;
            params.type = type;
            this.loadList(params, type);
        },
    },
    mounted: function () {
        this.loadData();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/miniprogram/list.less";
@import "~@/assets/css/common/drawer.less";
</style>
