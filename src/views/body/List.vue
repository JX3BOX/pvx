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
        <pvxTabs type="body" variant="modern" @change="handleBodyTabChange" :body_types="list" :link="link"
            :active="active" />
        <template v-if="active === -1">
            <div class="m-pvx-overview-grid">
                <div v-for="(item, index) in list" :key="'l' + index" class="m-pvx-type__box"
                    :class="{ none: !item.list.length }">
                    <CardBannerList :class="{ search: tabsData.name }" :count="count" :minw="200"
                        :item-width="overviewItemWidth" :show-replace="false" stretch-items limit-to-count
                        :data="{ ...itemData, type: item.value }" @update:load="handleLoad" :items="item.list">
                        <template v-slot:title>
                            <div>{{ $t("pages.body.ui.sectionTitle", { role: roleLabel(item) }) }}</div>
                        </template>
                        <template v-slot:action>
                            <div @click="setActive(item.value)">{{ $t("pages.faceBody.actions.viewAll") }}</div>
                        </template>
                        <template v-slot="{ item }">
                            <ListItem type="body" variant="modern" :key="item.id" :item="item" />
                        </template>
                    </CardBannerList>
                </div>
            </div>
        </template>
        <div class="m-pvx-type__box" v-else-if="subList && subList.length">
            <div class="m-pvx-type__title u-pvx-type">
                <div class="u-pvx-title">{{ $t("pages.body.ui.sectionTitle", { role: roleLabel(activeTab) }) }}</div>
            </div>
            <div class="m-pvx-type__list--all">
                <ListItem type="body" variant="modern" v-for="item in subList" :key="item.id" :item="item" />
            </div>
            <el-button class="m-pvx-archive__more" v-show="hasNextPage" type="primary" @click="appendPage"
                :loading="loading">
                <el-icon>
                    <ArrowDown />
                </el-icon>
                {{ $t("pages.faceBody.actions.loadMore") }}
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
    { labelKey: "pages.faceBody.roles.all", value: -1, client: ["std", "origin"] },
    { labelKey: "pages.faceBody.roles.male", value: 1, client: ["std", "origin"] },
    { labelKey: "pages.faceBody.roles.female", value: 2, client: ["std", "origin"] },
    { labelKey: "pages.faceBody.roles.boy", value: 5, client: ["std"] },
    { labelKey: "pages.faceBody.roles.girl", value: 6, client: ["std", "origin"] },
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
                width: "210",
                height: "380",
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
            return this.tabsData.title
                ? this.$t("pages.body.ui.emptySearch")
                : this.$t("pages.body.ui.empty");
        },
    },

    methods: {
        roleLabel(item) {
            return item?.labelKey ? this.$t(item.labelKey) : item?.label || "";
        },
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
