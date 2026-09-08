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
            <h2>{{ $t("pages.wiki.compare.ui.categories.title") }}</h2>
        </header>
        <div class="m-compare-category-browser">
            <div class="m-compare-category-list">
                <button
                    type="button"
                    class="m-compare-category-card is-all"
                    :class="{ 'is-active': activeCategoryId === 'all' }"
                    :aria-pressed="activeCategoryId === 'all'"
                    @click="selectAll"
                >
                    <span class="u-compare-category-icon" aria-hidden="true"
                        ><img src="@/assets/img/wiki/figma/tier-normal.svg" alt=""
                    /></span>
                    <span class="m-compare-category-card__body"
                        ><strong>{{ $t("pages.wiki.compare.ui.categories.all") }}</strong
                        ><small>{{ formatNumber(total) }}</small></span
                    >
                </button>
                <template v-for="category in categories" :key="category.id">
                    <button
                        type="button"
                        class="m-compare-category-card"
                        :class="{ 'is-active': isCategoryActive(category), 'is-context': isCategoryContext(category) }"
                        :aria-pressed="isCategoryActive(category)"
                        :aria-expanded="
                            category.children?.length ? expandedCategoryId === String(category.id) : undefined
                        "
                        @click="selectCategory(category)"
                    >
                        <span class="u-compare-category-icon" aria-hidden="true">
                            <img
                                v-if="getCategoryImage(category.name)"
                                :src="getCategoryImage(category.name)"
                                alt=""
                            /><CollectionTag v-else />
                        </span>
                        <span class="m-compare-category-card__body"
                            ><strong>{{ category.name }}</strong></span
                        >
                        <ArrowRight
                            v-if="category.children?.length"
                            class="u-compare-category-direction"
                            :class="{ 'is-open': expandedCategoryId === String(category.id) }"
                            aria-hidden="true"
                        />
                    </button>
                    <div
                        v-if="expandedCategory && expandedCategoryId === String(category.id)"
                        class="m-compare-subcategory-list"
                    >
                        <button
                            v-for="child in category.children"
                            :key="child.id"
                            type="button"
                            :class="{
                                'is-active':
                                    String(activeCategoryId) === String(category.id) &&
                                    String(activeDetailId) === String(child.id),
                            }"
                            :aria-pressed="
                                String(activeCategoryId) === String(category.id) &&
                                String(activeDetailId) === String(child.id)
                            "
                            @click="selectDetail(category, child)"
                        >
                            <span class="u-compare-subcategory-icon" aria-hidden="true">
                                <img src="@/assets/img/wiki/figma/subcategory.png" alt="" />
                            </span>
                            <span>{{ child.name }}</span><b>{{ formatNumber(child.count) }}</b>
                        </button>
                    </div>
                </template>
            </div>
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-compare-categories {
    min-width: 0;
    overflow: hidden;
    padding: 12px;
    border-radius: 12px;
    background: #f8f7f3;
}
.m-compare-categories__header {
    display: flex;
    align-items: center;
    min-height: 28px;
    margin-bottom: 12px;
    h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        color: #333;
        font-size: 16px;
        font-weight: 500;
        &::before {
            content: "";
            width: 6px;
            height: 18px;
            flex: none;
            border-radius: 3px;
            background: #5a7e84;
        }
    }
}
.m-compare-category-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.m-compare-category-card {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) 12px;
    gap: 6px;
    align-items: center;
    width: 100%;
    min-height: 40px;
    padding: 6px 8px;
    border: 0;
    color: #333;
    background: #fcfcfa;
    font: inherit;
    text-align: left;
    cursor: pointer;
    &.is-active,
    &.is-context {
        color: #fff;
        background: linear-gradient(90deg, #2e414a, #5a7e84);
        .u-compare-category-icon img {
            filter: brightness(0) invert(1);
        }
        small {
            color: inherit;
        }
    }
    &:hover:not(.is-active):not(.is-context) {
        background: #f0ede5;
    }
    &.is-all {
        grid-template-columns: 28px minmax(0, 1fr);
    }
}
.u-compare-category-icon {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #967944;
    img,
    svg {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }
}
.m-compare-category-card__body {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    strong {
        font-size: 15px;
        font-weight: 500;
        overflow-wrap: anywhere;
    }
    small {
        color: #999;
        font-size: 13px;
    }
}
.u-compare-category-direction {
    width: 12px;
    height: 12px;
    transform: rotate(90deg);
    &.is-open {
        transform: rotate(-90deg);
    }
}
.m-compare-subcategory-list {
    display: flex;
    flex-direction: column;
    button {
        display: grid;
        grid-template-columns: 22px minmax(0, 1fr) auto;
        gap: 4px;
        align-items: center;
        width: 100%;
        min-height: 34px;
        padding: 4px 6px 4px 12px;
        border: 0;
        color: #6e572c;
        background: #fcfcfa;
        font: inherit;
        text-align: left;
        cursor: pointer;
        svg {
            width: 20px;
            height: 20px;
            color: #967944;
        }
        span {
            font-size: 14px;
            overflow-wrap: anywhere;
        }
        b {
            font-size: 13px;
            font-weight: 400;
            color: #999;
        }
        &:hover {
            background: #f0ede5;
        }
        &.is-active {
            background: #5a7e84;
            color: #fff;
            svg,
            b {
                color: #fff;
            }
        }
    }
}
.u-compare-subcategory-icon {
    display: flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    img {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        object-fit: cover;
    }
}
@media (max-width: @phone) {
    .m-compare-category-card,
    .m-compare-subcategory-list button {
        min-height: 44px;
    }
}
</style>
