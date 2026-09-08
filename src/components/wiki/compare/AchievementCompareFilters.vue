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
        :class="['m-compare-filters', { 'is-embedded': embedded }]"
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
                popper-class="m-achievement-compare-status-popper"
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
                popper-class="m-achievement-compare-map-popper"
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
    gap: 8px;
    padding: 11px 14px 9px;
    border: 1px solid rgba(70, 74, 66, 0.13);
    border-radius: 12px;
    background: rgba(247, 244, 236, 0.82);
}

.m-compare-filter-row,
.m-compare-search-row,
.m-compare-filter-actions {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
}

.u-compare-status-filter,
.u-compare-map-filter {
    width: min(100%, 220px);
    flex: 0 1 220px;
    min-width: 0;
    :deep(.el-select__wrapper) {
        min-height: 32px;
        border-radius: 7px;
        box-shadow: 0 0 0 1px rgba(71, 119, 125, 0.16) inset;
        background: rgba(255, 255, 252, 0.88);
        transition: box-shadow 0.16s ease, background-color 0.16s ease;
    }

    :deep(.el-select__wrapper:hover) {
        box-shadow: 0 0 0 1px rgba(71, 119, 125, 0.34) inset;
    }

    :deep(.el-select__wrapper.is-focused) {
        box-shadow: 0 0 0 1px #47777d inset, 0 0 0 3px rgba(71, 119, 125, 0.09);
        background: #fff;
    }
}

.u-compare-status-filter {
    :deep(.el-select__placeholder.is-transparent) {
        color: var(--el-text-color-regular);
    }

    :deep(.el-select__selection) {
        flex-wrap: nowrap;
    }

    :deep(.el-tag) {
        max-width: calc(100% - 30px);
        border: 0;
        color: #3f6f75;
        background: rgba(71, 119, 125, 0.1);
    }

    :deep(.el-tag__content) {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :deep(.el-tag__close) {
        color: #789398;
    }
}

.m-compare-filter-actions {
    margin-left: auto;
}

.m-compare-search-row {
    :deep(.el-input) {
        min-width: 0;
        flex: 1;
    }
}

.u-compare-search-button,
.u-compare-reset-button,
.u-compare-toolbar-button {
    display: inline-flex;
    height: 32px;
    min-height: 32px;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    border: 1px solid rgba(71, 119, 125, 0.28);
    border-radius: 7px;
    color: #47777d;
    background: rgba(255, 255, 252, 0.78);
    font: inherit;
    font-size: 12px;
    white-space: nowrap;
    cursor: pointer;

    svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
    }

    &:disabled {
        opacity: 0.48;
        cursor: not-allowed;
    }

    &:focus-visible {
        outline: 2px solid rgba(71, 119, 125, 0.65);
        outline-offset: 2px;
    }
}

.u-compare-search-button,
.u-compare-reset-button {
    min-width: 84px;
}

.u-compare-search-button,
.u-compare-toolbar-button.is-export {
    border-color: #47777d;
    color: #fff;
    background: #47777d;
}

.u-compare-reset-button {
    border-color: rgba(77, 87, 87, 0.16);
    color: #6d7777;
    background: rgba(255, 255, 252, 0.72);
}

.m-compare-filters.is-embedded {
    border: 0;
    border-bottom: 1px solid rgba(70, 74, 66, 0.1);
    border-radius: 0;
}

@media (max-width: 1240px) {
    .m-compare-filter-row {
        flex-wrap: wrap;
    }

    .m-compare-filter-actions {
        margin-left: 0;
    }

    .u-compare-status-filter {
        max-width: none;
        flex-grow: 1;
    }
}

@media (max-width: @phone) {
    .m-compare-filters {
        padding: 12px;
        gap: 10px;
    }

    .u-compare-status-filter {
        width: 100%;
        max-width: none;
        flex-basis: 100%;
    }

    .u-compare-map-filter {
        width: 0;
        flex: 1 1 0;
    }

    .m-compare-filter-actions {
        max-width: 50%;
        flex: 0 1 auto;

        .u-compare-toolbar-button {
            width: 100%;
            min-width: 0;
        }
    }

    .m-compare-search-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));

        :deep(.el-input) {
            grid-column: 1 / -1;
        }
    }

    .m-compare-filters :deep(.el-select__wrapper),
    .m-compare-filters :deep(.el-input__wrapper) {
        min-height: 44px;
        box-sizing: border-box;
    }

    .m-compare-filters :deep(.el-input__inner),
    .m-compare-filters :deep(.el-select__input) {
        font-size: 16px;
    }

    .u-compare-search-button,
    .u-compare-reset-button,
    .u-compare-toolbar-button {
        height: auto;
        min-height: 44px;
        min-width: 0;
        padding: 8px 10px;
        line-height: 1.4;
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
