<!--
 * @Author: zhusha
 * @Date: 2025-02-17 23:22:35
 * @LastEditors: zhusha
 * @LastEditTime: 2025-03-31 19:30:14
 * @Description: 小程序捏脸详情
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <div class="p-body-detail" v-loading="loading">
        <SuspendCommon
            :btnOptions="{showHome:true}"
            :drawerOptions="{
            hideType:['report','rss','search'],
            author:{
                name:post.author_name,
                avatar:post.user_avatar,
                author_id:post.user_id
            },
            title:post.title,
            postType:'face',
            id:id
            }"
            @search="search"
            v-if="$route.query?.disabled!='true'"
        >
            <template #default>
                <div class="u-copy" @click="showFaceData=true">
                    <img class="u-copy-icon" src="@/assets/img/pvxsuspension/copy_touchbar.svg" svg-inline />复制体型码
                </div>
            </template>
        </SuspendCommon>
        <el-drawer :visible.sync="showFaceData" direction="btt"  :with-header="false" custom-class="u-drawer" :modal-append-to-body="false" append-to-body class="p-drawer-suspend">
            <div class="m-face-data_copy">
                <div class="u-copy-box" v-if="post.code_mode">
                    <div class="u-copy-top">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/copy_touchbar_120.svg" svg-inline />
                        <div class="u-label">复制体型码</div>
                    </div>

                    <div class="u-number">{{ post.code }}</div>
                    <div class="u-copy-btn" @click="copy">复制</div>
                </div>
                <div class="u-data-box" v-else>
                    <div class="u-copy-top">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/report.svg" svg-inline />
                        <div class="u-label">非体型码作品，无法直接复制</div>
                    </div>
                    <div class="u-no-data-btn" @click="goTobBodydatMobile()">查看体型数据</div>
                </div>

            </div>
        </el-drawer>
        <div class="m-body-detail_top">
            <el-carousel height="500px">
                <el-carousel-item v-for="(item, i) in previewSrcList" :key="i">
                    <div class="u-img_item">
                        <img :src="showPic(item)" />
                    </div>
                </el-carousel-item>
            </el-carousel>
            <!-- 作品名称/作者-->
            <div class="u-body_info">
                <div class="u-body_name">{{ post.title || "无标题" }}</div>
                <div class="u-body_author">{{ post.display_name }}</div>
            </div>
        </div>
        <div class="m-tags">
            <div class="u-tag purple" v-if="!!post.star">★ 编辑推荐</div>

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
        <div class="m-warning">
            <img src="@/assets/img/face/mobile/warning.svg" class="u-img" />
            <img src="@/assets/img/face/mobile/warning-dark.svg" class="u-img-dark" />
            <div class="u-text">小程序暂时不支持[非体型码]作品数据下载</div>
        </div>

        <!-- 捏脸码 -->
        <div class="m-body-number" v-if="post.code_mode" @click="copy">
            <div class="u-title">
                <img src="@/assets/img/face/mobile/copy.svg" />
                <div class="u-text">体型码</div>
            </div>
            <div class="u-number">{{ post.code_mode }}</div>
        </div>
        <!-- 捏脸数据 -->
        <div class="m-body-data" v-else @click="goTobBodydatMobile()">
            <div class="u-text">体型数据</div>
            <img src="@/assets/img/face/mobile/CaretLeft.svg" class="u-img" />
            <img src="@/assets/img/face/mobile/CaretLeft-dark.svg" class="u-img-dark" />
        </div>
        <!-- 关于作者 -->
        <div class="m-body-author">
            <div class="u-title">关于作者</div>
            <img :src="showAvatar(post.user_avatar, 335)" />
            <div class="u-info-box">
                <div class="u-author">
                    <div class="u-author_name">{{ post.author_name }}</div>
                    <div class="u-author_vermicelli">{{ fans }}个粉丝</div>
                </div>
                <div class="u-follow" @click="follow" v-if="!subscribed">关注TA</div>
                <div class="u-follow" @click="unfollow" v-else>取消关注</div>
            </div>
            <div class="u-author_introduce" v-if="userInfo.user_bio">{{ userInfo.user_bio }}</div>
        </div>
        <!-- 其他作品 -->
        <div class="m-body-author_other"  v-if="randomList.length === 0">
            <div class="u-title">{{ post.display_name }}其他作品</div>

            <div class="u-other_list">
                <routine_other :list="randomList" :isNumber="true" type="body"></routine_other>
            </div>
        </div>
    </div>
</template>

