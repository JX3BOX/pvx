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
 * 
 * @components
 * - faceTabs: 标签页组件
 * - PublicNotice: 公告组件
 * - CardBannerList: 卡片轮播列表组件
 * - ListItem: 列表项组件
 * 
 * @styles
 * - 样式文件: assets/css/face/list.less
 * - 样式文件: assets/css/face/item.less
 -->
<template>
    <div class="p-pvx-face-list" v-loading="loading" ref="listRef">
        <faceTabs :body_types="list" :active="active" :link="link" @change="handleFaceTabChange" />
        <PublicNotice bckey="face_ac" />
        <template v-if="active === -1">
            <div v-for="(item, index) in list" :key="'l' + index" class="m-pvx-type-box"
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
        <div class="m-pvx-type-box" v-else>
            <div class="m-pvx-type-title u-pvx-type">
                <div class="u-pvx-title">{{ typeName + "脸型" }}</div>
            </div>
            <div class="m-pvx-type-list--all">
                <ListItem type="face" v-for="item in subList" :key="item.id" :item="item" />
            </div>
            <el-button class="m-pvx-archive-more" v-show="hasNextPage" type="primary" @click="appendPage"
                :loading="loading">
                <el-icon class="el-icon--left">
                    <ArrowDown />
                </el-icon>加载更多</el-button>
            <el-pagination class="m-pvx-archive-pages" background layout="total, prev, pager, next, jumper"
                :hide-on-single-page="true" @current-change="changePage" @prev-click="changePage"
                @next-click="changePage" :page-size="per" :total="total" v-model:current-page="page"></el-pagination>
        </div>
        <el-alert v-if="noList" class="m-pvx-archive-null" :title="alertTitle" type="info" center show-icon></el-alert>
    </div>
</template>

<script>
import PublicNotice from "@/components/PublicNotice";
import CardBannerList from "@/components/common/card_banner_list.vue";
import faceTabs from "@/components/common/face-body/tabs";
import ListItem from "@/components/common/face-body/ListItem.vue";
import pcListMixin from "@/components/common/face-body/mixins/pcListMixin";
import { concat } from "lodash";
import { getFaceList } from "@/service/face";
import { ArrowDown } from '@element-plus/icons-vue';

export default {
    name: "face",
    components: { CardBannerList, faceTabs, ListItem, PublicNotice, ArrowDown },
    mixins: [pcListMixin],

    data() {
        return {
            list: [
                { label: "全部", list: [], value: -1, client: ["std", "origin"], page: 1, pages: 1 },
                { label: "成男", list: [], value: 1, client: ["std", "origin"], page: 1, pages: 1 },
                { label: "成女", list: [], value: 2, client: ["std", "origin"], page: 1, pages: 1 },
                { label: "正太", list: [], value: 5, client: ["std"], page: 1, pages: 1 },
                { label: "萝莉", list: [], value: 6, client: ["std", "origin"], page: 1, pages: 1 },
            ],
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
        params() {
            const { tabsData } = this;
            return {
                ...tabsData,
                body_type: this.active,
                pageSize: this.per,
                client: this.client,
            };
        },

        alertTitle() {
            if (this.tabsData.title) return "没找到对应的捏脸，请重新选择条件或关键词搜索";
            return "没有找到相关的捏脸";
        },
    },

    methods: {
        loadList(params, key) {
            const index = this.list.findIndex((e) => e.value === key);
            if (index === -1) return;

            if (this.list[index].pages < params.pageIndex && this.active === -1) {
                params.pageIndex = 1;
            }

            getFaceList(params)
                .then((res) => {
                    const { list, page } = res.data.data;
                    const _list = this.appendMode ? concat(this.list[index].list, list) : list;
                    this.list[index].list = _list || [];
                    this.list[index].page = page.index || 1;
                    this.list[index].pages = page.pageTotal || 1;
                    if (this.active !== -1) this.page = page.index || 1;
                    this.total = page.total;
                })
                .finally(() => {
                    this.loading = false;
                    this.appendMode = false;
                });
        },

        handleFaceTabChange(data) {
            const isEvent = data instanceof Event;
            if (isEvent) return;
            this.handleTabChange(data);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/list.less";
@import "~@/assets/css/face/item.less";
</style>
