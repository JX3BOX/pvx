<!--
 * Single - 脸型模块详情页
 * 
 * @description 展示脸型详情信息，包括图片预览、数据分析、购买下载、作者信息等
 * @author Face & Body 模块优化团队
 * @version 2.0.0
 * 
 * @features
 * - 图片轮播预览
 * - 脸型数据分析展示（写实/写意）
 * - 购买/下载功能
 * - 复制捏脸码功能
 * - 作者信息展示
 * - 随机推荐列表
 * - 评论功能
 * - 感谢/投币功能
 -->
<template>
    <div class="p-pvx-face-single p-pvx-face-single--modern" v-loading="loading" ref="singleRef">
        <SingleNavigation type="face" @go-back="goBack" />
        <public-notice bckey="face_ac"></public-notice>
        <SingleHeader :post="post" type="face" :canEdit="canEdit" :topicText="topicText" />

        <div class="m-pvx-type__content">
            <SingleCarousel :imageList="previewSrcList" type="face" />
            <SinglePaySection :post="post" type="face" :hasBuy="has_buy" :fileList="downFileList"
                :topicInfo="topic_info" @pay="pay" @download="downloadAll" @download-file="handleDownloadFile">
                <template #extra-buttons>
                    <div class="m-pvx-type__buy-btn m-pvx-type__buy-btn--copy" v-if="post.code_mode && !canBuy"
                        @click="copy(post.code)">
                        <div class="u-pvx-buy">
                        <img class="u-fb-buy-icon" :src="require('@/assets/img/face/bxs_copy.svg')" alt="" />{{ $t("pages.faceBody.detail.copyFaceCode") }}
                    </div>
                    </div>
                    <div class="u-pvx-type-code u-fb-buy-code" v-if="post.code_mode">{{ post.code }}</div>
                </template>
            </SinglePaySection>
        </div>

        <section class="m-pvx-single__data m-pvx-single__panel" v-if="!post.code_mode">
            <div class="m-pvx-single__section-header">
                <div>
                    <span class="m-pvx-single__eyebrow">DATA ANALYSIS</span>
                    <h2 class="m-pvx-single__data-title">{{ $t("pages.faceBody.detail.dataAnalysis") }}</h2>
                </div>
                <span class="u-pvx-single__section-tip">{{ $t("pages.faceBody.detail.analysisHint") }}</span>
            </div>
            <facedata v-if="has_buy && facedata" :data="faceAllData" :lock="true" type="face" />
            <div class="m-pvx-single__buy-box" v-else>
                <div class="m-pvx-type__buy-btn" @click="pay()" v-if="canBuy">
                    <div class="u-pvx-price">{{ priceText }}</div>
                    <div class="u-pvx-buy">
                        <img class="u-fb-buy-icon" :src="require('@/assets/img/common/face-body/shopcart.svg')" alt="" />{{ $t("pages.faceBody.detail.purchase") }}
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
            <SingleRandomList :list="randomList" type="face" variant="modern" />
        </section>

        <Thx class="m-pvx-thx m-pvx-single__content-box" :postId="id" postType="face" :postTitle="post.title || $t('pages.faceBody.detail.untitled')"
            :userId="post.user_id" :adminBoxcoinEnable="post.status == 1" :userBoxcoinEnable="post.status == 1"
            :client="post.client" />

        <div class="m-pvx-comments m-pvx-single__content-box">
            <el-divider content-position="left">{{ $t("pages.faceBody.detail.discussion") }}</el-divider>
            <CommonComment :id="id" category="face" />
        </div>
    </div>
</template>

<script>
import PublicNotice from "@/components/PublicNotice";
import pcSingleMixin from "@/components/common/face-body/mixins/pc-single-mixin";
import {
    getOneFaceInfo,
    payFace,
    loopPayStatus,
    getAccessoryList,
    getDownUrl,
    getRandomFace,
    getSliders,
} from "@/service/face";
import facedata from "@jx3box/jx3box-facedat/src/Facedat.vue";
import CommonComment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import { buildFaceAllData } from "@/utils/data-parser";
import authorItem from "@/components/common/face-body/Author";
import SingleNavigation from "@/components/common/face-body/SingleNavigation.vue";
import SingleHeader from "@/components/common/face-body/SingleHeader.vue";
import SingleCarousel from "@/components/common/face-body/SingleCarousel.vue";
import SinglePaySection from "@/components/common/face-body/SinglePaySection.vue";
import SingleRandomList from "@/components/common/face-body/SingleRandomList.vue";

export default {
    name: "single",
    components: {
        PublicNotice, facedata, CommonComment, authorItem,
        SingleNavigation, SingleHeader, SingleCarousel, SinglePaySection, SingleRandomList,
    },
    mixins: [pcSingleMixin],

    data() {
        return {
            type: "face",
            stat: {},
        };
    },

    computed: {
        facedata() {
            return buildFaceAllData(this.post?.data);
        },
        canBuy() {
            return this.post.price_type && this.post.price_type != 0 && !this.has_buy;
        },
        priceText() {
            if (Number(this.post.price_type) === 1) return this.$t("pages.faceBody.detail.priceBoxcoin", { price: this.post.price_count });
            if (Number(this.post.price_type) === 2) return this.$t("pages.faceBody.detail.priceGold", { price: this.post.price_count });
            return "";
        },
        faceAllData() {
            return this.facedata;
        },
    },

    methods: {
        getData() {
            if (!this.id) return;
            this.loading = true;
            getOneFaceInfo(this.id)
                .then((res) => {
                    this.post = res.data.data;
                    this.$store.commit("SET_FACE_SINGLE", res.data.data);
                    document.title = this.post.title + this.$t("pages.common.appendTitle");
                    this.getAccessoryList();
                    this.getRandomList();
                    this.getSliders();
                })
                .catch(() => { this.loading = false; });
            this.loadStat();
        },

        fetchAccessoryList: getAccessoryList,
        getDownUrl: getDownUrl,
        fetchRandomList: getRandomFace,
        fetchSliders: getSliders,
        submitPurchase: payFace,
        fetchPayStatus: loopPayStatus,

        copy(txt) {
            navigator.clipboard.writeText(txt).then(() => {
                this.$notify({ title: this.$t("pages.faceBody.detail.copySuccess"), message: txt + "", type: "success" });
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/index.less";
@import "~@/assets/css/modules/face-detail-theme.less";
</style>
