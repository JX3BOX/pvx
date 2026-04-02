<template>
    <div class="m-header">
        <div class="m-header-info">
            <h2>
                {{ post.title || "无标题" }}
                <el-tag class="u-status" v-if="post.status != 1" effect="dark" type="danger">已下架</el-tag>
            </h2>

            <div class="u-author">
                <img class="u-avatar" :src="showAvatar(post.user_avatar)" :alt="post.user_avatar_frame" />
                <a class="u-name" :href="authorLink(post.user_id)" target="_blank" v-if="!!post.original">
                    {{ post.display_name }}
                </a>
                <a class="u-name" :href="post.author_link" target="_blank" v-else-if="post.author_link">
                    {{ post.author_name }}
                </a>
                <span class="u-name" v-else>{{ post.author_name }}</span>
                <time class="u-time">{{ post.updated_at }}</time>
                <a class="u-edit" v-if="canEdit" :href="editLink(type, post.id)" target="_blank">
                    <el-icon class="u-edit-icon">
                        <EditPen />
                    </el-icon>
                    编辑
                </a>
            </div>

            <div class="u-meta">
                <i class="u-mark" v-if="!!post.star">★ 编辑推荐</i>
                <i class="u-fr" v-if="!!post.is_fr">首发</i>
                <i class="u-original" v-if="!!post.original">原创</i>
                <i class="u-client" :class="post.client || 'std'">{{ showClientLabel(post.client) }}</i>
                <template v-if="type === 'face' && post.client === 'std'">
                    <i class="u-is-new-face" :class="post.is_new_face === 1 ? 'u-new' : 'u-old'">
                        {{ newFaceMap[post.is_new_face] }}
                    </i>
                </template>
                <i class="u-bodytype" :class="'u-bodytype-' + post.body_type" v-if="post.body_type">
                    {{ showBodyTypeLabel(post.body_type) }}
                </i>
            </div>
        </div>

        <a :href="tvLink" target="_blank" class="m-topic" v-if="topicText">{{ topicText }}</a>
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
 * - 通过 face-body-mixins.less 中的 pvx-header-mixin 定义样式
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
        return {
            client_map: __clients,
            newFaceMap: ["写意", "写实"],
        };
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
            return this.client_map[val];
        },
        showBodyTypeLabel(val) {
            return bodyMap[val];
        },
    },
};
</script>
