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
 * 
 * @components
 * - pvxTabs: 标签页组件
 * - CardBannerList: 卡片轮播列表组件
 * - ListItem: 列表项组件
 * 
 * @styles
 * - 样式文件: assets/css/body/list.less
 * - 样式文件: assets/css/body/item.less
 -->
<template>
    <div class="p-pvx-body-list" v-loading="loading" ref="listRef">
        <pvxTabs variant="modern" @change="handleBodyTabChange" :body_types="list" :link="link" :active="active" />
        <template v-if="active === -1">
            <div class="m-pvx-overview-grid">
                <div v-for="(item, index) in list" :key="'l' + index" class="m-pvx-type__box"
                    :class="{ none: !item.list.length }">
                    <CardBannerList :class="{ search: tabsData.name }" :count="count" :minw="200"
                        :item-width="overviewItemWidth" :show-replace="false" stretch-items limit-to-count
                        :data="{ ...itemData, type: item.value }" @update:load="handleLoad" :items="item.list">
                        <template v-slot:title>
                            <div>{{ item.label + "体型" }}</div>
                        </template>
                        <template v-slot:action>
                            <div @click="setActive(item.value)">查看全部</div>
                        </template>
                        <template v-slot="{ item }">
                            <ListItem type="body" variant="modern" :key="item.id" :item="item" />
                        </template>
                    </CardBannerList>
                </div>
            </div>
        </template>
        <div class="m-pvx-type__box" v-else>
            <div class="m-pvx-type__title u-pvx-type">
                <div class="u-pvx-title">{{ typeName + "体型" }}</div>
            </div>
            <div class="m-pvx-type__list--all">
                <ListItem type="body" variant="modern" v-for="item in subList" :key="item.id" :item="item" />
            </div>
            <el-button class="m-pvx-archive__more" v-show="hasNextPage" type="primary" @click="appendPage"
                :loading="loading">
                <el-icon>
                    <ArrowDown />
                </el-icon>
                加载更多
            </el-button>
            <el-pagination class="m-pvx-archive__pages" background layout="total, prev, pager, next, jumper"
                :hide-on-single-page="true" @current-change="changePage" @prev-click="changePage"
                @next-click="changePage" :page-size="per" :total="total" v-model:current-page="page"></el-pagination>
        </div>
        <el-alert v-if="noList" class="m-pvx-archive__null" :title="alertTitle" type="info" center show-icon></el-alert>
    </div>
</template>

<script>
import CardBannerList from "@/components/common/card_banner_list.vue";
import pvxTabs from "@/components/common/face-body/Tabs";
import ListItem from "@/components/common/face-body/ListItem.vue";
import pcListMixin from "@/components/common/face-body/mixins/pc-list-mixin";
import { concat } from "lodash";
import { getBodyList } from "@/service/body";
import { ArrowDown } from '@element-plus/icons-vue';

const BODY_TYPE_CONFIG = [
    { label: "全部", value: -1, client: ["std", "origin"] },
    { label: "成男", value: 1, client: ["std", "origin"] },
    { label: "成女", value: 2, client: ["std", "origin"] },
    { label: "正太", value: 5, client: ["std"] },
    { label: "萝莉", value: 6, client: ["std", "origin"] },
];

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
    components: { CardBannerList, pvxTabs, ListItem, ArrowDown },
    mixins: [pcListMixin],

    data() {
        return {
            list: initBodyList(),
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
        params() {
            return {
                body_type: this.active,
                pageSize: this.per,
                client: this.client,
                ...this.tabsData,
            };
        },

        alertTitle() {
            return this.tabsData.name
                ? "没找到对应的体型，请重新选择条件或关键词搜索"
                : "没有找到相关的体型";
        },
    },

    methods: {
        loadList(params, key) {
            const index = this.list.findIndex((e) => e.value === key);
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

        handleBodyTabChange(data) {
            this.handleTabChange(data);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/body/index.less";
</style>
