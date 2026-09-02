<script>
import { ArrowRight, CollectionTag } from "@element-plus/icons-vue";

function createImageAssetMap(context) {
    return context.keys().reduce((assets, path) => {
        const name = path.replace(/^\.\//, "").replace(/\.png$/, "");
        assets[name] = context(path);
        return assets;
    }, {});
}

const CATEGORY_IMAGES = createImageAssetMap(require.context("@/assets/img/wiki/overview/item", false, /\.png$/));

export default {
    name: "AchievementCategoryBoard",
    components: {
        ArrowRight,
        CollectionTag,
    },
    props: {
        categories: {
            type: Array,
            default: () => [],
        },
        activeCategoryId: {
            type: String,
            default: "all",
        },
        compactOverview: {
            type: Boolean,
            default: false,
        },
        sort: {
            type: String,
            default: "progress-asc",
        },
    },
    data() {
        return {
            expandedCategoryId: null,
        };
    },
    computed: {
        expandedCategory() {
            return (
                this.categories.find(
                    (category) => category.id === this.expandedCategoryId && category.children?.length
                ) || null
            );
        },
    },
    emits: ["select-category", "update:sort"],
    methods: {
        formatNumber(value) {
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale).format(Number(value) || 0);
        },
        formatPercent(value) {
            return value === null || value === undefined ? "—" : `${Number(value).toFixed(0)}%`;
        },
        selectCategory(categoryId) {
            this.$emit("select-category", String(categoryId));
        },
        selectRootCategory(category) {
            this.selectCategory(category.id);
            this.expandedCategoryId = category.children?.length ? category.id : null;
        },
        selectChildCategory(category) {
            this.selectCategory(category.id);
        },
        isExpanded(categoryId) {
            return this.expandedCategoryId === categoryId;
        },
        hasActiveChild(category) {
            return (category.children || []).some((child) => child.id === this.activeCategoryId);
        },
        getCategoryImage(name) {
            return CATEGORY_IMAGES[name] || "";
        },
    },
};
</script>

