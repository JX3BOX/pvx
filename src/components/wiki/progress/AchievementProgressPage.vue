<script>
import User from "@jx3box/jx3box-common/js/user";
import { Loading, UserFilled, WarningFilled } from "@element-plus/icons-vue";
import AchievementCategoryBoard from "@/components/wiki/progress/AchievementCategoryBoard.vue";
import AchievementProgressFilters from "@/components/wiki/progress/AchievementProgressFilters.vue";
import AchievementProgressList from "@/components/wiki/progress/AchievementProgressList.vue";
import AchievementProgressSummary from "@/components/wiki/progress/AchievementProgressSummary.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import {
    fetchAchievementWorkbenchCatalog,
    fetchAchievementWorkbenchMaps,
    fetchAchievementWorkbenchRecords,
    fetchAchievementWorkbenchRoles,
    fetchAchievementWorkbenchRoleState,
    searchAchievementWorkbenchRecords,
} from "@/service/achievementWorkbench";
import {
    buildAchievementCategoryProgress,
    buildAchievementOverallProgress,
    buildAchievementTierProgress,
    filterAchievementIds,
    filterAchievementRecords,
    paginateAchievementItems,
} from "@/utils/achievementProgress";
import { __Links } from "@/utils/config";

const createDefaultFilters = () => ({
    categoryId: "all",
    tier: "normal",
    completion: "all",
    mapId: "",
    sort: "default",
    keyword: "",
});

