<!--
 * List - 脸型模块列表页
 * 
 * @description 展示脸型列表，支持推荐列表和全部列表两种模式
 * @author Face & Body 模块优化团队
 * @version 2.0.0
 * 
 * @features
 * - 支持按脸型类型分类展示（写实、写意）
 * - 支持推荐列表和全部列表切换
 * - 支持分页加载
 * - 支持搜索筛选
 * - 响应式布局适配
 * - 支持公告展示
 * - 优化首次加载逻辑，避免多次触发
 * 
 * @components
 * - faceTabs: 标签页组件
 * - PublicNotice: 公告组件
 * - CardBannerList: 卡片轮播列表组件
 * - ListItem: 列表项组件
 * 
 * @api
 * - /api/face/list: 获取脸型列表
 * - /api/face/types: 获取脸型类型
 * 
 * @styles
 * - 样式文件: assets/css/face/list.less
 * - 样式文件: assets/css/face/item.less
 -->
<template>
    <div class="p-face-list" v-loading="loading" ref="listRef">
        <faceTabs :body_types="list" :active="active" :link="link" @change="handleFaceTabChange" />
        <PublicNotice bckey="face_ac" />
        <template v-if="active === -1">
            <div v-for="(item, index) in list" :key="'l' + index" class="m-face-box"
                :class="{ none: !item.list.length }">
                <CardBannerList :class="{ search: tabsData.title }" :count="count" :minw="190"
                    :data="{ ...itemData, type: item.value }" :items="item.list" @update:load="handleLoad">
                    <template v-slot:title>
                        <div>{{ item.label + "脸型" }}</div>
                        <div></div>
                    </template>
                    <template v-slot:action>
                        <div @click="setActive(item.value)">查看全部</div>
                    </template>
                    <template v-slot="{ item }">
                        <ListItem type="face" :key="item.id" :item="item" />
                    </template>
                </CardBannerList>
            </div>
        </template>
        <div class="m-face-box" v-else>
            <div class="m-face-title u-type">
                <div class="u-title">{{ typeName + "脸型" }}</div>
            </div>
            <div class="m-face-list--all">
                <ListItem type="face" v-for="item in subList" :key="item.id" :item="item" />
            </div>
            <el-button class="m-archive-more" v-show="hasNextPage" type="primary" @click="appendPage"
                :loading="loading">
                <el-icon class="el-icon--left">
                    <ArrowDown />
                </el-icon>加载更多</el-button>
            <el-pagination class="m-archive-pages" background layout="total, prev, pager, next, jumper"
                :hide-on-single-page="true" @current-change="changePage" @prev-click="changePage"
                @next-click="changePage" :page-size="per" :total="total" v-model:current-page="page"></el-pagination>
        </div>
        <el-alert v-if="noList" class="m-archive-null" :title="alertTitle" type="info" center show-icon></el-alert>
    </div>
</template>
<script>
import PublicNotice from "@/components/PublicNotice";
import CardBannerList from "@/components/common/card_banner_list.vue";
import faceTabs from "@/components/common/face-body/tabs";
import ListItem from "@/components/common/face-body/ListItem.vue";
import { isPhone } from "@/utils/index";
import { cloneDeep, omit, concat, debounce, isEqual } from "lodash";
import { getFaceList, getSliders } from "@/service/face";
import { ArrowDown } from '@element-plus/icons-vue';

