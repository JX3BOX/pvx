<script>
import { ArrowRight, CollectionTag } from "@element-plus/icons-vue";
import { achievementCategoryImages } from "@/utils/achievementCategoryImages";

export default {
    name: "AchievementCategoryBoard",
    components: {
        ArrowRight,
        CollectionTag,
    },
    props: {
        tierLabel: { type: String, default: "" },
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
    watch: {
        activeCategoryId: {
            immediate: true,
            handler(value) {
                if (!value || value === "all") this.expandedCategoryId = null;
                else this.expandActiveCategory();
            },
        },
        categories() {
            this.expandActiveCategory();
        },
    },
    emits: ["select-category", "update:sort"],
    methods: {
        expandActiveCategory() {
            const root = this.categories.find(
                (category) =>
                    category.id === this.activeCategoryId ||
                    (category.children || []).some((child) => child.id === this.activeCategoryId)
            );
            if (root) this.expandedCategoryId = root.children?.length ? root.id : null;
        },
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
            return achievementCategoryImages[name] || "";
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
                <h2>
                    {{ $t("pages.wiki.overview.ui.statistics.categoryProgress") }}
                    <span v-if="tierLabel">- {{ tierLabel }}</span>
                </h2>
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
                                    v-if="category.id === 'all'"
                                    src="@/assets/img/wiki/figma/tier-normal.svg"
                                    alt=""
                                />
                                <img v-else-if="getCategoryImage(category.name)" :src="getCategoryImage(category.name)" alt="" />
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

                        <span v-if="category.children?.length" class="u-progress-category-direction" aria-hidden="true">
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
                        <span class="u-progress-subcategory-icon" aria-hidden="true">
                            <img src="@/assets/img/wiki/figma/subcategory.png" alt="" />
                        </span>
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
    min-width: 0;
    padding: 12px;
    border-radius: 16px;
    background: #f8f7f3;
}
.m-progress-categories__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 28px;
    margin-bottom: 12px;
    h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: #333;
    }
    h2::before {
        content: "";
        width: 6px;
        height: 18px;
        flex: none;
        border-radius: 99px;
        background: #5a7e84;
    }
    h2 span {
        color: #6e572c;
    }
}
.u-progress-category-sort {
    width: 280px;
    max-width: 100%;
    flex: none;
}
.m-progress-category-browser {
    display: grid;
    min-width: 0;
    &.has-subcategories {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px;
    }
}
.m-progress-category-list,
.m-progress-subcategory-list {
    display: grid;
    min-width: 0;
    align-content: start;
    gap: 2px;
}
.m-progress-category-node,
.m-progress-category-card__body,
.m-progress-subcategory-card__body {
    min-width: 0;
}
.m-progress-category-node__root {
    position: relative;
    color: #333;
    background: #fdfcf9;
}
.m-progress-category-card {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    align-items: center;
    gap: 16px;
    width: 100%;
    min-width: 0;
    min-height: 62px;
    padding: 10px 12px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
}
.u-progress-category-icon {
    color: #967944;
    display: inline-flex;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    img,
    svg {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
}
.m-progress-category-card__line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    strong {
        font-size: 16px;
        font-weight: 400;
        overflow-wrap: anywhere;
    }
    > span {
        display: none;
    }
    b {
        font-size: 14px;
        font-weight: 400;
        color: #6e572c;
    }
}
.m-progress-category-card__meta,
.u-progress-category-direction {
    display: none;
}
.m-progress-category-track {
    display: block;
    height: 8px;
    margin-top: 8px;
    overflow: hidden;
    border-radius: 99px;
    background: #eae5e1;
    i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: #5a7e84;
    }
}
.m-progress-category-node.is-active .m-progress-category-node__root,
.m-progress-category-node.is-expanded .m-progress-category-node__root {
    color: #fff;
    background: linear-gradient(90deg, #2c3e46, #5a7e84);
    .u-progress-category-icon img {
        filter: brightness(0) invert(1);
    }
    .m-progress-category-card__line b {
        color: #fff;
    }
    .m-progress-category-track {
        background: #ffffff33;
        i {
            background: #fff;
        }
    }
}
.m-progress-category-node__root:hover {
    box-shadow: inset 0 0 0 1px #5a7e84;
}
.m-progress-subcategory-panel {
    min-width: 0;
}
.m-progress-subcategory-panel__header {
    display: none;
}
.m-progress-subcategory-card {
    display: grid;
    width: 100%;
    min-width: 0;
    grid-template-columns: 24px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 12px;
    border: 0;
    color: #333;
    background: #fdfcf9;
    font: inherit;
    text-align: left;
    cursor: pointer;
    &:hover {
        box-shadow: inset 0 0 0 1px #5a7e84;
    }
    &.is-active {
        color: #fff;
        background: #5a7e84;
        .m-progress-subcategory-card__line span {
            color: #fff;
        }
        .m-progress-category-track {
            background: #ffffff33;
            i {
                background: #fff;
            }
        }
    }
    .m-progress-category-track {
        height: 4px;
        margin-top: 4px;
    }
}
.u-progress-subcategory-icon {
    display: flex;
    width: 24px;
    height: 24px;
    color: #967944;
    img {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
    }
}
.m-progress-subcategory-card__line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    strong {
        font-size: 14px;
        font-weight: 400;
        overflow-wrap: anywhere;
    }
    span {
        font-size: 14px;
        color: #999;
        white-space: nowrap;
    }
    b {
        display: none;
    }
}
@media (max-width: 1400px) {
    .m-progress-category-card {
        grid-template-columns: 32px minmax(0, 1fr);
        gap: 10px;
        padding: 10px 8px;
    }
    .u-progress-category-icon {
        width: 32px;
        height: 32px;
    }
    .m-progress-category-card__line strong {
        font-size: 14px;
    }
    .m-progress-categories__header {
        flex-wrap: wrap;
    }
}
@media (max-width: @phone) {
    .m-progress-categories {
        padding: 10px;
    }
    .m-progress-categories__header {
        align-items: stretch;
        flex-direction: column;
    }
    .u-progress-category-sort {
        width: 100%;
    }
    .m-progress-category-browser.has-subcategories {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .m-progress-category-card {
        grid-template-columns: 24px minmax(0, 1fr);
        min-height: 70px;
        gap: 6px;
        padding: 8px 6px;
    }
    .u-progress-category-icon {
        width: 24px;
        height: 24px;
    }
    .m-progress-subcategory-card {
        grid-template-columns: minmax(0, 1fr);
        min-height: 70px;
        padding: 8px;
        gap: 4px;
    }
    .u-progress-subcategory-icon {
        display: none;
    }
    .m-progress-subcategory-card__line {
        flex-wrap: wrap;
        gap: 2px;
    }
    .m-progress-category-card__line {
        flex-wrap: wrap;
        gap: 2px;
    }
}
</style>
