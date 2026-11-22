<template>
    <div class="grid min-w-0 gap-4">
        <div class="m-exterior-filters">
            <PvxSearch
                variant="modern"
                inline-search-icon
                i18n-scope="exterior"
                :items="searchFields"
                :init-value="initialSearch"
                @search="updateSearch"
            />
        </div>

        <PvxSurface
            v-if="subcategories.length > 1"
            class="m-exterior-subcategories"
            padding="small"
            role="group"
            :aria-label="$t('exterior.subcategory')"
        >
            <button
                type="button"
                class="u-item"
                :class="{ 'is-active': !category }"
                :aria-pressed="!category"
                @click="selectCategory('')"
            >
                {{ $t("exterior.allTypes") }}
            </button>
            <button
                v-for="option in subcategories"
                :key="option.key"
                type="button"
                class="u-item"
                :class="{ 'is-active': category === option.key }"
                :aria-pressed="category === option.key"
                @click="selectCategory(option.key)"
            >
                {{ option.name }}
            </button>
        </PvxSurface>

        <PvxSurface padding="medium" class="min-h-48 space-y-4">
            <PvxSectionHeader :title="resultTitle" class="flex-wrap gap-y-2">
                <template #action>
                    <div class="flex flex-wrap gap-2">
                        <el-button
                            v-for="drawer in starDrawers"
                            :key="drawer"
                            class="!m-0"
                            plain
                            aria-haspopup="dialog"
                            @click="openStarDrawer(drawer)"
                        >
                            <template #icon>
                                <Star v-if="drawer === 'favorites'" aria-hidden="true" />
                                <Trophy v-else aria-hidden="true" />
                            </template>
                            {{ $t(`exterior.star.${drawer}`) }}
                        </el-button>
                    </div>
                </template>
            </PvxSectionHeader>
            <div v-loading="loading" class="min-h-36 space-y-4">
                <PvxEmptyState v-if="listError" :title="$t('exterior.loadError')" :description="listError" illustrated>
                    <template #action
                        ><el-button @click="loadCatalog">{{ $t("exterior.retry") }}</el-button></template
                    >
                </PvxEmptyState>
                <div v-if="items.length" class="m-exterior-grid">
                    <ExteriorCard v-for="item in items" :key="item.key" :item="item" />
                </div>
                <PvxEmptyState v-else-if="!loading && !listError" :title="$t('exterior.empty')" illustrated />
                <el-button
                    v-if="hasNextPage"
                    class="m-exterior-more"
                    type="primary"
                    :loading="loading"
                    @click="loadList(page + 1, true)"
                >
                    <el-icon v-if="!loading" class="el-icon--left"><ArrowDown /></el-icon>
                    {{ $t("pages.pet.ui.actions.loadMore") }}
                </el-button>
                <el-pagination
                    v-if="cursors.length > 1"
                    class="m-exterior-pages"
                    :current-page="page"
                    :page-count="cursors.length"
                    :pager-count="responsivePagerCount"
                    :disabled="loading"
                    layout="prev, pager, next"
                    background
                    @update:current-page="loadList"
                />
            </div>
        </PvxSurface>
        <el-drawer
            v-for="drawer in starDrawers"
            :key="drawer"
            :model-value="activeDrawer === drawer"
            :title="$t(`exterior.star.${drawer}`)"
            header-class="m-exterior-drawer-header"
            body-class="m-exterior-drawer-body"
            size="min(100%, 460px)"
            append-to-body
            @update:model-value="closeStarDrawer(drawer, $event)"
        >
            <template #header="{ titleId }">
                <div class="flex min-w-0 items-center gap-2.5">
                    <span class="grid size-8 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Star v-if="drawer === 'favorites'" class="size-4" aria-hidden="true" />
                        <Trophy v-else class="size-4" aria-hidden="true" />
                    </span>
                    <h2 :id="titleId" class="m-0 text-base font-semibold text-slate-800">
                        {{ $t(`exterior.star.${drawer}`) }}
                    </h2>
                </div>
            </template>
            <ExteriorStarList :view="drawer" :visible="activeDrawer === drawer" />
        </el-drawer>
    </div>
</template>

<script>
import { ArrowDown, Star, Trophy } from "@element-plus/icons-vue";
import responsivePagination from "@/mixins/responsive-pagination";
import PvxSearch from "@/components/PvxSearch.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import ExteriorCard from "@/components/exterior/ExteriorCard.vue";
import ExteriorStarList from "@/components/exterior/ExteriorStarList.vue";
import { getExteriorsList, getExteriorCategories } from "@/service/exterior";

