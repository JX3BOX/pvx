<!--
 * SingleHeader - 详情页头部信息组件
 * 
 * @description 用于脸型/体型详情页展示作品标题、作者信息、标签等
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 显示作品标题和状态标签
 * - 显示作者头像、名称、更新时间
 * - 支持编辑入口（仅作者可见）
 * - 显示作品标签（推荐、首发、原创等）
 * 
 * @props
 * - type: 'face' | 'body' - 模块类型
 * - post: Object - 作品数据对象
 * 
 * @styles
 * - 使用 pvx-header-mixin 样式混合
 * - 样式文件: assets/css/common/face-body/index.less
 -->
<template>
    <div class="m-pvx-header">
        <div class="m-pvx-header__info">
            <h2 class="u-fb-header-heading">
                {{ post.title || $t("pages.faceBody.detail.untitled") }}
                <el-tag class="u-pvx-status u-fb-header-status" v-if="post.status != 1" effect="dark" type="danger">{{ $t("pages.faceBody.detail.removed") }}</el-tag>
            </h2>

            <div class="u-pvx-author u-fb-header-author">
                <img class="u-pvx-avatar" :src="showAvatar(post.user_avatar)" :alt="post.user_avatar_frame" />
                <a class="u-pvx-name u-fb-author-link" :href="authorLink(post.user_id)" target="_blank" v-if="!!post.original">
                    {{ post.display_name }}
                </a>
                <a class="u-pvx-name u-fb-author-link" :href="post.author_link" target="_blank" v-else-if="post.author_link">
                    {{ post.author_name }}
                </a>
                <span class="u-pvx-name" v-else>{{ post.author_name }}</span>
                <time class="u-pvx-time">{{ post.updated_at }}</time>
                <a class="u-pvx-edit u-fb-author-link" v-if="canEdit" :href="editLink(type, post.id)" target="_blank">
                    <el-icon class="u-pvx-edit-icon u-fb-author-icon">
                        <EditPen />
                    </el-icon>
                    {{ $t("pages.faceBody.detail.edit") }}
                </a>
            </div>

            <div class="u-pvx-meta u-fb-header-meta">
                <i class="u-pvx-mark u-fb-meta-tag" v-if="!!post.star">★ {{ $t("pages.faceBody.card.editorChoice") }}</i>
                <i class="u-pvx-fr u-fb-meta-tag" v-if="!!post.is_fr">{{ $t("pages.faceBody.detail.firstPublished") }}</i>
                <i class="u-pvx-original u-fb-meta-tag" v-if="!!post.original">{{ $t("pages.faceBody.detail.original") }}</i>
                <i class="u-pvx-client u-fb-meta-tag" :class="post.client || 'std'">{{ showClientLabel(post.client) }}</i>
                <template v-if="type === 'face' && post.client === 'std'">
                    <i class="u-pvx-is-new-face u-fb-meta-tag" :class="post.is_new_face === 1 ? 'u-pvx-new' : 'u-pvx-old'">
                        {{ showFaceStyleLabel(post.is_new_face) }}
                    </i>
                </template>
                <i class="u-pvx-bodytype u-fb-meta-tag" :class="'u-pvx-bodytype-' + post.body_type" v-if="post.body_type">
                    {{ showBodyTypeLabel(post.body_type) }}
                </i>
            </div>
        </div>

        <a :href="tvLink" target="_blank" class="m-pvx-topic" v-if="topicText">{{ topicText }}</a>
    </div>
</template>

<script>
import { showAvatar, authorLink, editLink } from "@jx3box/jx3box-common/js/utils";
import { __clients, __imgPath, __Root } from "@/utils/config";
import bodyData from "@jx3box/jx3box-data/data/role/body.json";

const { bodyMap } = bodyData;

/**
 * SingleHeader - 详情页头部信息组件
 * 用于脸型/体型详情页展示标题、作者、标签等基础信息
 * 
 * 样式说明：
 * - 组件使用原有类名 m-header、m-header-info 等
 * - 样式由页面引入的 less 文件控制（body/single.less 或 face/single.less）
 * - 通过 face-body/index.less 中的 pvx-header-mixin 定义样式
 */
export default {
    name: "SingleHeader",
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
        canEdit: {
            type: Boolean,
            default: false,
        },
        topicText: {
            type: String,
            default: "",
        },
    },
    data() {
        return { client_map: __clients };
    },
    computed: {
        tvLink() {
            return this.type === "face" ? __Root + "index/tv" : __imgPath + "index/tv";
        },
    },
    methods: {
        showAvatar,
        authorLink,
        editLink,
        showClientLabel(val) {
            const key = `pages.faceBody.detail.clients.${val}`;
            return this.$te(key) ? this.$t(key) : this.client_map[val];
        },
        showFaceStyleLabel(val) {
            return this.$t(val === 1 ? "pages.faceBody.card.realistic" : "pages.faceBody.card.artistic");
        },
        showBodyTypeLabel(val) {
            const roleKeys = { 1: "male", 2: "female", 5: "boy", 6: "girl" };
            const roleKey = roleKeys[val];
            return roleKey ? this.$t(`pages.faceBody.roles.${roleKey}`) : bodyMap[val];
        },
    },
};
</script>