<template>
    <section
        class="m-progress-categories"
        :class="{ 'is-compact-overview': compactOverview }"
        :aria-label="$t('pages.wiki.overview.ui.statistics.categoryProgress')"
    >
        <div class="m-progress-categories__header">
            <div>
                <h2>{{ $t("pages.wiki.overview.ui.statistics.categoryProgress") }}</h2>
                <span>{{ $t("pages.wiki.overview.ui.workbench.categoryProgressHint") }}</span>
            </div>
            <el-select
                :model-value="sort"
                class="u-progress-category-sort"
                :aria-label="$t('pages.wiki.overview.ui.workbench.categorySort')"
                @change="$emit('update:sort', $event)"
            >
                <el-option value="progress-asc" :label="$t('pages.wiki.overview.ui.workbench.sortProgressAsc')" />
                <el-option value="progress-desc" :label="$t('pages.wiki.overview.ui.workbench.sortProgressDesc')" />
                <el-option value="remaining-desc" :label="$t('pages.wiki.overview.ui.workbench.sortRemainingDesc')" />
            </el-select>
        </div>

        <div :class="['m-progress-category-browser', { 'has-subcategories': expandedCategory }]">
            <div class="m-progress-category-list">
                <div
                    v-for="category in categories"
                    :key="category.id"
                    class="m-progress-category-node"
                    :class="{
                        'is-active': activeCategoryId === category.id,
                        'has-active-child': hasActiveChild(category),
                        'is-expanded': isExpanded(category.id),
                    }"
                >
                    <div class="m-progress-category-node__root">
                        <button
                            type="button"
                            class="m-progress-category-card"
                            :aria-pressed="activeCategoryId === category.id"
                            @click="selectRootCategory(category)"
                        >
                            <span class="u-progress-category-icon" aria-hidden="true">
                                <img
                                    v-if="getCategoryImage(category.name)"
                                    :src="getCategoryImage(category.name)"
                                    alt=""
                                />
                                <CollectionTag v-else />
                            </span>
                            <span class="m-progress-category-card__body">
                                <span class="m-progress-category-card__line">
                                    <strong>{{ category.name }}</strong>
                                    <span>
                                        {{
                                            $t("pages.wiki.overview.ui.achievementCount", {
                                                own: formatNumber(category.completedCount),
                                                all: formatNumber(category.totalCount),
                                            })
                                        }}
                                    </span>
                                    <b>{{ formatPercent(category.pointProgress) }}</b>
                                </span>
                                <span class="m-progress-category-track" aria-hidden="true">
                                    <i :style="{ width: `${category.pointProgress || 0}%` }"></i>
                                </span>
                                <span class="m-progress-category-card__meta">
                                    {{ formatNumber(category.completedPoints) }} /
                                    {{ formatNumber(category.totalPoints) }}
                                    {{ $t("pages.wiki.overview.ui.statistics.seniorityUnit") }}
                                </span>
                            </span>
                        </button>

                        <span
                            v-if="category.children?.length"
                            class="u-progress-category-direction"
                            aria-hidden="true"
                        >
                            <ArrowRight />
                        </span>
                    </div>
                </div>
            </div>

            <aside v-if="expandedCategory" class="m-progress-subcategory-panel">
                <div class="m-progress-subcategory-panel__header">
                    <span class="u-progress-subcategory-panel-icon" aria-hidden="true">
                        <img
                            v-if="getCategoryImage(expandedCategory.name)"
                            :src="getCategoryImage(expandedCategory.name)"
                            alt=""
                        />
                        <CollectionTag v-else />
                    </span>
                    <span>
                        <strong>{{ expandedCategory.name }}</strong>
                        <small>
                            {{
                                $t("pages.wiki.overview.ui.workbench.secondaryCategories", {
                                    count: expandedCategory.children.length,
                                })
                            }}
                        </small>
                    </span>
                </div>

                <div class="m-progress-subcategory-list">
                    <button
                        v-for="child in expandedCategory.children"
                        :key="child.id"
                        type="button"
                        class="m-progress-subcategory-card"
                        :class="{ 'is-active': activeCategoryId === child.id }"
                        :aria-pressed="activeCategoryId === child.id"
                        @click="selectChildCategory(child)"
                    >
                        <span class="u-progress-subcategory-icon" aria-hidden="true"><CollectionTag /></span>
                        <span class="m-progress-subcategory-card__body">
                            <span class="m-progress-subcategory-card__line">
                                <strong>{{ child.name }}</strong>
                                <span>
                                    {{ formatNumber(child.completedCount) }}/{{ formatNumber(child.totalCount) }}
                                </span>
                                <b>{{ formatPercent(child.pointProgress) }}</b>
                            </span>
                            <span class="m-progress-category-track" aria-hidden="true">
                                <i :style="{ width: `${child.pointProgress || 0}%` }"></i>
                            </span>
                        </span>
                    </button>
                </div>
            </aside>
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-progress-categories {
    display: flex;
    height: 100%;
    min-width: 0;
    overflow: hidden;
    flex-direction: column;
    border: 1px solid rgba(70, 74, 66, 0.14);
    border-radius: 14px;
    background: rgba(255, 254, 250, 0.86);
    container-type: inline-size;
}

.m-progress-categories__header {
    display: flex;
    min-height: 72px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(70, 74, 66, 0.1);

    h2 {
        margin: 0;
        color: #384246;
        font-size: 16px;
    }

    span {
        display: block;
        margin-top: 4px;
        color: #a0a7a4;
        font-size: 11px;
    }
}

.u-progress-category-sort {
    width: 210px;
}

.m-progress-category-browser {
    display: grid;
    min-height: 0;
    flex: 1;
    grid-template-columns: minmax(0, 1fr);
    overflow: hidden;

    &.has-subcategories {
        grid-template-columns: minmax(150px, 0.76fr) minmax(0, 1.24fr);
    }
}

.m-progress-category-list {
    display: grid;
    min-width: 0;
    min-height: 0;
    align-content: start;
    gap: 6px;
    padding: 10px;
    overflow-y: auto;
    overscroll-behavior: contain;
}

.m-progress-category-node {
    min-width: 0;
}

