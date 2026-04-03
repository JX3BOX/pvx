<!--
 * @Author: zhusha
 * @Date: 2025-02-17 23:22:35
 * @LastEditors: zhusha
 * @LastEditTime: 2026-03-18 11:10:56
 * @Description: 小程序捏脸详情
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <div class="p-face-detail" v-loading="loading">
        <SuspendCommon :btnOptions="{ showHome: true }" :drawerOptions="{
            hideType: ['report', 'rss', 'search'],
            author: {
                name: post.author_name,
                avatar: post.user_avatar,
                author_id: post.user_id,
            },
            title: post.title,
            postType: 'face',
            id: id,
        }" @search="search" v-if="$route.query?.disabled != 'true'">
            <template #default>
                <div class="u-copy" @click="showFaceData = true">
                    <img class="u-copy-icon" src="@/assets/img/pvxsuspension/copy_touchbar.svg" svg-inline />复制捏脸码
                </div>
            </template>
        </SuspendCommon>
        <el-drawer v-model="showFaceData" direction="btt" :with-header="false" :modal-append-to-body="false"
            append-to-body class="c-drawer">
            <div class="m-face-data-copy">
                <div class="u-copy-box" v-if="post.code_mode">
                    <div class="u-copy-top">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/copy_touchbar_120.svg" svg-inline />
                        <div class="u-label">复制捏脸码</div>
                    </div>

                    <div class="u-number">{{ post.code }}</div>
                    <div class="u-copy-btn" @click="copy">复制</div>
                </div>
                <div class="u-data-box" v-else>
                    <div class="u-copy-top">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/report.svg" svg-inline />
                        <div class="u-label">非捏脸码作品，无法直接复制</div>
                    </div>
                    <div class="u-no-data-btn" @click="goToFaceDataMobile()">查看捏脸数据</div>
                </div>
            </div>
        </el-drawer>
        <!--        复制捏脸码相关弹窗-->
        <!--        <PvxSuspension isType='single' type="face" :id="id" :title="post.title" :miniprogram="{app:'捏脸',filter_name:'pvxface'}"/>-->
        <div class="m-face-detail-top">
            <el-carousel height="550px">
                <el-carousel-item v-for="(item, i) in previewSrcList" :key="i">
                    <div class="u-img-item">
                        <img :src="showPic(item)" />
                    </div>
                </el-carousel-item>
            </el-carousel>
            <!-- 作品名称/作者-->
            <div class="u-face-info">
                <div class="u-face-name">{{ post.title || "无标题" }}</div>
                <div class="u-face-author">{{ post.display_name }}</div>
            </div>
        </div>
        <div class="m-tags">
            <div class="u-tag purple" v-if="!!post.star">★ 编辑推荐</div>
            <div class="u-tag" :class="post.is_new_face ? 'green' : 'mint'">{{ newFaceMap[post.is_new_face] }}</div>
            <div class="u-tag" v-if="!!post.is_fr">首发</div>
            <div class="u-tag" v-if="!!post.original">原创</div>
            <div class="u-tag">{{ showClientLabel(post.client) }}</div>
            <div class="u-tag" v-if="post.body_type">{{ showBodyTypeLabel(post.body_type) }}</div>
        </div>
        <!-- 介绍 -->
        <div class="m-introduce" v-if="post.remark">
            <div class="u-title">介绍</div>
            <div class="u-content">{{ post.remark }}</div>
        </div>
        <!-- warning -->
        <div class="m-warning" v-if="!post.code_mode">
            <img src="@/assets/img/common/face-body/mobile/warning.svg" class="u-img" />
            <img src="@/assets/img/common/face-body/mobile/warning-dark.svg" class="u-img-dark" />
            <div class="u-text">小程序暂时不支持[非捏脸码]作品数据下载</div>
        </div>

        <!-- 捏脸码 -->
        <div class="m-face-number" v-if="post.code_mode" @click="copy">
            <div class="u-title">
                <img src="@/assets/img/common/face-body/mobile/copy.svg" />
                <div class="u-text">捏脸码</div>
            </div>
            <div class="u-number">{{ post.code }}</div>
        </div>
        <!-- 捏脸数据 -->
        <div class="m-face-data" v-else @click="goToFaceDataMobile()">
            <div class="u-text">捏脸数据</div>
            <img src="@/assets/img/common/face-body/mobile/CaretLeft.svg" class="u-img" />
            <img src="@/assets/img/common/face-body/mobile/CaretLeft-dark.svg" class="u-img-dark" />
        </div>
        <!-- 关于作者 -->
        <div class="m-face-author">
            <div class="u-title">关于作者</div>
            <img :src="showAvatar(post.user_avatar, 335)" />
            <div class="u-info-box">
                <div class="u-author">
                    <div class="u-author-name">{{ post.author_name }}</div>
                    <div class="u-author-vermicelli">{{ fans }}个粉丝</div>
                </div>
                <div class="u-follow" @click="follow" v-if="!subscribed">关注TA</div>
                <div class="u-follow" @click="unfollow" v-else>取消关注</div>
            </div>
            <div class="u-author-introduce" v-if="userInfo.user_bio">{{ userInfo.user_bio }}</div>
        </div>
        <!-- 其他作品 -->
        <div class="m-face-author-other" v-if="randomList.length > 0">
            <div class="u-title">{{ post.display_name }}其他作品</div>
            <!--            <div class="u-img_item" v-if="randomList.length === 0">-->
            <!--                <img src="@/assets/img/face/mobile/empty.png" />-->
            <!--            </div>-->

            <div class="u-other-list">
                <routine_other :list="randomList" :isNumber="true"></routine_other>
            </div>
        </div>
    </div>
