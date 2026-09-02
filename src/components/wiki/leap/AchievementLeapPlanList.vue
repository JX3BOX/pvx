<script>
import { CopyDocument, Delete, Document, Edit, View } from "@element-plus/icons-vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { buildAchievementLeapPlanProgress } from "@/utils/achievementLeap";

export default {
    name: "AchievementLeapPlanList",
    components: {
        CopyDocument,
        Delete,
        Document,
        Edit,
        PvxEmptyState,
        PvxSurface,
        View,
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
    emits: ["view", "edit", "copy", "delete", "page-change"],
    computed: {
        planCards() {
            return this.plans.map((plan) => ({
                plan,
                progress: buildAchievementLeapPlanProgress(plan, this.metadata, this.completedIds),
                description: this.description(plan),
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
            <div>
                <span>{{ $t("pages.wiki.leap.ui.planManagement") }}</span>
                <h2>{{ $t("pages.wiki.leap.ui.planList") }}</h2>
                <p>{{ $t("pages.wiki.leap.ui.listDescription") }}</p>
            </div>
            <strong>{{ $t("pages.wiki.leap.ui.workbench.savedPlanCount", { count: total }) }}</strong>
        </header>

        <div v-if="plans.length" class="m-leap-plan-list__grid">
            <article
                v-for="card in planCards"
                :key="card.plan.id"
                class="m-leap-plan-card"
                :class="{ 'is-official': card.plan.official }"
            >
                <header class="m-leap-plan-card__header">
                    <span class="u-leap-plan-icon"><Document /></span>
                    <div class="m-leap-plan-card__heading">
                        <h3>{{ card.plan.title || $t("pages.wiki.leap.ui.unnamedPlan") }}</h3>
                        <span class="u-leap-plan-source">{{ card.source }}</span>
                    </div>
                </header>

                <p v-if="card.description" class="u-leap-plan-description">{{ card.description }}</p>

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

                <footer class="m-leap-plan-card__actions">
                    <button type="button" class="is-primary" @click="$emit('view', card.plan)">
                        <View />{{ $t("pages.wiki.leap.ui.workbench.viewPlan") }}
                    </button>
                    <button v-if="!card.plan.official" type="button" @click="$emit('edit', card.plan)">
                        <Edit />{{ $t("pages.wiki.leap.ui.workbench.editPlan") }}
                    </button>
                    <button v-else type="button" @click="$emit('copy', card.plan)">
                        <CopyDocument />{{ $t("pages.wiki.leap.ui.workbench.copyAsMine") }}
                    </button>
                    <button
                        v-if="!card.plan.official"
                        type="button"
                        class="is-danger"
                        @click="$emit('delete', card.plan)"
                    >
                        <Delete />{{ $t("pages.wiki.leap.ui.workbench.deletePlanShort") }}
                    </button>
                </footer>
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
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
}

.m-leap-plan-list__header span {
    color: #a88139;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.m-leap-plan-list__header h2 {
    margin: 4px 0;
    font-size: 20px;
}

.m-leap-plan-list__header p {
    margin: 0;
    color: #7b8586;
}

.m-leap-plan-list__header > strong {
    padding: 6px 10px;
    border-radius: 999px;
    color: #547277;
    background: #edf2ef;
    font-size: 13px;
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
    min-height: 232px;
    min-width: 0;
    flex-direction: column;
    padding: 18px 18px 16px 20px;
    border: 1px solid rgba(67, 88, 86, 0.13);
    border-radius: 14px;
    background: linear-gradient(145deg, #fffdf9 0%, #f9f6ef 100%);
    box-shadow: 0 4px 14px rgba(54, 70, 70, 0.04);
    overflow: hidden;
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
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 12px;
}

.u-leap-plan-icon {
    display: inline-flex;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    color: #fff;
    background: #47777d;
}

.m-leap-plan-card.is-official .u-leap-plan-icon {
    color: #8f6b2d;
    background: #f1e7d3;
}

.u-leap-plan-icon svg {
    width: 19px;
}

.m-leap-plan-card__heading {
    display: grid;
    min-width: 0;
    justify-items: start;
    gap: 5px;
}

.m-leap-plan-card__heading h3 {
    max-width: 100%;
    margin: 0;
    overflow: hidden;
    color: #2f4143;
    font-size: 17px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.u-leap-plan-source {
    display: inline-flex;
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
    margin: 11px 0 0;
    color: #7c8585;
    font-size: 12px;
    line-height: 1.55;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
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

.m-leap-plan-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: auto;
    padding-top: 14px;
}

.m-leap-plan-card__actions button {
    display: inline-flex;
    min-height: 34px;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 6px 9px;
    border: 1px solid rgba(71, 119, 125, 0.22);
    border-radius: 7px;
    color: #47777d;
    background: transparent;
    cursor: pointer;
}

.m-leap-plan-card__actions button.is-primary {
    border-color: #47777d;
    color: #fff;
    background: #47777d;
}

.m-leap-plan-card__actions button.is-danger {
    margin-left: auto;
    border-color: rgba(163, 84, 63, 0.2);
    color: #a3543f;
}

@media (hover: hover) and (pointer: fine) {
    .m-leap-plan-card:hover {
        border-color: rgba(71, 119, 125, 0.3);
        box-shadow: 0 9px 24px rgba(54, 70, 70, 0.1);
        transform: translateY(-2px);
    }

    .m-leap-plan-card__actions button:not(.is-primary):hover {
        border-color: #47777d;
        background: #f0f5f3;
    }

    .m-leap-plan-card__actions button.is-primary:hover {
        background: #3d686e;
    }

    .m-leap-plan-card__actions button.is-danger:hover {
        border-color: #a3543f;
        background: #fff2ee;
    }
}

.m-leap-plan-card__actions svg {
    width: 14px;
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
    .m-leap-plan-list__header {
        display: grid;
    }

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
