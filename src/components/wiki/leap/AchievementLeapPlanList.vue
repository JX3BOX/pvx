<script>
import { Document } from "@element-plus/icons-vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import responsivePagination from "@/mixins/responsive-pagination";
import { buildAchievementLeapPlanProgress } from "@/utils/achievementLeap";

export default {
    name: "AchievementLeapPlanList",
    mixins: [responsivePagination],
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
                        <p v-if="card.description !== '—'" class="u-leap-plan-description" :title="card.description">
                            {{ card.description }}
                        </p>
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
                :layout="isPaginationPhoneViewport ? 'prev, slot, next' : 'prev, pager, next'"
                :pager-count="responsivePagerCount"
                :page-size="pageSize"
                :total="total"
                @current-change="$emit('page-change', $event)"
            >
                <span class="u-achievement-pagination-status" aria-live="polite">
                    {{ page }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}
                </span>
            </el-pagination>
        </div>
    </PvxSurface>
</template>

<style lang="less" scoped>
.m-leap-plan-list {
    min-width: 0;
    color: #333;
}
.m-leap-plan-list__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 12px;
    margin-bottom: 24px;
    h2 {
        margin: 0;
        font-size: 24px;
    }
    > span {
        color: #999;
        font-size: 14px;
    }
}
.m-leap-plan-list__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
}
.m-leap-plan-card {
    box-sizing: border-box;
    position: relative;
    display: flex;
    min-width: 0;
    min-height: 184px;
    flex-direction: column;
    padding: 24px;
    border: 1px solid #e5d5b3;
    background: #fcfcfa;
    cursor: pointer;
    &:hover,
    &:focus-visible {
        border-color: #5a7e84;
        box-shadow: inset 3px 0 #5a7e84;
        outline: none;
    }
}
.m-leap-plan-card__title-row {
    display: flex;
    min-width: 0;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    h3 {
        flex: 1;
        min-width: 0;
        margin: 0;
        color: #6e572c;
        font-size: 18px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
.u-leap-plan-source {
    flex: none;
    padding: 2px 6px;
    border: 1px solid #5a7e84;
    border-radius: 4px;
    color: #5a7e84;
    background: #fff;
    font-size: 13px;
    line-height: 1.3;
}
.m-leap-plan-card.is-official .u-leap-plan-source {
    border-color: #967944;
    color: #967944;
}
.u-leap-plan-description {
    margin: 8px 0 0;
    color: #999;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.m-leap-plan-card__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 20px;
    div {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        &:nth-child(2) {
            order: 1;
        }
    }
    span {
        color: #999;
        font-size: 13px;
        overflow-wrap: anywhere;
    }
    strong {
        color: #967944;
        font-size: 18px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        &.is-gain {
            color: #5a7e84;
        }
    }
}
.m-leap-plan-card__progress-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 16px 0 6px;
    color: #999;
    font-size: 13px;
    strong {
        color: #967944;
        font-weight: 400;
    }
}
.m-leap-plan-card__progress {
    height: 4px;
    margin-top: auto;
    overflow: hidden;
    border-radius: 3px;
    background: #eae5e1;
    span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: #5a7e84;
    }
}
.m-leap-plan-list__pagination {
    display: flex;
    justify-content: center;
    margin-top: 24px;
}
@media (max-width: 1400px) {
    .m-leap-plan-list__grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
@media (max-width: @ipad) {
    .m-leap-plan-list__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: @phone) {
    .m-leap-plan-list__grid {
        grid-template-columns: minmax(0, 1fr);
    }
    .m-leap-plan-card {
        padding: 16px;
    }
    .m-leap-plan-card__title-row h3,
    .u-leap-plan-description {
        white-space: normal;
        overflow-wrap: anywhere;
    }
    .m-leap-plan-card__stats strong {
        font-size: 16px;
    }
    .m-leap-plan-list__pagination :deep(.el-pagination) {
        --el-pagination-button-width: 36px;
        --el-pagination-button-height: 36px;
        max-width: 100%;
        gap: 12px;
    }
    .u-achievement-pagination-status {
        min-width: 72px;
        font-size: 14px;
        text-align: center;
    }
}
</style>
