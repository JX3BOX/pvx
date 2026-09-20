<script>
import AchievementHiddenList from "@/components/wiki/progress/AchievementHiddenList.vue";
import AchievementCompareCategoryTree from "@/components/wiki/compare/AchievementCompareCategoryTree.vue";
import User from "@jx3box/jx3box-common/js/user";
import shorterColumnSticky from "@/directives/shorter-column-sticky";
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
    fetchAchievementWorkbenchHiddenRecords,
    fetchAchievementWorkbenchHiddenIndex,
    fetchAchievementWorkbenchDifficultyDimensions,
    fetchAchievementWorkbenchDifficultyMetrics,
    fetchAchievementWorkbenchHiddenTagIds,
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
    buildAchievementSeriesCounts,
    buildAchievementHiddenCategoryProgress,
    searchHiddenAchievementRecords,
    buildAchievementOverallProgress,
    buildAchievementTierProgress,
    filterAchievementIds,
    filterAchievementRecords,
    paginateAchievementItems,
} from "@/utils/achievementProgress";
import { __Links } from "@/utils/config";
import { buildAchievementSchoolEligibilityContext } from "@/utils/achievementSchoolEligibility";

// Public totals remain available without presenting unknown role progress as zero.
const withoutRoleProgress = (item) => ({
    ...item,
    completedCount: null,
    completedPoints: null,
    pointProgress: null,
    remainingCount: null,
    remainingPoints: null,
    remainingAvailablePoints: null,
    ...(item.children ? { children: item.children.map(withoutRoleProgress) } : {}),
});

const createDefaultFilters = (hidden = false) => ({
    categoryId: "all",
    tier: "normal",
    completion: "all",
    completableOnly: hidden,
    mapId: "",
    sort: "default",
    keyword: "",
});

const HIDDEN_COMPLETABLE_TAG_ID = 44;