.m-progress-category-node__root {
    display: grid;
    width: 100%;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: stretch;
    border: 1px solid transparent;
    border-radius: 9px;
    color: #465054;
    background: transparent;
    transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease;

    &:hover {
        border-color: rgba(71, 119, 125, 0.12);
        background: rgba(71, 119, 125, 0.045);
    }
}

.m-progress-category-node.is-active .m-progress-category-node__root,
.m-progress-category-node.is-expanded .m-progress-category-node__root {
    border-color: #47777d;
    color: #f8f4e9;
    background: #356873;
    box-shadow: 0 8px 18px rgba(53, 104, 115, 0.13);

    .u-progress-category-icon,
    .m-progress-category-card__line span,
    .m-progress-category-card__meta,
    .u-progress-category-direction {
        color: rgba(248, 244, 233, 0.82);
    }

    .u-progress-category-icon {
        background: rgba(255, 255, 255, 0.12);
    }

    .m-progress-category-track {
        background: rgba(255, 255, 255, 0.16);

        i {
            background: #d2ad61;
        }
    }
}

.m-progress-category-node.has-active-child:not(.is-expanded) .m-progress-category-node__root {
    border-color: rgba(71, 119, 125, 0.2);
    background: rgba(71, 119, 125, 0.06);
}

.m-progress-category-card {
    display: grid;
    width: 100%;
    min-width: 0;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 10px;
    padding: 11px 8px 11px 12px;
    border: 0;
    color: inherit;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid rgba(71, 119, 125, 0.7);
        outline-offset: -2px;
    }
}

.u-progress-category-direction {
    display: inline-flex;
    width: 30px;
    min-height: 36px;
    align-self: center;
    align-items: center;
    justify-content: center;
    color: #778482;

    svg {
        width: 14px;
        height: 14px;
    }
}

.u-progress-category-icon {
    display: inline-flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 7px;
    color: #47777d;
    background: rgba(71, 119, 125, 0.08);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    svg {
        width: 16px;
        height: 16px;
    }
}

.m-progress-category-card__body {
    min-width: 0;
}

.m-progress-category-card__line {
    display: grid;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: baseline;
    gap: 8px;

    strong {
        overflow: hidden;
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    span {
        color: #9aa29f;
        font-size: 10px;
    }

    b {
        color: #b58c3d;
        font-size: 11px;
    }
}

.m-progress-category-track {
    display: block;
    height: 4px;
    margin-top: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(71, 119, 125, 0.1);

    i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #47777d, #b6924d);
    }
}

.m-progress-category-card__meta {
    display: block;
    margin-top: 5px;
    color: #9aa29f;
    font-size: 10px;
}

.m-progress-categories.is-compact-overview {
    .m-progress-categories__header {
        min-height: 62px;
        padding: 10px 12px;
    }

    .u-progress-category-sort {
        width: 190px;
    }

    .m-progress-category-browser:not(.has-subcategories) .m-progress-category-list {
        grid-template-columns: minmax(0, 1fr);
        gap: 5px;
        padding: 8px;
    }

    .m-progress-category-browser:not(.has-subcategories) .m-progress-category-node__root {
        min-height: 44px;
    }

    .m-progress-category-browser:not(.has-subcategories) .m-progress-category-card {
        grid-template-columns: 30px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        padding: 6px 4px 6px 8px;
    }

    .m-progress-category-browser:not(.has-subcategories) .u-progress-category-icon {
        width: 30px;
        height: 30px;
    }

    .m-progress-category-browser:not(.has-subcategories) .m-progress-category-card__line {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 6px;

        > span {
            display: none;
        }
    }

    .m-progress-category-browser:not(.has-subcategories) .m-progress-category-track {
        height: 3px;
        margin-top: 5px;
    }

    .m-progress-category-browser:not(.has-subcategories) .m-progress-category-card__meta {
        display: none;
    }

    .m-progress-category-browser:not(.has-subcategories) .u-progress-category-direction {
        width: 26px;
        min-height: 30px;
    }
}

