<!--
 * @Description: 小程序适配捏脸常规模组（合并版）
 * 支持 list（列表）和 compact（紧凑）两种展示模式
-->
<template>
    <div :class="containerClass" @scroll="handleScroll">
        <template v-if="mode === 'list'">
            <div class="u-pvx-fb-item" v-for="item in list" :key="item.id"
                :style="itemStyle" @click="openNewFace(item.id)">
                <div class="u-pvx-fb-item__img" :style="imgStyle">
                    <el-image class="u-pic" :src="showImg(item)" fit="cover">
                        <template #error>
                            <div class="image-slot">
                                <img class="u-pvx-fb-item__img-el" src="@/assets/img/body/body_null.png" />
                            </div>
                        </template>
                    </el-image>
                </div>
                <div class="u-pvx-fb-item__tag">
                    <div class="u-pvx-fb-tag-item green" v-if="item.is_new_face"></div>
                    <div class="u-pvx-fb-tag-item mint" v-else></div>
                    <div class="u-pvx-fb-tag-item new" v-if="!!item.is_unlimited"></div>
                    <div class="u-pvx-fb-tag-item purple" v-if="!!item.star"></div>
                </div>
                <div class="u-pvx-fb-item__name">{{ item.title }}</div>
                <div class="u-pvx-fb-item__author">{{ item.display_name || "匿名" }}</div>
            </div>
        </template>
        <template v-else>
            <div class="u-pvx-fb-item" v-for="item in list" :key="item.id"
                :style="{ width: itemWidth + 'px', height: itemHeight + 'px' }" @click="openNewFace(item.id)">
                <div class="u-pvx-fb-item__img">
                    <img class="u-pvx-fb-item__img-el" :src="showImg(item)" />
                    <div class="u-pvx-fb-item__name">{{ item.title }}</div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { wxNewPage } from "@/utils/minprogram";

export default {
    name: "RoutineList",
    props: {
        mode: {
            type: String,
            default: "list",
            validator: (val) => ["list", "compact"].includes(val),
        },
        gap: {
            type: String,
            default: "0.889rem",
        },
        size: {
            type: [String, Number],
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
        isNumber: {
            type: Boolean,
            default: false,
        },
        number: {
            type: Number,
            default: 3,
        },
    },
    data() {
        return {
            itemWidth: 0,
            itemHeight: 0,
        };
    },
    computed: {
        link() {
            return `/${this.type}`;
        },
        containerClass() {
            const classes = ["m-pvx-fb-routine"];
            if (this.mode === "compact") {
                classes.push("m-pvx-fb-routine--compact");
            }
            if (this.mode === "list" && this.isOne) {
                classes.push("m-pvx-fb-routine--one");
            }
            return classes;
        },
        itemStyle() {
            if (this.isOne) return null;
            if (this.mode === "compact") {
                return { width: this.itemWidth + "px", height: this.itemHeight + "px" };
            }
            return { width: this.size };
        },
        imgStyle() {
            if (this.isOne) return null;
            return { width: this.size, height: this.size };
        },
    },
    mounted() {
        if (this.mode === "compact") {
            this.itemWidth = this.isNumber
                ? parseInt((document.body.clientWidth - 72) / this.number)
                : this.size;
            this.itemHeight = parseInt(this.itemWidth / 0.6);
        }
    },
    methods: {
        getThumbnail,
        openNewFace(id) {
            wxNewPage(`${this.link}/${id}`);
        },
        showImg(item) {
            const source = item.images?.[0] || __imgPath + `image/face/null2.png`;
            if (this.mode === "compact") {
                return this.getThumbnail(source, [this.itemWidth, parseInt(this.itemWidth / 0.6)]);
            }
            if (this.isOne) {
                const gapPx = this.convertRemPx("0.667", "px");
                const paddingPx = this.convertRemPx("2.5", "px");
                const gapTotal = parseFloat(gapPx) * 2;
                const paddingTotal = parseFloat(paddingPx) * 2;
                const itemPx = parseInt((document.body.clientWidth - paddingTotal - gapTotal) / 3);
                return this.getThumbnail(source, [itemPx, itemPx]);
            }
            return this.getThumbnail(source, [this.getImgSize(this.size), this.getImgSize(this.size)]);
        },
        getImgSize(w) {
            if (typeof w === "number") return w;
            if (w.indexOf("px") > -1) {
                return Math.ceil(w.substring(0, w.length - 2));
            }
            if (w.indexOf("rem") > -1) {
                const px = this.convertRemPx(w.substring(0, w.length - 3), "px");
                return Math.ceil(px.substring(0, px.length - 2));
            }
        },
        convertRemPx(value, mode) {
            const htmlFontSize = window.getComputedStyle(document.documentElement).fontSize;
            if (mode === "rem") {
                return `${value / parseFloat(htmlFontSize)}rem`;
            }
            if (mode === "px") {
                return `${value * parseFloat(htmlFontSize)}px`;
            }
            console.error("参数错误！");
        },
        getMore() {
            this.$emit("getMore");
        },
        handleScroll(event) {
            if (this.mode !== "list") return;
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
@import "~@/assets/css/common/face-body/miniprogram/list-variants.less";
</style>
