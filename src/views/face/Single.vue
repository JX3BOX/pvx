<template>
    <div class="p-face-single" v-loading="loading" ref="singleRef">
        <!-- 导航区域 - 使用公共组件 -->
        <SingleNavigation type="face" @go-back="goBack" />

        <public-notice bckey="face_ac"></public-notice>

        <!-- 头部信息 - 使用公共组件 -->
        <SingleHeader :post="post" type="face" :canEdit="canEdit" :topicText="topicText" />

        <div class="m-face-content">
            <!-- 图片轮播 - 使用公共组件 -->
            <SingleCarousel :imageList="previewSrcList" type="face" />

            <!-- 右侧购买/下载区域 - 使用公共组件 -->
            <SinglePaySection :post="post" type="face" :hasBuy="has_buy" :fileList="downFileList"
                :topicInfo="topic_info" @pay="facePay" @download="downloadAll" @download-file="handleDownloadFile">
                <!-- 脸型特有：复制捏脸码按钮 -->
                <template #extra-buttons>
                    <div class="m-face-buy-btn m-face-buy-btn_copy" v-if="post.code_mode && !canBuy"
                        @click="copy(post.code)">
                        <div class="u-buy">
                            <img :src="require('@/assets/img/face/bxs_copy.svg')" alt="" />复制捏脸码
                        </div>
                    </div>
                    <div class="u-face__code" v-if="post.code_mode">
                        {{ post.code }}
                    </div>
                </template>
            </SinglePaySection>
        </div>

        <!-- 数据分析区域 -->
        <div class="m-single-data" v-if="!post.code_mode">
            <span class="m-single-data-title">独家数据分析</span>
            <facedata v-if="has_buy && facedata" :data="faceAllData" :lock="true" type="face" />
            <div class="m-single-buy-box" v-else>
                <div class="m-face-buy-btn" @click="facePay()" v-if="canBuy">
                    <div class="u-price">{{ priceText }}</div>
                    <div class="u-buy">
                        <img :src="require('@/assets/img/common/face-body/shopcart.svg')" alt="" />购买
                    </div>
                </div>
                <div class="u-face-buy-tip">数据分析将在购买后解锁</div>
            </div>
        </div>

        <div class="m-face-download" v-if="has_buy && facedata">
            <div class="m-face-buy-btn" @click="downloadAll">
                <div class="u-buy">
                    <img :src="require('@/assets/img/common/face-body/download.svg')" alt="" />下载数据
                </div>
            </div>
        </div>

        <div class="u-about-author">关于作者</div>
        <authorItem :uid="post.user_id" />

        <!-- 随机推荐列表 - 使用公共组件 -->
        <SingleRandomList :list="randomList" type="face" />

        <!-- 点赞 -->
        <Thx class="m-thx m-single-content-box" :postId="id" postType="face" :postTitle="post.title || '无标题'"
            :userId="post.user_id" :adminBoxcoinEnable="post.status == 1" :userBoxcoinEnable="post.status == 1"
            :client="post.client" />

        <!-- 评论 -->
        <div class="m-comments m-single-content-box">
            <el-divider content-position="left">讨论</el-divider>
            <CommonComment :id="id" category="face" />
        </div>
    </div>
</template>

<script>
/**
 * Single.vue - 脸型数据详情页
 * 主要功能：展示脸型数据详情、图片预览、购买/下载、评论等
 * 
 * 重构说明：
 * - 引入 SingleNavigation 公共组件替换导航区域
 * - 引入 SingleHeader 公共组件替换头部信息
 * - 引入 SingleCarousel 公共组件替换图片轮播
 * - 引入 SinglePaySection 公共组件替换购买下载区域
 * - 引入 SingleRandomList 公共组件替换随机推荐列表
 */
import PublicNotice from "@/components/PublicNotice";
import { downloadZip } from "@/utils/exportFileZip";
import {
    getOneFaceInfo,
    payFace,
    loopPayStatus,
    getAccessoryList,
    getDownUrl,
    getRandomFace,
    setStar,
    cancelStar,
    onlineFace,
    offlineFace,
    getSliders,
} from "@/service/face";
import { publishLink } from "@jx3box/jx3box-common/js/utils";
import { getStat, postStat } from "@jx3box/jx3box-common/js/stat";
import facedata from "@jx3box/jx3box-facedat/src/Facedat.vue";
import CommonComment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import User from "@jx3box/jx3box-common/js/user";
import bodyData from "@jx3box/jx3box-data/data/role/body.json";
import { __clients, __imgPath, __Root } from "@/utils/config";

import dayjs from "@/utils/day";
import authorItem from "@/components/common/face-body/author";

// 引入公共组件
import SingleNavigation from "@/components/common/face-body/SingleNavigation.vue";
import SingleHeader from "@/components/common/face-body/SingleHeader.vue";
import SingleCarousel from "@/components/common/face-body/SingleCarousel.vue";
import SinglePaySection from "@/components/common/face-body/SinglePaySection.vue";
import SingleRandomList from "@/components/common/face-body/SingleRandomList.vue";

