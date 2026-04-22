<template>
    <div class="m-bbs">
        <!-- 搜索 -->
        <div class="m-archive-search m-collection-search">
            <a :href="publish_link" class="u-publish el-button el-button--primary">+ 发布作品</a>
            <el-input placeholder="请输入搜索内容" v-model.trim.lazy="search" class="input-with-select">
                <template #prepend><span>关键词</span></template>
                <template #append><el-button icon="el-icon-position" @click="loadList"></el-button></template>
            </el-input>
        </div>
        <div class="m-archive-list" v-loading="loading">
            <template v-if="list.length">
                <bbs_item v-for="item in list" :item="item" :key="item.id"></bbs_item>
                <pagination
                    v-if="list.length"
                    v-show="totalPages > 1"
                    :total="total"
                    v-model:page="query.page"
                    v-model:limit="query.per"
                    @pagination="loadList"
                />
            </template>
            <el-alert v-else title="没有找到相关条目" type="info" show-icon></el-alert>
        </div>
    </div>
</template>

<script>
/**
 * @description 家园攻略列表页面
 * @description 展示家园相关的攻略文章列表，支持搜索和分页
 * @author ymg
 * @version 1.0.0
 * 
 * @example
 * <Bbs />
 * 
 * @notes
 * - 默认按更新时间排序
 * - 筛选条件为 topic: "家园"
 * - 支持关键词搜索
 * - 点击发布按钮跳转到发布页面
 */
import { publishLink } from "@jx3box/jx3box-common/js/utils";
import { deleteNull } from "@/utils/index";
import { getBbsList } from "@/service/homeland";
import Pagination from "@/components/Pagination";
import bbs_item from "@/components/homeland/bbs_item.vue";
export default {
    name: "BBS",
    components: { Pagination, bbs_item },
    data() {
        return {
            loading: false,
            list: [],
            total: 0,
            totalPages: 0,
            query: {
                per: 20,
                page: 1,
            },
            search: "",
        };
    },
    computed: {
        // 发布按钮链接
        publish_link: function () {
            return publishLink("bbs");
        },
        client() {
            return this.$store.state.client;
        },
        params() {
            return {
                type: "bbs",
                ...this.query,
                order: "update",
                client: this.client,
                topic: "家园",
                search: this.search,
            };
        },
    },
    methods: {
        loadList() {
            const params = deleteNull(this.params);
            this.loading = true;
            getBbsList(params)
                .then((res) => {
                    this.list = res.data?.data?.list || [];
                    this.total = res.data?.data?.total;
                    this.totalPages = res.data?.data?.pages;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    created() {
        this.loadList();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/bbs.less";
</style>
