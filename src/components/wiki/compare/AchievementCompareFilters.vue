<script>
import { Download, RefreshLeft, Search } from "@element-plus/icons-vue";

export default {
    name: "AchievementCompareFilters",
    components: {
        Download,
        RefreshLeft,
        Search,
    },
    props: {
        filterOptions: {
            type: Array,
            default: () => [],
        },
        selectedFilters: {
            type: Array,
            default: () => [],
        },
        mapOptions: {
            type: Array,
            default: () => [],
        },
        mapId: {
            type: String,
            default: "",
        },
        keyword: {
            type: String,
            default: "",
        },
        loading: {
            type: Boolean,
            default: false,
        },
        canExport: {
            type: Boolean,
            default: false,
        },
        embedded: {
            type: Boolean,
            default: false,
        },
    },
    emits: [
        "update:selected-filters",
        "update:map-id",
        "update:keyword",
        "submit-search",
        "reset-filters",
        "export",
    ],
    computed: {
        mapSelectValue() {
            return this.mapId || "all";
        },
    },
    methods: {
        changeMap(value) {
            const mapId = value === "all" ? "" : String(value || "");
            this.$emit("update:map-id", mapId);
            this.$emit("submit-search", { mapId });
        },
    },
};
</script>

<template>
    <section
        :class="['m-compare-filters m-achievement-filter-toolbar', { 'is-embedded': embedded }]"
        :aria-label="$t('pages.wiki.compare.ui.filters.title')"
    >
        <div class="m-compare-filter-row">
            <el-select
                :model-value="selectedFilters"
                class="u-compare-status-filter"
                multiple
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="1"
                popper-class="m-achievement-theme-popper m-achievement-compare-status-popper"
                :placeholder="$t('pages.wiki.compare.ui.filters.placeholder')"
                :aria-label="$t('pages.wiki.compare.ui.filters.title')"
                @change="$emit('update:selected-filters', $event)"
            >
                <el-option
                    v-for="option in filterOptions"
                    :key="option.value"
                    :value="option.value"
                    :label="option.label"
                    :disabled="option.disabled"
                    :class="{ 'is-common-filter': option.value === '1,1' }"
                />
            </el-select>

            <el-select
                :model-value="mapSelectValue"
                class="u-compare-map-filter"
                popper-class="m-achievement-theme-popper m-achievement-compare-map-popper"
                filterable
                :aria-label="$t('pages.wiki.compare.ui.map.label')"
                @change="changeMap"
            >
                <el-option value="all" :label="$t('pages.wiki.compare.ui.map.all')" />
                <el-option v-for="map in mapOptions" :key="map.id" :value="map.id" :label="map.label" />
            </el-select>

            <div class="m-compare-filter-actions">
                <button
                    type="button"
                    class="u-compare-toolbar-button is-export"
                    :disabled="loading || !canExport"
                    @click="$emit('export')"
                >
                    <Download aria-hidden="true" />
                    {{ $t("pages.wiki.compare.ui.actions.export") }}
                </button>
            </div>
        </div>

        <div class="m-compare-search-row">
            <el-input
                :model-value="keyword"
                clearable
                :placeholder="$t('pages.wiki.compare.ui.search.placeholder')"
                :aria-label="$t('pages.wiki.compare.ui.search.placeholder')"
                @update:model-value="$emit('update:keyword', $event)"
                @keyup.enter="$emit('submit-search')"
            />
            <button
                type="button"
                class="u-compare-search-button"
                :disabled="loading"
                @click="$emit('submit-search')"
            >
                <Search aria-hidden="true" />
                <span>{{ $t("pages.wiki.compare.ui.search.action") }}</span>
            </button>
            <button
                type="button"
                class="u-compare-reset-button"
                :disabled="loading"
                @click="$emit('reset-filters')"
            >
                <RefreshLeft aria-hidden="true" />
                <span>{{ $t("pages.wiki.compare.ui.actions.reset") }}</span>
            </button>
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-compare-filters {
    display: grid;
    min-width: 0;
    gap: 10px;
    padding: 12px;
    border-radius: 12px;
    background: #f8f7f3;
}
.m-compare-filters.is-embedded {
    padding: 0 0 12px;
}
.m-compare-filter-row,
.m-compare-search-row,
.m-compare-filter-actions {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
}
.m-compare-filter-row {
    flex-wrap: wrap;
}
.m-compare-filter-actions {
    flex: none;
    margin-left: auto;
}
.u-compare-status-filter,
.u-compare-map-filter {
    min-width: 0;
    width: 188px;
    max-width: 100%;
    flex: none;
    :deep(.el-select__wrapper) {
        min-height: 30px;
        border-radius: 20px;
    }
    :deep(.el-select__selection) {
        flex-wrap: nowrap;
    }
    :deep(.el-tag) {
        max-width: calc(100% - 30px);
        border: 0;
        color: #5a7e84;
        background: #eef3f2;
    }
    :deep(.el-tag__content) {
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
.m-compare-search-row :deep(.el-input) {
    min-width: 0;
    flex: 1;
}
.u-compare-search-button,
.u-compare-reset-button,
.u-compare-toolbar-button {
    display: inline-flex;
    min-width: 80px;
    height: 30px;
    align-items: center;
    justify-content: center;
    gap: 5px;
    flex: none;
    padding: 0 12px;
    border: 1px solid #e8e8e8;
    border-radius: 20px;
    color: #967944;
    background: #fff;
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    svg {
        width: 16px;
        height: 16px;
        flex: none;
    }
    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
}
.u-compare-search-button {
    color: #fff;
    background: #967944;
    border-color: #967944;
}
.u-compare-toolbar-button.is-export {
    min-width: 128px;
    height: 30px;
    gap: 8px;
    padding: 0 18px;
    border-color: #806535;
    border-radius: 20px;
    color: #fff;
    background: #806535;
    font-weight: 600;
    box-shadow: 0 2px 5px rgba(128, 101, 53, 0.18);
    transition: background-color 0.2s, border-color 0.2s;
    svg {
        width: 18px;
        height: 18px;
    }
    &:hover:not(:disabled) {
        border-color: #69512a;
        background: #69512a;
    }
    &:disabled {
        box-shadow: none;
    }
}
.u-compare-search-button,
.u-compare-reset-button,
.u-compare-toolbar-button {
    &:focus-visible {
        outline: 2px solid #5a7e84;
        outline-offset: 3px;
    }
}
@media (max-width: @phone) {
    .m-compare-filter-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .u-compare-status-filter,
    .u-compare-map-filter {
        width: 100%;
    }
    .m-compare-filter-actions {
        grid-column: 1 / -1;
    }
    .m-compare-search-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        :deep(.el-input) {
            grid-column: 1/-1;
        }
    }
    .m-compare-filters :deep(.el-select__wrapper),
    .m-compare-filters :deep(.el-input__wrapper) {
        min-height: 44px;
        box-sizing: border-box;
    }
    .m-compare-filters :deep(.el-input__inner) {
        font-size: 16px;
    }
    .u-compare-search-button,
    .u-compare-reset-button,
    .u-compare-toolbar-button {
        height: auto;
        min-height: 44px;
        min-width: 0;
        padding: 8px 12px;
        white-space: normal;
        overflow-wrap: anywhere;
    }
}
</style>

<style lang="less">
.m-achievement-compare-status-popper.el-select__popper {
    max-width: calc(100vw - 32px);
    overflow: hidden;
    border: 1px solid rgba(71, 119, 125, 0.18);
    border-radius: 9px;
    box-shadow: 0 10px 28px rgba(45, 57, 56, 0.13);

    .el-select-dropdown__wrap {
        max-height: 224px;
    }

    .el-select-dropdown__list {
        padding: 5px;
    }

    .el-select-dropdown__item {
        height: 34px;
        margin: 2px 0;
        padding: 0 10px;
        border-radius: 6px;
        color: #596463;
        line-height: 34px;
    }

    .el-select-dropdown__item.is-common-filter {
        color: #3f6f75;
        font-weight: 600;
    }

    .el-select-dropdown__item.is-hovering,
    .el-select-dropdown__item:hover {
        background: rgba(71, 119, 125, 0.08);
    }

    .el-select-dropdown__item.is-selected {
        color: #2f6970;
        background: rgba(71, 119, 125, 0.12);
        font-weight: 600;
    }

    .el-select-dropdown__item.is-disabled {
        color: #b0b7b4;
        background: transparent;
    }
}

@media (max-width: @phone) {
    .m-achievement-compare-status-popper.el-select__popper,
    .m-achievement-compare-map-popper.el-select__popper {
        max-width: calc(100vw - 32px);

        .el-select-dropdown__item {
            display: flex;
            height: auto;
            min-height: 44px;
            align-items: center;
            padding: 9px 28px 9px 10px;
            line-height: 1.5;
            white-space: normal;
            overflow-wrap: anywhere;
        }
    }
}
</style>
