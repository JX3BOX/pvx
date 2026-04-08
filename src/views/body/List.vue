<template>
    <div class="p-body-list" v-loading="loading" ref="listRef">
        <pvxTabs @change="handleBodyTabChange" :body_types="list" :link="link" :active="active"
            @setActive="setActive" />
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
                        <bodyItem :key="item.id" :item="item" />
                    </template>
                </CardBannerList>
            </div>
        </template>
        <div class="m-body-box" v-else>
            <div class="m-body-title u-type">
                <div class="u-title">{{ typeName + "体型" }}</div>
            </div>
            <div class="m-body-list--all">
                <bodyItem v-for="item in subList" :key="item.id" :item="item" />
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
import bodyItem from "./components/item.vue";
import { isPhone } from "@/utils/index";
import { cloneDeep, omit, concat, debounce } from "lodash";
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
 */
const getBodyTypeItem = (value) => BODY_TYPE_CONFIG.find(item => item.value === value);

/**
 * 初始化体型列表数据结构
 * 每个体型包含：数据列表、当前页码、总页数
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
    components: { CardBannerList, pvxTabs, bodyItem },
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
                ...this.tabsData,
                body_type: this.active,
                pageSize: this.per,
                client: this.client,
            };
        },
        /**
         * 当前体型是否还有下一页
         */
        hasNextPage() {
            const currentType = getBodyTypeItem(this.active);
            if (!currentType) return false;
            const listItem = this.list.find(e => e.value === this.active);
            return listItem && listItem.pages > 1 && this.page < listItem.pages;
        },
        /**
         * 空数据提示文案
         */
        alertTitle() {
            return this.tabsData.name
                ? "没找到对应的体型，请重新选择条件或关键词搜索"
                : "没有找到相关的体型";
        },
        /**
         * 当前选中的体型数据列表
         */
        subList() {
            if (!this.active) return null;
            const listItem = this.list.find(e => e.value === this.active);
            return listItem ? listItem.list : [];
        },
        /**
         * 当前选中体型的名称
         */
        typeName() {
            const bodyType = getBodyTypeItem(this.active);
            return bodyType ? bodyType.label : "";
        },
        /**
         * 是否显示空数据提示
         */
        noList() {
            if (this.active === -1) {
                return this.list.every(obj => obj.list.length === 0);
            }
            return this.subList.length === 0;
        },
    },
    watch: {
        params: {
            handler() {
                this.loadData();
            },
            debounce: 500,
            deep: true,
        },
        active(val) {
            this.per = val === -1 ? this.count : this.count * 3;
            this.page = 1;
        },
    },

    methods: {
        /**
         * 设置当前激活的体型类型
         * @param {number} val - 体型value值
         */
        setActive(val) {
            this.active = val;
            document.documentElement.scrollTop = 0;
        },

        /**
         * 获取捏体海报轮播图数据
         */
        getSliders() {
            getSliders("slider", this.client, 9).then((res) => {
                this.slidersList = res.data.data.list || [];
            });
        },

        /**
         * 加载数据 - 入口方法
         * 根据当前激活状态决定加载全部体型数据还是单个体型数据
         */
        loadData() {
            this.loading = true;
            const params = omit(this.params, ["type"]);

            if (this.active === -1) {
                this.loadAllTypesData(params);
            } else {
                this.loadSingleTypeData(params, this.active);
            }
        },

        /**
         * 加载所有体型的首页数据
         * @param {Object} baseParams - 基础查询参数
         */
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

        /**
         * 加载单个体型的数据
         * @param {Object} baseParams - 基础查询参数
         * @param {number} bodyType - 体型value值
         */
        loadSingleTypeData(baseParams, bodyType) {
            const params = {
                ...baseParams,
                pageIndex: this.page,
                body_type: bodyType
            };
            this.loadList(params, bodyType);
        },

        /**
         * 请求体型列表数据
         * @param {Object} params - 查询参数
         * @param {number} key - 体型value值，用于更新对应列表数据
         */
        loadList(params, key) {
            const index = this.list.findIndex(e => e.value === key);
            if (index === -1) return;

            // 首页加载时重置页码
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

        /**
         * 切换分页
         * @param {number} i - 目标页码
         */
        changePage(i) {
            this.page = i;
            this.loadData();
        },

        /**
         * 加载更多数据（追加模式）
         */
        appendPage() {
            this.appendMode = true;
            this.handleLoad(this.active);
        },

        /**
         * 处理体型Tab切换
         * @param {Object} data - Tab切换时传递的数据
         */
        handleBodyTabChange(data) {
            const isEvent = data instanceof Event;
            if (isEvent) return;
            this.page = 1;
            this.tabsData = data;
        },

        /**
         * 计算每行显示的体型数量
         * 根据容器宽度动态计算
         */
        showCount() {
            if (isPhone()) {
                this.per = 8;
                return;
            }
            const listWidth = this.$refs.listRef?.clientWidth - 120;
            this.count = Math.floor(listWidth / (Number(this.itemData.width) + 10));
            this.per = this.active === -1 ? this.count : this.count * 3;
        },

        /**
         * 加载指定体型的下一页数据
         * @param {number} type - 体型value值
         */
        handleLoad(type) {
            const listItem = this.list.find(e => e.value === type);
            if (!listItem) return;

            const params = cloneDeep(this.params);
            params.pageSize = this.per;
            params.pageIndex = listItem.page + 1;
            params.body_type = type;

            this.loadList(params, type);
        },

        /**
         * 获取列表ID数组（用于去重等场景）
         * @param {Array} list - 数据列表
         */
        listId(list) {
            return list.map(e => e.id);
        },
    },
    mounted() {
        this.showCount();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/body/list.less";
</style>