export default {
    name: "AchievementProgressPage",
    components: {
        AchievementCategoryBoard,
        AchievementProgressFilters,
        AchievementProgressList,
        AchievementProgressSummary,
        Loading,
        PvxActionButton,
        PvxEmptyState,
        PvxSurface,
        UserFilled,
        WarningFilled,
    },
    data() {
        return {
            isLogin: User.isLogin(),
            pageLoading: User.isLogin(),
            pageError: false,
            roleLoading: false,
            recordLoading: false,
            recordError: false,
            menus: {},
            metadata: {},
            roles: [],
            maps: [],
            currentRoleId: "",
            completedIds: [],
            synced: false,
            records: [],
            searchRecords: null,
            page: 1,
            pageSize: 20,
            categorySort: "progress-asc",
            summaryCollapsed: false,
            filters: createDefaultFilters(),
            roleRequestId: 0,
            recordRequestId: 0,
        };
    },
    computed: {
        loginUrl() {
            return __Links.account.login + "?redirect=" + encodeURIComponent(location.href);
        },
        currentRole() {
            return this.roles.find((role) => role.id === this.currentRoleId) || null;
        },
        overallProgress() {
            return buildAchievementOverallProgress(this.metadata, this.completedIds);
        },
        tierProgress() {
            return buildAchievementTierProgress(this.metadata, this.completedIds);
        },
        categoryProgress() {
            return buildAchievementCategoryProgress({
                menus: this.menus,
                metadata: this.metadata,
                completedIds: this.completedIds,
            });
        },
        sortedCategoryProgress() {
            const categories = [...this.categoryProgress];
            const progressValue = (item) => item.pointProgress ?? Number.POSITIVE_INFINITY;

            if (this.categorySort === "progress-desc") {
                categories.sort((left, right) => progressValue(right) - progressValue(left));
            } else if (this.categorySort === "remaining-desc") {
                categories.sort((left, right) => right.remainingPoints - left.remainingPoints);
            } else {
                categories.sort((left, right) => progressValue(left) - progressValue(right));
            }

            return categories;
        },
        categories() {
            return [
                {
                    id: "all",
                    name: this.$t("pages.wiki.overview.ui.workbench.allCategories"),
                    children: [],
                    ...this.overallProgress,
                },
                ...this.sortedCategoryProgress,
            ];
        },
        selectedCategory() {
            if (this.filters.categoryId === "all") return null;
            return (
                this.categoryProgress.flatMap((category) => [category, ...(category.children || [])]).find(
                    (category) => category.id === this.filters.categoryId
                ) || null
            );
        },
        achievementListTitle() {
            if (!this.selectedCategory) return this.$t("pages.wiki.overview.ui.workbench.allCategories");
            if (!this.selectedCategory.parentId) return this.selectedCategory.name;

            const parentCategory = this.categoryProgress.find(
                (category) => category.id === this.selectedCategory.parentId
            );
            if (!parentCategory) return this.selectedCategory.name;

            return this.$t("pages.wiki.overview.ui.workbench.categoryPath", {
                primary: parentCategory.name,
                secondary: this.selectedCategory.name,
            });
        },
        filteredAchievementIds() {
            return filterAchievementIds({
                metadata: this.metadata,
                completedIds: this.completedIds,
                categoryAchievementIds: this.selectedCategory?.achievementIds || null,
                tier: this.filters.tier,
                completion: this.filters.completion,
                sort: this.filters.sort,
            });
        },
        visibleAchievementIds() {
            return paginateAchievementItems(this.filteredAchievementIds, this.page, this.pageSize);
        },
        searchMode() {
            return this.searchRecords !== null;
        },
        filteredSearchRecords() {
            if (!this.searchMode) return [];
            return filterAchievementRecords({
                records: this.searchRecords,
                categoryId: this.filters.categoryId,
                categoryAchievementIds: this.selectedCategory?.achievementIds || null,
                tier: this.filters.tier,
                completion: this.filters.completion,
                sort: this.filters.sort,
            });
        },
        visibleRecords() {
            if (!this.searchMode) return this.records;
            return paginateAchievementItems(this.filteredSearchRecords, this.page, this.pageSize);
        },
        resultTotal() {
            return this.searchMode ? this.filteredSearchRecords.length : this.filteredAchievementIds.length;
        },
        mapOptions() {
            return [...this.maps]
                .map((map) => ({
                    ...map,
                    label: map.regionName ? `${map.regionName} · ${map.name}` : map.name,
                }))
                .sort((left, right) => left.label.localeCompare(right.label));
        },
        futureSortsEnabled() {
            const records = this.searchMode ? this.searchRecords : this.records;
            return (records || []).some((record) => record.difficulty !== null || record.estimatedMinutes !== null);
        },
    },
    mounted() {
        this.resetProgressView();
        this.initializePage();
    },
    beforeUnmount() {
        this.roleRequestId += 1;
        this.recordRequestId += 1;
    },
    methods: {
        resetProgressView() {
            this.recordRequestId += 1;
            this.recordLoading = false;
            this.recordError = false;
            this.records = [];
            this.searchRecords = null;
            this.page = 1;
            this.filters = createDefaultFilters();
        },
        selectTier(tier) {
            if (tier === this.filters.tier) return undefined;
            return this.setListFilter("tier", tier);
        },
        async initializePage() {
            if (!this.isLogin) {
                this.pageLoading = false;
                return;
            }

            this.pageLoading = true;
            this.pageError = false;
            this.recordError = false;
            const client = this.$store.state.client || "std";

            try {
                const [catalog, roles, maps] = await Promise.all([
                    fetchAchievementWorkbenchCatalog(client),
                    fetchAchievementWorkbenchRoles(),
                    fetchAchievementWorkbenchMaps(client).catch(() => []),
                ]);
                this.menus = catalog.menus;
                this.metadata = catalog.metadata;
                this.roles = roles;
                this.maps = maps;

                const lastRoleId = String(localStorage.getItem("wiki_last_sync") || "");
                this.currentRoleId = roles.some((role) => role.id === lastRoleId) ? lastRoleId : roles[0]?.id || "";

                if (this.currentRoleId) await this.loadCurrentRole();
            } catch (error) {
                console.error("Failed to initialize achievement progress:", error);
                this.pageError = true;
            } finally {
                this.pageLoading = false;
            }
        },
        async selectRole(roleId) {
            if (!roleId || roleId === this.currentRoleId || this.roleLoading) return;
            this.currentRoleId = roleId;
            localStorage.setItem("wiki_last_sync", roleId);
            this.page = 1;
            await this.loadCurrentRole();
        },
        async loadCurrentRole() {
            const requestId = ++this.roleRequestId;
            this.roleLoading = true;
            this.pageError = false;

            try {
                const state = await fetchAchievementWorkbenchRoleState(this.currentRoleId);
                if (requestId !== this.roleRequestId) return;
                this.completedIds = state.completedIds;
                this.synced = state.synced;
                this.$store.commit("SET_STATE", {
                    key: "achievements",
                    value: state.completedIds,
                    isSession: true,
                });

                if (this.searchMode) {
                    await this.runSearch();
                } else {
                    await this.loadVisibleRecords();
                }
            } catch (error) {
                if (requestId !== this.roleRequestId) return;
                console.error("Failed to load role achievements:", error);
                this.pageError = true;
            } finally {
                if (requestId === this.roleRequestId) this.roleLoading = false;
            }
        },
        enrichRecords(records) {
            const categoryNames = new Map(this.categoryProgress.map((category) => [category.id, category.name]));
            const mapNames = new Map(this.maps.map((map) => [map.id, map.name]));

            return records.map((record) => ({
                ...record,
                category: {
                    ...record.category,
                    name: record.category.name || categoryNames.get(String(record.category.id)) || null,
                },
                map: {
                    ...record.map,
                    name: record.map.name || mapNames.get(String(record.map.id)) || null,
                },
            }));
        },
        async loadVisibleRecords() {
            if (this.searchMode) return;
            const requestId = ++this.recordRequestId;
            const ids = this.visibleAchievementIds;
            this.recordLoading = true;
            this.recordError = false;

            try {
                const records = await fetchAchievementWorkbenchRecords({
                    ids,
                    metadata: this.metadata,
                    completedIds: this.completedIds,
                    client: this.$store.state.client || "std",
                    includeHidden: this.filters.tier === "hidden",
                });
                if (requestId !== this.recordRequestId) return;
                const recordMap = new Map(this.enrichRecords(records).map((record) => [record.id, record]));
                this.records = ids.map((id) => recordMap.get(String(id))).filter(Boolean);
            } catch (error) {
                if (requestId !== this.recordRequestId) return;
                console.error("Failed to load achievement records:", error);
                this.records = [];
                this.recordError = true;
            } finally {
                if (requestId === this.recordRequestId) this.recordLoading = false;
            }
        },
        async setListFilter(key, value) {
            this.filters = {
                ...this.filters,
                [key]: value,
            };
            this.page = 1;
            if (!this.searchMode) await this.loadVisibleRecords();
        },
        updateSearchField(key, value) {
            this.filters = {
                ...this.filters,
                [key]: value,
            };
        },
        async runSearch(overrides = {}) {
            this.filters = {
                ...this.filters,
                ...(overrides || {}),
            };
            this.page = 1;
            const keyword = String(this.filters.keyword || "").trim();
            const mapId = String(this.filters.mapId || "");

            if (!keyword && !mapId) {
                this.searchRecords = null;
                await this.loadVisibleRecords();
                return;
            }

            const requestId = ++this.recordRequestId;
            this.recordLoading = true;
            this.recordError = false;

            try {
                const records = await searchAchievementWorkbenchRecords({
                    keyword,
                    mapId,
                    client: this.$store.state.client || "std",
                    metadata: this.metadata,
                    completedIds: this.completedIds,
                });
                if (requestId !== this.recordRequestId) return;
                this.searchRecords = this.enrichRecords(records);
                this.records = [];
            } catch (error) {
                if (requestId !== this.recordRequestId) return;
                console.error("Failed to search achievements:", error);
                this.searchRecords = [];
                this.recordError = true;
            } finally {
                if (requestId === this.recordRequestId) this.recordLoading = false;
            }
        },
        async resetListFilters() {
            this.filters = createDefaultFilters();
            this.searchRecords = null;
            this.page = 1;
            await this.loadVisibleRecords();
        },
        async changePage(page) {
            this.page = Number(page) || 1;
            if (!this.searchMode) await this.loadVisibleRecords();
        },
        retryRecords() {
            return this.searchMode ? this.runSearch() : this.loadVisibleRecords();
        },
    },
};
</script>