<script>
import wx from "weixin-js-sdk";
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
import routine_other from "@/components/face/mobile/routine_other";
import { getOneBodyInfo, getRandomBody } from "@/service/body";
import { getFans, getUserInfo } from "@/service/face/author";
import { showAvatar, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { subscribeAuthor, unsubscribeAuthor } from "@jx3box/jx3box-common/js/rss.js";
import { __clients, __imgPath, __Root } from "@/utils/config";
import { bodyMap } from "@jx3box/jx3box-data/data/role/body.json";
export default {
    components: { routine_other,SuspendCommon },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        previewSrcList: function () {
            return this.post?.images || [];
        },
        bodydata: function () {
            const data = this.post?.data || "";
            const bodyData = {
                object: {},
            };
            try {
                if (data) {
                    bodyData.object = JSON.parse(JSON.parse(data));
                } else {
                    bodyData.object = data;
                }
            } catch {
                bodyData.object = JSON.parse(data);
            }
            return bodyData;
        },
    },
    data() {
        return {
            loading: false,
            post: {},
            randomList: [],
            client_map: __clients,
            userInfo: {},
            fans: 0,
            subscribed: false,
            showFaceData:false,
        };
    },
    created() {
        this.getData();
    },
    mounted() { },
    methods: {
        search(){
            wx.miniProgram.navigateTo({ url: `/pages/search/search-detail/search-detail?app=体型&filter_name=pvxbody` });
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
                getOneBodyInfo(this.id)
                    .then((res) => {
                        this.post = res.data.data;
                        document.title = this.post.title;
                        //获取作者作品 和 系统推荐作品
                        this.getRandombodyList();
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
        getRandombodyList() {
            const { user_id } = this.post;
            getRandomBody({
                user_id,
                list: 8,
            }).then((res) => {
                if (res.data.data.list && res.data.data.list.length > 0) {
                    this.randomList = res.data.data.list;

                }
            });
        },
        copy() {
            navigator.clipboard.writeText(this.post.code_mode).then(() => {
                this.$notify({
                    title: "复制成功",
                    message: "内容：" + this.post.code_mode,
                    type: "success",
                });
            });
        },
        goTobBodydatMobile() {
            //session缓存捏脸数据
            sessionStorage.setItem("bodyData", JSON.stringify(this.bodydata));
            this.$router.push({
                name: `bodydatMobile`,
            });
        },
    },
};
</script>

<style lang="less">
@nameColor: #1c1c1c;
@nameColor-dark: #fff;
@fontBgColor: #fff;
@fontBgColor-dark: #282828;
@fontColor: rgba(28, 28, 28, 0.8);
@fontColor2: rgba(28, 28, 28, 0.4);
@fontColor-dark: rgba(255, 255, 255, 0.8);
@fontColor-dark2: rgba(255, 255, 255, 0.4);
@btnBgColor: #24292e;
@btnBgColor-dark: #fedaa3;
.m-face-data_copy{
    .w(100%);

    .u-copy-box,.u-data-box{
        .w(100%);
        .flex;
        .flex(o);
        flex-direction: column;
        gap:1.25rem;
        .u-copy-top{
            .flex;
            .flex(o);
            flex-direction: column;
        }
    }
    .u-label{
        color: rgba(255, 255, 255, 0.40);
        .fz(0.875rem,1.25rem);
        .bold(700);
    }
    .u-number{
        .w(100%);
        .flex;
        padding: 1rem;
        align-items: flex-start;
        gap: 0.25rem;
        align-self: stretch;
        .r(0.75rem);
        background: #FF7991;
        box-sizing: border-box;
        color: @fontBgColor;

        .fz(0.75rem,1.125rem);
        .bold(700);
    }
    .u-copy-btn{
        .flex;
        .flex(o);
        padding: 0.75rem 1rem;
        gap: 0.5rem;
        align-self: stretch;
        .r(0.75rem);
        background: #FEDAA3;
        .fz(0.875rem,1.25rem);
        .bold(700);
    }
    .u-no-data-btn{
        .flex;
        .flex(o);
        padding: 0.75rem 1rem;
        gap: 0.5rem;
        align-self: stretch;
        .r(0.75rem);
        background: rgba(255, 255, 255, 0.10);
        color: rgba(255, 255, 255, 0.40);
        .fz(0.875rem,1.25rem);
        .bold(700);
    }
}
.p-body-detail {
    height: 100vh;
    background-color: #fafafa;
    overflow: auto;
    .pb(3.5rem);
    box-sizing: border-box;
    .u-copy-icon{
        .size(1.5rem,1.5rem);
        svg, path {
            fill: #fedaa3;
            stroke: #fedaa3;
        }
    }

    .m-base{
        .w(100%);
        .u-copy{
            .w(100%);
            .flex;
            .flex(o);
            gap:0.75rem;
        }
    }

    .m-body-detail_top {
        .pr;
        overflow: hidden;
        .u-img_item {
            .size(100%, 500px);
            .pr;
            &::before {
                content: "";
                .pa;
                .size(100%, 100%);
                .lt(0);
                .dbi;
                .z(1);
                background: linear-gradient(180deg, #F8F8F8 0.04%,rgba(248,248,248, 0.00) 30%, rgba(248,248,248, 0.00) 70%, #FAFAFA 100%);
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

        .u-body_info {
            .pa;
            .z(2);
            .lb(1.111rem,0.333rem);

            .u-body_name {
                color: @nameColor;
                .fz(0.889rem, 1.333rem);
                .bold(700);
            }

            .u-body_author {
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
                color: @nameColor-dark;
            }

            &.mint {
                background: #23abe5;
                color: @nameColor-dark;
            }

            &.purple {
                background: #af52de;
                color: @nameColor-dark;
            }

            &.new {
                background: #ff72af;
                color: @nameColor-dark;
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

    .m-body-data {
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

    .m-body-number {
        margin: 0 1.111rem 0.889rem 1.111rem;
        padding: 0.889rem;
        .r(0.667rem);
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 100%), #79CEFF;
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

    .m-body-author {
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

            .u-author_name {
                color: @fontColor;
                .fz(0.778rem, 1.111rem);
                .bold(700);
            }

            .u-author_vermicelli {
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
                color: @btnBgColor-dark;
                .fz(0.556rem, 0.889rem);
            }
        }

        .u-author_introduce {
            color: @fontColor2;
            .fz(0.667rem, 1rem);
            .bold(400);
            padding: 0 0.889rem 0.889rem 0.889rem;
        }
    }

    .m-body-author_other {
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

        .u-img_item {
            .pr;

            &::before {
                content: "";
                .pa;
                .size(100%);
                .lt(0);
                .dbi;
                .z(1);
                background: linear-gradient(180deg, #FFF 0.04%, rgba(250, 250, 250, 0.00) 49.5%, #FAFAFA 99.96%);
            }
        }

        .u-other_list {
            padding: 0 0.889rem;
        }
    }

    // dark模式利用宽度模拟覆盖
    // @media screen and (width: 390px)
    @media (prefers-color-scheme: dark) {
        background-color: #000;

        .m-body-detail_top {
            .u-img_item {
                &::before {
                    background: linear-gradient(180deg, #1C1C1C 0.04%,rgba(0,0,0, 0.00) 20%, rgba(0,0,0, 0.00) 80%, #000000 100%);
                }
            }

            .u-body_info {
                .u-body_name {
                    color: @nameColor-dark;
                }

                .u-body_author {
                    color: @fontColor-dark2;
                }
            }
        }

        .m-tags {
            .u-tag {
                background: @fontBgColor-dark;
                color: @fontColor-dark;
            }
        }

        .m-introduce {
            background-color: @fontBgColor-dark;

            .u-title {
                color: @fontColor-dark2;
            }

            .u-content {
                color: @fontColor-dark;
            }
        }

        .m-warning {
            background-color: @fontBgColor-dark;
            color: @fontColor-dark2;

            .u-img {
                display: none;
            }

            .u-img-dark {
                display: block;
            }
        }

        .m-body-data {
            background-color: @fontBgColor-dark;
            color: @fontColor-dark;

            .u-img {
                display: none;
            }

            .u-img-dark {
                display: block;
            }
        }

        .m-body-author {
            background-color: @fontBgColor-dark;

            .u-info-box {
                .u-author_name {
                    color: @fontColor-dark;
                }

                .u-author_vermicelli {
                    color: @fontColor-dark2;
                }

                .u-follow {
                    background: @btnBgColor-dark;
                    color: @btnBgColor;
                }
            }

            .u-author_introduce {
                color: @fontColor-dark2;
            }
        }

        .m-body-author_other {
            background-color: @fontBgColor-dark;

            .u-title {
                color: @fontColor-dark2;
            }

            .u-img_item {
                &::before {
                    background: linear-gradient(180deg, #1C1C1C 0.04%, rgba(0, 0, 0, 0.00) 49.5%, #000 99.96%);
                }
            }
        }
    }
}
</style>
