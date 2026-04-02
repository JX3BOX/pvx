<template>
    <div class="p-body-single" v-loading="loading" ref="singleRef">
        <!-- 导航区域 - 使用公共组件 -->
        <SingleNavigation type="body" @go-back="goBack" />
        
        <!-- 头部信息 - 使用公共组件 -->
        <SingleHeader
            :post="post"
            type="body"
            :canEdit="canEdit"
            :topicText="topicText"
        />
        
        <div class="m-body-content">
            <!-- 图片轮播 - 使用公共组件 -->
            <SingleCarousel
                :imageList="previewSrcList"
                type="body"
            />
            
            <!-- 右侧购买/下载区域 - 使用公共组件 -->
            <SinglePaySection
                :post="post"
                type="body"
                :hasBuy="has_buy"
                :fileList="downFileList"
                :topicInfo="topic_info"
                @pay="bodyPay"
                @download="downloadAll"
                @download-file="handleDownloadFile"
            />
        </div>
        
        <!-- 数据分析区域 -->
        <div class="m-single-data">
            <span class="m-single-data-title">独家数据分析</span>
            <Bodydat v-if="bodydata" :data="bodydata" />
            <div class="m-single-buy-box" v-else>
                <div class="m-body-buy-btn" @click="bodyPay()"
                    v-if="post.price_type && post.price_type != 0 && !has_buy">
                    <div class="u-price" v-if="post.price_type == 1">售价：{{ post.price_count }} 盒币</div>
                    <div class="u-price" v-if="post.price_type == 2">售价：{{ post.price_count }} 金箔</div>
                    <div class="u-buy"><img :src="iconShopcart" alt="" />购买</div>
                </div>
                <div class="u-body-buy-tip">数据分析将在购买后解锁</div>
            </div>
        </div>
        
        <div class="m-body-download" v-if="has_buy && bodydata">
            <div class="m-body-buy-btn" @click="downloadAll">
                <div class="u-buy"><img :src="iconDownload" alt="" />下载数据</div>
            </div>
        </div>
        
        <div class="u-about-author">关于作者</div>
        <authorItem :uid="post.user_id" />
        
        <!-- 随机推荐列表 - 使用公共组件 -->
        <SingleRandomList :list="randomList" type="body" />
        
        <!-- 点赞 -->
        <Thx class="m-thx m-single-content-box" :postId="id" postType="body" :postTitle="post.title || '无标题'"
            :userId="post.user_id" :adminBoxcoinEnable="post.status == 1" :userBoxcoinEnable="post.status == 1"
            :client="post.client" />
        
        <!-- 评论 -->
        <div class="m-comments m-single-content-box">
            <el-divider content-position="left">讨论</el-divider>
            <Comment :id="id" category="body" />
        </div>
    </div>
</template>

<script>
/**
 * Single.vue - 体型数据详情页
 * 主要功能：展示体型数据详情、图片预览、购买/下载、评论等
 * 
 * 重构说明：
 * - 引入 SingleNavigation 公共组件替换导航区域
 * - 引入 SingleHeader 公共组件替换头部信息
 * - 引入 SingleCarousel 公共组件替换图片轮播
 * - 引入 SinglePaySection 公共组件替换购买下载区域
 * - 引入 SingleRandomList 公共组件替换随机推荐列表
 */
import {
    getOneBodyInfo,
    payBody,
    loopPayStatus,
    getAccessoryList,
    getDownUrl as fetchDownUrl,
    getRandomBody,
    setStar,
    cancelStar,
    onlineBody,
    offlineBody,
    getSliders,
} from "@/service/body";
import { publishLink } from "@jx3box/jx3box-common/js/utils";
import { getStat, postStat } from "@jx3box/jx3box-common/js/stat";
import Comment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import Bodydat from "@jx3box/jx3box-facedat/src/Bodydat.vue";
import User from "@jx3box/jx3box-common/js/user";
import bodyData from "@jx3box/jx3box-data/data/role/body.json";
import { __clients, __imgPath } from "@/utils/config";

import authorItem from "@/components/common/face-body/author";
import { downloadZip } from "@/utils/exportFileZip";
import dayjs from "@/utils/day";

// 引入公共组件
import SingleNavigation from "@/components/common/face-body/SingleNavigation.vue";
import SingleHeader from "@/components/common/face-body/SingleHeader.vue";
import SingleCarousel from "@/components/common/face-body/SingleCarousel.vue";
import SinglePaySection from "@/components/common/face-body/SinglePaySection.vue";
import SingleRandomList from "@/components/common/face-body/SingleRandomList.vue";

import iconShopcart from "@/assets/img/common/face-body/shopcart.svg";
import iconDownload from "@/assets/img/common/face-body/download.svg";

const { bodyMap } = bodyData;

