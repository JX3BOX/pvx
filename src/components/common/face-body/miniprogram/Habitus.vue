<!--
 * @Author: zhusha
 * @Date: 2025-02-17 22:25:34
 * @LastEditors: zhusha
 * @LastEditTime: 2026-03-24 19:13:22
 * @Description: 小程序适配体型常规模组
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <div class="m-pvx-fb-habitus">
        <div class="u-item u-fb-item" v-for="(item, index) in list" :key="index"
            @click="$emit('toTab', item)">
            <div class="u-item_img u-fb-item__img">
                <img class="u-fb-item__img-el" :src="showImg(item)" />
            </div>

            <div class="u-item_type u-fb-item__type">{{ showBodyTypeLabel(item.body_type) }}</div>
        </div>
    </div>
</template>

<script>
import bodyData from "@jx3box/jx3box-data/data/role/body.json";
import { __imgPath } from "@/utils/config";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
const { bodyMap } = bodyData;
export default {
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        type: {
            type: String,
            default: "face",
        },
    },

    components: {},
    data() {
        return {};
    },
    methods: {
        getThumbnail,
        showBodyTypeLabel(val) {
            return bodyMap[val];
        },
        showImg(item) {
            const htmlFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
            const gapPx = 0.556 * htmlFontSize;
            const paddingPx = 1.25 * htmlFontSize;
            const width = parseInt((document.body.clientWidth - paddingPx * 2 - gapPx * 3) / 4);
            const height = parseInt(width * 2);
            return this.getThumbnail(item.images?.[0] || __imgPath + `image/face/null2.png`, [width, height]);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/face-body/miniprogram/habitus.less";
</style>
