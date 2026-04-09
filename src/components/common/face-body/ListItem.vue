<!--
 * ListItem - 公共列表项组件
 * 
 * @description 用于脸型/体型列表页和详情页的列表项展示
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型切换
 * - 支持显示/隐藏作者信息
 * - 支持纯图片模式
 * - 支持标签展示（新、类型、星标、付费）
 * - 支持点击跳转到详情页
 * 
 * @usage
 * <ListItem type="face" :item="item" />
 * <ListItem type="body" :item="item" :show-author="false" />
 * 
 * @props
 * - type: 'face' | 'body' - 模块类型
 * - item: Object - 列表项数据
 * - showAuthor: Boolean - 是否显示作者信息
 * - onlyPic: Boolean - 是否纯图片模式
 * - noName: Boolean - 是否隐藏名称
 * 
 * @styles
 * - 使用 pvx-item-mixin 样式混合
 * - 样式文件: assets/css/common/face-body-mixins.less
 -->
<template>
    <a 
        :class="itemClasses" 
        :href="`${link}/${item.id}`" 
        target="_blank"
    >
        <div class="m-img" v-if="type === 'body'">
            <el-image class="u-pic" :src="showThumb(imgLink)" fit="cover">
                <template #error>
                    <div class="image-slot">
                        <img :src="defaultImage" />
                    </div>
                </template>
            </el-image>
            <div class="m-mark-left">
                <i class="u-mark u-mark--star" v-if="!!item.star">编辑推荐</i>
                <i class="u-mark u-mark--new" v-if="!!item.is_unlimited">可新建</i>
            </div>
            <i class="u-mark u-mark--pay" v-if="!!~~item.price_type && !!item.price_count">付费</i>
        </div>

        <el-image 
            v-else
            class="u-img" 
            :src="showThumb(imgLink)" 
            fit="cover"
        ></el-image>

        <img 
            v-if="type === 'face' && item.code_mode" 
            class="u-pinch__marker" 
            src="@/assets/img/face/bxs_barcode.svg" 
            alt="" 
        />

        <div class="m-tags" v-if="type === 'face'">
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
                <el-image 
                    v-if="type === 'face'" 
                    class="u-avatar" 
                    :src="showAvatar(item.user_avatar)" 
                    :alt="author" 
                />
                <img 
                    v-else 
                    class="u-avatar" 
                    :src="showAvatar(item.user_avatar)" 
                    :alt="author" 
                />
                <span class="u-name"> {{ item.author_name || "匿名" }} </span>
            </div>
        </div>
    </a>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { showAvatar, getThumbnail } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "ListItem",
    props: {
        type: {
            type: String,
            default: 'face',
            validator: (value) => ['face', 'body'].includes(value)
        },
        item: {
            type: Object,
            required: true
        },
        showAuthor: {
            type: Boolean,
            default: true
        },
        onlyPic: {
            type: Boolean,
            default: false
        },
        noName: {
            type: Boolean,
            default: false
        }
    },
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
        itemClasses() {
            const classes = [`m-${this.type}-item`];
            if (this.onlyPic) classes.push('onlyPic');
            if (this.noName) classes.push('noName');
            return classes;
        },
        author: function () {
            return this.item.display_name || "匿名";
        },
        imgLink: function () {
            if (this.type === 'face') {
                return this.item.images?.[0] || __imgPath + "image/face/null2.png";
            }
            return this.item.images?.[0];
        },
        link() {
            return location.origin + `/${this.type}`;
        },
        client() {
            return location.href.includes("origin") ? "origin" : "std";
        },
        defaultImage() {
            return this.type === 'face' 
                ? __imgPath + "image/face/null2.png"
                : require('@/assets/img/body/body_null.png');
        }
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
@import "~@/assets/css/common/face-body-mixins.less";

.m-face-item,
.m-body-item {
    .pvx-item-mixin();
}
</style>
