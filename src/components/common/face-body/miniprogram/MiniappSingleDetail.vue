<!--
 * MiniappSingleDetail - 小程序详情页主体组件
 * 
 * @description 用于微信小程序 webview 环境的详情页完整实现，包含图片展示、信息展示、作者信息、其他作品等
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 悬浮操作栏（复制码入口）
 * - 复制码抽屉（支持复制和跳转数据页）
 * - 图片轮播展示
 * - 标签展示（推荐、首发、原创、写实/写意等）
 * - 作品介绍
 * - 作者信息
 * - 其他作品推荐
 * - 支持暗色模式
 * 
 * @props
 * - post: Object - 作品数据对象
 * - type: 'face' | 'body' - 模块类型
 * - randomList: Array - 随机推荐列表
 * - disabled: Boolean - 是否禁用操作
 * - loading: Boolean - 加载状态
 * 
 * @events
 * - go-to-data: 跳转到数据页事件
 * 
 * @styles
 * - 样式文件: assets/css/miniprogram/face-single.less 或 body-single.less
 -->
<template>
    <div class="m-mobile-single-detail" v-loading="loading">
        <!-- 悬浮操作栏 -->
        <SuspendCommon v-if="!disabled" :btnOptions="{ showHome: true }" :drawerOptions="suspendOptions"
            @search="handleSearch">
            <template #default>
                <div class="u-copy" @click="showCodeDrawer = true">
                    <img class="u-copy-icon" src="@/assets/img/pvxsuspension/copy_touchbar.svg" svg-inline />
                    复制{{ typeLabel }}码
                </div>
            </template>
        </SuspendCommon>

        <!-- 复制码抽屉 -->
        <el-drawer v-model="showCodeDrawer" direction="btt" :with-header="false" :modal-append-to-body="false"
            append-to-body class="c-drawer">
            <div class="m-face-data-copy">
                <!-- 有码作品 -->
                <div class="u-copy-box" v-if="post.code_mode">
                    <div class="u-copy-top">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/copy_touchbar_120.svg" svg-inline />
                        <div class="u-label">复制{{ typeLabel }}码</div>
                    </div>
                    <div class="u-number">{{ post.code }}</div>
                    <div class="u-copy-btn" @click="handleCopy">复制</div>
                </div>
                <!-- 无码作品 -->
                <div class="u-data-box" v-else>
                    <div class="u-copy-top">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/report.svg" svg-inline />
                        <div class="u-label">非{{ typeLabel }}码作品，无法直接复制</div>
                    </div>
                    <div class="u-no-data-btn" @click="handleGoToData">查看{{ typeLabel }}数据</div>
                </div>
            </div>
        </el-drawer>

        <!-- 图片轮播区域 -->
        <div class="m-detail-top">
            <el-carousel :height="carouselHeight">
                <el-carousel-item v-for="(item, i) in imageList" :key="i">
                    <div class="u-img-item">
                        <img :src="showPic(item)" />
                    </div>
                </el-carousel-item>
            </el-carousel>
            <!-- 作品名称/作者 -->
            <div class="u-info">
                <div class="u-name">{{ post.title || "无标题" }}</div>
                <div class="u-author">{{ post.display_name }}</div>
            </div>
        </div>

        <!-- 标签区域 -->
        <div class="m-tags">
            <div class="u-tag purple" v-if="!!post.star">★ 编辑推荐</div>
            <!-- 脸型特有：写实/写意标签 -->
            <template v-if="type === 'face'">
                <div class="u-tag" :class="post.is_new_face ? 'green' : 'mint'">
                    {{ newFaceMap[post.is_new_face] }}
                </div>
            </template>
            <div class="u-tag" v-if="!!post.is_fr">首发</div>
            <div class="u-tag" v-if="!!post.original">原创</div>
            <div class="u-tag">{{ showClientLabel(post.client) }}</div>
            <div class="u-tag" v-if="post.body_type">{{ showBodyTypeLabel(post.body_type) }}</div>
        </div>

        <!-- 介绍区域 -->
        <div class="m-introduce" v-if="post.remark">
            <div class="u-title">介绍</div>
            <div class="u-content">{{ post.remark }}</div>
        </div>

        <!-- 警告提示 -->
        <div class="m-warning" v-if="showWarning">
            <img src="@/assets/img/common/face-body/mobile/warning.svg" class="u-img" />
            <img src="@/assets/img/common/face-body/mobile/warning-dark.svg" class="u-img-dark" />
            <div class="u-text">小程序暂时不支持[非{{ typeLabel }}码]作品数据下载</div>
        </div>

        <!-- 码/数据入口 -->
        <div :class="['m-number-card', type === 'face' ? 'm-face-number' : 'm-body-number']" v-if="post.code_mode"
            @click="handleCopy">
            <div class="u-title">
                <img src="@/assets/img/common/face-body/mobile/copy.svg" />
                {{ typeLabel }}码
            </div>
            <div class="u-number">{{ post.code }}</div>
        </div>
        <div class="m-data-entry" v-else @click="handleGoToData">
            <div class="u-text">{{ typeLabel }}数据</div>
            <img src="@/assets/img/common/face-body/mobile/CaretLeft.svg" class="u-img" />
            <img src="@/assets/img/common/face-body/mobile/CaretLeft-dark.svg" class="u-img-dark" />
        </div>

        <!-- 关于作者 -->
        <div class="m-author">
            <div class="u-title">关于作者</div>
            <img :src="showAvatar(post.user_avatar, 335)" />
            <div class="u-info-box">
                <div class="u-author">
                    <div class="u-name">{{ post.author_name }}</div>
                    <div class="u-fans">{{ fans }}个粉丝</div>
                </div>
                <div class="u-follow" @click="handleToggleFollow">
                    {{ subscribed ? "取消关注" : "关注TA" }}
                </div>
            </div>
            <div class="u-introduce" v-if="userInfo.user_bio">{{ userInfo.user_bio }}</div>
        </div>

        <!-- 其他作品 -->
        <div class="m-author-other" v-if="randomList.length > 0">
            <div class="u-title">{{ post.display_name }}其他作品</div>
            <div class="u-list">
                <routine-other :list="randomList" :isNumber="true" :type="type" />
            </div>
        </div>
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import routineOther from "@/components/common/face-body/miniprogram/routine_other";
import { showAvatar, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getFans, getUserInfo } from "@/service/face/author";
import { subscribeAuthor, unsubscribeAuthor } from "@/service/common/suspend";
import { __clients } from "@/utils/config";
import bodyData from "@jx3box/jx3box-data/data/role/body.json";
import wx from "weixin-js-sdk";

