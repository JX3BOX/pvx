<template>
    <div class="p-adventure-single" v-if="id" v-loading="loading">
        <template v-if="!isRobot">
            <SuspendCommon :btnOptions="{ showHome: true }" :drawerOptions="{ hideType: hideType }"
                v-if="isMiniProgram">
                <template #default>
                    <div class="m-suspend-btn">
                        <div class="u-btn-item" @click="showCatalogDrawer = true">
                            <img class="u-icon" src="@/assets/img/adventure/catalog_icon.svg" />
                            <span>导航目录</span>
                        </div>
                    </div>
                </template>
            </SuspendCommon>

            <!-- 导航目录 -->
            <el-drawer v-model="showCatalogDrawer" direction="btt" :with-header="false" :modal-append-to-body="false"
                append-to-body class="c-drawer p-adventure-drawer">
                <div class="u-drawer-title">导航</div>
                <div class="m-drawer-nav">
                    <div class="u-nav-item" v-for="(item, index) in drawerNav" :key="index"
                        :class="drawerNavCurrentId === item.id ? 'is-active' : ''" v-show="item.show"
                        @click="drawerNavCurrentIdHref(item.id)">
                        {{ item.label }}
                    </div>
                </div>
            </el-drawer>

            <div class="m-pvx-adventure-navigation m-navigation">
                <div class="u-goback" @click="goBack">返回列表</div>
                <PvxSingleAdminDrop></PvxSingleAdminDrop>
                <!-- <el-input
                placeholder="请输入奇遇或宠物名字搜索"
                v-model="search"
                class="u-input"
                @keyup.enter.native="goSearch"
            >
                <el-button slot="append" icon="el-icon-search" @click="goSearch"></el-button>
            </el-input> -->
            </div>
            <div class="m-pvx-adventure-header">
                <span class="u-pvx-adventure-title">{{ title }}</span>
                <div class="m-trigger-links">
                    <a class="u-link u-achievement" :href="getLink('cj', achieve_id)" target="_blank">
                        <i class="el-icon-trophy"></i>
                        成就信息
                    </a>
                    <PvxRobotTip v-if="!isRobot" type-name="奇遇" :reply="title"></PvxRobotTip>
                </div>
            </div>
            <div class="m-pvx-adventure-content">
                <task :id="id" :info="data" />
            </div>
            <!-- (小程序端)包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
            <PvxUserMiniprogram v-if="isMiniProgram" :id="achieve_id" name="奇遇" type="achievement">
            </PvxUserMiniprogram>
            <!-- 包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
            <pvx-user :id="achieve_id" name="奇遇" type="achievement" :isRobot="isRobot"
                v-if="achieve_id && !isMiniProgram">
                <template #serendipity v-if="!isRobot">
                    <div class="m-adventure-serendipity">
                        <Serendipity :title="title" />
                    </div>
                </template>
            </pvx-user>
        </template>
        <template v-else>
            <div class="m-robot__adventure-header is-perfect">
                <div class="m-left">
                    <div class="m-title">
                        <img :src="require(`@/assets/img/qqbot/jx3box_qqbot_adventure_${robotIcon}.svg`)" />
                        <div class="u-title">{{ robotTitle }}</div>
                    </div>
                    <div class="m-reward">
                        <!-- <span>奖励：</span> -->
                        <div class="u-reward" v-html="rewardContent"></div>
                    </div>
                </div>
                <img class="u-right-icon" src="@/assets/img/qqbot/jx3box_qqbot_adventure.svg" alt="" />
            </div>
            <div class="m-robot-item m-robot__adventure-condition">
                <img class="u-pvx-logo" :src="imgUrl" />
                <div class="m-condition">
                    <div class="m-title">
                        <img src="@/assets/img/qqbot/jx3box_qqbot_adventure_item.svg" alt="" />
                        <div class="u-title">触发前置</div>
                        <span>（需全部满足）</span>
                    </div>
                    <div class="m-pvx-adventure-content">
                        <div class="u-content" v-html="conditionContent"></div>
                    </div>
                </div>
            </div>
            <div class="m-robot-item m-robot__adventure-method">
                <div class="m-title">
                    <img src="@/assets/img/qqbot/jx3box_qqbot_adventure_item.svg" alt="" />
                    <div class="u-title">触发方式</div>
                    <span>（完成任一均有可能触发奇遇）</span>
                </div>
                <div class="m-pvx-adventure-content">
                    <div class="u-content" v-html="methodContent"></div>
                </div>
            </div>
            <div class="m-robot-item m-robot__adventure-method">
                <div class="m-title">
                    <img src="@/assets/img/qqbot/jx3box_qqbot_adventure_item.svg" alt="" />
                    <div class="u-title">奇遇流程</div>
                    <span>（以魔盒在线版本为准）</span>
                </div>
                <div class="m-pvx-adventure-content">
                    <div class="u-content" id="adventureProcessContent" v-html="processContent"></div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { getLink } from "@jx3box/jx3box-common/js/utils";
