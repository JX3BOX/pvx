<template>
    <div class="m-bbs">
        <!-- 搜索 -->
        <div class="m-archive-search m-collection-search">
            <a :href="publish_link" class="u-publish el-button el-button--primary">+ 发布作品</a>
            <el-input placeholder="请输入搜索内容" v-model.trim.lazy="search" class="input-with-select">
                <span slot="prepend">关键词</span>
                <el-button slot="append" icon="el-icon-position" @click="loadList"></el-button>
            </el-input>
        </div>
        <div class="m-archive-list" v-loading="loading">
            <template v-if="list.length">
                <bbs_item v-for="item in list" :item="item" :key="item.id"></bbs_item>
                <pagination
                    v-if="list.length"
                    v-show="totalPages > 1"
                    :total="total"
                    :page.sync="query.page"
                    :limit.sync="query.per"
                    @pagination="loadList"
                />
            </template>
            <el-alert v-else title="没有找到相关条目" type="info" show-icon></el-alert>
        </div>
    </div>
</template>

<script>
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
