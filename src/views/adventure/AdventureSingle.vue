<template>
    <PvxPageShell
        v-if="id"
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
            i18n-key-prefix="pages.adventure.single.ui.wiki"
        >
            <template #serendipity>
                <div class="m-adventure-serendipity">
                    <Serendipity :title="title" />
                </div>
            </template>
        </pvx-user>
    </PvxPageShell>

</template>

<script>
import { getLink } from "@jx3box/jx3box-common/js/utils";
import { getAdventure, getSerendipityAchievementId } from "@/service/adventure/adventure";
import PvxUser from "@/components/PvxUser.vue";
import task from "@/components/adventure/task.vue";
import Serendipity from "@/components/common/serendipity.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { ArrowLeft, Trophy } from "@element-plus/icons-vue";
export default {
    name: "adventureSingle",
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
        };
    },
    computed: {
        id() {
            return this.$route.params.id;
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
    },
    watch: {
        id: {
            immediate: true,
            handler: function (val) {
                if (val) this.getData();
            },
        },
    },
    methods: {
        getLink,
        goBack() {
            this.$router.push({ name: "list" });
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
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/pc/single.less";
@import "~@/assets/css/common/drawer.less";
@import "~@/assets/css/modules/adventure-detail-theme.less";
</style>
