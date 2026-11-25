<!-- 外观大全列表页：精简真实外观分类、按用户角色自动匹配默认封面体型、支持切换体型与俗称检索。 -->
<template>
    <div class="m-ext-list-page">
        <PvxSurface padding="none" radius="medium" class="m-ext-toolbar">
            <div class="m-ext-toolbar__top">
                <div class="m-ext-domains" role="tablist" :aria-label="$t('exterior.category')">
                    <button
                        v-for="tab in domainTabs"
                        :key="tab.domain || 'all'"
                        type="button"
                        role="tab"
                        class="u-domain-tab"
                        :class="{ 'is-active': domain === tab.domain }"
                        :aria-selected="domain === tab.domain"
                        @click="selectDomain(tab.domain)"
                    >
                        {{ tab.name }}
                    </button>
                </div>

                <el-popover
                    v-model:visible="filterOpen"
                    trigger="click"
                    placement="bottom"
                    width="min(480px, calc(100vw - 32px))"
                    popper-class="m-ext-filter-popover"
                    @before-enter="beginFilterEdit"
                >
                    <template #reference>
                        <button
                            type="button"
                            class="u-ext-filter"
                            :class="{ 'is-open': filterOpen, 'has-filter': selectedRole !== defaultRole }"
                            :aria-label="$t('exterior.filter')"
                            :title="$t('exterior.filter')"
                            :aria-expanded="filterOpen"
                        >
                            <img svg-inline src="@/assets/img/common/filter.svg" alt="" aria-hidden="true" />
                        </button>
                    </template>
                    <fieldset class="m-ext-filter-group">
                        <legend>
                            <span>{{ $t("exterior.bodyType") }}</span>
                            <el-tooltip
                                :content="bodyTypeHint"
                                :trigger="['hover', 'focus']"
                                placement="top"
                            >
                                <button
                                    type="button"
                                    class="u-role-hint"
                                    :aria-label="bodyTypeHint"
                                    @click="$event.currentTarget.focus()"
                                >
                                    <el-icon aria-hidden="true"><InfoFilled /></el-icon>
                                </button>
                            </el-tooltip>
                        </legend>
                        <el-radio-group v-model="draftRole" :aria-label="$t('exterior.bodyType')">
                            <el-radio-button v-for="body in bodyTypes" :key="body.id" :value="body.id">
                                {{ $t(`exterior.bodyTypes.${body.key}`) }}
                            </el-radio-button>
                        </el-radio-group>
                    </fieldset>
                    <div class="m-ext-filter-actions">
                        <el-button type="primary" @click="applyFilterEdit">{{ $t("pages.pet.ui.search.close") }}</el-button>
                        <el-button @click="resetFilterEdit">{{ $t("pages.pet.ui.search.reset") }}</el-button>
                    </div>
                </el-popover>

                <div class="m-ext-search-box">
                    <el-input
                        v-model="searchInput"
                        clearable
                        class="u-search-input"
                        :placeholder="$t('exterior.searchPlaceholder')"
                        @input="onSearchInput"
                        @keyup.enter="applySearch"
                        @clear="applySearch"
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>
                </div>
            </div>
        </PvxSurface>

        <PvxSurface
            v-if="subcategories.length > 1"
            class="m-ext-subcats"
            @wheel="scrollHorizontally"
            padding="small"
            role="group"
            :aria-label="$t('exterior.subcategory')"
        >
            <button
                type="button"
                class="u-subcat-pill"
                :class="{ 'is-active': !category }"
                :aria-pressed="!category"
                @click="category = ''"
            >
                {{ $t("exterior.allTypes") }}
            </button>
            <button
                v-for="option in subcategories"
                :key="option.key"
                type="button"
                class="u-subcat-pill"
                :class="{ 'is-active': category === option.key }"
                :aria-pressed="category === option.key"
                @click="category = option.key"
            >
                {{ option.name }}
            </button>
        </PvxSurface>

        <PvxSurface padding="medium" class="m-ext-ranking-panel">
            <PvxSectionHeader :title="$t('exterior.star.podium')">
                <template #action>
                    <button
                        type="button"
                        class="u-ext-view-more u-ext-view-more--heading"
                        :aria-label="$t('exterior.star.moreRanking')"
                        :title="$t('exterior.star.moreRanking')"
                        aria-haspopup="dialog"
                        @click="openStarDrawer('ranking')"
                    >
                        <MoreFilled aria-hidden="true" />
                    </button>
                    <div class="m-ext-action-buttons">
                        <el-button
                            class="!m-0"
                            plain
                            round
                            aria-haspopup="dialog"
                            @click="openStarDrawer('favorites')"
                        >
                            <template #icon>
                                <Star aria-hidden="true" />
                            </template>
                            {{ $t("exterior.star.favorites") }}
                        </el-button>
                        <el-button class="!m-0" plain round @click="$router.push({ name: 'exterior-house' })">
                            <template #icon>
                                <Box aria-hidden="true" />
                            </template>
                            {{ $t("exterior.warehouse.title") }}
                        </el-button>
                        <el-button
                            type="primary"
                            class="!m-0"
                            round
                            @click="enterFittingRoom"
                        >
                            <template #icon>
                                <MagicStick aria-hidden="true" />
                            </template>
                            {{ $t("exterior.studio.title") }}
                        </el-button>
                    </div>
                </template>
            </PvxSectionHeader>
            <div class="m-ext-ranking-row-preview">
                <ExteriorStarList ref="podium" view="ranking" preview :visible="rankingPreviewVisible" />
                <button
                    type="button"
                    class="u-ext-view-more u-ext-view-more--row"
                    :aria-label="$t('exterior.star.moreRanking')"
                    :title="$t('exterior.star.moreRanking')"
                    aria-haspopup="dialog"
                    @click="openStarDrawer('ranking')"
                >
                    <MoreFilled aria-hidden="true" />
                </button>
            </div>
        </PvxSurface>

        <PvxSurface padding="medium" class="m-ext-gallery-panel">
            <PvxSectionHeader :title="resultTitle">
                <template v-if="total != null" #action>
                    <span class="u-count-pill">
                        {{ $t("exterior.resultCount", { count: total.toLocaleString($i18n.locale) }) }}
                    </span>
                </template>
            </PvxSectionHeader>

            <div v-loading="loading" class="m-ext-gallery-body">
                <PvxEmptyState v-if="listError" :title="$t('exterior.loadError')" :description="listError" illustrated>
                    <template #action>
                        <el-button type="primary" @click="loadCatalog">{{ $t("exterior.retry") }}</el-button>
                    </template>
                </PvxEmptyState>

                <div v-else-if="items.length" class="m-ext-grid">
                    <ExteriorCard
                        v-for="item in items"
                        :key="item.key"
                        :item="item"
                        :role="selectedRole"
                        :show-domain-badge="!domain || Boolean(keyword)"
                    />
                </div>

                <PvxEmptyState v-else-if="!loading" :title="$t('exterior.empty')" illustrated>
                    <template v-if="keyword || domain" #action>
                        <el-button @click="resetFilters">{{ $t("exterior.viewAll") }}</el-button>
                    </template>
                </PvxEmptyState>

                <div v-if="items.length && (page > 1 || nextCursor !== null)" class="m-ext-footer">
                    <nav class="m-ext-cursor-pager" :aria-label="$t('exterior.pagination')">
                        <el-button v-if="page > 2" round :disabled="loading" @click="goFirstPage">{{ $t("exterior.firstPage") }}</el-button>
                        <el-button round :disabled="page <= 1 || loading" @click="goPrevPage">{{ $t("exterior.previousPage") }}</el-button>
                        <span class="u-pager-status">
                            {{ $t("exterior.pageNumber", { page: pageCount ? `${page} / ${pageCount}` : page }) }}
                        </span>
                        <el-button
                            type="primary"
                            plain
                            round
                            :disabled="nextCursor === null || loading"
                            @click="goNextPage"
                        >
                            {{ $t("exterior.nextPage") }}
                        </el-button>
                    </nav>
                </div>
            </div>
        </PvxSurface>

        <ExteriorStarDrawer
            v-for="drawer in starDrawers"
            :key="drawer"
            :view="drawer"
            :model-value="activeDrawer === drawer"
            @update:model-value="closeStarDrawer(drawer, $event)"
            @ranking-loaded="$refs.podium.updatePreview($event)"
        />
    </div>