export default {
    name: "ExteriorList",
    mixins: [responsivePagination],
    components: {
        ArrowDown,
        Star,
        Trophy,
        PvxSearch,
        PvxSurface,
        PvxSectionHeader,
        PvxEmptyState,
        ExteriorCard,
        ExteriorStarList,
    },
    data() {
        return {
            starDrawers: ["favorites", "ranking"],
            categories: [],
            domain: "",
            category: "",
            cursors: [0],
            page: 1,
            initialSearch: { domain: "", keyword: "" },
            searchInput: "",
            keyword: "",
            searchTimer: null,
            items: [],
            loading: true,
            listError: "",
            listRequest: 0,
        };
    },
    computed: {
        activeDrawer() {
            const { name, query } = this.$route;
            if (name === "exterior-list" && !query.id && this.starDrawers.includes(query.view)) return query.view;
            return "";
        },
        searchFields() {
            return [
                ...(this.categoryGroups.length
                    ? [
                          {
                              key: "domain",
                              type: "radio",
                              options: [
                                  { type: "", name: this.$t("exterior.allTypes") },
                                  ...this.categoryGroups.map(({ domain, name }) => ({ type: domain, name })),
                              ],
                          },
                      ]
                    : []),
                { key: "keyword" },
            ];
        },
        categoryGroups() {
            const byDomain = new Map();
            for (const category of this.categories) {
                if (!byDomain.has(category.domain)) byDomain.set(category.domain, []);
                byDomain.get(category.domain).push(category);
            }
            return Array.from(byDomain, ([domain, categories]) => ({
                domain,
                categories,
                name: categories.length === 1 ? categories[0].name : this.$t(`exterior.domains.${domain}`),
            }));
        },
        selectedGroup() {
            return this.categoryGroups.find((group) => group.domain === this.domain);
        },
        subcategories() {
            return this.selectedGroup?.categories || [];
        },
        resultTitle() {
            if (this.keyword) return this.$t("exterior.results");
            const selected = this.subcategories.find(({ key }) => key === this.category);
            return selected?.name || this.selectedGroup?.name || this.$t("pages.index.ui.menus.exterior");
        },
        hasNextPage() {
            return this.page < this.cursors.length;
        },
        filters() {
            const category = this.category || (this.subcategories.length === 1 ? this.subcategories[0].key : undefined);
            return {
                limit: 20,
                domain: category ? undefined : this.domain || undefined,
                category,
                keyword: this.keyword || undefined,
            };
        },
    },
    watch: {
        filters() {
            this.page = 1;
            this.cursors = [0];
            this.items = [];
            this.loadList();
        },
    },
    created() {
        this.loadCatalog();
    },
    beforeUnmount() {
        clearTimeout(this.searchTimer);
        this.listRequest++;
    },
    methods: {
        openStarDrawer(view) {
            this.$router.replace({ query: { ...this.$route.query, view } });
        },
        closeStarDrawer(view, visible) {
            if (visible || this.activeDrawer !== view) return;
            this.$router.replace({ query: { ...this.$route.query, view: undefined } });
        },
        updateSearch({ domain, keyword }) {
            this.searchInput = keyword.trim();
            clearTimeout(this.searchTimer);
            if (domain !== this.domain) {
                this.domain = domain;
                this.category = "";
                this.applySearch();
            } else if (this.searchInput !== this.keyword) {
                this.searchTimer = setTimeout(this.applySearch, 500);
            }
        },
        selectCategory(category) {
            this.category = category;
            this.applySearch();
        },
        applySearch() {
            clearTimeout(this.searchTimer);
            this.keyword = this.searchInput;
        },
        loadCatalog() {
            if (!this.categories.length) this.loadCategories();
            this.loadList(this.page);
        },
        async loadCategories() {
            try {
                this.categories = await getExteriorCategories();
            } catch (error) {
                console.warn("Failed to load exterior categories", error);
            }
        },
        async loadList(page = 1, append = false) {
            const request = ++this.listRequest;
            this.loading = true;
            this.listError = "";
            try {
                const { list, nextCursor } = await getExteriorsList({
                    ...this.filters,
                    cursor: this.cursors[page - 1],
                });
                if (request !== this.listRequest) return;
                if (nextCursor !== this.cursors[page]) {
                    this.cursors.splice(page);
                    if (nextCursor !== null) this.cursors.push(nextCursor);
                }
                this.items = append ? [...this.items, ...list] : list;
                this.page = page;
            } catch (error) {
                if (request !== this.listRequest) return;
                this.listError = error.code ? `${error.message} (${error.code})` : this.$t("exterior.requestError");
            } finally {
                if (request === this.listRequest) this.loading = false;
            }
        },
    },
};
</script>

<style lang="less">
@import (reference) "~@/assets/css/design-system/_tokens.less";
@import (reference) "~@/assets/css/modules/pet-list-theme.less";
@import (reference) "~@/assets/css/modules/furniture-list-theme.less";

.el-drawer__header.m-exterior-drawer-header {
    margin-bottom: 0;
    padding: @pvx-space-2 clamp(@pvx-space-2, 4vw, @pvx-space-4);
    border-bottom: 1px solid @pvx-border;
    background: @pvx-surface;

    .el-drawer__close-btn {
        display: grid;
        width: 32px;
        height: 32px;
        place-items: center;
        border-radius: @pvx-radius-small;
        color: @pvx-text-secondary;

        &:hover,
        &:focus-visible {
            color: @pvx-primary-hover;
            background: @pvx-primary-soft;
        }
    }
}

.el-drawer__body.m-exterior-drawer-body {
    padding: clamp(@pvx-space-2, 4vw, @pvx-space-4);
    background: @pvx-surface-muted;
}

.m-exterior-subcategories:extend(.p-pvx-furniture-list .m-child-category all) {
}

.m-exterior-filters:extend(.p-pvx-pet-list .m-pvx-pet-tabs all) {
    .pvx-search-wrapper .search-group .search-item.type-list {
        min-width: 0;
        max-width: 50%;
        overflow-x: auto;

        .el-radio-group {
            min-width: max-content;
            flex-wrap: nowrap;
        }
    }

    .pvx-search-wrapper .search-group .search-item.input-wrap {
        flex: 1;
        min-width: 0;
    }

    @media (max-width: @ipad) {
        .pvx-search-wrapper .search-group {
            display: grid;
            grid-template-columns: minmax(0, 1fr);

            .search-item.type-list,
            .search-item.input-wrap {
                grid-column: 1;
                width: 100%;
                max-width: 100%;
            }
        }
    }
}

.m-exterior-more:extend(.p-pvx-pet-list .m-archive-more all) {
}
.m-exterior-pages:extend(.p-pvx-pet-list .m-archive-pages all) {
}

.m-exterior-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 140px), 1fr));
    gap: 12px;
}
</style>