import { getAdventure, getSerendipityAchievementId } from "@/service/adventure/adventure";
import PvxUser from "@/components/PvxUser.vue";
// import item_icon from "@/components/common/item_icon.vue";
import task from "@/components/adventure/task.vue";
import Serendipity from "@/components/common/serendipity.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import PvxUserMiniprogram from "@/components/PvxUserMiniprogram.vue";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import { __imgPath } from "@/utils/config";
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
export default {
    name: "adventureSingle",
    props: ["isRobot", "sourceId"],
    components: {
        task,
        Serendipity,
        PvxUser,
        PvxUserMiniprogram,
        SuspendCommon,
        PvxSingleAdminDrop,
        PvxRobotTip,
        // item_icon,
    },
    data: function () {
        return {
            hideType: ["collect", "rss", "laterOn", "pin", "user", "report"],
            type: "adventure",
            achieve_id: "",
            data: "",
            task: [],
            isPet: true,
            loading: false,
            search: "",
            isMiniProgram: isMiniProgram() || isApp(),
            conditionContent: "",
            methodContent: "",
            processContent: "",
            rewardContent: "",
            camp: 1,
            force: 2,

            showCatalogDrawer: false,

            drawerNav: [
                {
                    label: "奇遇故事",
                    id: "mini-task-container",
                    show: true,
                },
                {
                    label: "攻略",
                    id: "mini-wiki-post-panel",
                    show: true,
                },
                {
                    label: "评论",
                    id: "mini-wiki-comments",
                    show: true,
                },
            ],
            drawerNavCurrentId: "mini-task-container",

            imagesLoaded: false,
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id || this.sourceId;
        },
        title: function () {
            return this.data?.szName || "";
        },
        client() {
            return this.$store.state.client;
        },
        isPerfect() {
            return !!this.data?.bPerfect;
        },
        robotIcon() {
            let typeIcon = "normal"; // 普通奇遇
            if (this.isPerfect) {
                typeIcon = "perfect"; // 绝世奇遇
            }
            if (this.data?.nClassify === 1) {
                typeIcon = "pet"; // 宠物奇遇
            }
            return typeIcon;
        },
        robotTitle() {
            let titlePrefix = "奇遇";
            if (this.isPerfect) {
                titlePrefix = "绝世奇遇";
            }
            if (this.data?.nClassify === 1) {
                titlePrefix = "宠物奇遇";
            }
            return titlePrefix + " · " + this.title;
        },
        defaultImg: function () {
            return __imgPath + "image/pvx/bg.png";
        },
        imgUrl() {
            const client = this.client;
            // const client = "std"; // 怀旧服的奇遇图片先取正式服的
            let tgaPath = this.data.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!this.data.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${__imgPath}adventure/adventure/${client}/${pngPath}`;
            }
            // 传给组件的数据是修改过的
            tgaPath = tgaPath.replace(/\/[^\/]+?\.tga$/, "");
            if (this.data.szRewardType === "camp")
                return `${__imgPath}adventure/adventure/${client}/${tgaPath}/camp_${this.camp}_open.png`;
            if (this.data.szRewardType === "school")
                return `${__imgPath}adventure/adventure/${client}/${tgaPath}/school_${this.force}_open.png`;
            return this.defaultImg;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler: function (val) {
                if (val) {
                    this.getData();
                }
            },
        },
    },
    beforeUnmount() {
        window.removeEventListener("load", this.initImageLoader);
    },
    methods: {
        initImageLoader() {
            this.$nextTick(() => {
                const container = document.getElementById("adventureProcessContent");
                if (!container) {
                    this.setGlobalReady();
                    return;
                }
                const images = container.querySelectorAll("img");
                if (images.length === 0) {
                    this.setGlobalReady();
                    return;
                }
                this.preloadAllImages(images);
            });
        },
        preloadAllImages(images) {
            const promises = Array.from(images).map((img) => {
                if (img.complete) return Promise.resolve();
                const originalSrc = img.src;
                return new Promise((resolve) => {
                    const tempImg = new Image();
                    tempImg.onload = tempImg.onerror = () => {
                        img.src = originalSrc;
                        resolve();
                    };
                    tempImg.src = originalSrc;
                });
            });
            Promise.all(promises).then(() => this.setGlobalReady());
        },
        setGlobalReady() {
            if (this.imagesLoaded) return;
            this.imagesLoaded = true;
            window.__READY__ = true;
        },
        getLink,
        goBack() {
            this.$router.push({ name: "list" });
        },
        //百科相关
        loadData: async function () {
            // 获取最新攻略
            if (this.achieve_id) {
                await wiki.mix({ type: "achievement", id: this.achieve_id, client: this.client }).then((res) => {
                    const { post } = res;
                    const content = post?.content || "";
                    // 触发前置
                    // 触发方式
                    // 奇遇流程
                    // 奇遇奖励
                    const contentList = content.split("<p>◆◆◆◆◆◆</p>");
                    this.conditionContent = (contentList?.[0] || "").replaceAll("&nbsp;", "");
                    this.methodContent = (contentList?.[1] || "").replaceAll("&nbsp;", "");
                    this.processContent = (contentList?.[2] || "").replaceAll("&nbsp;", "");
                    this.rewardContent = (contentList?.[3] || "").replaceAll("&nbsp;", "");
                });
                if (this.isRobot) {
                    // 数据加载后启动奇遇流程中的图片检测
                    this.initImageLoader();
                }
            }
        },
        getData() {
            this.loading = true;
            getAdventure(this.id, {
                client: this.$store.state.client,
            })
                .then((res) => {
                    this.isPet = false;
                    this.data = res.data;


                    document.title = this.data.szName + this.$t("pages.common.appendTitle");
                })
                .finally(() => {
                    this.loading = false;
                    postStat(this.type, this.id);
                });
            getSerendipityAchievementId(this.id, {
                client: this.$store.state.client,
            }).then((res) => {
                this.achieve_id = res.data?.achievement_id;
                this.loadData();
            });
        },
        goSearch() {
            this.$router.push({ name: "list", params: { search: this.search } });
        },
        drawerNavCurrentIdHref(id) {
            // this.drawerNavCurrentId = id;
            let nav = document.getElementById(id);
            if (nav) {
                nav.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        },
        handleScroll() {
            const navElements = this.drawerNav.map((item) => document.getElementById(item.id)).filter(Boolean);
            for (const nav of navElements) {
                const rect = nav.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    this.drawerNavCurrentId = nav.id;
                    break;
                }
            }
        },
    },
    mounted: function () {
        if (!document.getElementById("mini-wiki-comments")) {
            this.drawerNav[2].show = false;
        }

        window.addEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/single.less";
@import "~@/assets/css/common/drawer.less";
@import "~@/assets/css/adventure/robot.less";
</style>
