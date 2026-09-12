<script>
import { RefreshLeft, Search } from "@element-plus/icons-vue";

export default {
    name: "AchievementProgressFilters",
    components: {
        RefreshLeft,
        Search,
    },
    props: {
        categoryOptions: {
            type: Array,
            default: () => [],
        },
        mapOptions: {
            type: Array,
            default: () => [],
        },
        categoryId: {
            type: String,
            default: "all",
        },
        showCategory: {
            type: Boolean,
            default: true,
        },
        tier: {
            type: String,
            default: "normal",
        },
        showTier: {
            type: Boolean,
            default: true,
        },
        embedded: {
            type: Boolean,
            default: false,
        },
        completion: {
            type: String,
            default: "all",
        },
        mapId: {
            type: String,
            default: "",
        },
        sort: {
            type: String,
            default: "default",
        },
        keyword: {
            type: String,
            default: "",
        },
        dimensions: {
            type: Array,
            default: () => [],
        },
        sortLoading: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        mapSelectValue() {
            return this.mapId || "all";
        },
    },
    emits: [
        "update:category-id",
        "update:tier",
        "update:completion",
        "update:map-id",
        "update:sort",
        "update:keyword",
        "submit-search",
        "reset-filters",
    ],
    methods: {
        submitSearch() {
            this.$emit("submit-search");
        },
        changeMap(mapId) {
            const value = mapId === "all" ? "" : String(mapId || "");
            this.$emit("update:map-id", value);
            this.$emit("submit-search", { mapId: value });
        },
        getDimensionLabel(dimension) {
            if (dimension?.i18nKey) return this.$t(dimension.i18nKey);
            return dimension?.label || dimension?.key || "—";
        },
        getDimensionSortValue(dimension) {
            return `dimension:${dimension.key}:asc`;
        },
    },
};
</script>

