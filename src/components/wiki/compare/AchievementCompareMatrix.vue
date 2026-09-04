<script>
import { CircleCheckFilled, CircleCloseFilled, Medal, RefreshRight } from "@element-plus/icons-vue";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";
import {
    formatAchievementWorkbenchValue,
    getAchievementWorkbenchDimensionValue,
} from "@/utils/achievementWorkbench";

export default {
    name: "AchievementCompareMatrix",
    components: {
        AchievementDifficultyStars,
        CircleCheckFilled,
        CircleCloseFilled,
        Medal,
        RefreshRight,
    },
    props: {
        title: {
            type: String,
            default: "",
        },
        records: {
            type: Array,
            default: () => [],
        },
        roles: {
            type: Array,
            default: () => [],
        },
        definitions: {
            type: Array,
            default: () => [],
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
            default: 20,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        error: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["page-change", "retry"],
    computed: {
        tableStyle() {
            return {
                minWidth: `${Math.max(940, 560 + this.roles.length * 145)}px`,
            };
        },
        roleCompletionSets() {
            return new Map(
                this.roles.map((role) => [
                    String(role.id || role.jx3id),
                    new Set((role.completedAchievementIds || role.completedAchievements || []).map(String)),
                ])
            );
        },
    },
    methods: {
        getLink,
        iconLink,
        formatValue(value) {
            return formatAchievementWorkbenchValue(value);
        },
        formatNumber(value) {
            if (value === null || value === undefined) return "—";
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale).format(Number(value) || 0);
        },
        isCompleted(role, record) {
            return this.roleCompletionSets.get(String(role.id || role.jx3id))?.has(String(record.id)) || false;
        },
        roleName(role) {
            return role.name || this.$t("pages.wiki.compare.ui.common.unknown");
        },
        dimensionLabel(definition) {
            if (definition?.i18nKey) return this.$t(definition.i18nKey);
            return definition?.label || definition?.key || "—";
        },
        dimensionValue(record, definition) {
            return getAchievementWorkbenchDimensionValue(record, definition?.key);
        },
        formatCompletionRate(value) {
            if (value === null || value === undefined) return "—";
            const normalized = Number(value);
            if (!Number.isFinite(normalized)) return "—";
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale, {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(normalized);
        },
        getDisplayTags(record) {
            const tags = Array.isArray(record?.tags) ? record.tags : [];
            return [...tags].sort((left, right) => Number(right?.type === "school") - Number(left?.type === "school"));
        },
    },
};
</script>

<template>
    <section class="m-compare-matrix" :aria-label="$t('pages.wiki.compare.ui.matrix.completion')">
        <div v-if="$slots.filters" class="m-compare-matrix__filters">
            <slot name="filters" />
        </div>

        <div class="m-compare-matrix__header">
            <h2>{{ title || $t("pages.wiki.compare.ui.categories.all") }}</h2>
            <span>{{ $t("pages.wiki.compare.ui.matrix.achievementCount", { count: formatNumber(total) }) }}</span>
        </div>

        <div class="m-compare-matrix__body" v-loading="loading">
            <div v-if="error" class="m-compare-matrix-state">
                <strong>{{ $t("pages.wiki.compare.ui.states.loadFailed") }}</strong>
                <p>{{ $t("pages.wiki.compare.ui.states.loadFailedDescription") }}</p>
                <button type="button" @click="$emit('retry')">
                    <RefreshRight aria-hidden="true" />
                    {{ $t("pages.wiki.compare.ui.actions.retry") }}
                </button>
            </div>

            <div v-else-if="!loading && !records.length" class="m-compare-matrix-state">
                <Medal aria-hidden="true" />
                <strong>{{ $t("pages.wiki.compare.ui.states.noResults") }}</strong>
                <p>{{ $t("pages.wiki.compare.ui.states.noResultsDescription") }}</p>
            </div>

            <div v-else class="m-compare-matrix-scroll">
                <table class="m-compare-matrix-table" :style="tableStyle">
                    <thead>
                        <tr>
                            <th class="is-achievement" scope="col">
                                <span>{{ $t("pages.wiki.compare.ui.matrix.achievement") }}</span>
                                <small>
                                    {{
                                        $t("pages.wiki.compare.ui.matrix.achievementCount", {
                                            count: formatNumber(total),
                                        })
                                    }}
                                </small>
                            </th>
                            <th v-for="role in roles" :key="role.id || role.jx3id" scope="col">
                                <strong>{{ roleName(role) }}</strong>
                                <small>{{ formatNumber(role.completedPoints) }}</small>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="record in records" :key="record.id">
                            <td class="is-achievement">
                                <a
                                    class="m-compare-achievement"
                                    :href="getLink('achievement', record.id)"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span class="u-compare-achievement-icon">
                                        <img v-if="record.iconId" :src="iconLink(record.iconId)" alt="" />
                                        <Medal v-else aria-hidden="true" />
                                    </span>
                                    <span class="m-compare-achievement__body">
                                        <span class="m-compare-achievement__title">
                                            <strong>{{ formatValue(record.name) }}</strong>
                                            <b>+{{ formatNumber(record.points) }}</b>
                                            <span
                                                v-if="record.tier === 'wujia'"
                                                class="u-compare-achievement-tier"
                                            >
                                                {{ $t("pages.wiki.overview.ui.statistics.wujia") }}
                                            </span>
                                        </span>
                                        <span v-if="record.tags?.length" class="m-compare-achievement__tags">
                                            <span
                                                v-for="tag in getDisplayTags(record)"
                                                :key="tag.id || tag.label"
                                                class="u-compare-achievement-tag"
                                            >
                                                {{ tag.label }}
                                            </span>
                                        </span>
                                        <span v-if="record.map?.name" class="m-compare-achievement__meta">
                                            {{ record.map.name }}
                                        </span>
                                        <span class="m-compare-achievement__dimensions">
                                            <span v-for="definition in definitions" :key="definition.key">
                                                {{ dimensionLabel(definition) }}
                                                <AchievementDifficultyStars
                                                    :value="dimensionValue(record, definition)"
                                                    :label="dimensionLabel(definition)"
                                                />
                                            </span>
                                            <span
                                                v-if="
                                                    record.completionStatistics?.rate !== null &&
                                                    record.completionStatistics?.rate !== undefined
                                                "
                                                class="u-compare-completion-rate"
                                            >
                                                {{ $t("pages.wiki.overview.ui.workbench.completionRate") }}
                                                <strong>{{ formatCompletionRate(record.completionStatistics.rate) }}</strong>
                                            </span>
                                        </span>
                                    </span>
                                </a>
                            </td>
                            <td v-for="role in roles" :key="`${record.id}-${role.id || role.jx3id}`">
                                <span
                                    class="u-compare-completion"
                                    :class="isCompleted(role, record) ? 'is-completed' : 'is-incomplete'"
                                >
                                    <CircleCheckFilled v-if="isCompleted(role, record)" aria-hidden="true" />
                                    <CircleCloseFilled v-else aria-hidden="true" />
                                    {{
                                        isCompleted(role, record)
                                            ? $t("pages.wiki.compare.ui.status.completed")
                                            : $t("pages.wiki.compare.ui.status.incomplete")
                                    }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="total > pageSize" class="m-compare-pagination">
            <el-pagination
                background
                layout="prev, pager, next"
                :current-page="page"
                :page-size="pageSize"
                :total="total"
                @current-change="$emit('page-change', $event)"
            />
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-compare-matrix {
    display: flex;
    height: 100%;
    min-width: 0;
    overflow: hidden;
    flex-direction: column;
    border: 1px solid rgba(70, 74, 66, 0.14);
    border-radius: 12px;
    background: rgba(255, 254, 250, 0.88);
}

.m-compare-matrix__filters,
.m-compare-matrix__header,
.m-compare-pagination {
    flex: none;
}

.m-compare-matrix__header {
    display: flex;
    min-height: 58px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 11px 14px;
    border-bottom: 1px solid rgba(70, 74, 66, 0.1);

    h2 {
        overflow: hidden;
        margin: 0;
        color: #384246;
        font-size: 15px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    span {
        flex: none;
        color: #9da39f;
        font-size: 10px;
    }
}

.m-compare-matrix__body {
    position: relative;
    display: flex;
    min-height: 0;
    flex: 1;
    overflow: hidden;
}

.m-compare-matrix-scroll {
    width: 100%;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
}

.m-compare-matrix-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th,
    td {
        padding: 11px 12px;
        border-right: 1px solid rgba(70, 74, 66, 0.08);
        border-bottom: 1px solid rgba(70, 74, 66, 0.09);
        text-align: center;
        vertical-align: middle;
    }

    th {
        position: sticky;
        top: 0;
        z-index: 2;
        height: 62px;
        color: #53605f;
        background: #f5f2ea;
        font-size: 12px;

        strong,
        small {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        small {
            margin-top: 3px;
            color: #9da39f;
            font-size: 10px;
            font-weight: 400;
        }
    }

    .is-achievement {
        position: sticky;
        left: 0;
        z-index: 1;
        width: 560px;
        text-align: left;
        background: #fffefa;
    }

    th.is-achievement {
        z-index: 3;
        background: #f5f2ea;

        span,
        small {
            display: block;
        }
    }

    tbody tr:hover td {
        background: #fbf9f3;
    }
}

.m-compare-achievement {
    display: grid;
    min-width: 0;
    grid-template-columns: 44px minmax(0, 1fr);
    align-items: start;
    gap: 10px;
    color: inherit;
    text-decoration: none;
}

.u-compare-achievement-icon {
    display: flex;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 9px;
    color: #47777d;
    background: rgba(71, 119, 125, 0.1);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    svg {
        width: 20px;
    }
}

.m-compare-achievement__body,
.m-compare-achievement__title {
    display: flex;
    min-width: 0;
}

.m-compare-achievement__body {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
}

.m-compare-achievement__title {
    width: 100%;
    align-items: baseline;
    gap: 6px;

    strong {
        overflow: hidden;
        color: #354044;
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    b {
        flex: none;
        color: #ad5149;
        font-size: 11px;
    }
}

.u-compare-achievement-tier {
    display: inline-flex;
    min-height: 19px;
    align-items: center;
    padding: 1px 6px;
    border-radius: 999px;
    color: #a07828;
    background: rgba(179, 140, 61, 0.11);
    font-size: 10px;
    line-height: 1;
    white-space: nowrap;
}

.m-compare-achievement__meta {
    max-width: 100%;
    color: #9ba09d;
    font-size: 10px;
}

.m-compare-achievement__tags {
    display: flex;
    max-width: 100%;
    flex-wrap: wrap;
    gap: 4px;
}

.u-compare-achievement-tag {
    padding: 0 5px;
    border: 1px solid rgba(64, 158, 255, 0.48);
    border-radius: 4px;
    color: #409eff;
    background: #ecf5ff;
    line-height: 17px;
}

.m-compare-achievement__dimensions {
    display: flex;
    max-width: 100%;
    flex-wrap: wrap;
    gap: 3px 10px;
    color: #8b9391;
    font-size: 10px;

    > span {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
    }

    strong {
        color: #a8773c;
        font-weight: 500;
        letter-spacing: 0.03em;
    }

    .u-compare-completion-rate strong {
        color: #626a68;
        font-weight: 650;
        letter-spacing: 0;
    }
}

.u-compare-completion {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;

    svg {
        width: 12px;
    }

    &.is-completed {
        color: #4f816c;
        background: rgba(79, 129, 108, 0.12);
    }

    &.is-incomplete {
        color: #ad5149;
        background: rgba(173, 81, 73, 0.1);
    }
}

.m-compare-matrix-state {
    display: flex;
    width: 100%;
    min-height: 0;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    flex: 1;
    padding: 40px;
    color: #8c9491;
    text-align: center;

    > svg {
        width: 30px;
        margin-bottom: 10px;
        color: #47777d;
    }

    strong {
        color: #4c5857;
        font-size: 15px;
    }

    p {
        max-width: 420px;
        margin: 7px 0 14px;
        font-size: 12px;
    }

    button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border: 0;
        border-radius: 7px;
        color: #fff;
        background: #47777d;
        cursor: pointer;

        svg {
            width: 14px;
        }
    }
}

.m-compare-pagination {
    display: flex;
    justify-content: center;
    padding: 14px;
    border-top: 1px solid rgba(70, 74, 66, 0.08);
}

@media (max-width: 620px) {
    .m-compare-matrix-table .is-achievement {
        width: 480px;
    }
}
</style>
