<!--
 * MiniappSingleDetail - 小程序详情页主体组件
 * 
 * @description 用于微信小程序 webview 环境的详情页完整实现，包含图片展示、信息展示、作者信息、其他作品等
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 悬浮操作栏（复制码入口）
 * - 复制码抽屉（支持复制和跳转数据页）
 * - 图片轮播展示
 * - 标签展示（推荐、首发、原创、写实/写意等）
 * - 作品介绍
 * - 作者信息
 * - 其他作品推荐
 * - 支持暗色模式
 * 
 * @props
 * - post: Object - 作品数据对象
 * - type: 'face' | 'body' - 模块类型
 * - randomList: Array - 随机推荐列表
 * - disabled: Boolean - 是否禁用操作
 * - loading: Boolean - 加载状态
 * 
 * @events
 * - go-to-data: 跳转到数据页事件
 * 
 * @styles
 * - 样式文件: assets/css/miniprogram/face-single.less 或 body-single.less
 -->
<template>
    <div class="m-pvx-fb-single-detail" v-loading="loading">
        <!-- 悬浮操作栏 -->
        <SuspendCommon v-if="!disabled" :btnOptions="{ showHome: true }" :drawerOptions="suspendOptions"
            @search="handleSearch">
            <template #default>
                <div class="u-copy m-pvx-fb-single-detail__copy" @click="showCodeDrawer = true">
                    <img class="u-copy-icon u-fb-copy-icon" src="@/assets/img/pvxsuspension/copy_touchbar.svg" svg-inline />
                    复制{{ typeLabel }}码
                </div>
            </template>
        </SuspendCommon>

        <!-- 复制码抽屉 -->
        <MiniappCopyDrawer v-model="showCodeDrawer" :post="post" :typeLabel="typeLabel"
            @go-to-data="handleGoToData" />

        <!-- 图片轮播区域 -->
        <div class="m-detail-top">
            <el-carousel :height="carouselHeight">
                <el-carousel-item v-for="(item, i) in imageList" :key="i">
                    <div class="u-img-item">
                        <img class="u-fb-detail-img" :src="showPic(item)" />
                    </div>
                </el-carousel-item>
            </el-carousel>
            <!-- 作品名称/作者 -->
            <div class="u-info">
                <div class="u-name">{{ post.title || "无标题" }}</div>
                <div class="u-author">{{ post.display_name }}</div>
            </div>
        </div>

        <!-- 标签区域 -->
        <div class="m-tags">
            <div class="u-tag u-fb-tag purple" v-if="!!post.star">★ 编辑推荐</div>
            <!-- 脸型特有：写实/写意标签 -->
            <template v-if="type === 'face'">
                <div class="u-tag u-fb-tag" :class="post.is_new_face ? 'green' : 'mint'">
                    {{ newFaceMap[post.is_new_face] }}
                </div>
            </template>
            <div class="u-tag u-fb-tag" v-if="!!post.is_fr">首发</div>
            <div class="u-tag u-fb-tag" v-if="!!post.original">原创</div>
            <div class="u-tag u-fb-tag">{{ showClientLabel(post.client) }}</div>
            <div class="u-tag u-fb-tag" v-if="post.body_type">{{ showBodyTypeLabel(post.body_type) }}</div>
        </div>

        <!-- 介绍区域 -->
        <div class="m-introduce" v-if="post.remark">
            <div class="u-title u-fb-introduce-title">介绍</div>
            <div class="u-content u-fb-introduce-content">{{ post.remark }}</div>
        </div>

        <!-- 警告提示 -->
        <div class="m-warning" v-if="showWarning">
            <img src="@/assets/img/common/face-body/mobile/warning.svg" class="u-img" />
            <img src="@/assets/img/common/face-body/mobile/warning-dark.svg" class="u-img-dark u-fb-warning-img-dark" />
            <div class="u-text">小程序暂时不支持[非{{ typeLabel }}码]作品数据下载</div>
        </div>

        <!-- 码/数据入口 -->
        <div :class="['m-number-card', type === 'face' ? 'm-face-number' : 'm-body-number']" v-if="post.code_mode"
            @click="handleCopy">
            <div class="u-title u-fb-number-card-title">
                <img class="u-fb-number-icon" src="@/assets/img/common/face-body/mobile/copy.svg" />
                {{ typeLabel }}码
            </div>
            <div class="u-number u-fb-number-card-value">{{ post.code }}</div>
        </div>
        <div class="m-data-entry" v-else @click="handleGoToData">
            <div class="u-text">{{ typeLabel }}数据</div>
            <img src="@/assets/img/common/face-body/mobile/CaretLeft.svg" class="u-img" />
            <img src="@/assets/img/common/face-body/mobile/CaretLeft-dark.svg" class="u-img-dark u-fb-data-entry-img-dark" />
        </div>

        <!-- 关于作者 -->
        <MiniappAuthorCard :author="authorData" />

        <!-- 其他作品 -->
        <div class="m-author-other" v-if="randomList.length > 0">
            <div class="u-title u-fb-author-other-title">{{ post.display_name }}其他作品</div>
            <div class="u-list u-fb-author-other-list">
                <routine-list mode="compact" :list="randomList" :isNumber="true" :type="type" />
            </div>
        </div>
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import routineList from "@/components/common/face-body/miniprogram/RoutineList";
import MiniappCopyDrawer from "@/components/common/face-body/miniprogram/MiniappCopyDrawer";
import MiniappAuthorCard from "@/components/common/face-body/miniprogram/MiniappAuthorCard";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { __clients } from "@/utils/config";
import bodyData from "@jx3box/jx3box-data/data/role/body.json";
import wx from "weixin-js-sdk";

