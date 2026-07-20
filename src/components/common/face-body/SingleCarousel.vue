<!--
 * SingleCarousel - 详情页图片轮播组件
 *
 * @description 用于脸型/体型详情页展示作品图片，支持轮播和预览功能
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 *
 * @features
 * - 支持face和body两种类型
 * - 支持多图片轮播展示
 * - 支持背景模糊效果
 * - 支持图片预览功能
 * - 无图片时显示占位提示
 *
 * @props
 * - type: 'face' | 'body' - 模块类型
 * - images: Array - 图片列表
 *
 * @events
 * - change: 轮播切换事件
 *
 * @styles
 * - 使用 pvx-carousel-mixin 样式混合
 * - 样式文件: assets/css/common/face-body/index.less
 -->
<template>
    <div class="m-pvx-single__pics m-pvx-single__content-box" v-if="imageList">
        <!-- 无图片提示 -->
        <div v-if="!imageList.length" class="u-pvx-no-pic">
            <el-icon>
                <Picture />
            </el-icon>
            <span>{{ $t("pages.faceBody.detail.noImages", { type: typeLabel }) }}</span>
        </div>

        <!-- 图片轮播 -->
        <template v-else>
            <!-- 背景模糊层 -->
            <div class="u-pvx-bg-wrap">
                <div class="u-pvx-bg" :style="{ backgroundImage: `url(${showPic(activeImage)})` }"></div>
            </div>

            <!-- 轮播组件 -->
            <el-carousel
                :key="carouselType || 'default'"
                ref="carouselRef"
                class="m-pvx-carousel"
                :interval="4000"
                :type="carouselType"
                arrow="always"
                @change="handleCarouselChange"
                @touchstart.passive="handleTouchStart"
                @touchend.passive="handleTouchEnd"
            >
                <el-carousel-item v-for="(item, i) in imageList" :key="i">
                    <div class="m-pvx-type__pic">
                        <el-image
                            ref="previewImage"
                            fit="contain"
                            :src="showPic(item)"
                            class="u-pvx-pic"
                            :preview-src-list="resolvedImageList"
                            :preview-teleported="true"
                            :initial-index="i"
                            @show="handlePreviewShow"
                            @close="unbindPreviewSwipe"
                        />
                    </div>
                </el-carousel-item>
            </el-carousel>
        </template>
    </div>
</template>

<script>
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";

/**
 * SingleCarousel - 详情页图片轮播组件
 * 用于脸型/体型详情页展示图片轮播，支持预览
 *
 * 样式说明：
 * - 组件使用原有类名 m-single-pics、m-carousel 等
 * - 样式由页面引入的 less 文件控制（body/single.less 或 face/single.less）
 * - 通过 face-body/index.less 中的 pvx-single-pics-mixin 定义样式
 */
export default {
    name: "SingleCarousel",
    props: {
        // 图片列表
        imageList: {
            type: Array,
            default: () => [],
        },
        // 类型标识：face（脸型）或 body（体型）
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
    },
    data() {
        return {
            carouselActive: 0,    // 当前轮播索引
            touchStartX: 0,
            touchStartY: 0,
            cardModeMedia: null,
            isCardMode: false,
            previewViewer: null,
            previewTouchStartX: 0,
            previewTouchStartY: 0,
        };
    },
    computed: {
        // 类型标签文案
        typeLabel() {
            return this.$t(this.type === "face" ? "pages.faceBody.detail.faceType" : "pages.faceBody.detail.bodyType");
        },
        // 当前激活的图片
        activeImage() {
            return this.imageList[this.carouselActive] || "";
        },
        resolvedImageList() {
            return this.imageList.map((item) => resolveImagePath(item));
        },
        carouselType() {
            return this.isCardMode ? "card" : "";
        },
    },
    mounted() {
        this.cardModeMedia = window.matchMedia("(min-width: 1280px)");
        this.updateCarouselMode(this.cardModeMedia);
        this.cardModeMedia.addEventListener("change", this.updateCarouselMode);
    },
    beforeUnmount() {
        this.cardModeMedia?.removeEventListener("change", this.updateCarouselMode);
        this.unbindPreviewSwipe();
    },
    methods: {
        // 显示图片（解析CDN路径）
        showPic(url) {
            return resolveImagePath(url);
        },
        // 轮播切换事件
        handleCarouselChange(index) {
            this.carouselActive = index;
        },
        updateCarouselMode(event) {
            this.isCardMode = event.matches;
        },
        handlePreviewShow() {
            this.$nextTick(() => {
                this.unbindPreviewSwipe();
                this.previewViewer = document.querySelector("body > .el-image-viewer__wrapper");
                this.previewViewer?.addEventListener("touchstart", this.handlePreviewTouchStart, {
                    capture: true,
                    passive: true,
                });
                this.previewViewer?.addEventListener("touchend", this.handlePreviewTouchEnd, {
                    capture: true,
                    passive: true,
                });
            });
        },
        unbindPreviewSwipe() {
            this.previewViewer?.removeEventListener("touchstart", this.handlePreviewTouchStart, true);
            this.previewViewer?.removeEventListener("touchend", this.handlePreviewTouchEnd, true);
            this.previewViewer = null;
        },
        handlePreviewTouchStart(event) {
            const touch = event.touches?.[0];
            if (!touch) return;
            this.previewTouchStartX = touch.clientX;
            this.previewTouchStartY = touch.clientY;
        },
        handlePreviewTouchEnd(event) {
            const touch = event.changedTouches?.[0];
            if (!touch || this.resolvedImageList.length < 2) return;

            const offsetX = touch.clientX - this.previewTouchStartX;
            const offsetY = touch.clientY - this.previewTouchStartY;
            if (Math.abs(offsetX) < 40 || Math.abs(offsetX) <= Math.abs(offsetY)) return;

            const direction = offsetX < 0 ? "next" : "prev";
            this.previewViewer?.querySelector(`.el-image-viewer__${direction}`)?.click();
        },
        handleTouchStart(event) {
            const touch = event.touches?.[0];
            if (!touch) return;
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        },
        handleTouchEnd(event) {
            const touch = event.changedTouches?.[0];
            if (!touch || window.innerWidth > 720) return;

            const offsetX = touch.clientX - this.touchStartX;
            const offsetY = touch.clientY - this.touchStartY;
            if (Math.abs(offsetX) < 40 || Math.abs(offsetX) <= Math.abs(offsetY)) return;

            if (offsetX < 0) {
                this.$refs.carouselRef?.next();
            } else {
                this.$refs.carouselRef?.prev();
            }
        },
    },
};
</script>
