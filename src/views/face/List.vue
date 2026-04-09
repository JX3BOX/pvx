<!--
 * List - 脸型模块列表页
 * 
 * @description 展示脸型列表，支持推荐列表和全部列表两种模式
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持按脸型类型分类展示（写实、写意）
 * - 支持推荐列表和全部列表切换
 * - 支持分页加载
 * - 支持搜索筛选
 * - 响应式布局适配
 * - 支持公告展示
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
        <faceTabs :body_types="list" :active="active" :link="link" @change="handleFaceTabChange"
            @setActive="setActive" />
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
import { cloneDeep, omit, concat, debounce } from "lodash";
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
            // 请求标识符，用于处理竞态问题（快速切换 tab 时取消过期请求）
            requestId: 0,
            // 是否正在切换 Tab
            isTabSwitching: false,
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
        // 获取当前激活的 tab 项，减少重复查找
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
            // 使用 activeTab 替代 filter()[0]，减少遍历次数
            const tab = this.activeTab;
            return tab && tab.pages > 1 && this.page < tab.pages;
        },
        alertTitle: function () {
            if (this.tabsData.title) return "没找到对应的捏脸，请重新选择条件或关键词搜索";
            return "没有找到相关的捏脸";
        },
        subList() {
            // 使用 activeTab 获取当前激活项的列表数据
            if (!this.active) return null;
            const tab = this.activeTab;
            return tab ? tab.list : [];
        },
        typeName() {
            // 使用可选链避免空指针
            return this.activeTab?.label || '';
        },
        noList() {
            if (this.active === -1) {
                // 全部 tab 下，检查所有分类是否都为空
                return this.list.every((obj) => obj.list.length === 0);
            }
            // 其他 tab 下，检查当前分类列表是否为空
            const sub = this.subList;
            return !sub || sub.length === 0;
        },
    },
    watch: {
        // Tab 切换时立即触发加载
        active: {
            handler(val) {
                // 先设置每页数量和页码，再加载数据
                this.per = val === -1 ? this.count : this.count * 3;
                // 延迟到 nextTick 执行，确保 page=1 的响应式变化先完成
                this.$nextTick(() => {
                    this.page = 1;
                    this.loadData();
                });
            },
            immediate: false,
        },
        // 监听 tabsData 变化（筛选条件变化时触发）
        tabsData: {
            handler() {
                // 如果正在切换 Tab，不触发加载
                if (this.isTabSwitching) return;
                this.loadData();
            },
            deep: true,
        },
    },

    methods: {
        setActive(val) {
            // 标记正在切换 Tab
            this.isTabSwitching = true;
            this.active = val;
            document.documentElement.scrollTop = 0;
        },
        // 捏脸海报
        getSliders() {
            getSliders("slider", this.client, 9).then((res) => {
                this.slidersList = res.data.data.list || [];
            });
        },
        // 加载数据（添加竞态处理）
        loadData() {
            this.loading = true;
            // 生成新的请求标识
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
        // 加载列表数据（添加竞态处理，避免数据错乱）
        loadList(params, key, requestId) {
            const index = this.list.findIndex((e) => e.value === key);
            if (index === -1) return;

            if (this.list[index].pages < params.pageIndex && this.active === -1) {
                params.pageIndex = 1;
            }

            getFaceList(params)
                .then((res) => {
                    // 检查请求是否已过时（快速切换 tab 时丢弃旧响应）
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
                    // 仅在最新请求完成时关闭 loading
                    if (requestId === this.requestId) {
                        this.loading = false;
                        this.appendMode = false;
                        // 请求完成后重置 Tab 切换标志
                        this.isTabSwitching = false;
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
            this.page = 1;
            this.tabsData = data;
            // 重置 Tab 切换标志，确保筛选条件变化时能正常触发加载
            this.isTabSwitching = false;
        },
        // 页面宽度变化时重新计算每页显示数量（带防抖，避免频繁触发）
        showCount: debounce(function () {
            if (isPhone()) {
                this.per = 8;
                return;
            }
            const listWidth = this.$refs.listRef?.clientWidth - 120;
            this.count = Math.floor(listWidth / (Number(this.itemData.width) + 10));
            this.per = this.active === -1 ? this.count : this.count * 3;
        }, 200),
        // 加载更多时的处理
        handleLoad(type) {
            // 使用 find() 替代 filter()[0]，提高查找效率
            const item = this.list.find((e) => e.value === type);
            const page = item?.page || 1;
            let params = cloneDeep(this.params);
            params.pageSize = this.per;
            params.pageIndex = page + 1;
            params.body_type = type;
            // 加载更多时也使用当前最新请求标识
            this.loadList(params, type, this.requestId);
        },
        // 窗口大小变化处理
        handleResize() {
            this.showCount();
        },
    },
    mounted() {
        this.showCount();
        // 首次加载数据
        this.loadData();
        // 监听窗口大小变化，响应式调整布局
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        // 组件销毁前移除事件监听，避免内存泄漏
        window.removeEventListener('resize', this.handleResize);
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/list.less";
@import "~@/assets/css/face/item.less";
</style>
