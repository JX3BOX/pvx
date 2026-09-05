<script>
import PvxSurface from "@/components/design/PvxSurface.vue";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";

export default {
    name: "AchievementLeapSummary",
    components: { AchievementDifficultyStars, PvxSurface },
    props: {
        route: {
            type: Object,
            required: true,
        },
        title: {
            type: String,
            default: "",
        },
    },
    methods: {
        formatNumber(value) {
            return Number(value || 0).toLocaleString();
        },
        formatMinutes(value) {
            if (value === null || value === undefined) return "—";
            if (value < 60) return this.$t("pages.wiki.leap.ui.workbench.minuteValue", { value });
            const hours = Number((value / 60).toFixed(1));
            return this.$t("pages.wiki.leap.ui.workbench.hourValue", { value: hours });
        },
    },
};
</script>

<template>
    <PvxSurface class="m-leap-summary" padding="small" radius="medium">
        <header class="m-leap-summary__header">
            <div>
                <span v-if="title">{{ $t("pages.wiki.leap.ui.workbench.planOverview") }}</span>
                <h2>{{ title || $t("pages.wiki.leap.ui.workbench.planOverview") }}</h2>
            </div>
            <span class="u-leap-summary-status" :class="{ 'is-reached': route.reached }">
                {{
                    route.reached
                        ? $t("pages.wiki.leap.ui.workbench.targetReached")
                        : $t("pages.wiki.leap.ui.workbench.targetShortfall")
                }}
            </span>
        </header>

        <div class="m-leap-summary__grid">
            <div>
                <span>{{ $t("pages.wiki.leap.ui.workbench.expectedGain") }}</span>
                <strong>+{{ formatNumber(route.selectedPoints) }}</strong>
            </div>
            <div>
                <span>{{ $t("pages.wiki.leap.ui.workbench.routeItems") }}</span>
                <strong>{{ formatNumber(route.items.length) }}</strong>
            </div>
            <div>
                <span>{{ $t("pages.wiki.leap.ui.workbench.estimatedTime") }}</span>
                <strong>{{ formatMinutes(route.totalMinutes) }}</strong>
            </div>
            <div>
                <span>{{ $t("pages.wiki.leap.ui.workbench.averageDifficulty") }}</span>
                <strong>
                    <AchievementDifficultyStars
                        :value="route.averageDifficulty"
                        :label="$t('pages.wiki.leap.ui.workbench.averageDifficulty')"
                    />
                </strong>
            </div>
            <div>
                <span>{{ $t("pages.wiki.leap.ui.workbench.projectedSeniority") }}</span>
                <strong>{{ formatNumber(route.projectedPoints) }}</strong>
            </div>
            <div>
                <span>
                    {{
                        route.reached
                            ? $t("pages.wiki.leap.ui.workbench.surplusPoints")
                            : $t("pages.wiki.leap.ui.workbench.remainingGap")
                    }}
                </span>
                <strong :class="{ 'is-warning': !route.reached }">
                    {{
                        route.reached
                            ? formatNumber(Math.max(0, route.selectedPoints - route.targetGap))
                            : formatNumber(route.remainingGap)
                    }}
                </strong>
            </div>
        </div>

        <p v-if="route.strategy !== route.requestedStrategy" class="u-leap-summary-note">
            {{ $t("pages.wiki.leap.ui.workbench.strategyFallback") }}
        </p>
    </PvxSurface>
</template>

<style lang="less" scoped>
.m-leap-summary {
    color: #314043;
}

.m-leap-summary__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 12px;
}

.m-leap-summary__header > div > span {
    color: #a88139;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.m-leap-summary__header h2 {
    margin: 0;
    font-size: 17px;
    line-height: 1.5;
}

.u-leap-summary-status {
    flex: none;
    padding: 6px 10px;
    border-radius: 999px;
    color: #a3543f;
    background: #f8e9e4;
    font-size: 12px;
    font-weight: 700;
}

.u-leap-summary-status.is-reached {
    color: #356d5d;
    background: #e6f1eb;
}

.m-leap-summary__grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    border: 1px solid rgba(69, 86, 84, 0.12);
    border-radius: 12px;
    background: #f8f5ee;
    overflow: hidden;
}

.m-leap-summary__grid > div {
    display: grid;
    min-width: 0;
    gap: 6px;
    padding: 12px 14px;
    border-right: 1px solid rgba(69, 86, 84, 0.1);
}

.m-leap-summary__grid > div:last-child {
    border-right: 0;
}

.m-leap-summary__grid span {
    color: #7a8586;
    font-size: 12px;
}

.m-leap-summary__grid strong {
    color: #365f64;
    font-size: 20px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.m-leap-summary__grid strong.is-warning {
    color: #a3543f;
}

.u-leap-summary-note {
    margin: 12px 0 0;
    color: #9a6d39;
    font-size: 12px;
}

@media (max-width: 1100px) {
    .m-leap-summary__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .m-leap-summary__grid > div:nth-child(3) {
        border-right: 0;
    }

    .m-leap-summary__grid > div:nth-child(-n + 3) {
        border-bottom: 1px solid rgba(69, 86, 84, 0.1);
    }
}

@media (max-width: 620px) {
    .m-leap-summary__header {
        align-items: flex-start;
    }

    .m-leap-summary__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .m-leap-summary__grid > div {
        border-right: 1px solid rgba(69, 86, 84, 0.1) !important;
        border-bottom: 1px solid rgba(69, 86, 84, 0.1);
    }

    .m-leap-summary__grid > div:nth-child(2n) {
        border-right: 0 !important;
    }

    .m-leap-summary__grid > div:nth-last-child(-n + 2) {
        border-bottom: 0;
    }
}
</style>
