<!-- 外观大全列表页：精简真实外观分类、按用户角色自动匹配默认封面体型、支持一键切体型与俗称检索。 -->
<template>
    <div class="m-ext-list-page">
        <PvxSurface padding="medium" class="m-ext-toolbar">
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

            <div
                v-if="subcategories.length > 1"
                class="m-ext-subcats"
                role="group"
                :aria-label="$t('exterior.subcategory')"
            >
                <button
                    type="button"
                    class="u-subcat-pill"
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
                    class="u-subcat-pill"
                    :class="{ 'is-active': category === option.key }"
                    :aria-pressed="category === option.key"
                    @click="selectCategory(option.key)"
                >
                    {{ option.name }}
                </button>
            </div>
        </PvxSurface>

        <PvxSurface padding="medium" class="m-ext-gallery-panel">
            <div class="m-ext-gallery-head">
                <div class="m-ext-gallery-title">
                    <h2>{{ resultTitle }}</h2>
                    <span v-if="total != null" class="u-count-pill">
                        {{ $t("exterior.resultCount", { count: total.toLocaleString("zh-CN") }) }}
                    </span>
                </div>

                <div class="m-ext-gallery-actions">
                    <div class="m-body-switcher" role="group" :aria-label="$t('exterior.bodyType')">
                        <span class="u-switcher-label">{{ $t("exterior.bodyType") }}</span>
                        <div class="m-body-pills">
                            <button
                                v-for="body in bodyTypes"
                                :key="body.id"
                                type="button"
                                class="u-body-pill"
                                :class="{ 'is-active': selectedRole === body.id }"
                                :aria-pressed="selectedRole === body.id"
                                @click="selectRole(body.id)"
                            >
                                {{ body.label }}
                            </button>
                        </div>
                        <el-tooltip v-if="characterRoleHint" :content="characterRoleHint" placement="top">
                            <span class="u-role-sync-dot" aria-hidden="true" />
                        </el-tooltip>
                    </div>

                    <div class="m-action-buttons">
                        <el-button
                            v-for="drawer in starDrawers"
                            :key="drawer"
                            class="!m-0"
                            plain
                            round
                            aria-haspopup="dialog"
                            @click="openStarDrawer(drawer)"
                        >
                            <template #icon>
                                <Star v-if="drawer === 'favorites'" aria-hidden="true" />
                                <Trophy v-else aria-hidden="true" />
                            </template>
                            {{ $t(`exterior.star.${drawer}`) }}
                        </el-button>
                        <el-button class="!m-0" plain round @click="$router.push({ name: 'exterior-house' })">
                            <template #icon>
                                <Box aria-hidden="true" />
                            </template>
                            {{ $t("exterior.warehouse.title") }}
                        </el-button>
                        <el-button
                            type="primary"
                            class="!m-0 u-studio-cta"
                            round
                            @click="$router.push({ name: 'exterior-studio', query: { role: selectedRole } })"
                        >
                            <template #icon>
                                <MagicStick aria-hidden="true" />
                            </template>
                            {{ $t("exterior.studio.title") }}
                        </el-button>
                    </div>
                </div>
            </div>

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
                        <el-button @click="resetFilters">查看全部外观</el-button>
                    </template>
                </PvxEmptyState>

                <div v-if="items.length && (page > 1 || nextCursor !== null)" class="m-ext-footer">
                    <nav class="m-ext-cursor-pager" aria-label="外观列表分页">
                        <el-button v-if="page > 2" round :disabled="loading" @click="goFirstPage"> 首页 </el-button>
                        <el-button round :disabled="page <= 1 || loading" @click="goPrevPage"> 上一页 </el-button>
                        <span class="u-pager-status">
                            第 <strong>{{ page }}</strong>
                            <template v-if="pageCount"> / {{ pageCount }}</template> 页
                        </span>
                        <el-button
                            type="primary"
                            plain
                            round
                            :disabled="nextCursor === null || loading"
                            @click="goNextPage"
                        >
                            下一页
                        </el-button>
                    </nav>
                </div>
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
import { Box, MagicStick, Search, Star, Trophy } from "@element-plus/icons-vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import ExteriorCard from "@/components/exterior/ExteriorCard.vue";
import ExteriorStarList from "@/components/exterior/ExteriorStarList.vue";
import {
    BODY_LABEL_MAP,
    BODY_TYPES,
    DOMAIN_META,
    HIDDEN_LIST_DOMAINS,
    VISIBLE_LIST_DOMAINS,
} from "@/components/exterior/meta";
import { getExteriorCategories, getExteriorCount, getExteriorsList } from "@/service/exterior";

const PAGE_SIZE = 30;

