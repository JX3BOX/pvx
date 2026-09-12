<script>
import { Refresh, ArrowUp } from "@element-plus/icons-vue";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import { __Root } from "@/utils/config";

import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
import pointsIcon from "@/assets/img/wiki/figma/points.png";
import normalIcon from "@/assets/img/wiki/figma/tier-normal.svg";
import wujiaIcon from "@/assets/img/wiki/figma/tier-wujia.svg";
import hiddenIcon from "@/assets/img/wiki/figma/tier-hidden.svg";
import retiredIcon from "@/assets/img/wiki/figma/tier-retired.svg";

const TIER_DEFINITIONS = Object.freeze([
    {
        key: "normal",
        icon: "Document",
        labelKey: "statistics.regular",
        badgeKey: "statistics.visibleAchievement",
        actionKey: "workbench.filterNormalAchievements",
    },
    {
        key: "wujia",
        icon: "Trophy",
        labelKey: "statistics.wujia",
        badgeKey: "statistics.visibleAchievement",
        actionKey: "workbench.filterWujiaAchievements",
    },
    {
        key: "hidden",
        icon: "Hide",
        labelKey: "workbench.hiddenTier",
        badgeKey: "statistics.hiddenAchievement",
        actionKey: "workbench.viewHiddenAchievements",
        href: `${__Root}bbs/8104`,
    },
    {
        key: "retired",
        icon: "WarningFilled",
        labelKey: "statistics.retired",
        badgeKey: "statistics.retiredAchievement",
    },
]);

export default {
    name: "AchievementProgressSummary",
    components: {
        Refresh,
        RoleAvatar,
        ArrowUp,
    },
    props: {
        showToolbar: { type: Boolean, default: true },
        collapsed: {
            type: Boolean,
            default: false,
        },
        currentRole: {
            type: Object,
            default: null,
        },
        currentRoleId: {
            type: String,
            default: "",
        },
        roles: {
            type: Array,
            default: () => [],
        },
        overall: {
            type: Object,
            default: () => ({}),
        },
        tiers: {
            type: Array,
            default: () => [],
        },
        activeTier: {
            type: String,
            default: "normal",
        },
        loading: {
            type: Boolean,
            default: false,
        },
        syncedAt: {
            type: String,
            default: null,
        },
        synced: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["select-tier", "select-role", "update:collapsed"],
    data() {
        return {
            pointsIcon,
            avatarFailed: false,
            schoolIconFailed: false,
            tierIcons: { normal: normalIcon, wujia: wujiaIcon, hidden: hiddenIcon, retired: retiredIcon },
        };
    },
    watch: {
        currentRole() {
            this.avatarFailed = false;
            this.schoolIconFailed = false;
        },
    },
    computed: {
        ringStyle() {
            const progress = Math.max(0, Math.min(100, Number(this.overall?.pointProgress) || 0));
            return {
                background: `conic-gradient(from 0deg, #dcaf4f 0%, #6e572c ${progress}%, #e5e5e5 ${progress}% 100%)`,
            };
        },
        tierItems() {
            const statistics = Object.fromEntries((this.tiers || []).map((item) => [item.key, item]));
            return TIER_DEFINITIONS.map((definition) => ({
                ...definition,
                ...(statistics[definition.key] || {}),
            }));
        },
    },
    methods: {
        showSchoolIcon,
        selectRole(roleId) {
            this.$emit("select-role", String(roleId));
        },
        formatNumber(value) {
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale).format(Number(value) || 0);
        },
        formatPercent(value) {
            return value === null || value === undefined ? "—" : `${Number(Number(value).toFixed(1))}%`;
        },
        getTierNote(item) {
            if (item.key === "retired") return this.$t("pages.wiki.overview.ui.statistics.retiredUnavailable");
            return this.$t("pages.wiki.overview.ui.statistics.remainingPoints", {
                points: this.formatNumber(item.remainingPoints),
            });
        },
    },
};
</script>

