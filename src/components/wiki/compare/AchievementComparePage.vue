<script>
import User from "@jx3box/jx3box-common/js/user";
import { Loading, Plus, UserFilled, WarningFilled } from "@element-plus/icons-vue";
import * as XLSX from "xlsx";
import AchievementCompareAnalysis from "@/components/wiki/compare/AchievementCompareAnalysis.vue";
import AchievementCompareCategoryTree from "@/components/wiki/compare/AchievementCompareCategoryTree.vue";
import AchievementCompareFilters from "@/components/wiki/compare/AchievementCompareFilters.vue";
import AchievementCompareMatrix from "@/components/wiki/compare/AchievementCompareMatrix.vue";
import AchievementCompareRoleBar from "@/components/wiki/compare/AchievementCompareRoleBar.vue";
import AchievementCompareRoleDialog from "@/components/wiki/compare/AchievementCompareRoleDialog.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import {
    fetchAchievementWorkbenchCatalog,
    fetchAchievementWorkbenchFriendRoles,
    fetchAchievementWorkbenchFriends,
    fetchAchievementWorkbenchMaps,
    fetchAchievementWorkbenchRecords,
    fetchAchievementWorkbenchRoles,
    fetchAchievementWorkbenchRoleState,
    searchAchievementWorkbenchRecords,
} from "@/service/achievementWorkbench";
import {
    buildAchievementCategoryComparison,
    buildAchievementCompareCategoryTree,
    buildAchievementCrossStatistics,
    buildAchievementRoleProgress,
    COMMON_UNFINISHED_FILTER,
    filterAchievementIdsForCompare,
    filterAchievements,
} from "@/utils/achievementCompare";
import { paginateAchievementItems } from "@/utils/achievementProgress";
import { selectMenuRootsByGeneral } from "@/utils/achievementStatistics";
import { __Links } from "@/utils/config";

const MAX_COMPARE_ROLES = 4;

