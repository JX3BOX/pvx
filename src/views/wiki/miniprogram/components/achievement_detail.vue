<template>
    <div>
        <el-drawer v-model="show" direction="btt" :show-close="false" :with-header="false" append-to-body
            class="topic-view-drawer" size="400" @close="onClose" style="width: 100%">
            <template #default>
                <div v-loading="loading" class="c-var m-topic-view">
                    <div v-if="source" class="m-achievement-info">
                        <div class="m-left">
                            <div class="u-achievement-box">
                                <div class="u-icon">
                                    <img :src="iconLink(source.IconID)" @error.once="
                                        () => {
                                            $event.target.src = iconLink();
                                        }
                                    " />
                                </div>
                                <div class="u-name">
                                    {{ source.Name }}
                                </div>
                            </div>
                            <div class="u-topic-other">
                                <div class="u-avatar-list">
                                    <div v-for="item in authors" :key="item.user_id" class="u-avatar">
                                        <img :src="showAvatar(item.user_avatar)" />
                                    </div>
                                </div>
                                <div class="u-time">
                                    {{ updated_at }}
                                </div>
                            </div>
                        </div>
                        <div class="m-right">
                        </div>
                    </div>

                    <div class="m-content-box" ref="content" :class="{ 'not-on-bottom': !isAtBottom }"
                        @contextmenu="openChild">
                        <Article id="wikiArticle" :content="clearContent(wiki_post?.post?.content)" />
                    </div>
                </div>
            </template>
        </el-drawer>

        <!-- <children-list-drawer :visible.sync="childrenShow" :current="source" @change="changeCurrent" /> -->
    </div>
</template>

<script>
import { pick } from "lodash";
// import ChildrenListDrawer from "@/components/cj/mobile/children-list-drawer.vue";
import { publishLink, ts2str, iconLink } from "@jx3box/jx3box-common/js/utils";
import { postHistory, postStat } from "@jx3box/jx3box-common/js/stat";
import { cancelVirtualRoleAchievements, get_achievement, setVirtualRoleAchievements } from "@/service/achievement";
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import { reportNow } from "@jx3box/jx3box-common/js/reporter";
import User from "@jx3box/jx3box-common/js/user";
import { getConfig } from "@jx3box/jx3box-common/js/system";
import { report } from "@/service/user";
import { showAvatar } from "@jx3box/jx3box-common/js/utils.js";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import { mobileOpen } from "@/utils/minprogram";