export default {
    name: "ExteriorList",
    components: {
        Box,
        MagicStick,
        Search,
        Star,
        Trophy,
        PvxSurface,
        PvxEmptyState,
        ExteriorCard,
        ExteriorStarList,
    },
    data() {
        return {
            pageSize: PAGE_SIZE,
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
        selectedRole() {
            return this.$store.state.preferredRole || 2;
        },
        characterRoleHint() {
            const { roleSource, characterRole } = this.$store.state;
            if (roleSource !== "character" || !characterRole?.role) return "";
            const bodyLabel = BODY_LABEL_MAP[characterRole.role] || "";
            return characterRole.name
                ? `已按你的默认角色「${characterRole.name}」自动展示${bodyLabel}封面`
                : `已按你的默认角色体型自动展示${bodyLabel}封面`;
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
                name: DOMAIN_META[domain]?.label || (categories.length === 1 ? categories[0].name : domain),
            })).sort((a, b) => orderIndex(a.domain) - orderIndex(b.domain));
        },
        domainTabs() {
            const groups = this.categoryGroups.length
                ? this.categoryGroups
                : VISIBLE_LIST_DOMAINS.map((domain) => ({
                      domain,
                      name: DOMAIN_META[domain]?.label || domain,
                  }));
            return [{ domain: "", name: this.$t("exterior.allTypes") }, ...groups];
        },
        selectedGroup() {
            return this.categoryGroups.find((group) => group.domain === this.domain);
        },
        subcategories() {
            return this.selectedGroup?.categories || [];
        },
        resultTitle() {
            if (this.keyword) return `“${this.keyword}”的搜索结果`;
            const selected = this.subcategories.find(({ key }) => key === this.category);
            return selected?.name || this.selectedGroup?.name || this.$t("pages.index.ui.menus.exterior");
        },
        pageCount() {
            if (typeof this.total !== "number" || this.total < 0) return null;
            return Math.max(1, Math.ceil(this.total / this.pageSize));
        },
        filters() {
            const category = this.category || (this.subcategories.length === 1 ? this.subcategories[0].key : undefined);
            return {
                limit: this.pageSize,
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
    beforeUnmount() {
        clearTimeout(this.searchTimer);
        this.listRequest++;
        this.listAbort?.abort();
        this.countRequest?.abort();
    },
    methods: {
        selectRole(role) {
            this.$store.commit("setPreferredRole", { role, persist: true });
        },
        selectDomain(domain) {
            if (this.domain === domain) return;
            this.domain = domain;
            this.category = "";
        },
        selectCategory(category) {
            this.category = category;
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
            const { domain, category, keyword } = this.filters;
            try {
                const { total } = await getExteriorCount({ domain, category, keyword }, request.signal);
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

.m-ext-list-page {
    display: grid;
    min-width: 0;
    gap: 18px;
}

.m-ext-toolbar {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.m-ext-toolbar__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.m-ext-domains {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;

    .u-domain-tab {
        padding: 7px 15px;
        border: 1px solid transparent;
        border-radius: @pvx-radius-pill;
        background: @pvx-surface-muted;
        color: @pvx-text-regular;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.3;
        cursor: pointer;
        transition: all 0.18s @pvx-ease-standard;

        &:hover {
            color: @pvx-primary-hover;
            background: @pvx-primary-soft;
        }

        &.is-active {
            color: @pvx-text-inverse;
            background: @pvx-primary;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(91, 92, 245, 0.25);
        }
    }
}

.m-ext-search-box {
    flex: 0 1 320px;
    width: 320px;
    min-width: 220px;

    @media (max-width: @ipad) {
        flex: 1 1 100%;
        width: 100%;
    }

    .u-search-input {
        width: 100%;

        .el-input__wrapper {
            border-radius: @pvx-radius-pill;
            padding-inline: 14px;
            background: @pvx-surface-muted;
            box-shadow: 0 0 0 1px @pvx-border inset;

            &.is-focus {
                background: @pvx-surface;
                box-shadow: 0 0 0 1.5px @pvx-primary inset, @pvx-shadow-focus;
            }
        }
    }
}

.m-ext-subcats {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid @pvx-border-light;

    .u-subcat-pill {
        padding: 5px 12px;
        border: 1px solid @pvx-border;
        border-radius: @pvx-radius-pill;
        background: @pvx-surface;
        color: @pvx-text-secondary;
        font-size: 13px;
        line-height: 1.3;
        cursor: pointer;
        transition: all 0.16s;

        &:hover {
            border-color: @pvx-border-focus;
            color: @pvx-primary-hover;
        }

        &.is-active {
            border-color: @pvx-primary;
            color: @pvx-primary-hover;
            background: @pvx-primary-soft;
            font-weight: 600;
        }
    }
}

.m-ext-gallery-panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 360px;
}

.m-ext-gallery-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid @pvx-border-light;
}

.m-ext-gallery-title {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;

    h2 {
        margin: 0;
        font-size: 19px;
        font-weight: 700;
        color: @pvx-text-primary;
    }

    .u-count-pill {
        font-size: 13px;
        color: @pvx-text-secondary;
    }
}

.m-ext-gallery-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.m-body-switcher {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 6px 4px 12px;
    border-radius: @pvx-radius-pill;
    background: @pvx-surface-muted;
    border: 1px solid @pvx-border;

    .u-switcher-label {
        font-size: 12px;
        font-weight: 600;
        color: @pvx-text-secondary;
        white-space: nowrap;
    }

    .m-body-pills {
        display: inline-flex;
        align-items: center;
        gap: 2px;
    }

    .u-body-pill {
        padding: 4px 11px;
        border: none;
        border-radius: @pvx-radius-pill;
        background: transparent;
        color: @pvx-text-regular;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.3;
        cursor: pointer;
        transition: all 0.16s;

        &:hover {
            color: @pvx-primary-hover;
        }

        &.is-active {
            background: @pvx-primary;
            color: @pvx-text-inverse;
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(91, 92, 245, 0.25);
        }
    }

    .u-role-sync-dot {
        width: 7px;
        height: 7px;
        margin-right: 4px;
        border-radius: 50%;
        background: #10b981;
        flex-shrink: 0;
    }
}

.m-action-buttons {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .u-studio-cta {
        border: none;
        background: linear-gradient(135deg, #5b5cf5 0%, #8b5cf6 100%);
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(91, 92, 245, 0.28);

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(91, 92, 245, 0.36);
        }
    }
}

.m-ext-gallery-body {
    min-height: 280px;
}

.m-ext-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 18px;

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
</style>