<template>
    <section
        class="m-progress-summary"
        :class="{ 'is-collapsed': collapsed }"
        v-loading="loading"
        :aria-label="$t('pages.wiki.overview.ui.overview')"
    >
        <article class="m-progress-overall-card">
            <el-dropdown popper-class="m-achievement-theme-popper" v-if="showToolbar" trigger="click" class="m-progress-role-switch" @command="selectRole">
                <button
                    type="button"
                    class="u-progress-role-switch"
                    :aria-label="$t('pages.wiki.overview.ui.switchRole')"
                >
                    <Refresh aria-hidden="true" />{{ $t("achievementAppearance.changeRole") }}
                </button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item
                            v-for="role in roles"
                            :key="role.id"
                            :command="role.id"
                            :disabled="role.id === currentRoleId"
                            >{{ role.name || "—" }} · {{ role.server || "—" }}</el-dropdown-item
                        >
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <div
                v-show="!collapsed"
                class="m-progress-ring"
                :style="ringStyle"
                role="img"
                :aria-label="
                    $t('pages.wiki.overview.ui.statistics.pointProgress') + ' ' + formatPercent(overall.pointProgress)
                "
            >
                <div class="m-progress-ring__inner">
                    <RoleAvatar
                        v-if="currentRole?.school && currentRole?.bodyType && !avatarFailed"
                        :mount="currentRole.school"
                        @error="avatarFailed = true"
                        :body_type="currentRole.bodyType"
                        :alt="currentRole.name || ''"
                    />
                    <img
                        v-else-if="currentRole?.school && !schoolIconFailed"
                        class="is-school"
                        :src="showSchoolIcon(currentRole.school)"
                        @error="schoolIconFailed = true"
                        alt=""
                    />
                    <span v-else class="u-progress-avatar-fallback">{{ (currentRole?.name || "—").slice(0, 1) }}</span>
                    <b>{{ formatPercent(overall.pointProgress) }}</b>
                </div>
            </div>
            <div
                class="m-progress-overall-points"
                :title="formatNumber(overall.completedPoints) + ' / ' + formatNumber(overall.totalPoints)"
            >
                <img :src="pointsIcon" alt="" /><strong>{{ formatNumber(overall.completedPoints) }}</strong>
            </div>
            <div class="m-progress-role-name">
                <img
                    v-if="currentRole?.school && !schoolIconFailed"
                    :src="showSchoolIcon(currentRole.school)"
                    @error="schoolIconFailed = true"
                    :alt="$t('pages.wiki.overview.ui.schoolIcon')"
                />
                <strong>{{ currentRole?.name || "—" }}·{{ currentRole?.server || "—" }}</strong>
            </div>
            <span v-if="collapsed" class="m-progress-overall-percent">{{ formatPercent(overall.pointProgress) }}</span>
        </article>

        <section class="m-progress-tier-panel" :aria-label="$t('pages.wiki.overview.ui.workbench.tierTitle')">
            <header class="m-progress-section-title">
                <h2 v-show="!collapsed">{{ $t("pages.wiki.overview.ui.workbench.tierTitle") }}</h2>
                <span
                    v-show="!collapsed"
                    class="m-progress-sync"
                    :class="{ 'is-synced': synced }"
                    :title="
                        synced
                            ? $t('pages.wiki.overview.ui.workbench.synced')
                            : $t('pages.wiki.overview.ui.workbench.notSynced')
                    "
                >
                    {{
                        synced && syncedAt && !loading
                            ? $t("achievementAppearance.syncTime", { time: syncedAt })
                            : $t(
                                  synced
                                      ? "pages.wiki.overview.ui.workbench.synced"
                                      : "pages.wiki.overview.ui.workbench.notSynced"
                              )
                    }}
                </span>
                <button
                    v-if="showToolbar"
                    type="button"
                    class="u-progress-summary-toggle"
                    :aria-expanded="!collapsed"
                    aria-controls="achievement-progress-summary-details"
                    @click="$emit('update:collapsed', !collapsed)"
                >
                    <span>{{
                        $t(
                            collapsed
                                ? "pages.wiki.overview.ui.workbench.summaryExpand"
                                : "pages.wiki.overview.ui.workbench.summaryCollapse"
                        )
                    }}</span>
                    <ArrowUp :class="{ 'is-collapsed': collapsed }" aria-hidden="true" />
                </button>
            </header>
            <div id="achievement-progress-summary-details" class="m-progress-tier-grid">
                <article
                    v-for="item in tierItems"
                    :key="item.key"
                    class="m-progress-tier-card"
                    :class="[
                        {
                            'is-clickable': Boolean(item.actionKey),
                            'is-selected': !item.href && item.key === activeTier,
                        },
                        'is-' + item.key,
                    ]"
                >
                    <div class="m-progress-tier-card__header">
                        <h3>
                            <img :src="tierIcons[item.key]" alt="" />{{ $t("pages.wiki.overview.ui." + item.labelKey) }}
                        </h3>
                        <span class="m-progress-tier-hint">{{
                            $t(
                                "achievementAppearance." +
                                    (item.key === "retired"
                                        ? "unavailable"
                                        : item.href
                                        ? "hiddenGuide"
                                        : item.key === activeTier
                                        ? "selected"
                                        : "filter")
                            )
                        }}</span>
                        <strong class="m-progress-tier-percent">{{ formatPercent(item.pointProgress) }}</strong>
                    </div>
                    <div class="m-progress-tier-statistics">
                        <p class="m-progress-tier-count">
                            <b>[{{ $t("achievementAppearance.count") }}]</b> {{ formatNumber(item.completedCount) }}
                            <span>/ {{ formatNumber(item.totalCount) }}</span>
                        </p>
                        <p class="m-progress-tier-points">
                            <b>[{{ $t("achievementAppearance.points") }}]</b> {{ formatNumber(item.completedPoints) }}
                            <span>/ {{ formatNumber(item.totalPoints) }}</span>
                        </p>
                        <p class="m-progress-tier-remaining-count" v-if="item.key !== 'retired'">
                            {{
                                $t("achievementAppearance.remainingCount", { count: formatNumber(item.remainingCount) })
                            }}
                        </p>
                        <p class="m-progress-tier-note">{{ getTierNote(item) }}</p>
                    </div>
                    <div class="m-progress-tier-track" aria-hidden="true">
                        <span :style="{ width: Math.max(0, Math.min(100, item.pointProgress || 0)) + '%' }"></span>
                    </div>
                    <a
                        v-if="item.href"
                        class="u-progress-tier-card-link"
                        :href="item.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        :aria-label="$t('pages.wiki.overview.ui.' + item.actionKey)"
                    ></a>
                    <button
                        v-else-if="item.actionKey"
                        type="button"
                        class="u-progress-tier-card-link"
                        :aria-label="$t('pages.wiki.overview.ui.' + item.actionKey)"
                        :aria-pressed="item.key === activeTier"
                        @click="$emit('select-tier', item.key)"
                    ></button>
                </article>
            </div>
        </section>
    </section>