</template>

<script>
import { MoreFilled, Box, InfoFilled, MagicStick, Search, Star } from "@element-plus/icons-vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import { scrollHorizontally } from "@/utils/horizontal-wheel";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import ExteriorCard from "@/components/exterior/ExteriorCard.vue";
import ExteriorStarDrawer from "@/components/exterior/ExteriorStarDrawer.vue";
import ExteriorStarList from "@/components/exterior/ExteriorStarList.vue";
import {
    BODY_LABEL_MAP,
    BODY_TYPES,
    DOMAIN_META,
    HIDDEN_LIST_DOMAINS,
    VISIBLE_LIST_DOMAINS,
    WEAPON_SCHOOLS,
    localizedExteriorLabel,
} from "@/components/exterior/meta";
import { getExteriorCategories, getExteriorCount, getExteriorsList } from "@/service/exterior";

const PAGE_SIZE = 30;

export default {
    name: "ExteriorList",
    components: {
        MoreFilled,
        Box,
        InfoFilled,
        PvxSectionHeader,
        MagicStick,
        Search,
        Star,
        ExteriorStarDrawer,
        PvxSurface,
        PvxEmptyState,
        ExteriorCard,
        ExteriorStarList,
    },
    data() {
        return {
            pageSize: PAGE_SIZE,
            rankingPreviewVisible: true,
            filterOpen: false,
            draftRole: null,
            bodyTypes: BODY_TYPES,
            starDrawers: ["favorites", "ranking"],
            categories: [],
            domain: "",
            category: "",
            total: null,
            countRequest: null,
            listAbort: null,
            cursors: [0],
            nextCursor: null,
            page: 1,
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
        defaultRole() {
            return this.$store.state.characterRole?.role || 2;
        },
        selectedRole() {
            return this.$store.state.preferredRole || 2;
        },
        bodyTypeHint() {
            const { roleSource, characterRole } = this.$store.state;
            if (roleSource !== "character" || !characterRole?.role) return this.$t("exterior.bodyTypeHint");
            const bodyLabel = localizedExteriorLabel(this.$t, BODY_LABEL_MAP[characterRole.role]) || "";
            return characterRole.name
                ? this.$t("exterior.namedBodyHint", { name: characterRole.name, body: bodyLabel })
                : this.$t("exterior.defaultBodyHint", { body: bodyLabel });
        },
        activeDrawer() {
            const { name, query } = this.$route;
            if (name === "exterior-list" && !query.id && this.starDrawers.includes(query.view)) return query.view;
            return "";
        },
        categoryGroups() {
            const byDomain = new Map();
            for (const cat of this.categories) {
                if (!cat.domain || HIDDEN_LIST_DOMAINS.has(cat.domain)) continue;
                if (!byDomain.has(cat.domain)) byDomain.set(cat.domain, []);
                byDomain.get(cat.domain).push(cat);
            }
            const orderIndex = (d) => {
                const idx = VISIBLE_LIST_DOMAINS.indexOf(d);
                return idx >= 0 ? idx : 99;
            };
            return Array.from(byDomain, ([domain, categories]) => ({
                domain,
                categories,
                name: localizedExteriorLabel(this.$t, DOMAIN_META[domain]?.label) || (categories.length === 1 ? categories[0].name : domain),
            })).sort((a, b) => orderIndex(a.domain) - orderIndex(b.domain));
        },
        domainTabs() {
            const groups = this.categoryGroups.length
                ? this.categoryGroups
                : VISIBLE_LIST_DOMAINS.map((domain) => ({
                      domain,
                      name: localizedExteriorLabel(this.$t, DOMAIN_META[domain]?.label) || domain,
                  }));
            return [{ domain: "", name: this.$t("exterior.allTypes") }, ...groups];
        },
        selectedGroup() {
            return this.categoryGroups.find((group) => group.domain === this.domain);
        },
        subcategories() {
            const options = this.domain === "weapon" ? WEAPON_SCHOOLS : this.selectedGroup?.categories || [];
            return options.map((option) => ({ ...option, name: localizedExteriorLabel(this.$t, option.name) }));
        },
        selectedSubcategory() {
            return this.subcategories.find(({ key }) => key === this.category);
        },
        resultTitle() {
            if (this.keyword) return this.$t("exterior.searchResults", { keyword: this.keyword });
            return this.selectedSubcategory?.name || this.selectedGroup?.name || this.$t("pages.index.ui.menus.exterior");
        },
        pageCount() {
            if (typeof this.total !== "number" || this.total < 0) return null;
            return Math.max(1, Math.ceil(this.total / this.pageSize));
        },
        filters() {
            const category =
                this.domain === "weapon"
                    ? undefined
                    : this.category || (this.subcategories.length === 1 ? this.subcategories[0].key : undefined);
            return {
                limit: this.pageSize,
                domain: category ? undefined : this.domain || undefined,
                category,
                school: this.selectedSubcategory?.school,
                keyword: this.keyword || undefined,
            };
        },
    },
    watch: {
        selectedRole(role, previousRole) {
            if (this.filterOpen && this.draftRole === previousRole) this.draftRole = role;
        },
        filters() {
            this.page = 1;
            this.cursors = [0];
            this.nextCursor = null;
            this.countRequest?.abort();
            this.countRequest = null;
            this.total = null;
            this.items = [];
            this.loadList(1);
            this.loadTotal();
        },
    },
    created() {
        this.$store.dispatch("initPreferredRole");
        this.loadCatalog();
    },
    activated() {
        this.rankingPreviewVisible = true;
    },
    deactivated() {
        // 保留榜单高度，让路由返回时能恢复列表的滚动位置。
        if (this.$route.name !== "exterior-studio") this.rankingPreviewVisible = false;
    },
    beforeUnmount() {
        clearTimeout(this.searchTimer);
        this.listRequest++;
        this.listAbort?.abort();
        this.countRequest?.abort();
    },
    methods: {
        scrollHorizontally,
        enterFittingRoom() {
            this.$router.push({
                name: "exterior-studio",
                query: { role: this.selectedRole },
                state: { preserveCatalogRole: true },
            });
        },
        beginFilterEdit() {
            this.draftRole = this.selectedRole;
        },
        resetFilterEdit() {
            this.draftRole = this.defaultRole;
        },
        applyFilterEdit() {
            if (this.draftRole !== this.selectedRole) {
                this.$store.commit("setPreferredRole", { role: this.draftRole, persist: true });
            }
            this.filterOpen = false;
        },
        selectDomain(domain) {
            if (this.domain === domain) return;
            this.domain = domain;
            this.category = "";
        },
        onSearchInput() {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => {
                this.applySearch();
            }, 420);
        },
        applySearch() {
            clearTimeout(this.searchTimer);
            const clean = this.searchInput.trim();
            if (clean !== this.keyword) this.keyword = clean;
        },
        resetFilters() {
            this.searchInput = "";
            this.keyword = "";
            this.domain = "";
            this.category = "";
        },
        openStarDrawer(view) {
            this.$router.replace({ query: { ...this.$route.query, view } });
        },
        closeStarDrawer(view, visible) {
            if (visible || this.activeDrawer !== view) return;
            this.$router.replace({ query: { ...this.$route.query, view: undefined } });
        },
        loadCatalog() {
            if (!this.categories.length) this.loadCategories();
            this.loadList(this.page);
            if (this.total == null && !this.countRequest) this.loadTotal();
        },
        async loadCategories() {
            try {
                this.categories = await getExteriorCategories();
            } catch (error) {
                console.warn("Failed to load exterior categories", error);
            }
        },
        async loadTotal() {
            this.countRequest?.abort();
            const request = (this.countRequest = new AbortController());
            const { domain, category, school, keyword } = this.filters;
            try {
                const { total } = await getExteriorCount({ domain, category, school, keyword }, request.signal);
                if (!request.signal.aborted) this.total = total;
            } catch (error) {
                if (!request.signal.aborted) console.warn("Failed to load exterior count", error.message);
            } finally {
                if (this.countRequest === request) this.countRequest = null;
            }
        },
        scrollTopSmooth() {
            if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        },
        goFirstPage() {
            if (this.page <= 1 || this.loading) return;
            this.loadList(1);
            this.scrollTopSmooth();
        },
        goPrevPage() {
            if (this.page <= 1 || this.loading) return;
            this.loadList(this.page - 1);
            this.scrollTopSmooth();
        },
        goNextPage() {
            if (this.nextCursor === null || this.loading) return;
            const targetPage = this.page + 1;
            this.cursors[targetPage - 1] = this.nextCursor;
            this.loadList(targetPage);
            this.scrollTopSmooth();
        },
        async loadList(targetPage = 1) {
            const request = ++this.listRequest;
            this.listAbort?.abort();
            const controller = (this.listAbort = new AbortController());
            this.loading = true;
            this.listError = "";
            try {
                const cursor = this.cursors[targetPage - 1] || 0;
                const params = {
                    ...this.filters,
                    cursor: cursor > 0 ? cursor : undefined,
                };
                const { list, nextCursor } = await getExteriorsList(params, controller.signal);
                if (request !== this.listRequest || controller.signal.aborted) return;
                if (targetPage === 1 && nextCursor === null) {
                    this.total = list.length;
                }
                this.items = list;
                this.page = targetPage;
                this.nextCursor = nextCursor ?? null;
                if (nextCursor !== null && nextCursor !== undefined) {
                    this.cursors[targetPage] = nextCursor;
                }
            } catch (error) {
                if (request !== this.listRequest || controller.signal.aborted) return;
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
@import (reference) "~@/assets/css/design-system/_mixins.less";

.m-ext-list-page {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: @pvx-space-4;
}

.m-ext-toolbar {
    min-width: 0;
    padding: @pvx-space-3 @pvx-space-4;
    border-color: @pvx-border;
    box-shadow: @pvx-shadow-sm;
}

.m-ext-toolbar__top {
    display: flex;
    align-items: center;
    gap: @pvx-space-2;
}

.m-ext-domains {
    display: flex;
    min-width: 0;
    gap: @pvx-space-2;
    overflow-x: auto;
    scrollbar-width: thin;

    .u-domain-tab {
        flex: none;
        min-width: 72px;
        height: 40px;
        padding: 0 @pvx-space-3;
        border: 0;
        border-radius: @pvx-radius-pill;
        background: @pvx-surface-muted;
        color: @pvx-text-secondary;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;

        &:hover, &.is-active {
            color: white;
            background: #6b52ff;
        }
    }
}

.m-ext-subcats {
    display: flex;
    flex-wrap: nowrap;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: thin;
    gap: @pvx-space-2;

    .u-subcat-pill {
        .pvx-focus-ring();
        flex: none;
        white-space: nowrap;
        min-width: 76px;
        min-height: 34px;
        padding: 0 @pvx-space-3;
        border: 1px solid transparent;
        border-radius: @pvx-radius-pill;
        color: @pvx-text-secondary;
        background: @pvx-surface-muted;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;

        &:hover {
            color: @pvx-primary;
            background: @pvx-primary-soft;
        }

        &.is-active {
            color: @pvx-text-inverse;
            background: @pvx-primary;
        }
    }
}

.u-ext-filter {
    position: relative;
    display: grid;
    place-items: center;
    flex: none;
    width: 40px;
    height: 40px;
    border: 1px solid @pvx-border;
    border-radius: 12px;
    background: @pvx-surface;
    color: @pvx-text-muted;
    cursor: pointer;

    padding: 0;

    svg {
        width: 38px;
        height: 38px;
        path { fill: currentColor; }
    }

    &:hover, &:focus-visible, &.is-open, &.has-filter {
        color: @pvx-primary;
        border-color: @pvx-border-focus;
    }

    &.is-open, &.has-filter { background: @pvx-primary-soft; }
    &.has-filter::after {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: @pvx-primary;
        content: "";
    }
}

.m-ext-search-box {
    flex: 1 0 200px;
    min-width: 0;

    .el-input__wrapper {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 12px;
        background: @pvx-surface-muted;
        box-shadow: 0 0 0 1px @pvx-border-light inset;

        &.is-focus { box-shadow: 0 0 0 1px @pvx-border-focus inset; }
    }
}

@media (max-width: @ipad-y) {
    .m-ext-toolbar__top { flex-wrap: wrap; }
    .m-ext-domains { flex-basis: 100%; }
    .m-ext-search-box { flex: 1; }
}

.el-popover.el-popper.m-ext-filter-popover {
    padding: @pvx-space-5;
    border-radius: @pvx-radius-control;
    box-shadow: @pvx-shadow-hover;
}

.m-ext-filter-group {
    min-width: 0;
    margin: 0 0 @pvx-space-4;
    padding: 0;
    border: 0;

    legend {
        display: flex;
        align-items: center;
        gap: @pvx-space-1;
        margin-bottom: @pvx-space-2;
        color: @pvx-text-primary;
        font-size: 15px;
        font-weight: 700;
    }

    .el-radio-group { gap: @pvx-space-2; }
    .el-radio-button .el-radio-button__inner {
        min-width: 88px;
        height: 36px;
        padding: 0 @pvx-space-3;
        border: 1px solid transparent;
        border-radius: @pvx-radius-pill;
        color: @pvx-text-secondary;
        background: @pvx-surface-muted;
        box-shadow: none;
        line-height: 34px;
    }
    .el-radio-button:hover .el-radio-button__inner,
    .el-radio-button.is-active .el-radio-button__inner {
        color: white;
        background: @pvx-primary;
        border-color: @pvx-primary;
    }
    .u-role-hint {
        display: inline-grid;
        width: 24px;
        height: 24px;
        place-items: center;
        padding: 0;
        border: 0;
        border-radius: @pvx-radius-pill;
        color: @pvx-text-secondary;
        background: transparent;
        font-size: 14px;
        cursor: help;

        &:hover,
        &:focus-visible {
            color: @pvx-primary;
        }
    }
}

.m-ext-filter-actions, .m-ext-action-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.m-ext-filter-actions {
    padding-top: @pvx-space-2;
    border-top: 1px solid @pvx-border-light;

    .el-button {
        min-width: 72px;
        height: 34px;
        margin: 0;
        border-radius: @pvx-radius-small;
    }
}

.m-ext-ranking-panel {
    display: grid;
    min-width: 0;
    gap: @pvx-space-5;

    .m-ext-ranking-row-preview {
        --podium-card-height: clamp(156px, 13vw, 204px);
        --podium-inset: 4px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: @pvx-space-2;
        min-width: 0;
    }

    .u-ext-view-more {
        .pvx-focus-ring();
        display: grid;
        box-sizing: border-box;
        padding: 0;
        place-items: center;
        border: 1px solid @pvx-border;
        border-radius: @pvx-radius-card;
        background: @pvx-surface;
        color: @pvx-text-secondary;
        cursor: pointer;

        svg { width: 16px; }
        &:hover, &:focus-visible {
            border-color: @pvx-border-focus;
            color: @pvx-primary;
        }

        @media (hover: hover) and (prefers-reduced-motion: no-preference) {
            transition: transform 0.22s @pvx-ease-standard;

            &:hover {
                transform: translateY(-3px);
            }
        }
    }

    .u-ext-view-more--row {
        width: (@pvx-radius-card * 2);
        height: var(--podium-card-height);
        align-self: start;
        margin-top: var(--podium-inset);
    }

    .u-ext-view-more--heading {
        display: none;
    }

    .c-pvx-section-header { flex-wrap: wrap; }
    .c-pvx-section-header__action { max-width: 100%; }

    @media (max-width: @phone) {
        gap: @pvx-space-3;

        .c-pvx-section-header { row-gap: @pvx-space-1; }
        .c-pvx-section-header__action { display: contents; }
        .m-ext-ranking-row-preview { grid-template-columns: minmax(0, 1fr); }
        .u-ext-view-more--row { display: none; }
        .u-ext-view-more--heading {
            display: grid;
            width: 34px;
            height: 34px;
            flex: none;
            border-radius: @pvx-radius-control;
        }

        .m-ext-action-buttons {
            flex-basis: 100%;
            justify-content: flex-start;
            gap: 6px;

            .el-button {
                flex: 1 0 auto;
                height: 34px;
                padding: 0 6px;
                font-size: 13px;
                white-space: nowrap;
            }

            .el-icon + span { margin-left: 4px; }
        }
    }
}

.m-ext-gallery-panel {
    display: flex;
    min-width: 0;
    min-height: 360px;
    flex-direction: column;
    gap: @pvx-space-3;

    .c-pvx-section-header { flex-wrap: wrap; }
    .c-pvx-section-header__action { max-width: 100%; }
    .u-count-pill {
        display: inline-flex;
        min-height: 30px;
        align-items: center;
        padding: 0 @pvx-space-2;
        border: 1px solid @pvx-border;
        border-radius: @pvx-radius-pill;
        background: @pvx-surface-muted;
        color: @pvx-text-secondary;
        font-size: 12px;
        font-weight: 700;
    }
}

.m-ext-gallery-body {
    min-height: 280px;
}

.m-ext-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: @pvx-space-3;

    @media (max-width: @ipad) {
        grid-template-columns: repeat(auto-fill, minmax(172px, 1fr));
        gap: 14px;
    }

    @media (max-width: @phone) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }
}

.m-ext-footer {
    display: flex;
    justify-content: center;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid @pvx-border-light;
}

.m-ext-cursor-pager {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;

    .u-pager-status {
        min-width: 108px;
        text-align: center;
        font-size: 13px;
        color: @pvx-text-secondary;

        strong {
            color: @pvx-text-primary;
            font-weight: 700;
        }
    }
}

</style>
