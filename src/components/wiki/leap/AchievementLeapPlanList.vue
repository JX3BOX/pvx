<script>
import { Document } from "@element-plus/icons-vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { buildAchievementLeapPlanProgress } from "@/utils/achievementLeap";

export default {
    name: "AchievementLeapPlanList",
    components: {
        Document,
        PvxEmptyState,
        PvxSurface,
    },
    props: {
        plans: {
            type: Array,
            default: () => [],
        },
        metadata: {
            type: Object,
            default: () => ({}),
        },
        completedIds: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        total: {
            type: Number,
            default: 0,
        },
        page: {
            type: Number,
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 9,
        },
    },
    emits: ["view", "page-change"],
    computed: {
        planCards() {
            return this.plans.map((plan) => ({
                plan,
                progress: buildAchievementLeapPlanProgress(plan, this.metadata, this.completedIds),
                description: this.description(plan) || "—",
                source: this.sourceLabel(plan),
            }));
        },
    },
    methods: {
        formatNumber(value) {
            return Number(value || 0).toLocaleString();
        },
        sourceLabel(plan) {
            return plan.official
                ? this.$t("pages.wiki.leap.ui.officialSource")
                : this.$t("pages.wiki.leap.ui.playerSource");
        },
        description(plan) {
            return String(plan.description || "")
                .replace(/<[^>]*>/g, " ")
                .replace(/&nbsp;/gi, " ")
                .replace(/\s+/g, " ")
                .trim();
        },
    },
};
</script>

<template>
    <PvxSurface class="m-leap-plan-list" padding="medium" v-loading="loading">
        <header class="m-leap-plan-list__header">
            <h2>{{ $t("pages.wiki.leap.ui.planList") }}</h2>
            <span>{{ $t("pages.wiki.leap.ui.workbench.savedPlanCount", { count: total }) }}</span>
        </header>

        <div v-if="plans.length" class="m-leap-plan-list__grid">
            <article
                v-for="card in planCards"
                :key="card.plan.id"
                class="m-leap-plan-card"
                :class="{ 'is-official': card.plan.official }"
                role="link"
                tabindex="0"
                :aria-labelledby="`leap-plan-title-${card.plan.id}`"
                @click="$emit('view', card.plan)"
                @keydown.enter.prevent="$emit('view', card.plan)"
                @keydown.space.prevent="$emit('view', card.plan)"
            >
                <header class="m-leap-plan-card__header">
                    <div class="m-leap-plan-card__heading">
                        <div class="m-leap-plan-card__title-row">
                            <span class="u-leap-plan-source">{{ card.source }}</span>
                            <h3 :id="`leap-plan-title-${card.plan.id}`">
                                {{ card.plan.title || $t("pages.wiki.leap.ui.unnamedPlan") }}
                            </h3>
                        </div>
                        <p class="u-leap-plan-description" :title="card.description">{{ card.description }}</p>
                    </div>
                </header>

                <div class="m-leap-plan-card__stats">
                    <div>
                        <span>{{ $t("pages.wiki.leap.ui.totalPoints") }}</span>
                        <strong>{{ formatNumber(card.progress.totalPoints) }}</strong>
                    </div>
                    <div>
                        <span>{{ $t("pages.wiki.leap.ui.improvablePoints") }}</span>
                        <strong class="is-gain">+{{ formatNumber(card.progress.remainingPoints) }}</strong>
                    </div>
                    <div>
                        <span>{{ $t("pages.wiki.leap.ui.workbench.routeItems") }}</span>
                        <strong>{{ formatNumber(card.progress.count) }}</strong>
                    </div>
                </div>

                <div class="m-leap-plan-card__progress-meta">
                    <span>{{ $t("pages.wiki.leap.ui.workbench.completionRate") }}</span>
                    <strong>{{ card.progress.progress ?? 0 }}%</strong>
                </div>
                <div
                    class="m-leap-plan-card__progress"
                    role="progressbar"
                    :aria-valuenow="card.progress.progress || 0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    <span :style="{ width: `${card.progress.progress || 0}%` }"></span>
                </div>
            </article>
        </div>

        <PvxEmptyState
            v-else-if="!loading"
            :title="$t('pages.wiki.leap.ui.noPlans')"
            :description="$t('pages.wiki.leap.ui.noPlansDescription')"
        >
            <template #icon><Document /></template>
        </PvxEmptyState>

        <div v-if="total > pageSize" class="m-leap-plan-list__pagination">
            <el-pagination
                :current-page="page"
                background
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="total"
                @current-change="$emit('page-change', $event)"
            />
        </div>
    </PvxSurface>