const { bodyMap } = bodyData;

export default {
    name: "MiniappSingleDetail",
    components: { SuspendCommon, routineList, MiniappCopyDrawer, MiniappAuthorCard },
    props: {
        post: {
            type: Object,
            default: () => ({}),
        },
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
        randomList: {
            type: Array,
            default: () => [],
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showCodeDrawer: false,
            client_map: __clients,
            newFaceMap: ["写意", "写实"],
        };
    },
    computed: {
        typeLabel() {
            return this.type === "face" ? "脸型" : "体型";
        },
        carouselHeight() {
            return this.type === "face" ? "550px" : "500px";
        },
        imageList() {
            return this.post?.images || [];
        },
        showWarning() {
            return !this.post.code_mode;
        },
        suspendOptions() {
            return {
                hideType: ["report", "rss", "search"],
                author: {
                    name: this.post.author_name,
                    avatar: this.post.user_avatar,
                    author_id: this.post.user_id,
                },
                title: this.post.title,
                postType: this.type,
                id: this.post.id,
            };
        },
        authorData() {
            return {
                user_id: this.post.user_id,
                user_avatar: this.post.user_avatar,
                author_name: this.post.author_name,
            };
        },
    },
    methods: {
        showPic(url) {
            return resolveImagePath(url);
        },
        showClientLabel(val) {
            return this.client_map[val];
        },
        showBodyTypeLabel(val) {
            return bodyMap[val];
        },
        handleCopy() {
            navigator.clipboard.writeText(this.post.code).then(() => {
                this.$notify({
                    title: "复制成功",
                    message: "内容：" + this.post.code,
                    type: "success",
                });
            });
        },
        handleGoToData() {
            this.$emit("go-to-data");
        },
        handleSearch() {
            const appName = this.type === "face" ? "捏脸" : "体型";
            const filterName = this.type === "face" ? "pvxface" : "pvxbody";
            wx.miniProgram.navigateTo({
                url: `/pages/search/search-detail/search-detail?app=${appName}&filter_name=${filterName}`,
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/face-body/miniprogram/single-detail.less";
</style>