const { bodyMap } = bodyData;

export default {
    name: "single",
    components: {
        PublicNotice,
        facedata,
        CommonComment,
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
            isEditor: User.isEditor(),
            topic_info: null,
            newFaceMap: ["写意", "写实"],
        };
    },
    computed: {
        publish_link() {
            return publishLink("face");
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
        facedata: function () {
            const data = this.post?.data || "";
            try {
                return data.indexOf("\\") > -1 ? JSON.parse(data) : data;
            } catch (e) {
                console.error("解析 facedata 失败:", e);
                return data;
            }
        },
        previewSrcList: function () {
            return this.post?.images || [];
        },
        canEdit: function () {
            return User.isEditor() || this.post?.user_id == User.getInfo().uid;
        },
        canBuy: function () {
            return this.post.price_type && this.post.price_type != 0 && !this.has_buy;
        },
        priceText: function () {
            if (this.post.price_type == 1) return `售价：${this.post.price_count} 盒币`;
            if (this.post.price_type == 2) return `售价：${this.post.price_count} 金箔`;
            return "";
        },
        status: function () {
            return this.$store.state.faceSingle?.status || 1;
        },
        statusText: function () {
            return this.status !== 1 ? "上架" : "下架";
        },
        isStar: function () {
            return this.$store.state.faceSingle?.star || 0;
        },
        starText: function () {
            return this.isStar ? "取消精选" : "精选";
        },
        topicText() {
            return this.topic_info ? `${dayjs.tz(this.topic_info.created_at).format("YYYY年MM月DD日")}荣登头条` : "";
        },
        faceAllData() {
            return {
                json: this.facedata,
                object: JSON.parse(this.facedata),
                type: "face",
            };
        },
    },
    created: function () {
        this.getData();
    },
    methods: {
        goBack() {
            document.title = "捏脸分享 - JX3BOX";
            this.$router.push({ name: "list" });
        },
        getData() {
            if (this.id) {
                this.loading = true;
                getOneFaceInfo(this.id)
                    .then((res) => {
                        this.post = this.$store.state.faceSingle = res.data.data;
                        document.title = this.post.title;

                        this.getAccessoryList();
                        this.getRandomFaceList();
                        this.getSliders();
                    })
                    .catch((err) => {
                        this.loading = false;
                    });

                getStat("face", this.id).then((res) => {
                    this.stat = res.data;
                });
                postStat("face", this.id);
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
            getDownUrl(this.id, item.uuid).then((res) => {
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
            if (this.post.code_mode) {
                navigator.clipboard.writeText(this.post.code).then(() => {
                    this.$notify({
                        title: "复制成功",
                        message: "内容：" + this.post.code,
                        type: "success",
                    });
                });
            } else {
                if (this.downFileList.length === 1) {
                    const item = this.downFileList[0];
                    this.handleDownloadFile(item);
                    return;
                }
                const urlArr = [];
                this.downFileList.forEach((item) => {
                    urlArr.push(getDownUrl(this.id, item.uuid));
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
                    downloadZip(downloadFiles, `face_${this.id}.zip`, "url", "name");
                });
            }
        },
        facePay() {
            if (!User.isLogin()) {
                User.toLogin();
                return;
            }
            this.$confirm("确认购买此捏脸？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    let res = this.post;
                    let params = {
                        postType: "face",
                        PostId: res.id,
                        priceType: res.price_type,
                        priceCount: res.price_count,
                        accessUserId: res.user_id,
                        payUserId: User.getInfo().uid,
                    };
                    this.payBtnLoading = true;
                    payFace(params)
                        .then((res) => {
                            let payid = res.data.data.id;
                            this.pollPayStatus(payid);
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
        pollPayStatus(payid) {
            loopPayStatus(payid)
                .then((d) => {
                    const status = d.data.data.pay_status;
                    if (status === 1 || status === 2) {
                        this.getPayFaceStatus(status);
                    } else {
                        setTimeout(() => this.pollPayStatus(payid), 1000);
                    }
                })
                .catch(() => {
                    setTimeout(() => this.pollPayStatus(payid), 1000);
                });
        },
        getPayFaceStatus(pay_status) {
            if (pay_status == 1) {
                this.payBtnLoading = false;
                this.getData();
                this.$notify.success({
                    title: "成功",
                    message: "购买成功",
                });
            } else if (pay_status == 2) {
                this.payBtnLoading = false;
                this.$notify.error({
                    title: "失败",
                    message: "支付失败",
                });
            }
        },
        getRandomFaceList() {
            const { user_id } = this.post;
            const listWidth = this.$refs.singleRef?.clientWidth - 120;
            const limit = Math.floor(listWidth / 190);
            getRandomFace({ user_id, limit }).then((res) => {
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
        copy(txt) {
            navigator.clipboard.writeText(txt).then(() => {
                this.$notify({
                    title: "复制成功",
                    message: txt + "",
                    type: "success",
                });
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/single.less";
</style>
