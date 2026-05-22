<template>
    <div class="p-pvx-compare">
        <!-- 顶部标题栏 -->
        <div class="u-pvx-header">
            <!-- 页面标题 -->
            <div class="u-pvx-title-label">亲友对比</div>
            <!-- 工具栏：筛选和搜索 -->
            <div class="u-pvx-toolbar">
                <!-- 筛选下拉框 -->
                <div class="u-pvx-filter-select">
                    <el-select v-model="selectedFilter" placeholder="请选择" multiple collapse-tags clearable
                        @change="handleFilterChange">
                        <el-option v-for="option in filterOptions" :key="option.type" :label="option.name"
                            :value="option.type" :disabled="isFilterOptionDisabled(option.type)" />
                    </el-select>
                </div>

                <!-- 搜索输入框 -->
                <el-input placeholder="输入成就名称/成就描述/称号/奖励物品「回车」进行搜索" v-model="searchKeyword" class="u-pvx-search-input"
                    @keydown.enter="handleSearch">
                    <template #prepend>
                        <el-cascader v-model="selectedMap" :options="mapOptions" @change="handleSearch"
                            :show-all-levels="false" clearable class="u-pvx-map-cascader" />
                    </template>
                    <template #append>
                        <el-button icon="Search" class="u-pvx-search-btn" @click="handleSearch" />
                    </template>
                </el-input>
            </div>
            <!-- 导出按钮 -->
            <div class="u-pvx-export-btn" @click="exportToExcel">
                导出当前表格
            </div>
        </div>

        <!-- 主内容区域 -->
        <div class="m-pvx-compare-main">
            <!-- 左侧菜单栏 -->
            <div class="u-pvx-sidebar">
                <ul class="u-pvx-menu-group" :class="{
                    'is-active': menuGroup.sub === activeMenuIndex,
                    'is-collapsed': menuGroup.sub === activeMenuIndex && !isMenuExpanded,
                }" v-for="(menuGroup, groupIndex) in menuList" :key="groupIndex"
                    @click="handleMenuGroupClick(menuGroup.sub)">
                    <!-- 菜单组标题 -->
                    <div class="u-pvx-menu-group-title">
                        {{ menuGroup.name }}
                    </div>
                    <!-- 菜单项列表 -->
                    <li class="u-pvx-menu-item" :class="{ 'is-active': menuItem.detail === activeMenuItemDetail }"
                        v-for="(menuItem, itemIndex) in menuGroup.children" :key="itemIndex"
                        @click.stop="handleMenuItemClick(menuGroup.sub, menuItem.detail)">
                        {{ menuItem.name }}
                    </li>
                </ul>
            </div>

            <!-- 右侧内容区 -->
            <div class="u-pvx-content">
                <!-- 表格容器 -->
                <div class="u-pvx-table-wrapper">
                    <!-- 表头：角色名称行 -->
                    <div class="u-pvx-table-header" :style="{ width: getTableWidth }">
                        <div class="u-pvx-table-cell is-sticky">成就名称</div>
                        <!-- 对比角色列表 -->
                        <div class="u-pvx-table-cell" v-for="(role, roleIndex) in compareRoles" :key="roleIndex">
                            <div class="u-pvx-role-name" :title="getRoleFullName(role)">
                                {{ getRoleFullName(role) }}
                            </div>
                            <el-icon class="u-pvx-remove-icon" @click="removeCompareRole(role, roleIndex)" />
                        </div>
                    </div>

                    <!-- 总资历行 -->
                    <div class="u-pvx-points-table" :style="{ width: getTableWidth }">
                        <div class="u-pvx-table-cell is-sticky">总资历</div>
                        <!-- 各角色资历点数 -->
                        <div class="u-pvx-table-cell" v-for="(role, roleIndex) in compareRoles" :key="roleIndex">
                            <div class="u-pvx-role-name" :title="getRolePointsTitle(role)">
                                {{ role.totalPoints }}
                            </div>
                        </div>
                    </div>

                    <!-- 成就列表主体 -->
                    <div class="u-pvx-table-body" :style="{ width: getTableWidth }" v-loading="isLoading">
                        <!-- 成就名称列 -->
                        <div class="u-pvx-achievement-list is-sticky">
                            <div class="u-pvx-achievement-item"
                                v-for="(achievement, achievementIndex) in achievementList" :key="achievementIndex">
                                <el-tooltip effect="dark" :content="achievement.Desc" placement="top">
                                    <a :href="getAchievementLink(achievement.ID)" target="_blank">
                                        <div class="u-pvx-achievement-info">
                                            <img class="u-pvx-achievement-icon"
                                                :src="getIconUrl(achievement?.IconID)" />
                                            <span class="u-pvx-achievement-name">{{ achievement?.Name }}</span>
                                        </div>
                                    </a>
                                </el-tooltip>
                            </div>
                        </div>
                        <!-- 各角色完成状态列 -->
                        <div class="u-pvx-achievement-list" v-for="(role, roleIndex) in compareRoles" :key="roleIndex">
                            <div class="u-pvx-achievement-item"
                                v-for="(status, statusIndex) in role.achievementStatusList" :key="statusIndex">
                                <div class="u-pvx-status-check" :class="{ 'is-completed': status.value !== '-1' }">
                                    <el-icon v-if="status.value !== '-1'">
                                        <Select color="#000000" />
                                    </el-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 添加角色按钮 -->
                <div class="u-pvx-add-role" @click="openAddRoleDialog">
                    <img class="u-pvx-add-icon" :src="require('@/assets/img/wiki/compare/add.svg')" alt="添加角色" />
                    <div class="u-pvx-add-text">添加角色</div>
                </div>
            </div>
        </div>

        <!-- 添加角色弹窗 -->
        <el-dialog v-model="isAddRoleDialogVisible" title="添加角色" width="420px" draggable :close-on-click-modal="false">
            <el-form :model="roleFormData" :rules="formRules" ref="roleFormRef">
                <el-form-item label="角色类型" prop="roleType">
                    <el-radio-group v-model="roleFormData.roleType" @input="handleRoleTypeChange">
                        <el-radio label="1">自身</el-radio>
                        <el-radio label="2">亲友</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="我的亲友" prop="uid" v-if="roleFormData.roleType === '2'">
                    <el-select v-model="roleFormData.uid" placeholder="请选择" @change="loadFriendRoles">
                        <el-option v-for="(friend, friendIndex) in friendList" :key="friendIndex"
                            :label="friend?.kith_info?.display_name || '-'" :value="friend.kith_id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="对应角色" prop="jx3Id">
                    <el-select v-model="roleFormData.jx3Id" placeholder="请选择对应角色" @change="updateSelectedRoleInfo"
                        multiple>
                        <el-option v-for="(role, roleIndex) in availableRoleList" :key="roleIndex" :label="role.name"
                            :value="role.jx3id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="u-pvx-dialog-tips">
                <div>
                    <el-icon class="u-pvx-tip-icon" />&nbsp;提示
                </div>
                1. 添加亲友角色后，可对比亲友角色与自身角色的成就进度。<br />
                2. 去<a href="https://www.jx3box.com/dashboard/privacy?tab=whitelist" target="_blank">添加亲友</a>
            </div>
            <template #footer>
                <div class="u-pvx-dialog-footer">
                    <el-button @click="closeAddRoleDialog">取 消</el-button>
                    <el-button type="primary" @click="confirmAddRole">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
