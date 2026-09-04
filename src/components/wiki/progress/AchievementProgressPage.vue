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
    fetchAchievementWorkbenchDifficultyDimensions,
    fetchAchievementWorkbenchDifficultyMetrics,
    fetchAchievementWorkbenchMaps,
    fetchAchievementWorkbenchRecords,
    fetchAchievementWorkbenchRoles,
    fetchAchievementWorkbenchRoleState,
    fetchAchievementWorkbenchTags,
    searchAchievementWorkbenchRecords,
} from "@/service/achievementWorkbench";
import {
    applyAchievementWorkbenchEnrichment,
    getAchievementWorkbenchDimensionSort,
    resolveAchievementWorkbenchDimensions,
} from "@/utils/achievementWorkbench";
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
            pageSize: 15,
            categorySort: "progress-asc",
            summaryCollapsed: false,
            filters: createDefaultFilters(),
            dimensions: resolveAchievementWorkbenchDimensions([]),
            difficultyById: {},
            tagsById: {},
            dimensionSortLoading: false,
            enrichmentClient: "",
            enrichmentEpoch: 0,
            pageRequestId: 0,
            roleRequestId: 0,
            recordRequestId: 0,
            dimensionSortRequestId: 0,
        };
    },
    computed: {
        currentClient() {
            return this.$store.state.client === "origin" ? "origin" : "std";
        },
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
        baseFilteredAchievementIds() {
            return filterAchievementIds({
                metadata: this.metadata,
                completedIds: this.completedIds,
                categoryAchievementIds: this.selectedCategory?.achievementIds || null,
                tier: this.filters.tier,
                completion: this.filters.completion,
                sort: "default",
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
                difficultyById: this.difficultyById,
            });
        },
        visibleAchievementIds() {
            return paginateAchievementItems(this.filteredAchievementIds, this.page, this.pageSize);
        },
        searchMode() {
            return this.searchRecords !== null;
        },
        baseFilteredSearchRecords() {
            if (!this.searchMode) return [];
            return filterAchievementRecords({
                records: this.searchRecords,
                categoryId: this.filters.categoryId,
                categoryAchievementIds: this.selectedCategory?.achievementIds || null,
                tier: this.filters.tier,
                completion: this.filters.completion,
                sort: "default",
            });
        },
        metricCandidateIds() {
            return this.searchMode
                ? this.baseFilteredSearchRecords.map((record) => String(record.id))
                : this.baseFilteredAchievementIds;
        },
        filteredSearchRecords() {
            if (!this.searchMode) return [];
            return filterAchievementRecords({
                records: this.enrichRecords(this.searchRecords, { tagsById: {} }),
                categoryId: this.filters.categoryId,
                categoryAchievementIds: this.selectedCategory?.achievementIds || null,
                tier: this.filters.tier,
                completion: this.filters.completion,
                sort: this.filters.sort,
                difficultyById: this.difficultyById,
            });
        },
        visibleRecords() {
            const records = this.searchMode
                ? paginateAchievementItems(this.filteredSearchRecords, this.page, this.pageSize)
                : this.records;
            return this.enrichRecords(records);
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
    },
    watch: {
        currentClient(nextClient, previousClient) {
            if (!previousClient || nextClient === previousClient) return;
            this.resetProgressView();
            this.initializePage();
        },
    },
    mounted() {
        this.resetProgressView();
        this.initializePage();
    },
    beforeUnmount() {
        this.pageRequestId += 1;
        this.roleRequestId += 1;
        this.recordRequestId += 1;
        this.dimensionSortRequestId += 1;
        this.enrichmentEpoch += 1;
    },
    methods: {
        cancelDimensionSortRequest() {
            this.dimensionSortRequestId += 1;
            this.dimensionSortLoading = false;
        },
        resetProgressView() {
            this.roleRequestId += 1;
            this.recordRequestId += 1;
            this.cancelDimensionSortRequest();
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

            const requestId = ++this.pageRequestId;
            this.pageLoading = true;
            this.pageError = false;
            this.recordError = false;
            const client = this.currentClient;
            this.resetEnrichment(client);

            try {
                const [catalog, roles, maps, rawDimensions] = await Promise.all([
                    fetchAchievementWorkbenchCatalog(client),
                    fetchAchievementWorkbenchRoles(),
                    fetchAchievementWorkbenchMaps(client).catch(() => []),
                    fetchAchievementWorkbenchDifficultyDimensions().catch((error) => {
                        console.warn("Failed to load achievement difficulty dimensions:", error);
                        return [];
                    }),
                ]);
                if (requestId !== this.pageRequestId || client !== this.currentClient) return;
                this.menus = catalog.menus;
                this.metadata = catalog.metadata;
                this.roles = roles;
                this.maps = maps;
                this.dimensions = resolveAchievementWorkbenchDimensions(rawDimensions);

                const lastRoleId = String(localStorage.getItem("wiki_last_sync") || "");
                this.currentRoleId = roles.some((role) => role.id === lastRoleId) ? lastRoleId : roles[0]?.id || "";

                if (this.currentRoleId) await this.loadCurrentRole();
            } catch (error) {
                if (requestId !== this.pageRequestId || client !== this.currentClient) return;
                console.error("Failed to initialize achievement progress:", error);
                this.pageError = true;
            } finally {
                if (requestId === this.pageRequestId) this.pageLoading = false;
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
            this.cancelDimensionSortRequest();
            const requestId = ++this.roleRequestId;
            const roleId = this.currentRoleId;
            const client = this.currentClient;
            const keepSearchMode = this.searchMode;
            this.recordRequestId += 1;
            this.recordLoading = false;
            this.recordError = false;
            this.records = [];
            if (keepSearchMode) this.searchRecords = [];
            this.roleLoading = true;
            this.pageError = false;

            try {
                const state = await fetchAchievementWorkbenchRoleState(roleId);
                if (
                    requestId !== this.roleRequestId ||
                    roleId !== this.currentRoleId ||
                    client !== this.currentClient
                ) {
                    return;
                }
                this.completedIds = state.completedIds;
                this.synced = state.synced;
                this.$store.commit("SET_STATE", {
                    key: "achievements",
                    value: state.completedIds,
                    isSession: true,
                });

                if (this.searchMode) {
                    await this.runSearch();
                } else if (getAchievementWorkbenchDimensionSort(this.filters.sort)) {
                    await this.setListSort(this.filters.sort);
                } else {
                    await this.loadVisibleRecords();
                }
            } catch (error) {
                if (
                    requestId !== this.roleRequestId ||
                    roleId !== this.currentRoleId ||
                    client !== this.currentClient
                ) {
                    return;
                }
                console.error("Failed to load role achievements:", error);
                this.pageError = true;
            } finally {
                if (
                    requestId === this.roleRequestId &&
                    roleId === this.currentRoleId &&
                    client === this.currentClient
                ) {
                    this.roleLoading = false;
                }
            }
        },
        resetEnrichment(client) {
            this.enrichmentEpoch += 1;
            this.cancelDimensionSortRequest();
            this.enrichmentClient = client;
            this.difficultyById = {};
            this.tagsById = {};
        },
        normalizeEnrichmentIds(ids) {
            return [...new Set((ids || []).map((id) => String(id).trim()).filter(Boolean))];
        },
        getMissingEnrichmentIds(ids, source) {
            return this.normalizeEnrichmentIds(ids).filter(
                (id) => !Object.prototype.hasOwnProperty.call(source, id)
            );
        },
        isCurrentEnrichmentRequest(client, epoch) {
            return (
                client === this.currentClient &&
                client === this.enrichmentClient &&
                epoch === this.enrichmentEpoch
            );
        },
        isCurrentDimensionSortRequest({
            requestId,
            pageRequestId,
            recordRequestId,
            roleId,
            client,
            epoch,
            candidateIds,
        }) {
            return (
                requestId === this.dimensionSortRequestId &&
                pageRequestId === this.pageRequestId &&
                recordRequestId === this.recordRequestId &&
                roleId === this.currentRoleId &&
                this.isCurrentEnrichmentRequest(client, epoch) &&
                candidateIds.join("\u0000") === this.metricCandidateIds.join("\u0000")
            );
        },
        async loadDifficultyMetrics(ids, options = {}) {
            const client = options.client || this.currentClient;
            const epoch = options.epoch ?? this.enrichmentEpoch;
            const missingIds = this.getMissingEnrichmentIds(ids, this.difficultyById);
            if (!missingIds.length) return this.isCurrentEnrichmentRequest(client, epoch);
            if (!this.isCurrentEnrichmentRequest(client, epoch)) return false;

            try {
                const difficultyById = await fetchAchievementWorkbenchDifficultyMetrics(missingIds, { client });
                if (!this.isCurrentEnrichmentRequest(client, epoch)) return;
                this.difficultyById = {
                    ...this.difficultyById,
                    ...difficultyById,
                };
                return true;
            } catch (error) {
                if (this.isCurrentEnrichmentRequest(client, epoch)) {
                    console.warn("Failed to load achievement difficulty metrics:", error);
                }
                if (options.throwOnError) throw error;
                return false;
            }
        },
        async loadTags(ids, options = {}) {
            const client = options.client || this.currentClient;
            const epoch = options.epoch ?? this.enrichmentEpoch;
            const missingIds = this.getMissingEnrichmentIds(ids, this.tagsById);
            if (!missingIds.length || !this.isCurrentEnrichmentRequest(client, epoch)) return;

            try {
                const tagsById = await fetchAchievementWorkbenchTags(missingIds, { client });
                if (!this.isCurrentEnrichmentRequest(client, epoch)) return;
                this.tagsById = {
                    ...this.tagsById,
                    ...tagsById,
                };
            } catch (error) {
                if (this.isCurrentEnrichmentRequest(client, epoch)) {
                    console.warn("Failed to load achievement tags:", error);
                }
            }
        },
        loadVisibleEnrichment(ids) {
            const client = this.currentClient;
            const epoch = this.enrichmentEpoch;
            this.loadDifficultyMetrics(ids, { client, epoch });
            this.loadTags(ids, { client, epoch });
        },
        enrichRecords(records, context = {}) {
            const categoryNames = new Map(this.categoryProgress.map((category) => [category.id, category.name]));
            const mapNames = new Map(this.maps.map((map) => [map.id, map.name]));
            const enrichedRecords = applyAchievementWorkbenchEnrichment(records, {
                difficultyById: context.difficultyById ?? this.difficultyById,
                tagsById: context.tagsById ?? this.tagsById,
            });

            return enrichedRecords.map((record) => ({
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
            const client = this.currentClient;
            const epoch = this.enrichmentEpoch;
            this.recordLoading = true;
            this.recordError = false;

            try {
                const records = await fetchAchievementWorkbenchRecords({
                    ids,
                    metadata: this.metadata,
                    completedIds: this.completedIds,
                    client,
                    includeHidden: false,
                });
                if (
                    requestId !== this.recordRequestId ||
                    !this.isCurrentEnrichmentRequest(client, epoch)
                ) {
                    return;
                }
                const recordMap = new Map(this.enrichRecords(records).map((record) => [record.id, record]));
                this.records = ids.map((id) => recordMap.get(String(id))).filter(Boolean);
                this.loadVisibleEnrichment(ids);
            } catch (error) {
                if (
                    requestId !== this.recordRequestId ||
                    !this.isCurrentEnrichmentRequest(client, epoch)
                ) {
                    return;
                }
                console.error("Failed to load achievement records:", error);
                this.records = [];
                this.recordError = true;
            } finally {
                if (requestId === this.recordRequestId) this.recordLoading = false;
            }
        },
        async setListFilter(key, value) {
            this.cancelDimensionSortRequest();
            this.filters = {
                ...this.filters,
                [key]: value,
            };
            this.page = 1;
            if (getAchievementWorkbenchDimensionSort(this.filters.sort)) {
                await this.setListSort(this.filters.sort);
                return;
            }
            if (!this.searchMode) {
                await this.loadVisibleRecords();
                return;
            }
            await this.$nextTick();
            this.loadVisibleEnrichment(this.visibleRecords.map((record) => record.id));
        },
        async setListSort(sort) {
            if (this.dimensionSortLoading) return;
            const normalizedSort = String(sort || "default");
            const dimensionSort = getAchievementWorkbenchDimensionSort(normalizedSort);
            if (!dimensionSort) {
                await this.setListFilter("sort", normalizedSort);
                return;
            }

            const requestId = ++this.dimensionSortRequestId;
            const pageRequestId = this.pageRequestId;
            const recordRequestId = this.recordRequestId;
            const roleId = this.currentRoleId;
            const client = this.currentClient;
            const epoch = this.enrichmentEpoch;
            const candidateIds = [...this.metricCandidateIds];
            const requestContext = {
                requestId,
                pageRequestId,
                recordRequestId,
                roleId,
                client,
                epoch,
                candidateIds,
            };
            this.dimensionSortLoading = true;

            try {
                const loaded = await this.loadDifficultyMetrics(candidateIds, {
                    client,
                    epoch,
                    throwOnError: true,
                });
                if (!loaded || !this.isCurrentDimensionSortRequest(requestContext)) return;

                this.filters = {
                    ...this.filters,
                    sort: normalizedSort,
                };
                this.page = 1;
                if (!this.searchMode) {
                    await this.loadVisibleRecords();
                    return;
                }
                await this.$nextTick();
                this.loadVisibleEnrichment(this.visibleRecords.map((record) => record.id));
            } catch (error) {
                if (!this.isCurrentDimensionSortRequest(requestContext)) return;
                this.$message.error(this.$t("pages.wiki.difficultyDimensions.sortLoadFailed"));
            } finally {
                if (requestId === this.dimensionSortRequestId) this.dimensionSortLoading = false;
            }
        },
        updateSearchField(key, value) {
            this.filters = {
                ...this.filters,
                [key]: value,
            };
        },
        async runSearch(overrides = {}) {
            this.cancelDimensionSortRequest();
            this.filters = {
                ...this.filters,
                ...(overrides || {}),
            };
            this.page = 1;
            const keyword = String(this.filters.keyword || "").trim();
            const mapId = String(this.filters.mapId || "");
            const requestId = ++this.recordRequestId;

            if (!keyword && !mapId) {
                this.searchRecords = null;
                if (getAchievementWorkbenchDimensionSort(this.filters.sort)) {
                    await this.setListSort(this.filters.sort);
                } else {
                    await this.loadVisibleRecords();
                }
                return;
            }

            const client = this.currentClient;
            const epoch = this.enrichmentEpoch;
            this.recordLoading = true;
            this.recordError = false;

            try {
                const records = await searchAchievementWorkbenchRecords({
                    keyword,
                    mapId,
                    client,
                    metadata: this.metadata,
                    completedIds: this.completedIds,
                });
                if (
                    requestId !== this.recordRequestId ||
                    !this.isCurrentEnrichmentRequest(client, epoch)
                ) {
                    return;
                }
                this.searchRecords = this.enrichRecords(records);
                this.records = [];
                if (getAchievementWorkbenchDimensionSort(this.filters.sort)) {
                    await this.setListSort(this.filters.sort);
                    return;
                }
                await this.$nextTick();
                this.loadVisibleEnrichment(this.visibleRecords.map((record) => record.id));
            } catch (error) {
                if (
                    requestId !== this.recordRequestId ||
                    !this.isCurrentEnrichmentRequest(client, epoch)
                ) {
                    return;
                }
                console.error("Failed to search achievements:", error);
                this.searchRecords = [];
                this.recordError = true;
            } finally {
                if (requestId === this.recordRequestId) this.recordLoading = false;
            }
        },
        async resetListFilters() {
            this.cancelDimensionSortRequest();
            this.filters = createDefaultFilters();
            this.searchRecords = null;
            this.page = 1;
            await this.loadVisibleRecords();
        },
        async changePage(page) {
            this.page = Number(page) || 1;
            if (!this.searchMode) {
                await this.loadVisibleRecords();
                return;
            }
            await this.$nextTick();
            this.loadVisibleEnrichment(this.visibleRecords.map((record) => record.id));
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

        <div v-else class="m-progress-page-content">
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
                    :dimensions="dimensions"
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
                            :dimensions="dimensions"
                            :sort-loading="dimensionSortLoading"
                            :loading="recordLoading || dimensionSortLoading"
                            :show-category="false"
                            @update:tier="setListFilter('tier', $event)"
                            @update:completion="setListFilter('completion', $event)"
                            @update:map-id="updateSearchField('mapId', $event)"
                            @update:sort="setListSort"
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
    min-width: 0;
    grid-template-columns: minmax(300px, 0.72fr) minmax(520px, 1.28fr);
    align-items: start;
    gap: 12px;
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
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
