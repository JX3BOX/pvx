<template>
    <a
        :class="['m-face-item', { noName }]"
        :href="`${link}/${item.id}`"
        target="_blank"
        v-reporter="{ data: { href: '/face/' + item.id, ...reporter }, caller: 'face_index' }"
    >
        <el-image class="u-img" :src="showThumb(imgLink)" fit="cover"></el-image>
        <img v-if="item.code_mode" class="u-pinch__marker" src="@/assets/img/face/bxs_barcode.svg" alt="" />
        <div class="m-tags">
            <div class="m-tag-left">
                <template v-if="client === 'std'">
                    <i class="u-tag u-tag--type u-new-face" v-if="item.is_new_face">写实</i>
                    <i class="u-tag u-tag--type" v-else>写意</i>
                </template>
                <i class="u-tag u-tag--new" v-if="!!item.is_unlimited">可新建</i>
            </div>

            <i class="u-tag u-tag--star" v-if="!!item.star">
                <img :src="require('@/assets/img/face/star.svg')" alt="" />推荐
            </i>
            <i class="u-tag u-tag--pay" v-if="!!~~item.price_type && !!item.price_count">
                <img :src="require('@/assets/img/face/coin.svg')" alt="" />{{ item.price_count }}
            </i>
        </div>

        <div class="m-op">
            <div class="u-title">{{ item.title }}</div>
            <div class="m-author" @click.stop="onAuthorClick">
                <el-image class="u-avatar" :src="showAvatar(item.user_avatar)" :alt="author" />
                <span class="u-name"> {{ item.author_name || "匿名" }} </span>
            </div>
        </div>
    </a>
</template>

<script>
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box";
import { showAvatar, getThumbnail } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "faceItem",
    props: ["item", "reporter", "noName"],
    data: function () {
        return {
            markmap: {
                newbie: "热门",
                advanced: "推荐",
                recommended: "精选",
            },
        };
    },
    computed: {
        author: function () {
            return this.item.display_name || "匿名";
        },
        imgLink: function () {
            return this.item.images?.[0] || __imgPath + "image/face/null2.png";
        },
        client() {
            return location.href.includes("origin") ? "origin" : "std";
        },
        link() {
            return location.origin + "/face";
        },
    },
    methods: {
        showThumb: function (url) {
            return getThumbnail(url, 360);
        },
        showAvatar,
        onAuthorClick() {
            if (!this.item.original) {
                window.open(this.item.author_link, "_blank");
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/item.less";
</style>
