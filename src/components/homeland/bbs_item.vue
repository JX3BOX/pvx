<template>
    <li class="u-item">
        <!-- Banner -->
        <a class="u-banner" :href="postLink(item.ID)" :target="target"><img :src="getBanner(item.post_banner, item.post_subtype)" :key="item.ID"/></a>

        <!-- 标题 -->
        <h2 class="u-post" :class="{ isSticky: item.sticky }">
            <!-- 图标 -->
            <img class="u-icon" svg-inline src="@/assets/img/homeland/post.svg" />

            <!-- 标题文字 -->
            <a class="u-title" :style="showHighlight(item.color)" :href="postLink(item.ID)" :target="target">{{ item.post_title || "无标题" }}</a>

            <!-- 角标 -->
            <span class="u-marks" v-if="item.mark && item.mark.length">
                <i v-for="mark in item.mark" class="u-mark" :key="mark">{{ showMark(mark) }}</i>
            </span>
        </h2>

        <!-- 字段 -->
        <div class="u-content u-desc">
            {{ item.post_excerpt || item.post_title || "这个作者很懒,什么都没有留下" }}
        </div>

        <!-- 作者 -->
        <div class="u-misc">
            <img class="u-author-avatar" :src="showAvatar(item.author_info)" :alt="showNickname(item.author_info)" />
            <a class="u-author-name" :href="authorLink(item.post_author)" target="_blank">{{ showNickname(item.author_info) }}</a>
            <span class="u-date">
                Updated on
                <time v-if="order == 'update'">{{ dateFormat(item.post_modified) }}</time>
                <time v-else>{{ dateFormat(item.post_date) }}</time>
            </span>
        </div>
    </li>
</template>

<script>
import { showAvatar as showAvatarUtil, authorLink as authorLinkUtil, showBanner, buildTarget } from "@jx3box/jx3box-common/js/utils";
import { __imgPath } from "@/utils/config";
import markData from "@jx3box/jx3box-common/data/mark.json";
import {showDate} from '@jx3box/jx3box-common/js/moment.js'
const mark_map = markData?.cms || {};
export default {
    name: "ListItem",
    props: ['item','order'],
    components: {},
    data: function() {
        return {
            target : buildTarget(),
        };
    },
    computed: {
    },
    watch: {},
    methods: {
        getBanner: function(val, subtype) {
            if (val) {
                return showBanner(val);
            } else {
                return __imgPath + `image/banner/bbs` + subtype + ".png";
            }
        },
        authorLink(val) {
            return authorLinkUtil(val);
        },
        postLink(val) {
            return location.origin + `/bbs/` + val;
        },
        showHighlight(val) {
            return val ? `color:${val};font-weight:600;` : "";
        },
        showMark(val) {
            return mark_map[val] || val;
        },
        showAvatar(userinfo) {
            return showAvatarUtil(userinfo?.user_avatar);
        },
        showNickname(userinfo) {
            return userinfo?.display_name || "匿名";
        },
        dateFormat(gmt) {
            return showDate(new Date(gmt));
        },
    },
    created: function() {},
    mounted: function() {},
};
</script>