export default {
    name: "AchievementComparePage",
    components: {
        AchievementCompareAnalysis,
        AchievementCompareCategoryTree,
        AchievementCompareFilters,
        AchievementCompareMatrix,
        AchievementCompareRoleBar,
        AchievementCompareRoleDialog,
        Loading,
        Plus,
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
            addingRoles: false,
            exporting: false,
            menus: {},
            metadata: {},
            maps: [],
            userRoles: [],
            friends: [],
            friendRoles: [],
            friendRolesLoading: false,
            compareRoles: [],
            currentRoleId: "",
            records: [],
            searchRecords: null,
            selectedFilters: [],
            activeCategoryId: "all",
            activeDetailId: "",
            mapId: "",
            keyword: "",
            page: 1,
            pageSize: 20,
            roleSummaryCollapsed: false,
            roleDialogVisible: false,
            recordRequestId: 0,
            friendRoleRequestId: 0,
        };
    },
    computed: {
        loginUrl() {
            return __Links.account.login + "?redirect=" + encodeURIComponent(location.href);
        },
        maxRoles() {
            return MAX_COMPARE_ROLES;
        },
        remainingRoleSlots() {
            return Math.max(0, MAX_COMPARE_ROLES - this.compareRoles.length);
        },
        roleProgress() {
            return buildAchievementRoleProgress(this.compareRoles, this.metadata).map((role) => ({
                ...role,
                isCurrent: String(role.id || role.jx3id) === this.currentRoleId,
            }));
        },
        catalogAchievementIds() {
            return Object.entries(this.metadata)
                .filter(([, item]) => [0, 1, 2, 3].includes(Number(item?.general)))
                .map(([id]) => id);
        },
        searchMode() {
            return this.searchRecords !== null;
        },
        statusFilteredSearchRecords() {
            if (!this.searchMode) return [];
            return filterAchievements(this.searchRecords, this.compareRoles, this.selectedFilters);
        },
        baseResultIds() {
            if (this.searchMode) return this.statusFilteredSearchRecords.map((record) => String(record.id));
            return filterAchievementIdsForCompare(this.catalogAchievementIds, this.compareRoles, this.selectedFilters);
        },
        regularMenus() {
            return selectMenuRootsByGeneral(this.menus, this.metadata, 1);
        },
        categoryTree() {
            return buildAchievementCompareCategoryTree(this.regularMenus, this.baseResultIds);
        },
        selectedCategory() {
            if (this.activeCategoryId === "all") return null;
            return this.categoryTree.find((category) => category.id === this.activeCategoryId) || null;
        },
        selectedDetail() {
            if (!this.selectedCategory || !this.activeDetailId) return null;
            return this.selectedCategory.children.find((child) => child.id === this.activeDetailId) || null;
        },
        comparisonScopeTitle() {
            if (this.selectedDetail) return `${this.selectedCategory.name} / ${this.selectedDetail.name}`;
            if (this.selectedCategory) return this.selectedCategory.name;
            return this.$t("pages.wiki.compare.ui.categories.all");
        },
        resultIds() {
            if (this.selectedDetail) return this.selectedDetail.achievementIds;
            if (this.selectedCategory) return this.selectedCategory.achievementIds;
            return this.baseResultIds;
        },
        visibleIds() {
            return paginateAchievementItems(this.resultIds, this.page, this.pageSize);
        },
        visibleRecords() {
            if (!this.searchMode) return this.records;
            const recordMap = new Map(this.statusFilteredSearchRecords.map((record) => [String(record.id), record]));
            return this.visibleIds.map((id) => recordMap.get(String(id))).filter(Boolean);
        },
        resultPoints() {
            const searchPointMap = new Map(
                (this.searchRecords || []).map((record) => [String(record.id), record.points])
            );
            return this.resultIds.reduce((total, id) => {
                const point = this.metadata[String(id)]?.point ?? searchPointMap.get(String(id));
                return total + (Number(point) || 0);
            }, 0);
        },
        mapOptions() {
            return [...this.maps]
                .map((map) => ({
                    ...map,
                    label: map.regionName ? `${map.regionName} · ${map.name}` : map.name,
                }))
                .sort((left, right) => left.label.localeCompare(right.label));
        },
        filterOptions() {
            const commonSelected = this.selectedFilters.includes(COMMON_UNFINISHED_FILTER);
            const options = [
                {
                    value: COMMON_UNFINISHED_FILTER,
                    label: this.$t("pages.wiki.compare.ui.filters.commonIncomplete"),
                    disabled: false,
                },
            ];

            this.compareRoles.forEach((role) => {
                const roleId = String(role.id || role.jx3id);
                const roleName = role.name || this.$t("pages.wiki.compare.ui.common.unknown");
                [
                    { status: "1", label: this.$t("pages.wiki.compare.ui.filters.incompleteBy", { role: roleName }) },
                    { status: "2", label: this.$t("pages.wiki.compare.ui.filters.completedBy", { role: roleName }) },
                ].forEach((item) => {
                    const value = `${roleId},${item.status}`;
                    const contradictory = this.selectedFilters.some((selected) => {
                        const [selectedRoleId, selectedStatus] = String(selected).split(",");
                        return selectedRoleId === roleId && selectedStatus !== item.status;
                    });
                    options.push({
                        value,
                        label: item.label,
                        disabled: commonSelected || contradictory,
                    });
                });
            });
            return options;
        },
        categoryComparison() {
            return buildAchievementCategoryComparison({
                menus: this.regularMenus,
                metadata: this.metadata,
                roles: this.compareRoles,
            });
        },
        crossStatistics() {
            return buildAchievementCrossStatistics({
                achievementIds: this.catalogAchievementIds,
                metadata: this.metadata,
                roles: this.compareRoles,
            });
        },
        availableOwnRoles() {
            return this.userRoles.filter((role) => !this.hasCompareRole(role.id || role.jx3id));
        },
        availableFriendRoles() {
            return this.friendRoles.filter((role) => !this.hasCompareRole(role.id || role.jx3id));
        },
        canExport() {
            return !this.exporting && this.compareRoles.length > 0 && this.resultIds.length > 0;
        },
    },
    mounted() {
        this.initializePage();
    },
    beforeUnmount() {
        this.recordRequestId += 1;
        this.friendRoleRequestId += 1;
    },
    methods: {
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
                const [catalog, roles, maps, friends] = await Promise.all([
                    fetchAchievementWorkbenchCatalog(client),
                    fetchAchievementWorkbenchRoles(),
                    fetchAchievementWorkbenchMaps(client).catch(() => []),
                    fetchAchievementWorkbenchFriends().catch(() => []),
                ]);
                this.menus = catalog.menus;
                this.metadata = catalog.metadata;
                this.userRoles = roles;
                this.maps = maps;
                this.friends = friends;
                this.compareRoles = [];
                this.currentRoleId = "";
                this.selectedFilters = [];

                const routeRoleId = String(this.$route.query.jx3id || "");
                const lastRoleId = String(localStorage.getItem("wiki_last_sync") || "");
                const preferredRoleId = routeRoleId || lastRoleId;
                const initialRole = roles.find((role) => role.id === preferredRoleId) || roles[0] || null;
                this.currentRoleId = String(initialRole?.id || initialRole?.jx3id || "");
                if (initialRole) await this.addRole(initialRole, false);
                await this.loadVisibleRecords();
            } catch (error) {
                console.error("Failed to initialize achievement comparison:", error);
                this.pageError = true;
            } finally {
                this.pageLoading = false;
            }
        },
        hasCompareRole(roleId) {
            return this.compareRoles.some((role) => String(role.id || role.jx3id) === String(roleId));
        },
        async addRole(roleInfo, reload = true) {
            const roleId = String(roleInfo?.id || roleInfo?.jx3id || "");
            if (!roleId || this.hasCompareRole(roleId) || this.compareRoles.length >= MAX_COMPARE_ROLES) return;

            this.roleLoading = true;
            try {
                const state = await fetchAchievementWorkbenchRoleState(roleId);
                this.compareRoles = [
                    ...this.compareRoles,
                    {
                        ...roleInfo,
                        id: roleId,
                        jx3id: roleId,
                        completedAchievements: state.completedIds,
                        synced: state.synced,
                    },
                ];
                if (reload) {
                    this.page = 1;
                    await this.loadVisibleRecords();
                }
            } finally {
                this.roleLoading = false;
            }
        },
        openRoleDialog() {
            if (!this.remainingRoleSlots) return;
            this.friendRoles = [];
            this.roleDialogVisible = true;
        },
        async loadFriendRoles(friendId) {
            const requestId = ++this.friendRoleRequestId;
            this.friendRolesLoading = true;
            try {
                const roles = await fetchAchievementWorkbenchFriendRoles(friendId);
                if (requestId === this.friendRoleRequestId) this.friendRoles = roles;
            } catch (error) {
                if (requestId !== this.friendRoleRequestId) return;
                console.error("Failed to load friend roles:", error);
                this.friendRoles = [];
                this.$message.error(this.$t("pages.wiki.compare.ui.states.loadFailed"));
            } finally {
                if (requestId === this.friendRoleRequestId) this.friendRolesLoading = false;
            }
        },
        async confirmAddRoles(payload) {
            if (this.addingRoles) return;
            const source = payload.roleType === "self" ? this.availableOwnRoles : this.availableFriendRoles;
            const roles = payload.roleIds
                .map((roleId) => source.find((role) => String(role.id || role.jx3id) === String(roleId)))
                .filter(Boolean)
                .slice(0, this.remainingRoleSlots);
            if (!roles.length) {
                this.$message.warning(this.$t("pages.wiki.compare.ui.validation.roleAlreadyAdded"));
                return;
            }

            this.addingRoles = true;
            try {
                for (const role of roles) await this.addRole(role, false);
                this.roleDialogVisible = false;
                this.page = 1;
                await this.loadVisibleRecords();
            } catch (error) {
                console.error("Failed to add comparison roles:", error);
                this.$message.error(this.$t("pages.wiki.compare.ui.states.loadFailed"));
            } finally {
                this.addingRoles = false;
            }
        },
        async removeRole(role) {
            const roleId = String(role?.id || role?.jx3id || "");
            if (!roleId || roleId === this.currentRoleId) return;

            const roleName = role.server ? `${role.name || "—"} · ${role.server}` : role.name || "—";
            try {
                await this.$confirm(
                    this.$t("pages.wiki.compare.ui.common.removeRoleConfirm", { name: roleName }),
                    this.$t("pages.wiki.compare.ui.actions.removeRole"),
                    {
                        confirmButtonText: this.$t("pages.wiki.compare.ui.actions.confirm"),
                        cancelButtonText: this.$t("pages.wiki.compare.ui.actions.cancel"),
                        type: "warning",
                    }
                );
            } catch {
                return;
            }
            this.compareRoles = this.compareRoles.filter((item) => String(item.id || item.jx3id) !== roleId);
            this.selectedFilters = this.selectedFilters.filter((filter) => String(filter).split(",")[0] !== roleId);
            this.page = 1;
            await this.loadVisibleRecords();
            this.$message.success(this.$t("pages.wiki.compare.ui.common.roleRemoved"));
        },
        normalizeSelectedFilters(values) {
            const normalized = [...new Set((values || []).map(String))];
            const lastValue = normalized[normalized.length - 1];
            if (lastValue === COMMON_UNFINISHED_FILTER) return [lastValue];

            const roleFilters = normalized.filter((value) => value !== COMMON_UNFINISHED_FILTER);
            const byRole = new Map();
            roleFilters.forEach((value) => byRole.set(value.split(",")[0], value));
            return [...byRole.values()];
        },
        async setSelectedFilters(values) {
            this.selectedFilters = this.normalizeSelectedFilters(values);
            this.page = 1;
            await this.loadVisibleRecords();
        },
        async selectCategory(categoryId) {
            this.activeCategoryId = String(categoryId);
            this.activeDetailId = "";
            this.page = 1;
            await this.loadVisibleRecords();
        },
        async selectDetail({ categoryId, detailId }) {
            this.activeCategoryId = String(categoryId);
            this.activeDetailId = String(detailId);
            this.page = 1;
            await this.loadVisibleRecords();
        },
        updateSearchField(key, value) {
            this[key] = String(value || "");
        },
        async runSearch(overrides = {}) {
            Object.entries(overrides || {}).forEach(([key, value]) => {
                if (["keyword", "mapId"].includes(key)) this[key] = String(value || "");
            });
            const keyword = this.keyword.trim();
            const mapId = this.mapId;
            this.page = 1;

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
                });
                if (requestId !== this.recordRequestId) return;
                this.searchRecords = this.enrichRecords(records);
                this.records = [];
            } catch (error) {
                if (requestId !== this.recordRequestId) return;
                console.error("Failed to search comparison achievements:", error);
                this.searchRecords = [];
                this.recordError = true;
            } finally {
                if (requestId === this.recordRequestId) this.recordLoading = false;
            }
        },
        async resetCompareFilters() {
            this.selectedFilters = [];
            this.activeCategoryId = "all";
            this.activeDetailId = "";
            this.keyword = "";
            this.mapId = "";
            this.searchRecords = null;
            this.page = 1;
            await this.loadVisibleRecords();
        },
        enrichRecords(records) {
            const menuEntries = Array.isArray(this.menus) ? this.menus : Object.values(this.menus || {});
            const categoryNames = new Map(menuEntries.map((menu) => [String(menu.sub), menu.name]));
            const detailNames = new Map();
            menuEntries.forEach((menu) => {
                (menu.children || []).forEach((child) => {
                    detailNames.set(`${menu.sub}:${child.detail}`, child.name);
                });
            });
            const mapNames = new Map(this.maps.map((map) => [String(map.id), map.name]));

            return records.map((record) => ({
                ...record,
                category: {
                    ...record.category,
                    name: record.category.name || categoryNames.get(String(record.category.id)) || null,
                    subName:
                        record.category.subName ||
                        detailNames.get(`${record.category.id}:${record.category.subId}`) ||
                        null,
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
            const ids = this.visibleIds;
            this.recordLoading = true;
            this.recordError = false;
            try {
                const records = await fetchAchievementWorkbenchRecords({
                    ids,
                    metadata: this.metadata,
                });
                if (requestId !== this.recordRequestId) return;
                const recordMap = new Map(this.enrichRecords(records).map((record) => [String(record.id), record]));
                this.records = ids.map((id) => recordMap.get(String(id))).filter(Boolean);
            } catch (error) {
                if (requestId !== this.recordRequestId) return;
                console.error("Failed to load comparison records:", error);
                this.records = [];
                this.recordError = true;
            } finally {
                if (requestId === this.recordRequestId) this.recordLoading = false;
            }
        },
        async changePage(page) {
            this.page = Number(page) || 1;
            if (!this.searchMode) await this.loadVisibleRecords();
        },
        retryRecords() {
            return this.searchMode ? this.runSearch() : this.loadVisibleRecords();
        },
        async fetchExportRecords() {
            if (this.searchMode) {
                const recordMap = new Map(
                    this.statusFilteredSearchRecords.map((record) => [String(record.id), record])
                );
                return this.resultIds.map((id) => recordMap.get(String(id))).filter(Boolean);
            }

            const records = [];
            const batchSize = 300;
            for (let index = 0; index < this.resultIds.length; index += batchSize) {
                const batch = this.resultIds.slice(index, index + batchSize);
                const response = await fetchAchievementWorkbenchRecords({
                    ids: batch,
                    metadata: this.metadata,
                });
                records.push(...response);
            }
            return this.enrichRecords(records);
        },
        buildExcelData(records) {
            const headers = [
                this.$t("pages.wiki.compare.ui.export.headers.category"),
                this.$t("pages.wiki.compare.ui.export.headers.achievement"),
                this.$t("pages.wiki.compare.ui.export.headers.points"),
                this.$t("pages.wiki.compare.ui.export.headers.difficulty"),
                this.$t("pages.wiki.compare.ui.export.headers.estimatedTime"),
                ...this.roleProgress.map((role) => `${role.name || "—"} · ${role.server || "—"}`),
            ];
            const completionSets = this.roleProgress.map(
                (role) => new Set((role.completedAchievementIds || []).map(String))
            );
            const rows = records.map((record) => [
                [record.category.name, record.category.subName].filter(Boolean).join(" / ") || "—",
                record.name || "—",
                record.points ?? "—",
                record.difficulty ?? "—",
                record.estimatedMinutes ?? "—",
                ...completionSets.map((completedIds) =>
                    completedIds.has(String(record.id))
                        ? this.$t("pages.wiki.compare.ui.status.completed")
                        : this.$t("pages.wiki.compare.ui.status.incomplete")
                ),
            ]);
            return [headers, ...rows];
        },
        async exportComparison() {
            if (!this.canExport) return;
            this.exporting = true;
            try {
                const records = await this.fetchExportRecords();
                const worksheet = XLSX.utils.aoa_to_sheet(this.buildExcelData(records));
                worksheet["!cols"] = [
                    { wch: 24 },
                    { wch: 34 },
                    { wch: 12 },
                    { wch: 12 },
                    { wch: 14 },
                    ...this.roleProgress.map(() => ({ wch: 18 })),
                ];
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    this.$t("pages.wiki.compare.ui.export.sheetName").slice(0, 31)
                );
                const date = new Date().toISOString().slice(0, 10);
                const fileName = this.$t("pages.wiki.compare.ui.export.fileName", { date }).replace(
                    /[\\/:*?"<>|]/g,
                    "_"
                );
                XLSX.writeFile(workbook, fileName);
                this.$message.success(this.$t("pages.wiki.compare.ui.export.success"));
            } catch (error) {
                console.error("Failed to export achievement comparison:", error);
                this.$message.error(this.$t("pages.wiki.compare.ui.export.failed"));
            } finally {
                this.exporting = false;
            }
        },
    },
};
</script>

<template>
    <div class="p-achievement-compare-new">
        <PvxSurface v-if="!isLogin" class="m-compare-page-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.compare.ui.auth.loginRequired')"
                :description="$t('pages.wiki.compare.ui.auth.loginDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton :href="loginUrl">{{ $t("pages.wiki.compare.ui.actions.login") }}</PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="pageError" class="m-compare-page-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.compare.ui.states.loadFailed')"
                :description="$t('pages.wiki.compare.ui.states.loadFailedDescription')"
            >
                <template #icon><WarningFilled /></template>
                <template #action>
                    <PvxActionButton @click="initializePage">{{
                        $t("pages.wiki.compare.ui.actions.retry")
                    }}</PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="pageLoading" class="m-compare-page-state is-loading" padding="none" v-loading="true">
            <PvxEmptyState :title="$t('pages.wiki.compare.ui.states.loading')">
                <template #icon><Loading /></template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="!userRoles.length" class="m-compare-page-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.compare.ui.states.noRole')"
                :description="$t('pages.wiki.compare.ui.states.noRoleDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton href="/team/role/bind">{{
                        $t("pages.wiki.compare.ui.actions.bindRole")
                    }}</PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <div
            v-else
            class="m-compare-page-content"
            :class="{ 'is-summary-collapsed': roleSummaryCollapsed }"
        >
            <AchievementCompareRoleBar
                :roles="roleProgress"
                :max-roles="maxRoles"
                :loading="roleLoading"
                :collapsed="roleSummaryCollapsed"
                @add-role="openRoleDialog"
                @remove-role="removeRole"
                @update:collapsed="roleSummaryCollapsed = $event"
            />

            <PvxSurface v-if="!compareRoles.length" class="m-compare-empty-roles" padding="none">
                <PvxEmptyState
                    :title="$t('pages.wiki.compare.ui.states.noCompareRoles')"
                    :description="$t('pages.wiki.compare.ui.states.noCompareRolesDescription')"
                >
                    <template #icon><UserFilled /></template>
                    <template #action>
                        <button type="button" class="u-compare-empty-add-role" @click="openRoleDialog">
                            <Plus aria-hidden="true" />
                            <span>{{ $t("pages.wiki.compare.ui.actions.addRole") }}</span>
                        </button>
                    </template>
                </PvxEmptyState>
            </PvxSurface>

            <template v-else>
                <div class="m-compare-browser-grid">
                    <AchievementCompareCategoryTree
                        :categories="categoryTree"
                        :total="baseResultIds.length"
                        :active-category-id="activeCategoryId"
                        :active-detail-id="activeDetailId"
                        @select-category="selectCategory"
                        @select-detail="selectDetail"
                    />
                    <AchievementCompareMatrix
                        :title="comparisonScopeTitle"
                        :records="visibleRecords"
                        :roles="roleProgress"
                        :total="resultIds.length"
                        :page="page"
                        :page-size="pageSize"
                        :loading="recordLoading"
                        :error="recordError"
                        @page-change="changePage"
                        @retry="retryRecords"
                    >
                        <template #filters>
                            <AchievementCompareFilters
                                embedded
                                :filter-options="filterOptions"
                                :selected-filters="selectedFilters"
                                :map-options="mapOptions"
                                :map-id="mapId"
                                :keyword="keyword"
                                :result-count="resultIds.length"
                                :result-points="resultPoints"
                                :loading="recordLoading || exporting"
                                :can-export="canExport"
                                @update:selected-filters="setSelectedFilters"
                                @update:map-id="updateSearchField('mapId', $event)"
                                @update:keyword="updateSearchField('keyword', $event)"
                                @submit-search="runSearch"
                                @reset-filters="resetCompareFilters"
                                @export="exportComparison"
                            />
                        </template>
                    </AchievementCompareMatrix>
                </div>

                <AchievementCompareAnalysis
                    :roles="roleProgress"
                    :cross-statistics="crossStatistics"
                    :categories="categoryComparison"
                />
            </template>
        </div>

        <AchievementCompareRoleDialog
            v-model="roleDialogVisible"
            :own-roles="availableOwnRoles"
            :friends="friends"
            :friend-roles="availableFriendRoles"
            :loading-friend-roles="friendRolesLoading"
            :adding="addingRoles"
            :remaining-slots="remainingRoleSlots"
            @request-friend-roles="loadFriendRoles"
            @confirm="confirmAddRoles"
        />
    </div>
