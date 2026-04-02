<template>
    <div class="m-single-data">
        <span class="m-single-data-title">独家数据分析</span>

        <!-- 已购买显示数据内容 -->
        <template v-if="hasBuy && dataContent">
            <slot name="data-content" :data="dataContent"></slot>
        </template>

        <!-- 未购买显示购买提示 -->
        <div class="m-single-buy-box" v-else>
            <!-- 需要付费时显示购买按钮 -->
            <div :class="buyBtnClass" @click="handlePay" v-if="needPay">
                <div class="u-price">{{ priceText }}</div>
                <div class="u-buy">
                    <img :src="iconShopcart" alt="" />
                    购买
                </div>
            </div>
            <div :class="buyTipClass">数据分析将在购买后解锁</div>
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
 * - 通过 face-body-mixins.less 中的 pvx-single-data-mixin 定义样式
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
        // 购买按钮类名
        buyBtnClass() {
            return this.type === "face" ? "m-face-buy-btn" : "m-body-buy-btn";
        },
        // 购买提示类名
        buyTipClass() {
            return this.type === "face" ? "u-face-buy-tip" : "u-body-buy-tip";
        },
    },
    methods: {
        handlePay() {
            this.$emit("pay");
        },
    },
};
</script>
