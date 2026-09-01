<template>
    <div class="m-dj-form">
        <!-- 定制方案弹出层 -->
        <el-dialog
            :title="$t('pages.wiki.leap.ui.createPlan')"
            v-model="dialogTableVisible"
            lock-scroll
            width="888px"
            append-to-body
            destroy-on-close
            :close-on-click-modal="false"
            class="c-leap-plan-dialog"
        >
            <div class="u-dialog-content">
                <!-- 顶部 -->
                <div class="u-dialog-header">
                    <label class="u-dialog-header_item">
                        <span>{{ $t("pages.wiki.leap.ui.planName") }}</span>
                        <el-input
                            v-model="leapForm.title"
                            clearable
                            maxlength="40"
                            :placeholder="$t('pages.wiki.leap.ui.enterPlanName')"
                        ></el-input>
                    </label>
                    <label class="u-dialog-header_item">
                        <span>{{ $t("pages.wiki.leap.ui.targetSeniority") }}</span>
                        <el-input
                            v-model.number="leapForm.number"
                            type="number"
                            min="0"
                            inputmode="numeric"
                            :placeholder="$t('pages.wiki.leap.ui.enterTargetSeniority')"
                        ></el-input>
                    </label>
                </div>
                <div class="u-dialog-tips">{{ $t("pages.wiki.leap.ui.formDescription") }}</div>
                <!-- 主体左右布局 -->
                <div class="u-dialog-main">
                    <div class="u-dialog-main_left">
                        <div class="u-dialog-main_title">{{ $t("pages.wiki.leap.ui.direction") }}</div>
                        <div class="u-dialog-main_category">
                            <button type="button" class="u-dialog-main_category_item"
                                :class="{ active: dialogQueryParams.is_official == 1 }" @click="changeCategory(1)">
                                {{ $t("pages.wiki.leap.ui.recommended") }}
                            </button>
                            <button type="button" class="u-dialog-main_category_item"
                                :class="{ active: dialogQueryParams.is_official == 0 }" @click="changeCategory(0)">
                                {{ $t("pages.wiki.leap.ui.custom") }}
                            </button>
                        </div>
                    </div>
                    <div class="u-dialog-main_right">
                        <div class="u-dialog-main_title">
                            <span v-if="dialogQueryParams.is_official == 1">{{
                                $t("pages.wiki.leap.ui.recommendedPlans")
                            }}</span>
                            <div v-else class="u-dialog-main_search">
                                <div class="u-dialog-main_search_title">
                                    {{ $t("pages.wiki.leap.ui.customPlan") }}
                                </div>
                                <div class="u-dialog-main_tools">
                                    <el-checkbox v-model="isFilter" class="u-filter">
                                        {{ $t("pages.wiki.leap.ui.filterCompleted") }}
                                    </el-checkbox>
                                    <!-- 地图搜索框-->
                                    <div
                                        v-if="isSelectType == 2"
                                        class="u-select-input"
                                        :class="{ 'is-achievement-search': isSelectSearchType == 1 }"
                                    >
                                        <el-select
                                            v-model="isSelectSearchType"
                                            class="u-select-input_type"
                                            size="small"
                                            :placeholder="$t('pages.wiki.leap.ui.selectPlaceholder')"
                                            popper-class="m-select-input_type"
                                        >
                                            <el-option
                                                :label="$t('pages.wiki.leap.ui.achievement')"
                                                value="1"
                                            ></el-option>
                                            <el-option
                                                :label="$t('pages.wiki.leap.ui.map')"
                                                value="2"
                                            ></el-option>
                                        </el-select>
                                        <el-autocomplete
                                            v-model="searchInput"
                                            class="u-select-input_field"
                                            size="small"
                                            value-key="label"
                                            :placeholder="
                                                isSelectSearchType == 1
                                                    ? $t('pages.wiki.leap.ui.searchAchievementPlaceholder')
                                                    : $t('pages.wiki.leap.ui.searchMapPlaceholder')
                                            "
                                            :fetch-suggestions="querySearch"
                                            :trigger-on-focus="false"
                                            popper-class="m-select-input_popper"
                                            @keydown.enter="handleSearchEnter"
                                            @select="handleSelect"
                                        ></el-autocomplete>
                                        <button
                                            v-if="isSelectSearchType == 1"
                                            type="button"
                                            class="u-select-input_btn"
                                            @click="searchHandle"
                                        >
                                            {{ $t("pages.wiki.leap.ui.searchAchievement") }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 推荐 -->
                        <div
                            v-if="dialogQueryParams.is_official == 1"
                            class="u-dialog-main_recommend"
                            v-loading="recommendLoading"
                        >
                            <PvxEmptyState
                                v-if="!recommendLoading && !recommendList.length"
                                class="u-recommend-empty"
                                :title="$t('pages.wiki.leap.ui.noRecommendedPlans')"
                                :description="$t('pages.wiki.leap.ui.noRecommendedPlansDescription')"
                            >
                                <template #action>
                                    <button type="button" @click="changeCategory(0)">
                                        {{ $t("pages.wiki.leap.ui.useCustomPlan") }}
                                    </button>
                                </template>
                            </PvxEmptyState>
                            <!-- 方案列表 -->
                            <div class="u-recommend-list u-common-list" v-if="recommendList.length">
                                <div class="u-item" :class="{ active: item.id == selectRecommendItem.id }"
                                    v-for="item in recommendList" :key="item.id" @click="selectRecommend(item)"
                                    :title="item.title">
                                    {{ item.title }}
                                </div>
                            </div>
                            <!-- 方案描述 -->
                            <div class="u-recommend-desc" v-if="recommendList.length">
                                <!-- 点数根据schema计算 -->
                                <div class="u-recommend-desc_title">
                                    {{ $t("pages.wiki.leap.ui.totalPoints") }}：{{ selectRecommendItem?.all || 0 }}
                                </div>
                                <div class="u-recommend-desc_source">
                                    {{ $t("pages.wiki.leap.ui.source") }}：{{
                                        selectRecommendItem
                                            ? selectRecommendItem.is_official == 1
                                                ? $t("pages.wiki.leap.ui.officialSource")
                                                : $t("pages.wiki.leap.ui.playerSource")
                                            : "-"
                                    }}
                                </div>
                                <div class="u-recommend-desc_text">
                                    <span>{{ $t("pages.wiki.leap.ui.summary") }}：</span>
                                    <div v-html="selectRecommendItem.desc"></div>
                                </div>
                            </div>
                        </div>
                        <!-- 自选方案区域 -->
                        <div class="u-dialog-main_custom" v-else>
                            <!-- 自选再分，总览和地图 -->
                            <div class="u-dialog-main_category">
                                <button type="button" class="u-dialog-main_category_item" :class="{ active: isSelectType == 1 }"
                                    @click="changeSelfCategory(1)">
                                    {{ $t("pages.wiki.leap.ui.overviewCategory") }}
                                </button>
                                <button type="button" class="u-dialog-main_category_item" :class="{ active: isSelectType == 2 }"
                                    @click="changeSelfCategory(2)">
                                    {{ $t("pages.wiki.leap.ui.mapCategory") }}
                                </button>
                                <button
                                    v-if="!loadingAchievement && achievements.length"
                                    type="button"
                                    class="u-scope-select-all"
                                    @click="selectAllAchievement()"
                                >
                                    {{ $t("pages.wiki.leap.ui.selectAll") }}
                                </button>
                            </div>

                            <!-- 总览 -->
                            <div v-if="isSelectType == 1" class="u-dialog-main_box">
                                <div class="u-dialog-main_custom_list u-common-list u-first-box">
                                    <div
                                        class="u-item u-first"
                                        :class="{
                                            active: selectMenuItem.id == item.id,
                                            'is-unavailable': !hasSelectableMenu(item, true),
                                        }"
                                        v-for="item in menuList"
                                        :key="item.id"
                                        @click="selectMenu(item, 1)"
                                    >
                                        <span class="u-item-label">{{ item.name }}</span>
                                        <span v-if="selectMenuNum(item)" class="u-item-count">
                                            {{ selectMenuNum(item) }}
                                        </span>
                                    </div>
                                </div>
                                <!-- 成就分类二级区域 -->
                                <div class="u-dialog-main_custom_list u-common-list">
                                    <div
                                        class="u-item"
                                        :class="{
                                            active: selectMenuChildrenItem.id == item.id,
                                            'is-unavailable': !hasSelectableMenu(item),
                                        }"
                                        v-for="item in selectMenuItem.children"
                                        :key="item.id"
                                        @click="selectMenu(item)"
                                    >
                                        <span class="u-item-label">{{ item.name }}</span>
                                        <span v-if="isSelectMenu(item)" class="u-item-mark" aria-hidden="true"></span>
                                    </div>
                                </div>
                                <!-- 成就区域 -->
                                <div class="u-dialog-main_custom_list u-common-list" v-loading="loadingAchievement">
                                    <div class="u-list-empty" v-if="achievements.length == 0">
                                        {{ $t("pages.wiki.leap.ui.noAvailableAchievements") }}
                                    </div>

                                    <div
                                        class="u-item u-select"
                                        :class="{
                                            'achievement-active': isSelectAchievement(item),
                                            'is-completed': isCompletedAchievement(item),
                                        }"
                                        v-for="item in achievements"
                                        :key="item.ID"
                                        @click="selectAchievement(item)"
                                    >
                                        <img src="../../../assets/img/wiki/leap/tick.svg" />

                                        <el-tooltip effect="dark" :content="item.Name" placement="top-start">
                                            <div>{{ item.Name }}</div>
                                        </el-tooltip>
                                        <span v-if="isCompletedAchievement(item)" class="u-completed-badge">
                                            {{ $t("pages.wiki.leap.ui.completed") }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <!-- 地图区域 -->
                            <div v-else class="u-dialog-main_box">
                                <div class="u-dialog-main_custom_list u-common-list u-first-box">
                                    <div
                                        class="u-item u-first"
                                        :class="{
                                            active: selectMapItem.value == item.value,
                                            'is-unavailable': isMapUnavailable(item, true),
                                        }"
                                        v-for="item in mapList"
                                        :key="item.value"
                                        @click="selectMap(item, 1)"
                                    >
                                        <span class="u-item-label">{{ item.label }}</span>
                                        <span v-if="selectMapNum(item)" class="u-item-count">
                                            {{ selectMapNum(item) }}
                                        </span>
                                    </div>
                                </div>
                                <!-- 地图分类二级区域 -->
                                <div class="u-dialog-main_custom_list u-common-list" ref="mapChildren">
                                    <div class="u-list-empty" v-if="isEmpty(selectMapChildrenItem)">
                                        {{ $t("pages.wiki.leap.ui.noAvailableAchievements") }}
                                    </div>
                                    <div
                                        class="u-item"
                                        :ref="'itemMap' + item.value"
                                        :class="{
                                            active: selectMapChildrenItem.value == item.value,
                                            'is-unavailable': isMapUnavailable(item),
                                        }"
                                        v-for="item in selectMapItem.children"
                                        :key="item.value"
                                        @click="selectMap(item)"
                                    >
                                        <span class="u-item-label">{{ item.label }}</span>
                                        <span v-if="isSelectMap(item)" class="u-item-mark" aria-hidden="true"></span>
                                    </div>
                                </div>
                                <!-- 成就区域 -->
                                <div class="u-dialog-main_custom_list u-common-list" v-loading="loadingAchievement">
                                    <div class="u-list-empty" v-if="achievements.length == 0">
                                        {{ $t("pages.wiki.leap.ui.noAvailableAchievements") }}
                                    </div>
                                    <div
                                        class="u-item u-select"
                                        :class="{
                                            'achievement-active': isSelectAchievement(item),
                                            'is-completed': isCompletedAchievement(item),
                                        }"
                                        v-for="item in achievements"
                                        :key="item.ID"
                                        @click="selectAchievement(item)"
                                    >
                                        <img src="../../../assets/img/wiki/leap/tick.svg" />

                                        <el-tooltip effect="dark" :content="item.Name" placement="top-start">
                                            <div>{{ item.Name }}</div>
                                        </el-tooltip>
                                        <span v-if="isCompletedAchievement(item)" class="u-completed-badge">
                                            {{ $t("pages.wiki.leap.ui.completed") }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="u-dialog-footer">
                    <div class="u-dialog-footer__meta">
                        <span>
                            {{
                                $t("pages.wiki.leap.ui.selectedAchievements", {
                                    count: customList.length,
                                })
                            }}
                        </span>
                    </div>
                    <div class="u-dialog-footer__bottom">
                        <div class="u-dialog-summary">
                            <div>
                                <span>{{ $t("pages.wiki.leap.ui.summaryPlanTotal") }}</span>
                                <strong>{{ formatNumber(leapForm.all) }}</strong>
                            </div>
                            <div>
                                <span>{{ $t("pages.wiki.leap.ui.summaryAvailableGain") }}</span>
                                <strong>{{ formatNumber(leapForm.diffNum) }}</strong>
                            </div>
                            <div>
                                <span>{{ $t("pages.wiki.leap.ui.summaryRemaining") }}</span>
                                <strong>{{ formatNumber(leapForm.remaining) }}</strong>
                            </div>
                        </div>
                        <div class="u-dialog-actions">
                            <button
                                type="button"
                                class="u-btn is-secondary"
                                :disabled="submitting"
                                @click="dialogTableVisible = false"
                            >
                                {{ $t("pages.wiki.leap.ui.cancel") }}
                            </button>
                            <button
                                type="button"
                                class="u-btn"
                                :disabled="!canSubmitPlan"
                                :aria-busy="submitting"
                                :aria-disabled="!canSubmitPlan"
                                @click="canSubmitPlan && submitLeap()"
                            >
                                {{
                                    submitting
                                        ? $t("pages.wiki.leap.ui.generatingPlan")
                                        : $t("pages.wiki.leap.ui.generatePlan")
                                }}
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { getMenuAchievements, getMenus, searchAchievements, getMapList } from "@/service/achievement";
import {
    getWikiAchievementLeapSchemaList,
    createdWikiAchievementLeapSchema,
    getWikiAchievementLeapSchemaProgress,
} from "@/service/wiki";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";

import { cloneDeep, isEmpty, sortBy } from "lodash";
export default {
    components: {
        PvxEmptyState,
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        currentRole: {
            type: Object,
            default: function () {
                return {};
            },
        },
        //成就ID及点数对应
        pointsData: {
            type: Object,
            default: function () {
                return {};
            },
        },
        initialPlan: {
            type: Object,
            default: null,
        },
    },
    watch: {
        show: {
            deep: true,
            handler(val) {
                if (val) this.createLeap(val);
            },
        },
        "leapForm.number": {
            deep: true,
            handler(val) {
                this.schemeCompute();
            },
        },
        customList: {
            deep: true,
            handler() {
                this.schemeCompute();
            },
        },
        dialogTableVisible: {
            handler(val) {
                if (!val) this.$emit("cancel", val);
            },
        },
        isFilter: {
            handler() {
                this.reloadCustom();
            },
        },
    },
    data() {
        return {
            dialogTableVisible: false,
            submitting: false,
            recommendLoading: false,
            menuRequestId: 0,
            mapListRequestId: 0,
            recommendRequestId: 0,
            achievementRequestId: 0,
            //是否过滤已有成就
            isFilter: true,
            leapForm: {
                title: "",
                all: 0,
                diffNum: 0,
                remaining: 0,
                number: null,
            },

            //创建方案检索条件
            dialogQueryParams: {
                is_official: 1,
                client: this.$store.state.client,
                _no_page: 1, //不分页
            },
            //推荐方案列表
            recommendList: [],
            selectRecommendItem: {}, //选择的推荐方案信息
            //自选方案配置列表
            isSelectType: 1, //1:总览 2:地图
            customList: [],
            //总览菜单列表
            menuList: [],
            selectMenuItem: {},
            selectMenuChildrenItem: {},

            //地图列表
            mapList: [],
            mapAvailability: {},
            selectMapItem: {},
            selectMapChildrenItem: {},
            //成就列表，切换地图或总览时需重新赋值
            achievements: [],
            loadingAchievement: false,
            searchInput: "",
            isSelectSearchType: "2",
        };
    },
    created() {
        // this.createLeap(true);
    },
    mounted() {},
    computed: {
        completedAchievementIds() {
            return new Set(
                String(this.currentRole?.achievements || "")
                    .split(",")
                    .filter(Boolean)
            );
        },
        canSubmitPlan() {
            const title = String(this.leapForm.title || "").trim();
            const targetNumber = Number(this.leapForm.number);
            const hasSchema = this.customList.some((item) => item?.ID != null);
            const hasAvailableGain = Number(this.leapForm.diffNum) > 0;
            return (
                !this.submitting &&
                Boolean(title) &&
                Number.isFinite(targetNumber) &&
                targetNumber > 0 &&
                hasSchema &&
                hasAvailableGain
            );
        },
    },
    methods: {
        isEmpty,
        formatNumber(value) {
            return Number(value || 0).toLocaleString();
        },
        flattenAchievementIds(source) {
            const ids = [];
            const visit = (value) => {
                if (Array.isArray(value)) {
                    value.forEach(visit);
                    return;
                }
                if (value && typeof value == "object") {
                    const id = value.ID ?? value.id;
                    if (id != null) ids.push(String(id));
                    return;
                }
                if (value != null && value !== "") ids.push(String(value));
            };
            visit(source);
            return ids;
        },
        hasSelectableMenu(item, includeChildren = false) {
            const sources = [item?.achievements || []];
            if (includeChildren) {
                (item?.children || []).forEach((child) => sources.push(child?.achievements || []));
            }
            const ids = this.flattenAchievementIds(sources);
            if (!ids.length) return false;
            if (!this.isFilter) return true;
            return ids.some((id) => !this.completedAchievementIds.has(id));
        },
        hasSelectableMap(item, includeChildren = false) {
            if (includeChildren) {
                const children = item?.children || [];
                if (!children.length) return false;
                // 未访问过的地图保持正常；当该区域所有地图都已确认无可选项时，
                // 一级区域才进入不可用态，避免把未知状态误判为无数据。
                return children.some((child) => this.mapAvailability[child.value] !== false);
            }
            return this.mapAvailability[item?.value] !== false;
        },
        isMapUnavailable(item, includeChildren = false) {
            if (includeChildren) return !this.hasSelectableMap(item, true);
            if (this.mapAvailability[item?.value] === false) return true;

            // 当前地图的请求结果是最直接的判断依据，避免缓存对象更新延迟时
            // 空列表已显示、导航项却仍保持正常样式。
            return (
                !this.loadingAchievement &&
                !this.searchInput &&
                this.selectMapChildrenItem?.value == item?.value &&
                this.achievements.length === 0
            );
        },
        isCompletedAchievement(item) {
            return this.completedAchievementIds.has(String(item?.ID));
        },
        //创建弹窗
        createLeap(val) {
            this.menuRequestId += 1;
            this.mapListRequestId += 1;
            this.recommendRequestId += 1;
            this.achievementRequestId += 1;
            this.dialogTableVisible = val;
            const initialPlan = this.initialPlan || {};
            const initialPoints = this.getSchemePoints(initialPlan.schema || []).all;
            this.leapForm = {
                title: initialPlan.title || "",
                all: 0,
                diffNum: 0,
                remaining: 0,
                number: initialPoints || null,
            };
            this.dialogQueryParams = {
                is_official: 1,
                client: this.$store.state.client,
                _no_page: 1,
            };
            this.customList = [];
            this.recommendList = [];
            this.selectRecommendItem = {};
            this.isSelectType = 1;
            this.searchInput = "";
            this.isSelectSearchType = "2";
            this.selectMenuItem = {};
            this.selectMenuChildrenItem = {};
            this.mapAvailability = {};
            this.selectMapItem = {};
            this.selectMapChildrenItem = {};
            this.achievements = [];
            this.loadingAchievement = false;
            this.getMenuList();
            this.loadMapList();
            this.dialogQuery();
        },
        //弹窗方案方向切换
        async changeCategory(value) {
            if (this.dialogQueryParams.is_official == value) return;

            if (this.dialogQueryParams.is_official == 0 && this.customList.length > 0) {
                try {
                    await this.$confirm(
                        this.$t("pages.wiki.leap.ui.switchCategoryConfirm"),
                        this.$t("pages.wiki.leap.ui.confirmTitle"),
                        {
                            confirmButtonText: this.$t("pages.wiki.leap.ui.confirm"),
                            cancelButtonText: this.$t("pages.wiki.leap.ui.cancel"),
                            type: "warning",
                        }
                    );
                } catch {
                    return;
                }
            }

            const title = this.leapForm.title;
            const number = this.leapForm.number;
            this.leapForm = {
                title,
                all: 0,
                diffNum: 0,
                remaining: 0,
                number,
            };
            this.dialogQueryParams.is_official = value;
            this.customList = [];
            this.achievementRequestId += 1;
            this.loadingAchievement = false;
            if (value == 1) {
                this.dialogQuery();
            } else {
                this.recommendRequestId += 1;
                this.recommendLoading = false;
                this.initCustomList();
            }
        },
        //过滤选项切换，重载成就列表
        reloadCustom() {
            if (this.dialogQueryParams.is_official != 0) return;

            this.mapAvailability = {};
            if (this.isSelectType == 1 && !isEmpty(this.selectMenuItem)) {
                this.getMenuAchievements(
                    this.selectMenuItem.sub,
                    !isEmpty(this.selectMenuChildrenItem) ? this.selectMenuChildrenItem.detail : ""
                );
                return;
            }

            if (this.isSelectType == 2) {
                const scene = this.selectMapChildrenItem.value || "";
                this.getMapAchievements(scene, scene ? "" : this.searchInput);
            }
        },
        //获取成就难度并进行排序
        async getAchievementProgress(requestId = this.achievementRequestId) {
            let achievements = cloneDeep(this.achievements),
                ids = [];
            achievements.forEach((item) => {
                ids.push(item.ID);
            });
            if (ids.length == 0) return;
            try {
                const res = await getWikiAchievementLeapSchemaProgress(ids);
                if (requestId != this.achievementRequestId) return;

                let progressAndDifficulty = res.data?.data || [];
                const progressMap = new Map(
                    progressAndDifficulty.map((item) => [String(item.achievement_id), item])
                );
                const arr = achievements.map((achievement) => {
                    const progress = progressMap.get(String(achievement.ID)) || {};
                    return {
                        ...achievement,
                        ...progress,
                        difficulty: progress.difficulty ? progress.difficulty / 10 : 0,
                    };
                });
                this.achievements = sortBy(arr, function (o) {
                    return o.difficulty;
                });
            } catch (error) {
                if (requestId == this.achievementRequestId) {
                    console.error("Failed to load achievement difficulty:", error);
                }
            }
        },
        //自选方案切换
        async changeSelfCategory(value) {
            if (this.isSelectType == value) return;

            if (this.customList.length > 0 && this.isSelectType != value) {
                try {
                    await this.$confirm(
                        this.$t("pages.wiki.leap.ui.switchCategoryConfirm"),
                        this.$t("pages.wiki.leap.ui.confirmTitle"),
                        {
                            confirmButtonText: this.$t("pages.wiki.leap.ui.confirm"),
                            cancelButtonText: this.$t("pages.wiki.leap.ui.cancel"),
                            type: "warning",
                        }
                    );
                } catch {
                    return;
                }
            }

            this.achievementRequestId += 1;
            this.loadingAchievement = false;
            this.isSelectType = value;
            this.initCustomList();
        },
        //初始化自选方案内容
        initCustomList() {
            this.customList = [];
            //根据value初始化不同内容,同时重载achievements
            if (this.isSelectType == 1) {
                // 安全检查：确保 menuList 存在且有数据
                if (this.menuList && this.menuList.length > 1) {
                    this.selectMenu(this.menuList[1], 1);
                } else if (this.menuList && this.menuList.length > 0) {
                    this.selectMenu(this.menuList[0], 1);
                }
            } else {
                // 安全检查：确保 mapList 存在且有数据
                if (this.mapList && this.mapList.length > 0) {
                    this.selectMapItem = this.mapList[0];
                    // 安全检查：确保 children 存在且有数据
                    if (this.selectMapItem.children && this.selectMapItem.children.length > 0) {
                        this.selectMapChildrenItem = this.selectMapItem.children[0];
                        this.getMapAchievements(this.selectMapChildrenItem.value);
                    }
                }
            }
        },
        //推荐方案查询
        async dialogQuery() {
            const requestId = ++this.recommendRequestId;
            this.recommendLoading = true;
            try {
                const res = await getWikiAchievementLeapSchemaList(this.dialogQueryParams);
                if (requestId != this.recommendRequestId) return;

                const data = res.data?.data;
                this.recommendList = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.list)
                      ? data.list
                      : [];
                if (this.dialogQueryParams.is_official == 1 && this.recommendList.length) {
                    const initialId = this.initialPlan?.id;
                    const initialItem = this.recommendList.find((item) => item.id == initialId);
                    this.selectRecommend(initialItem || (initialId ? this.initialPlan : this.recommendList[0]));
                }
            } catch (error) {
                if (requestId != this.recommendRequestId) return;
                console.error("Failed to load recommended leap plans:", error);
                this.recommendList = [];
            } finally {
                if (requestId == this.recommendRequestId) {
                    this.recommendLoading = false;
                }
            }
        },
        //选择推荐方案
        selectRecommend(item) {
            this.selectRecommendItem = item;
            const schema = Array.isArray(item.schema) ? item.schema : [];
            this.customList = schema.map((id) => ({
                ID: String(id),
                Point: Number(this.pointsData[id] || 0),
            }));
            const points = this.getSchemePoints(schema);

            const targetNumber = Number(this.leapForm.number) || 0;
            // 保持既有业务口径：剩余资历 = 目标资历 - 方案可提升资历
            const remaining = targetNumber - points.diffNum;

            this.leapForm.all = points.all;
            this.leapForm.diffNum = points.diffNum;
            this.leapForm.remaining = remaining > 0 ? remaining : 0;
        },
        //自选-地图查询
        async loadMapList() {
            const requestId = ++this.mapListRequestId;
            const client = this.$store.state.client;
            const params = {
                client,
                _no_page: 1,
            };
            try {
                const res = await getMapList(params);
                if (requestId != this.mapListRequestId) return;

                const data = res.data.data || [];
                let regions = Object.values(
                    data.reduce((acc, cur) => {
                        if (!cur.RegionName) return acc;
                        if (!acc[cur.RegionName]) {
                            acc[cur.RegionName] = {
                                value: Number(cur.Region),
                                label: cur.RegionName,
                                children: [],
                            };
                        }
                        acc[cur.RegionName].children.push({
                            value: Number(cur.ID),
                            label: cur.MapName,
                            parent: Number(cur.Region),
                        });

                        return acc;
                    }, {})
                );
                this.mapList = regions;
                if (
                    this.dialogQueryParams.is_official == 0 &&
                    this.isSelectType == 2 &&
                    isEmpty(this.selectMapItem) &&
                    this.customList.length == 0
                ) {
                    this.initCustomList();
                }
            } catch (error) {
                if (requestId == this.mapListRequestId) {
                    console.error("Failed to load map list:", error);
                    this.mapList = [];
                }
            }
        },
        //自选-地图模糊搜索
        querySearch(queryString, cb) {
            if (this.isSelectSearchType == 1) {
                cb([]);
                return;
            }
            let mapList = cloneDeep(this.mapList);
            const mapListData = [];
            mapList.forEach((item) => {
                mapListData.push(...item.children);
            });
            let results = queryString
                ? mapListData.filter((value) => {
                    return value.label.indexOf(queryString) != -1;
                })
                : mapListData;
            cb(results);
        },

        // 自选-总览获取成就菜单列表
        async getMenuList() {
            const requestId = ++this.menuRequestId;
            try {
                const res = await getMenus({
                    general: 1,
                    client: this.$store.state.client,
                });
                if (requestId != this.menuRequestId) return;

                const data = res.data.data.menus;
                this.menuList = data;
                if (
                    this.dialogQueryParams.is_official == 0 &&
                    this.isSelectType == 1 &&
                    isEmpty(this.selectMenuItem) &&
                    this.customList.length == 0
                ) {
                    this.initCustomList(); //初始化自选方案内容
                }
            } catch (error) {
                if (requestId == this.menuRequestId) {
                    console.error("Failed to load achievement menus:", error);
                    this.menuList = [];
                }
            }
        },
        //根据方案列表获取方案的成就ID及对应Point
        getSchemePoints(schema) {
            let pointsData = this.pointsData;
            let schemaArr = [];
            schema.forEach((item) => {
                schemaArr.push({ ID: item, Point: pointsData[item] });
            });
            let info = this.schemeCompute(schemaArr);
            return { all: info.all, diffNum: info.diffNum };
        },
        //总览菜单选择
        selectMenu(item, type) {
            if (type == 1) {
                this.selectMenuItem = item;
                this.selectMenuChildrenItem = {};
                item.achievements.length == 0 ? (this.selectMenuChildrenItem = item.children?.[0] || {}) : "";
                this.getMenuAchievements(
                    item.sub,
                    item.achievements.length == 0 ? this.selectMenuChildrenItem.detail : ""
                );
            } else {
                this.selectMenuChildrenItem = item;
                this.getMenuAchievements(item.sub, item.detail);
            }
        },
        // 获取成就列表
        async getMenuAchievements(sub = 1, detail) {
            const requestId = ++this.achievementRequestId;
            this.loadingAchievement = true;
            try {
                const data = await getMenuAchievements(sub, detail);
                if (requestId != this.achievementRequestId) return;

                let list = data.data.data.achievements || [];
                let achievements = [];
                list.forEach((item) => {
                    achievements.push(item);
                    if (item.SeriesAchievementList) {
                        item.SeriesAchievementList.forEach((sub, index) => {
                            if (index > 0) {
                                achievements.push(sub);
                            }
                        });
                    }
                });
                if (this.isFilter) {
                    // 根据角色已有成就过滤出未有的
                    achievements = achievements.filter(
                        (item) => !this.completedAchievementIds.has(String(item.ID))
                    );
                }
                this.achievements = achievements;
                //获取难度并排序
                await this.getAchievementProgress(requestId);
            } catch (error) {
                if (requestId == this.achievementRequestId) {
                    console.error("Failed to load menu achievements:", error);
                    this.achievements = [];
                }
            } finally {
                if (requestId == this.achievementRequestId) {
                    this.loadingAchievement = false;
                }
            }
        },
        //一级菜单判断子集选中数量
        selectMenuNum(item) {
            let number = 0;
            let customList = this.customList,
                length = customList.length;
            for (let i = 0; i < length; i++) {
                if (customList[i].Sub == item.sub) {
                    number++;
                }
            }

            return number;
        },
        //总览分类菜单判断是否有选中值
        isSelectMenu(item, type) {
            let status = false,
                customList = this.customList,
                length = customList.length;
            for (let i = 0; i < length; i++) {
                if (type == 1) {
                    if (customList[i].Sub == item.sub && !customList[i].Detail) {
                        status = true;
                        break;
                    }
                } else {
                    if (customList[i].Detail == item.detail) {
                        status = true;
                        break;
                    }
                }
            }
            return status;
        },
        //总览菜单内单项是否选中判断
        isSelectAchievement(item) {
            let status = false,
                customList = this.customList,
                length = customList.length;
            for (let i = 0; i < length; i++) {
                if (customList[i].ID == item.ID) {
                    status = true;
                    break;
                }
            }
            return status;
        },
        selectMap(item, type) {
            if (type == 1) {
                this.selectMapItem = item;
                this.selectMapChildrenItem = item.children?.[0] || {};
            } else {
                this.selectMapChildrenItem = item;
            }
            this.getMapAchievements(this.selectMapChildrenItem.value);
        },
        //地图根据关键字全局搜索成就
        handleSearchEnter(event) {
            if (this.isSelectSearchType != "1") return;
            event?.preventDefault();
            this.searchHandle();
        },
        searchHandle() {
            if (this.isSelectSearchType != "1") return;
            const keyword = this.searchInput;
            this.selectMapItem = {};
            this.selectMapChildrenItem = {};
            this.getMapAchievements("", keyword);
        },
        //根据地图获取成就列表
        async getMapAchievements(value = "", keyword = "") {
            const requestId = ++this.achievementRequestId;
            this.loadingAchievement = true;
            let params = {
                keyword,
                scene: value,
                client: this.$store.state.client,
                _no_page: 1,
                limit: 99999,
            };
            try {
                const data = await searchAchievements(params);
                if (requestId != this.achievementRequestId) return;

                let achievements = data.data.data.achievements || [];
                if (this.isFilter) {
                    // 根据角色已有成就过滤出未有的
                    achievements = achievements.filter(
                        (item) => !this.completedAchievementIds.has(String(item.ID))
                    );
                }
                if (value) {
                    this.mapAvailability = {
                        ...this.mapAvailability,
                        [value]: achievements.length > 0,
                    };
                }
                this.achievements = achievements;
                //获取难度并排序
                await this.getAchievementProgress(requestId);
            } catch (error) {
                if (requestId == this.achievementRequestId) {
                    console.error("Failed to load map achievements:", error);
                    this.achievements = [];
                }
            } finally {
                if (requestId == this.achievementRequestId) {
                    this.loadingAchievement = false;
                }
            }
        },
        handleSelect(item) {
            //根据value获取parent
            let parent = this.mapList.find((map) => map.value == item.parent);
            this.selectMapItem = parent;
            this.selectMapChildrenItem = item;
            this.getMapAchievements(item.value);
            //选中后进行滚动反馈
            this.$nextTick(() => {
                const itemRef = this.$refs["itemMap" + item.value];
                const parentRef = this.$refs.mapChildren;
                const itemDom = Array.isArray(itemRef) ? itemRef[0] : itemRef;
                const parentDom = Array.isArray(parentRef) ? parentRef[0] : parentRef;
                if (!itemDom || !parentDom) return;

                parentDom.scrollTop = Math.max(
                    0,
                    itemDom.offsetTop - parentDom.clientHeight / 2 + itemDom.offsetHeight / 2
                );
            });
        },
        selectMapNum(item) {
            let number = 0;
            item.children.forEach((c) => {
                this.customList.forEach((item2) => {
                    if (c.value == item2.SceneID) {
                        number++;
                    }
                });
            });
            return number;
        },
        isSelectMap(item) {
            let status = false,
                customList = this.customList,
                length = customList.length;
            for (let i = 0; i < length; i++) {
                if (customList[i].SceneID == item.value) {
                    status = true;
                    break;
                }
            }
            return status;
        },
        dedupeAchievementsById(list = []) {
            const seen = new Set();
            return list.filter((item) => {
                if (!item || item.ID == null) return false;
                const id = String(item.ID);
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            });
        },
        //选择全部成就
        selectAllAchievement() {
            //判断是总览还是地图
            if (this.isSelectType == 1) {
                //总览
                //判断当前二级菜单是否选中
                if (!isEmpty(this.selectMenuChildrenItem)) {
                    //判断是否有选中值，有则取消所有，没有则选中所有
                    if (this.isSelectMenu(this.selectMenuChildrenItem)) {
                        this.customList = this.customList.filter(
                            (item) => item.Detail != this.selectMenuChildrenItem.detail
                        );
                    } else {
                        this.customList = this.customList.concat(this.achievements);
                    }
                } else {
                    //判断一级
                    if (this.isSelectMenu(this.selectMenuItem, 1)) {
                        this.customList = this.customList.filter(
                            (item) =>
                                item.Sub != this.selectMenuItem.sub ||
                                (item.Sub == this.selectMenuItem.sub && item.Detail != null)
                        );
                    } else {
                        this.customList = this.customList.concat(this.achievements);
                    }
                }
            } else {
                // 地图
                if (this.isSelectMap(this.selectMapChildrenItem)) {
                    this.customList = this.customList.filter(
                        (item) => item.SceneID != this.selectMapChildrenItem.value
                    );
                } else {
                    this.customList = this.customList.concat(this.achievements);
                }
            }
            this.customList = this.dedupeAchievementsById(this.customList);
        },
        // 选择单个成就
        selectAchievement(item) {
            //根据ID判断选中状态,未选中加入数组,选中择从数组里移除
            if (this.isSelectAchievement(item)) {
                this.customList = this.customList.filter((e) => e.ID != item.ID);
            } else {
                this.customList.push(item);
            }
        },
        //总览方案计算
        schemeCompute(data) {
            let all = 0,
                diffNum = 0,
                remaining = 0;
            let _this = this;
            let customList = data || this.customList;

            //计算成就差值
            let arr = customList.filter(function (v) {
                const point = Number(v.Point || 0);
                all += point;
                return !_this.completedAchievementIds.has(String(v.ID));
            });
            arr.forEach((item) => {
                diffNum += Number(item.Point || 0);
            });
            if (!data) {
                const targetNumber = Number(this.leapForm.number) || 0;

                // 保持现有业务口径：目标资历 - 方案可提升资历
                remaining = targetNumber - diffNum;

                this.leapForm.all = all;
                this.leapForm.diffNum = diffNum;
                this.leapForm.remaining = remaining > 0 ? remaining : 0;
            } else {
                return {
                    all,
                    diffNum,
                };
            }
        },
        //提交方案
        submitLeap() {
            if (this.submitting) return;

            const title = String(this.leapForm.title || "").trim();
            const targetNumber = Number(this.leapForm.number);
            const schema = Array.from(
                new Map(
                    this.customList
                        .filter((item) => item?.ID != null)
                        .map((item) => [String(item.ID), item.ID])
                ).values()
            );

            if (!title) {
                return this.$message.warning(this.$t("pages.wiki.leap.ui.enterPlanNameWarning"));
            }
            if (!Number.isFinite(targetNumber) || targetNumber <= 0) {
                return this.$message.warning(this.$t("pages.wiki.leap.ui.enterTargetWarning"));
            }
            if (!schema.length) {
                return this.$message.warning(this.$t("pages.wiki.leap.ui.selectAchievementWarning"));
            }

            this.leapForm.title = title;
            this.leapForm.number = targetNumber;
            const isRecommended = this.dialogQueryParams.is_official == 1;
            const recommendedMode = this.selectRecommendItem?.meta?.createBy;
            let createBy = this.isSelectType == 1 ? "overview" : "map";
            if (isRecommended) {
                createBy = recommendedMode === "map" ? "map" : "overview";
            }
            const meta = {
                createBy,
            };
            let params = {
                title,
                schema,
                meta,
                client: this.$store.state.client,
            };
            if (isRecommended && this.selectRecommendItem?.id) {
                params.fork_from = this.selectRecommendItem.id;
            }
            this.submitting = true;
            createdWikiAchievementLeapSchema(params)
                .then((res) => {
                    this.dialogTableVisible = false;
                    this.$message.success(this.$t("pages.wiki.leap.ui.createSuccess"));
                    this.$emit("reloadList", res.data.data);
                    let routeUrl = this.$router.resolve({
                        name: "leap",
                        query: {
                            id: res.data.data.id,
                        },
                    });
                    window.open(routeUrl.href, "_blank");
                })
                .catch((error) => {
                    console.error("Failed to create leap plan:", error);
                    this.$message.error(this.$t("pages.wiki.leap.ui.createFailed"));
                })
                .finally(() => {
                    this.submitting = false;
                });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/modules/achievement-leap-form.less";
</style>