const { bodyMap } = bodyData;

/**
 * MiniappSingleDetail - 小程序详情页主体组件
 * 用于脸型/体型小程序详情页展示
 */
export default {
    name: "MiniappSingleDetail",
    components: { SuspendCommon, routineOther },
    props: {
        // 文章数据
        post: {
            type: Object,
            default: () => ({}),
        },
        // 类型标识
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
        // 随机推荐列表
        randomList: {
            type: Array,
            default: () => [],
        },
        // 是否禁用悬浮操作栏
        disabled: {
            type: Boolean,
            default: false,
        },
        // 加载状态
        loading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showCodeDrawer: false,
            userInfo: {},
            fans: 0,
            subscribed: false,
            client_map: __clients,
            newFaceMap: ["写意", "写实"],
        };
    },
    computed: {
        // 类型标签
        typeLabel() {
            return this.type === "face" ? "脸型" : "体型";
        },
        // 轮播高度
        carouselHeight() {
            return this.type === "face" ? "550px" : "500px";
        },
        // 图片列表
        imageList() {
            return this.post?.images || [];
        },
        // 是否显示警告
        showWarning() {
            return !this.post.code_mode;
        },
        // 悬浮操作栏配置
        suspendOptions() {
            return {
                hideType: ["report", "rss", "search"],
                author: {
                    name: this.post.author_name,
                    avatar: this.post.user_avatar,
                    author_id: this.post.user_id,
                },
                title: this.post.title,
                postType: this.type,
                id: this.post.id,
            };
        },
    },
    watch: {
        // 监听 post 变化获取作者信息
        "post.user_id": {
            handler(val) {
                if (val) this.loadAuthorInfo(val);
            },
            immediate: true,
        },
    },
    methods: {
        showAvatar,
        // 显示图片
        showPic(url) {
            return resolveImagePath(url);
        },
        // 显示客户端标签
        showClientLabel(val) {
            return this.client_map[val];
        },
        // 显示体型标签
        showBodyTypeLabel(val) {
            return bodyMap[val];
        },
        // 加载作者信息
        loadAuthorInfo(uid) {
            getUserInfo(uid).then((res) => {
                this.userInfo = res.data.data;
                this.getFans(uid);
            });
        },
        // 获取粉丝数
        getFans(uid) {
            getFans(uid).then((res) => {
                this.fans = res.data.data.total || 0;
                this.subscribed = res.data.data.subscribed || false;
            });
        },
        // 切换关注状态
        handleToggleFollow() {
            const uid = this.post.user_id;
            if (this.subscribed) {
                unsubscribeAuthor(uid).then(() => {
                    this.subscribed = false;
                });
            } else {
                subscribeAuthor(uid).then(() => {
                    this.subscribed = true;
                });
            }
        },
        // 复制码
        handleCopy() {
            navigator.clipboard.writeText(this.post.code).then(() => {
                this.showCodeDrawer = false;
                this.$notify({
                    title: "复制成功",
                    message: "内容：" + this.post.code,
                    type: "success",
                });
            });
        },
        // 跳转到数据页
        handleGoToData() {
            this.$emit("go-to-data");
        },
        // 搜索
        handleSearch() {
            const appName = this.type === "face" ? "捏脸" : "体型";
            const filterName = this.type === "face" ? "pvxface" : "pvxbody";
            wx.miniProgram.navigateTo({
                url: `/pages/search/search-detail/search-detail?app=${appName}&filter_name=${filterName}`,
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/drawer.less";
@import "~@/assets/css/common/face-body/miniprogram/drawer.less";
</style>

<style lang="less" scoped>
@import "~@/assets/css/common/face-body/miniprogram/index.less";

.m-mobile-single-detail {
    height: 100vh;
    background-color: #fafafa;
    overflow: auto;
    padding-bottom: 3.5rem;
    box-sizing: border-box;

    :deep(.m-base) {
        flex: 1;
        .w(100%);

        .u-copy {
            .flex;
            .flex(o);
            gap: 0.75rem;
        }
    }

    .u-copy-icon {
        .size(1.5rem);

        svg,
        path {
            fill: @pvx-mini-btn-bg-dark;
            stroke: @pvx-mini-btn-bg-dark;
        }
    }

    .m-detail-top {
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

        :deep(.el-carousel__indicators) {
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

        .u-info {
            .pa;
            .z(2);
            .lb(1.111rem, 0.333rem);

            .u-name {
                color: @pvx-dark-surface;
                .fz(0.889rem, 1.333rem);
                .bold(700);
            }

            .u-author {
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
            background: @pvx-bg-white;
            color: @pvx-text-80;
            .fz(0.778rem, 0.889rem);
            .bold(400);

            &.green {
                background: #34c759;
                color: @pvx-bg-white;
            }

            &.mint {
                background: #23abe5;
                color: @pvx-bg-white;
            }

            &.purple {
                background: #af52de;
                color: @pvx-bg-white;
            }
        }
    }

    .m-introduce {
        border: 1px solid rgba(40, 40, 40, 0.05);
        padding: 0.889rem;
        .r(0.667rem);
        background-color: @pvx-bg-white;
        margin: 0 1.111rem 0.889rem 1.111rem;
        box-sizing: border-box;

        .u-title {
            color: @pvx-text-40;
            .fz(0.667rem, 1rem);
            .bold(400);
            .mb(0.222rem);
        }

        .u-content {
            color: @pvx-text-80;
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
        background-color: @pvx-bg-white;
        color: @pvx-text-40;
        .fz(0.778rem, 1.111rem);
        .bold(400);

        .u-img-dark {
            display: none;
        }
    }

    .m-data-entry {
        .flex;
        justify-content: space-between;
        align-items: center;
        margin: 0 1.111rem 0.889rem 1.111rem;
        padding: 0.889rem;
        .r(0.667rem);
        background-color: @pvx-bg-white;
        color: @pvx-text-80;
        .fz(0.889rem, 1.333rem);
        .bold(700);

        .u-img-dark {
            display: none;
        }
    }

    .m-number-card {
        margin: 0 1.111rem 0.889rem 1.111rem;
        padding: 0.889rem;
        .r(0.667rem);
        color: #fff;
        .fz(0.667rem, 1rem);

        .u-title {
            .flex;
            gap: 0.111rem;
            align-items: center;
            .bold(400);
            .mb(0.222rem);

            img {
                .size(0.667rem);
            }
        }

        .u-number {
            .bold(700);
        }
    }

    .m-face-number {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 100%), #ff7991;
    }

    .m-body-number {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 100%), #79ceff;
    }

    .m-author {
        margin: 0 1.111rem 0.889rem 1.111rem;
        background-color: @pvx-bg-white;
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

            .u-name {
                color: @pvx-text-80;
                .fz(0.778rem, 1.111rem);
                .bold(700);
            }

            .u-fans {
                color: @pvx-text-40;
                .fz(0.556rem, 0.889rem);
                .bold(400);
            }

            .u-follow {
                .flex;
                .flex(o);
                padding: 0.222rem 0.444rem;
                .r(0.444rem);
                background: @pvx-mini-btn-bg;
                color: @pvx-mini-btn-bg-dark;
                .fz(0.556rem, 0.889rem);
            }
        }

        .u-introduce {
            color: @pvx-text-40;
            .fz(0.667rem, 1rem);
            .bold(400);
            padding: 0 0.889rem 0.889rem 0.889rem;
        }
    }

    .m-author-other {
        margin: 0 1.111rem 0.889rem 1.111rem;
        background-color: @pvx-bg-white;
        padding-bottom: 0.889rem;
        .r(0.667rem);

        .u-title {
            color: @pvx-text-80;
            .fz(0.667rem, 1rem);
            .bold(700);
            padding: 0.889rem 0.889rem 0.667rem 0.889rem;
        }

        .u-list {
            padding: 0 0.889rem;
        }
    }

    @media (prefers-color-scheme: dark) {
        background-color: #000;

        .m-detail-top {
            .u-img-item {
                &::before {
                    background: linear-gradient(180deg,
                            #1c1c1c 0.04%,
                            rgba(0, 0, 0, 0) 20%,
                            rgba(0, 0, 0, 0) 80%,
                            #000000 100%);
                }
            }

            .u-info {
                .u-name {
                    color: @pvx-bg-white;
                }

                .u-author {
                    color: @pvx-dark-text-40;
                }
            }
        }

        .m-tags {
            .u-tag {
                background: @pvx-dark-card;
                color: @pvx-dark-text-80;
            }
        }

        .m-introduce {
            background-color: @pvx-dark-card;

            .u-title {
                color: @pvx-dark-text-40;
            }

            .u-content {
                color: @pvx-dark-text-80;
            }
        }

        .m-warning {
            background-color: @pvx-dark-card;
            color: @pvx-dark-text-40;

            .u-img {
                display: none;
            }

            .u-img-dark {
                display: block;
            }
        }

        .m-data-entry {
            background-color: @pvx-dark-card;
            color: @pvx-dark-text-80;

            .u-img {
                display: none;
            }

            .u-img-dark {
                display: block;
            }
        }

        .m-author {
            background-color: @pvx-dark-card;

            .u-info-box {
                .u-name {
                    color: @pvx-dark-text-80;
                }

                .u-fans {
                    color: @pvx-dark-text-40;
                }

                .u-follow {
                    background: @pvx-mini-btn-bg-dark;
                    color: @pvx-mini-btn-bg;
                }
            }

            .u-introduce {
                color: @pvx-dark-text-40;
            }
        }

        .m-author-other {
            background-color: @pvx-dark-card;

            .u-title {
                color: @pvx-dark-text-40;
            }
        }
    }
}
</style>
