<script>
import { RefreshLeft, TrendCharts } from "@element-plus/icons-vue";
import PvxSurface from "@/components/design/PvxSurface.vue";

const DIMENSIONS = ["points", "efficiency", "difficulty", "money", "time", "luck"];

export default {
    name: "AchievementLeapRecommendation",
    components: {
        PvxSurface,
        RefreshLeft,
        TrendCharts,
    },
    props: {
        recommendation: {
            type: Object,
            default: null,
        },
        currentPoints: {
            type: Number,
            default: 0,
        },
        roleSchool: {
            type: String,
            default: "",
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["apply", "refresh"],
    computed: {
        stageLabel() {
            if (!this.recommendation?.stageKey) return "—";
            return this.$t(`pages.wiki.leap.ui.workbench.recommendationStages.${this.recommendation.stageKey}.label`);
        },
        stageDescription() {
            if (!this.recommendation?.stageKey) return "";
            return this.$t(
                `pages.wiki.leap.ui.workbench.recommendationStages.${this.recommendation.stageKey}.description`
            );
        },
        dimensions() {
            return DIMENSIONS.map((key) => ({
                key,
                label: this.$t(`pages.wiki.leap.ui.workbench.recommendationDimensions.${key}`),
                weight: Number(this.recommendation?.weights?.[key]) || 0,
                coverage: Number(this.recommendation?.dimensionCoverage?.[key]) || 0,
            }));
        },
        canApply() {
            return Boolean(!this.loading && this.recommendation?.categories?.length);
        },
    },
    methods: {
        formatNumber(value) {
            return Number(value || 0).toLocaleString();
        },
        formatPercent(value) {
            return `${Math.round((Number(value) || 0) * 100)}%`;
        },
    },
};
</script>

<template>
    <PvxSurface class="m-leap-recommendation" padding="medium" v-loading="loading">
        <header class="m-leap-recommendation__header">
            <div>
                <span class="u-leap-recommendation-kicker">
                    {{ $t("pages.wiki.leap.ui.workbench.systemRecommendation") }}
                </span>
                <h2>{{ $t("pages.wiki.leap.ui.workbench.recommendationTitle", { stage: stageLabel }) }}</h2>
                <p>
                    {{ stageDescription }}
                    <span v-if="roleSchool">
                        · {{ $t("pages.wiki.leap.ui.workbench.schoolEligibilityApplied", { school: roleSchool }) }}
                    </span>
                </p>
            </div>
            <button
                type="button"
                class="u-leap-recommendation-refresh"
                :disabled="loading"
                @click="$emit('refresh')"
            >
                <RefreshLeft />
                {{ $t("pages.wiki.leap.ui.workbench.refreshRecommendation") }}
            </button>
        </header>

        <div v-if="recommendation" class="m-leap-recommendation__body">
            <div class="m-leap-recommendation__overview">
                <div class="m-leap-recommendation__stage">
                    <span>{{ $t("pages.wiki.leap.ui.currentSeniority") }}</span>
                    <strong>{{ formatNumber(currentPoints) }}</strong>
                    <small>{{ stageLabel }}</small>
                </div>
                <div class="m-leap-recommendation__metrics">
                    <div>
                        <span>{{ $t("pages.wiki.leap.ui.workbench.recommendedCategories") }}</span>
                        <strong>{{ recommendation.categories.length }}</strong>
                    </div>
                    <div>
                        <span>{{ $t("pages.wiki.leap.ui.workbench.recommendationCandidateCount") }}</span>
                        <strong>{{ formatNumber(recommendation.candidateCount) }}</strong>
                    </div>
                    <div>
                        <span>{{ $t("pages.wiki.leap.ui.workbench.recommendationAvailablePoints") }}</span>
                        <strong>{{ formatNumber(recommendation.availablePoints) }}</strong>
                    </div>
                </div>
            </div>

            <section class="m-leap-recommendation__categories">
                <div class="m-leap-recommendation__section-heading">
                    <strong>{{ $t("pages.wiki.leap.ui.workbench.recommendedCategoryHeading") }}</strong>
                    <span>
                        {{
                            $t("pages.wiki.leap.ui.workbench.recommendationCoverage", {
                                available: recommendation.availableDimensionCount,
                                total: recommendation.totalDimensionCount,
                            })
                        }}
                    </span>
                </div>
                <div class="m-leap-recommendation__category-list">
                    <article v-for="category in recommendation.categories" :key="category.name">
                        <div>
                            <strong>{{ category.name }}</strong>
                            <span>
                                {{
                                    $t("pages.wiki.leap.ui.workbench.recommendationScore", {
                                        score: Math.round(category.score),
                                    })
                                }}
                            </span>
                        </div>
                        <p>
                            {{
                                $t("pages.wiki.leap.ui.workbench.recommendedCategoryMeta", {
                                    count: formatNumber(category.incompleteCount),
                                    points: formatNumber(category.points),
                                })
                            }}
                        </p>
                    </article>
                </div>
            </section>

            <details class="m-leap-recommendation__weights">
                <summary>{{ $t("pages.wiki.leap.ui.workbench.viewRecommendationWeights") }}</summary>
                <p class="u-leap-category-weight-note">
                    {{
                        $t("pages.wiki.leap.ui.workbench.categoryWeightNote", {
                            quality: recommendation.categoryWeights.candidateQuality,
                            count: recommendation.categoryWeights.incompleteCount,
                            points: recommendation.categoryWeights.availablePoints,
                        })
                    }}
                </p>
                <div class="m-leap-recommendation__weight-list">
                    <div v-for="dimension in dimensions" :key="dimension.key" :class="{ 'is-pending': !dimension.coverage }">
                        <span>{{ dimension.label }}</span>
                        <div><i :style="{ width: `${dimension.weight}%` }"></i></div>
                        <strong>{{ dimension.weight }}%</strong>
                        <small>
                            {{
                                dimension.coverage
                                    ? $t("pages.wiki.leap.ui.workbench.dimensionCoverage", {
                                          value: formatPercent(dimension.coverage),
                                      })
                                    : $t("pages.wiki.leap.ui.workbench.dimensionPending")
                            }}
                        </small>
                    </div>
                </div>
            </details>

            <footer class="m-leap-recommendation__footer">
                <p>{{ $t("pages.wiki.leap.ui.workbench.recommendationEditableNote") }}</p>
                <button type="button" :disabled="!canApply" @click="$emit('apply', recommendation)">
                    <TrendCharts />
                    {{ $t("pages.wiki.leap.ui.workbench.generateFromRecommendation") }}
                </button>
            </footer>
        </div>

        <p v-else-if="!loading" class="m-leap-recommendation__empty">
            {{ $t("pages.wiki.leap.ui.workbench.noRecommendation") }}
        </p>
    </PvxSurface>
</template>

<style lang="less" scoped>
.m-leap-recommendation {
    color: #314043;
    background:
        radial-gradient(circle at 92% 8%, rgba(181, 139, 61, 0.1), transparent 30%),
        #fffdf8;
}

.m-leap-recommendation__header,
.m-leap-recommendation__overview,
.m-leap-recommendation__section-heading,
.m-leap-recommendation__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.u-leap-recommendation-kicker {
    color: #a88139;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
}

.m-leap-recommendation__header h2 {
    margin: 4px 0 6px;
    font-size: 22px;
}

.m-leap-recommendation__header p,
.m-leap-recommendation__footer p,
.m-leap-recommendation__empty {
    margin: 0;
    color: #7a8586;
    line-height: 1.65;
}

.u-leap-recommendation-refresh,
.m-leap-recommendation__footer button {
    display: inline-flex;
    min-height: 40px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 8px 14px;
    border: 1px solid #47777d;
    border-radius: 9px;
    color: #47777d;
    background: rgba(255, 255, 255, 0.78);
    cursor: pointer;
}

.m-leap-recommendation__footer button {
    color: #fff;
    background: #47777d;
}

.u-leap-recommendation-refresh:disabled,
.m-leap-recommendation__footer button:disabled {
    border-color: #aeb9b9;
    color: #fff;
    background: #aeb9b9;
    cursor: not-allowed;
}

.u-leap-recommendation-refresh svg,
.m-leap-recommendation__footer svg {
    width: 17px;
}

.m-leap-recommendation__body {
    display: grid;
    gap: 16px;
    margin-top: 18px;
}

.m-leap-recommendation__overview {
    padding: 14px 16px;
    border: 1px solid rgba(71, 119, 125, 0.14);
    border-radius: 12px;
    background: rgba(237, 243, 241, 0.64);
}

.m-leap-recommendation__stage {
    display: grid;
    min-width: 150px;
    gap: 2px;
}

.m-leap-recommendation__stage span,
.m-leap-recommendation__metrics span,
.m-leap-recommendation__section-heading span {
    color: #859091;
    font-size: 12px;
}

.m-leap-recommendation__stage strong {
    color: #365f64;
    font-size: 22px;
    font-variant-numeric: tabular-nums;
}

.m-leap-recommendation__stage small {
    color: #a88139;
    font-weight: 700;
}

.m-leap-recommendation__metrics {
    display: grid;
    width: min(560px, 100%);
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.m-leap-recommendation__metrics > div {
    display: grid;
    gap: 5px;
    padding: 0 18px;
    border-left: 1px solid rgba(71, 119, 125, 0.14);
}

.m-leap-recommendation__metrics strong {
    color: #3d5558;
    font-size: 19px;
    font-variant-numeric: tabular-nums;
}

.m-leap-recommendation__categories {
    display: grid;
    gap: 10px;
}

.m-leap-recommendation__section-heading strong {
    color: #3e4c4e;
    font-size: 14px;
}

.m-leap-recommendation__category-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

.m-leap-recommendation__category-list article {
    min-width: 0;
    padding: 13px 14px;
    border: 1px solid rgba(71, 119, 125, 0.14);
    border-radius: 10px;
    background: #fff;
}

.m-leap-recommendation__category-list article > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.m-leap-recommendation__category-list article > div > span {
    min-width: 30px;
    padding: 3px 7px;
    border-radius: 999px;
    color: #9a702a;
    background: #f4ecdb;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
}

.m-leap-recommendation__category-list p {
    margin: 6px 0 0;
    color: #879091;
    font-size: 12px;
}

.m-leap-recommendation__weights {
    border-top: 1px dashed rgba(71, 119, 125, 0.2);
    border-bottom: 1px dashed rgba(71, 119, 125, 0.2);
    padding: 12px 0;
}

.m-leap-recommendation__weights summary {
    color: #52686b;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
}

.m-leap-recommendation__weight-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px 18px;
    margin-top: 12px;
}

.u-leap-category-weight-note {
    margin: 10px 0 0;
    color: #879091;
    font-size: 12px;
    line-height: 1.6;
}

.m-leap-recommendation__weight-list > div {
    display: grid;
    grid-template-columns: minmax(72px, auto) minmax(60px, 1fr) 38px minmax(74px, auto);
    align-items: center;
    gap: 8px;
    color: #5e6d6f;
    font-size: 12px;
}

.m-leap-recommendation__weight-list > div.is-pending {
    opacity: 0.5;
}

.m-leap-recommendation__weight-list div > div {
    height: 5px;
    border-radius: 999px;
    background: #e8ecea;
    overflow: hidden;
}

.m-leap-recommendation__weight-list i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #47777d, #bc9145);
}

.m-leap-recommendation__weight-list strong {
    color: #a88139;
    font-variant-numeric: tabular-nums;
    text-align: right;
}

.m-leap-recommendation__weight-list small {
    color: #90999a;
    text-align: right;
}

@media (max-width: 960px) {
    .m-leap-recommendation__overview {
        align-items: flex-start;
    }

    .m-leap-recommendation__category-list,
    .m-leap-recommendation__weight-list {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 720px) {
    .m-leap-recommendation__header,
    .m-leap-recommendation__overview,
    .m-leap-recommendation__footer {
        display: grid;
    }

    .u-leap-recommendation-refresh,
    .m-leap-recommendation__footer button {
        width: 100%;
        min-height: 44px;
    }

    .m-leap-recommendation__metrics {
        width: 100%;
    }

    .m-leap-recommendation__metrics > div {
        padding: 0 10px;
    }

    .m-leap-recommendation__metrics > div:first-child {
        padding-left: 0;
        border-left: 0;
    }
}
</style>
