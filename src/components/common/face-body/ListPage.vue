<!--
 * ListPage - PC端公共列表页组件
 * 
 * @description 用于脸型/体型模块的列表页展示，支持推荐列表和全部列表两种模式
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 支持推荐列表展示（active === -1时）
 * - 支持全部列表展示（active !== -1时）
 * - 支持分页功能
 * - 支持插槽自定义（tabs、notice、recommend、list）
 * - 支持加载更多按钮
 * 
 * @slots
 * - tabs: 自定义标签页内容
 * - notice: 通知区域
 * - recommend: 推荐列表项自定义
 * - list: 列表项自定义
 * 
 * @events
 * - update:active: 更新当前激活标签
 * - active-change: 激活标签变化事件
 * - tab-change: 标签页切换事件
 * - page-change: 分页变化事件
 * - append-page: 加载更多事件
 * - load: 加载事件
 * 
 * @styles
 * - 使用 pvx-list-mixin 样式混合
 * - 样式文件: assets/css/common/face-body/index.less
 -->
<template>
    <div :class="['p-pvx-list', `p-${type}-list`]" v-loading="loading">
        <slot name="tabs" :active="active" :setActive="setActive">
            <pvxTabs v-if="showTabs" @change="handleTabChange" :body_types="list" :link="link" :active="active"
                @setActive="setActive" />
        </slot>

        <slot name="notice"></slot>

        <template v-if="active === -1">
            <div v-for="(item, index) in list" :key="'l' + index"
                :class="['m-pvx-box', `m-${type}-box`, { none: !item.list.length }]">
                <slot name="recommend" :item="item" :index="index" :load="handleLoad">
                    <CardBannerList :class="{ search: hasSearch }" :count="count" :minw="minWidth"
                        :data="{ ...itemData, type: item.value }" @update:load="handleLoad" :items="item.list">
                        <template v-slot:title>
                            <div>{{ item.label + typeLabel }}</div>
                        </template>
                        <template v-slot:action>
                            <div @click="setActive(item.value)">查看全部</div>
                        </template>
                        <template v-slot="{ item: listItem }">
                            <ListItem :type="type" :key="listItem.id" :item="listItem" />
                        </template>
                    </CardBannerList>
                </slot>
            </div>
        </template>

        <div :class="['m-pvx-box', `m-${type}-box`]" v-else>
            <div :class="['m-pvx-title', 'u-type', `m-${type}-title`]">
                <div class="u-title">{{ typeName + typeLabel }}</div>
            </div>
            <div :class="['m-pvx-list--all', `m-${type}-list--all`]">
                <slot name="list" :list="subList">
                    <ListItem v-for="item in subList" :key="item.id" :type="type" :item="item" />
                </slot>
            </div>
            <el-button class="m-archive-more" v-show="hasNextPage" type="primary" @click="handleAppendPage"
                :loading="loading">
                <el-icon>
                    <ArrowDown />
                </el-icon>
                加载更多
            </el-button>
            <el-pagination class="m-archive-pages" background layout="total, prev, pager, next, jumper"
                :hide-on-single-page="true" @current-change="handlePageChange" @prev-click="handlePageChange"
                @next-click="handlePageChange" :page-size="pageSize" :total="total" :current-page="currentPage" />
        </div>

        <el-alert v-if="noList" class="m-archive-null" :title="alertTitle" type="info" center show-icon />
    </div>
</template>

<script>
import { ArrowDown } from '@element-plus/icons-vue';
import CardBannerList from "@/components/common/card_banner_list.vue";
import pvxTabs from "@/components/common/face-body/tabs";
import ListItem from "./ListItem.vue";

export default {
    name: "ListPage",
    components: { CardBannerList, pvxTabs, ListItem, ArrowDown },
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ['face', 'body'].includes(value)
        },
        loading: {
            type: Boolean,
            default: false
        },
        list: {
            type: Array,
            default: () => []
        },
        active: {
            type: Number,
            default: -1
        },
        currentPage: {
            type: Number,
            default: 1
        },
        pageSize: {
            type: Number,
            default: 20
        },
        total: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        },
        minWidth: {
            type: Number,
            default: 190
        },
        showTabs: {
            type: Boolean,
            default: true
        },
        hasSearch: {
            type: Boolean,
            default: false
        },
        link: {
            type: Object,
            default: () => ({})
        },
        itemData: {
            type: Object,
            default: () => ({
                color: "#786CBB",
                width: "190",
                height: "280"
            })
        }
    },
    computed: {
        typeLabel() {
            return this.type === 'face' ? '脸型' : '体型';
        },
        activeTab() {
            return this.list.find((e) => e.value === this.active);
        },
        typeName() {
            return this.activeTab?.label || '';
        },
        subList() {
            if (!this.active) return null;
            const tab = this.activeTab;
            return tab ? tab.list : [];
        },
        hasNextPage() {
            const tab = this.activeTab;
            return tab && tab.pages > 1 && this.currentPage < tab.pages;
        },
        noList() {
            if (this.active === -1) {
                return this.list.every((obj) => obj.list.length === 0);
            }
            const sub = this.subList;
            return !sub || sub.length === 0;
        },
        alertTitle() {
            return this.hasSearch
                ? `没找到对应的${this.typeLabel}，请重新选择条件或关键词搜索`
                : `没有找到相关的${this.typeLabel}`;
        }
    },
    methods: {
        setActive(val) {
            this.$emit('update:active', val);
            this.$emit('active-change', val);
        },
        handleTabChange(data) {
            this.$emit('tab-change', data);
        },
        handlePageChange(page) {
            this.$emit('page-change', page);
        },
        handleAppendPage() {
            this.$emit('append-page');
        },
        handleLoad(type) {
            this.$emit('load', type);
        }
    }
};
</script>

<style lang="less">
@import "~@/assets/css/common/face-body/index.less";

.p-pvx-list {
    .pvx-list-mixin();
}
</style>