</template>

<style lang="less" scoped>
.m-progress-summary {
    display: grid;
    grid-template-columns: minmax(240px, 360px) minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
    border-radius: 16px;
    background: #fff;
    min-width: 0;
}
.m-progress-overall-card {
    position: relative;
    display: flex;
    min-width: 0;
    min-height: 376px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    padding: 36px 12px 24px;
    border-radius: 8px;
    background: linear-gradient(134deg, #f7f1e7, #fff 49%, #f7f1e7);
    color: #6e572c;
}
.m-progress-role-switch {
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 3;
}
.u-progress-role-switch {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 2px 8px;
    border: 1px solid #eae5e1;
    border-radius: 99px;
    background: #fff;
    color: #967944;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    svg {
        width: 14px;
        height: 14px;
    }
}
.m-progress-ring {
    width: 184px;
    height: 184px;
    padding: 11px;
    border-radius: 50%;
}
.m-progress-ring__inner {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 50%;
    background: #fff;
    > img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    > img.is-school {
        padding: 28px;
        object-fit: contain;
    }
    b {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        padding: 14px 0 2px;
        background: linear-gradient(transparent, #6e572c99);
        color: #fff;
        text-align: center;
        font-size: 18px;
        font-weight: 400;
    }
}
.u-progress-avatar-fallback {
    display: grid;
    height: 100%;
    place-items: center;
    font-size: 56px;
    color: #967944;
}
.m-progress-overall-points {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    border-radius: 99px;
    background: #fdfcf9;
    img {
        width: 32px;
        height: 32px;
        object-fit: contain;
    }
    strong {
        font-size: 40px;
        line-height: 1.2;
    }
}
.m-progress-role-name {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    text-align: center;
    font-size: 20px;
    img {
        flex: none;
        width: 24px;
        height: 24px;
        object-fit: contain;
    }
    strong {
        min-width: 0;
        overflow-wrap: anywhere;
    }
}
.m-progress-tier-panel {
    min-width: 0;
    padding: 12px;
    border-radius: 16px;
    background: #f8f7f3;
}
.m-progress-section-title {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 24px;
    margin-bottom: 12px;
    min-height: 24px;
    h2 {
        display: flex;
        flex: none;
        align-items: center;
        gap: 8px;
        margin: 0;
        color: #333;
        font-size: 16px;
        font-weight: 500;
    }
    h2::before {
        content: "";
        width: 6px;
        height: 18px;
        border-radius: 99px;
        background: #5a7e84;
    }
}
.m-progress-sync {
    color: #999;
    font-size: 14px;
    overflow-wrap: anywhere;
}
.u-progress-summary-toggle {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-left: auto;
    padding: 0;
    min-height: 24px;
    border: 0;
    color: #967944;
    background: transparent;
    font: inherit;
    cursor: pointer;
    svg {
        width: 14px;
        height: 14px;
        &.is-collapsed {
            transform: rotate(180deg);
        }
    }
}
.m-progress-tier-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}
.m-progress-tier-card {
    position: relative;
    min-width: 0;
    min-height: 154px;
    padding: 16px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: #fcfcfa;
    &.is-selected {
        border-color: #5a7e84;
        background: #fff;
        box-shadow: 0 0 4px #5a7e8480;
    }
    &.is-clickable:hover {
        border-color: #5a7e84;
        background: #fff;
    }
}
.m-progress-tier-card__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    min-width: 0;
    h3 {
        display: flex;
        flex: none;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 20px;
        color: #333;
        font-weight: 500;
    }
    img {
        width: 32px;
        height: 32px;
        object-fit: contain;
    }
}
.m-progress-tier-hint {
    color: #999;
    font-size: 14px;
}
.m-progress-tier-percent {
    margin-left: auto;
    color: #5a7e84;
    font-size: 20px;
    white-space: nowrap;
}
.m-progress-tier-statistics {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px 8px;
    font-size: 16px;
    color: #6e572c;
    p {
        margin: 0;
    }
    b {
        font-weight: 600;
    }
    span {
        color: #999;
    }
}
.m-progress-tier-count {
    grid-area: 1 / 1;
}
.m-progress-tier-points {
    grid-area: 2 / 1;
}
.m-progress-tier-remaining-count {
    grid-area: 1 / 2;
    text-align: right;
}
.m-progress-tier-note {
    grid-area: 2 / 2;
    text-align: right;
}
.m-progress-tier-track {
    height: 10px;
    margin-top: 12px;
    overflow: hidden;
    border-radius: 99px;
    background: #eae5e1;
    span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: #5a7e84;
    }
}
.u-progress-tier-card-link {
    position: absolute;
    inset: 0;
    z-index: 1;
    border: 0;
    border-radius: inherit;
    background: transparent;
    cursor: pointer;
}
.m-progress-summary.is-collapsed {
    .m-progress-overall-card {
        min-height: 92px;
        gap: 0;
        align-items: flex-start;
        justify-content: space-between;
        padding: 12px;
        background: #f8f7f3;
    }
    .m-progress-role-name {
        order: -1;
        padding-right: 55px;
        text-align: left;
        font-size: 16px;
        img {
            width: 20px;
            height: 20px;
        }
    }
    .m-progress-overall-points {
        padding: 0;
        background: transparent;
        strong {
            font-size: 30px;
        }
        img {
            width: 28px;
            height: 28px;
        }
    }
    .m-progress-overall-percent {
        position: absolute;
        right: 12px;
        bottom: 8px;
        color: #999;
        font-size: 20px;
    }
    .m-progress-tier-panel {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
    }
    .m-progress-section-title {
        order: 2;
        flex: none;
        margin: 0;
    }
    .u-progress-summary-toggle {
        flex-direction: column;
        font-size: 13px;
    }
    .m-progress-tier-grid {
        flex: 1;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
    }
    .m-progress-tier-card {
        min-height: 68px;
        padding: 8px 12px;
    }
    .m-progress-tier-card__header {
        gap: 6px;
        margin-bottom: 0;
        flex-wrap: wrap;
        h3 {
            font-size: 18px;
        }
        img {
            display: none;
        }
    }
    .m-progress-tier-hint {
        font-size: 13px;
    }
    .m-progress-tier-percent {
        position: absolute;
        top: 8px;
        right: 12px;
        font-size: 18px;
    }
    .m-progress-tier-card__header {
        padding-right: 40px;
    }
    .m-progress-tier-statistics {
        display: block;
        font-size: 16px;
    }
    .m-progress-tier-count,
    .m-progress-tier-remaining-count,
    .m-progress-tier-note,
    .m-progress-tier-track,
    .m-progress-tier-points b {
        display: none;
    }
}
@media (max-width: 1500px) {
    .m-progress-summary {
        grid-template-columns: 280px minmax(0, 1fr);
    }
    .m-progress-tier-card__header {
        flex-wrap: wrap;
        gap: 4px 8px;
        h3 {
            font-size: 18px;
        }
    }
    .m-progress-tier-hint {
        font-size: 13px;
    }
    .m-progress-tier-statistics {
        font-size: 14px;
    }
    .m-progress-summary.is-collapsed {
        .m-progress-tier-hint {
            display: none;
        }
        .m-progress-tier-card__header h3 {
            font-size: 16px;
        }
        .m-progress-tier-percent {
            font-size: 16px;
        }
    }
}
@media (max-width: 1100px) {
    .m-progress-summary {
        grid-template-columns: 220px minmax(0, 1fr);
    }
    .m-progress-overall-points strong {
        font-size: 32px;
    }
    .m-progress-role-name {
        font-size: 16px;
    }
    .m-progress-tier-statistics {
        grid-template-columns: 1fr;
    }
    .m-progress-tier-remaining-count {
        grid-area: 3 / 1;
        text-align: left;
    }
    .m-progress-tier-note {
        grid-area: 4 / 1;
        text-align: left;
    }
    .m-progress-summary.is-collapsed {
        grid-template-columns: 1fr;
    }
}
@media (max-width: @phone) {
    .m-progress-summary {
        grid-template-columns: 1fr;
        padding: 8px;
        gap: 8px;
    }
    .m-progress-overall-card {
        min-height: 220px;
        gap: 10px;
        padding: 16px 12px;
    }
    .m-progress-ring {
        width: 144px;
        height: 144px;
        padding: 8px;
    }
    .m-progress-overall-points strong {
        font-size: 30px;
    }
    .m-progress-role-switch {
        top: 8px;
        right: 8px;
    }
    .u-progress-role-switch {
        min-height: 44px;
    }
    .m-progress-tier-panel {
        padding: 10px;
    }
    .m-progress-section-title {
        flex-wrap: wrap;
        gap: 6px 10px;
    }
    .m-progress-sync {
        order: 3;
        flex-basis: 100%;
        font-size: 13px;
    }
    .u-progress-summary-toggle {
        min-height: 44px;
    }
    .m-progress-tier-card {
        min-height: 128px;
        padding: 10px;
    }
    .m-progress-tier-card__header h3 {
        font-size: 16px;
        gap: 4px;
        img {
            width: 24px;
            height: 24px;
        }
    }
    .m-progress-tier-hint {
        display: none;
    }
    .m-progress-tier-percent {
        font-size: 16px;
    }
    .m-progress-tier-grid {
        gap: 8px;
    }
    .m-progress-summary.is-collapsed {
        .m-progress-tier-panel {
            flex-direction: column;
            align-items: stretch;
        }
        .m-progress-tier-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
        }
        .m-progress-section-title {
            order: 0;
        }
        .u-progress-summary-toggle {
            flex-direction: row;
        }
        .m-progress-overall-card {
            padding-top: 16px;
            min-height: 100px;
        }
    }
}
</style>