/**
 * 亲友对比页面
 * 功能：对比多个角色的成就完成情况，支持筛选、搜索和导出Excel
 */
import {
    getRoleGameAchievements,
    getMenuAchievements,
    getMenus,
    getAchievementPoints,
    searchAchievements,
    getMapList,
} from "@/service/achievement";
import { getMyKith, getMyKithRoles } from "@/service/wiki";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { getUserRoles } from "@/service/team";
import { cloneDeep } from "lodash";
import * as XLSX from 'xlsx';

export default {
    name: 'ComparePage',

    data() {
        return {
            // ==================== 用户相关 ====================
            currentUserRole: {},           // 当前登录用户的默认角色
            userRoleList: [],              // 当前用户的所有角色列表

            // ==================== 菜单相关 ====================
            menuList: [],                  // 成就菜单列表
            activeMenuIndex: 1,            // 当前选中的菜单组索引
            activeMenuItemDetail: null,    // 当前选中的菜单项详情
            isMenuExpanded: true,          // 菜单展开状态

            // ==================== 筛选相关 ====================
            selectedFilter: [],            // 当前选中的筛选条件
            filterOptions: [               // 筛选选项列表
                {
                    name: "共同未完成的",
                    value: 1,
                    type: "1,1",
                },
            ],

            // ==================== 成就相关 ====================
            achievementList: [],           // 当前显示的成就列表
            achievementListBackup: [],     // 成就列表备份（用于筛选还原）
            isLoading: false,              // 加载状态
            achievementPointsData: [],     // 成就点数数据

            // ==================== 搜索相关 ====================
            searchKeyword: "",             // 搜索关键词
            selectedMap: [],               // 选中的地图
            mapOptions: [],                // 地图选项列表

            // ==================== 角色对比相关 ====================
            compareRoles: [],              // 对比的角色列表
            compareRolesBackup: [],        // 对比角色列表备份

            // ==================== 弹窗相关 ====================
            isAddRoleDialogVisible: false, // 添加角色弹窗显示状态
            friendList: [],                // 亲友列表
            friendRoleList: [],            // 亲友角色列表
            roleFormData: {                // 添加角色表单数据
                roleType: "1",             // 角色类型：1-自身，2-亲友
                uid: "",                   // 亲友ID
                jx3Id: [],                 // 选中的角色ID列表
                roleInfoList: [],          // 选中的角色信息列表
            },
            formRules: {                   // 表单验证规则
                roleType: { required: true, message: "请选择类型", trigger: "change" },
                uid: { required: true, message: "请选择亲友", trigger: "change" },
                jx3Id: { required: true, message: "请选择角色", trigger: "change" },
            },
        };
    },

    /**
     * 计算属性
     */
    computed: {
        /**
         * 计算表格宽度
         * @returns {string} 表格宽度样式
         */
        getTableWidth() {
            const columnCount = this.compareRoles.length + 1;
            return `${columnCount * 200}px`;
        },

        /**
         * 获取可用的角色列表
         * 根据角色类型返回对应的角色列表
         * @returns {Array} 角色列表
         */
        availableRoleList() {
            return this.roleFormData.roleType === '1'
                ? this.userRoleList
                : this.friendRoleList;
        },
    },

    /**
     * 生命周期：组件创建时
     */
    created() {
        this.initializePage();
    },

    methods: {
        // ==================== 工具方法 ====================

        /**
         * 获取成就详情链接
         * @param {number} achievementId - 成就ID
         * @returns {string} 成就详情页链接
         */
        getAchievementLink(achievementId) {
            return getLink("achievement", achievementId);
        },

        /**
         * 获取图标URL
         * @param {number} iconId - 图标ID
         * @returns {string} 图标链接
         */
        getIconUrl(iconId) {
            return iconLink(iconId);
        },

        /**
         * 获取角色完整名称（名称·服务器）
         * @param {Object} role - 角色对象
         * @returns {string} 角色完整名称
         */
        getRoleFullName(role) {
            return `${role.name}·${role.server}`;
        },

        /**
         * 获取角色资历提示文本
         * @param {Object} role - 角色对象
         * @returns {string} 资历提示文本
         */
        getRolePointsTitle(role) {
            return `${this.getRoleFullName(role)}总资历：${role.totalPoints}`;
        },

        // ==================== 初始化方法 ====================

        /**
         * 初始化页面
         * 加载用户角色和地图数据
         */
        initializePage() {
            this.loadUserRoles();
            this.loadMapOptions();
        },

        /**
         * 加载当前用户的角色列表
         */
        loadUserRoles() {
            if (!User.isLogin()) {
                this.$confirm("请先登录").then(() => {
                    User.toLogin(window.location.href);
                }).catch(() => {});
                return;
            }

            getUserRoles().then((response) => {
                const roleList = response.data?.data?.list || [];
                this.userRoleList = roleList;
                this.currentUserRole = roleList[0] || {};

                // 加载成就点数数据
                this.loadAchievementPoints();
                // 加载亲友列表
                this.loadFriendList();
            });
        },

        /**
         * 加载地图选项列表
         */
        loadMapOptions() {
            const client = this.$store.state.client;
            const params = {
                client,
                _no_page: 1,
            };

            getMapList(params).then((response) => {
                const mapData = response.data.data || [];
                this.mapOptions = this.formatMapOptions(mapData);
            });
        },

        /**
         * 格式化地图选项数据
         * @param {Array} mapData - 原始地图数据
         * @returns {Array} 格式化后的地图选项
         */
        formatMapOptions(mapData) {
            const regionMap = {};

            mapData.forEach(map => {
                if (!map.RegionName) return;

                if (!regionMap[map.RegionName]) {
                    regionMap[map.RegionName] = {
                        value: Number(map.Region),
                        label: map.RegionName,
                        children: [],
                    };
                }

                regionMap[map.RegionName].children.push({
                    value: Number(map.ID),
                    label: map.MapName,
                    parent: Number(map.Region),
                });
            });

            return Object.values(regionMap);
        },

        /**
         * 加载成就点数数据
         */
        loadAchievementPoints() {
            getAchievementPoints().then((response) => {
                this.achievementPointsData = response.data.data.points;
                this.loadAchievementMenuList();
            });
        },

        /**
         * 加载成就菜单列表
         */
        loadAchievementMenuList() {
            getMenus({
                general: 1,
                client: this.$store.state.client,
            }).then((response) => {
                this.menuList = response.data.data.menus;
                // 默认加载第一个菜单的成就
                this.loadAchievementsByMenu(1, "", true);
            });
        },

        /**
         * 加载亲友列表
         */
        loadFriendList() {
            getMyKith().then((response) => {
                this.friendList = response.data.data;
            });
        },

        // ==================== 菜单交互方法 ====================

        /**
         * 处理菜单组点击事件
         * @param {number} subMenuIndex - 子菜单索引
         */
        handleMenuGroupClick(subMenuIndex) {
            if (this.isLoading) return;

            this.activeMenuIndex = subMenuIndex;
            this.activeMenuItemDetail = null;
            this.loadAchievementsByMenu(subMenuIndex, null);
        },

        /**
         * 处理菜单项点击事件
         * @param {number} subMenuIndex - 子菜单索引
         * @param {string} detail - 菜单项详情
         */
        handleMenuItemClick(subMenuIndex, detail) {
            if (this.isLoading) return;

            this.activeMenuIndex = subMenuIndex;
            this.activeMenuItemDetail = detail;
            this.loadAchievementsByMenu(subMenuIndex, detail);
        },

        /**
         * 根据菜单加载成就列表
         * @param {number} subMenuIndex - 子菜单索引
         * @param {string} detail - 菜单项详情
         * @param {boolean} isInitialLoad - 是否为首次加载
         */
        loadAchievementsByMenu(subMenuIndex = 1, detail, isInitialLoad = false) {
            this.isLoading = true;

            getMenuAchievements(subMenuIndex, detail)
                .then((response) => {
                    const rawAchievements = response.data.data.achievements || [];
                    this.achievementList = this.flattenAchievementList(rawAchievements);
                    this.achievementListBackup = cloneDeep(this.achievementList);

                    if (!isInitialLoad) {
                        this.updateRoleAchievementStatus();
                        this.applyFilter();
                    } else {
                        // 首次加载时，自动添加当前用户角色
                        if (this.currentUserRole?.jx3id) {
                            this.addCompareRole(this.currentUserRole.jx3id, true);
                        }
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },

        /**
         * 扁平化成就列表（处理系列成就）
         * @param {Array} rawAchievements - 原始成就列表
         * @returns {Array} 扁平化后的成就列表
         */
        flattenAchievementList(rawAchievements) {
            const flattenedList = [];

            rawAchievements.forEach(achievement => {
                flattenedList.push(achievement);

                // 处理系列成就
                if (achievement.SeriesAchievementList) {
                    achievement.SeriesAchievementList.forEach((seriesItem, index) => {
                        if (index > 0) {
                            flattenedList.push(seriesItem);
                        }
                    });
                }
            });

            return flattenedList;
        },

        // ==================== 搜索方法 ====================

        /**
         * 处理搜索事件
         */
        handleSearch() {
            this.activeMenuIndex = null;
            this.activeMenuItemDetail = null;
            this.searchAchievements();
        },

        /**
         * 搜索成就
         */
        searchAchievements() {
            this.isLoading = true;

            const params = {
                keyword: this.searchKeyword,
                scene: this.selectedMap?.[1] ?? "",
                client: this.$store.state.client,
                _no_page: 1,
                limit: 99999,
            };

            searchAchievements(params)
                .then((response) => {
                    const rawAchievements = response.data.data.achievements || [];
                    this.achievementList = this.flattenAchievementList(rawAchievements);
                    this.achievementListBackup = cloneDeep(this.achievementList);
                    this.updateRoleAchievementStatus();
                    this.applyFilter();
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },

        // ==================== 筛选方法 ====================

        /**
         * 处理筛选条件变更
         */
        handleFilterChange() {
            this.applyFilter();
        },

        /**
         * 判断筛选选项是否禁用
         * 同一角色不能同时选中"已完成"和"未完成"
         * @param {string} filterType - 筛选类型（格式：jx3id,status）
         * @returns {boolean} 是否禁用
         */
        isFilterOptionDisabled(filterType) {
            const [targetRoleId] = filterType.split(",");

            return this.selectedFilter.some(selected => {
                const [selectedRoleId, selectedStatus] = selected.split(",");
                return selectedRoleId === targetRoleId && selected.split(",")[1] !== filterType.split(",")[1];
            });
        },

        /**
         * 应用筛选条件
         */
        applyFilter() {
            const selectedFilters = cloneDeep(this.selectedFilter);

            // 无筛选条件时，显示全部成就
            if (selectedFilters.length === 0) {
                this.achievementList = cloneDeep(this.achievementListBackup);
                this.updateRoleAchievementStatus();
                return;
            }

            // 处理筛选逻辑
            const { normalizedFilters, normalizedValue } = this.normalizeFilterValue(selectedFilters);
            this.selectedFilter = normalizedFilters;

            // 根据筛选条件过滤成就
            const filteredAchievementKeys = this.getFilteredAchievementKeys(normalizedValue);
            this.achievementList = filteredAchievementKeys
                .map(key => this.achievementListBackup[key])
                .filter(Boolean);

            this.updateRoleAchievementStatus(true);
        },

        /**
         * 规范化筛选值
         * @param {Array} filters - 原始筛选值
         * @returns {Object} 规范化后的筛选值
         */
        normalizeFilterValue(filters) {
            const COMMON_UNFINISHED = "1,1";
            let normalizedValue = "";
            let normalizedFilters = cloneDeep(filters);

            // 处理"共同未完成"选项
            if (filters[filters.length - 1] === COMMON_UNFINISHED) {
                normalizedValue = COMMON_UNFINISHED;
                normalizedFilters = [COMMON_UNFINISHED];
            } else if (filters.length === 1) {
                normalizedValue = filters[0];
            } else if (filters.length > 1 && filters[0] === COMMON_UNFINISHED) {
                normalizedValue = filters[filters.length - 1];
                normalizedFilters = [normalizedValue];
            } else if (filters.length > 1) {
                normalizedValue = filters;
            }

            return { normalizedFilters, normalizedValue };
        },

        /**
         * 获取过滤后的成就索引列表
         * @param {string|Array} filterValue - 筛选值
         * @returns {Array} 成就索引数组
         */
        getFilteredAchievementKeys(filterValue) {
            const statusArrays = [];
            const COMMON_UNFINISHED = "1,1";

            this.compareRolesBackup.forEach(role => {
                const statusList = this.getRoleFilteredStatusList(role, filterValue, COMMON_UNFINISHED);
                statusArrays.push(statusList);
            });

            return this.getIntersectionByKey(statusArrays, "key");
        },

        /**
         * 获取角色过滤后的状态列表
         * @param {Object} role - 角色对象
         * @param {string|Array} filterValue - 筛选值
         * @param {string} commonFilter - 通用筛选值
         * @returns {Array} 状态列表
         */
        getRoleFilteredStatusList(role, filterValue, commonFilter) {
            const statusList = [];

            const filterByStatus = (achievements, statusType) => {
                achievements.forEach(achievement => {
                    const isUnfinished = achievement.value === "-1";
                    const isFinished = achievement.value !== "-1";

                    if ((isUnfinished && statusType === 1) || (isFinished && statusType === 2)) {
                        statusList.push({
                            key: achievement.key,
                            value: achievement.value
                        });
                    }
                });
            };

            if (filterValue === commonFilter) {
                const [, status] = filterValue.split(",");
                filterByStatus(role.achievementStatusList, Number(status));
            } else if (typeof filterValue === "string") {
                const [roleId, status] = filterValue.split(",");
                if (role.jx3id === roleId) {
                    filterByStatus(role.achievementStatusList, Number(status));
                }
            } else if (Array.isArray(filterValue)) {
                filterValue.forEach(filter => {
                    const [roleId, status] = filter.split(",");
                    if (role.jx3id === roleId) {
                        filterByStatus(role.achievementStatusList, Number(status));
                    }
                });
            }

            return statusList;
        },

        /**
         * 获取多个数组的交集（基于指定键）
         * @param {Array} arrays - 对象数组列表
         * @param {string} key - 用于比较的键
         * @returns {Array} 交集结果
         */
        getIntersectionByKey(arrays, key) {
            if (arrays.length === 0) return [];

            const mappedArrays = arrays.map(array => array.map(obj => obj[key]));

            return mappedArrays.reduce((acc, curr) => {
                return acc.filter(value => curr.includes(value));
            });
        },

        // ==================== 角色管理方法 ====================

        /**
         * 打开添加角色弹窗
         */
        openAddRoleDialog() {
            this.roleFormData = {
                roleType: "1",
                uid: "",
                jx3Id: [],
                roleInfoList: [],
            };
            this.isAddRoleDialogVisible = true;

            this.$nextTick(() => {
                this.$refs.roleFormRef.clearValidate();
            });
        },

        /**
         * 关闭添加角色弹窗
         */
        closeAddRoleDialog() {
            this.isAddRoleDialogVisible = false;
        },

        /**
         * 处理角色类型变更
         */
        handleRoleTypeChange() {
            this.roleFormData.uid = "";
            this.roleFormData.jx3Id = [];
            this.roleFormData.roleInfoList = [];
        },

        /**
         * 加载亲友的角色列表
         */
        loadFriendRoles() {
            getMyKithRoles(this.roleFormData.uid).then((response) => {
                this.friendRoleList = response.data.data;
                this.roleFormData.jx3Id = [];
            });
        },

        /**
         * 更新选中的角色信息
         * @param {Array} selectedRoleIds - 选中的角色ID列表
         */
        updateSelectedRoleInfo(selectedRoleIds) {
            const roleList = this.roleFormData.roleType === '1'
                ? this.userRoleList
                : this.friendRoleList;

            this.roleFormData.roleInfoList = selectedRoleIds.map(jx3Id => {
                return roleList.find(role => role.jx3id === jx3Id);
            });
        },

        /**
         * 确认添加角色
         */
        confirmAddRole() {
            this.roleFormData.jx3Id.forEach(jx3Id => {
                const roleInfo = this.roleFormData.roleType === '1'
                    ? this.userRoleList.find(role => role.jx3id === jx3Id)
                    : this.friendRoleList.find(role => role.jx3id === jx3Id);

                // 检查角色是否已存在
                const isRoleExists = this.compareRoles.some(role => role.jx3id === jx3Id);

                if (!isRoleExists) {
                    this.addCompareRole(jx3Id, false, roleInfo);
                }
            });

            this.closeAddRoleDialog();
        },

        /**
         * 添加对比角色
         * @param {string} jx3Id - 角色ID
         * @param {boolean} isCurrentUser - 是否为当前用户
         * @param {Object} roleInfo - 角色信息
         */
        addCompareRole(jx3Id, isCurrentUser = false, roleInfo = null) {
            getRoleGameAchievements(jx3Id).then((response) => {
                const completedAchievements = (response.data?.data?.achievements || "").split(",");

                // 计算总资历
                const totalPoints = this.calculateTotalPoints(completedAchievements);

                const newRole = {
                    ...(isCurrentUser ? this.currentUserRole : roleInfo),
                    completedAchievements,
                    achievementStatusList: [],
                    totalPoints,
                };

                // 添加筛选选项
                this.addFilterOptionsForRole(newRole);

                // 更新对比角色列表
                if (isCurrentUser && this.compareRoles[0]) {
                    this.compareRoles[0] = newRole;
                } else {
                    this.compareRoles.push(newRole);
                }

                // 更新成就状态
                this.achievementList = cloneDeep(this.achievementListBackup);
                this.updateRoleAchievementStatus();
                this.applyFilter();
            });
        },

        /**
         * 计算角色总资历点数
         * @param {Array} completedAchievements - 已完成成就ID列表
         * @returns {number} 总资历点数
         */
        calculateTotalPoints(completedAchievements) {
            return completedAchievements.reduce((total, achievementId) => {
                return total + (this.achievementPointsData[achievementId] || 0);
            }, 0);
        },

        /**
         * 为角色添加筛选选项
         * @param {Object} role - 角色对象
         */
        addFilterOptionsForRole(role) {
            this.filterOptions.push({
                value: role.jx3id,
                name: `${role.name}未完成`,
                type: `${role.jx3id},1`,
            });
            this.filterOptions.push({
                value: role.jx3id,
                name: `${role.name}已完成`,
                type: `${role.jx3id},2`,
            });
        },

        /**
         * 移除对比角色
         * @param {Object} role - 要移除的角色
         * @param {number} roleIndex - 角色索引
         */
        removeCompareRole(role, roleIndex) {
            // 从对比列表中移除
            this.compareRoles.splice(roleIndex, 1);
            this.selectedFilter = [];

            // 从筛选选项中移除
            this.filterOptions = this.filterOptions.filter(
                option => option.value !== role.jx3id
            );

            this.applyFilter();
        },

        /**
         * 更新所有角色的成就完成状态
         * @param {boolean} keepBackup - 是否保持备份数据不变
         */
        updateRoleAchievementStatus(keepBackup = false) {
            this.compareRoles.forEach((role, roleIndex) => {
                this.compareRoles[roleIndex].achievementStatusList = this.achievementList.map((achievement, index) => {
                    const isCompleted = role.completedAchievements.includes(achievement.ID.toString());
                    return {
                        key: index,
                        value: isCompleted ? achievement.ID.toString() : "-1"
                    };
                });
            });

            if (!keepBackup) {
                this.compareRolesBackup = cloneDeep(this.compareRoles);
            }
        },

        // ==================== 导出功能 ====================

        /**
         * 导出当前表格到Excel
         */
        exportToExcel() {
            try {
                // 验证数据
                if (!this.validateExportData()) return;

                // 构建Excel数据
                const excelData = this.buildExcelData();

                // 创建并导出工作簿
                const workbook = this.createExcelWorkbook(excelData);
                const fileName = this.generateExportFileName();

                XLSX.writeFile(workbook, `${fileName}.xlsx`);
                this.$message.success('导出成功');
            } catch (error) {
                console.error('导出Excel失败:', error);
                this.$message.error('导出失败,请重试');
            }
        },

        /**
         * 验证导出数据
         * @returns {boolean} 是否验证通过
         */
        validateExportData() {
            if (!this.achievementList || this.achievementList.length === 0) {
                this.$message.warning('暂无成就数据可导出');
                return false;
            }
            if (!this.compareRoles || this.compareRoles.length === 0) {
                this.$message.warning('请先添加对比角色');
                return false;
            }
            return true;
        },

        /**
         * 构建Excel数据
         * @returns {Array} Excel数据数组
         */
        buildExcelData() {
            const excelData = [];

            // 构建表头
            const headers = ['成就大类', '成就小类', '成就名称'];
            this.compareRoles.forEach(role => {
                headers.push(this.getRoleFullName(role));
            });
            excelData.push(headers);

            // 构建数据行
            this.achievementList.forEach((achievement, achievementIndex) => {
                const { mainCategory, subCategory } = this.getAchievementCategory(achievement);

                const rowData = [
                    mainCategory,
                    subCategory,
                    achievement.Name || ''
                ];

                // 添加各角色完成状态
                this.compareRoles.forEach(role => {
                    const status = role.achievementStatusList.find(s => s.key === achievementIndex);
                    rowData.push(status && status.value !== '-1' ? '已完成' : '未完成');
                });

                excelData.push(rowData);
            });

            return excelData;
        },

        /**
         * 获取成就分类信息
         * @param {Object} achievement - 成就对象
         * @returns {Object} 分类信息
         */
        getAchievementCategory(achievement) {
            let mainCategory = '未知';
            let subCategory = '';

            if (!this.menuList) return { mainCategory, subCategory };

            // 查找主分类
            let mainCategoryData = null;
            for (const key in this.menuList) {
                if (this.menuList.hasOwnProperty(key)) {
                    const element = this.menuList[key];
                    if (element.sub === this.activeMenuIndex) {
                        mainCategoryData = element;
                        mainCategory = element.name;
                        break;
                    }
                }
            }

            // 查找子分类
            if (achievement.Detail && mainCategoryData?.children) {
                const subCategoryData = mainCategoryData.children.find(
                    child => child.detail === achievement.Detail
                );
                subCategory = subCategoryData ? subCategoryData.name : '未知';
            }

            return { mainCategory, subCategory };
        },

        /**
         * 创建Excel工作簿
         * @param {Array} data - Excel数据
         * @returns {Object} 工作簿对象
         */
        createExcelWorkbook(data) {
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(data);

            // 设置列宽
            const columnWidths = [
                { wch: 15 }, // 成就大类
                { wch: 15 }, // 成就小类
                { wch: 30 }, // 成就名称
            ];
            this.compareRoles.forEach(() => {
                columnWidths.push({ wch: 12 });
            });
            worksheet['!cols'] = columnWidths;

            XLSX.utils.book_append_sheet(workbook, worksheet, '资历对比');
            return workbook;
        },

        /**
         * 生成导出文件名
         * @returns {string} 文件名
         */
        generateExportFileName() {
            // 获取完成状态描述
            let completionStatus = '全部成就';
            if (this.selectedFilter?.length > 0) {
                completionStatus = this.selectedFilter.includes('1,1')
                    ? '共同未完成'
                    : '自定义筛选';
            }

            // 获取角色名称
            const roleNames = this.compareRoles
                .map(role => this.getRoleFullName(role))
                .join('-');

            // 获取分类名称
            const { mainCategory, subCategory } = this.getCurrentCategoryNames();

            let fileName = `剑网3资历对比-${mainCategory}-${subCategory}-${completionStatus}（${roleNames}）`;

            // 处理文件名中的特殊字符
            return fileName.replace(/[\\/:*?"<>|]/g, '_');
        },

        /**
         * 获取当前选中的分类名称
         * @returns {Object} 分类名称
         */
        getCurrentCategoryNames() {
            let mainCategory = '全部';
            let subCategory = '全部';

            if (!this.menuList) return { mainCategory, subCategory };

            // 查找主分类
            let mainCategoryData = null;
            for (const key in this.menuList) {
                if (this.menuList.hasOwnProperty(key)) {
                    const element = this.menuList[key];
                    if (element.sub === this.activeMenuIndex) {
                        mainCategory = element.name;
                        mainCategoryData = element;
                        break;
                    }
                }
            }

            // 查找子分类
            if (this.activeMenuItemDetail && mainCategoryData?.children) {
                const subCategoryData = mainCategoryData.children.find(
                    child => child.detail === this.activeMenuItemDetail
                );
                subCategory = subCategoryData ? subCategoryData.name : '全部';
            }

            return { mainCategory, subCategory };
        },
    },
};
</script>

<style lang="less">
/* ==================== 全局滚动条样式 ==================== */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: #595958;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: #e2d3b9;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #e2d3b9;
}

.u-pvx-sidebar {
    &::-webkit-scrollbar {
        width: 2px;
    }
}

/* ==================== 页面容器 ==================== */
.p-pvx-compare {
    margin-top: 45px;
    min-width: 1200px;
    max-width: 1620px;
    box-sizing: border-box;

    /* ==================== 顶部标题栏 ==================== */
    .u-pvx-header {
        .flex;
        align-items: center;
        .mb(8px);

        /* 标题标签 */
        .u-pvx-title-label {
            .w(115px);
            flex-shrink: 0;
            mask-image: linear-gradient(180deg, rgba(255, 255, 255, 1) 43.06%, rgba(255, 255, 255, 0) 100%);
            .fz(26px);
            .bold(900);
            color: #fff;
        }

        /* 工具栏 */
        .u-pvx-toolbar {
            flex: 1;
            .h(28px);
            gap: 12px;
            .flex;
            align-items: center;

            /* 筛选下拉框 */
            .u-pvx-filter-select {
                width: 168px;
            }

            .el-select .el-select__wrapper {
                background-color: transparent;
                box-shadow: none;
                border: 1px solid rgba(217, 196, 167, 1);
                min-height: 28px;
            }

            /* 搜索输入框 */
            .u-pvx-search-input {
                .w(600px);
                border: 1px solid rgba(217, 196, 167, 1);
            }

            .el-input-group__prepend {
                padding: 0 !important;
            }

            .el-input-group__append,
            .el-input-group__prepend {
                border: 0;
            }

            .el-input-group__prepend,
            .el-input__wrapper {
                background-color: transparent;
                box-shadow: none;
                min-height: 28px;
                .h(28px);

                .el-input__inner {
                    color: #D9C4A7;
                }
            }

            /* 地图级联选择器 */
            .u-pvx-map-cascader {
                .w(160px);
                border: none;
                background-color: transparent;

                .el-input__wrapper {
                    border-right: 1px solid rgba(217, 196, 167, 1);
                    border-radius: 0;
                }
            }

            /* 搜索按钮 */
            .u-pvx-search-btn {
                .h(28px);
                background-color: rgba(255, 236, 204, 1);
                color: #000;
            }
        }

        /* 导出按钮 */
        .u-pvx-export-btn {
            flex-shrink: 0;
            .size(168px, 28px);
            .r(4px);
            border: 1px solid rgba(217, 196, 167, 1);
            .flex;
            .flex(o);
            flex-direction: column;
            padding: 0 12px;
            .fz(14px);
            font-weight: 400;
            letter-spacing: 0;
            color: rgba(217, 196, 167, 1);

            &:hover {
                background: rgba(217, 196, 167, 1);
                color: rgba(82, 70, 61, 1);
                cursor: pointer;
            }
        }
    }

    /* ==================== 主内容区域 ==================== */
    .m-pvx-compare-main {
        height: calc(100vh - 170px);
        padding: 0;
        .flex;

        /* 左侧菜单栏 */
        .u-pvx-sidebar {
            flex: 0 0 106px;
            color: #ffeccc;
            background: #1b1814;
            height: 100%;
            overflow-y: auto;

            ul,
            li {
                padding: 0;
                margin: 0;
            }

            /* 菜单组 */
            .u-pvx-menu-group {
                cursor: pointer;
                padding: 4px 4px 4px 2px;
                box-sizing: border-box;

                &.is-active {
                    .u-pvx-menu-group-title {
                        background: #3d342a;
                    }

                    .u-pvx-menu-item {
                        transition: display 0.5s ease-in;
                        display: block;
                    }
                }

                &.is-collapsed {
                    .u-pvx-menu-item {
                        display: none;
                        transition: display 0.5s ease-out;
                    }
                }

                /* 菜单组标题 */
                .u-pvx-menu-group-title {
                    .fz(14px);
                    padding: 4px;
                    .bold(700);
                }
            }

            /* 菜单项 */
            .u-pvx-menu-item {
                .bold(400);
                .fz(12px);
                display: none;
                color: rgba(255, 236, 204, 1);
                padding: 4px 0 4px 20px;
                .pr;

                &.is-active {
                    background: #3d342a;

                    &::before {
                        content: "";
                        .ps;
                        .lt(0, 50%);
                        .size(4px);
                        transform: translateY(-50%);
                        background-color: #fff;
                        .r(50%);
                        .dbi;
                    }
                }
            }
        }

        /* 右侧内容区 */
        .u-pvx-content {
            .h(100%);
            .flex;
            max-width: 1414px;
            min-width: 1093px;
            justify-content: space-between;

            /* 表格容器 */
            .u-pvx-table-wrapper {
                .h(100%);
                max-width: 912px;
                overflow: scroll;
                .pr;
                .fz(16px, 24px);
                .bold(400);
            }

            /* 表头 */
            .u-pvx-table-header {
                .flex;
                .w(100%);
                position: sticky;
                top: 0;
                .z(3);

                .u-pvx-table-cell {
                    background-color: #463c34;
                    padding: 0 12px;
                    box-sizing: border-box;
                    .size(200px, 50px);
                    flex-shrink: 0;
                    color: #ffeccc;
                    .flex;
                    .flex(o);

                    .u-pvx-role-name {
                        .mr(4px);
                        max-width: 170px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    &.is-sticky {
                        position: sticky;
                        left: 0;
                    }

                    .u-pvx-remove-icon {
                        cursor: pointer;
                    }
                }
            }

            /* 资历点数表 */
            .u-pvx-points-table {
                .flex;
                .w(100%);

                .u-pvx-table-cell {
                    background-color: #fff;
                    padding: 0 12px;
                    box-sizing: border-box;
                    .size(200px, 36px);
                    flex-shrink: 0;
                    color: #846b4b;
                    .flex;
                    .flex(o);

                    .u-pvx-role-name {
                        .mr(4px);
                        max-width: 170px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    &.is-sticky {
                        position: sticky;
                        left: 0;
                    }
                }
            }

            /* 表格主体 */
            .u-pvx-table-body {
                .h(calc(100% - 86px));
                .flex;
                .w(100%);
            }

            /* 成就列表 */
            .u-pvx-achievement-list {
                .size(200px, 100%);
                flex-shrink: 0;

                &.is-sticky {
                    position: sticky;
                    left: 0;
                    .z(2);
                }

                /* 成就项 */
                .u-pvx-achievement-item {
                    color: #ffeccc;
                    .w(100%);
                    min-height: 36px;
                    .flex;
                    .flex(o);

                    &:nth-child(odd) {
                        background: #ebe5df;
                    }

                    &:nth-child(even) {
                        background: #fff;
                    }

                    /* 成就信息 */
                    .u-pvx-achievement-info {
                        cursor: pointer;
                        .flex;
                        align-items: center;

                        .u-pvx-achievement-icon {
                            .size(22px);
                            margin: 0 18px 0 12px;
                        }

                        .u-pvx-achievement-name {
                            color: #846b4b;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            max-width: 140px;
                        }
                    }

                    /* 完成状态 */
                    .u-pvx-status-check {
                        .size(24px);
                        background: #fff;
                        border: 1px solid rgba(204, 204, 204, 1);
                        .r(4px);
                        .flex;
                        .flex(o);

                        &.is-completed {
                            border: none;
                            background: linear-gradient(180deg, rgba(181, 148, 87, 1) 0%, rgba(227, 211, 191, 1) 100%);
                        }
                    }
                }
            }

            /* 添加角色按钮 */
            .u-pvx-add-role {
                cursor: pointer;
                .size(168px, 100%);
                .fz(22px);
                .flex;
                .flex(o);
                flex-direction: column;
                border-radius: 10px;
                border: 1px solid #e2d3b9;
                .ml(12px);
                box-sizing: border-box;

                .u-pvx-add-icon {
                    margin-bottom: 12px;
                }

                .u-pvx-add-text {
                    font-size: 24px;
                    font-weight: 400;
                    letter-spacing: 0;
                    line-height: 34.75px;
                    color: rgba(226, 211, 185, 1);
                }
            }
        }
    }

    /* ==================== 弹窗样式 ==================== */
    .u-pvx-dialog-tips {
        margin-top: 16px;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 4px;
        font-size: 13px;
        color: #666;

        .u-pvx-tip-icon {
            color: #409eff;
        }
    }

    .u-pvx-dialog-footer {
        text-align: right;
    }
}
</style>
