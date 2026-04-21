<!--
 * SinglePaySection - 详情页购买下载组件
 * 
 * @description 用于脸型/体型详情页展示购买/下载按钮及相关信息
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 支持付费购买功能
 * - 支持免费下载功能
 * - 显示更新时间
 * - 显示游戏内收费提示
 * 
 * @props
 * - type: 'face' | 'body' - 模块类型
 * - post: Object - 作品数据对象
 * 
 * @events
 * - pay: 购买事件
 * - download: 下载事件
 * 
 * @styles
 * - 使用 pvx-pay-section-mixin 样式混合
 * - 样式文件: assets/css/common/face-body/index.less
 -->
<template>
    <div class="m-pvx-type-pay">
        <!-- 购买/下载按钮区域 -->
        <div :class="['m-pvx-type-buy', { 'm-pvx-dowload': canDownload }]">
            <!-- 需要付费且未购买 -->
            <div class="m-pvx-type-buy-btn" @click="handlePay" v-if="needPay">
                <div class="u-pvx-price">{{ priceText }}</div>
                <div class="u-pvx-buy">
                    <img :src="iconShopcart" alt="" />
                    购买
                </div>
            </div>

            <!-- 已购买或免费 -->
            <div class="m-pvx-type-buy-btn" v-else @click="handleDownload">
                <div class="u-pvx-buy">
                    <img :src="iconDownload" alt="" />
                    下载数据
                </div>
            </div>

            <!-- 更新时间 -->
            <div class="u-pvx-update-time">更新时间：{{ post.updated_at }}</div>

            <!-- 装饰图片 -->
            <img class="u-pvx-box-img" src="https://cdn.jx3box.com/design/pvx/stroke.svg" />
        </div>

        <!-- 游戏内收费提示 -->
        <div class="m-pvx-type-tips" v-if="post.game_price">
            <img :src="iconInfo" alt="" />
            <div class="u-pvx-tips-left">该数据含游戏内收费项目，总计约</div>
            <div class="u-pvx-tips-right">{{ post.game_price }}通宝</div>
        </div>

        <!-- 说明/数据列表切换标签 -->
        <div class="u-pvx-type-desc-tab">
            <span @click="activeTab = 'desc'" :class="{ active: activeTab === 'desc' }">说明</span>
            <span @click="activeTab = 'data'" v-if="fileList && fileList.length"
                :class="{ active: activeTab === 'data' }">数据列表</span>
        </div>

        <!-- 说明内容/文件列表 -->
        <div :class="['m-pvx-type-desc', { 'is-no-desc': !post.remark && activeTab === 'desc', 'has-desc': activeTab === 'desc' }]">
            <!-- 说明内容 -->
            <div v-if="activeTab === 'desc'" class="u-pvx-desc">
                {{ post.remark || "暂无说明" }}
            </div>

            <!-- 文件列表 -->
            <div class="m-pvx-type-files-list" v-if="activeTab === 'data' && fileList && fileList.length">
                <div class="u-pvx-file" v-for="item in fileList" :key="item.id">
                    <div class="u-pvx-info">
                        <span class="u-pvx-label">{{ item.name }}</span>
                        <span class="u-pvx-label">
                            备注：<em>{{ item.describe || "无" }}</em>
                        </span>
                    </div>
                    <a class="u-pvx-action" href="" @click.prevent="handleDownloadFile(item)">下载</a>
                </div>
            </div>
        </div>

        <!-- 头条信息 -->
        <div class="m-pvx-type-head" v-if="topicInfo">
            <img :src="iconCup" alt="" />
            该{{ typeLabel }}于{{ topicInfo.created_at }}荣登头条
        </div>
    </div>
</template>

<script>
import iconShopcart from "@/assets/img/common/face-body/shopcart.svg";
import iconDownload from "@/assets/img/common/face-body/download.svg";
import iconInfo from "@/assets/img/common/face-body/info.svg";
import iconCup from "@/assets/img/common/face-body/cup.svg";

/**
 * SinglePaySection - 详情页购买/下载区域组件
 * 用于脸型/体型详情页右侧购买、下载、说明展示
 * 
 * 样式说明：
 * - 组件使用统一类名 m-pvx-type-pay、m-pvx-type-buy 等
 * - 样式由页面引入的 less 文件控制（body/single.less 或 face/single.less）
 * - 通过 face-body/index.less 中的 pvx-pay-mixin 定义样式
 */
export default {
    name: "SinglePaySection",
    props: {
        // 文章数据
        post: {
            type: Object,
            default: () => ({}),
        },
        // 类型标识
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
        // 是否已购买
        hasBuy: {
            type: Boolean,
            default: false,
        },
        // 文件列表
        fileList: {
            type: Array,
            default: () => [],
        },
        // 头条信息
        topicInfo: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            activeTab: "desc", // 当前激活的标签页
            iconShopcart,
            iconDownload,
            iconInfo,
            iconCup,
        };
    },
    computed: {
        // 类型标签
        typeLabel() {
            return this.type === "face" ? "脸型" : "体型";
        },
        // 是否需要付费
        needPay() {
            return this.post.price_type && this.post.price_type !== 0 && !this.hasBuy;
        },
        // 是否可下载
        canDownload() {
            return (this.post.price_type && this.post.price_type === 0) || this.hasBuy;
        },
        // 价格文案
        priceText() {
            if (this.post.price_type === 1) return `售价：${this.post.price_count} 盒币`;
            if (this.post.price_type === 2) return `售价：${this.post.price_count} 金箔`;
            return "";
        },

    },
    watch: {
        // 无说明且有文件时默认显示数据列表
        fileList: {
            handler(val) {
                if (!this.post.remark && val && val.length) {
                    this.activeTab = "data";
                }
            },
            immediate: true,
        },
    },
    methods: {
        // 购买事件
        handlePay() {
            this.$emit("pay");
        },
        // 下载全部事件
        handleDownload() {
            this.$emit("download");
        },
        // 下载单个文件
        handleDownloadFile(item) {
            this.$emit("download-file", item);
        },
    },
};
</script>