<template>
    <section
        :class="['m-progress-filters m-achievement-filter-toolbar', { 'is-embedded': embedded }]"
        :aria-label="$t('pages.wiki.overview.ui.workbench.filters')"
    >
        <div class="m-progress-filter-row">
            <el-select popper-class="m-achievement-theme-popper"
                v-if="showCategory"
                :model-value="categoryId"
                class="u-progress-filter"
                :aria-label="$t('pages.wiki.overview.ui.workbench.category')"
                @change="$emit('update:category-id', String($event))"
            >
                <el-option
                    v-for="category in categoryOptions"
                    :key="category.id"
                    :value="category.id"
                    :label="category.name"
                />
            </el-select>

            <el-select popper-class="m-achievement-theme-popper"
                v-if="showTier"
                :model-value="tier"
                class="u-progress-filter"
                :aria-label="$t('pages.wiki.overview.ui.workbench.tier')"
                @change="$emit('update:tier', $event)"
            >
                <el-option value="normal" :label="$t('pages.wiki.overview.ui.statistics.regular')" />
                <el-option value="wujia" :label="$t('pages.wiki.overview.ui.statistics.wujia')" />
            </el-select>

            <el-select popper-class="m-achievement-theme-popper"
                :model-value="completion"
                class="u-progress-filter"
                :aria-label="$t('pages.wiki.overview.ui.status')"
                @change="$emit('update:completion', $event)"
            >
                <el-option value="all" :label="$t('pages.wiki.overview.ui.workbench.allStatuses')" />
                <el-option value="incomplete" :label="$t('pages.wiki.overview.ui.incomplete')" />
                <el-option value="completed" :label="$t('pages.wiki.overview.ui.completed')" />
            </el-select>

            <el-select popper-class="m-achievement-theme-popper"
                :model-value="mapSelectValue"
                class="u-progress-filter is-map"
                filterable
                :aria-label="$t('pages.wiki.overview.ui.workbench.map')"
                @change="changeMap"
            >
                <el-option value="all" :label="$t('pages.wiki.overview.ui.workbench.allMaps')" />
                <el-option v-for="map in mapOptions" :key="map.id" :value="map.id" :label="map.label" />
            </el-select>

            <el-select popper-class="m-achievement-theme-popper"
                :model-value="sort"
                class="u-progress-filter is-sort"
                :disabled="sortLoading"
                :loading="sortLoading"
                :aria-label="$t('pages.wiki.overview.ui.workbench.sort')"
                @change="$emit('update:sort', $event)"
            >
                <el-option value="default" :label="$t('pages.wiki.overview.ui.workbench.sortDefault')" />
                <el-option value="priority" :label="$t('pages.wiki.overview.ui.workbench.sortPriority')" />
                <el-option value="points-desc" :label="$t('pages.wiki.overview.ui.workbench.sortPointsDesc')" />
                <el-option value="points-asc" :label="$t('pages.wiki.overview.ui.workbench.sortPointsAsc')" />
                <el-option
                    v-for="dimension in dimensions"
                    :key="dimension.key"
                    :value="getDimensionSortValue(dimension)"
                    :label="
                        $t(
                            dimension.key === 'costEffectiveness'
                                ? 'pages.wiki.difficultyDimensions.sortDescending'
                                : 'pages.wiki.difficultyDimensions.sortAscending',
                            { label: getDimensionLabel(dimension) }
                        )
                    "
                />
            </el-select>
        </div>

        <div class="m-progress-search">
            <el-input
                :model-value="keyword"
                clearable
                :placeholder="$t('pages.wiki.overview.ui.workbench.searchPlaceholder')"
                :aria-label="$t('pages.wiki.overview.ui.workbench.searchPlaceholder')"
                @update:model-value="$emit('update:keyword', $event)"
                @keyup.enter="submitSearch"
            />
            <button type="button" class="u-progress-search-button" :disabled="loading" @click="submitSearch">
                <Search aria-hidden="true" />
                <span>{{ $t("pages.wiki.overview.ui.workbench.search") }}</span>
            </button>
            <button
                type="button"
                class="u-progress-clear-button"
                :disabled="loading"
                @click="$emit('reset-filters')"
            >
                <RefreshLeft aria-hidden="true" />
                <span>{{ $t("pages.wiki.overview.ui.workbench.reset") }}</span>
            </button>
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-progress-filters {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 8px;
    padding: 12px;
    background: #f8f7f3;
    border-radius: 12px;
}
.m-progress-filter-row,
.m-progress-search {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
}
.m-progress-filter-row {
    flex-wrap: wrap;
}
.u-progress-filter {
    width: 188px;
    max-width: 100%;
    min-width: 0;
    flex: none;
}
.m-progress-search {
    > .el-input {
        min-width: 0;
        flex: 1;
    }
}
.u-progress-search-button,
.u-progress-clear-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    gap: 4px;
    min-width: 80px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid #967944;
    border-radius: 99px;
    color: #fff;
    background: #967944;
    font: inherit;
    cursor: pointer;
    svg {
        width: 16px;
        height: 16px;
    }
    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }
}
.u-progress-clear-button {
    border-color: #e5e5e5;
    color: #967944;
    background: #fff;
}
.m-progress-filters.is-embedded {
    flex-direction: column;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    .u-progress-filter {
        width: 188px;
        min-width: 0;
    }
    .u-progress-filter.is-sort {
        position: absolute;
        right: 12px;
        top: 12px;
        width: 140px;
    }
}
@media (max-width: 1180px) {
    .m-progress-filters {
        flex-direction: column;
    }
}
@media (max-width: @phone) {
    .m-progress-filter-row,
    .m-progress-filters.is-embedded .m-progress-filter-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .u-progress-filter,
    .m-progress-filters.is-embedded .u-progress-filter {
        width: 100%;
        min-width: 0;
    }
    .m-progress-filters.is-embedded .u-progress-filter.is-sort {
        position: static;
        width: 100%;
    }
    .m-progress-search {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        > .el-input {
            grid-column: 1 / -1;
        }
    }
    .u-progress-search-button,
    .u-progress-clear-button {
        min-height: 44px;
        width: 100%;
    }
}
</style>
