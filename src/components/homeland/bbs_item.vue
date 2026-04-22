<template>
    <li class="u-item">
        <a class="u-banner" :href="postLink" target="_blank">
            <img :src="showBanner" :alt="item.title" />
        </a>
        <div class="u-content">
            <h2 class="u-post" :class="{ isSticky: item.sticky }">
                <a class="u-title" :href="postLink" target="_blank">{{ item.title }}</a>
            </h2>
            <div class="u-desc" v-if="item.summary">{{ item.summary }}</div>
            <div class="u-metalist">
                <strong v-if="item.tags?.length">
                    <span v-for="(tag, i) in item.tags" :key="i">{{ tag }}</span>
                </strong>
            </div>
            <div class="u-misc">
                <a class="u-author-name" :href="authorLink" target="_blank">
                    <img class="u-author-avatar" :src="authorAvatar" />
                    {{ item.author?.name || "匿名" }}
                </a>
                <span class="u-date">{{ showTime }}</span>
            </div>
        </div>
    </li>
</template>

<script>
/**
 * @description 攻略列表项组件
 * @description 展示单篇攻略文章的卡片信息
 * @author ymg
 * @version 1.0.0
 * 
 * @props
 * - item {Object} 攻略数据对象，包含 title, summary, tags, author, sticky 等字段
 * 
 * @example
 * <bbs_item :item="articleData" />
 * 
 * @notes
 * - 置顶文章会显示特殊标记
 * - 点击标题或封面跳转到文章详情页
 * - 显示作者头像、名称和发布时间
 */
import { getLink, showAvatar, formatTime } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "BbsItem",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    computed: {
        postLink() {
            return getLink("post", this.item.id);
        },
        authorLink() {
            return getLink("user", this.item.author?.id);
        },
        authorAvatar() {
            return showAvatar(this.item.author?.avatar, "s");
        },
        showBanner() {
            return this.item.banner || "https://img.jx3box.com/image/bbs/default_banner.png";
        },
        showTime() {
            return formatTime(this.item.updated || this.item.created);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/bbs.less";
</style>