</template>

<style lang="less" scoped>
.m-leap-plan-list {
    color: #344143;
}

.m-leap-plan-list__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 12px;
    margin-bottom: 12px;
}

.m-leap-plan-list__header h2 {
    margin: 0;
    color: #384246;
    font-size: 16px;
}

.m-leap-plan-list__header > span {
    color: #a0a7a4;
    font-size: 11px;
    white-space: nowrap;
}

.m-leap-plan-list__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
}

.m-leap-plan-card {
    position: relative;
    display: flex;
    min-height: 194px;
    min-width: 0;
    flex-direction: column;
    padding: 18px 18px 16px 20px;
    border: 1px solid rgba(67, 88, 86, 0.13);
    border-radius: 14px;
    background: linear-gradient(145deg, #fffdf9 0%, #f9f6ef 100%);
    box-shadow: 0 4px 14px rgba(54, 70, 70, 0.04);
    cursor: pointer;
    overflow: hidden;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.m-leap-plan-card::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background: #47777d;
    content: "";
}

.m-leap-plan-card.is-official::before {
    background: #b18b42;
}

.m-leap-plan-card__header {
    min-width: 0;
}

.m-leap-plan-card__heading {
    display: grid;
    min-width: 0;
    gap: 3px;
}

.m-leap-plan-card__title-row {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 7px;
}

.m-leap-plan-card__title-row h3 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    color: #2f4143;
    font-size: 17px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.u-leap-plan-source {
    display: inline-flex;
    width: fit-content;
    flex: none;
    padding: 3px 7px;
    border-radius: 999px;
    color: #55777a;
    background: #eaf1ef;
    font-size: 11px;
    line-height: 1.2;
}

.m-leap-plan-card.is-official .u-leap-plan-source {
    color: #8a682f;
    background: #f3ead9;
}

.u-leap-plan-description {
    min-width: 0;
    margin: 0;
    color: #7c8585;
    font-size: 12px;
    line-height: 1.45;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.m-leap-plan-card__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 14px;
    border: 1px solid rgba(69, 89, 87, 0.09);
    border-radius: 10px;
    background: rgba(242, 239, 231, 0.72);
    overflow: hidden;
}

.m-leap-plan-card__stats div {
    display: grid;
    min-width: 0;
    gap: 5px;
    padding: 10px 11px;
    border-right: 1px solid rgba(69, 89, 87, 0.08);
}

.m-leap-plan-card__stats div:last-child {
    border-right: 0;
}

.m-leap-plan-card__stats span {
    color: #929999;
    font-size: 11px;
}

.m-leap-plan-card__stats strong {
    color: #3d5f63;
    font-size: 16px;
    font-variant-numeric: tabular-nums;
}

.m-leap-plan-card__stats strong.is-gain {
    color: #a05b42;
}

.m-leap-plan-card__progress-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 12px 2px 6px;
    color: #879191;
    font-size: 11px;
}

.m-leap-plan-card__progress-meta strong {
    color: #9c762f;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
}

.m-leap-plan-card__progress {
    height: 6px;
    border-radius: 999px;
    background: #e2ded5;
    overflow: hidden;
}

.m-leap-plan-card__progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #47777d, #b18b42);
}

.m-leap-plan-card:focus-visible {
    border-color: #47777d;
    box-shadow: 0 0 0 3px rgba(71, 119, 125, 0.16), 0 9px 24px rgba(54, 70, 70, 0.1);
}

@media (hover: hover) and (pointer: fine) {
    .m-leap-plan-card:hover {
        border-color: rgba(71, 119, 125, 0.3);
        box-shadow: 0 9px 24px rgba(54, 70, 70, 0.1);
        transform: translateY(-2px);
    }
}

.m-leap-plan-list__pagination {
    display: flex;
    justify-content: center;
    margin-top: 18px;
}

@media (max-width: 1600px) {
    .m-leap-plan-list__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 1100px) {
    .m-leap-plan-list__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 720px) {
    .m-leap-plan-list__grid {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (prefers-reduced-motion: reduce) {
    .m-leap-plan-card {
        transition: none;
    }
}
</style>