export default {
    name: "WikiViewDrawer",
    components: { Article },
    emits: ["update:visible", "update:current"],
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        current: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            tmpVal: null,
            confirmShow: false,
            childrenShow: false,

            source: null,
            wiki_post: null,
            compatible: false,
            is_empty: true,
            loading: false,

            imageCount: 0,
            loadedImageCount: 0,
            images: [],
            imagesLoaded: false,

            nextFunc: null,
            isAtBottom: false,
        };
    },
    watch: {
        current: {
            handler() { },
            immediate: true,
            deep: true,
        },
        id: {
            handler() {
                this.loadData();
            },
        },
        post_id: {
            handler() {
                this.loadRevision();
            },
        },
        visible: {
            handler(val) {
                if (val) {
                    this.$nextTick(() => {
                        const scrollContainer = this.$refs.content;
                        if (scrollContainer) {
                            scrollContainer.addEventListener("scroll", this.handleScroll);
                            this.handleScroll({ target: scrollContainer });
                        }
                    });
                } else {
                    const scrollContainer = this.$refs.content;
                    if (scrollContainer) {
                        scrollContainer.removeEventListener("scroll", this.handleScroll);
                    }
                }
            },
            immediate: true,
        },
    },

    computed: {
        show: {
            get() {
                return this.visible;
            },
            set(val) {
                this.$emit("update:visible", val);
            },
        },
        id() {
            return this.current?.ID;
        },
        post_id: function () {
            return this.$route.params.post_id;
        },
        isRevision: function () {
            return !!this.$route.params.post_id;
        },
        author_id: function () {
            return ~~this.wiki_post.post.user_id;
        },
        client: function () {
            return this.$store.state.client;
        },
        user_name: function () {
            return this.wiki_post?.post?.user_nickname;
        },
        updated_at: function () {
            return ts2str(this.wiki_post?.post?.updated);
        },
        authors: function () {
            if (!this.isRevision) {
                return (
                    this.wiki_post?.users
                        ?.filter((user) => user.id)
                        ?.map((user) => {
                            return {
                                user_id: user.id,
                                user_avatar: user.avatar,
                                display_name: user.nickname,
                            };
                        }) || []
                );
            }
            return [];
        },
        favTitle: function () {
            return this.wiki_post?.source?.Name;
        },
        prefix() {
            return this.client === "std" ? "www" : "origin";
        },
        isFromTarget() {
            return false;
        },
        drawerOptions() {
            return {
                hideType: ["report"], //需要隐藏的type,如['search','pin']
                direction: "btt", //弹出框方向，btt、ttb、rtl、ltr
            };
        },
        btnOptions() {
            return {
                showHome: true, //是否显示home区域，和Icon区域二选一,home区域优先级高于icon区域
                showIcon: false, //是否显示icon区域,此处为false后，则下列配置无效

                showMore: true, //是否显示更多
            };
        },
        isVirtual() {
            return !this.currentRole?.jx3id;
        },
        currentRole() {
            return this.$store.state.role;
        },
        isComplete() {
            return this.hadCompleted(this.id);
        },
        completeAchievements() {
            return this.$store.state.achievements || [];
        },
        achievementsVirtual() {
            return this.$store.state.achievementsVirtual || [];
        },
    },
    mounted() {
        if (this.post_id) {
            this.loadRevision();
        } else {
            this.loadData();
        }

        this.loadConfig();
    },
    methods: {
        iconLink,
        showAvatar,
        hadCompleted(id) {
            const list = this.isVirtual ? this.achievementsVirtual : this.completeAchievements;
            return list.includes(id + "");
        },
        openChild() {
            this.childrenShow = true;
        },
        changeCurrent(val) {
            this.$emit("update:current", val);
        },
        clearContent(content) {
            return (content || "")
                .replace(/ style="[^"]*"/g, "")
                .replace(/<i?frame.*?src="(.*?)".*?>/g, (match, src) => {
                    return `<a href="${src}" target="_blank">${src}</a>`;
                })
                .replace(/<i?frame.*?src="(.*?)".*?>.*?<\/i?frame>/g, (match, src) => {
                    return `<a href="${src}" target="_blank">${src}</a>`;
                });
        },
        publish_url: publishLink,
        triggerStat: function () {
            if (this.client == "origin") {
                postStat("origin_cj", this.id);
            } else {
                postStat("cj", this.id);
            }
        },
        initImageLoader() {
            // 在DOM更新后获取所有图片
            this.$nextTick(() => {
                const container = document.getElementById("wikiArticle");
                if (!container) {
                    this.setGlobalReady();
                    return;
                }

                const images = container.querySelectorAll("img");
                this.images = images;
                this.imageCount = images.length;

                if (this.imageCount === 0) {
                    this.setGlobalReady();
                    return;
                }

                // 手动预加载所有图片
                this.preloadAllImages(images);
            });
        },

        // 手动预加载所有图片
        preloadAllImages(images) {
            let loadedInThisBatch = 0;
            let totalProcessed = 0;
            Array.from(images).forEach((img, index) => {
                // 记录原始src
                const originalSrc = img.src;

                // 如果图片未加载
                if (!img.complete) {
                    // 创建一个Image对象来预加载
                    const tempImg = new Image();

                    tempImg.onload = () => {
                        loadedInThisBatch++;

                        // 在临时图片加载完成后，设置原始图片的src
                        img.src = originalSrc;

                        // 检查是否所有图片都已处理
                        this.checkImageLoadCompletion(images, loadedInThisBatch);
                    };

                    tempImg.onerror = () => {
                        console.error(`图片加载失败: ${originalSrc}`);
                        totalProcessed++;

                        // 即使加载失败，也要设置原始图片的src
                        img.src = originalSrc;

                        // 标记原始图片为已加载（错误情况）
                        this.handleImageLoad();
                    };

                    // 开始预加载
                    tempImg.src = originalSrc;
                } else {
                    // 图片已经加载完成
                    this.handleImageLoad();
                    totalProcessed++;
                }
            });
        },

        // 检查图片加载状态
        checkImageLoadCompletion(images, loadedCount) {
            if (images.length === this.loadedImageCount) {
                this.setGlobalReady();
                return;
            }

            // 设置超时检查，防止意外情况
            setTimeout(() => {
                const allLoaded = Array.from(images).every((img) => img.complete);

                if (allLoaded) {
                    this.setGlobalReady();
                } else if (this.loadedImageCount === images.length) {
                    this.setGlobalReady();
                }
            }, 3000);
        },

        // 判断是否全部完成
        handleImageLoad() {
            this.loadedImageCount++;
            if (this.loadedImageCount === this.imageCount) {
                this.setGlobalReady();
            }
        },

        // 设置全局就绪状态
        setGlobalReady() {
            if (this.imagesLoaded) return; // 避免重复设置

            this.imagesLoaded = true;
            window.__READY__ = true;
            console.log("全局状态设置成功: __READY__ = ", window.__READY__);
        },
        loadData: async function () {
            // 获取最新攻略
            if (this.id) {
                this.loading = true;
                await get_achievement(this.id, { client: this.client }).then((res) => {
                    this.source = res?.data?.data?.achievement || "";
                });
                await wiki
                    .mix({ type: "achievement", id: this.id, client: this.client })
                    .then((res) => {
                        const { post, source, compatible, isEmpty, users } = res;
                        this.wiki_post = {
                            post: post,
                            source: source,
                            users,
                        };
                        this.is_empty = isEmpty;
                        this.compatible = compatible;

                        reportNow({
                            caller: "cj_detail",
                            data: {
                                href: `${this.prefix}:/cj/view/${this.id}`,
                            },
                        });

                        User.isLogin() &&
                            postHistory({
                                source_type: this.client == "origin" ? "origin_cj" : "cj",
                                source_id: ~~this.id,
                                link: location.href,
                                title: post.title,
                            });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }

            // 请注意，为防止QQBOT无法抓取完全，请不要删除
            if (this.isRobot) {
                // 数据加载后启动奇遇流程中的图片检测
                this.initImageLoader();
            }

            this.triggerStat();
        },
        loadRevision: function () {
            // 获取指定攻略
            wiki.getById(this.post_id).then((res) => {
                this.wiki_post = {
                    ...this.wiki_post,
                    post: res.data.data?.post,
                };
            });
            this.triggerStat();
        },
        ts2str,
        loadConfig() {
            getConfig({ key: "test_user_ua" }).then((res) => {
                const isTest = ~~res.data.data.val;

                if (isTest) {
                    report();
                }
            });
        },
        setConfirm() {
            if (!this.isVirtual) {
                return;
            }

            if (this.isComplete) {
                // 取消完成
                this.cancelVirtual([this.id]);

                return;
            }

            this.confirmShow = true;
        },
        onClose() {
            this.show = false;
        },
        resetSearch() {
            this.tmpVal = pick(this.tmpVal);
        },
        changeValue() {
            this.$emit("change", this.tmpVal);
        },
        toDetail() {
            mobileOpen(
                this.$router.resolve({
                    name: "view",
                    params: {
                        post_id: this.post_id,
                        source_id: this.id,
                    },
                }).href
            );
        },
        handleScroll(event) {
            const element = event.target;
            const threshold = 5; // 容错值，避免精度问题
            this.isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
        },
        confirmOk() {
            this.finishVirtual([this.id]);
        },
        finishVirtual(curr) {
            const ids = curr ? curr : this.selectedAchievements.map((item) => item.ID + "");
            const data = {
                achievements: ids.join(),
            };
            setVirtualRoleAchievements(data).then((res) => {
                this.$notify({
                    title: "操作成功",
                    message: "已将选中成就标记为已完成",
                    type: "success",
                });
                const list = Array.from(new Set(this.achievementsVirtual.concat(ids)));
                this.$store.commit("SET_STATE", { key: "achievementsVirtual", value: list });
                this.isAll = false;
                this.achievements = this.achievements.map((item) => {
                    return {
                        ...item,
                        checked: false,
                    };
                });
            });
        },
        cancelVirtual(curr) {
            const ids = curr ? curr : this.selectedAchievements.map((item) => item.ID + "");
            const data = {
                achievements: ids.join(),
            };
            cancelVirtualRoleAchievements(data).then((res) => {
                this.$notify({
                    title: "操作成功",
                    message: "已将选中成就标记为待完成",
                    type: "success",
                });
                const list = this.achievementsVirtual.filter((item) => !ids.includes(item));
                this.$store.commit("SET_STATE", { key: "achievementsVirtual", value: list });
                this.isAll = false;
                this.achievements = this.achievements.map((item) => {
                    return {
                        ...item,
                        checked: false,
                    };
                });
            });
        },
    },
};
</script>

<style lang="less">
.topic-view-drawer {
    border-radius: 20px 20px 0px 0px;
    overflow: hidden;
    background-color: #24292e;
}

.m-topic-view {
    display: flex;
    flex-direction: column;
    background-color: #24292e;
    padding: 20px;
    min-height: 500px;
    position: relative;

    .m-achievement-info {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .m-left {
            display: flex;
            gap: 8px;
            flex-direction: column;

            .u-achievement-box {
                display: flex;
                gap: 8px;
                align-items: center;

                .u-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .u-name {
                    color: rgba(255, 255, 255, 0.6);

                    /* 16 Bold */
                    font-size: 16px;
                    font-style: normal;
                    font-weight: 700;
                    line-height: 24px;
                    /* 150% */
                }
            }

            .u-topic-other {
                display: flex;
                flex-direction: row;
                gap: 4px;
                align-items: center;

                .u-avatar-list {
                    display: flex;
                    align-items: center;

                    .u-avatar {
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        overflow: hidden;
                        margin-right: -8px;

                        img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                    }
                }

                .u-time {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 12px;
                    line-height: 18px;
                    margin-left: 8px;
                }
            }
        }

        .m-right {
            .u-change-achievement {
                display: flex;
                padding-right: 24px;
                align-items: center;
                gap: 8px;
                width: 24px;
                height: 24px;
                color: rgba(255, 255, 255, 0.8);
            }
        }
    }

    .m-content-box {
        max-height: 320px;
        min-height: 320px;
        overflow: auto;
        margin-top: 20px;
        padding-bottom: 20px;

        box-sizing: border-box;

        &.not-on-bottom {
            position: relative;

            &:after {
                width: 100%;
                height: 76px;
                content: "";
                position: fixed;
                box-sizing: border-box;
                bottom: 90px;
                background: linear-gradient(180deg, rgba(36, 41, 46, 0) 0%, #24292e 73.94%);
            }
        }

        #wikiArticle {
            color: rgba(255, 255, 255, 0.8) !important;

            /* 14 Regular */
            font-size: 14px !important;
            font-style: normal !important;
            font-weight: 400 !important;
            line-height: 20px;
            /* 142.857% */

            box-sizing: border-box;
            overflow-x: hidden;

            ul {
                padding-left: 12px !important;
            }

            .e-summary,
            .e-jx3-resource {
                @media (prefers-color-scheme: dark) {
                    color: white;
                    background: var(--black-20);
                }
            }

            ul:has(.e-jx3-resource) {
                padding: 0 !important;
            }

            ul:has(.e-summary) {
                padding: 0 !important;
            }

            img {
                margin: 0 !important;
            }

            div {
                color: white;
            }

            h1 {
                font-weight: 700 !important;
                line-height: 30px !important;
                font-size: 20px !important;
                margin-bottom: 15px !important;
                color: white;
            }

            h2 {
                font-weight: 700 !important;
                line-height: 27px !important;
                font-size: 18px !important;
                margin-bottom: 14px !important;
                color: white;
            }

            h3 {
                font-weight: 700 !important;
                line-height: 24px !important;
                font-size: 16px !important;
                margin-bottom: 12px !important;
                color: white;
            }

            h4 {
                font-weight: 700 !important;
                line-height: 20px !important;
                font-size: 14px !important;
                margin-bottom: 11px !important;

                @media (prefers-color-scheme: dark) {
                    color: white;
                    background: var(--black-20);
                }
            }

            blockquote {
                @media (prefers-color-scheme: dark) {
                    background: var(--black-20);
                }
            }

            h5,
            h6 {
                font-weight: 700 !important;
                line-height: 18px !important;
                font-size: 12px !important;
                margin-bottom: 9px !important;
                color: white !important;

                @media (prefers-color-scheme: dark) {
                    background: var(--black-20);
                }
            }

            .e-jx3-resource {
                overflow: hidden;
            }

            p {
                font-weight: 400 !important;
                line-height: 20px !important;
                font-size: 14px !important;
                margin-bottom: 11px !important;
                color: white;
            }

            .text {
                display: inline-block !important;
                font-weight: 400 !important;
                line-height: 20px !important;
                font-size: 14px !important;
                margin-bottom: 11px !important;
                color: white;
            }

            hr {
                margin-bottom: 11px !important;
                margin-top: 8px !important;
            }
        }
    }

    .m-op {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        padding: 20px 12px 30px;
        gap: 20px;
        background-color: #24292e;

        button {
            color: rgba(28, 28, 28, 0.4);

            /* 16 Bold */
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 24px;
            /* 150% */

            border-radius: var(--12, 12px);
            padding: var(--12, 12px) var(--16, 16px);
            border: none;

            &.u-reset {
                display: flex;
                justify-content: center;
                align-items: center;
                color: rgba(255, 255, 255, 0.4);
                background: rgba(255, 255, 255, 0.05);

                //&.active {
                //    color: #000;
                //    background: #fedaa3;
                //}
            }

            &.u-confirm {
                color: rgba(255, 255, 255, 0.4);

                /* 16 Bold */
                font-size: 16px;
                font-style: normal;
                font-weight: 700;
                line-height: 24px;
                /* 150% */
                flex: 1;

                border-radius: var(--12, 12px);
                background: rgba(255, 255, 255, 0.05);

                &.active {
                    color: #000;
                    background: #fedaa3;
                }
            }
        }
    }
}
</style>
