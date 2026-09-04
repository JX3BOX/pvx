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
    name: "AchievementCompareCategoryTree",
    components: {
        ArrowRight,
        CollectionTag,
    },
    props: {
        categories: {
            type: Array,
            default: () => [],
        },
        total: {
            type: Number,
            default: 0,
        },
        activeCategoryId: {
            type: String,
            default: "all",
        },
        activeDetailId: {
            type: String,
            default: "",
        },
    },
    emits: ["select-category", "select-detail"],
    data() {
        return {
            expandedCategoryId: null,
        };
    },
    computed: {
        expandedCategory() {
            return (
                this.categories.find(
                    (category) =>
                        String(category.id) === String(this.expandedCategoryId) && category.children?.length
                ) || null
            );
        },
    },
    watch: {
        activeCategoryId: {
            immediate: true,
            handler(value) {
                if (!value || value === "all") {
                    this.expandedCategoryId = null;
                    return;
                }
                const category = this.categories.find((item) => String(item.id) === String(value));
                if (category?.children?.length) this.expandedCategoryId = String(category.id);
            },
        },
        categories() {
            if (!this.expandedCategoryId) return;
            if (!this.expandedCategory) this.expandedCategoryId = null;
        },
    },
    methods: {
        selectAll() {
            this.expandedCategoryId = null;
            this.$emit("select-category", "all");
        },
        selectCategory(category) {
            this.expandedCategoryId = category.children?.length ? String(category.id) : null;
            this.$emit("select-category", String(category.id));
        },
        selectDetail(category, child) {
            this.$emit("select-detail", {
                categoryId: String(category.id),
                detailId: String(child.id),
            });
        },
        isCategoryActive(category) {
            return String(this.activeCategoryId) === String(category.id) && !this.activeDetailId;
        },
        isCategoryContext(category) {
            return String(this.activeCategoryId) === String(category.id) && Boolean(this.activeDetailId);
        },
        formatNumber(value) {
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale).format(Number(value) || 0);
        },
        getCategoryImage(name) {
            return CATEGORY_IMAGES[name] || "";
        },
    },
};
</script>

<template>
    <section class="m-compare-categories" :aria-label="$t('pages.wiki.compare.ui.categories.title')">
        <header class="m-compare-categories__header">
            <div>
                <h2>{{ $t("pages.wiki.compare.ui.categories.title") }}</h2>
                <span>{{ $t("pages.wiki.compare.ui.matrix.achievementCount", { count: formatNumber(total) }) }}</span>
            </div>
        </header>

        <div :class="['m-compare-category-browser', { 'has-subcategories': expandedCategory }]">
            <div class="m-compare-category-list">
                <button
                    type="button"
                    class="m-compare-category-card is-all"
                    :class="{ 'is-active': activeCategoryId === 'all' }"
                    :aria-pressed="activeCategoryId === 'all'"
                    @click="selectAll"
                >
                    <span class="u-compare-category-icon" aria-hidden="true"><CollectionTag /></span>
                    <span class="m-compare-category-card__body">
                        <strong>{{ $t("pages.wiki.compare.ui.categories.all") }}</strong>
                        <small>{{ formatNumber(total) }}</small>
                    </span>
                </button>

                <button
                    v-for="category in categories"
                    :key="category.id"
                    type="button"
                    class="m-compare-category-card"
                    :class="{
                        'is-active': isCategoryActive(category),
                        'is-context': isCategoryContext(category),
                    }"
                    :aria-pressed="isCategoryActive(category)"
                    @click="selectCategory(category)"
                >
                    <span class="u-compare-category-icon" aria-hidden="true">
                        <img v-if="getCategoryImage(category.name)" :src="getCategoryImage(category.name)" alt="" />
                        <CollectionTag v-else />
                    </span>
                    <span class="m-compare-category-card__body">
                        <strong>{{ category.name }}</strong>
                        <small>{{ formatNumber(category.count) }}</small>
                    </span>
                    <ArrowRight v-if="category.children?.length" class="u-compare-category-direction" aria-hidden="true" />
                </button>
            </div>

            <aside v-if="expandedCategory" class="m-compare-subcategory-panel">
                <header class="m-compare-subcategory-panel__header">
                    <span class="u-compare-subcategory-panel-icon" aria-hidden="true">
                        <img
                            v-if="getCategoryImage(expandedCategory.name)"
                            :src="getCategoryImage(expandedCategory.name)"
                            alt=""
                        />
                        <CollectionTag v-else />
                    </span>
                    <span>
                        <strong>{{ expandedCategory.name }}</strong>
                        <small>{{ formatNumber(expandedCategory.children.length) }}</small>
                    </span>
                </header>

                <div class="m-compare-subcategory-list">
                    <button
                        v-for="child in expandedCategory.children"
                        :key="child.id"
                        type="button"
                        :class="{
                            'is-active':
                                activeCategoryId === expandedCategory.id && activeDetailId === child.id,
                        }"
                        :aria-pressed="activeCategoryId === expandedCategory.id && activeDetailId === child.id"
                        @click="selectDetail(expandedCategory, child)"
                    >
                        <CollectionTag aria-hidden="true" />
                        <span>{{ child.name }}</span>
                        <b>{{ formatNumber(child.count) }}</b>
                    </button>
                </div>
            </aside>
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-compare-categories {
    display: flex;
    height: 100%;
    min-width: 0;
    overflow: hidden;
    flex-direction: column;
    border: 1px solid rgba(70, 74, 66, 0.14);
    border-radius: 14px;
    background: rgba(255, 254, 250, 0.86);
}

