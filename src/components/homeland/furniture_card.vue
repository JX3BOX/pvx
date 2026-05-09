<template>
    <div class="m-pvx-furniture-item flexNormal" @click="goDetail">
        <div class="m-pvx-furniture-image">
            <img class="u-img" :src="formatImg(item.Path)" :alt="item.szName" />
            <i class="u-use" v-if="item.bInteract"></i>
            <i class="u-dye" v-if="item.nRepresentID"></i>
        </div>
        <div class="m-pvx-furniture-detail">
            <div class="u-name" :class="'quality_' + item.Quality">
                {{ item.szName }}
            </div>
            <div class="u-nature" v-if="item.Attribute1">
                <span class="u-attribute u-bg-blue">观赏</span>
                <span class="u-num">{{ item.Attribute1 }}</span>
            </div>
            <div class="u-nature" v-if="item.Attribute2">
                <span class="u-attribute u-bg-pink">实用</span>
                <span class="u-num">{{ item.Attribute2 }}</span>
            </div>
            <div class="u-nature" v-if="item.Attribute3">
                <span class="u-attribute u-bg-yellow">坚固</span>
                <span class="u-num">{{ item.Attribute3 }}</span>
            </div>
            <div class="u-nature" v-if="item.Attribute4">
                <span class="u-attribute u-bg-green">风水</span>
                <span class="u-num">{{ item.Attribute4 }}</span>
            </div>
            <div class="u-nature" v-if="item.Attribute5">
                <span class="u-attribute u-bg-purple">趣味</span>
                <span class="u-num">{{ item.Attribute5 }}</span>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * @description 家具卡片组件
 * @description 展示单个家具的缩略信息卡片
 * @author ymg
 * @version 1.0.0
 * 
 * @props
 * - item {Object} 家具数据对象，包含 Path, szName, Quality, Attribute1-5 等字段
 * 
 * @example
 * <FurnitureCard :item="furnitureData" />
 * 
 * @notes
 * - 点击卡片跳转到家具详情页
 * - 品质颜色通过 Quality 字段动态设置
 * - 可交互家具显示交互图标
 * - 可染色家具显示染色图标
 */
import { formatFurnitureImg } from "@/utils/homeland";

export default {
    name: "FurnitureCard",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    inject: ["__imgRoot"],
    methods: {
        formatImg(link) {
            return formatFurnitureImg(link, this.__imgRoot);
        },
        goDetail() {
            this.$router.push({
                name: "single",
                params: { id: this.item.ID },
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/item.less";
</style>
