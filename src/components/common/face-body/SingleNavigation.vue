<!--
 * SingleNavigation - 详情页导航组件
 * 
 * @description 用于脸型/体型详情页顶部导航区域，包含返回、发布、管理功能
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 返回列表功能
 * - 发布作品入口
 * - 管理作品入口
 * 
 * @props
 * - type: 'face' | 'body' - 模块类型
 * 
 * @events
 * - back: 返回事件
 * 
 * @styles
 * - 使用 pvx-navigation-mixin 样式混合
 * - 样式文件: assets/css/common/face-body/index.less
 -->
<template>
    <div class="m-pvx-navigation">
        <div class="u-pvx-goback" @click="handleGoBack">返回列表</div>

        <div class="m-pvx-type__btn-box">
            <a :href="publishLink" target="_blank">
                <div class="u-pvx-type-publish">
                    <img svg-inline src="@/assets/img/common/face-body/publish.svg" class="u-pvx-img" />
                    <span class="u-fb-publish-text">{{ publishText }}</span>
                </div>
            </a>
            <a :href="manageLink" target="_blank">
                <div size="medium" class="u-pvx-manage"></div>
            </a>
        </div>
    </div>
</template>

<script>
import { publishLink } from "@jx3box/jx3box-common/js/utils";

/**
 * SingleNavigation - 详情页导航组件
 * 用于脸型/体型详情页顶部导航区域
 * 包含返回列表、发布按钮、管理按钮
 *
 * 样式说明：
 * - 组件使用统一类名 m-pvx-navigation、m-pvx-type__btn-box 等
 * - 样式由页面引入的 less 文件控制（body/single.less 或 face/single.less）
 * - 通过 face-body/index.less 中的 pvx-navigation-mixin 定义样式
 */
export default {
    name: "SingleNavigation",
    props: {
        // 类型标识：face（脸型）或 body（体型）
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
    },
    computed: {
        // 发布按钮文案
        publishText() {
            return this.type === "face" ? "发布作品" : "发布体型";
        },
        // 发布链接
        publishLink() {
            return publishLink(this.type);
        },
        // 管理链接
        manageLink() {
            return `/os/#/omp/pvx/${this.type}data`;
        },

    },
    methods: {
        // 返回列表操作
        handleGoBack() {
            // 跳转到列表页
            this.$router.push({ name: "list" });
        },
    },
};
</script>
