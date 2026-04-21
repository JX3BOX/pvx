<!--
 * SinglePage - PC端公共详情页组件
 * 
 * @description 用于脸型/体型模块的详情页展示，整合了导航、头部、轮播、支付、作者信息等子组件
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 整合多个子组件：导航、头部、轮播、支付、作者、随机推荐等
 * - 支持插槽自定义（notice、data-section、download-section、thx、comment）
 * - 支持购买、下载、点赞等交互功能
 * 
 * @sub-components
 * - SingleNavigation: 导航栏组件
 * - SingleHeader: 头部信息组件
 * - SingleCarousel: 图片轮播组件
 * - SinglePaySection: 支付下载组件
 * - SingleRandomList: 随机推荐组件
 * - author: 作者信息组件
 * - Thx: 感谢组件
 * - Comment: 评论组件
 * 
 * @events
 * - back: 返回事件
 * - publish: 发布事件
 * - pay: 购买事件
 * - download: 下载事件
 * - download-file: 下载单个文件事件
 * - item-click: 列表项点击事件
 * 
 * @styles
 * - 使用 pvx-single-data-mixin 样式混合
 * - 样式文件: assets/css/common/face-body/index.less
 -->
<template>
    <div :class="['p-pvx-single', `p-${type}-single`]" v-loading="loading">
        <SingleNavigation 
            :type="type" 
            @go-back="handleBack"
            @publish="handlePublish"
        />

        <slot name="notice"></slot>

        <SingleHeader 
            :post="post" 
            :type="type" 
            :canEdit="canEdit" 
            :topicText="topicText"
        />

        <div :class="['m-pvx-content', `m-${type}-content`]">
            <SingleCarousel 
                :imageList="images" 
                :type="type"
            />

            <SinglePaySection
                :post="post"
                :type="type"
                :hasBuy="hasBuy"
                :fileList="fileList"
                :topicInfo="topicInfo"
                @pay="handlePay"
                @download="handleDownload"
                @download-file="handleDownloadFile"
            >
                <template #extra>
                    <slot name="pay-extra" :post="post" :hasBuy="hasBuy"></slot>
                </template>
            </SinglePaySection>
        </div>

        <slot name="data-section" :data="dataSection" :hasBuy="hasBuy">
            <div class="m-single-data" v-if="dataSection">
                <span class="m-single-data-title">独家数据分析</span>
                <slot name="data-content" :data="dataSection"></slot>
            </div>
            <div class="m-single-buy-box" v-else-if="!hasBuy">
                <slot name="buy-prompt">
                    <div class="m-pvx-buy-btn" @click="handlePay">
                        <div class="u-price" v-if="post.price_type == 1">售价：{{ post.price_count }} 盒币</div>
                        <div class="u-buy">购买</div>
                    </div>
                    <div class="u-pvx-buy-tip">数据分析将在购买后解锁</div>
                </slot>
            </div>
        </slot>

        <slot name="download-section" :hasBuy="hasBuy" :data="dataSection">
            <div :class="['m-pvx-download', `m-${type}-download`]" v-if="hasBuy && dataSection">
                <div :class="['m-pvx-buy-btn', `m-${type}-buy-btn`]" @click="handleDownload">
                    <div class="u-buy">
                        <img :src="require('@/assets/img/common/face-body/download.svg')" alt="" />下载数据
                    </div>
                </div>
            </div>
        </slot>

        <div class="u-about-author">关于作者</div>
        <authorItem v-if="post.user_id" :uid="post.user_id" />

        <SingleRandomList 
            :list="randomList" 
            :type="type"
            @item-click="handleItemClick"
        />

        <slot name="thx" :postId="id" :post="post">
            <Thx 
                class="m-thx m-single-content-box" 
                :postId="id" 
                :postType="type" 
                :postTitle="post.title || '无标题'"
                :userId="post.user_id" 
                :adminBoxcoinEnable="post.status == 1" 
                :userBoxcoinEnable="post.status == 1"
                :client="post.client" 
            />
        </slot>

        <div class="m-comments m-single-content-box">
            <el-divider content-position="left">讨论</el-divider>
            <slot name="comment" :id="id" :type="type">
                <Comment :id="id" :category="type" />
            </slot>
        </div>
    </div>
</template>

<script>
import SingleNavigation from "./SingleNavigation.vue";
import SingleHeader from "./SingleHeader.vue";
import SingleCarousel from "./SingleCarousel.vue";
import SinglePaySection from "./SinglePaySection.vue";
import SingleRandomList from "./SingleRandomList.vue";
import authorItem from "./author.vue";
import Thx from "@jx3box/jx3box-common/ui/Thx.vue";
import Comment from "@jx3box/jx3box-common/ui/Comment.vue";

export default {
    name: "SinglePage",
    components: {
        SingleNavigation,
        SingleHeader,
        SingleCarousel,
        SinglePaySection,
        SingleRandomList,
        authorItem,
        Thx,
        Comment
    },
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ['face', 'body'].includes(value)
        },
        loading: {
            type: Boolean,
            default: false
        },
        id: {
            type: [String, Number],
            required: true
        },
        post: {
            type: Object,
            default: () => ({})
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        topicText: {
            type: String,
            default: ''
        },
        images: {
            type: Array,
            default: () => []
        },
        hasBuy: {
            type: Boolean,
            default: false
        },
        fileList: {
            type: Array,
            default: () => []
        },
        topicInfo: {
            type: Object,
            default: () => ({})
        },
        dataSection: {
            type: Object,
            default: null
        },
        randomList: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        handleBack() {
            this.$emit('back');
        },
        handlePublish() {
            this.$emit('publish');
        },
        handlePay() {
            this.$emit('pay');
        },
        handleDownload() {
            this.$emit('download');
        },
        handleDownloadFile(file) {
            this.$emit('download-file', file);
        },
        handleItemClick(item) {
            this.$emit('item-click', item);
        }
    }
};
</script>

<style lang="less">
@import "~@/assets/css/common/face-body/index.less";

.p-pvx-single {
    .pvx-single-data-mixin();
}
</style>
