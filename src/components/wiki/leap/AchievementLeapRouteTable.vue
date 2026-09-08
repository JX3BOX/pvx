<script>
import { Delete, Search } from "@element-plus/icons-vue";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import { markRaw } from "vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import responsivePagination from "@/mixins/responsive-pagination";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";
import AchievementRecommendationItems from "./AchievementRecommendationItems.vue";
import {
    formatAchievementWorkbenchValue,
    getAchievementWorkbenchDimensionSort,
    getAchievementWorkbenchDimensionValue,
} from "@/utils/achievementWorkbench";

export default {
    name: "AchievementLeapRouteTable",
    mixins: [responsivePagination],
    components: {
        AchievementDifficultyStars,
        AchievementRecommendationItems,
        Delete,
        PvxEmptyState,
        PvxSurface,
    },
    props: {
        recommendationLayout: { type: Boolean, default: false },
        maps: { type: Array, default: () => [] },
        items: {
            type: Array,
            default: () => [],
        },
        dimensions: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        removable: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["remove"],
    data() {
        return {
            searchIcon: markRaw(Search),
            keyword: "",
            categoryId: "all",
            completion: "all",
            sort: "route",
            page: 1,
            pageSize: 30,
        };
    },
    computed: {
        tableStyle() {
            const optionalCount = [this.showTagsColumn, this.showSchoolRestrictionColumn, this.showGuideNoteColumn].filter(Boolean).length;
            return {
                '--leap-route-columns': ['30px', 'minmax(240px, 3fr)', '90px', '68px',
                    ...this.dimensions.map(() => 'minmax(110px, 1fr)'),
                    ...Array.from({ length: optionalCount }, () => 'minmax(140px, 1fr)'),
                    this.removable ? '40px' : null].filter(Boolean).join(' '),
                '--leap-route-min-width': `${488 + this.dimensions.length * 122 + optionalCount * 152 + (this.removable ? 52 : 0)}px`,
            };
        },
        categories() {
            const categoryMap = new Map();
            this.items.forEach((item) => {
                const id = String(item.category?.id || "");
                if (id && !categoryMap.has(id)) categoryMap.set(id, item.category?.name || id);
            });
            return [...categoryMap].map(([id, name]) => ({ id, name }));
        },
        showTagsColumn() {
            return this.items.some((item) =>
                this.getDisplayTags(item).some((tag) => this.hasDisplayValue(tag?.label))
            );
        },
        showSchoolRestrictionColumn() {
            return this.items.some((item) => this.hasDisplayValue(item.restriction?.school));
        },
        showGuideNoteColumn() {
            return this.items.some((item) => this.hasDisplayValue(item.guideNote));
        },
        filteredItems() {
            const keyword = this.keyword.trim().toLowerCase();
            const dimensionSort = getAchievementWorkbenchDimensionSort(this.sort);
            const source = this.items
                .map((item, routeIndex) => ({ ...item, routeIndex }))
                .filter((item) => {
                    if (keyword) {
                        const haystack = [
                            item.name,
                            item.shortDescription,
                            item.guideNote,
                            item.map?.name,
                            ...(item.tags || []).map((tag) => tag.label),
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();
                        if (!haystack.includes(keyword)) return false;
                    }
                    if (this.categoryId !== "all" && String(item.category?.id) !== this.categoryId) return false;
                    if (
                        this.completion !== "all" &&
                        (this.completion === "completed") !== Boolean(item.completed)
                    ) {
                        return false;
                    }
                    return true;
                });

            source.sort((left, right) => {
                if (this.sort === "points-desc") return right.points - left.points;
                if (dimensionSort) {
                    return (
                        this.compareNullable(
                            this.getDimensionValue(left, dimensionSort.key),
                            this.getDimensionValue(right, dimensionSort.key)
                        ) || left.routeIndex - right.routeIndex
                    );
                }
                return left.routeIndex - right.routeIndex;
            });
            return source;
        },
        visibleItems() {
            const start = (this.page - 1) * this.pageSize;
            return this.filteredItems.slice(start, start + this.pageSize);
        },
    },
    watch: {
        keyword() {
            this.page = 1;
        },
        categoryId() {
            this.page = 1;
        },
        completion() {
            this.page = 1;
        },
        sort() {
            this.page = 1;
        },
        items() {
            this.page = 1;
        },
    },
    methods: {
        syncHeaderScroll(event) {
            if (this.$refs.tableHeader) this.$refs.tableHeader.scrollLeft = event.target.scrollLeft;
        },
        iconLink,
        getLink,
        compareNullable(left, right) {
            const leftMissing = left === null || left === undefined;
            const rightMissing = right === null || right === undefined;
            if (leftMissing && !rightMissing) return 1;
            if (!leftMissing && rightMissing) return -1;
            if (leftMissing && rightMissing) return 0;
            return Number(left) - Number(right);
        },
        formatValue(value) {
            return formatAchievementWorkbenchValue(value);
        },
        getDimensionValue(item, key) {
            return getAchievementWorkbenchDimensionValue(item, key);
        },
        dimensionLabel(dimension) {
            if (dimension?.i18nKey) return this.$t(dimension.i18nKey);
            return dimension?.label || dimension?.key || "—";
        },
        hasDimensionValue(key) {
            return this.items.some((item) => this.getDimensionValue(item, key) !== null);
        },
        hasDisplayValue(value) {
            return value !== null && value !== undefined && String(value).trim() !== "";
        },
        getDisplayTags(item) {
            const tags = Array.isArray(item?.tags) ? item.tags : [];
            return [...tags].sort((left, right) => Number(right?.type === "school") - Number(left?.type === "school"));
        },
        categoryLabel(item) {
            return item.category?.subName || item.category?.name || "—";
        },
        removeItem(item) {
            this.$emit("remove", item);
        },
    },
};
</script>

<template>
    <PvxSurface class="m-leap-route" padding="small" radius="medium" v-loading="loading">
        <header class="m-leap-route__header">
            <div>
                <h2>{{ $t("pages.wiki.leap.ui.workbench.routeList") }}</h2>
                <p>{{ $t("pages.wiki.leap.ui.workbench.costLedgerDescription") }}</p>
            </div>
            <strong>{{ $t("pages.wiki.leap.ui.achievementCount", { count: filteredItems.length }) }}</strong>
        </header>

        <div class="m-leap-route__filters">
            <el-input
                v-model="keyword"
                clearable
                :prefix-icon="searchIcon"
                :placeholder="$t('pages.wiki.leap.ui.workbench.searchRoute')"
            />
            <el-select v-model="categoryId">
                <el-option :label="$t('pages.wiki.leap.ui.workbench.allCategories')" value="all" />
                <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
            </el-select>
            <el-select v-model="completion">
                <el-option :label="$t('pages.wiki.leap.ui.all')" value="all" />
                <el-option :label="$t('pages.wiki.leap.ui.incomplete')" value="incomplete" />
                <el-option :label="$t('pages.wiki.leap.ui.completed')" value="completed" />
            </el-select>
            <el-select v-model="sort">
                <el-option :label="$t('pages.wiki.leap.ui.workbench.routeOrder')" value="route" />
                <el-option :label="$t('pages.wiki.leap.ui.workbench.pointsDescending')" value="points-desc" />
                <el-option
                    v-for="dimension in dimensions"
                    :key="dimension.key"
                    :label="
                        $t(
                            dimension.key === 'costEffectiveness'
                                ? 'pages.wiki.difficultyDimensions.sortDescending'
                                : 'pages.wiki.difficultyDimensions.sortAscending',
                            { label: dimensionLabel(dimension) }
                        )
                    "
                    :value="`dimension:${dimension.key}:asc`"
                    :disabled="!hasDimensionValue(dimension.key)"
                />
            </el-select>
        </div>

        <AchievementRecommendationItems v-if="recommendationLayout && filteredItems.length"
            class="m-leap-route-recommendation"
            :items="visibleItems" :dimensions="dimensions" :selected-ids="new Set()"
            :editable="false" :removable="false" :order-offset="(page - 1) * pageSize"
            table-layout show-completion />

        <div v-else-if="filteredItems.length" class="m-leap-route-table" role="table" :style="tableStyle"
            :aria-label="$t('pages.wiki.leap.ui.workbench.routeList')">
            <div ref="tableHeader" class="m-leap-route-table-header" role="rowgroup">
                    <div role="row" class="m-leap-route-row">
                        <div role="columnheader">#</div>
                        <div role="columnheader">{{ $t("pages.wiki.leap.ui.achievementName") }}</div>
                        <div role="columnheader">{{ $t("pages.wiki.leap.ui.status") }}</div>
                        <div role="columnheader">{{ $t("pages.wiki.leap.ui.points") }}</div>
                        <div role="columnheader" v-for="dimension in dimensions" :key="dimension.key">
                            {{ dimensionLabel(dimension) }}
                        </div>
                        <div role="columnheader" v-if="showTagsColumn">{{ $t("pages.wiki.leap.ui.workbench.tags") }}</div>
                        <div role="columnheader" v-if="showSchoolRestrictionColumn">
                            {{ $t("pages.wiki.leap.ui.workbench.schoolRestriction") }}
                        </div>
                        <div role="columnheader" v-if="showGuideNoteColumn">{{ $t("pages.wiki.leap.ui.workbench.routeNote") }}</div>
                        <div role="columnheader" v-if="removable" class="u-leap-route-action">
                            {{ $t("pages.wiki.leap.ui.workbench.action") }}
                        </div>
                    </div>

            </div>
            <div class="m-leap-route__scroll" tabindex="0" @scroll.passive="syncHeaderScroll">
                <div role="rowgroup" class="m-leap-route-table-body">
                    <div role="row" class="m-leap-route-row" v-for="(item, index) in visibleItems" :key="item.id" :class="{ 'is-completed': item.completed }">
                        <div role="cell" class="u-leap-order">{{ (page - 1) * pageSize + index + 1 }}</div>
                        <div role="cell" class="u-leap-achievement-cell">
                            <a :href="getLink('achievement', item.id)" target="_blank" rel="noopener noreferrer">
                                <img v-if="item.iconId" :src="iconLink(item.iconId)" alt="" />
                                <strong>{{ item.name || item.id }}</strong>
                            </a>
                            <p v-if="item.shortDescription" class="u-leap-achievement-description">{{ item.shortDescription }}</p>
                            <small class="u-leap-achievement-place">
                                {{ [item.category?.name, item.category?.subName].filter(Boolean).join(' · ') }}<span v-if="item.map?.name">{{ item.category?.name ? ' · ' : '' }}{{ item.map.name }}</span>
                            </small>
                            <small v-if="item.campRestricted" class="u-camp-restricted">{{ $t("achievementRecommendation.campRestricted") }}</small>
                        </div>
                        <div role="cell">
                            <span class="u-leap-status" :class="{ 'is-completed': item.completed }">
                                {{
                                    item.completed
                                        ? $t("pages.wiki.leap.ui.completed")
                                        : $t("pages.wiki.leap.ui.incomplete")
                                }}
                            </span>
                        </div>
                        <div role="cell" class="u-leap-number">{{ formatValue(item.points) }}</div>
                        <div role="cell" v-for="dimension in dimensions" :key="dimension.key" class="u-leap-rating">
                            <AchievementDifficultyStars
                                :value="getDimensionValue(item, dimension.key)"
                                :dimension-key="dimension.key"
                                :score-labels="dimension.scoreLabels"
                                :label="dimensionLabel(dimension)"
                            />
                        </div>
                        <div role="cell" v-if="showTagsColumn" class="u-leap-tags">
                            <div class="u-leap-tag-list">
                                <span v-for="tag in getDisplayTags(item)" :key="tag.id || tag.label" class="u-leap-tag">
                                    {{ tag.label }}
                                </span>
                                <span v-if="!item.tags?.length">—</span>
                            </div>
                        </div>
                        <div role="cell" v-if="showSchoolRestrictionColumn">{{ formatValue(item.restriction?.school) }}</div>
                        <div role="cell" v-if="showGuideNoteColumn" class="u-leap-note">{{ formatValue(item.guideNote) }}</div>
                        <div role="cell" v-if="removable" class="u-leap-route-action">
                            <button
                                type="button"
                                class="u-leap-remove-button"
                                :aria-label="$t('pages.wiki.leap.ui.workbench.removeRouteItemLabel', { name: item.name || item.id })"
                                @click="removeItem(item)"
                            >
                                <Delete aria-hidden="true" />

                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <PvxEmptyState
            v-else-if="!loading"
            class="m-leap-route__empty"
            :title="$t('pages.wiki.leap.ui.noAchievements')"
            :description="$t('pages.wiki.leap.ui.workbench.noRouteResults')"
        >
            <template #icon><Search /></template>
        </PvxEmptyState>

        <div v-if="filteredItems.length > pageSize" class="m-leap-route__pagination">
            <el-pagination
                v-model:current-page="page"
                background
                :layout="isPaginationPhoneViewport ? 'prev, slot, next' : 'prev, pager, next'"
                :pager-count="responsivePagerCount"
                :page-size="pageSize"
                :total="filteredItems.length"
            >
                <span class="u-achievement-pagination-status" aria-live="polite">
                    {{ page }} / {{ Math.max(1, Math.ceil(filteredItems.length / pageSize)) }}
                </span>
            </el-pagination>
        </div>

    </PvxSurface>
</template>

<style lang="less" scoped>
.u-leap-achievement-cell .u-camp-restricted {
    color: #ae3b40;
}
.m-leap-route {
    min-width: 0;
    color: #344143;
}
.m-leap-route-recommendation {
    --recommendation-table-sticky-top: var(--achievement-sticky-top, 60px);
}

.m-leap-route__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
}

.m-leap-route__header h2 {
    margin: 0 0 4px;
    font-size: 17px;
    line-height: 1.5;
}

.m-leap-route__header p {
    margin: 0;
    color: #7a8586;
    font-size: 12px;
    line-height: 1.6;
}

.m-leap-route__header > strong {
    color: #547277;
    font-size: 13px;
    white-space: nowrap;
}

.m-leap-route__filters {
    display: grid;
    grid-template-columns: minmax(220px, 1.6fr) repeat(3, minmax(140px, 1fr));
    gap: 10px;
    margin-bottom: 12px;
}

.m-leap-route-table {
    min-width: 0;
    border: 1px solid rgba(68, 86, 84, 0.13);
    border-radius: 10px;
    background: #fffdf8;
}
.m-leap-route-table-header {
    position: sticky;
    top: var(--achievement-sticky-top, 60px);
    z-index: 4;
    overflow: hidden;
    border-radius: 9px 9px 0 0;
    background: #f0ece3;
    box-shadow: 0 1px 0 rgba(68, 86, 84, 0.1);
    color: #405659;
    font-size: 12px;
    font-weight: 700;
}
.m-leap-route__scroll {
    min-width: 0;
    overflow-x: auto;
    border-radius: 0 0 9px 9px;
    overscroll-behavior-x: contain;
    scrollbar-width: thin;
    scrollbar-color: #99afae #f0ece3;
}
.m-leap-route__scroll:focus-visible { outline: 2px solid #47777d; outline-offset: 2px; }
.m-leap-route-row {
    display: grid;
    grid-template-columns: var(--leap-route-columns);
    min-width: var(--leap-route-min-width);
    box-sizing: border-box;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
}
.m-leap-route-row > [role="cell"],
.m-leap-route-row > [role="columnheader"] { min-width: 0; overflow-wrap: anywhere; }
.m-leap-route-table-body .m-leap-route-row {
    min-height: 76px;
    border-bottom: 1px solid rgba(68, 86, 84, 0.1);
    color: #687274;
    font-size: 12px;
    &:last-child { border-bottom: 0; }
    &:hover { background: #f3f8f6; }
    &.is-completed { color: #7a8586; }
}
.u-leap-order { color: #87918a; font-size: 11px; font-variant-numeric: tabular-nums; }
.u-leap-status {
    display: inline-flex;
    padding: 4px 8px;
    border-radius: 999px;
    color: #a3543f;
    background: #f8e8e3;
    font-size: 11px;
    font-weight: 500;
    &.is-completed { color: #356b5c; background: #e5f0ea; }
}
.u-leap-achievement-cell a {
    display: flex;
    min-height: 24px;
    min-width: 0;
    align-items: center;
    gap: 7px;
    color: #365f64;
    text-decoration: none;
    font-size: 13px;
    line-height: 1.5;
}
.u-leap-achievement-cell img { width: 24px; height: 24px; flex: none; border-radius: 4px; object-fit: cover; }
.u-leap-achievement-cell strong { font-weight: 400; overflow-wrap: anywhere; }
.u-leap-achievement-cell small { display: block; color: #7a8586; font-size: 11px; line-height: 1.5; }
.u-leap-achievement-cell .u-leap-achievement-description {
    margin: 0;
    color: #7a8586;
    font-size: 12px;
    white-space: pre-line;
    overflow-wrap: anywhere;
    line-height: 1.5;
}
.u-leap-number { color: #a77836; font-variant-numeric: tabular-nums; }
.u-leap-tag-list { display: flex; flex-wrap: wrap; gap: 4px; }
.u-leap-tag { padding: 1px 7px; border: 1px solid rgba(64,158,255,0.52); border-radius: 4px; color: #409eff; background: #ecf5ff; font-size: 11px; }
.u-leap-note { white-space: pre-line; }
.u-leap-route-action { text-align: center; }
.u-leap-remove-button {
    display: inline-flex;
    width: 28px;
    min-height: 32px;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: 0;
    border-radius: 4px;
    color: #697374;
    background: transparent;
    cursor: pointer;
    &:hover { color: #a3543f; background: #f8e8e3; }
    &:focus-visible { outline: 2px solid #47777d; outline-offset: 2px; }
    svg { width: 14px; height: 14px; }
}

.m-leap-route__pagination {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}

@media (max-width: @ipad) {
    .m-leap-route__filters {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: @phone) {
    .m-leap-route__header {
        display: grid;
        gap: 8px;
    }

    .m-leap-route__filters {
        grid-template-columns: minmax(0, 1fr);
    }

    .m-leap-route__header > div {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    .m-leap-route__header > strong {
        white-space: normal;
    }

    .m-leap-route__filters :deep(.el-select),
    .m-leap-route__filters :deep(.el-input) {
        width: 100%;
        min-width: 0;
    }

    .m-leap-route__filters :deep(.el-select__wrapper),
    .m-leap-route__filters :deep(.el-input__wrapper) {
        min-height: 40px;
        box-sizing: border-box;
    }

    .m-leap-route-row {
        padding: 10px;
    }

    .u-leap-achievement-cell a {
        min-width: 0;
    }

    .u-leap-achievement-cell strong,
    .u-leap-note {
        white-space: normal;
        overflow-wrap: anywhere;
    }

    .u-leap-remove-button {
        width: 40px;
        min-height: 40px;
    }

    .m-leap-route__pagination {
        min-width: 0;
        padding: 12px 0;

        :deep(.el-pagination) {
            --el-pagination-button-width: 36px;
            --el-pagination-button-height: 36px;
            max-width: 100%;
            flex-wrap: nowrap;
            justify-content: center;
            gap: 12px;
        }

        .u-achievement-pagination-status {
            min-width: 72px;
            color: #687274;
            font-size: 13px;
            font-variant-numeric: tabular-nums;
            text-align: center;
        }

        :deep(.el-pagination.is-background .btn-prev),
        :deep(.el-pagination.is-background .btn-next) {
            box-sizing: border-box;
            min-width: 36px;
            height: 36px;
            flex: none;
            margin: 0;
            padding: 0;
        }
    }
}
</style>
