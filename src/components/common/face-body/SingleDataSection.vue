<!--
 * SingleDataSection - 详情页数据分析区域组件
 * 
 * @description 用于脸型/体型详情页展示数据分析内容或购买提示
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 已购买时显示数据内容
 * - 未购买时显示购买提示
 * - 支持付费/免费判断
 * 
 * @props
 * - type: 'face' | 'body' - 模块类型
 * - post: Object - 作品数据对象
 * - dataContent: String - 数据内容
 * 
 * @events
 * - pay: 购买事件
 * 
 * @slots
 * - data-content: 自定义数据内容展示
 * 
 * @styles
 * - 使用 pvx-data-section-mixin 样式混合
 * - 样式文件: assets/css/common/face-body/index.less
 -->
<template>
    <div class="m-pvx-single-data">
        <span class="m-pvx-single-data-title">独家数据分析</span>

        <!-- 已购买显示数据内容 -->
        <template v-if="hasBuy && dataContent">
            <slot name="data-content" :data="dataContent"></slot>
        </template>

        <!-- 未购买显示购买提示 -->
        <div class="m-pvx-single-buy-box" v-else>
            <!-- 需要付费时显示购买按钮 -->
            <div class="m-pvx-type-buy-btn" @click="handlePay" v-if="needPay">
                <div class="u-pvx-price">{{ priceText }}</div>
                <div class="u-pvx-buy">
                    <img :src="iconShopcart" alt="" />
                    购买
                </div>
            </div>
            <div class="u-pvx-type-buy-tip">数据分析将在购买后解锁</div>
        </div>
    </div>
</template>

<script>
import iconShopcart from "@/assets/img/common/face-body/shopcart.svg";

/**
 * SingleDataSection - 详情页数据分析区域组件
 * 用于脸型/体型详情页展示数据分析内容或购买提示
 * 
 * 样式说明：
 * - 组件使用原有类名 m-single-data、m-single-buy-box 等
 * - 样式由页面引入的 less 文件控制（body/single.less 或 face/single.less）
 * - 通过 face-body/index.less 中的 pvx-single-data-mixin 定义样式
 */
export default {
    name: "SingleDataSection",
    props: {
        // 数据内容对象
        dataContent: {
            type: [Object, String],
            default: null,
        },
        // 是否已购买
        hasBuy: {
            type: Boolean,
            default: false,
        },
        // 是否需要付费
        needPay: {
            type: Boolean,
            default: false,
        },
        // 价格文案
        priceText: {
            type: String,
            default: "",
        },
        // 类型标识（用于差异化显示）
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
    },
    data() {
        return {
            iconShopcart,
        };
    },
    computed: {

    },
    methods: {
        handlePay() {
            this.$emit("pay");
        },
    },
};
</script>
