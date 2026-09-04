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
        :class="['m-progress-filters', { 'is-embedded': embedded }]"
        :aria-label="$t('pages.wiki.overview.ui.workbench.filters')"
    >
        <div class="m-progress-filter-row">
            <el-select
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

            <el-select
                v-if="showTier"
                :model-value="tier"
                class="u-progress-filter"
                :aria-label="$t('pages.wiki.overview.ui.workbench.tier')"
                @change="$emit('update:tier', $event)"
            >
                <el-option value="normal" :label="$t('pages.wiki.overview.ui.statistics.regular')" />
                <el-option value="wujia" :label="$t('pages.wiki.overview.ui.statistics.wujia')" />
            </el-select>

            <el-select
                :model-value="completion"
                class="u-progress-filter"
                :aria-label="$t('pages.wiki.overview.ui.status')"
                @change="$emit('update:completion', $event)"
            >
                <el-option value="all" :label="$t('pages.wiki.overview.ui.workbench.allStatuses')" />
                <el-option value="incomplete" :label="$t('pages.wiki.overview.ui.incomplete')" />
                <el-option value="completed" :label="$t('pages.wiki.overview.ui.completed')" />
            </el-select>

            <el-select
                :model-value="mapSelectValue"
                class="u-progress-filter is-map"
                filterable
                :aria-label="$t('pages.wiki.overview.ui.workbench.map')"
                @change="changeMap"
            >
                <el-option value="all" :label="$t('pages.wiki.overview.ui.workbench.allMaps')" />
                <el-option v-for="map in mapOptions" :key="map.id" :value="map.id" :label="map.label" />
            </el-select>

            <el-select
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
                        $t('pages.wiki.difficultyDimensions.sortAscending', {
                            label: getDimensionLabel(dimension),
                        })
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
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid rgba(70, 74, 66, 0.13);
    border-radius: 12px;
    background: rgba(247, 244, 236, 0.82);
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
    width: 128px;

    &.is-map {
        width: 170px;
    }

    &.is-sort {
        width: 190px;
    }
}

.m-progress-search {
    width: min(100%, 400px);
    flex: 0 1 400px;
}

.u-progress-search-button,
.u-progress-clear-button {
    display: inline-flex;
    width: 84px;
    height: 32px;
    min-height: 32px;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    border: 1px solid #47777d;
    border-radius: 7px;
    color: #fff;
    background: #47777d;
    font: inherit;
    font-size: 12px;
    cursor: pointer;

    svg {
        width: 14px;
        height: 14px;
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }

    &:focus-visible {
        outline: 2px solid rgba(71, 119, 125, 0.65);
        outline-offset: 2px;
    }
}

.u-progress-clear-button {
    border-color: rgba(77, 87, 87, 0.16);
    color: #6d7777;
    background: rgba(255, 255, 252, 0.72);
}

.m-progress-filters.is-embedded {
    align-items: stretch;
    flex-direction: column;
    border: 0;
    border-bottom: 1px solid rgba(70, 74, 66, 0.1);
    border-radius: 0;

    .m-progress-filter-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
    }

    .u-progress-filter,
    .u-progress-filter.is-map,
    .u-progress-filter.is-sort,
    .m-progress-search {
        width: 100%;
    }

    .m-progress-search {
        flex-basis: auto;
    }
}

@media (max-width: 1180px) {
    .m-progress-filters {
        align-items: stretch;
        flex-direction: column;
    }

    .m-progress-search {
        width: 100%;
        flex-basis: auto;
    }
}

@media (max-width: 620px) {
    .u-progress-filter,
    .u-progress-filter.is-map,
    .u-progress-filter.is-sort {
        width: calc(50% - 4px);
    }

    .m-progress-search {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
    }

    .u-progress-search-button,
    .u-progress-clear-button {
        width: 36px;
        height: 32px;
        padding: 0;

        span {
            position: absolute;
            width: 1px;
            height: 1px;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
        }
    }
}
</style>
