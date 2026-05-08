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
    <div class="p-pvx-body-single" v-loading="loading" ref="singleRef">
        <SingleNavigation type="body" @go-back="goBack" />
        <SingleHeader :post="post" type="body" :canEdit="canEdit" :topicText="topicText" />

        <div class="m-pvx-type__content">
            <SingleCarousel :imageList="previewSrcList" type="body" />
            <SinglePaySection :post="post" type="body" :hasBuy="has_buy" :fileList="downFileList"
                :topicInfo="topic_info" @pay="pay" @download="downloadAll" @download-file="handleDownloadFile" />
        </div>

        <div class="m-pvx-single__data">
            <span class="m-pvx-single__data-title">独家数据分析</span>
            <Bodydat v-if="bodydata" :data="bodydata" />
            <div class="m-pvx-single__buy-box" v-else>
                <div class="m-pvx-type__buy-btn" @click="pay()" v-if="canBuy">
                    <div class="u-pvx-price">{{ priceText }}</div>
                    <div class="u-pvx-buy"><img class="u-fb-buy-icon" :src="iconShopcart" alt="" />购买</div>
                </div>
                <div class="u-pvx-type-buy-tip">数据分析将在购买后解锁</div>
            </div>
        </div>

        <div class="m-pvx-type__download" v-if="has_buy && bodydata">
            <div class="m-pvx-type__buy-btn" @click="downloadAll">
                <div class="u-pvx-buy"><img class="u-fb-buy-icon" :src="iconDownload" alt="" />下载数据</div>
            </div>
        </div>

        <div class="u-pvx-about-author">关于作者</div>
        <authorItem :uid="post.user_id" />
        <SingleRandomList :list="randomList" type="body" />

        <Thx class="m-pvx-thx m-pvx-single__content-box" :postId="id" postType="body" :postTitle="post.title || '无标题'"
            :userId="post.user_id" :adminBoxcoinEnable="post.status == 1" :userBoxcoinEnable="post.status == 1"
            :client="post.client" />

        <div class="m-pvx-comments m-pvx-single__content-box">
            <el-divider content-position="left">讨论</el-divider>
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
import User from "@jx3box/jx3box-common/js/user";
import { parseBodyData } from "@/utils/data-parser";
import { pollPayStatus } from "@/utils/pay-polling";
import { formatPriceText } from "@/utils/price";
import authorItem from "@/components/common/face-body/Author";
import SingleNavigation from "@/components/common/face-body/SingleNavigation.vue";
import SingleHeader from "@/components/common/face-body/SingleHeader.vue";
import SingleCarousel from "@/components/common/face-body/SingleCarousel.vue";
import SinglePaySection from "@/components/common/face-body/SinglePaySection.vue";
import SingleRandomList from "@/components/common/face-body/SingleRandomList.vue";

import iconShopcart from "@/assets/img/common/face-body/shopcart.svg";
import iconDownload from "@/assets/img/common/face-body/download.svg";

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
            iconDownload,
            payPollingHandle: null,
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
            return formatPriceText(this.post.price_type, this.post.price_count);
        },
    },

    beforeUnmount() {
        if (this.payPollingHandle) {
            this.payPollingHandle.stop();
            this.payPollingHandle = null;
        }
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

        pay() {
            if (!User.isLogin()) {
                User.toLogin();
                return;
            }
            this.$confirm("确认购买此体型？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = {
                    postType: "body",
                    PostId: this.post.id,
                    priceType: this.post.price_type,
                    priceCount: this.post.price_count,
                    accessUserId: this.post.user_id,
                    payUserId: User.getInfo().uid,
                };
                this.payBtnLoading = true;
                payBody(params)
                    .then((res) => this.loopPayStatus(res.data.data.id))
                    .catch((err) => {
                        if (err.response?.data?.code == 40019) {
                            this.$confirm("余额不足，是否前往充值？", "提示", {
                                confirmButtonText: "确定",
                                cancelButtonText: "取消",
                                type: "warning",
                            }).then(() => window.open("/vip/cny", "_blank"));
                        }
                    })
                    .finally(() => { this.payBtnLoading = false; });
            });
        },

        loopPayStatus(payid) {
            if (this.payPollingHandle) this.payPollingHandle.stop();
            this.payPollingHandle = pollPayStatus(loopPayStatus, payid, {
                onSuccess: () => this.handlePayResult(1),
                onFail: () => this.handlePayResult(2),
                onTimeout: () => {
                    this.payBtnLoading = false;
                    this.$notify.error({ title: "超时", message: "支付结果查询超时，请稍后查看" });
                },
            });
        },

        handlePayResult(status) {
            this.payBtnLoading = false;
            this.payPollingHandle = null;
            if (status === 1) {
                this.getData();
                this.$notify.success({ title: "成功", message: "购买成功" });
            } else {
                this.$notify.error({ title: "失败", message: "支付失败" });
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/body/index.less";
</style>
