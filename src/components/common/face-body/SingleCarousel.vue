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
    <div class="m-pvx-single-pics m-pvx-single-content-box" v-if="imageList">
        <!-- 无图片提示 -->
        <div v-if="!imageList.length" class="u-pvx-no-pic">
            <el-icon>
                <Picture />
            </el-icon>
            <span>该{{ typeLabel }}数据暂无图片</span>
        </div>
        
        <!-- 图片轮播 -->
        <template v-else>
            <!-- 背景模糊层 -->
            <div class="u-pvx-bg-wrap">
                <div class="u-pvx-bg" :style="{ backgroundImage: `url(${showPic(activeImage)})` }"></div>
            </div>
            
            <!-- 轮播组件 -->
            <el-carousel
                class="m-pvx-carousel"
                :interval="4000"
                type="card"
                arrow="always"
                @change="handleCarouselChange"
            >
                <el-carousel-item v-for="(item, i) in imageList" :key="i">
                    <div class="m-pvx-type-pic">
                        <el-image
                            ref="previewImage"
                            fit="contain"
                            :src="showPic(item)"
                            class="u-pvx-pic"
                            :preview-src-list="resolvedImageList"
                            :initial-index="previewIndex"
                            @click.capture="handlePreviewImage(i)"
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
            previewIndex: 0,      // 预览图片索引
        };
    },
    computed: {
        // 类型标签文案
        typeLabel() {
            return this.type === "face" ? "脸型" : "体型";
        },
        // 当前激活的图片
        activeImage() {
            return this.imageList[this.carouselActive] || "";
        },
        // 解析后的图片列表（用于预览）
        resolvedImageList() {
            return this.imageList.map((item) => resolveImagePath(item));
        },

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
        // 点击预览图片
        handlePreviewImage(index) {
            this.previewIndex = index;
        },
    },
};
</script>