</template>

<script>
import wx from "weixin-js-sdk";
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";

import routine_other from "@/components/common/face-body/mobile/routine_other";
import { getOneFaceInfo, getRandomFace } from "@/service/face";
import { getFans, getUserInfo } from "@/service/face/author";
import { showAvatar, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { subscribeAuthor, unsubscribeAuthor } from "@jx3box/jx3box-common/js/rss.js";
import { __clients, __imgPath, __Root } from "@/utils/config";
import bodyData from "@jx3box/jx3box-data/data/role/body.json";
const { bodyMap } = bodyData;
export default {
    components: { SuspendCommon, routine_other },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        previewSrcList: function () {
            return this.post?.images || [];
        },
        facedata: function () {
            const data = this.post?.data || "";
            return data.indexOf("\\") > -1 ? JSON.parse(data) : data;
        },
        faceAllData() {
            return {
                json: this.facedata,
                object: JSON.parse(this.facedata),
                type: "face",
            };
        },
    },
    data() {
        return {
            loading: false,
            post: {},
            randomList: [],
            client_map: __clients,
            newFaceMap: ["写意", "写实"],
            userInfo: {},
            fans: 0,
            subscribed: false,

            showFaceData: false,
        };
    },
    created() {
        this.getData();
    },
    mounted() { },
    methods: {
        search() {
            wx.miniProgram.navigateTo({
                url: `/pages/search/search-detail/search-detail?app=捏脸&filter_name=pvxface`,
            });
        },
        showAvatar,
        showPic(url) {
            return resolveImagePath(url);
        },
        showClientLabel: function (val) {
            return this.client_map[val];
        },
        showBodyTypeLabel(val) {
            return bodyMap[val];
        },
        getData() {
            if (this.id) {
                this.loading = true;
                getOneFaceInfo(this.id)
                    .then((res) => {
                        this.post = res.data.data;
                        document.title = this.post.title + this.$t("pages.common.appendTitle");
                        //获取作者作品 和 系统推荐作品
                        this.getRandomFaceList();
                        this.getUserInfo();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        },
        getUserInfo() {
            const { user_id } = this.post;
            getUserInfo(user_id).then((res) => {
                this.userInfo = res.data.data;
                this.getFans(user_id);
            });
        },
        getFans(uid) {
            getFans(uid).then((res) => {
                this.fans = res.data.data.total || 0;
                this.subscribed = res.data.data.subscribed || false;
            });
        },
        follow() {
            const { user_id } = this.post;
            subscribeAuthor(user_id).then((res) => {
                this.subscribed = true;
            });
        },
        unfollow() {
            const { user_id } = this.post;
            unsubscribeAuthor(user_id).then((res) => {
                this.subscribed = false;
            });
        },
        //获取随机作品列表
        getRandomFaceList() {
            const { user_id } = this.post;
            getRandomFace({
                user_id,
                list: 8,
            }).then((res) => {
                if (res.data.data.list && res.data.data.list.length > 0) {
                    this.randomList = res.data.data.list;
                }
            });
        },
        copy() {
            navigator.clipboard.writeText(this.post.code).then(() => {
                this.showFaceData = false;

                this.$notify({
                    title: "复制成功",
                    message: "内容：" + this.post.code,
                    type: "success",
                });
            });
        },
        goToFaceDataMobile() {
            //session缓存捏脸数据
            sessionStorage.setItem("faceData", JSON.stringify(this.faceAllData));
            this.$router.push({
                name: `faceDataMobile`,
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/drawer.less";
@nameColor: #1c1c1c;
@nameColorDark: #fff;
@fontBgColor: #fff;
@fontBgColorDark: #282828;
@fontColor: rgba(28, 28, 28, 0.8);
@fontColor2: rgba(28, 28, 28, 0.4);
@fontColorDark: rgba(255, 255, 255, 0.8);
@fontColorDark2: rgba(255, 255, 255, 0.4);
@btnBgColor: #24292e;
@btnBgColorDark: #fedaa3;

.m-face-data-copy {
    .w(100%);

    .u-copy-box,
    .u-data-box {
        .w(100%);
        .flex;
        .flex(o);
        flex-direction: column;
        gap: 1.25rem;

        .u-copy-top {
            .flex;
            .flex(o);
            flex-direction: column;
        }
    }

    .u-label {
        color: rgba(255, 255, 255, 0.4);
        .fz(0.875rem, 1.25rem);
        .bold(700);
    }

    .u-number {
        .w(100%);
        .flex;
        padding: 1rem;
        align-items: flex-start;
        gap: 0.25rem;
        align-self: stretch;
        .r(0.75rem);
        background: #ff7991;
        box-sizing: border-box;
        color: @fontBgColor;

        .fz(0.75rem, 1.125rem);
        .bold(700);
    }

    .u-copy-btn {
        .flex;
        .flex(o);
        padding: 0.75rem 1rem;
        gap: 0.5rem;
        align-self: stretch;
        .r(0.75rem);
        background: #fedaa3;
        .fz(0.875rem, 1.25rem);
        .bold(700);
    }

    .u-no-data-btn {
        .flex;
        .flex(o);
        padding: 0.75rem 1rem;
        gap: 0.5rem;
        align-self: stretch;
        .r(0.75rem);
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.4);
        .fz(0.875rem, 1.25rem);
        .bold(700);
    }
}

.p-face-detail {
    height: 100vh;
    background-color: #fafafa;
    overflow: auto;
    .pb(3.5rem);
    box-sizing: border-box;

    .u-copy-icon {
        .size(1.5rem, 1.5rem);

        svg,
        path {
            fill: #fedaa3;
            stroke: #fedaa3;
        }
    }

    .m-base {
        .w(100%);

        .u-copy {
            .w(100%);
            .flex;
            .flex(o);
            gap: 0.75rem;
        }
    }

    .m-face-detail-top {
        .pr;
        overflow: hidden;

        .u-img-item {
            .size(100%, 550px);
            .pr;

            &::before {
                content: "";
                .pa;
                .size(100%, 100%);
                .lt(0);
                .dbi;
                .z(1);
                background: linear-gradient(180deg,
                        #f8f8f8 0.04%,
                        rgba(248, 248, 248, 0) 30%,
                        rgba(248, 248, 248, 0) 70%,
                        #fafafa 100%);
            }

            img {
                .size(100%, 100%);
                object-fit: cover;
            }
        }

        .el-carousel__indicators {
            height: 2.333rem;

            &.el-carousel__indicators--horizontal {
                right: 0;
                left: unset;
            }

            .el-carousel__indicator {
                .pt(0);

                .el-carousel__button {
                    .size(0.444rem);
                    .r(0.444rem);
                    background-color: rgba(28, 28, 28, 0.4);
                }

                &.is-active {
                    .el-carousel__button {
                        background-color: #1c1c1c;
                    }
                }
            }
        }

        .u-face-info {
            .pa;
            .z(2);
            .lb(1.111rem, 0.333rem);

            .u-face-name {
                color: @nameColor;
                .fz(0.889rem, 1.333rem);
                .bold(700);
            }

            .u-face-author {
                color: rgba(28, 28, 28, 0.4);
                .fz(0.667rem, 1rem);
                .bold(400);
            }
        }
    }

    .m-tags {
        .flex;
        padding: 0.778rem 1.111rem;
        box-sizing: border-box;
        gap: 0.222rem;
        align-items: center;
        align-self: stretch;

        .u-tag {
            padding: 0.222rem 0.444rem;
            .flex;
            .flex(o);
            .r(0.444rem);
            border: 1px solid rgba(40, 40, 40, 0.05);
            background: @fontBgColor;
            color: @fontColor;
            .fz(0.778rem, 0.889rem);
            .bold(400);

            &.green {
                background: #34c759;
                color: @nameColorDark;
            }

            &.mint {
                background: #23abe5;
                color: @nameColorDark;
            }

            &.purple {
                background: #af52de;
                color: @nameColorDark;
            }

            &.new {
                background: #ff72af;
                color: @nameColorDark;
            }
        }
    }

    .m-introduce {
        border: 1px solid rgba(40, 40, 40, 0.05);
        padding: 0.889rem;
        .r(0.667rem);
        background-color: @fontBgColor;
        margin: 0 1.111rem 0.889rem 1.111rem;
        box-sizing: border-box;

        .u-title {
            color: @fontColor2;
            .fz(0.667rem, 1rem);
            .bold(400);
            .mb(0.222rem);
        }

        .u-content {
            color: @fontColor;
            .fz(0.778rem, 1.111rem);
            .bold(400);
        }
    }

    .m-warning {
        .flex;
        gap: 0.667rem;
        align-items: center;
        margin: 0 1.111rem 0.889rem 1.111rem;
        padding: 0.889rem;
        .r(0.667rem);
        background-color: @fontBgColor;
        color: @fontColor2;
        .fz(0.778rem, 1.111rem);
        .bold(400);

        .u-img-dark {
            display: none;
        }
    }

    .m-face-data {
        .flex;
        justify-content: space-between;
        align-items: center;
        margin: 0 1.111rem 0.889rem 1.111rem;
        padding: 0.889rem;
        .r(0.667rem);
        background-color: @fontBgColor;
        color: @fontColor;
        .fz(0.889rem, 1.333rem);
        .bold(700);

        .u-img-dark {
            display: none;
        }
    }

    .m-face-number {
        margin: 0 1.111rem 0.889rem 1.111rem;
        padding: 0.889rem;
        .r(0.667rem);
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 100%), #ff7991;
        color: #fff;
        .fz(0.667rem, 1rem);

        .u-title {
            .flex;
            gap: 0.111rem;
            align-items: center;
            .bold(400);
            .mb(0.222rem);
        }

        .u-number {
            .bold(700);
        }
    }

    .m-face-author {
        margin: 0 1.111rem 0.889rem 1.111rem;
        background-color: @fontBgColor;
        .pr;
        .r(0.667rem);
        overflow: hidden;

        &::before {
            content: "";
            .pa;
            .size(100%, 150px);
            .lt(0);
            .dbi;
            .z(1);
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
        }

        .u-title {
            .pa;
            .lt(0.889rem);
            .fz(0.667rem, 1rem);
            .bold(700);
            .z(2);
            color: #fff;
        }

        img {
            .size(100%, 140px);
            object-fit: cover;
        }

        .u-info-box {
            .flex;
            justify-content: space-between;
            padding: 0.667rem 0.889rem;

            .u-author-name {
                color: @fontColor;
                .fz(0.778rem, 1.111rem);
                .bold(700);
            }

            .u-author-vermicelli {
                color: @fontColor2;
                .fz(0.556rem, 0.889rem);
                .bold(400);
            }

            .u-follow {
                .flex;
                .flex(o);
                padding: 0.222rem 0.444rem;
                .r(0.444rem);
                background: @btnBgColor;
                color: @btnBgColorDark;
                .fz(0.556rem, 0.889rem);
            }
        }

        .u-author-introduce {
            color: @fontColor2;
            .fz(0.667rem, 1rem);
            .bold(400);
            padding: 0 0.889rem 0.889rem 0.889rem;
        }
    }

    .m-face-author-other {
        margin: 0 1.111rem 0.889rem 1.111rem;
        background-color: @fontBgColor;
        .pb(0.889rem);
        .r(0.667rem);

        .u-title {
            color: @fontColor;
            .fz(0.667rem, 1rem);
            .bold(700);
            padding: 0.889rem 0.889rem 0.667rem 0.889rem;
        }

        .u-img-item {
            .pr;

            &::before {
                content: "";
                .pa;
                .size(100%);
                .lt(0);
                .dbi;
                .z(1);
                background: linear-gradient(180deg, #fff 0.04%, rgba(250, 250, 250, 0) 49.5%, #fafafa 99.96%);
            }
        }

        .u-other-list {
            padding: 0 0.889rem;
        }
    }

    // dark模式利用宽度模拟覆盖
    // @media screen and (width: 414px)
    @media (prefers-color-scheme: dark) {
        background-color: #000;

        .m-face-detail-top {
            .u-img-item {
                &::before {
                    background: linear-gradient(180deg,
                            #1c1c1c 0.04%,
                            rgba(0, 0, 0, 0) 20%,
                            rgba(0, 0, 0, 0) 80%,
                            #000000 100%);
                }
            }

            .u-face-info {
                .u-face-name {
                    color: @nameColorDark;
                }

                .u-face-author {
                    color: @fontColorDark2;
                }
            }
        }

        .m-tags {
            .u-tag {
                background: @fontBgColorDark;
                color: @fontColorDark;
            }
        }

        .m-introduce {
            background-color: @fontBgColorDark;

            .u-title {
                color: @fontColorDark2;
            }

            .u-content {
                color: @fontColorDark;
            }
        }

        .m-warning {
            background-color: @fontBgColorDark;
            color: @fontColorDark2;

            .u-img {
                display: none;
            }

            .u-img-dark {
                display: block;
            }
        }

        .m-face-data {
            background-color: @fontBgColorDark;
            color: @fontColorDark;

            .u-img {
                display: none;
            }

            .u-img-dark {
                display: block;
            }
        }

        .m-face-author {
            background-color: @fontBgColorDark;

            .u-info-box {
                .u-author-name {
                    color: @fontColorDark;
                }

                .u-author-vermicelli {
                    color: @fontColorDark2;
                }

                .u-follow {
                    background: @btnBgColorDark;
                    color: @btnBgColor;
                }
            }

            .u-author-introduce {
                color: @fontColorDark2;
            }
        }

        .m-face-author-other {
            background-color: @fontBgColorDark;

            .u-title {
                color: @fontColorDark2;
            }

            .u-img-item {
                &::before {
                    background: linear-gradient(180deg, #1c1c1c 0.04%, rgba(0, 0, 0, 0) 49.5%, #000 99.96%);
                }
            }
        }
    }
}
</style>
