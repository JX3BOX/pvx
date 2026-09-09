<script>
import { CircleCheckFilled, CircleCloseFilled, Medal, RefreshRight } from "@element-plus/icons-vue";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";
import responsivePagination from "@/mixins/responsive-pagination";
import { formatAchievementWorkbenchValue, getAchievementWorkbenchDimensionValue } from "@/utils/achievementWorkbench";

export default {
    name: "AchievementCompareMatrix",
    mixins: [responsivePagination],
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
        resultPoints: {
            type: Number,
            default: 0,
        },
        page: {
            type: Number,
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 15,
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
                "--compare-desktop-width": `${Math.max(720, 360 + this.roles.length * 145)}px`,
                "--compare-mobile-width": `${244 + this.roles.length * 128}px`,
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
    updated() {
        const body = this.$refs.bodyScroll;
        const header = this.$refs.headerScroll;
        if (header) header.scrollLeft = body?.scrollLeft || 0;
    },
    methods: {
        syncHorizontalScroll(event, targetRef) {
            const target = this.$refs[targetRef];
            if (target && target.scrollLeft !== event.target.scrollLeft) target.scrollLeft = event.target.scrollLeft;
        },
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
        <div class="m-compare-matrix__sticky-top">
            <div ref="headerScroll" class="m-compare-matrix-scroll" aria-hidden="true" @scroll="syncHorizontalScroll($event, 'bodyScroll')">
                <table class="m-compare-matrix-table" :style="tableStyle">
                    <colgroup>
                        <col class="u-compare-achievement-column" />
                        <col v-for="role in roles" :key="role.id || role.jx3id" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th class="is-achievement" scope="col">
                                <span>{{ $t("pages.wiki.compare.ui.matrix.achievement") }}</span>
                            </th>
                            <th v-for="role in roles" :key="role.id || role.jx3id" scope="col">
                                <strong :title="roleName(role)">{{ roleName(role) }}</strong>
                                <small>{{ formatNumber(role.completedPoints) }}</small>
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>

        <div class="m-compare-matrix__header">
            <h2>{{ title || $t("pages.wiki.compare.ui.categories.all") }}</h2>
            <div class="m-compare-matrix__summary">
                <span>{{ $t("pages.wiki.compare.ui.matrix.achievementCount", { count: formatNumber(total) }) }}</span>
                <span>{{
                    $t("pages.wiki.compare.ui.workbench.availablePoints", { points: formatNumber(resultPoints) })
                }}</span>
            </div>
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

            <div
                v-else
                ref="bodyScroll"
                @scroll="syncHorizontalScroll($event, 'headerScroll')"
                class="m-compare-matrix-scroll"
                tabindex="0"
                role="region"
                :aria-label="$t('pages.wiki.compare.ui.matrix.completion')"
            >
                <table class="m-compare-matrix-table" :style="tableStyle">
                    <colgroup>
                        <col class="u-compare-achievement-column" />
                        <col v-for="role in roles" :key="role.id || role.jx3id" />
                    </colgroup>
                    <thead class="u-compare-semantic-header">
                        <tr>
                            <th class="is-achievement" scope="col">
                                <span>{{ $t("pages.wiki.compare.ui.matrix.achievement") }}</span>
                            </th>
                            <th v-for="role in roles" :key="role.id || role.jx3id" scope="col">
                                <strong :title="roleName(role)">{{ roleName(role) }}</strong>
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
                                            <span v-if="record.tier === 'wujia'" class="u-compare-achievement-tier">
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
                                        <span
                                            v-if="record.shortDescription"
                                            class="m-compare-achievement__description"
                                            >{{ record.shortDescription }}</span
                                        >
                                        <span v-if="record.map?.name" class="m-compare-achievement__meta">
                                            {{ record.map.name }}
                                        </span>
                                        <span class="m-compare-achievement__dimensions">
                                            <span class="u-compare-points"
                                                ><img src="@/assets/img/wiki/figma/points.png" alt="" />{{
                                                    formatNumber(record.points)
                                                }}</span
                                            >
                                            <span v-for="definition in definitions" :key="definition.key">
                                                {{ dimensionLabel(definition) }}
                                                <AchievementDifficultyStars
                                                    appearance="diamond"
                                                    :value="dimensionValue(record, definition)"
                                                    :dimension-key="definition.key"
                                                    :score-labels="definition.scoreLabels"
                                                    :label="dimensionLabel(definition)"
                                                />
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
                :layout="isPaginationPhoneViewport ? 'prev, slot, next' : 'prev, pager, next'"
                :current-page="page"
                :page-size="pageSize"
                :pager-count="responsivePagerCount"
                :total="total"
                @current-change="$emit('page-change', $event)"
            >
                <span class="u-achievement-pagination-status" aria-live="polite">
                    {{ page }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}
                </span>
            </el-pagination>
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-compare-matrix {
    --compare-achievement-column-width: 360px;
    display: flex;
    min-width: 0;
    flex-direction: column;
    overflow: visible;
    padding: 12px;
    border-radius: 12px;
    background: #f8f7f3;
}
.m-compare-matrix__sticky-top {
    position: sticky;
    top: calc(var(--achievement-sticky-top, 120px) + 12px);
    z-index: 5;
    background: #f8f7f3;
}
.m-compare-matrix__sticky-top::before {
    content: "";
    position: absolute;
    inset: -12px -12px 0;
    z-index: -1;
    background: #f8f7f3;
    pointer-events: none;
}
.m-compare-matrix__sticky-top > .m-compare-matrix-scroll {
    border-radius: 16px 16px 0 0;
}
.u-compare-achievement-column {
    width: var(--compare-achievement-column-width);
}
.u-compare-semantic-header {
    position: absolute;
    width: 1px;
    height: 1px;
    clip-path: inset(50%);
    overflow: hidden;
}
.m-compare-matrix__header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
    order: 2;
    padding: 12px 0 0;
    h2 {
        margin: 0;
        color: #6e572c;
        font-size: 14px;
        font-weight: 400;
    }
}
.m-compare-matrix__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    color: #999;
    font-size: 13px;
}
.m-compare-matrix__body {
    position: relative;
    min-width: 0;
}
.m-compare-matrix-scroll {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    &:focus-visible {
        outline: 2px solid #5a7e84;
        outline-offset: -2px;
    }
}
.m-compare-matrix-table {
    width: 100%;
    min-width: var(--compare-desktop-width);
    border-collapse: collapse;
    table-layout: fixed;
    th,
    td {
        box-sizing: border-box;
        padding: 8px;
        border-right: 1px solid #faf9f6;
        border-bottom: 1px solid #faf9f6;
        vertical-align: middle;
        text-align: center;
    }
    th {
        height: 64px;
        color: #6e572c;
        background: #f5f2ea;
        font-size: 14px;
        strong {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        small {
            display: none;
        }
    }
    td {
        height: 76px;
        background: #fff;
    }
    .is-achievement {
        position: sticky;
        left: 0;
        z-index: 1;
        width: var(--compare-achievement-column-width);
        text-align: left;
        background: #fff;
    }
    th.is-achievement {
        z-index: 2;
        color: #333;
        background: #f5f2ea;
        font-size: 16px;
    }
    tbody tr:hover td {
        background: #fcfcfa;
    }
}
.m-compare-achievement {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 2px 8px;
    line-height: 1.4;
    min-width: 0;
    align-items: start;
    text-decoration: none;
    color: inherit;
}
.u-compare-achievement-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    grid-column: 1;
    grid-row: 1 / span 2;
    width: 36px;
    height: 36px;
    overflow: hidden;
    border-radius: 4px;
    color: #967944;
    background: #f8f7f3;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    svg {
        width: 24px;
        height: 24px;
    }
}
.m-compare-achievement__body {
    display: contents;
}
.m-compare-achievement__title {
    display: flex;
    align-items: center;
    gap: 4px;
    grid-column: 2;
    min-width: 0;
    strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #333;
        font-size: 14px;
        font-weight: 500;
    }
}
.m-compare-achievement__description {
    grid-column: 2;
    color: #967944;
    font-size: 13px;
    line-height: 1.4;
    overflow-wrap: anywhere;
}
.m-compare-achievement__meta {
    grid-column: 2;
    color: #999;
    font-size: 13px;
}
.m-compare-achievement__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    grid-column: 2;
    min-width: 0;
}
.u-compare-achievement-tag {
    padding: 0 5px;
    border: 1px solid #df71a0;
    border-radius: 3px;
    color: #df71a0;
    background: #fff;
    font-size: 13px;
    line-height: 18px;
    overflow-wrap: anywhere;
}
.u-compare-achievement-tier {
    padding: 0 4px;
    border-radius: 3px;
    color: #967944;
    background: #f5efe0;
    font-size: 13px;
}
.m-compare-achievement__dimensions {
    display: flex;
    flex-wrap: wrap;
    grid-column: 1/-1;
    gap: 3px 8px;
    margin-top: 2px;
    color: #999;
    font-size: 13px;
    > span {
        display: inline-flex;
        align-items: center;
        gap: 3px;
    }
    .u-compare-points {
        color: #967944;
        img {
            width: 14px;
            height: 14px;
            object-fit: contain;
        }
    }
    :deep(.u-difficulty-star) {
        width: 8px;
        height: 8px;
    }
}
.u-compare-completion {
    display: inline-flex;
    max-width: 100%;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 3px 6px;
    border-radius: 20px;
    font-size: 13px;
    line-height: 1.3;
    overflow-wrap: anywhere;
    svg {
        width: 11px;
        height: 11px;
        flex: none;
    }
    &.is-completed {
        color: #4f816c;
        background: #edf2ed;
    }
    &.is-incomplete {
        color: #ad5149;
        background: #f6edeb;
    }
}
.m-compare-matrix-state {
    display: flex;
    min-height: 380px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    padding: 32px;
    color: #999;
    text-align: center;
    box-sizing: border-box;
    > svg {
        width: 30px;
        height: 30px;
        color: #967944;
    }
    strong {
        font-size: 16px;
        color: #333;
    }
    p {
        margin: 0;
        font-size: 14px;
    }
    button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: 0;
        border-radius: 24px;
        background: #5a7e84;
        color: #fff;
        cursor: pointer;
        svg {
            width: 16px;
            height: 16px;
        }
    }
}
.m-compare-pagination {
    display: flex;
    justify-content: center;
    order: 3;
    padding: 16px 0 4px;
}
@media (max-width: @phone) {
    .m-compare-matrix {
        --compare-achievement-column-width: 244px;
    }
    .m-compare-matrix__sticky-top {
        position: static;
        &::before {
            display: none;
        }
    }
    .m-compare-matrix-table {
        min-width: var(--compare-mobile-width);
        .is-achievement {
            position: static;
            width: var(--compare-achievement-column-width);
        }
        th strong {
            white-space: normal;
            overflow-wrap: anywhere;
        }
    }
    .m-compare-matrix__header {
        overflow-wrap: anywhere;
    }
    .m-compare-achievement__title strong {
        white-space: normal;
        overflow-wrap: anywhere;
    }
    .m-compare-matrix-state {
        min-height: 240px;
        padding: 24px 12px;
        button {
            min-height: 44px;
        }
    }
    .m-compare-pagination :deep(.el-pagination) {
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
