<!--
 * List - 体型模块列表页
 * 
 * @description 展示体型列表，支持推荐列表和全部列表两种模式
 * @author Face & Body 模块优化团队
 * @version 2.0.0
 * 
 * @features
 * - 支持按体型类型分类展示（成男、成女、正太、萝莉）
 * - 支持推荐列表和全部列表切换
 * - 支持分页加载
 * - 支持搜索筛选
 * - 响应式布局适配
 * - 优化首次加载逻辑，避免多次触发
 * 
 * @components
 * - pvxTabs: 标签页组件
 * - CardBannerList: 卡片轮播列表组件
 * - ListItem: 列表项组件
 * 
 * @api
 * - /api/body/list: 获取体型列表
 * - /api/body/types: 获取体型类型
 * 
 * @styles
 * - 样式文件: assets/css/body/list.less
 * - 样式文件: assets/css/body/item.less
 -->
<template>
    <div class="p-body-list" v-loading="loading" ref="listRef">
        <pvxTabs @change="handleBodyTabChange" :body_types="list" :link="link" :active="active" />
        <template v-if="active === -1">
            <div v-for="(item, index) in list" :key="'l' + index" class="m-body-box"
                :class="{ none: !item.list.length }">
                <CardBannerList :class="{ search: tabsData.name }" :count="count" :minw="200"
                    :data="{ ...itemData, type: item.value }" @update:load="handleLoad" :items="item.list">
                    <template v-slot:title>
                        <div>{{ item.label + "体型" }}</div>
                    </template>
                    <template v-slot:action>
                        <div @click="setActive(item.value)">查看全部</div>
                    </template>
                    <template v-slot="{ item }">
                        <ListItem type="body" :key="item.id" :item="item" />
                    </template>
                </CardBannerList>
            </div>
        </template>
        <div class="m-body-box" v-else>
            <div class="m-body-title u-type">
                <div class="u-title">{{ typeName + "体型" }}</div>
            </div>
            <div class="m-body-list--all">
                <ListItem type="body" v-for="item in subList" :key="item.id" :item="item" />
            </div>
            <el-button class="m-archive-more" v-show="hasNextPage" type="primary" @click="appendPage"
                :loading="loading">
                <el-icon>
                    <ArrowDown />
                </el-icon>
                加载更多
            </el-button>
            <el-pagination class="m-archive-pages" background layout="total, prev, pager, next, jumper"
                :hide-on-single-page="true" @current-change="changePage" @prev-click="changePage"
                @next-click="changePage" :page-size="per" :total="total" v-model:current-page="page"></el-pagination>
        </div>
        <el-alert v-if="noList" class="m-archive-null" :title="alertTitle" type="info" center show-icon></el-alert>
    </div>
</template>
<script>
import CardBannerList from "@/components/common/card_banner_list.vue";
import pvxTabs from "@/components/common/face-body/tabs";
import ListItem from "@/components/common/face-body/ListItem.vue";
import { isPhone } from "@/utils/index";
import { cloneDeep, omit, concat, isEqual } from "lodash";
import { getBodyList, getSliders } from "@/service/body";

/**
 * 体型类型配置
 * value: 体型ID
 * label: 显示名称
 * client: 支持的客户端类型
 */
const BODY_TYPE_CONFIG = [
    { label: "全部", value: -1, client: ["std", "origin"] },
    { label: "成男", value: 1, client: ["std", "origin"] },
    { label: "成女", value: 2, client: ["std", "origin"] },
    { label: "正太", value: 5, client: ["std"] },
    { label: "萝莉", value: 6, client: ["std", "origin"] },
];

/**
 * 获取指定体型配置
 * @param {number} value - 体型value值
 * @returns {Object|undefined} 体型配置对象
 */
const getBodyTypeItem = (value) => BODY_TYPE_CONFIG.find(item => item.value === value);

/**
 * 初始化体型列表数据结构
 * 每个体型包含：数据列表、当前页码、总页数
 * @returns {Array} 初始化后的体型列表
 */
const initBodyList = () => {
    return BODY_TYPE_CONFIG.map(item => ({
        ...item,
        list: [],
        page: 1,
        pages: 1
    }));
};

export default {
    name: "bodyList",
    components: { CardBannerList, pvxTabs, ListItem },
    data() {
        return {
            loading: false,
            tabsData: {},
            active: -1,
            list: initBodyList(),
            page: 1,
            per: 14,
            total: 0,
            count: 0,
            appendMode: false,
            isInitialized: false,
            isBodyTypeChanging: false,
            link: {
                data: "/body/bodydata",
                key: "body",
            },
            itemData: {
                color: "#786CBB",
                width: "200",
                height: "368",
            },
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        params() {
            return {
                is_new_face: -1,
                body_type: this.active,
                pageSize: this.per,
                client: this.client,
                ...this.tabsData,
            };
        },
        hasNextPage() {
            const currentType = getBodyTypeItem(this.active);
            if (!currentType) return false;
            const listItem = this.list.find(e => e.value === this.active);
            return listItem && listItem.pages > 1 && this.page < listItem.pages;
        },
        alertTitle() {
            return this.tabsData.name
                ? "没找到对应的体型，请重新选择条件或关键词搜索"
                : "没有找到相关的体型";
        },
        subList() {
            if (!this.active) return null;
            const listItem = this.list.find(e => e.value === this.active);
            return listItem ? listItem.list : [];
        },
        typeName() {
            const bodyType = getBodyTypeItem(this.active);
            return bodyType ? bodyType.label : "";
        },
        noList() {
            if (this.active === -1) {
                return this.list.every(obj => obj.list.length === 0);
            }
            return this.subList.length === 0;
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
            const params = omit(this.params, ["type"]);

            if (this.active === -1) {
                this.loadAllTypesData(params);
            } else {
                this.loadSingleTypeData(params, this.active);
            }
        },

        loadAllTypesData(baseParams) {
            const typesToLoad = this.list.filter(e => e.value);
            typesToLoad.forEach(type => {
                const params = {
                    ...baseParams,
                    pageIndex: type.page,
                    body_type: type.value
                };
                this.loadList(params, type.value);
            });
        },

        loadSingleTypeData(baseParams, bodyType) {
            const params = {
                ...baseParams,
                pageIndex: this.page,
                body_type: bodyType
            };
            this.loadList(params, bodyType);
        },

        loadList(params, key) {
            const index = this.list.findIndex(e => e.value === key);
            if (index === -1) return;

            if (this.list[index].pages < params.pageIndex && this.active === -1) {
                params.pageIndex = 1;
            }

            getBodyList(params)
                .then((res) => {
                    const { list, page } = res.data.data;
                    const _list = this.appendMode
                        ? concat(this.list[index].list, list)
                        : (list || []);

                    this.list[index].list = _list;
                    this.list[index].page = page.index || 1;
                    this.list[index].pages = page.pageTotal || 1;

                    if (this.active !== -1) {
                        this.page = page.index || 1;
                    }
                    this.total = page.total;
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

        handleBodyTabChange(data) {
            console.log(data)
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
            const listItem = this.list.find(e => e.value === type);
            if (!listItem) return;

            const params = cloneDeep(this.params);
            params.pageSize = this.per;
            params.pageIndex = listItem.page + 1;
            params.body_type = type;

            this.loadList(params, type);
        },

        listId(list) {
            return list.map(e => e.id);
        },

        handleResize() {
            this.showCount();
        },
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
@import "~@/assets/css/body/list.less";
@import "~@/assets/css/body/item.less";
</style>
