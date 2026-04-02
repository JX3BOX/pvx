<template>
    <div class="m-navigation">
        <div class="u-goback" @click="handleGoBack">返回列表</div>

        <div :class="btnBoxClass">
            <a :href="publishLink" target="_blank">
                <div :class="publishBtnClass">
                    <img svg-inline src="@/assets/img/common/face-body/publish.svg" class="u-img" />
                    <span>{{ publishText }}</span>
                </div>
            </a>
            <a :href="manageLink" target="_blank">
                <div size="medium" class="u-manage"></div>
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
 * - 组件使用原有类名 m-navigation、m-body-btn-box/m-face-btn-box 等
 * - 样式由页面引入的 less 文件控制（body/single.less 或 face/single.less）
 * - 通过 face-body-mixins.less 中的 pvx-navigation-mixin 定义样式
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
        // 按钮容器类名
        btnBoxClass() {
            return this.type === "face" ? "m-face-btn-box" : "m-body-btn-box";
        },
        // 发布按钮类名
        publishBtnClass() {
            return this.type === "face" ? "u-face-publish" : "u-body-publish";
        },
    },
    methods: {
        // 返回列表操作
        handleGoBack() {
            // 更新页面标题
            document.title = this.type === "face" ? "捏脸分享 - JX3BOX" : "捏体分享 - JX3BOX";
            // 跳转到列表页
            this.$router.push({ name: "list" });
        },
    },
};
</script>