.m-compare-categories__header {
    display: flex;
    min-height: 62px;
    flex: none;
    align-items: center;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(70, 74, 66, 0.1);

    h2 {
        margin: 0;
        color: #384246;
        font-size: 15px;
    }

    span {
        display: block;
        margin-top: 3px;
        color: #9ca39f;
        font-size: 10px;
    }
}

.m-compare-category-browser {
    display: grid;
    min-height: 0;
    flex: 1;
    grid-template-columns: minmax(0, 1fr);

    &.has-subcategories {
        grid-template-columns: minmax(142px, 0.84fr) minmax(168px, 1.16fr);

        .m-compare-category-card.is-all small {
            display: none;
        }
    }
}

.m-compare-category-list,
.m-compare-subcategory-list {
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(71, 119, 125, 0.28) transparent;
}

.m-compare-category-list {
    display: grid;
    align-content: start;
    gap: 7px;
    padding: 9px;
}

.m-compare-category-card {
    display: grid;
    width: 100%;
    min-width: 0;
    min-height: 48px;
    grid-template-columns: 34px minmax(0, 1fr) 12px;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    border: 1px solid transparent;
    border-radius: 9px;
    color: #505c5b;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 150ms ease, background-color 150ms ease;

    &.is-all {
        grid-template-columns: 34px minmax(0, 1fr);
    }

    &:hover,
    &.is-context {
        border-color: rgba(71, 119, 125, 0.16);
        background: rgba(71, 119, 125, 0.06);
    }

    &.is-active {
        border-color: #47777d;
        color: #fff;
        background: #47777d;
        box-shadow: 0 7px 18px rgba(48, 84, 89, 0.12);

        .u-compare-category-icon {
            color: #fff;
            background: rgba(255, 255, 255, 0.14);

            img {
                opacity: 0.85;
            }
        }

        small,
        .u-compare-category-direction {
            color: rgba(255, 255, 255, 0.76);
        }
    }
}

.u-compare-category-icon,
.u-compare-subcategory-panel-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: #47777d;
    background: rgba(71, 119, 125, 0.08);

    img {
        width: 80%;
        height: 80%;
        object-fit: contain;
        opacity: 0.55;
    }

    svg {
        width: 16px;
        height: 16px;
    }
}

.u-compare-category-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
}

.m-compare-category-card__body {
    display: flex;
    min-width: 0;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;

    strong {
        overflow: hidden;
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    small {
        flex: none;
        color: #9da39f;
        font-size: 9px;
    }
}

.u-compare-category-direction {
    width: 12px;
    height: 12px;
    color: #8e9794;
}

.m-compare-subcategory-panel {
    display: flex;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    flex-direction: column;
    border-left: 1px solid rgba(70, 74, 66, 0.1);
    background: rgba(249, 247, 241, 0.44);
}

.m-compare-subcategory-panel__header {
    display: flex;
    min-height: 58px;
    flex: none;
    align-items: center;
    gap: 9px;
    padding: 10px 11px;
    border-bottom: 1px solid rgba(70, 74, 66, 0.08);

    > span:last-child {
        display: flex;
        min-width: 0;
        flex-direction: column;
    }

    strong {
        overflow: hidden;
        color: #44504f;
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    small {
        margin-top: 2px;
        color: #9da39f;
        font-size: 9px;
    }
}

.u-compare-subcategory-panel-icon {
    width: 36px;
    height: 36px;
    flex: none;
    border-radius: 9px;
}

.m-compare-subcategory-list {
    display: grid;
    align-content: start;
    gap: 5px;
    padding: 8px;

    button {
        display: grid;
        min-width: 0;
        min-height: 38px;
        grid-template-columns: 18px minmax(0, 1fr) auto;
        align-items: center;
        gap: 7px;
        padding: 6px 8px;
        border: 1px solid transparent;
        border-radius: 8px;
        color: #5b6664;
        background: transparent;
        font: inherit;
        text-align: left;
        cursor: pointer;

        svg {
            width: 14px;
            color: #789096;
        }

        span {
            overflow: hidden;
            font-size: 11px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        b {
            color: #a0a6a3;
            font-size: 9px;
            font-weight: 500;
        }

        &:hover {
            background: rgba(71, 119, 125, 0.07);
        }

        &.is-active {
            border-color: rgba(71, 119, 125, 0.34);
            color: #fff;
            background: #47777d;

            svg,
            b {
                color: rgba(255, 255, 255, 0.76);
            }
        }
    }
}

@media (max-width: 1060px) {
    .m-compare-categories {
        height: 360px;
    }
}

@media (max-width: 620px) {
    .m-compare-categories {
        height: auto;
    }

    .m-compare-category-browser.has-subcategories {
        grid-template-columns: minmax(0, 1fr);
    }

    .m-compare-category-list,
    .m-compare-subcategory-list {
        max-height: 280px;
    }

    .m-compare-subcategory-panel {
        border-top: 1px solid rgba(70, 74, 66, 0.1);
        border-left: 0;
    }
}
</style>
