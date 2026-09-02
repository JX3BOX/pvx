<script>
import { ArrowUp, Document, Filter, Hide, Trophy, WarningFilled } from "@element-plus/icons-vue";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";

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
        actionKey: "workbench.filterHiddenAchievements",
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
        ArrowUp,
        Document,
        Filter,
        Hide,
        Trophy,
        WarningFilled,
    },
    props: {
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
        synced: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["select-tier", "select-role", "update:collapsed"],
    computed: {
        ringStyle() {
            const progress = Math.max(0, Math.min(100, Number(this.overall?.pointProgress) || 0));
            return {
                background: `conic-gradient(#47777d 0 ${progress}%, rgba(71, 119, 125, 0.13) ${progress}% 100%)`,
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
            return value === null || value === undefined ? "—" : `${Number(value).toFixed(1)}%`;
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
        <div class="m-progress-rolebar">
            <div class="m-progress-rolebar__control">
                <span>{{ $t("pages.wiki.overview.ui.workbench.currentRole") }}</span>
                <el-select
                    :model-value="currentRoleId"
                    class="u-progress-role-select"
                    :aria-label="$t('pages.wiki.overview.ui.switchRole')"
                    @change="selectRole"
                >
                    <el-option
                        v-for="role in roles"
                        :key="role.id"
                        :value="role.id"
                        :label="`${role.name || '—'} · ${role.server || '—'}`"
                    />
                </el-select>
            </div>
            <div class="m-progress-rolebar__status">
                <div class="m-progress-sync" :class="{ 'is-synced': synced }">
                    <span class="u-progress-sync-dot" aria-hidden="true"></span>
                    {{
                        synced
                            ? $t("pages.wiki.overview.ui.workbench.synced")
                            : $t("pages.wiki.overview.ui.workbench.notSynced")
                    }}
                </div>
                <button
                    type="button"
                    class="u-progress-summary-toggle"
                    :aria-expanded="!collapsed"
                    aria-controls="achievement-progress-summary-details"
                    @click="$emit('update:collapsed', !collapsed)"
                >
                    <span>
                        {{
                            collapsed
                                ? $t("pages.wiki.overview.ui.workbench.summaryExpand")
                                : $t("pages.wiki.overview.ui.workbench.summaryCollapse")
                        }}
                    </span>
                    <ArrowUp :class="{ 'is-collapsed': collapsed }" aria-hidden="true" />
                </button>
            </div>
        </div>

        <div id="achievement-progress-summary-details" v-show="!collapsed" class="m-progress-summary-grid">
            <article class="m-progress-overall-card">
                <h2>{{ $t("pages.wiki.overview.ui.workbench.overallTitle") }}</h2>
                <div class="m-progress-overall-card__body">
                    <div class="m-progress-ring" :style="ringStyle">
                        <div class="m-progress-ring__inner">
                            <strong>{{ formatNumber(overall.completedPoints) }}</strong>
                            <span>
                                {{ $t("pages.wiki.overview.ui.statistics.seniorityUnit") }} /
                                {{ formatNumber(overall.totalPoints) }}
                            </span>
                            <b>{{ formatPercent(overall.pointProgress) }}</b>
                        </div>
                    </div>

                    <dl class="m-progress-role-meta">
                        <div>
                            <dt>{{ $t("pages.wiki.overview.ui.workbench.role") }}</dt>
                            <dd>
                                <img
                                    v-if="currentRole?.school"
                                    :src="showSchoolIcon(currentRole.school)"
                                    :alt="$t('pages.wiki.overview.ui.schoolIcon')"
                                />
                                {{ currentRole?.name || "—" }}
                            </dd>
                        </div>
                        <div>
                            <dt>{{ $t("pages.wiki.overview.ui.workbench.server") }}</dt>
                            <dd>{{ currentRole?.server || "—" }}</dd>
                        </div>
                        <div>
                            <dt>{{ $t("pages.wiki.overview.ui.workbench.completedAchievements") }}</dt>
                            <dd>{{ formatNumber(overall.completedCount) }} / {{ formatNumber(overall.totalCount) }}</dd>
                        </div>
                    </dl>
                </div>
            </article>

            <section class="m-progress-tier-panel" :aria-label="$t('pages.wiki.overview.ui.workbench.tierTitle')">
                <div class="m-progress-section-title">
                    <h2>{{ $t("pages.wiki.overview.ui.workbench.tierTitle") }}</h2>
                </div>

                <div class="m-progress-tier-grid">
                    <article
                        v-for="item in tierItems"
                        :key="item.key"
                        class="m-progress-tier-card"
                        :class="[
                            `is-${item.key}`,
                            {
                                'is-clickable': Boolean(item.actionKey),
                                'is-selected': item.key === activeTier,
                            },
                        ]"
                    >
                        <div class="m-progress-tier-card__header">
                            <h3>
                                <component :is="item.icon" aria-hidden="true" />
                                {{ $t(`pages.wiki.overview.ui.${item.labelKey}`) }}
                            </h3>
                            <span :class="`is-${item.key}`">
                                {{ $t(`pages.wiki.overview.ui.${item.badgeKey}`) }}
                            </span>
                        </div>
                        <p class="m-progress-tier-points">
                            <strong>{{ formatNumber(item.completedPoints) }}</strong>
                            / {{ formatNumber(item.totalPoints) }}
                            <small>{{ $t("pages.wiki.overview.ui.statistics.seniorityUnit") }}</small>
                        </p>
                        <p class="m-progress-tier-count">
                            {{
                                $t("pages.wiki.overview.ui.achievementCount", {
                                    own: formatNumber(item.completedCount),
                                    all: formatNumber(item.totalCount),
                                })
                            }}
                        </p>
                        <div class="m-progress-tier-track" aria-hidden="true">
                            <span :style="{ width: `${item.pointProgress || 0}%` }"></span>
                        </div>
                        <div class="m-progress-tier-card__footer">
                            <p class="m-progress-tier-note">{{ getTierNote(item) }}</p>
                            <span v-if="item.actionKey" class="u-progress-tier-link-hint" aria-hidden="true">
                                {{ $t(`pages.wiki.overview.ui.${item.actionKey}`) }}
                                <Filter />
                            </span>
                        </div>
                        <button
                            v-if="item.actionKey"
                            type="button"
                            class="u-progress-tier-card-link"
                            :aria-label="$t(`pages.wiki.overview.ui.${item.actionKey}`)"
                            :aria-pressed="item.key === activeTier"
                            @click="$emit('select-tier', item.key)"
                        ></button>
                    </article>
                </div>
            </section>
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-progress-summary {
    overflow: hidden;
    border: 1px solid rgba(70, 74, 66, 0.14);
    border-radius: 14px;
    background: rgba(255, 254, 250, 0.86);
}

.m-progress-rolebar {
    display: flex;
    min-height: 56px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 9px 14px;
    border-bottom: 1px solid rgba(70, 74, 66, 0.1);
    background: rgba(245, 241, 232, 0.72);
}

.m-progress-summary.is-collapsed .m-progress-rolebar {
    border-bottom-color: transparent;
}

.m-progress-rolebar__control {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 12px;
    color: #8b938f;
    font-size: 13px;
}

.u-progress-role-select {
    width: 230px;
}

.m-progress-rolebar__status {
    display: flex;
    align-items: center;
    gap: 14px;
}

.m-progress-sync {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #9c7960;
    font-size: 12px;
}

.u-progress-sync-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #b98a6a;
    box-shadow: 0 0 0 4px rgba(185, 138, 106, 0.12);
}

.m-progress-sync.is-synced {
    color: #47775f;

    .u-progress-sync-dot {
        background: #4e876d;
        box-shadow: 0 0 0 4px rgba(78, 135, 109, 0.12);
    }
}

.u-progress-summary-toggle {
    display: inline-flex;
    min-height: 32px;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px 10px;
    border: 1px solid rgba(71, 119, 125, 0.18);
    border-radius: 7px;
    color: #607174;
    background: rgba(255, 255, 252, 0.72);
    font: inherit;
    font-size: 12px;
    cursor: pointer;

    svg {
        width: 14px;
        height: 14px;
        transition: transform 160ms ease;

        &.is-collapsed {
            transform: rotate(180deg);
        }
    }

    &:hover {
        border-color: rgba(71, 119, 125, 0.38);
        color: #47777d;
        background: rgba(255, 255, 252, 0.94);
    }

    &:focus-visible {
        outline: 2px solid rgba(71, 119, 125, 0.5);
        outline-offset: 2px;
    }
}

.m-progress-summary-grid {
    display: grid;
    grid-template-columns: minmax(250px, 330px) minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
}

.m-progress-overall-card,
.m-progress-tier-panel {
    border: 1px solid rgba(70, 74, 66, 0.13);
    border-radius: 12px;
    background: rgba(255, 255, 252, 0.72);
}

.m-progress-overall-card {
    padding: 12px;

    h2 {
        margin: 0 0 10px;
        color: #384246;
        font-size: 16px;
    }
}

.m-progress-overall-card__body {
    display: grid;
    justify-items: center;
    gap: 12px;
}

.m-progress-ring {
    display: grid;
    width: 144px;
    height: 144px;
    place-items: center;
    border-radius: 50%;
    transform: rotate(-90deg);
}

.m-progress-ring__inner {
    display: flex;
    width: 116px;
    height: 116px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-radius: 50%;
    color: #344044;
    background: #fffef9;
    box-shadow: inset 0 0 0 1px rgba(71, 119, 125, 0.08);
    transform: rotate(90deg);

    strong {
        font-size: 24px;
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
    }

    span {
        margin-top: 4px;
        color: #9aa29f;
        font-size: 11px;
    }

    b {
        margin-top: 4px;
        color: #47777d;
        font-size: 13px;
    }
}

.m-progress-role-meta {
    display: grid;
    width: 100%;
    gap: 7px;
    margin: 0;

    > div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    dt {
        color: #9aa29f;
        font-size: 12px;
    }

    dd {
        display: inline-flex;
        min-width: 0;
        align-items: center;
        gap: 6px;
        margin: 0;
        color: #3f484b;
        font-size: 13px;
        font-weight: 600;
        text-align: right;
    }

    img {
        width: 18px;
        height: 18px;
    }
}

.m-progress-tier-panel {
    padding: 12px;
}

.m-progress-section-title {
    margin-bottom: 8px;

    h2 {
        margin: 0;
        color: #384246;
        font-size: 16px;
    }

}

.m-progress-tier-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.m-progress-tier-card {
    --tier-accent: #47777d;
    --tier-accent-rgb: 71, 119, 125;

    position: relative;
    display: flex;
    min-width: 0;
    min-height: 128px;
    padding: 12px;
    flex-direction: column;
    border: 1px solid rgba(70, 74, 66, 0.12);
    border-radius: 10px;
    background: rgba(251, 249, 243, 0.7);
    transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease, background-color 160ms ease;

    &.is-wujia {
        --tier-accent: #8c744c;
        --tier-accent-rgb: 140, 116, 76;
    }

    &.is-hidden {
        --tier-accent: #765f92;
        --tier-accent-rgb: 118, 95, 146;
    }

    &.is-retired {
        --tier-accent: #b05f57;
        --tier-accent-rgb: 176, 95, 87;
        background: rgba(248, 245, 239, 0.58);
    }

    &.is-clickable {
        overflow: hidden;
        background: linear-gradient(145deg, rgba(var(--tier-accent-rgb), 0.055), rgba(255, 254, 249, 0.82) 48%);
        box-shadow: inset 3px 0 0 rgba(var(--tier-accent-rgb), 0.46);
        cursor: pointer;

        &:hover,
        &:focus-within {
            border-color: rgba(var(--tier-accent-rgb), 0.38);
            background: linear-gradient(145deg, rgba(var(--tier-accent-rgb), 0.09), rgba(255, 254, 249, 0.92) 50%);
            box-shadow: inset 3px 0 0 var(--tier-accent), 0 10px 24px rgba(70, 62, 79, 0.09);
            transform: translateY(-2px);
        }
    }

    &.is-selected {
        border-color: rgba(var(--tier-accent-rgb), 0.46);
        background: linear-gradient(145deg, rgba(var(--tier-accent-rgb), 0.12), rgba(255, 254, 249, 0.94) 52%);
        box-shadow: inset 4px 0 0 var(--tier-accent), 0 8px 20px rgba(var(--tier-accent-rgb), 0.1);
    }
}

.u-progress-tier-link-hint {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border-radius: 999px;
    color: var(--tier-accent);
    background: rgba(var(--tier-accent-rgb), 0.09);
    font-size: 11px;
    font-weight: 600;
    line-height: 1;

    svg {
        width: 12px;
        height: 12px;
    }
}

.u-progress-tier-card-link {
    position: absolute;
    z-index: 2;
    inset: 0;
    border: 0;
    border-radius: inherit;
    background: transparent;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid rgba(var(--tier-accent-rgb), 0.68);
        outline-offset: 2px;
    }
}

.m-progress-tier-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    h3 {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 7px;
        margin: 0;
        color: #3c4649;
        font-size: 14px;

        svg {
            width: 16px;
            height: 16px;
            color: var(--tier-accent);
        }
    }

    > span {
        flex: none;
        padding: 3px 8px;
        border-radius: 999px;
        color: var(--tier-accent);
        background: rgba(var(--tier-accent-rgb), 0.1);
        font-size: 10px;
    }
}