export default {
    name: "face",
    components: { CardBannerList, faceTabs, ListItem, PublicNotice, ArrowDown },
    data() {
        return {
            loading: false,
            tabsData: {},
            active: -1,
            requestId: 0,
            isInitialized: false,
            isBodyTypeChanging: false,
            list: [
                { label: "全部", list: [], value: -1, client: ["std", "origin"], page: 1, pages: 1 },
                { label: "成男", list: [], value: 1, client: ["std", "origin"], page: 1, pages: 1 },
                { label: "成女", list: [], value: 2, client: ["std", "origin"], page: 1, pages: 1 },
                { label: "正太", list: [], value: 5, client: ["std"], page: 1, pages: 1 },
                { label: "萝莉", list: [], value: 6, client: ["std", "origin"], page: 1, pages: 1 },
            ],
            page: 1,
            per: 14,
            total: 0,
            count: 0,
            appendMode: false,
            link: {
                data: "/face/facedata",
                key: "face",
            },
            itemData: {
                color: "#786CBB",
                width: "190",
                height: "280",
            },
        };
    },
    computed: {
        activeTab() {
            return this.list.find((e) => e.value === this.active);
        },
        client() {
            return this.$store.state.client;
        },
        params() {
            const { tabsData } = this;
            return {
                ...tabsData,
                body_type: this.active,
                pageSize: this.per,
                client: this.client,
            };
        },
        hasNextPage() {
            const tab = this.activeTab;
            return tab && tab.pages > 1 && this.page < tab.pages;
        },
        alertTitle: function () {
            if (this.tabsData.title) return "没找到对应的捏脸，请重新选择条件或关键词搜索";
            return "没有找到相关的捏脸";
        },
        subList() {
            if (!this.active) return null;
            const tab = this.activeTab;
            return tab ? tab.list : [];
        },
        typeName() {
            return this.activeTab?.label || '';
        },
        noList() {
            if (this.active === -1) {
                return this.list.every((obj) => obj.list.length === 0);
            }
            const sub = this.subList;
            return !sub || sub.length === 0;
        },
    },
    watch: {
        params: {
            handler(newVal, oldVal) {
                if (!this.isInitialized) return;
                if (this.isBodyTypeChanging) return;
                if (isEqual(newVal, oldVal)) return;
                console.log('params 变化触发加载', { newVal, oldVal });
                this.loadData();
            },
            deep: true,
        },
        active: {
            handler(val, oldVal) {
                this.per = val === -1 ? this.count : this.count * 3;
                this.page = 1;
            },
            immediate: false,
        },
    },

    methods: {
        setActive(val) {
            this.active = val;
            document.documentElement.scrollTop = 0;
        },

        getSliders() {
            getSliders("slider", this.client, 9).then((res) => {
                this.slidersList = res.data.data.list || [];
            });
        },

        loadData() {
            this.loading = true;
            const currentRequestId = ++this.requestId;

            let params = omit(this.params, ["type"]);
            if (this.active === -1) {
                const list = this.list.filter((e) => e.value !== -1);
                list.forEach((e) => {
                    params.pageIndex = e.page;
                    params.body_type = e.value;
                    this.loadList(params, e.value, currentRequestId);
                });
            } else {
                params.pageIndex = this.page;
                this.loadList({ ...params, body_type: this.active }, this.active, currentRequestId);
            }
        },

        loadList(params, key, requestId) {
            const index = this.list.findIndex((e) => e.value === key);
            if (index === -1) return;

            if (this.list[index].pages < params.pageIndex && this.active === -1) {
                params.pageIndex = 1;
            }

            getFaceList(params)
                .then((res) => {
                    if (requestId !== this.requestId) return;

                    const { list, page } = res.data.data;
                    const _list = this.appendMode ? concat(this.list[index].list, list) : list;
                    this.list[index].list = _list || [];
                    this.list[index].page = page.index || 1;
                    this.list[index].pages = page.pageTotal || 1;
                    if (this.active !== -1) this.page = page.index || 1;
                    this.total = page.total;
                })
                .finally(() => {
                    if (requestId === this.requestId) {
                        this.loading = false;
                        this.appendMode = false;
                    }
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

        handleFaceTabChange: function (data) {
            const isEvent = data instanceof Event;
            if (isEvent) return;

            const isBodyTypeChange = data.body_type !== undefined && data.body_type !== this.active;

            if (isBodyTypeChange) {
                this.isBodyTypeChanging = true;
            }

            this.page = 1;
            this.tabsData = data;

            if (isBodyTypeChange) {
                this.active = data.body_type;
                document.documentElement.scrollTop = 0;

                this.$nextTick(() => {
                    this.loadData();
                    this.isBodyTypeChanging = false;
                });
            }
        },

        showCount() {
            if (isPhone()) {
                this.per = 8;
                return;
            }
            const listWidth = this.$refs.listRef?.clientWidth - 120;
            this.count = Math.floor(listWidth / (Number(this.itemData.width) + 10));
            this.per = this.active === -1 ? this.count : this.count * 3;
        },

        handleLoad(type) {
            const item = this.list.find((e) => e.value === type);
            const page = item?.page || 1;
            let params = cloneDeep(this.params);
            params.pageSize = this.per;
            params.pageIndex = page + 1;
            params.body_type = type;
            this.loadList(params, type, this.requestId);
        },

        handleResize: debounce(function () {
            this.showCount();
        }, 200),
    },
    mounted() {
        this.showCount();
        this.$nextTick(() => {
            this.isInitialized = true;
            console.log('初始化完成，触发首次加载');
            this.loadData();
        });
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/list.less";
@import "~@/assets/css/face/item.less";
</style>