export default {
    name: "single",
    components: {
        Bodydat,
        Comment,
        authorItem,
        SingleNavigation,
        SingleHeader,
        SingleCarousel,
        SinglePaySection,
        SingleRandomList,
    },
    data: function () {
        return {
            loading: false,
            post: {},
            stat: {},
            has_buy: false,
            client_map: __clients,
            downFileList: [],
            downloadParams: {
                pageIndex: 1,
                pageSize: 10,
                total: 0,
            },
            payBtnLoading: false,
            randomList: [],
            topic_info: null,
            iconShopcart,
            iconDownload,
        };
    },
    computed: {
        publish_link() {
            return publishLink("body");
        },
        id: function () {
            return ~~this.$route.params.id;
        },
        isAdmin: function () {
            return User.isAdmin();
        },
        isAuthor: function () {
            return this.post?.user_id == User.getInfo().uid || false;
        },
        bodydata: function () {
            const data = this.post?.data || "";
            if (!data) return { object: {}, fieldRanges: [] };

            try {
                const parsed = JSON.parse(data);
                const finalData = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
                return { object: finalData, fieldRanges: finalData?.fieldRanges || [] };
            } catch {
                return { object: {}, fieldRanges: [] };
            }
        },
        previewSrcList: function () {
            return this.post?.images || [];
        },
        canEdit: function () {
            return User.isEditor() || this.post?.user_id == User.getInfo().uid;
        },
        topicText() {
            return this.topic_info ? `${dayjs.tz(this.topic_info.created_at).format("YYYY年MM月DD日")}荣登头条` : "";
        },
    },
    created: function () {
        this.getData();
    },
    methods: {
        goBack() {
            document.title = "捏体分享 - JX3BOX";
            this.$router.push({ name: "list" });
        },
        getData() {
            if (this.id) {
                this.loading = true;
                getOneBodyInfo(this.id)
                    .then((res) => {
                        this.post = this.$store.state.bodySingle = res.data.data;
                        document.title = this.post.title;

                        this.getAccessoryList();
                        this.getRandomBodyList();
                        this.getSliders();
                    })
                    .catch((err) => {
                        this.loading = false;
                    });

                getStat("body", this.id).then((res) => {
                    this.stat = res.data;
                });
                postStat("body", this.id);
            }
        },
        getAccessoryList() {
            getAccessoryList(this.id, this.downloadParams)
                .then((res) => {
                    let data = res.data.data;
                    this.has_buy = data.has_buy;
                    if (data.has_buy) {
                        this.downFileList = data.list;
                        this.downloadParams.total = data.page.total;
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 处理下载单个文件
        handleDownloadFile(item) {
            fetchDownUrl(this.id, item.uuid).then((res) => {
                this.downloadfile(res.data.data?.url, item.name);
            });
        },
        downloadfile(url, filename) {
            this.getBlob(url).then((blob) => {
                this.saveAs(blob, filename);
            });
        },
        getBlob(url) {
            return new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.responseType = "blob";
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    }
                };
                xhr.send();
            });
        },
        saveAs(blob, filename) {
            if (window.navigator.msSaveOrOpenBlob) {
                navigator.msSaveBlob(blob, filename);
            } else {
                const link = document.createElement("a");
                const body = document.querySelector("body");
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                link.style.display = "none";
                body.appendChild(link);
                link.click();
                body.removeChild(link);
                window.URL.revokeObjectURL(link.href);
            }
        },
        downloadAll() {
            if (this.downFileList.length === 1) {
                const item = this.downFileList[0];
                this.handleDownloadFile(item);
                return;
            }
            const urlArr = [];
            this.downFileList.forEach((item) => {
                urlArr.push(fetchDownUrl(this.id, item.uuid));
            });
            let p = Promise.all(urlArr);
            let downloadFiles = [];
            p.then((arr) => {
                downloadFiles = arr.map((item, index) => {
                    return {
                    name: this.downFileList[index].name,
                    url: item.data.data?.url,
                    };
                });
                downloadZip(downloadFiles, `body_${this.id}.zip`, "url", "name");
            });
        },
        bodyPay() {
            if (!User.isLogin()) {
                User.toLogin();
                return;
            }
            this.$confirm("确认购买此体型？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    let postData = this.post;
                    let params = {
                        postType: "body",
                        PostId: postData.id,
                        priceType: postData.price_type,
                        priceCount: postData.price_count,
                        accessUserId: postData.user_id,
                        payUserId: User.getInfo().uid,
                    };
                    this.payBtnLoading = true;
                    payBody(params)
                        .then((res) => {
                            let payid = res.data.data.id;
                            this.loopPayStatus(payid);
                        })
                        .catch((err) => {
                            if (err.response?.data?.code == 40019) {
                                this.$confirm("余额不足，是否前往充值？", "提示", {
                                    confirmButtonText: "确定",
                                    cancelButtonText: "取消",
                                    type: "warning",
                                })
                                    .then(() => {
                                        window.open("/vip/cny", "_blank");
                                    })
                                    .catch(() => { });
                            }
                        })
                        .finally(() => {
                            this.payBtnLoading = false;
                        });
                })
                .catch(() => { });
        },
        loopPayStatus(payid) {
            let intervalId = setInterval(() => {
                loopPayStatus(payid)
                    .then((d) => {
                        this.getPayBodyStatus(d.data.data.pay_status, intervalId);
                    })
                    .catch(() => {
                        clearInterval(intervalId);
                    });
            }, 2000);
        },
        getPayBodyStatus(pay_status, intervalId) {
            if (pay_status == 1) {
                this.payBtnLoading = false;
                clearInterval(intervalId);
                this.getData();
                this.$notify.success({
                    title: "成功",
                    message: "购买成功",
                });
            } else if (pay_status == 2) {
                this.payBtnLoading = false;
                clearInterval(intervalId);
                this.$notify.error({
                    title: "失败",
                    message: "支付失败",
                });
            }
        },
        getRandomBodyList() {
            const { user_id } = this.post;
            const listWidth = this.$refs.singleRef?.clientWidth - 120;
            const limit = Math.floor(listWidth / 190);
            getRandomBody({ user_id, limit }).then((res) => {
                if (res.data.data.list && res.data.data.list.length > 0) {
                    this.randomList = res.data.data.list;
                }
            });
        },
        getSliders() {
            getSliders("slider", this.post.client, 10, this.post.id).then((res) => {
                if (res.data.data?.list) {
                    const list = res.data.data.list.sort((a, b) =>
                    dayjs.tz(b.created_at).isAfter(dayjs.tz(a.created_at)) ? 1 : -1
                );
                this.topic_info = list[0];
                }
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/body/single.less";
</style>
