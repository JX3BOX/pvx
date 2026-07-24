<template>
    <PvxPageShell
        v-if="id && !isRobot"
        class="p-adventure-single p-pvx-adventure-single--modern"
        v-loading="loading"
    >
        <PvxSurface class="m-pvx-adventure-navigation" tag="nav" padding="small" radius="medium">
            <button type="button" class="u-goback" @click="goBack">
                <ArrowLeft />
                {{ $t("pages.adventure.single.ui.backToList") }}
            </button>
            <PvxSingleAdminDrop />
        </PvxSurface>

        <PvxSurface class="m-pvx-adventure-header" tag="header" padding="large">
            <div class="m-pvx-adventure-header__info">
                <div class="m-pvx-adventure-header__meta">
                    <span class="u-pvx-adventure-eyebrow">
                        {{ $t("pages.adventure.single.ui.guideLabel") }}
                    </span>
                    <span class="u-pvx-adventure-type">{{ adventureTypeName }}</span>
                </div>
                <h1 class="u-pvx-adventure-title">{{ title }}</h1>
            </div>
            <div class="m-pvx-adventure-header__actions">
                <PvxActionButton
                    v-if="achieve_id"
                    class="u-achievement"
                    :href="getLink('cj', achieve_id)"
                    target="_blank"
                    variant="light"
                >
                    <Trophy />
                    {{ $t("pages.adventure.single.ui.achievement") }}
                </PvxActionButton>
            </div>
            <div class="m-pvx-adventure-guide-tip">
                <PvxRobotTip
                    variant="modern"
                    type-name="奇遇"
                    :reply="title"
                    :quick-guide-text="$t('pages.adventure.single.ui.robot.quickGuide')"
                    :copy-success-title="$t('pages.adventure.single.ui.robot.copySuccess')"
                    :reply-prefix="$t('pages.adventure.single.ui.robot.replyPrefix')"
                    :reply-suffix="$t('pages.adventure.single.ui.robot.replySuffix')"
                    :copy-qq-label="$t('pages.adventure.single.ui.robot.copyQq')"
                    :copy-command-label="$t('pages.adventure.single.ui.robot.copyCommand')"
                />
            </div>
        </PvxSurface>

        <section class="m-pvx-adventure-task-panel">
            <div class="m-pvx-adventure-content">
                <task :id="id" :info="data" />
            </div>
        </section>

        <pvx-user
            v-if="achieve_id"
            class="m-pvx-adventure-wiki"
            :id="achieve_id"
            :name="$t('pages.adventure.single.ui.typeName')"
            type="achievement"
            :isRobot="isRobot"
            i18n-key-prefix="pages.adventure.single.ui.wiki"
        >
            <template #serendipity>
                <div class="m-adventure-serendipity">
                    <Serendipity :title="title" />
                </div>
            </template>
        </pvx-user>
    </PvxPageShell>

    <div v-else-if="id" class="p-adventure-single" v-loading="loading">
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
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { ArrowLeft, Trophy } from "@element-plus/icons-vue";
export default {
    name: "adventureSingle",
    props: ["isRobot", "sourceId"],
    components: {
        task,
        Serendipity,
        PvxUser,
        PvxSingleAdminDrop,
        PvxRobotTip,
        PvxActionButton,
        PvxPageShell,
        PvxSurface,
        ArrowLeft,
        Trophy,
    },
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
        adventureType() {
            if (this.data?.nClassify === 1) return "pet";
            return this.isPerfect ? "perfect" : "normal";
        },
        adventureTypeName() {
            const type = this.$t(`pages.adventure.ui.types.${this.adventureType}`);
            return this.$t("pages.adventure.ui.sectionTitle", { type });
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
@import "~@/assets/css/modules/adventure-detail-theme.less";
</style>