.m-progress-category-browser.has-subcategories {
    .m-progress-category-list {
        gap: 4px;
        padding: 8px;
    }

    .m-progress-category-node__root {
        min-height: 52px;
    }

    .m-progress-category-card {
        grid-template-columns: 30px minmax(0, 1fr);
        align-items: center;
        gap: 7px;
        padding: 7px 5px 7px 8px;
    }

    .u-progress-category-icon {
        width: 30px;
        height: 30px;
    }

    .m-progress-category-card__line {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 5px;

        > span {
            display: none;
        }

        strong {
            font-size: 11px;
        }

        b {
            grid-column: 2;
            grid-row: 1;
            font-size: 10px;
        }
    }

    .m-progress-category-track {
        height: 3px;
        margin-top: 6px;
    }

    .m-progress-category-card__meta {
        display: none;
    }

    .u-progress-category-direction {
        width: 26px;
        min-height: 30px;
    }
}

.m-progress-subcategory-panel {
    display: flex;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    flex-direction: column;
    border-left: 1px solid rgba(70, 74, 66, 0.1);
    background: rgba(247, 244, 236, 0.36);
}

.m-progress-subcategory-panel__header {
    display: flex;
    min-height: 62px;
    flex: none;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(70, 74, 66, 0.09);
    color: #465054;

    > span:last-child {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 3px;
    }

    strong {
        overflow: hidden;
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    small {
        color: #99a19f;
        font-size: 10px;
    }
}

.u-progress-subcategory-panel-icon {
    display: inline-flex;
    width: 34px;
    height: 34px;
    flex: none;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 8px;
    color: #47777d;
    background: rgba(71, 119, 125, 0.08);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    svg {
        width: 15px;
        height: 15px;
    }
}

.m-progress-subcategory-list {
    display: grid;
    min-height: 0;
    flex: 1;
    align-content: start;
    gap: 4px;
    padding: 10px;
    overflow-y: auto;
    overscroll-behavior: contain;
}

.m-progress-subcategory-card {
    display: grid;
    width: 100%;
    min-width: 0;
    grid-template-columns: 22px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    padding: 8px 9px;
    border: 1px solid transparent;
    border-radius: 8px;
    color: #596365;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:hover {
        border-color: rgba(71, 119, 125, 0.12);
        background: rgba(71, 119, 125, 0.045);
    }

    &:focus-visible {
        outline: 2px solid rgba(71, 119, 125, 0.7);
        outline-offset: -2px;
    }

    &.is-active {
        border-color: rgba(71, 119, 125, 0.42);
        color: #f8f4e9;
        background: #47777d;

        .m-progress-subcategory-card__line span,
        .u-progress-subcategory-icon {
            color: rgba(248, 244, 233, 0.8);
        }

        .m-progress-category-track {
            background: rgba(255, 255, 255, 0.16);

            i {
                background: #d2ad61;
            }
        }
    }
}

.u-progress-subcategory-icon {
    display: inline-flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: #6e8586;
    background: rgba(71, 119, 125, 0.07);

    svg {
        width: 12px;
        height: 12px;
    }
}

.m-progress-subcategory-card__body {
    min-width: 0;
}

.m-progress-subcategory-card__line {
    display: grid;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: baseline;
    gap: 7px;

    strong {
        overflow: hidden;
        font-size: 11px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    span {
        color: #9aa29f;
        font-size: 9px;
    }

    b {
        color: #b58c3d;
        font-size: 10px;
    }
}

.m-progress-subcategory-card .m-progress-category-track {
    height: 3px;
    margin-top: 6px;
}

@container (max-width: 380px) {
    .m-progress-category-browser.has-subcategories {
        grid-template-columns: minmax(0, 1fr);
    }

    .m-progress-category-browser.has-subcategories .m-progress-category-list {
        max-height: 310px;
        border-bottom: 1px solid rgba(70, 74, 66, 0.1);
    }

    .m-progress-subcategory-panel {
        min-height: 320px;
        border-left: 0;
    }
}

@media (max-width: 860px) {
    .m-progress-category-browser {
        max-height: 640px;
    }
}

@media (max-width: 560px) {
    .m-progress-categories__header {
        align-items: stretch;
        flex-direction: column;
    }

    .u-progress-category-sort {
        width: 100%;
    }
}
</style>
