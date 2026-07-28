<template>
    <div v-if="reputation.dwForceID !== -1" class="p-pvx-reputation-single--modern">
        <PvxPageShell class="m-pvx-reputation-single-shell">
            <div class="m-pvx-reputation-single-layout">
                <PvxSurface class="m-pvx-reputation-navigation" tag="nav" padding="small" radius="medium">
                    <PvxActionButton variant="light" @click="goBack">
                        <ArrowLeft />
                        {{ $t("pages.reputation.single.ui.actions.back") }}
                    </PvxActionButton>
                    <PvxSingleAdminDrop />
                </PvxSurface>

                <PvxSurface class="m-pvx-reputation-header" tag="header" padding="large">
                    <div class="m-pvx-reputation-header__icon">
                        <img
                            :src="getReputationIcon(reputation.szIconPath)"
                            :alt="reputation.szName"
                            @error="replaceReputationIconByDefault"
                        />
                    </div>
                    <div class="m-pvx-reputation-header__info">
                        <div class="m-pvx-reputation-header__meta">
                            <span class="u-pvx-reputation-eyebrow">
                                {{ $t("pages.reputation.single.ui.guideLabel") }}
                            </span>
                            <span v-if="reputation.GroupName" class="u-pvx-reputation-type">
                                {{ reputation.GroupName }}
                            </span>
                        </div>
                        <h1 class="u-pvx-reputation-heading">{{ reputation.szName }}</h1>
                        <span class="u-pvx-reputation-header-id">ID: {{ reputation.dwForceID }}</span>
                    </div>
                    <div class="m-pvx-reputation-guide-tip">
                        <PvxRobotTip
                            type-name="声望"
                            :reply="reputation.szName"
                            variant="modern"
                            :quick-guide-text="$t('pages.reputation.single.ui.robot.quickGuide')"
                            :copy-success-title="$t('pages.reputation.single.ui.robot.copySuccess')"
                            :reply-prefix="$t('pages.reputation.single.ui.robot.replyPrefix')"
                            :reply-suffix="$t('pages.reputation.single.ui.robot.replySuffix')"
                            :copy-qq-label="$t('pages.reputation.single.ui.robot.copyQq')"
                            :copy-command-label="$t('pages.reputation.single.ui.robot.copyCommand')"
                        />
                    </div>
                </PvxSurface>

                <PvxSurface class="m-pvx-reputation-overview" padding="medium">
                    <PvxSectionHeader
                        class="m-pvx-reputation-section-header"
                        :title="$t('pages.reputation.single.ui.sections.overview')"
                        :description="$t('pages.reputation.single.ui.sections.overviewDescription')"
                        level="h2"
                    >
                        <template #icon><CollectionTag /></template>
                    </PvxSectionHeader>
                    <div class="m-pvx-reputation-meta-grid">
                        <div class="u-pvx-reputation-meta">
                            <span class="u-pvx-reputation-meta__label">
                                {{ $t("pages.reputation.single.ui.fields.id") }}
                            </span>
                            <span class="u-pvx-reputation-meta__value">{{ reputation.dwForceID }}</span>
                        </div>
                        <div v-if="reputation.GroupName" class="u-pvx-reputation-meta">
                            <span class="u-pvx-reputation-meta__label">
                                {{ $t("pages.reputation.single.ui.fields.group") }}
                            </span>
                            <span class="u-pvx-reputation-meta__value">{{ reputation.GroupName }}</span>
                        </div>
                        <div v-if="reputation.szMapNames?.length" class="u-pvx-reputation-meta">
                            <span class="u-pvx-reputation-meta__label">
                                {{ $t("pages.reputation.single.ui.fields.map") }}
                            </span>
                            <span class="u-pvx-reputation-meta__value">{{ reputation.szMapNames[0] }}</span>
                        </div>
                        <div class="u-pvx-reputation-meta">
                            <span class="u-pvx-reputation-meta__label">
                                {{ $t("pages.reputation.single.ui.fields.lostRespect") }}
                            </span>
                            <span class="u-pvx-reputation-meta__value">
                                {{ reputationPath || LOST_RESPECT_UNAVAILABLE }}
                            </span>
                        </div>
                        <div class="u-pvx-reputation-meta u-pvx-reputation-meta--description">
                            <span class="u-pvx-reputation-meta__label">
                                {{ $t("pages.reputation.single.ui.fields.description") }}
                            </span>
                            <span class="u-pvx-reputation-meta__value" v-html="reputation.szDesc"></span>
                        </div>
                    </div>
                </PvxSurface>

                <PvxSurface v-if="reputation.servant" class="m-pvx-reputation-servant" padding="medium">
                    <PvxSectionHeader
                        class="m-pvx-reputation-section-header"
                        :title="$t('pages.reputation.single.ui.sections.servant')"
                        :description="$t('pages.reputation.single.ui.sections.servantDescription')"
                        level="h2"
                    >
                        <template #icon><User /></template>
                    </PvxSectionHeader>
                    <div class="m-pvx-reputation-servant__content">
                        <div class="u-pvx-reputation-servant-image">
                            <img
                                v-if="reputation.servant.szImagePath"
                                :src="getReputationIcon(reputation.servant.szImagePath, 'partner')"
                                :alt="reputation.servant.szNpcName"
                                @error="replaceServantByDefault"
                            />
                            <img v-else src="@/assets/img/reputation/sw-null.jpg" alt="" />
                        </div>
                        <div class="m-pvx-reputation-servant__info">
                            <h3>{{ reputation.servant.szNpcName }}</h3>
                            <div
                                v-if="reputation.servant.szDescBrief"
                                class="u-pvx-reputation-servant-desc"
                                v-html="reputation.servant.szDescBrief"
                            ></div>
                            <div
                                v-if="reputation.servant.szDescPersonality"
                                class="u-pvx-reputation-servant-desc"
                                v-html="formatMultiline(reputation.servant.szDescPersonality)"
                            ></div>
                            <div
                                v-if="reputation.servant.szBuffName || reputation.servant.szBuffDesc"
                                class="m-pvx-reputation-blessing"
                            >
                                <span class="u-pvx-reputation-blessing__label">
                                    {{ $t("pages.reputation.single.ui.blessing") }}
                                </span>
                                <strong>{{ reputation.servant.szBuffName }}</strong>
                                <span>{{ reputation.servant.szBuffDesc }}</span>
                            </div>
                        </div>
                    </div>
                </PvxSurface>

                <PvxSurface v-if="showMap" class="m-pvx-reputation-map-section" padding="medium">
                    <PvxSectionHeader
                        class="m-pvx-reputation-section-header"
                        :title="$t('pages.reputation.single.ui.sections.map')"
                        :description="mapDescription"
                        level="h2"
                    >
                        <template #icon><Location /></template>
                    </PvxSectionHeader>
                    <div class="m-pvx-reputation-map-frame">
                        <ReputationMap
                            ref="map"
                            localized
                            :name="reputation.szMapNames[0]"
                            :list="reputation.points"
                        />
                    </div>
                </PvxSurface>

                <PvxSurface v-if="showPath" class="m-pvx-reputation-rewards" padding="medium">
                    <PvxSectionHeader
                        class="m-pvx-reputation-section-header"
                        :title="$t('pages.reputation.single.ui.sections.rewards')"
                        :description="$t('pages.reputation.single.ui.sections.rewardsDescription')"
                        level="h2"
                    >
                        <template #icon><Trophy /></template>
                    </PvxSectionHeader>
                    <div class="m-pvx-reputation-rewards__content">
                        <div class="m-pvx-reputation-stage-list">
                            <button
                                v-for="(item, index) in reputation.gainList"
                                :key="`${item.fromID}-${item.toID}-${index}`"
                                type="button"
                                class="u-pvx-reputation-stage"
                                :class="{ 'is-active': stage === index }"
                                @click="stage = index"
                            >
                                <span class="u-pvx-reputation-stage__range">
                                    {{ item.from }}
                                    <ArrowRight />
                                    {{ item.to }}
                                </span>
                                <span class="u-pvx-reputation-stage__method">
                                    <b>{{ $t("pages.reputation.single.ui.improveMethod") }}</b>
                                    {{ item.desc }}
                                </span>
                            </button>
                        </div>
                        <div class="m-pvx-reputation-stage-reward">
                            <div class="m-pvx-reputation-stage-reward__header">
                                <h3>{{ rewardTitle }}</h3>
                                <div
                                    v-if="pageLen > 1"
                                    class="m-pvx-reputation-page-list"
                                    :aria-label="$t('pages.reputation.single.ui.rewardPagination')"
                                >
                                    <button
                                        v-for="page in pageLen"
                                        :key="page"
                                        type="button"
                                        class="u-pvx-reputation-page"
                                        :class="{ 'is-active': page === currentPage }"
                                        @click="currentPage = page"
                                    >
                                        {{ page }}
                                    </button>
                                </div>
                            </div>
                            <div v-if="currentRewards.length" class="m-pvx-reputation-reward-list">
                                <ItemIcon
                                    v-for="(reward, index) in currentRewards"
                                    :key="`${reward}-${index}`"
                                    :item_id="reward"
                                    :onlyIcon="true"
                                    :size="40"
                                    class="u-item-icon"
                                />
                            </div>
                            <div v-else class="u-pvx-reputation-no-reward">
                                {{ $t("pages.reputation.single.ui.noRewards") }}
                            </div>
                        </div>
                    </div>
                </PvxSurface>

                <PvxUser
                    class="m-pvx-reputation-community"
                    :id="achievementId"
                    :name="$t('pages.reputation.single.ui.typeName')"
                    type="achievement"
                    i18n-key-prefix="pages.reputation.single.ui.wiki"
                />
            </div>
        </PvxPageShell>
    </div>
