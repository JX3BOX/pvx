<!--
 * @Author: zhusha
 * @Date: 2025-02-16 01:28:40
 * @LastEditors: zhusha
 * @LastEditTime: 2026-04-29 10:10:42
 * @Description: 小程序适配捏脸常规模组
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <div class="m-pvx-fb-routine" :class="{ 'm-pvx-fb-routine--one': isOne }" @scroll="handleScroll">
        <div class="u-item" v-for="item in list" :key="item.id"
            :style="itemStyle" @click="openNewFace(item.id)">
            <div class="u-item_img" :style="imgStyle">
                <el-image class="u-pic" :src="showImg(item)" fit="cover">
                    <template #error>
                        <div class="image-slot">
                            <img src="@/assets/img/body/body_null.png" />
                        </div>
                    </template>
                </el-image>
            </div>
            <div class="u-item_tag">
                <div class="u-tag_item green" v-if="item.is_new_face"></div>
                <div class="u-tag_item mint" v-else></div>
                <div class="u-tag_item new" v-if="!!item.is_unlimited"></div>
                <div class="u-tag_item purple" v-if="!!item.star"></div>
            </div>
            <div class="u-item_name">{{ item.title }}</div>
            <div class="u-item_author">{{ item.display_name || "匿名" }}</div>
            <!--            </a>-->
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { wxNewPage } from "@/utils/minprogram";
export default {
    computed: {
        link() {
            return `/${this.type}`;
        },
        itemStyle() {
            if (this.isOne) return null;
            return { width: this.size };
        },
        imgStyle() {
            if (this.isOne) return null;
            return { width: this.size, height: this.size };
        },
    },
    components: {},
    props: {
        gap: {
            type: String,
            default: "0.889rem",
        },
        size: {
            type: String,
            default: "6.667rem",
        },
        list: {
            type: Array,
            default: () => [],
        },
        total: {
            type: Number,
            default: 0,
        },
        isOne: {
            type: Boolean,
            default: false,
        },
        loadingList: {
            type: Boolean,
            default: false,
        },
        isFinish: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: "face",
        },
    },
    data() {
        return {};
    },
    methods: {
        openNewFace(id) {
            wxNewPage(`${this.link}/${id}`);
        },
        getThumbnail,
        showImg(item) {
            const source = item.images?.[0] || __imgPath + `image/face/null2.png`;
            if (this.isOne) {
                const htmlFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
                const gapTotal = 0.667 * htmlFontSize * 2;
                const paddingTotal = 1.25 * htmlFontSize * 2;
                const itemPx = parseInt((document.body.clientWidth - paddingTotal - gapTotal) / 3);
                return this.getThumbnail(source, [itemPx, itemPx]);
            }
            return this.getThumbnail(source, [this.getImgSize(this.size), this.getImgSize(this.size)]);
        },
        getImgSize(w) {
            if (typeof w == "number") return w;
            if (w.indexOf("px") > -1) {
                return Math.ceil(w.substring(0, w.length - 2));
            } else if (w.indexOf("rem") > -1) {
                let str = this.convertRemPx(w.substring(0, w.length - 3), "px");
                return Math.ceil(str.substring(0, str.length - 2));
            }
        },
        convertRemPx(value, mode) {
            // 获取根元素font-size大小
            const htmlFontSize = window.getComputedStyle(document.documentElement).fontSize;

            if (mode === "rem") {
                // 转rem
                return `${value / parseFloat(htmlFontSize)}rem`;
            } else if (mode === "px") {
                // 转px
                return `${value * parseFloat(htmlFontSize)}px`;
            } else {
                console.error("参数错误！");
            }
        },
        getMore() {
            this.$emit("getMore");
        },
        handleScroll(event) {
            const { target } = event;
            if (this.loadingList || this.isFinish) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.getMore();
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/face-body/miniprogram/routine.less";
</style>