export default {
    name: "AchievementProgressPage",
    directives: { shorterColumnSticky },
    props: {
        hidden: { type: Boolean, default: false },
        snapshot: { type: Object, default: null },
    },
    components: {
        AchievementHiddenList,
        AchievementCompareCategoryTree,
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
            pageLoading: true,
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
            syncedAt: null,
            hiddenIndex: [],
            completableHiddenIds: [],
            completableFilterLoading: false,
            completableFilterAvailable: true,
            records: [],
            searchRecords: null,
            page: 1,
            pageSize: 20,
            categorySort: "progress-asc",
            summaryCollapsed: false,
            filters: { ...createDefaultFilters(this.hidden), tier: this.hidden ? "hidden" : "normal" },
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
        isGuest() {
            return !this.isLogin && !this.snapshot;
        },
        listMetadata() {
            if (!this.hidden) return this.metadata;
            return Object.fromEntries(Object.entries(this.metadata).filter(([, item]) => item.visible === false && Number(item.general) === 1 && Number(item.point) > 0));
        },
        currentClient() {
            if (this.snapshot) return "std";
            return this.$store.state.client === "origin" ? "origin" : "std";
        },
        loginUrl() {
            return __Links.account.login + "?redirect=" + encodeURIComponent(location.href);
        },
        currentRole() {
            if (this.snapshot) return this.snapshot.role;
            return this.roles.find((role) => role.id === this.currentRoleId) || null;
        },
        schoolEligibility() {
            return buildAchievementSchoolEligibilityContext({
                menus: this.menus,
                roleSchool: this.currentRole?.school,
            });
        },
        overallProgress() {
            const progress = buildAchievementOverallProgress(this.metadata, this.completedIds, this.schoolEligibility);
            return this.isGuest ? withoutRoleProgress(progress) : progress;
        },
        tierProgress() {
            const progress = buildAchievementTierProgress(this.metadata, this.completedIds);
            return this.isGuest ? progress.map(withoutRoleProgress) : progress;
        },
        categoryMetadata() {
            if (this.hidden) return this.listMetadata;
            const general = this.filters.tier === "wujia" ? 2 : 1;
            return Object.fromEntries(Object.entries(this.metadata).filter(([, item]) =>
                Number(item.general) === general && item.visible === true
            ));
        },
        categoryProgress() {
            if (this.hidden) return buildAchievementHiddenCategoryProgress({
                menus: this.menus, records: this.hiddenIndex, metadata: this.listMetadata,
                completedIds: this.completedIds, uncategorizedName: this.$t("achievementAppearance.uncategorized"),
            });
            return buildAchievementCategoryProgress({
                menus: this.menus,
                metadata: this.categoryMetadata,
                allMenus: true,
                completedIds: this.completedIds,
                schoolEligibility: this.schoolEligibility,
            });
        },
        sortedCategoryProgress() {
            const categories = this.isGuest
                ? this.categoryProgress.map(withoutRoleProgress)
                : [...this.categoryProgress];
            const progressValue = (item) => item.pointProgress ?? Number.POSITIVE_INFINITY;

            if (this.categorySort === "progress-desc") {
                categories.sort((left, right) => progressValue(right) - progressValue(left));
            } else if (this.categorySort === "remaining-desc") {
                categories.sort((left, right) => right.remainingAvailablePoints - left.remainingAvailablePoints);
            } else if (this.categorySort === "progress-asc") {
                categories.sort((left, right) => progressValue(left) - progressValue(right));
            }

            return categories;
        },
        categories() {
            const progress = buildAchievementOverallProgress(
                this.categoryMetadata, this.completedIds, this.hidden ? null : this.schoolEligibility
            );
            if (!this.hidden) Object.assign(progress, buildAchievementSeriesCounts(this.menus, this.categoryMetadata, this.completedIds));
            return [
                {
                    id: "all",
                    name: this.$t("pages.wiki.overview.ui.workbench.allCategories"),
                    children: [],
                    ...(this.isGuest ? withoutRoleProgress(progress) : progress),
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
                metadata: this.listMetadata,
                completedIds: this.completedIds,
                categoryAchievementIds: this.selectedCategory?.achievementIds || null,
                tier: this.filters.tier,
                completion: this.filters.completion,
                sort: "default",
                includedAchievementIds: this.includedAchievementIds,
            });
        },
        includedAchievementIds() {
            if (!this.hidden || !this.filters.completableOnly) return null;
            return this.completableHiddenIds;
        },
        filteredAchievementIds() {
            return filterAchievementIds({
                metadata: this.listMetadata,
                completedIds: this.completedIds,
                categoryAchievementIds: this.selectedCategory?.achievementIds || null,
                tier: this.filters.tier,
                completion: this.filters.completion,
                sort: this.filters.sort,
                difficultyById: this.difficultyById,
                includedAchievementIds: this.includedAchievementIds,
            });
        },
        visibleAchievementIds() {
            const ids = this.hidden && this.searchMode
                ? this.filteredSearchRecords.map((record) => record.id)
                : this.filteredAchievementIds;
            return paginateAchievementItems(ids, this.page, this.pageSize);
        },
        searchMode() {
            return this.searchRecords !== null;
        },
        baseFilteredSearchRecords() {
            if (!this.searchMode) return [];
            return filterAchievementRecords({
                records: this.hidden ? this.enrichRecords(this.searchRecords) : this.searchRecords,
                metadata: this.listMetadata,
                categoryId: this.filters.categoryId,
                categoryAchievementIds: this.selectedCategory?.achievementIds || null,
                tier: this.filters.tier,
                completion: this.filters.completion,
                sort: "default",
                includedAchievementIds: this.includedAchievementIds,
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
                metadata: this.listMetadata,
                categoryId: this.filters.categoryId,
                categoryAchievementIds: this.selectedCategory?.achievementIds || null,
                tier: this.filters.tier,
                completion: this.filters.completion,
                sort: this.filters.sort,
                difficultyById: this.difficultyById,
                includedAchievementIds: this.includedAchievementIds,
            });
        },
        visibleRecords() {
            const records = this.searchMode && !this.hidden
                ? paginateAchievementItems(this.filteredSearchRecords, this.page, this.pageSize)
                : this.records;
            return this.enrichRecords(records);
        },
        hiddenCategories() {
            return this.categoryProgress.map((category) => ({
                ...category,
                count: category.totalCount,
                children: category.children.map((child) => ({ ...child, count: child.totalCount })),
            }));
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
        snapshot() {
            this.resetProgressView();
            this.initializePage();
        },
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
            this.hiddenIndex = [];
            this.completableHiddenIds = [];
            this.completableFilterLoading = false;
            this.completableFilterAvailable = true;
            this.searchRecords = null;
            this.page = 1;
            this.filters = { ...createDefaultFilters(this.hidden), tier: this.hidden ? "hidden" : "normal" };
        },
        selectTier(tier) {
            if (tier === this.filters.tier) return undefined;
            return this.setListFilter("tier", tier);
        },
        async initializePage() {
            if (this.snapshot) {
                this.pageRequestId += 1;
                this.resetProgressView();
                this.resetEnrichment(this.currentClient);
                this.menus = this.snapshot.catalog.menus;
                this.metadata = this.snapshot.catalog.metadata;
                this.maps = this.snapshot.maps;
                this.dimensions = this.snapshot.dimensions;
                this.roles = [];
                this.currentRoleId = String(this.snapshot.role?.id || "");
                this.completedIds = this.snapshot.completedIds;
                this.synced = this.snapshot.synced;
                this.syncedAt = this.snapshot.syncedAt;
                this.pageLoading = false;
                this.pageError = false;
                await this.loadVisibleRecords();
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
                    this.isLogin ? fetchAchievementWorkbenchRoles() : Promise.resolve([]),
                    fetchAchievementWorkbenchMaps(client).catch(() => []),
                    (this.hidden ? Promise.resolve([]) : fetchAchievementWorkbenchDifficultyDimensions()).catch((error) => {
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

                if (this.hidden) {
                    const records = await fetchAchievementWorkbenchHiddenIndex(client);
                    if (requestId !== this.pageRequestId || client !== this.currentClient) return;
                    this.hiddenIndex = records;
                    await this.loadHiddenCompletableIds(records, requestId, client);
                    if (requestId !== this.pageRequestId || client !== this.currentClient) return;
                }

                const lastRoleId = String(localStorage.getItem("wiki_last_sync") || "");
                this.currentRoleId = roles.some((role) => role.id === lastRoleId) ? lastRoleId : roles[0]?.id || "";

                if (this.currentRoleId) await this.loadCurrentRole();
                else if (this.isGuest) {
                    this.completedIds = [];
                    this.synced = false;
                    this.syncedAt = null;
                    await this.loadVisibleRecords();
                }
            } catch (error) {
                if (requestId !== this.pageRequestId || client !== this.currentClient) return;
                console.error("Failed to initialize achievement progress:", error);
                this.pageError = true;
            } finally {
                if (requestId === this.pageRequestId) this.pageLoading = false;
            }
        },
        requireLogin() {
            this.$message.warning(this.$t("pages.wiki.overview.ui.loginRequired"));
        },
        async loadHiddenCompletableIds(records, pageRequestId, client) {
            this.completableFilterLoading = true;
            this.completableFilterAvailable = true;
            try {
                const ids = await fetchAchievementWorkbenchHiddenTagIds({
                    ids: records.map((record) => record.id),
                    tagId: HIDDEN_COMPLETABLE_TAG_ID,
                    client,
                });
                if (pageRequestId !== this.pageRequestId || client !== this.currentClient) return;
                this.completableHiddenIds = ids;
            } catch (error) {
                if (pageRequestId !== this.pageRequestId || client !== this.currentClient) return;
                console.warn("Failed to load completable hidden achievements:", error);
                this.completableHiddenIds = [];
                this.completableFilterAvailable = false;
                this.filters = { ...this.filters, completableOnly: false };
            } finally {
                if (pageRequestId === this.pageRequestId && client === this.currentClient) {
                    this.completableFilterLoading = false;
                }
            }
        },
        async selectRole(roleId) {
            if (this.isGuest) return this.requireLogin();
            if (this.snapshot) return;
            if (!roleId || roleId === this.currentRoleId || this.roleLoading) return;
            this.currentRoleId = roleId;
            localStorage.setItem("wiki_last_sync", roleId);
            this.page = 1;
            await this.loadCurrentRole();
        },
        async loadCurrentRole() {
            if (this.snapshot || this.isGuest || !this.currentRoleId) return;
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
            this.syncedAt = null;
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
                this.syncedAt = state.updatedAt;
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
            if (this.hidden) return;
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

            const completed = new Set(this.completedIds.map(String));
            return enrichedRecords.map((record) => ({
                ...record,
                ...(this.isGuest ? { completed: null } : this.hidden ? { completed: completed.has(String(record.id)) } : {}),
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
            if (this.searchMode && !this.hidden) return;
            const requestId = ++this.recordRequestId;
            const ids = this.visibleAchievementIds;
            const client = this.currentClient;
            const epoch = this.enrichmentEpoch;
            this.recordLoading = true;
            this.recordError = false;

            try {
                const records = this.hidden
                    ? await fetchAchievementWorkbenchHiddenRecords({ ids, metadata: this.metadata, completedIds: this.completedIds, client })
                    : await fetchAchievementWorkbenchRecords({
                    ids,
                    metadata: this.metadata,
                    completedIds: this.completedIds,
                    client,
                    includeHidden: this.hidden,
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
        setCategorySort(sort) {
            if (this.isGuest) return this.requireLogin();
            this.categorySort = sort;
        },
        async setListFilter(key, value) {
            if (this.isGuest && key === "completion" && value !== "all") return this.requireLogin();
            this.cancelDimensionSortRequest();
            this.filters = {
                ...this.filters,
                [key]: value,
                ...(key === "tier" ? { categoryId: "all" } : {}),
            };
            this.page = 1;
            if (key === "tier" && (this.searchMode || this.recordLoading) && !this.hidden) {
                await this.runSearch();
                return;
            }
            if (getAchievementWorkbenchDimensionSort(this.filters.sort)) {
                await this.setListSort(this.filters.sort);
                return;
            }
            if (!this.searchMode || this.hidden) {
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
                if (!this.searchMode || this.hidden) {
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
                const records = this.hidden
                    ? searchHiddenAchievementRecords(this.hiddenIndex, { keyword, mapId })
                    : await searchAchievementWorkbenchRecords({
                    tier: this.filters.tier,
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
                if (this.hidden) {
                    await this.loadVisibleRecords();
                    return;
                }
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
            this.filters = {
                ...createDefaultFilters(this.hidden),
                tier: this.hidden ? "hidden" : "normal",
                completableOnly: this.hidden && this.completableFilterAvailable,
            };
            this.searchRecords = null;
            this.page = 1;
            await this.loadVisibleRecords();
        },
        async selectListCategory(categoryId) {
            await this.setListFilter('categoryId', categoryId);
            await this.scrollToBrowserTop({ keepVisibleList: true });
        },
        async scrollToBrowserTop({ keepVisibleList = false } = {}) {
            await this.$nextTick();
            if (keepVisibleList) {
                // Wait for the shorter-column observer and its sticky layout to settle.
                await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                const list = this.$refs.achievementList?.$el;
                const browser = this.$refs.achievementBrowser;
                if (list && browser) {
                    const rect = list.getBoundingClientRect();
                    const top = parseFloat(window.getComputedStyle(browser).scrollMarginTop) || 0;
                    if (rect.top >= top - 1 && rect.bottom <= window.innerHeight) return;
                }
            }
            this.$refs.achievementBrowser?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                block: "start",
                inline: "nearest",
            });
        },
        async changePage(page) {
            this.page = Number(page) || 1;
            if (!this.searchMode || this.hidden) {
                await this.loadVisibleRecords();
            } else {
                await this.$nextTick();
                this.loadVisibleEnrichment(this.visibleRecords.map((record) => record.id));
            }
            await this.scrollToBrowserTop();
        },
        retryRecords() {
            return this.searchMode ? this.runSearch() : this.loadVisibleRecords();
        },
    },
};
</script>

<template>
    <div class="p-achievement-progress" :class="{ 'is-hidden-page': hidden }">
        <PvxSurface v-if="pageError" class="m-progress-page-state" padding="none">
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

        <PvxSurface v-else-if="!currentRole && !isGuest" class="m-progress-page-state" padding="none">
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
            <div v-if="isGuest" class="m-progress-guest-notice">
                <span>{{ $t("pages.wiki.overview.ui.loginRequired") }}</span>
                <PvxActionButton :href="loginUrl">{{ $t("pages.wiki.overview.ui.goLogin") }}</PvxActionButton>
            </div>
            <AchievementProgressSummary
                v-if="!hidden"
                :show-toolbar="!snapshot"
                :guest="isGuest"
                @require-login="requireLogin"
                :collapsed="summaryCollapsed"
                :current-role="currentRole"
                :current-role-id="currentRoleId"
                :roles="roles"
                :overall="overallProgress"
                :tiers="tierProgress"
                :active-tier="filters.tier"
                :loading="roleLoading"
                :synced="synced"
                :synced-at="syncedAt"
                @select-role="selectRole"
                @select-tier="selectTier"
                @update:collapsed="summaryCollapsed = $event"
            />

            <div ref="achievementBrowser" v-shorter-column-sticky class="m-progress-browser-grid">
                <AchievementCompareCategoryTree
                    v-if="hidden"
                    :categories="hiddenCategories"
                    :load-icons="false"
                    show-category-counts
                    :total="Object.keys(listMetadata).length"
                    :active-category-id="selectedCategory?.parentId || filters.categoryId"
                    :active-detail-id="selectedCategory?.parentId ? selectedCategory.id : ''"
                    @select-category="selectListCategory"
                    @select-detail="selectListCategory($event.detailId)"
                />
                <AchievementCategoryBoard
                    v-else
                    :tier="filters.tier"
                    @update:tier="setListFilter('tier', $event)"
                    :categories="categories"
                    :compact-overview="summaryCollapsed"
                    :active-category-id="filters.categoryId"
                    :sort="categorySort"
                    @select-category="selectListCategory"
                    @update:sort="setCategorySort"
                />
                <component
                    :is="hidden ? 'AchievementHiddenList' : 'AchievementProgressList'"
                    ref="achievementList"
                    :title="achievementListTitle"
                    v-bind="hidden ? { currentRole, roles, roleLoading, guest: isGuest } : {}"
                    @require-login="requireLogin"
                    @select-role="selectRole"
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
                            :show-tier="false"
                            :show-sort="!hidden"
                            :map-options="mapOptions"
                            :tier="filters.tier"
                            :completion="filters.completion"
                            :show-completion="!hidden"
                            :show-completable-only="hidden"
                            :completable-only="filters.completableOnly"
                            :completable-disabled="completableFilterLoading || !completableFilterAvailable"
                            :map-id="filters.mapId"
                            :show-map="!hidden"
                            :sort="filters.sort"
                            :keyword="filters.keyword"
                            :dimensions="dimensions"
                            :sort-loading="dimensionSortLoading"
                            :loading="recordLoading || dimensionSortLoading"
                            :show-category="false"
                            @update:tier="setListFilter('tier', $event)"
                            @update:completion="setListFilter('completion', $event)"
                            @update:completable-only="setListFilter('completableOnly', $event)"
                            @update:map-id="updateSearchField('mapId', $event)"
                            @update:sort="setListSort"
                            @update:keyword="updateSearchField('keyword', $event)"
                            @submit-search="runSearch"
                            @reset-filters="resetListFilters"
                        />
                    </template>
                </component>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.is-hidden-page .m-progress-browser-grid {
    grid-template-columns: 250px minmax(0, 1fr);
    gap: 12px;
    background: #fff;
    border-radius: 16px;
}
@media (max-width: 1060px) {
    .is-hidden-page .m-progress-browser-grid { grid-template-columns: minmax(0, 1fr); }
}
.p-achievement-progress {
    width: 100%;
    min-width: 0;
}

.m-progress-guest-notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    background: #fff;
    color: #6e572c;
}

.m-progress-page-content {
    display: grid;
    min-width: 0;
    gap: 12px;
}

.m-progress-browser-grid {
    scroll-margin-top: calc(var(--achievement-sticky-top, 120px) + 12px);
    display: grid;
    min-width: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 12px;
    padding: 12px;
    border-radius: 16px;
    background: #fff;
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

@media (min-width: 1061px) {
    .m-progress-browser-grid > :deep(.is-shorter-sticky-column) {
        position: sticky;
        top: min(
            calc(var(--achievement-sticky-top, 120px) + 12px),
            calc(100vh - var(--sticky-column-height) - 12px)
        );
        top: min(
            calc(var(--achievement-sticky-top, 120px) + 12px),
            calc(100dvh - var(--sticky-column-height) - 12px)
        );
    }
}

@media (max-width: 1060px) {
    .m-progress-browser-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: @phone) {
    .m-progress-page-state {
        min-height: 320px;
    }
}
</style>
