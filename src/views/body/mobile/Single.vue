<!--
 * @Author: zhusha 
 * @Date: 2025-02-17 23:22:35
 * @LastEditors: zhusha
 * @LastEditTime: 2025-02-20 23:57:58
 * @Description: 小程序捏脸详情
 * 
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved. 
-->
<template>
    <div class="p-body-detail" v-loading="loading">
        <div class="m-body-detail_top">
            <el-carousel height="375px">
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
            <div class="u-tag" v-if="!!post.star">★ 编辑推荐</div>
            <div class="u-tag" v-if="!!post.is_fr">首发</div>
            <div class="u-tag" v-if="!!post.original">原创</div>
            <div class="u-tag">{{ showClientLabel(post.client) }}</div>
            <div class="u-tag">{{ newbodyMap[post.is_new_body] }}</div>
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
            <div class="u-text">小程序暂时不支持[非捏脸码]作品数据下载</div>
        </div>

        <!-- 捏脸码 -->
        <div class="m-body-number" v-if="post.code_mode">
            <div class="u-title">
                <img src="@/assets/img/face/mobile/copy.svg" />
                <div class="u-text">捏脸码</div>
            </div>
            <div class="u-number">{{ post.code_mode }}</div>
        </div>
        <!-- 捏脸数据 -->
        <div class="m-body-data" v-else @click="goTobBodydatMobile()">
            <div class="u-text">捏脸数据</div>
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
            <div class="u-author_introduce">{{ userInfo.user_bio || "暂无介绍" }}</div>
        </div>
        <!-- 其他作品 -->
        <div class="m-body-author_other">
            <div class="u-title">{{ post.display_name }}其他作品</div>
            <div class="u-other_list">
                <routine_other :list="randomList"></routine_other>
            </div>
        </div>
    </div>
</template>

<script>
import routine_other from "@/components/body/mobile/routine_other";
import { getOneBodyInfo, getRandomBody } from "@/service/body";
import { getFans, getUserInfo } from "@/service/face/author";
import { showAvatar, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { subscribeAuthor, unsubscribeAuthor } from "@jx3box/jx3box-common/js/rss.js";
import { __clients, __imgPath, __Root } from "@jx3box/jx3box-common/data/jx3box.json";
import { bodyMap } from "@jx3box/jx3box-data/data/role/body.json";
export default {
    components: { routine_other },
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
            newbodyMap: ["写意", "写实"],
            userInfo: {},
            fans: 0,
            subscribed: false,
        };
    },
    created() {
        this.getData();
    },
    mounted() {},
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
                getOneBodyInfo(this.id)
                    .then((res) => {
                        this.post = res.data.data;
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
                    console.log(this.randomList);
                }
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
.p-body-detail {
    height: 100vh;
    background-color: #f5f5f5;
    overflow: auto;
    .m-body-detail_top {
        .pr;
        .u-img_item {
            .size(100%,375px);

            overflow: hidden;
            .pr;
            &::before {
                content: "";
                .pa;
                .size(100%,100%);
                .lt(0);
                .dbi;
                .z(1);
                background: linear-gradient(180deg, rgba(250, 250, 250, 0) 44.67%, #fafafa 100%);
            }
            img {
                .size(100%,100%);
                object-fit: cover;
            }
        }

        .el-carousel__indicators {
            &.el-carousel__indicators--horizontal {
                right: 0;
                left: unset;
            }
            .el-carousel__indicator {
                .el-carousel__button {
                    .size(8px,8px);
                    .r(8px);
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
            .lb(20px,6px);
            .u-body_name {
                color: @nameColor;
                .fz(16px,24px);
                .bold(700);
            }

            .u-body_author {
                color: rgba(28, 28, 28, 0.4);
                .fz(12px,18px);
                .bold(400);
            }
        }
    }
    .m-tags {
        .flex;
        padding: 14px 20px;
        box-sizing: border-box;
        gap: 4px;
        align-items: center;
        align-self: stretch;
        .u-tag {
            padding: 4px 8px;
            .flex;
            .flex(o);
            .r(8px);
            border: 1px solid rgba(40, 40, 40, 0.05);
            background: @fontBgColor;
            color: @fontColor;
            .fz(10px,15px);
            .bold(400);
        }
    }
    .m-introduce {
        border: 1px solid rgba(40, 40, 40, 0.05);
        padding: 16px;
        .r(12px);
        background-color: @fontBgColor;
        margin: 0 20px 16px 20px;
        box-sizing: border-box;
        .u-title {
            color: @fontColor2;
            .fz(12px,18px);
            .bold(400);
            .mb(4px);
        }
        .u-content {
            color: @fontColor;
            .fz(14px,20px);
            .bold(400);
        }
    }
    .m-warning {
        .flex;
        gap: 12px;
        align-items: center;
        margin: 0 20px 16px 20px;
        padding: 16px;
        .r(12px);
        background-color: @fontBgColor;
        color: @fontColor2;
        .fz(14px,20px);
        .bold(400);
        .u-img-dark {
            display: none;
        }
    }
    .m-body-data {
        .flex;
        justify-content: space-between;
        align-items: center;
        margin: 0 20px 16px 20px;
        padding: 16px;
        .r(12px);
        background-color: @fontBgColor;
        color: @fontColor;
        .fz(16px,24px);
        .bold(700);
        .u-img-dark {
            display: none;
        }
    }
    .m-body-number {
        margin: 0 20px 16px 20px;
        padding: 16px;
        .r(12px);
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 100%), #ff7991;
        color: #fff;
        .fz(12px,18px);
        .u-title {
            .flex;
            gap: 2px;
            align-items: center;
            .bold(400);
            .mb(4px);
        }
        .u-number {
            .bold(700);
        }
    }
    .m-body-author {
        margin: 0 20px 16px 20px;
        background-color: @fontBgColor;
        .pr;
        .r(12px);
        overflow: hidden;
        &::before {
            content: "";
            .pa;
            .size(100%,150px);
            .lt(0);
            .dbi;
            .z(1);
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
        }
        .u-title {
            .pa;
            .lt(16px);
            .fz(12px,18px);
            .bold(700);
            .z(2);
            color: #fff;
        }
        img {
            .size(100%,140px);
            object-fit: cover;
        }
        .u-info-box {
            .flex;
            justify-content: space-between;
            padding: 12px 16px;
            .u-author_name {
                color: @fontColor;
                .fz(14px,20px);
                .bold(700);
            }
            .u-author_vermicelli {
                color: @fontColor2;
                .fz(10px,15px);
                .bold(400);
            }
            .u-follow {
                .flex;
                .flex(o);
                padding: 4px 8px;
                .r(8px);
                background: @btnBgColor;
                color: @btnBgColor-dark;
                .fz(10px,15px);
            }
        }
        .u-author_introduce {
            color: @fontColor2;
            .fz(12px,18px);
            .bold(400);
            padding: 0 16px 16px 16px;
        }
    }
    .m-body-author_other {
        margin: 0 20px 16px 20px;
        background-color: @fontBgColor;
        .pb(16px);
        .r(12px);
        .u-title {
            color: @fontColor;
            .fz(12px,18px);
            .bold(700);
            padding: 16px 16px 12px 16px;
        }
        .u-other_list {
            padding: 0 16px;
        }
    }
    // dark模式利用宽度模拟覆盖
    @media screen and (width: 390px) {
        background-color: #000;
        .m-body-detail_top {
            .u-body_info {
                .u-body_name {
                    color: @nameColor-dark;
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
        }
    }
    @media (prefers-color-scheme: dark) {
        // dark模式覆盖
    }
}
</style>
