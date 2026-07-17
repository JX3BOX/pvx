<!--
 * Single - 体型模块详情页
 * 
 * @description 展示体型详情信息，包括图片预览、数据分析、购买下载、作者信息等
 * @author Face & Body 模块优化团队
 * @version 2.0.0
 * 
 * @features
 * - 图片轮播预览
 * - 体型数据分析展示
 * - 购买/下载功能
 * - 作者信息展示
 * - 随机推荐列表
 * - 评论功能
 * - 感谢/投币功能
 -->
<template>
    <div class="p-pvx-body-single p-pvx-body-single--modern" v-loading="loading" ref="singleRef">
        <SingleNavigation type="body" @go-back="goBack" />
        <SingleHeader :post="post" type="body" :canEdit="canEdit" :topicText="topicText" />

        <div class="m-pvx-type__content">
            <SingleCarousel :imageList="previewSrcList" type="body" />
            <SinglePaySection :post="post" type="body" :hasBuy="has_buy" :fileList="downFileList"
                :topicInfo="topic_info" @pay="pay" @download="downloadAll" @download-file="handleDownloadFile" />
        </div>

        <section class="m-pvx-single__data m-pvx-single__panel">
            <div class="m-pvx-single__section-header">
                <div>
                    <span class="m-pvx-single__eyebrow">DATA ANALYSIS</span>
                    <h2 class="m-pvx-single__data-title">{{ $t("pages.faceBody.detail.dataAnalysis") }}</h2>
                </div>
                <span class="u-pvx-single__section-tip">{{ $t("pages.faceBody.detail.analysisHint") }}</span>
            </div>
            <Bodydat v-if="has_buy && bodydata" :data="bodydata" />
            <div class="m-pvx-single__buy-box" v-else>
                <div class="m-pvx-type__buy-btn" @click="pay()" v-if="canBuy">
                    <div class="u-pvx-price">{{ priceText }}</div>
                    <div class="u-pvx-buy">
                        <img class="u-fb-buy-icon" :src="iconShopcart" alt="" />{{ $t("pages.faceBody.detail.purchase") }}
                    </div>
                </div>
                <div class="u-pvx-type-buy-tip">{{ $t("pages.faceBody.detail.analysisLocked") }}</div>
            </div>
        </section>

        <section class="m-pvx-single__author m-pvx-single__panel">
            <div class="m-pvx-single__section-header">
                <div>
                    <span class="m-pvx-single__eyebrow">CREATOR</span>
                    <h2 class="u-pvx-about-author">{{ $t("pages.faceBody.detail.aboutCreator") }}</h2>
                </div>
            </div>
            <authorItem :uid="post.user_id" />
        </section>

        <section class="m-pvx-single__recommend m-pvx-single__panel" v-if="randomList && randomList.length">
            <div class="m-pvx-single__section-header">
                <div>
                    <span class="m-pvx-single__eyebrow">MORE WORKS</span>
                    <h2>{{ $t("pages.faceBody.detail.moreWorks") }}</h2>
                </div>
            </div>
            <SingleRandomList :list="randomList" type="body" variant="modern" />
        </section>

        <Thx class="m-pvx-thx m-pvx-single__content-box" :postId="id" postType="body" :postTitle="post.title || $t('pages.faceBody.detail.untitled')"
            :userId="post.user_id" :adminBoxcoinEnable="post.status == 1" :userBoxcoinEnable="post.status == 1"
            :client="post.client" />

        <div class="m-pvx-comments m-pvx-single__content-box">
            <el-divider content-position="left">{{ $t("pages.faceBody.detail.discussion") }}</el-divider>
            <Comment :id="id" category="body" />
        </div>
    </div>
</template>

<script>
import pcSingleMixin from "@/components/common/face-body/mixins/pc-single-mixin";
import {
    getOneBodyInfo,
    payBody,
    loopPayStatus,
    getAccessoryList,
    getDownUrl as fetchDownUrl,
    getRandomBody,
    getSliders,
} from "@/service/body";
import Comment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import Bodydat from "@jx3box/jx3box-facedat/src/Bodydat.vue";
import { parseBodyData } from "@/utils/data-parser";
import authorItem from "@/components/common/face-body/Author";
import SingleNavigation from "@/components/common/face-body/SingleNavigation.vue";
import SingleHeader from "@/components/common/face-body/SingleHeader.vue";
import SingleCarousel from "@/components/common/face-body/SingleCarousel.vue";
import SinglePaySection from "@/components/common/face-body/SinglePaySection.vue";
import SingleRandomList from "@/components/common/face-body/SingleRandomList.vue";

import iconShopcart from "@/assets/img/common/face-body/shopcart.svg";

export default {
    name: "single",
    components: {
        Bodydat, Comment, authorItem,
        SingleNavigation, SingleHeader, SingleCarousel, SinglePaySection, SingleRandomList,
    },
    mixins: [pcSingleMixin],

    data() {
        return {
            type: "body",
            stat: {},
            iconShopcart,
        };
    },

    computed: {
        bodydata() {
            return parseBodyData(this.post?.data);
        },
        canBuy() {
            return this.post.price_type && this.post.price_type != 0 && !this.has_buy;
        },
        priceText() {
            if (Number(this.post.price_type) === 1) return this.$t("pages.faceBody.detail.priceBoxcoin", { price: this.post.price_count });
            if (Number(this.post.price_type) === 2) return this.$t("pages.faceBody.detail.priceGold", { price: this.post.price_count });
            return "";
        },
    },

    methods: {
        getData() {
            if (!this.id) return;
            this.loading = true;
            getOneBodyInfo(this.id)
                .then((res) => {
                    this.post = res.data.data;
                    this.$store.commit("SET_BODY_SINGLE", res.data.data);
                    document.title = this.post.title + this.$t("pages.common.appendTitle");
                    this.getAccessoryList();
                    this.getRandomList();
                    this.getSliders();
                })
                .catch(() => { this.loading = false; });
            this.loadStat();
        },

        fetchAccessoryList: getAccessoryList,
        getDownUrl: fetchDownUrl,
        fetchRandomList: getRandomBody,
        fetchSliders: getSliders,
        submitPurchase: payBody,
        fetchPayStatus: loopPayStatus,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/body/index.less";
@import "~@/assets/css/modules/face-detail-theme.less";
</style>
