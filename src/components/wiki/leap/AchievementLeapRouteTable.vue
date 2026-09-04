<script>
import { Delete, Search } from "@element-plus/icons-vue";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import { markRaw } from "vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";
import {
    formatAchievementWorkbenchValue,
    getAchievementWorkbenchDimensionSort,
    getAchievementWorkbenchDimensionValue,
} from "@/utils/achievementWorkbench";

export default {
    name: "AchievementLeapRouteTable",
    components: {
        AchievementDifficultyStars,
        Delete,
        PvxEmptyState,
        PvxSurface,
    },
    props: {
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
        categories() {
            const categoryMap = new Map();
            this.items.forEach((item) => {
                const id = String(item.category?.id || "");
                if (id && !categoryMap.has(id)) categoryMap.set(id, item.category?.name || id);
            });
            return [...categoryMap].map(([id, name]) => ({ id, name }));
        },
        showCompletionRateColumn() {
            return this.items.some((item) => this.hasDisplayValue(item.completionStatistics?.rate));
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
    <PvxSurface class="m-leap-route" padding="medium" v-loading="loading">
        <header class="m-leap-route__header">
            <div>
                <span>{{ $t("pages.wiki.leap.ui.workbench.costLedger") }}</span>
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
                    :label="$t('pages.wiki.difficultyDimensions.sortAscending', { label: dimensionLabel(dimension) })"
                    :value="`dimension:${dimension.key}:asc`"
                    :disabled="!hasDimensionValue(dimension.key)"
                />
            </el-select>
        </div>

        <div v-if="filteredItems.length" class="m-leap-route__scroll">
            <table>
                <thead>
                    <tr>
                        <th>{{ $t("pages.wiki.leap.ui.status") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.achievementName") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.workbench.category") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.points") }}</th>
                        <th v-for="dimension in dimensions" :key="dimension.key">
                            {{ dimensionLabel(dimension) }}
                        </th>
                        <th v-if="showCompletionRateColumn">
                            {{ $t("pages.wiki.leap.ui.workbench.globalCompletionRate") }}
                        </th>
                        <th v-if="showTagsColumn">{{ $t("pages.wiki.leap.ui.workbench.tags") }}</th>
                        <th v-if="showSchoolRestrictionColumn">
                            {{ $t("pages.wiki.leap.ui.workbench.schoolRestriction") }}
                        </th>
                        <th v-if="showGuideNoteColumn">{{ $t("pages.wiki.leap.ui.workbench.routeNote") }}</th>
                        <th v-if="removable" class="u-leap-route-action">
                            {{ $t("pages.wiki.leap.ui.workbench.action") }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in visibleItems" :key="item.id" :class="{ 'is-completed': item.completed }">
                        <td>
                            <span class="u-leap-status" :class="{ 'is-completed': item.completed }">
                                {{
                                    item.completed
                                        ? $t("pages.wiki.leap.ui.completed")
                                        : $t("pages.wiki.leap.ui.incomplete")
                                }}
                            </span>
                        </td>
                        <td class="u-leap-achievement-cell">
                            <a :href="getLink('achievement', item.id)" target="_blank" rel="noopener noreferrer">
                                <img v-if="item.iconId" :src="iconLink(item.iconId)" alt="" />
                                <span>
                                    <strong>{{ item.name || item.id }}</strong>
                                    <small v-if="item.map?.name">{{ item.map.name }}</small>
                                </span>
                            </a>
                        </td>
                        <td>{{ categoryLabel(item) }}</td>
                        <td class="u-leap-number">{{ formatValue(item.points) }}</td>
                        <td v-for="dimension in dimensions" :key="dimension.key" class="u-leap-rating">
                            <AchievementDifficultyStars
                                :value="getDimensionValue(item, dimension.key)"
                                :label="dimensionLabel(dimension)"
                            />
                        </td>
                        <td v-if="showCompletionRateColumn">
                            {{ formatCompletionRate(item.completionStatistics?.rate) }}
                        </td>
                        <td v-if="showTagsColumn" class="u-leap-tags">
                            <div class="u-leap-tag-list">
                                <span v-for="tag in getDisplayTags(item)" :key="tag.id || tag.label" class="u-leap-tag">
                                    {{ tag.label }}
                                </span>
                                <span v-if="!item.tags?.length">—</span>
                            </div>
                        </td>
                        <td v-if="showSchoolRestrictionColumn">{{ formatValue(item.restriction?.school) }}</td>
                        <td v-if="showGuideNoteColumn" class="u-leap-note">{{ formatValue(item.guideNote) }}</td>
                        <td v-if="removable" class="u-leap-route-action">
                            <button
                                type="button"
                                class="u-leap-remove-button"
                                :aria-label="$t('pages.wiki.leap.ui.workbench.removeRouteItemLabel', { name: item.name || item.id })"
                                @click="removeItem(item)"
                            >
                                <Delete aria-hidden="true" />
                                {{ $t("pages.wiki.leap.ui.workbench.removeRouteItem") }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
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
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="filteredItems.length"
            />
        </div>

        <p class="u-leap-route-hint">{{ $t("pages.wiki.leap.ui.workbench.costFormulaHint") }}</p>
    </PvxSurface>
</template>

<style lang="less" scoped>
.m-leap-route {
    min-width: 0;
    color: #344143;
}

.m-leap-route__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
}

.m-leap-route__header span {
    color: #a88139;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.m-leap-route__header h2 {
    margin: 4px 0;
    font-size: 20px;
}

.m-leap-route__header p {
    margin: 0;
    color: #7a8586;
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

.m-leap-route__scroll {
    width: 100%;
    max-width: 100%;
    border: 1px solid rgba(68, 86, 84, 0.13);
    border-radius: 11px;
    overflow-x: auto;
}

table {
    width: 100%;
    min-width: 1580px;
    border-collapse: collapse;
    background: #fffdf8;
}

th,
td {
    padding: 11px 12px;
    border-bottom: 1px solid rgba(68, 86, 84, 0.1);
    color: #687274;
    font-size: 12px;
    text-align: left;
    white-space: nowrap;
}

th {
    position: sticky;
    top: 0;
    z-index: 1;
    color: #405659;
    background: #f0ece3;
    font-weight: 700;
}

tbody tr:last-child td {
    border-bottom: 0;
}

tbody tr.is-completed {
    opacity: 0.62;
}

.u-leap-status {
    display: inline-flex;
    padding: 4px 8px;
    border-radius: 999px;
    color: #a3543f;
    background: #f8e8e3;
    font-size: 11px;
    font-weight: 700;
}

.u-leap-status.is-completed {
    color: #356b5c;
    background: #e5f0ea;
}

.u-leap-achievement-cell a {
    display: flex;
    max-width: 300px;
    align-items: center;
    gap: 9px;
    color: #34484a;
    text-decoration: none;
}

.u-leap-achievement-cell img {
    width: 34px;
    height: 34px;
    border-radius: 7px;
    object-fit: cover;
}

.u-leap-achievement-cell span {
    display: grid;
    min-width: 0;
    gap: 2px;
}

.u-leap-achievement-cell strong,
.u-leap-achievement-cell small {
    overflow: hidden;
    text-overflow: ellipsis;
}

.u-leap-achievement-cell small {
    color: #9aa2a2;
}

.u-leap-number,
.u-leap-rating {
    color: #8e6d32;
    font-variant-numeric: tabular-nums;
}

.u-leap-rating {
    letter-spacing: 0.04em;
}

.u-leap-tags {
    max-width: 280px;
    white-space: normal;
}

.u-leap-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.u-leap-tag {
    padding: 3px 6px;
    border-radius: 999px;
    color: #47777d;
    background: #e7f0ef;
}

.u-leap-note {
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.u-leap-route-action {
    position: sticky;
    right: 0;
    width: 82px;
    background: #fffdf8;
    box-shadow: -8px 0 12px rgba(52, 65, 67, 0.05);
    text-align: center;
}

th.u-leap-route-action {
    z-index: 2;
    background: #f0ece3;
}

.u-leap-remove-button {
    display: inline-flex;
    min-height: 30px;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px 9px;
    border: 1px solid rgba(163, 84, 63, 0.2);
    border-radius: 7px;
    color: #a3543f;
    background: #fff7f4;
    cursor: pointer;
}

.u-leap-remove-button:hover,
.u-leap-remove-button:focus-visible {
    border-color: #a3543f;
    background: #f8e8e3;
}

.u-leap-remove-button svg {
    width: 14px;
}

.m-leap-route__pagination {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}

.u-leap-route-hint {
    margin: 12px 0 0;
    color: #939b9b;
    font-size: 12px;
    line-height: 1.6;
}

@media (max-width: 1120px) {
    .m-leap-route__filters {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 720px) {
    .m-leap-route__header {
        display: grid;
    }

    .m-leap-route__filters {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