</template>

<script>
import PvxUser from "@/components/PvxUser.vue";
import ReputationMap from "@/components/reputation/ReputationMap.vue";
import ItemIcon from "@/components/common/item_icon.vue";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { ArrowLeft, ArrowRight, CollectionTag, Location, Trophy, User } from "@element-plus/icons-vue";
import {
    DEFAULT_REPUTATION_ICON,
    getReputationIcon,
    getReputationPath,
    LOST_RESPECT_UNAVAILABLE,
} from "@/utils/reputation";

export default {
    name: "SinglePc",
    props: {
        reputation: { type: Object, required: true },
        achievementId: { type: Number, default: null },
        showPath: { type: Boolean, default: false },
        stageList: { type: Array, default: () => [] },
        pageLen: { type: Number, default: 0 },
    },
    components: {
        ReputationMap,
        ItemIcon,
        PvxUser,
        PvxSingleAdminDrop,
        PvxRobotTip,
        PvxActionButton,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        ArrowLeft,
        ArrowRight,
        CollectionTag,
        Location,
        Trophy,
        User,
    },
    data() {
        return {
            stage: -1,
            currentPage: 1,
            LOST_RESPECT_UNAVAILABLE,
        };
    },
    computed: {
        reputationPath() {
            return getReputationPath(this.reputation.szName);
        },
        showMap() {
            return Boolean(
                this.reputation.szMapNames?.length &&
                this.reputation.Guides?.length &&
                !this.reputation.hiddenMap
            );
        },
        mapDescription() {
            const npcName = this.reputation.Guides?.[0]?.npcName;
            const mapName = this.reputation.szMapNames?.[0];
            if (npcName && mapName) return `${npcName} · ${mapName}`;
            return npcName || mapName || this.$t("pages.reputation.single.ui.sections.mapDescription");
        },
        rewardTitle() {
            const current = this.reputation.gainList?.[this.stage];
            return current
                ? this.$t("pages.reputation.single.ui.rewardTitle", { stage: current.to })
                : this.$t("pages.reputation.single.ui.stageRewards");
        },
        currentRewards() {
            return this.stageList?.[this.currentPage - 1] || [];
        },
    },
    watch: {
        stage: {
            immediate: true,
            handler(stage) {
                this.currentPage = 1;
                this.$emit("stage-change", stage);
            },
        },
        "reputation.gainList": {
            immediate: true,
            handler(list) {
                if (list?.length && this.stage === -1) {
                    this.stage = 0;
                }
            },
        },
    },
    methods: {
        getReputationIcon,
        goBack() {
            this.$router.push({ name: "reputation" });
        },
        replaceReputationIconByDefault(e) {
            e.target.src = DEFAULT_REPUTATION_ICON;
        },
        replaceServantByDefault(e) {
            e.target.src = require("@/assets/img/reputation/sw-null.jpg");
        },
        formatMultiline(value) {
            return value?.replace(/\\n/g, "<br>") || "";
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/single.less";
@import "~@/assets/css/modules/reputation-detail-theme.less";
</style>
