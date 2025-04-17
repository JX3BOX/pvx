<!--
 * @Author: zhusha
 * @Date: 2025-02-17 23:22:35
 * @LastEditors: zhusha
 * @LastEditTime: 2025-03-29 15:26:18
 * @Description: 小程序捏脸详情
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <div class="p-face-detail" v-loading="loading">
        <PvxSuspension isType='single' type="face" :id="id" :title="post.title" :miniprogram="{app:'捏脸',filter_name:'pvxface'}"/>
        <div class="m-face-detail_top">
            <el-carousel height="500px">
                <el-carousel-item v-for="(item, i) in previewSrcList" :key="i">
                    <div class="u-img_item">
                        <img :src="showPic(item)" />
                    </div>
                </el-carousel-item>
            </el-carousel>
            <!-- 作品名称/作者-->
            <div class="u-face_info">
                <div class="u-face_name">{{ post.title || "无标题" }}</div>
                <div class="u-face_author">{{ post.display_name }}</div>
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
            <img src="@/assets/img/face/mobile/warning.svg" class="u-img" />
            <img src="@/assets/img/face/mobile/warning-dark.svg" class="u-img-dark" />
            <div class="u-text">小程序暂时不支持[非捏脸码]作品数据下载</div>
        </div>

        <!-- 捏脸码 -->
        <div class="m-face-number" v-if="post.code_mode" @click="copy">
            <div class="u-title">
                <img src="@/assets/img/face/mobile/copy.svg" />
                <div class="u-text">捏脸码</div>
            </div>
            <div class="u-number">{{ post.code }}</div>
        </div>
        <!-- 捏脸数据 -->
        <div class="m-face-data" v-else @click="goToFaceDataMobile()">
            <div class="u-text">捏脸数据</div>
            <img src="@/assets/img/face/mobile/CaretLeft.svg" class="u-img" />
            <img src="@/assets/img/face/mobile/CaretLeft-dark.svg" class="u-img-dark" />
        </div>
        <!-- 关于作者 -->
        <div class="m-face-author">
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
        <div class="m-face-author_other">
            <div class="u-title">{{ post.display_name }}其他作品</div>
            <div class="u-img_item" v-if="randomList.length === 0">
                <img src="@/assets/img/face/mobile/empty.png" />
            </div>

            <div class="u-other_list">
                <routine_other :list="randomList" :isNumber="true"></routine_other>

            </div>
        </div>
    </div>
</template>

<script>
import PvxSuspension from '@/components/PvxSuspension.vue';
import routine_other from "@/components/face/mobile/routine_other";
import { getOneFaceInfo, getRandomFace } from "@/service/face";
import { getFans, getUserInfo } from "@/service/face/author";
import { showAvatar, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { subscribeAuthor, unsubscribeAuthor } from "@jx3box/jx3box-common/js/rss.js";
import { __clients, __imgPath, __Root } from "@jx3box/jx3box-common/data/jx3box.json";
import { bodyMap } from "@jx3box/jx3box-data/data/role/body.json";
export default {
    components: { PvxSuspension, routine_other },
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
        };
    },
    created() {
        this.getData();
    },
    mounted() { },
    methods: {
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
                        console.log(this.post)
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

.p-face-detail {
    height: 100vh;
    background-color: #fafafa;
    overflow: auto;
    .pb(1.111rem);
    box-sizing: border-box;

    .m-face-detail_top {
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
                background: linear-gradient(180deg, rgba(250, 250, 250, 0) 44.67%, #fafafa 100%);
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

        .u-face_info {
            .pa;
            .z(2);
            .lb(1.111rem,0.333rem);

            .u-face_name {
                color: @nameColor;
                .fz(0.889rem, 1.333rem);
                .bold(700);
            }

            .u-face_author {
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

    .m-face-author_other {
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

        .m-face-detail_top {
            .u-img_item {
                &::before {
                    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000 100%);
                }
            }

            .u-face_info {
                .u-face_name {
                    color: @nameColor-dark;
                }

                .u-face_author {
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

        .m-face-data {
            background-color: @fontBgColor-dark;
            color: @fontColor-dark;

            .u-img {
                display: none;
            }

            .u-img-dark {
                display: block;
            }
        }

        .m-face-author {
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

        .m-face-author_other {
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