<template>
    <div class="p-achievement-progress">
        <PvxSurface v-if="!isLogin" class="m-progress-page-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.overview.ui.loginRequired')"
                :description="$t('pages.wiki.overview.ui.loginDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton :href="loginUrl">{{ $t("pages.wiki.overview.ui.goLogin") }}</PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="pageError" class="m-progress-page-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.overview.ui.loadFailed')"
                :description="$t('pages.wiki.overview.ui.loadFailedDescription')"
            >
                <template #icon><WarningFilled /></template>
                <template #action>
                    <PvxActionButton @click="initializePage">{{ $t("pages.wiki.overview.ui.retry") }}</PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="pageLoading" class="m-progress-page-state is-loading" padding="none" v-loading="true">
            <PvxEmptyState
                :title="$t('pages.wiki.overview.ui.workbench.loadingTitle')"
                :description="$t('pages.wiki.overview.ui.workbench.loadingDescription')"
            >
                <template #icon><Loading /></template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="!currentRole" class="m-progress-page-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.overview.ui.noRole')"
                :description="$t('pages.wiki.overview.ui.noRoleDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton href="/team/role/bind">{{
                        $t("pages.wiki.overview.ui.bindRole")
                    }}</PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <div v-else class="m-progress-page-content" :class="{ 'is-summary-collapsed': summaryCollapsed }">
            <AchievementProgressSummary
                :collapsed="summaryCollapsed"
                :current-role="currentRole"
                :current-role-id="currentRoleId"
                :roles="roles"
                :overall="overallProgress"
                :tiers="tierProgress"
                :active-tier="filters.tier"
                :loading="roleLoading"
                :synced="synced"
                @select-role="selectRole"
                @select-tier="selectTier"
                @update:collapsed="summaryCollapsed = $event"
            />

            <div class="m-progress-browser-grid">
                <AchievementCategoryBoard
                    :categories="categories"
                    :compact-overview="summaryCollapsed"
                    :active-category-id="filters.categoryId"
                    :sort="categorySort"
                    @select-category="setListFilter('categoryId', $event)"
                    @update:sort="categorySort = $event"
                />
                <AchievementProgressList
                    :title="achievementListTitle"
                    :records="visibleRecords"
                    :total="resultTotal"
                    :page="page"
                    :page-size="pageSize"
                    :loading="recordLoading"
                    :error="recordError"
                    @page-change="changePage"
                    @retry="retryRecords"
                >
                    <template #filters>
                        <AchievementProgressFilters
                            embedded
                            :map-options="mapOptions"
                            :tier="filters.tier"
                            :completion="filters.completion"
                            :map-id="filters.mapId"
                            :sort="filters.sort"
                            :keyword="filters.keyword"
                            :future-sorts-enabled="futureSortsEnabled"
                            :loading="recordLoading"
                            :show-category="false"
                            @update:tier="setListFilter('tier', $event)"
                            @update:completion="setListFilter('completion', $event)"
                            @update:map-id="updateSearchField('mapId', $event)"
                            @update:sort="setListFilter('sort', $event)"
                            @update:keyword="updateSearchField('keyword', $event)"
                            @submit-search="runSearch"
                            @reset-filters="resetListFilters"
                        />
                    </template>
                </AchievementProgressList>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.p-achievement-progress {
    width: 100%;
    min-width: 0;
}

.m-progress-page-content {
    display: grid;
    min-width: 0;
    gap: 12px;
}

.m-progress-browser-grid {
    display: grid;
    height: 752px;
    min-width: 0;
    grid-template-columns: minmax(300px, 0.72fr) minmax(520px, 1.28fr);
    align-items: stretch;
    gap: 12px;
}

.m-progress-page-content.is-summary-collapsed .m-progress-browser-grid {
    height: clamp(480px, calc(100vh - 244px), 820px);
}

.m-progress-page-state {
    min-height: 520px;
    border: 1px solid rgba(70, 74, 66, 0.13);
    border-radius: 14px;
    background: rgba(255, 254, 250, 0.88);

    &.is-loading :deep(.el-loading-mask) {
        background: rgba(255, 254, 250, 0.45);
    }
}

@media (max-width: 1060px) {
    .m-progress-browser-grid {
        height: auto;
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
