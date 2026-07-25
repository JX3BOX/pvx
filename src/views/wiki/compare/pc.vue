<template>
    <div class="p-pvx-achievement-compare">
        <section class="m-compare-workbench">
            <section v-if="isLogin" class="m-compare-toolbar" :aria-label="t('filters.title')">
                <label class="m-compare-inline-control is-status">
                    <span class="u-compare-control-prefix">{{ t("filters.title") }}</span>
                    <el-select
                        v-model="selectedFilter"
                        :placeholder="t('filters.placeholder')"
                        multiple
                        collapse-tags
                        clearable
                        @change="handleFilterChange"
                    >
                        <el-option
                            v-for="option in filterOptions"
                            :key="option.type"
                            :label="option.name"
                            :value="option.type"
                            :disabled="isFilterOptionDisabled(option.type)"
                        />
                    </el-select>
                </label>

                <div class="m-compare-filter is-search">
                    <div class="m-compare-search">
                        <label class="m-compare-inline-control is-map">
                            <span class="u-compare-control-prefix">{{ t("map.label") }}</span>
                            <el-cascader
                                v-model="selectedMap"
                                class="u-compare-map"
                                :options="mapOptions"
                                :placeholder="t('map.placeholder')"
                                :show-all-levels="false"
                                clearable
                                @change="handleSearch"
                            />
                        </label>
                        <el-input
                            v-model="searchKeyword"
                            class="u-compare-search-input"
                            :placeholder="t('search.placeholder')"
                            clearable
                            @clear="clearSearch"
                            @keydown.enter="handleSearch"
                        />
                        <button
                            type="button"
                            class="u-compare-clear"
                            :aria-label="t('search.action')"
                            :title="t('search.action')"
                            @click="handleSearch"
                        >
                            <Search />
                        </button>
                    </div>
                </div>

                <div class="m-compare-toolbar__actions">
                    <button
                        type="button"
                        class="u-compare-action is-secondary"
                        :disabled="pageLoading || !userRoleList.length"
                        @click="openAddRoleDialog"
                    >
                        <Plus />
                        {{ t("actions.addRole") }}
                    </button>
                    <button
                        type="button"
                        class="u-compare-action is-primary"
                        :disabled="!canExport"
                        @click="exportToExcel"
                    >
                        <Loading v-if="isExporting" />
                        <Download v-else />
                        {{ isExporting ? t("actions.exporting") : t("actions.export") }}
                    </button>
                </div>
            </section>

            <div class="m-compare-layout" :class="{ 'is-matrix-only': !showCategories }">
                <nav v-if="showCategories" class="m-compare-categories" :aria-label="t('categories.title')">
                    <div class="m-compare-category-primary">
                        <div v-if="categoryLoading" class="m-compare-category-group">
                            <span class="u-compare-category-group">
                                <Loading />
                                <span>{{ t("categories.loading") }}</span>
                            </span>
                        </div>
                        <div
                            v-for="menuGroup in menuList"
                            v-else
                            :key="menuGroup.sub"
                            class="m-compare-category-group"
                        >
                            <button
                                type="button"
                                class="u-compare-category-group"
                                :class="{
                                    'is-active': menuGroup.sub === activeMenuIndex,
                                    'is-expanded': menuGroup.sub === expandedMenuIndex,
                                }"
                                :aria-current="menuGroup.sub === activeMenuIndex ? 'page' : undefined"
                                :aria-expanded="menuGroup.sub === expandedMenuIndex"
                                @click="handleMenuGroupClick(menuGroup.sub)"
                            >
                                <CollectionTag />
                                <span>{{ menuGroup.name }}</span>
                                <ArrowRight class="u-compare-category-chevron" />
                            </button>
                            <div
                                v-if="menuGroup.sub === expandedMenuIndex && menuGroup.children?.length"
                                class="m-compare-category-items"
                            >
                                <button
                                    v-for="menuItem in menuGroup.children"
                                    :key="menuItem.detail"
                                    type="button"
                                    class="u-compare-category-item"
                                    :class="{ 'is-active': menuItem.detail === activeMenuItemDetail }"
                                    :aria-current="menuItem.detail === activeMenuItemDetail ? 'page' : undefined"
                                    @click="handleMenuItemClick(menuGroup.sub, menuItem.detail)"
                                >
                                    <span>{{ menuItem.name }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="expandedMenuGroup?.children?.length"
                        class="m-compare-category-secondary"
                        :aria-label="expandedMenuGroup.name"
                    >
                        <button
                            v-for="menuItem in expandedMenuGroup.children"
                            :key="menuItem.detail"
                            type="button"
                            class="u-compare-category-item"
                            :class="{ 'is-active': menuItem.detail === activeMenuItemDetail }"
                            :aria-current="menuItem.detail === activeMenuItemDetail ? 'page' : undefined"
                            @click="handleMenuItemClick(expandedMenuGroup.sub, menuItem.detail)"
                        >
                            <span>{{ menuItem.name }}</span>
                        </button>
                    </div>
                </nav>

                <div class="m-compare-matrix-region">
                    <div v-if="!isLogin" class="m-compare-state">
                        <div>
                            <UserFilled />
                            <strong>{{ t("auth.loginRequired") }}</strong>
                            <p>{{ t("auth.loginDescription") }}</p>
                            <a class="u-compare-action is-primary" :href="loginUrl">
                                {{ t("actions.login") }}
                            </a>
                        </div>
                    </div>
                    <div v-else-if="pageLoading || achievementLoading" class="m-compare-state is-loading">
                        <div>
                            <Loading />
                            <strong>{{ t("states.loading") }}</strong>
                        </div>
                    </div>
                    <div v-else-if="pageError" class="m-compare-state is-error">
                        <div>
                            <WarningFilled />
                            <strong>{{ t("states.loadFailed") }}</strong>
                            <p>{{ t("states.loadFailedDescription") }}</p>
                            <button type="button" class="u-compare-action is-primary" @click="initializePage">
                                <RefreshRight />
                                {{ t("actions.retry") }}
                            </button>
                        </div>
                    </div>
                    <div v-else-if="!userRoleList.length" class="m-compare-state">
                        <div>
                            <UserFilled />
                            <strong>{{ t("states.noRole") }}</strong>
                            <p>{{ t("states.noRoleDescription") }}</p>
                            <a class="u-compare-action is-primary" href="/team/role/bind">
                                {{ t("actions.bindRole") }}
                            </a>
                        </div>
                    </div>
                    <div v-else-if="!compareRoles.length" class="m-compare-state">
                        <div>
                            <UserFilled />
                            <strong>{{ t("states.noCompareRoles") }}</strong>
                            <p>{{ t("states.noCompareRolesDescription") }}</p>
                            <button type="button" class="u-compare-action is-primary" @click="openAddRoleDialog">
                                <Plus />
                                {{ t("actions.addRole") }}
                            </button>
                        </div>
                    </div>
                    <div v-else-if="!visibleAchievements.length" class="m-compare-state">
                        <div>
                            <CircleCloseFilled />
                            <strong>{{ t("states.noResults") }}</strong>
                            <p>{{ t("states.noResultsDescription") }}</p>
                            <button
                                type="button"
                                class="u-compare-action is-primary is-reset"
                                @click="resetConditions"
                            >
                                <RefreshRight />
                                {{ t("actions.reset") }}
                            </button>
                        </div>
                    </div>
                    <div v-else class="m-compare-matrix-scroll">
                        <table class="m-compare-table" :style="{ minWidth: tableMinWidth }">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        <div class="m-compare-achievement-column-title">
                                            <span>{{ t("matrix.achievement") }}</span>
                                            <span class="u-compare-result-count">
                                                {{
                                                    t("matrix.achievementCount", {
                                                        count: visibleAchievements.length,
                                                    })
                                                }}
                                            </span>
                                        </div>
                                    </th>
                                    <th v-for="role in matrixRoles" :key="getRoleKey(role)" scope="col">
                                        <div class="m-compare-role-card">
                                            <RoleAvatar
                                                class="u-compare-role-avatar"
                                                :mount="role.mount"
                                                :body_type="role.body_type"
                                                :alt="getRoleFullName(role)"
                                            />
                                            <span>
                                                <span class="u-compare-role-name" :title="role.name">
                                                    {{ role.name || t("common.unknown") }}
                                                </span>
                                                <span class="u-compare-role-server" :title="role.server">
                                                    {{ role.server || t("common.emptyValue") }}
                                                </span>
                                            </span>
                                            <button
                                                type="button"
                                                class="u-compare-remove-role"
                                                :aria-label="t('actions.removeRole')"
                                                :title="t('actions.removeRole')"
                                                @click="removeCompareRole(role)"
                                            >
                                                <Close />
                                            </button>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="m-compare-total-row">
                                    <td>
                                        <strong>{{ t("matrix.totalSeniority") }}</strong>
                                    </td>
                                    <td v-for="role in matrixRoles" :key="`points-${getRoleKey(role)}`">
                                        <span class="u-compare-result-count" :title="getRolePointsTitle(role)">
                                            {{ formatNumber(role.totalPoints) }}
                                        </span>
                                    </td>
                                </tr>
                                <tr
                                    v-for="(achievement, achievementIndex) in visibleAchievements"
                                    :key="achievement.ID || achievement.id || achievementIndex"
                                >
                                    <td>
                                        <a
                                            class="m-compare-achievement"
                                            :href="getAchievementLink(achievement.ID || achievement.id)"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <img
                                                class="u-compare-achievement-icon"
                                                :src="getIconUrl(achievement.IconID)"
                                                :alt="achievement.Name || ''"
                                            />
                                            <span>
                                                <span class="u-compare-achievement-name">
                                                    {{ achievement.Name || t("common.unknown") }}
                                                </span>
                                                <span v-if="achievement.Desc" class="u-compare-achievement-desc">
                                                    {{ achievement.Desc }}
                                                </span>
                                            </span>
                                        </a>
                                    </td>
                                    <td v-for="role in matrixRoles" :key="`${getRoleKey(role)}-${achievementIndex}`">
                                        <span
                                            class="u-compare-status"
                                            :class="
                                                isRoleCompleted(role, achievementIndex)
                                                    ? 'is-complete'
                                                    : 'is-incomplete'
                                            "
                                        >
                                            <CircleCheckFilled v-if="isRoleCompleted(role, achievementIndex)" />
                                            <CircleCloseFilled v-else />
                                            {{
                                                isRoleCompleted(role, achievementIndex)
                                                    ? t("status.completed")
                                                    : t("status.incomplete")
                                            }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

        <el-dialog
            v-model="isAddRoleDialogVisible"
            class="m-compare-dialog"
            :title="t('actions.addRole')"
            width="560px"
            append-to-body
            draggable
            :close-on-click-modal="false"
            @closed="resetRoleForm"
        >
            <el-form
                ref="roleFormRef"
                :model="roleFormData"
                :rules="formRules"
                label-position="top"
                status-icon
            >
                <el-form-item :label="t('role.selectType')" prop="roleType">
                    <el-radio-group v-model="roleFormData.roleType" @change="handleRoleTypeChange">
                        <el-radio value="1">{{ t("role.self") }}</el-radio>
                        <el-radio value="2">{{ t("role.friend") }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item
                    v-if="roleFormData.roleType === '2'"
                    :label="t('role.selectFriend')"
                    prop="uid"
                >
                    <el-select
                        v-model="roleFormData.uid"
                        :placeholder="t('role.selectFriend')"
                        filterable
                        @change="loadFriendRoles"
                    >
                        <el-option
                            v-for="friend in friendList"
                            :key="friend.kith_id"
                            :label="friend?.kith_info?.display_name || t('common.unknown')"
                            :value="friend.kith_id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="t('role.selectRole')" prop="jx3Id">
                    <el-select
                        v-model="roleFormData.jx3Id"
                        :placeholder="
                            roleFormData.roleType === '1' ? t('role.selectCharacter') : t('role.selectRole')
                        "
                        multiple
                        filterable
                    >
                        <el-option
                            v-for="role in availableRoleList"
                            :key="getRoleKey(role)"
                            :label="getRoleFullName(role)"
                            :value="String(role.jx3id)"
                            :disabled="hasCompareRole(role.jx3id)"
                        />
                    </el-select>
                </el-form-item>
            </el-form>

            <div v-if="roleFormData.roleType === '2' && !friendList.length" class="m-compare-dialog-tips">
                {{ t("states.noFriendsDescription") }}
            </div>

            <template #footer>
                <div class="m-compare-dialog-footer">
                    <button type="button" class="u-compare-action is-secondary" @click="closeAddRoleDialog">
                        {{ t("actions.cancel") }}
                    </button>
                    <button
                        type="button"
                        class="u-compare-action is-primary"
                        :disabled="isAddingRoles"
                        @click="confirmAddRole"
                    >
                        <Loading v-if="isAddingRoles" />
                        {{ t("actions.confirm") }}
                    </button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import {
    getAchievementPoints,
    getMapList,
    getMenuAchievements,
    getMenus,
    getRoleGameAchievements,
    searchAchievements,
} from "@/service/achievement";
import { getUserRoles } from "@/service/team";
import { getMyKith, getMyKithRoles } from "@/service/wiki";
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
import { __Links } from "@/utils/config";
import {
    buildRoleAchievementStatuses,
    calculateTotalPoints,
    filterAchievements,
    flattenAchievementList,
    normalizeCompletedAchievementIds,
} from "@/utils/achievementCompare";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import {
    ArrowRight,
    CircleCheckFilled,
    CircleCloseFilled,
    Close,
    CollectionTag,
    Download,
    Loading,
    Plus,
    RefreshRight,
    Search,
    UserFilled,
    WarningFilled,
} from "@element-plus/icons-vue";
import * as XLSX from "xlsx";

const COMMON_UNFINISHED_FILTER = "1,1";

export default {
    name: "AchievementComparePage",
    components: {
        ArrowRight,
        CircleCheckFilled,
        CircleCloseFilled,
        Close,
        CollectionTag,
        Download,
        Loading,
        Plus,
        RefreshRight,
        RoleAvatar,
        Search,
        UserFilled,
        WarningFilled,
    },
    data() {
        return {
            isLogin: User.isLogin(),
            pageLoading: User.isLogin(),
            pageError: false,
            categoryLoading: false,
            achievementLoading: false,
            isExporting: false,
            isAddingRoles: false,
            currentUserRole: null,
            userRoleList: [],
            menuList: [],
            activeMenuIndex: null,
            activeMenuItemDetail: null,
            expandedMenuIndex: null,
            selectedFilter: [],
            achievementList: [],
            achievementPointsData: {},
            searchKeyword: "",
            selectedMap: [],
            mapOptions: [],
            compareRoles: [],
            isAddRoleDialogVisible: false,
            friendList: [],
            friendRoleList: [],
            roleFormData: {
                roleType: "1",
                uid: "",
                jx3Id: [],
            },
            achievementRequestId: 0,
        };
    },
    computed: {
        loginUrl() {
            return __Links.account.login + "?redirect=" + encodeURIComponent(location.href);
        },
        availableRoleList() {
            return this.roleFormData.roleType === "1" ? this.userRoleList : this.friendRoleList;
        },
        formRules() {
            return {
                roleType: {
                    required: true,
                    message: this.t("validation.selectRoleType"),
                    trigger: "change",
                },
                uid: {
                    required: this.roleFormData.roleType === "2",
                    message: this.t("validation.selectFriend"),
                    trigger: "change",
                },
                jx3Id: {
                    type: "array",
                    required: true,
                    min: 1,
                    message: this.t("validation.selectRole"),
                    trigger: "change",
                },
            };
        },
        filterOptions() {
            const options = [
                {
                    name: this.t("filters.commonIncomplete"),
                    type: COMMON_UNFINISHED_FILTER,
                },
            ];

            this.compareRoles.forEach((role) => {
                const roleName = role.name || this.t("common.unknown");
                options.push(
                    {
                        name: this.t("filters.incompleteBy", { role: roleName }),
                        type: `${role.jx3id},1`,
                    },
                    {
                        name: this.t("filters.completedBy", { role: roleName }),
                        type: `${role.jx3id},2`,
                    }
                );
            });
            return options;
        },
        visibleAchievements() {
            return filterAchievements(this.achievementList, this.compareRoles, this.selectedFilter);
        },
        matrixRoles() {
            return buildRoleAchievementStatuses(this.compareRoles, this.visibleAchievements);
        },
        currentMenuGroup() {
            return this.menuList.find((menu) => menu.sub === this.activeMenuIndex) || null;
        },
        expandedMenuGroup() {
            return this.menuList.find((menu) => menu.sub === this.expandedMenuIndex) || null;
        },
        currentCategoryTitle() {
            if (this.activeMenuItemDetail && this.currentMenuGroup?.children) {
                const child = this.currentMenuGroup.children.find(
                    (item) => item.detail === this.activeMenuItemDetail
                );
                if (child?.name) return child.name;
            }
            if (this.currentMenuGroup?.name) return this.currentMenuGroup.name;
            if (this.hasSearchCondition) return this.t("search.action");
            return this.t("categories.all");
        },
        hasSearchCondition() {
            return Boolean(this.searchKeyword.trim() || this.selectedMap?.length);
        },
        showCategories() {
            return Boolean(
                this.isLogin &&
                    this.userRoleList.length &&
                    (this.categoryLoading || this.menuList.length)
            );
        },
        tableMinWidth() {
            return `${Math.max(780, 300 + this.matrixRoles.length * 176)}px`;
        },
        canExport() {
            return (
                !this.isExporting &&
                !this.pageLoading &&
                !this.achievementLoading &&
                this.compareRoles.length > 0 &&
                this.visibleAchievements.length > 0
            );
        },
    },
    created() {
        this.initializePage();
    },
    methods: {
        t(path, params) {
            return this.$t(`pages.wiki.compare.ui.${path}`, params);
        },
        async initializePage() {
            if (!this.isLogin) {
                this.pageLoading = false;
                return;
            }

            this.pageLoading = true;
            this.pageError = false;
            this.selectedFilter = [];

            this.loadMapOptions().catch(() => {});
            this.loadFriendList().catch(() => {});

            try {
                const [rolesResponse, pointsResponse, menusResponse] = await Promise.all([
                    getUserRoles(),
                    getAchievementPoints(),
                    getMenus({
                        general: 1,
                        client: this.$store.state.client,
                    }),
                ]);

                this.userRoleList = rolesResponse.data?.data?.list || [];
                this.achievementPointsData = pointsResponse.data?.data?.points || {};
                const rawMenus = menusResponse.data?.data?.menus || [];
                this.menuList = Array.isArray(rawMenus) ? rawMenus : Object.values(rawMenus);

                const routeRoleId = String(this.$route.query.jx3id || "");
                this.currentUserRole =
                    this.userRoleList.find((role) => String(role.jx3id) === routeRoleId) ||
                    this.userRoleList[0] ||
                    null;

                const firstMenu = this.menuList[0];
                if (firstMenu) {
                    this.activeMenuIndex = firstMenu.sub;
                    this.activeMenuItemDetail = null;
                    this.expandedMenuIndex = firstMenu.sub;
                    await this.loadAchievementsByMenu(firstMenu.sub, null);
                }

                if (this.currentUserRole?.jx3id && !this.hasCompareRole(this.currentUserRole.jx3id)) {
                    await this.addCompareRole(this.currentUserRole.jx3id, this.currentUserRole);
                }
            } catch (error) {
                console.error("Failed to initialize achievement comparison:", error);
                this.pageError = true;
            } finally {
                this.pageLoading = false;
            }
        },
        async loadMapOptions() {
            const response = await getMapList({
                client: this.$store.state.client,
                _no_page: 1,
            });
            this.mapOptions = this.formatMapOptions(response.data?.data || []);
        },
        formatMapOptions(mapData) {
            const regionMap = new Map();

            mapData.forEach((map) => {
                if (!map.RegionName) return;
                const regionId = Number(map.Region);
                if (!regionMap.has(map.RegionName)) {
                    regionMap.set(map.RegionName, {
                        value: regionId,
                        label: map.RegionName,
                        children: [],
                    });
                }
                regionMap.get(map.RegionName).children.push({
                    value: Number(map.ID),
                    label: map.MapName,
                });
            });

            return Array.from(regionMap.values());
        },
        async loadFriendList() {
            const response = await getMyKith();
            this.friendList = response.data?.data || [];
        },
        async loadAchievementsByMenu(subMenuIndex, detail) {
            const requestId = ++this.achievementRequestId;
            this.achievementLoading = true;
            this.pageError = false;

            try {
                const response = await getMenuAchievements(subMenuIndex, detail);
                if (requestId !== this.achievementRequestId) return;
                this.achievementList = flattenAchievementList(
                    response.data?.data?.achievements || []
                );
            } finally {
                if (requestId === this.achievementRequestId) {
                    this.achievementLoading = false;
                }
            }
        },
        async handleMenuGroupClick(subMenuIndex) {
            if (this.achievementLoading) return;

            if (subMenuIndex === this.activeMenuIndex) {
                this.expandedMenuIndex =
                    this.expandedMenuIndex === subMenuIndex ? null : subMenuIndex;
                return;
            }

            this.searchKeyword = "";
            this.selectedMap = [];
            this.activeMenuIndex = subMenuIndex;
            this.activeMenuItemDetail = null;
            this.expandedMenuIndex = subMenuIndex;
            try {
                await this.loadAchievementsByMenu(subMenuIndex, null);
            } catch (error) {
                console.error("Failed to load achievement category:", error);
                this.pageError = true;
            }
        },
        async handleMenuItemClick(subMenuIndex, detail) {
            if (this.achievementLoading) return;
            this.searchKeyword = "";
            this.selectedMap = [];
            this.activeMenuIndex = subMenuIndex;
            this.activeMenuItemDetail = detail;
            this.expandedMenuIndex = subMenuIndex;
            try {
                await this.loadAchievementsByMenu(subMenuIndex, detail);
            } catch (error) {
                console.error("Failed to load achievement subcategory:", error);
                this.pageError = true;
            }
        },
        async handleSearch() {
            if (!this.hasSearchCondition) {
                await this.reloadCurrentCategory();
                return;
            }

            const requestId = ++this.achievementRequestId;
            this.achievementLoading = true;
            this.pageError = false;
            this.activeMenuIndex = null;
            this.activeMenuItemDetail = null;

            try {
                const response = await searchAchievements({
                    keyword: this.searchKeyword.trim(),
                    scene: this.selectedMap?.[1] || "",
                    client: this.$store.state.client,
                    _no_page: 1,
                    limit: 99999,
                });
                if (requestId !== this.achievementRequestId) return;
                this.achievementList = flattenAchievementList(
                    response.data?.data?.achievements || []
                );
            } catch (error) {
                console.error("Failed to search achievements:", error);
                this.pageError = true;
            } finally {
                if (requestId === this.achievementRequestId) {
                    this.achievementLoading = false;
                }
            }
        },
        async clearSearch() {
            this.searchKeyword = "";
            this.selectedMap = [];
            await this.reloadCurrentCategory();
        },
        async reloadCurrentCategory() {
            const menu = this.currentMenuGroup || this.menuList[0];
            if (!menu) {
                this.achievementList = [];
                return;
            }
            this.activeMenuIndex = menu.sub;
            this.activeMenuItemDetail = null;
            this.expandedMenuIndex = menu.sub;
            try {
                await this.loadAchievementsByMenu(menu.sub, null);
            } catch (error) {
                console.error("Failed to reload achievement category:", error);
                this.pageError = true;
            }
        },
        async resetConditions() {
            this.selectedFilter = [];
            this.searchKeyword = "";
            this.selectedMap = [];
            await this.reloadCurrentCategory();
        },
        handleFilterChange(values) {
            if (!values.includes(COMMON_UNFINISHED_FILTER) || values.length === 1) return;

            if (values[values.length - 1] === COMMON_UNFINISHED_FILTER) {
                this.selectedFilter = [COMMON_UNFINISHED_FILTER];
            } else {
                this.selectedFilter = values.filter((value) => value !== COMMON_UNFINISHED_FILTER);
            }
        },
        isFilterOptionDisabled(filterType) {
            if (filterType === COMMON_UNFINISHED_FILTER) return false;
            if (this.selectedFilter.includes(COMMON_UNFINISHED_FILTER)) return true;

            const [roleId, status] = String(filterType).split(",");
            return this.selectedFilter.some((selected) => {
                const [selectedRoleId, selectedStatus] = String(selected).split(",");
                return selectedRoleId === roleId && selectedStatus !== status;
            });
        },
        openAddRoleDialog() {
            this.resetRoleForm();
            this.isAddRoleDialogVisible = true;
            this.$nextTick(() => this.$refs.roleFormRef?.clearValidate());
        },
        closeAddRoleDialog() {
            this.isAddRoleDialogVisible = false;
        },
        resetRoleForm() {
            this.roleFormData = {
                roleType: "1",
                uid: "",
                jx3Id: [],
            };
            this.friendRoleList = [];
        },
        handleRoleTypeChange() {
            this.roleFormData.uid = "";
            this.roleFormData.jx3Id = [];
            this.friendRoleList = [];
            this.$nextTick(() => this.$refs.roleFormRef?.clearValidate());
        },
        async loadFriendRoles() {
            this.roleFormData.jx3Id = [];
            this.friendRoleList = [];
            if (!this.roleFormData.uid) return;

            try {
                const response = await getMyKithRoles(this.roleFormData.uid);
                this.friendRoleList = response.data?.data || [];
            } catch (error) {
                console.error("Failed to load friend roles:", error);
                this.$message.error(this.t("states.loadFailed"));
            }
        },
        async confirmAddRole() {
            if (this.isAddingRoles) return;

            try {
                await this.$refs.roleFormRef?.validate();
            } catch {
                return;
            }

            const roleIds = [...new Set(this.roleFormData.jx3Id.map(String))].filter(
                (roleId) => !this.hasCompareRole(roleId)
            );
            if (!roleIds.length) {
                this.$message.warning(this.t("validation.roleAlreadyAdded"));
                return;
            }

            this.isAddingRoles = true;
            try {
                for (const roleId of roleIds) {
                    const roleInfo = this.availableRoleList.find(
                        (role) => String(role.jx3id) === roleId
                    );
                    if (roleInfo) {
                        await this.addCompareRole(roleId, roleInfo);
                    }
                }
                this.closeAddRoleDialog();
            } catch (error) {
                console.error("Failed to add comparison role:", error);
                this.$message.error(this.t("states.loadFailed"));
            } finally {
                this.isAddingRoles = false;
            }
        },
        async addCompareRole(jx3Id, roleInfo) {
            const normalizedRoleId = String(jx3Id);
            if (this.hasCompareRole(normalizedRoleId)) return;

            const response = await getRoleGameAchievements(normalizedRoleId);
            const completedAchievements = normalizeCompletedAchievementIds(
                response.data?.data?.achievements || []
            );
            const normalizedRole = {
                ...roleInfo,
                jx3id: roleInfo?.jx3id ?? normalizedRoleId,
                completedAchievements,
                totalPoints: calculateTotalPoints(
                    completedAchievements,
                    this.achievementPointsData
                ),
            };
            this.compareRoles.push(normalizedRole);
        },
        hasCompareRole(jx3Id) {
            return this.compareRoles.some((role) => String(role.jx3id) === String(jx3Id));
        },
        async removeCompareRole(role) {
            try {
                await this.$confirm(
                    this.t("common.removeRoleConfirm", {
                        name: this.getRoleFullName(role),
                    }),
                    this.t("actions.removeRole"),
                    {
                        confirmButtonText: this.t("actions.confirm"),
                        cancelButtonText: this.t("actions.cancel"),
                        type: "warning",
                    }
                );
            } catch {
                return;
            }

            const roleId = String(role.jx3id);
            this.compareRoles = this.compareRoles.filter(
                (item) => String(item.jx3id) !== roleId
            );
            this.selectedFilter = this.selectedFilter.filter(
                (filter) => String(filter).split(",")[0] !== roleId
            );
            this.$message.success(this.t("common.roleRemoved"));
        },
        isRoleCompleted(role, achievementIndex) {
            const status = role.achievementStatusList?.[achievementIndex];
            return Boolean(status && status.value !== "-1");
        },
        getRoleKey(role) {
            return String(role.jx3id ?? role.ID ?? role.id ?? "");
        },
        getRoleFullName(role) {
            if (!role) return this.t("common.unknown");
            if (!role.server) return role.name || this.t("common.unknown");
            return this.t("role.roleWithServer", {
                name: role.name || this.t("common.unknown"),
                server: role.server,
            });
        },
        getRolePointsTitle(role) {
            return `${this.getRoleFullName(role)} · ${this.t("matrix.totalSeniority")} ${this.formatNumber(
                role.totalPoints
            )}`;
        },
        getAchievementLink(achievementId) {
            return getLink("achievement", achievementId);
        },
        getIconUrl(iconId) {
            return iconLink(iconId);
        },
        getAchievementPointsValue(achievement) {
            const achievementId = String(achievement.ID ?? achievement.id ?? "");
            return Number(this.achievementPointsData[achievementId]) || 0;
        },
        formatNumber(value) {
            return Number(value || 0).toLocaleString();
        },
        getAchievementCategory(achievement) {
            let mainCategory = this.currentMenuGroup?.name || this.t("common.unknown");
            let subCategory = "";

            if (achievement.Detail && this.currentMenuGroup?.children) {
                const child = this.currentMenuGroup.children.find(
                    (item) => item.detail === achievement.Detail
                );
                subCategory = child?.name || this.t("common.unknown");
            }
            return { mainCategory, subCategory };
        },
        buildExcelData() {
            const headers = [
                this.t("export.headers.category"),
                this.t("export.headers.achievement"),
                this.t("export.headers.points"),
                ...this.compareRoles.map((role) => this.getRoleFullName(role)),
            ];
            const rows = this.visibleAchievements.map((achievement) => {
                const category = this.getAchievementCategory(achievement);
                const achievementId = String(achievement.ID ?? achievement.id ?? "");

                return [
                    [category.mainCategory, category.subCategory].filter(Boolean).join(" / "),
                    achievement.Name || this.t("common.unknown"),
                    this.getAchievementPointsValue(achievement),
                    ...this.compareRoles.map((role) =>
                        normalizeCompletedAchievementIds(role.completedAchievements).includes(
                            achievementId
                        )
                            ? this.t("status.completed")
                            : this.t("status.incomplete")
                    ),
                ];
            });
            return [headers, ...rows];
        },
        exportToExcel() {
            if (!this.canExport) {
                this.$message.warning(this.t("export.noData"));
                return;
            }

            this.isExporting = true;
            try {
                const worksheet = XLSX.utils.aoa_to_sheet(this.buildExcelData());
                worksheet["!cols"] = [
                    { wch: 22 },
                    { wch: 32 },
                    { wch: 12 },
                    ...this.compareRoles.map(() => ({ wch: 18 })),
                ];
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    this.t("export.sheetName").slice(0, 31)
                );
                const date = new Date().toISOString().slice(0, 10);
                const fileName = this.t("export.fileName", { date }).replace(/[\\/:*?"<>|]/g, "_");
                XLSX.writeFile(workbook, fileName);
                this.$message.success(this.t("export.success"));
            } catch (error) {
                console.error("Failed to export achievement comparison:", error);
                this.$message.error(this.t("export.failed"));
            } finally {
                this.isExporting = false;
            }
        },
    },
};
</script>