</template>

<style lang="less" scoped>
.p-achievement-compare-new {
    width: 100%;
    min-width: 0;
}

.m-compare-page-content {
    display: grid;
    min-width: 0;
    gap: 12px;
}

.m-compare-browser-grid {
    display: grid;
    height: 752px;
    min-width: 0;
    grid-template-columns: minmax(320px, 360px) minmax(620px, 1fr);
    align-items: stretch;
    gap: 12px;
}

.m-compare-page-content.is-summary-collapsed .m-compare-browser-grid {
    height: clamp(480px, calc(100vh - 244px), 820px);
}

.m-compare-page-state {
    min-height: 520px;
    border: 1px solid rgba(70, 74, 66, 0.13);
    border-radius: 14px;
    background: rgba(255, 254, 250, 0.88);
}

.m-compare-empty-roles {
    min-height: 320px;
    overflow: hidden;
    border: 1px solid rgba(70, 74, 66, 0.13);
    border-radius: 14px;
    background: rgba(255, 254, 250, 0.88);

    :deep(.c-pvx-empty-state) {
        min-height: 320px;
        padding: 42px 24px;
        border: 0;
        border-radius: 14px;
        background:
            radial-gradient(circle at 50% 35%, rgba(71, 119, 125, 0.08), transparent 34%),
            rgba(250, 249, 245, 0.72);
    }

    :deep(.c-pvx-empty-state__icon) {
        display: flex;
        width: 48px;
        height: 48px;
        align-items: center;
        justify-content: center;
        margin-bottom: 14px;
        border-radius: 14px;
        color: #47777d;
        background: rgba(71, 119, 125, 0.1);
        font-size: 24px;
    }

    :deep(.c-pvx-empty-state__description) {
        margin-top: 6px;
    }

    :deep(.c-pvx-empty-state__action) {
        margin-top: 18px;
    }
}

.u-compare-empty-add-role {
    display: inline-flex;
    width: auto;
    min-width: 128px;
    height: 38px;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: 7px;
    padding: 0 18px;
    border: 1px solid #47777d;
    border-radius: 8px;
    color: #fff;
    background: #47777d;
    box-shadow: 0 5px 14px rgba(47, 105, 112, 0.16);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    writing-mode: horizontal-tb;
    cursor: pointer;
    transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;

    svg {
        width: 15px;
        height: 15px;
        flex: none;
    }

    &:hover {
        background: #3c6d73;
        box-shadow: 0 7px 18px rgba(47, 105, 112, 0.22);
        transform: translateY(-1px);
    }

    &:focus-visible {
        outline: 2px solid rgba(71, 119, 125, 0.55);
        outline-offset: 2px;
    }
}

.m-compare-page-state.is-loading :deep(.el-loading-mask) {
    background: rgba(255, 254, 250, 0.45);
}

@media (max-width: 1060px) {
    .m-compare-browser-grid {
        height: auto;
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
