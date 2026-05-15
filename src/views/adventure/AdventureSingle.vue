<template>
    <div class="p-adventure-single" v-if="id" v-loading="loading">
        <template v-if="!isRobot">
            <div class="m-pvx-adventure-navigation m-navigation">
                <div class="u-goback" @click="goBack">返回列表</div>
                <PvxSingleAdminDrop></PvxSingleAdminDrop>
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
            <pvx-user :id="achieve_id" name="奇遇" type="achievement" :isRobot="isRobot" v-if="achieve_id">
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
import task from "@/components/adventure/task.vue";
import Serendipity from "@/components/common/serendipity.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { __imgPath } from "@/utils/config";
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
export default {
    name: "adventureSingle",
    props: ["isRobot", "sourceId"],
    components: { task, Serendipity, PvxUser, PvxSingleAdminDrop, PvxRobotTip },
    data: function () {
        return {
            type: "adventure",
            achieve_id: "",
            data: "",
            loading: false,
            conditionContent: "",
            methodContent: "",
            processContent: "",
            rewardContent: "",
            camp: 1,
            force: 2,
            imagesLoaded: false,
        };
    },
    computed: {
        id() {
            return this.$route.params.id || this.sourceId;
        },
        title() {
            return this.data?.szName || "";
        },
        client() {
            return this.$store.state.client;
        },
        isPerfect() {
            return !!this.data?.bPerfect;
        },
        robotIcon() {
            let typeIcon = "normal";
            if (this.isPerfect) typeIcon = "perfect";
            if (this.data?.nClassify === 1) typeIcon = "pet";
            return typeIcon;
        },
        robotTitle() {
            let titlePrefix = "奇遇";
            if (this.isPerfect) titlePrefix = "绝世奇遇";
            if (this.data?.nClassify === 1) titlePrefix = "宠物奇遇";
            return titlePrefix + " · " + this.title;
        },
        defaultImg() {
            return __imgPath + "image/pvx/bg.png";
        },
        imgUrl() {
            const client = this.client;
            let tgaPath = this.data.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!this.data.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${__imgPath}adventure/adventure/${client}/${pngPath}`;
            }
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
                if (val) this.getData();
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
                if (!container) { this.setGlobalReady(); return; }
                const images = container.querySelectorAll("img");
                if (images.length === 0) { this.setGlobalReady(); return; }
                this.preloadAllImages(images);
            });
        },
        preloadAllImages(images) {
            const promises = Array.from(images).map((img) => {
                if (img.complete) return Promise.resolve();
                const originalSrc = img.src;
                return new Promise((resolve) => {
                    const tempImg = new Image();
                    tempImg.onload = tempImg.onerror = () => { img.src = originalSrc; resolve(); };
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
        loadData: async function () {
            if (this.achieve_id) {
                await wiki.mix({ type: "achievement", id: this.achieve_id, client: this.client }).then((res) => {
                    const { post } = res;
                    const content = post?.content || "";
                    const contentList = content.split("<p>◆◆◆◆◆◆</p>");
                    this.conditionContent = (contentList?.[0] || "").replaceAll("&nbsp;", "");
                    this.methodContent = (contentList?.[1] || "").replaceAll("&nbsp;", "");
                    this.processContent = (contentList?.[2] || "").replaceAll("&nbsp;", "");
                    this.rewardContent = (contentList?.[3] || "").replaceAll("&nbsp;", "");
                });
                if (this.isRobot) {
                    this.initImageLoader();
                }
            }
        },
        getData() {
            this.loading = true;
            getAdventure(this.id, { client: this.$store.state.client })
                .then((res) => {
                    this.data = res.data;
                    document.title = this.data.szName + this.$t("pages.common.appendTitle");
                })
                .finally(() => {
                    this.loading = false;
                    postStat(this.type, this.id);
                });
            getSerendipityAchievementId(this.id, { client: this.$store.state.client }).then((res) => {
                this.achieve_id = res.data?.achievement_id;
                this.loadData();
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/pc/single.less";
@import "~@/assets/css/common/drawer.less";
@import "~@/assets/css/adventure/robot.less";
</style>