.m-progress-tier-points {
    margin: 7px 0 1px;
    color: #566063;
    font-size: 13px;

    strong {
        color: #384246;
        font-size: 19px;
        font-variant-numeric: tabular-nums;
    }

    small {
        color: #9ba19f;
    }
}

.m-progress-tier-count,
.m-progress-tier-note {
    margin: 0;
    color: #9aa29f;
    font-size: 11px;
}

.m-progress-tier-card__footer {
    display: flex;
    min-width: 0;
    min-height: 24px;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
    padding-top: 6px;
    border-top: 1px solid rgba(var(--tier-accent-rgb), 0.11);
}

.m-progress-tier-note {
    min-width: 0;
}

.m-progress-tier-track {
    height: 5px;
    margin: 6px 0 5px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(71, 119, 125, 0.1);

    span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--tier-accent), #b6924d);
    }
}

@media (max-width: 980px) {
    .m-progress-summary-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .m-progress-overall-card__body {
        grid-template-columns: auto minmax(220px, 1fr);
        align-items: center;
    }
}

@media (max-width: 640px) {
    .m-progress-rolebar {
        align-items: stretch;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
    }

    .m-progress-rolebar__control {
        align-items: stretch;
        flex-direction: column;
        gap: 6px;
    }

    .u-progress-role-select {
        width: 100%;
    }

    .m-progress-rolebar__status {
        justify-content: space-between;
    }

    .m-progress-summary-grid {
        padding: 12px;
    }

    .m-progress-overall-card__body {
        grid-template-columns: minmax(0, 1fr);
    }

    .m-progress-tier-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .m-progress-tier-card__footer {
        align-items: flex-start;
        flex-direction: column;
    }
}

@media (prefers-reduced-motion: reduce) {
    .m-progress-tier-card,
    .u-progress-summary-toggle svg {
        transition: none;
    }
}
</style>
