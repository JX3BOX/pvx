<template>
    <div class="p-achievement-overview p-pvx-achievement-overview">
        <PvxSurface v-if="!isLogin" class="m-achievement-state is-auth-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.overview.ui.loginRequired')"
                :description="$t('pages.wiki.overview.ui.loginDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton :href="loginUrl">
                        {{ $t("pages.wiki.overview.ui.goLogin") }}
                    </PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="pageError" class="m-achievement-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.overview.ui.loadFailed')"
                :description="$t('pages.wiki.overview.ui.loadFailedDescription')"
            >
                <template #icon><WarningFilled /></template>
                <template #action>
                    <PvxActionButton @click="getUserInfo">
                        {{ $t("pages.wiki.overview.ui.retry") }}
                    </PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="!pageLoading && !currentRole" class="m-achievement-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.overview.ui.noRole')"
                :description="$t('pages.wiki.overview.ui.noRoleDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton href="/team/role/bind">
                        {{ $t("pages.wiki.overview.ui.bindRole") }}
                        <ArrowRight />
                    </PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <div v-else class="m-achievement-overview-layout" v-loading="pageLoading">
            <PvxSurface v-if="currentRole" class="m-achievement-hero" tag="header" padding="medium">
                <div class="m-achievement-hero__main">
                    <div class="m-achievement-hero__copy">
                        <span class="u-achievement-eyebrow">{{ $t("pages.wiki.overview.ui.eyebrow") }}</span>
                        <h1>{{ viewAchievementsName || $t("pages.wiki.overview.ui.overview") }}</h1>
                        <p>{{ $t("pages.wiki.overview.ui.description") }}</p>

                        <div class="m-achievement-role">
                            <img
                                class="u-achievement-school"
                                :src="showSchoolIcon(currentRole.mount)"
                                :alt="$t('pages.wiki.overview.ui.schoolIcon')"
                            />
                            <div class="m-achievement-role__info">
                                <strong>{{ formatRoleLabel(currentRole) }}</strong>
                            </div>
                            <el-dropdown trigger="click">
                                <button
                                    type="button"
                                    class="u-achievement-role-switch"
                                    :aria-label="$t('pages.wiki.overview.ui.switchRole')"
                                >
                                    <span>{{ $t("pages.wiki.overview.ui.switchRole") }}</span>
                                    <img src="@/assets/img/wiki/overview/toggle-user-icon.svg" alt="" />
                                </button>
                                <template #dropdown>
                                    <el-dropdown-menu class="m-role-dropdown">
                                        <el-dropdown-item v-for="role in roleList" :key="role.ID">
                                            <button
                                                type="button"
                                                class="m-role-item"
                                                :class="{ active: role.jx3id === currentRole.jx3id }"
                                                @click="onChangeRole(role)"
                                            >
                                                <span>{{ role.name }}</span>
                                                <span>{{ role.server }}</span>
                                            </button>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>

                    <div
                        class="m-achievement-avatar"
                        :class="{
                            'has-avatar-frame': showAvatarFrame,
                            'is-category-art': !displayRoleAvatar,
                        }"
                    >
                        <img v-if="showAvatarFrame" class="u-avatar-border" :src="avatar_frame" alt="" />
                        <img
                            v-if="!displayRoleAvatar"
                            class="u-achievement-category-art"
                            :src="categoryTitleImage"
                            alt=""
                        />
                        <RoleAvatar
                            v-else
                            class="u-avatar-img"
                            :mount="currentRole.mount"
                            :body_type="currentRole.body_type"
                        />
                    </div>
                </div>

                <div class="m-achievement-summary">
                    <div class="m-achievement-summary__item">
                        <span>{{ currentSeniorityLabel }}</span>
                        <strong>{{ ownPointsCount }}</strong>
                    </div>
                    <div class="m-achievement-summary__item">
                        <span>{{ $t("pages.wiki.overview.ui.totalSeniority") }}</span>
                        <strong>{{ allPointsCount }}</strong>
                    </div>
                    <div class="m-achievement-summary__item is-progress">
                        <span>{{ $t("pages.wiki.overview.ui.completion") }}</span>
                        <strong>{{ totalProgress }}%</strong>
                    </div>
                    <div class="m-achievement-progress" aria-hidden="true">
                        <span :style="{ width: `${totalProgress}%` }"></span>
                    </div>
                </div>
            </PvxSurface>

            <PvxSurface
                v-if="currentRole && !showList"
                ref="categorySection"
                class="m-achievement-categories"
                padding="medium"
            >
                <div class="m-achievement-section-header">
                    <nav
                        class="m-achievement-context-nav"
                        :aria-label="$t('pages.wiki.overview.ui.categoryNavigation')"
                    >
                        <button
                            type="button"
                            :class="{ 'is-current': !viewAchievementsName }"
                            :aria-current="!viewAchievementsName ? 'page' : undefined"
                            @click="goOverview"
                        >
                            {{ $t("pages.wiki.overview.ui.overview") }}
                        </button>
                        <template
                            v-for="(item, index) in categoryPath"
                            :key="`context-${item.sub}-${item.detail || item.name}`"
                        >
                            <ArrowRight class="u-achievement-context-separator" />
                            <button
                                type="button"
                                :class="{ 'is-current': index === categoryPath.length - 1 }"
                                :aria-current="index === categoryPath.length - 1 ? 'page' : undefined"
                                @click="onSelectBreadcrumb(index)"
                            >
                                {{ item.name }}
                            </button>
                        </template>
                    </nav>
                </div>

                <div ref="overviewList" class="m-achievement-category-grid">
                    <button
                        v-for="item in list"
                        :key="`${item.sub}-${item.detail || item.name}`"
                        type="button"
                        class="m-achievement-category-card"
                        :class="{ 'is-complete': isCategoryComplete(item) }"
                        @click="onEnterCategory(item)"
                    >
                        <div class="m-achievement-category-card__top">
                            <div class="m-achievement-category-card__title">
                                <span class="u-achievement-category-icon">
                                    <img v-if="item.children" :src="getCategoryImage(item.name)" alt="" />
                                    <CollectionTag v-else />
                                </span>
                                <span>
                                    <strong>{{ item.name }}</strong>
                                    <small
                                        class="u-achievement-count"
                                        :aria-label="
                                            $t('pages.wiki.overview.ui.achievementCount', {
                                                own: item.ownAchievements.length,
                                                all: item.allAchievements.length,
                                            })
                                        "
                                    >
                                        <img src="@/assets/img/wiki/overview/cj-logo.svg" alt="" />
                                        <span aria-hidden="true">
                                            {{ item.ownAchievements.length }}/{{ item.allAchievements.length }}
                                        </span>
                                    </small>
                                </span>
                            </div>
                            <span class="u-achievement-category-rate">
                                <CircleCheckFilled v-if="isCategoryComplete(item)" aria-hidden="true" />
                                {{ getCurrentProgress(item.ownPoints, item.allPoints) }}%
                            </span>
                        </div>
                        <div class="m-achievement-category-card__meta">
                            <span>
                                <img src="@/assets/img/wiki/overview/zl-logo.svg" alt="" />
                                {{ item.ownPoints }}/{{ item.allPoints }}
                            </span>
                            <ArrowRight />
                        </div>
                        <div class="m-achievement-category-progress" aria-hidden="true">
                            <span
                                :style="{ width: `${getCurrentProgress(item.ownPoints, item.allPoints)}%` }"
                            ></span>
                        </div>
                    </button>
                </div>
            </PvxSurface>

            <PvxSurface
                v-if="currentRole && showList"
                ref="categorySection"
                class="m-achievement-list"
                padding="medium"
            >
                <div class="m-achievement-section-header">
                    <div>
                        <nav
                            class="m-achievement-context-nav"
                            :aria-label="$t('pages.wiki.overview.ui.categoryNavigation')"
                        >
                            <button type="button" @click="goOverview">
                                {{ $t("pages.wiki.overview.ui.overview") }}
                            </button>
                            <template
                                v-for="(item, index) in categoryPath"
                                :key="`list-context-${item.sub}-${item.detail || item.name}`"
                            >
                                <ArrowRight
                                    class="u-achievement-context-separator"
                                />
                                <button
                                    type="button"
                                    :class="{ 'is-current': index === categoryPath.length - 1 }"
                                    :aria-current="index === categoryPath.length - 1 ? 'page' : undefined"
                                    @click="onSelectBreadcrumb(index)"
                                >
                                    {{ item.name }}
                                </button>
                            </template>
                        </nav>
                        <span class="u-achievement-section-kicker">
                            {{ $t("pages.wiki.overview.ui.achievementDetails") }}
                        </span>
                        <div class="m-achievement-list-heading">
                            <h2>{{ viewAchievementsName }}</h2>
                            <p>
                                {{
                                    $t("pages.wiki.overview.ui.resultCount", {
                                        count: achievements_list.length,
                                    })
                                }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="m-achievement-table">
                    <el-table
                        :data="achievements_list || []"
                        style="width: 100%"
                        stripe
                        row-class-name="u-table-row"
                        cell-class-name="u-table-cell"
                        header-row-class-name="u-table-header-row"
                        header-cell-class-name="u-table-header-cell"
                        v-loading="loading"
                    >
                        <el-table-column
                            prop="Name"
                            :label="$t('pages.wiki.overview.ui.name')"
                            min-width="220"
                        >
                            <template #default="scope">
                                <a
                                    :href="getLink('achievement', scope.row.ID)"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span class="u-achievement-name">
                                        <span class="u-achievement-icon-frame">
                                            <img class="u-icon" :src="iconLink(scope.row?.IconID)" alt="" />
                                        </span>
                                        <span class="u-achievement-name-text">{{ scope.row.Name }}</span>
                                    </span>
                                </a>
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('pages.wiki.overview.ui.summary')" min-width="260">
                            <template #default="scope">
                                <span :class="{ 'u-table-empty': !scope.row.ShortDesc }">
                                    {{ scope.row.ShortDesc || $t("pages.wiki.overview.ui.emptyValue") }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="$t('pages.wiki.overview.ui.points')"
                            width="104"
                            align="center"
                            header-align="center"
                            class-name="u-table-points"
                        >
                            <template #default="scope">{{ scope.row.Point || 0 }}</template>
                        </el-table-column>
                        <el-table-column
                            :label="$t('pages.wiki.overview.ui.status')"
                            width="112"
                            align="center"
                            header-align="center"
                        >
                            <template #default="scope">
                                <el-tag
                                    class="u-achievement-status"
                                    :class="{
                                        'is-complete': scope.row.isCompleted !== false,
                                        'is-incomplete': scope.row.isCompleted === false,
                                    }"
                                    effect="plain"
                                >
                                    <CircleCheckFilled
                                        v-if="scope.row.isCompleted !== false"
                                        aria-hidden="true"
                                    />
                                    {{
                                        scope.row.isCompleted === false
                                            ? $t("pages.wiki.overview.ui.incomplete")
                                            : $t("pages.wiki.overview.ui.completed")
                                    }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column
                            v-if="hasAchievementRewards"
                            :label="$t('pages.wiki.overview.ui.reward')"
                            width="88"
                            align="center"
                            header-align="center"
                            class-name="u-table-reward"
                        >
                            <template #default="scope">
                                <el-tooltip placement="top" v-if="isItemReward(scope.row)">
                                    <template #content>
                                        <jx3-item :item="getRewardItem(scope.row)" />
                                    </template>
                                    <a
                                        class="u-reward-trigger"
                                        :href="getRewardLink(scope.row)"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        :aria-label="getRewardAriaLabel(scope.row)"
                                    >
                                        <img
                                            v-if="getRewardIcon(scope.row)"
                                            class="u-reward-icon"
                                            :src="getRewardIcon(scope.row)"
                                            :alt="getRewardItem(scope.row)?.Name || ''"
                                            @error="onRewardIconError(scope.row)"
                                        />
                                        <Present v-else aria-hidden="true" />
                                    </a>
                                </el-tooltip>
                                <span
                                    v-else-if="isRewardLoading(scope.row)"
                                    class="u-reward-trigger is-loading"
                                    :aria-label="$t('pages.wiki.overview.ui.rewardLoading')"
                                >
                                    <Loading aria-hidden="true" />
                                </span>
                                <span
                                    v-else-if="hasRewardReference(scope.row)"
                                    class="u-reward-trigger is-other"
                                    :title="getRewardFallbackText(scope.row)"
                                    :aria-label="getRewardFallbackText(scope.row)"
                                >
                                    <Present aria-hidden="true" />
                                </span>
                                <span v-else class="u-table-empty">
                                    {{ $t("pages.wiki.overview.ui.emptyValue") }}
                                </span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </PvxSurface>
        </div>
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { showSchoolIcon, iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import {
    getAchievementPoints,
    getVirtualRoleAchievements,
    getRoleGameAchievements,
    getMenus,
    getMenuAchievements,
    getAchievementRewardItems,
} from "@/service/achievement";
import { getUserRoles } from "@/service/team";
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { getMyInfo } from "@/service/user";
import { __imgPath, __Links } from "@/utils/config";
import Item from "@jx3box/jx3box-editor/src/Item";
import { cloneDeep } from "lodash";
import {
    ArrowRight,
    CircleCheckFilled,
    CollectionTag,
    Loading,
    Present,
    UserFilled,
    WarningFilled,
} from "@element-plus/icons-vue";
export default {
    name: "wiki-achievement-overview",
    props: [],
    components: {
        ArrowRight,
        CircleCheckFilled,
        CollectionTag,
        Loading,
        PvxActionButton,
        PvxEmptyState,
        PvxSurface,
        Present,
        RoleAvatar,
        UserFilled,
        WarningFilled,
        "jx3-item": Item,
    },
    data: function () {
        return {
            userInfo: null,
            achievementData: {},
            pointsData: {},
            list: [],
            roleList: [],
            currentRole: null,
            isLogin: User.isLogin(),
            virtualRole: {
                ...User.getInfo(),
                jx3id: 0,
                ID: ~~User.getInfo().uid,
            },
            isScroll: false, //移动端滚动后总览数据移至底部
            showList: false,
            achievements_list: [],
            loading: false,
            loadingDelayTimer: null,
            achievementRequestId: 0,
            rewardRequestId: 0,
            rewardItems: {},
            categoryPath: [],
            pageLoading: User.isLogin(),
            pageError: false,
        };
    },
    computed: {
        loginUrl() {
            return __Links.account.login + "?redirect=" + encodeURIComponent(location.href);
        },
        categoryTitleImage() {
            if (!this.viewAchievementsName) return "";
            return require(`@/assets/img/wiki/overview/title/${this.viewAchievementsName}.png`);
        },
        avatar_frame() {
            if (this.userInfo) {
                const { user_avatar_frame } = this.userInfo;
                if (user_avatar_frame) {
                    return __imgPath + `avatar/images/${user_avatar_frame}/${user_avatar_frame}.svg`;
                }
            }
            return null;
        },
        viewAchievementsName() {
            return this.$store.state.viewAchievementsName;
        },
        currentSeniorityLabel() {
            if (!this.viewAchievementsName) {
                return this.$t("pages.wiki.overview.ui.currentSeniority");
            }
            return this.$t("pages.wiki.overview.ui.categorySeniority", {
                category: this.viewAchievementsName,
            });
        },
        displayRoleAvatar() {
            return !this.viewAchievementsName || this.showList;
        },
        showAvatarFrame() {
            return Boolean(this.avatar_frame && this.displayRoleAvatar);
        },
        hasAchievementRewards() {
            return this.achievements_list.some((item) => this.hasRewardReference(item));
        },

        // 总进度
        totalProgress() {
            if (!this.allPointsCount) return "0.00";
            return ((this.ownPointsCount / this.allPointsCount) * 100).toFixed(2);
        },
        // 总资历点数
        allPointsCount() {
            let count = 0;
            this.list.forEach((item) => {
                count += item.allPoints || 0;
            });
            return count;
        },
        // 我拥有的所有资历点数
        ownPointsCount() {
            if (!this.viewAchievementsName) {
                let total = 0,
                    my_achievements = this.$store.state.achievements;
                my_achievements.forEach((item) => {
                    const itemId = String(item);
                    const numId = Number(item);
                    total = total + (this.pointsData[itemId] || this.pointsData[numId] || 0);
                });
                return total;
            }
            let count = 0;
            this.list.forEach((item) => {
                count += item.ownPoints || 0;
            });
            return count;
        },
    },
    watch: {
        achievementData() {
            this.refreshRenderList();
        },
        pointsData: {
            handler(val) {
                if (val && Object.keys(val).length) {
                    this.refreshRenderList();
                }
            },
        },
        "$store.state.achievements": {
            handler(val) {
                if (val && val.length) {
                    this.refreshRenderList();
                }
            },
        },
        achievements_list: {
            handler(list) {
                this.loadRewardItems(list);
            },
        },
        currentRole: {
            deep: true,
            immediate: true,
            handler(val) {
                if (!val) return;
                this.resetCategoryView();
                localStorage.setItem("wiki_last_sync", val.jx3id || 0);
                this.$store.commit("SET_STATE", { key: "role", value: val });
                const { jx3id } = val;
                if (jx3id) {
                    this.$store.commit("SET_STATE", { key: "achievementsVirtual", value: [] });
                    this.loadRoleAchievements(jx3id);
                }
                this.getRenderList();
            },
        },
    },

    mounted() {
        this.getUserInfo();
    },
    beforeUnmount() {
        clearTimeout(this.loadingDelayTimer);
        this.rewardRequestId += 1;
    },
    methods: {
        iconLink,
        getLink,
        hasRewardReference(row) {
            return Boolean(this.getRewardKey(row));
        },
        getRewardKey(row) {
            const type = String(row?.ItemType ?? "").trim();
            const id = String(row?.ItemID ?? "").trim();
            if (!/^\d+$/.test(type) || !/^\d+$/.test(id)) return "";
            if (Number(type) <= 0 || Number(id) <= 0) return "";
            return `${Number(type)}_${Number(id)}`;
        },
        getRewardEntry(row) {
            return this.rewardItems[this.getRewardKey(row)] || null;
        },
        getRewardItem(row) {
            return this.getRewardEntry(row)?.item || null;
        },
        getRewardIcon(row) {
            const entry = this.getRewardEntry(row);
            if (!entry?.item?.IconID || entry.iconError) return "";
            return this.iconLink(entry.item.IconID, this.$store.state.client || "std");
        },
        getRewardLink(row) {
            const key = this.getRewardKey(row);
            return this.isItemReward(row) && key ? this.getLink("item", key) : "";
        },
        getRewardAriaLabel(row) {
            return this.$t("pages.wiki.overview.ui.viewRewardItem", {
                name: this.getRewardItem(row)?.Name || this.$t("pages.wiki.overview.ui.reward"),
            });
        },
        getRewardFallbackText(row) {
            const entry = this.getRewardEntry(row);
            return this.$t(
                entry?.status === "error"
                    ? "pages.wiki.overview.ui.rewardUnavailable"
                    : "pages.wiki.overview.ui.otherReward"
            );
        },
        isItemReward(row) {
            const entry = this.getRewardEntry(row);
            return entry?.status === "ready" && entry.kind === "item";
        },
        isRewardLoading(row) {
            if (!this.hasRewardReference(row)) return false;
            const entry = this.getRewardEntry(row);
            return !entry || entry.status === "loading";
        },
        setRewardEntry(key, entry) {
            this.rewardItems = {
                ...this.rewardItems,
                [key]: entry,
            };
        },
        isValidRewardItem(item, key) {
            return Boolean(
                item &&
                    typeof item === "object" &&
                    Object.keys(item).length &&
                    String(item.id || item.idKey || "") === key &&
                    item.Name
            );
        },
        getCachedRewardItem(key, client) {
            try {
                const item = JSON.parse(sessionStorage.getItem(`item-${client}-${key}`));
                return this.isValidRewardItem(item, key) ? item : null;
            } catch {
                return null;
            }
        },
        loadRewardItems(rows = []) {
            const requestId = ++this.rewardRequestId;
            const client = this.$store.state.client || "std";
            const rewardKeys = new Set();

            rows.forEach((row) => {
                const key = this.getRewardKey(row);
                if (key) rewardKeys.add(key);
            });

            this.rewardItems = {};

            const uncachedKeys = [];

            rewardKeys.forEach((key) => {
                const cachedItem = this.getCachedRewardItem(key, client);
                if (cachedItem) {
                    this.setRewardEntry(key, {
                        status: "ready",
                        kind: "item",
                        item: cachedItem,
                        iconError: false,
                    });
                    return;
                }

                uncachedKeys.push(key);
                this.setRewardEntry(key, {
                    status: "loading",
                    kind: "unknown",
                    item: null,
                    iconError: false,
                });
            });

            for (let index = 0; index < uncachedKeys.length; index += 40) {
                const keys = uncachedKeys.slice(index, index + 40);
                getAchievementRewardItems(keys, client)
                    .then((res) => {
                        if (requestId !== this.rewardRequestId) return;
                        const items = res?.data?.list || [];
                        const itemMap = new Map(
                            items.map((item) => [String(item?.id || item?.idKey || ""), item])
                        );

                        keys.forEach((key) => {
                            const item = itemMap.get(key);
                            if (this.isValidRewardItem(item, key)) {
                                try {
                                    sessionStorage.setItem(
                                        `item-${client}-${key}`,
                                        JSON.stringify(item)
                                    );
                                } catch {
                                    // 缓存不可用不应影响奖励展示。
                                }
                                this.setRewardEntry(key, {
                                    status: "ready",
                                    kind: "item",
                                    item,
                                    iconError: false,
                                });
                                return;
                            }

                            this.setRewardEntry(key, {
                                status: "ready",
                                kind: "other",
                                item: null,
                                iconError: false,
                            });
                        });
                    })
                    .catch(() => {
                        if (requestId !== this.rewardRequestId) return;
                        keys.forEach((key) => {
                            this.setRewardEntry(key, {
                                status: "error",
                                kind: "unknown",
                                item: null,
                                iconError: false,
                            });
                        });
                    });
            }
        },
        onRewardIconError(row) {
            const key = this.getRewardKey(row);
            const entry = this.getRewardEntry(row);
            if (!key || !entry) return;
            this.setRewardEntry(key, {
                ...entry,
                iconError: true,
            });
        },
        getUserInfo() {
            if (!User.isLogin()) {
                this.pageLoading = false;
                return;
            }
            this.pageLoading = true;
            this.pageError = false;
            getMyInfo()
                .then((res) => {
                    this.userInfo = res;
                    return this.loadData();
                })
                .catch(() => {
                    this.pageError = true;
                })
                .finally(() => {
                    this.pageLoading = false;
                });
        },
        onChangeRole(role) {
            this.currentRole = role;
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        formatRoleLabel(role) {
            if (!role?.server) return role?.name || "";
            return this.$t("pages.wiki.overview.ui.roleWithServer", {
                name: role.name,
                server: role.server,
            });
        },
        showSchoolIcon,
        getCategoryImage(name) {
            return require(`@/assets/img/wiki/overview/item/${name}.png`);
        },
        onEnterCategory(data) {
            if (data.children) {
                this.categoryPath.push(cloneDeep(data));
                this.$store.commit("SET_STATE", { key: "viewAchievementsName", value: data.name });
                this.getRenderList(data.children);
                this.scrollToCategorySection();
            } else {
                this.cancelAchievementRequest();
                this.getMenuAchievements(data).then((isReady) => {
                    if (!isReady) return;
                    this.categoryPath.push(cloneDeep(data));
                    this.$store.commit("SET_STATE", { key: "viewAchievementsName", value: data.name });
                    this.list = [data];
                    this.showList = true;
                });
            }
        },
        onSelectBreadcrumb(index) {
            if (index === this.categoryPath.length - 1) return;
            this.cancelAchievementRequest();
            const data = cloneDeep(this.categoryPath[index]);
            this.categoryPath = this.categoryPath.slice(0, index + 1);
            this.showList = false;
            this.achievements_list = [];
            this.$store.commit("SET_STATE", { key: "viewAchievementsName", value: data.name });
            this.getRenderList(data.children);
            this.scrollToCategorySection();
        },
        goOverview() {
            if (!this.categoryPath.length && !this.showList) return;
            this.cancelAchievementRequest();
            this.categoryPath = [];
            this.showList = false;
            this.achievements_list = [];
            this.$store.commit("SET_STATE", { key: "viewAchievementsName", value: null });
            this.getRenderList();
            this.scrollToCategorySection();
        },
        scrollToCategorySection() {
            this.$nextTick(() => {
                const section = this.$refs.categorySection?.$el || this.$refs.categorySection;
                if (!section) return;

                const scrollContainer = document.scrollingElement || document.documentElement;
                const sectionTop = section.getBoundingClientRect().top;
                const sidebar = document.querySelector(
                    ".m-achievement-main.c-pvx-modern-achievement-overview > .m-achievement-sidebar"
                );
                if (sidebar && window.matchMedia("(min-width: 1134px)").matches) {
                    const stickyTop = Number.parseFloat(window.getComputedStyle(sidebar).top) || 0;
                    this.setScrollTopImmediately(
                        scrollContainer,
                        Math.max(0, window.scrollY + sectionTop - stickyTop)
                    );
                    return;
                }

                const scrollMarginTop =
                    Number.parseFloat(window.getComputedStyle(section).scrollMarginTop) || 0;
                this.setScrollTopImmediately(
                    scrollContainer,
                    Math.max(0, window.scrollY + sectionTop - scrollMarginTop)
                );
            });
        },
        setScrollTopImmediately(scrollContainer, scrollTop) {
            const previousScrollBehavior = scrollContainer.style.scrollBehavior;
            scrollContainer.style.scrollBehavior = "auto";
            scrollContainer.scrollTop = scrollTop;
            scrollContainer.style.scrollBehavior = previousScrollBehavior;
        },
        // 获取成就列表
        getMenuAchievements(menu) {
            const requestId = ++this.achievementRequestId;
            clearTimeout(this.loadingDelayTimer);
            this.loading = false;
            this.loadingDelayTimer = setTimeout(() => {
                if (requestId === this.achievementRequestId) {
                    this.loading = true;
                }
            }, 180);

            return getMenuAchievements(menu.sub, menu.detail)
                .then((data) => {
                    if (requestId !== this.achievementRequestId) return false;
                    let list = data.data.data.achievements || [];
                    let arr = [];
                    list.forEach((item) => {
                        item.isCompleted = menu.ownAchievements.includes(item.ID);
                        arr.push(item);
                        if (item.SeriesAchievementList) {
                            item.SeriesAchievementList.forEach((sub, index) => {
                                if (index > 0) {
                                    sub.isCompleted = menu.ownAchievements.includes(sub.ID);
                                    arr.push(sub);
                                }
                            });
                        }
                    });
                    this.achievements_list = arr;
                    return true;
                })
                .catch(() => false)
                .finally(() => {
                    if (requestId !== this.achievementRequestId) return;
                    clearTimeout(this.loadingDelayTimer);
                    this.loadingDelayTimer = null;
                    this.loading = false;
                });
        },
        cancelAchievementRequest() {
            this.achievementRequestId += 1;
            clearTimeout(this.loadingDelayTimer);
            this.loadingDelayTimer = null;
            this.loading = false;
        },
        resetCategoryView() {
            this.cancelAchievementRequest();
            this.categoryPath = [];
            this.showList = false;
            this.achievements_list = [];
            this.$store.commit("SET_STATE", { key: "viewAchievementsName", value: null });
        },
        refreshRenderList() {
            if (this.showList) return;
            const currentCategory = this.categoryPath[this.categoryPath.length - 1];
            this.getRenderList(currentCategory?.children);
        },
        loadData() {
            return this.getList();
        },
        getRenderList(data) {
            data = data || this.achievementData;
            const list = Object.keys(data).map((key) => {
                const item = data[key];
                const allData = this.getAllachievementsData(item);
                return {
                    sub: item.sub,
                    detail: item.detail,
                    name: item.name,
                    allAchievements: allData.allAchievements,
                    ownAchievements: allData.ownAchievements,
                    children: item.children,
                    allPoints: allData.allPoints,
                    ownPoints: allData.ownPoints,
                };
            });
            this.list = list;
        },
        getCurrentProgress(own, all) {
            if (!all) return "0.00";
            return ((own / all) * 100).toFixed(2);
        },
        isCategoryComplete(item) {
            return item.allPoints > 0 && item.ownPoints >= item.allPoints;
        },
        getCurrentProgressBg(own, all) {
            let n = 0;
            if (!all) {
                n = own;
            } else {
                n = ((own / all) * 100).toFixed(2);
            }
            if (n > 66) {
                return `linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(204, 184, 155, 1) 100%)`;
            } else if (n > 33) {
                return `linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(191, 191, 191, 1) 100%)`;
            } else {
                return `linear-gradient(90deg, rgba(247, 247, 247, 1) 0%, rgba(204, 177, 175, 1) 100%)`;
            }
        },
        // 回调获取所有成就
        getAllachievementsData(
            data,
            allAchievements = [],
            ownAchievements = [],
            countData = { allPoints: 0, ownPoints: 0 }
        ) {
            // 我完成的成就
            const ownAllAchievements = this.$store.state.achievements;
            // console.log("成就循环", data);
            data.achievements.forEach((aItem) => {
                // 判断aItem是否是数组
                if (Array.isArray(aItem)) {
                    aItem.forEach((item) => {
                        if (this.pointsData[item]) {
                            countData.allPoints += this.pointsData[item];
                            allAchievements.push(item);
                            if (ownAllAchievements.includes(String(item))) {
                                countData.ownPoints += this.pointsData[item];
                                ownAchievements.push(item);
                            }
                        }
                    });
                } else {
                    if (this.pointsData[aItem]) {
                        countData.allPoints += this.pointsData[aItem];
                        allAchievements.push(aItem);
                        if (ownAllAchievements.includes(String(aItem))) {
                            countData.ownPoints += this.pointsData[aItem];
                            ownAchievements.push(aItem);
                        }
                    }
                }
            });

            if (data.children) {
                data.children.forEach((item) => {
                    this.getAllachievementsData(item, allAchievements, ownAchievements, countData);
                });
            }

            // 去重
            return {
                allAchievements: allAchievements,
                allPoints: countData.allPoints,
                ownAchievements: ownAchievements,
                ownPoints: countData.ownPoints,
            };
        },
        // 获取成就列表
        getList() {
            return getMenus({
                general: 1,
                client: this.$store.state.client,
            }).then((res) => {
                const data = res.data.data.menus;
                this.achievementData = data;
                return this.getPoints();
            });
        },
        // 获取成就对应点数
        getPoints() {
            return getAchievementPoints().then((res) => {
                const data = res.data.data.points;
                this.pointsData = data;
                return this.loadUserRoles();
            });
        },
        // 获取用户角色列表
        loadUserRoles() {
            if (!this.isLogin) return Promise.resolve();
            return getUserRoles().then((res) => {
                this.roleList = res.data?.data?.list || [];
                const wiki_last_sync_jx3id = localStorage.getItem("wiki_last_sync");
                const lastRole = this.roleList.find((item) => item.jx3id == wiki_last_sync_jx3id);
                this.currentRole = lastRole || this.roleList[0] || null;
                if (this.currentRole) {
                    this.$store.commit("SET_STATE", { key: "role", value: this.currentRole });
                }
            });
        },
        // 获取角色成就状态
        loadRoleAchievements(jx3id) {
            getRoleGameAchievements(jx3id).then((res) => {
                const achievements = res.data?.data?.achievements || "";
                const jx3id = res.data?.data?.jx3id;
                this.isSync = !!jx3id; // 是否在游戏中同步
                const list = achievements.split(",");
                this.$store.commit("SET_STATE", { key: "achievements", value: list, isSession: true });
            });
        },
        // 获取虚拟角色成就列表
        loadVirtualAchievements() {
            if (!this.currentRole || this.currentRole.jx3id) return;
            getVirtualRoleAchievements().then((res) => {
                const achievements = res.data?.data?.achievements || "";
                const list = achievements.split(",");
                this.$store.commit("SET_STATE", { key: "achievementsVirtual", value: list });
            });
        },
    },
};
</script>

<style lang="less">
.p-achievement-overview {
    // .pa;
    // bottom: 10px;
    .pt(86px);
    width: 960px;

    &.is_mobile {
        width: calc(100vw - 137px);
        height: 100%;
        .pt(0);

        .m-cj-list {
            height: calc(100% - 40px) !important;
            .pt(40px);

            .u-achievement-name {
                flex-direction: column;

                img {
                    padding-right: 0 !important;
                }
            }
        }
    }

    .m-overview-header {
        .mb(18px);
        .flex;
        justify-content: space-between;
        gap: 48px;

        .m-header-info {
            flex: 1;
            .pt(42px);

            .m-info-user {
                .mb(8px);
                .flex;
                .h(35px);
                transition: 0.5s;
                align-items: center;
                color: rgba(255, 236, 204, 1);

                .u-name {
                    .fz(24px, 35px);
                    .mr(8px);
                    .bold;
                }

                .u-toggle-btn {
                    .r(4px);
                    .size(96px, 28px);
                    .ml(36px);
                    .flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(191, 184, 172, 1);
                    color: #ffeccc;
                    gap: 4px;
                    cursor: pointer;

                    > div {
                        .flex;
                        align-items: center;

                        img {
                            .ml(4px);
                            width: 16px;
                            height: 16px;
                        }
                    }
                }

                .u-overview {
                    .fz(24px, 35px);
                    .bold;
                    color: white;
                    margin-left: auto;
                    cursor: pointer;
                    text-decoration: underline;
                    position: relative;
                    bottom: -5px;
                }
            }

            .m-info-zl {
                background: rgba(247, 247, 247, 1);
                padding: 12px 8px;

                .m-info-zl__info {
                    .mb(8px);
                    .flex;
                    width: 100%;
                    justify-content: space-between;
                    align-items: center;

                    > div {
                        .flex;
                        align-items: center;
                    }

                    .u-title,
                    .u-number {
                        .fz(32px, 47px);
                        .bold;
                    }

                    .u-number {
                        .ml(8px);
                        color: rgba(201, 146, 50, 1);
                    }

                    .u-rate {
                        .fz(24px, 35px);
                        .bold;
                        color: rgba(148, 126, 93, 1);
                    }
                }

                .m-info-zl__progress {
                    position: relative;
                    .size(100%, 12px);
                    background: white;

                    .u-active-progress {
                        position: absolute;
                        transition: 0.5s;
                        left: 0;
                        top: 0;
                        height: 100%;
                    }
                }
            }
        }

        .m-info-avatar {
            width: 220px;
            height: 220px;
            position: relative;

            .u-avatar-border {
                width: 240px;
                height: 240px;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 2;
            }

            .u-achievement-icon {
                position: absolute;
                z-index: 1;
                width: 200px;
                height: 200px;
                border-radius: 100%;
                overflow: hidden;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }

            .u-avatar-img {
                position: absolute;
                z-index: 1;
                width: 160px;
                height: 160px;
                border-radius: 100%;
                background-color: #fff;
                overflow: hidden;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }

    //手机端用户信息
    .m-overview-header_mobile {
        position: fixed;
        .z(21);
        width: 100vw;
        .lt(0);
        background-color: #fff;
        .h(40px);
        padding: 8px 24px;
        box-sizing: border-box;
        .flex;
        align-items: center;
        justify-content: space-between;

        .u-name {
            .fz(16px, 24px);
            .bold(400);
            color: rgba(181, 148, 87, 1);
            .flex;
            .flex(o);
        }

        .u-toggle-btn {
            .size(60px, 18px);
            .r(4px);
            border: 1px solid #bfb8ac;
            .flex;
            .flex(o);
            .fz(12px);
            .bold(400);
            color: rgba(191, 184, 172, 1);
        }
    }

    //移动端查看总览
    .u-overview_mobile {
        position: fixed;
        left: 12px;
        bottom: 12px;
        .fz(24px);
        .bold(900);
        color: #fff;
        text-decoration: underline;
        z-index: 9;

        &.isScroll {
            bottom: 92px;
        }
    }

    .m-overview-main {
        .grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(6, 1fr);
        height: 540px;
        overflow-y: auto;
        row-gap: 15px;
        column-gap: 12px;
        padding-right: 10px;

        /* 针对Webkit内核的浏览器 */
        &::-webkit-scrollbar {
            /* 设置滚动条的宽度 */
            width: 10px;
        }

        /* 滚动条轨道 - 背景颜色/白底 */
        &::-webkit-scrollbar-track {
            background: #595958;
            border-radius: 10px;
        }

        /* 滚动条的滑块部分 */
        &::-webkit-scrollbar-thumb {
            background: #e2d3b9;
            border-radius: 10px;
        }

        /* 当鼠标悬停在滚动条滑块上时改变颜色 */
        &::-webkit-scrollbar-thumb:hover {
            background: #e2d3b9;
        }

        .m-cj-item {
            .flex;
            .h(70px);
            cursor: pointer;

            .u-border {
                width: 4px;
                height: 100%;
            }

            .m-cj-wrapper {
                position: relative;
                flex: 1;
                background: #ebe5df;

                .m-cj-content {
                    .size(100%, 70px);
                    position: relative;
                    box-sizing: border-box;
                    padding: 10px 8px;
                    z-index: 3;

                    .u-cj-info {
                        .flex;
                        justify-content: space-between;
                        .mb(8px);

                        .u-name {
                            .fz(16px, 24px);
                            .bold;
                            color: rgba(61, 61, 61, 1);
                        }

                        .u-rate {
                            .fz(16px, 24px);
                            .bold;
                            color: rgba(112, 83, 45, 1);
                        }
                    }

                    .m-count-box {
                        .r(2px);
                        .dbi;
                        .fz(12px, 18px);
                        box-sizing: border-box;
                        padding: 0 4px;
                        color: rgba(161, 161, 161, 1);
                        background: rgba(255, 255, 255, 0.5);

                        .m-count-inner {
                            .flex;
                            gap: 12px;

                            .u-item {
                                height: 18px;
                                .flex;
                                align-items: center;

                                img {
                                    .mr(4px);
                                }
                            }
                        }
                    }
                }

                .u-progress {
                    transition: 0.5s;
                    position: absolute;
                    box-sizing: border-box;
                    border: 2px solid #f7f7f7;
                    border-left: 0;
                    z-index: 1;
                    left: 0;
                    top: 0;
                    height: 100%;
                }

                .u-logo {
                    position: absolute;
                    right: 12px;
                    top: 0;
                    z-index: 2;

                    img {
                        .h(70px);
                    }
                }
            }
        }

        //列表手机端
        &.is_mobile {
            .mt(40px);
            height: calc(100vh - 60px);
            .db;
            .pr(0);
            .pb(100px);

            &::-webkit-scrollbar {
                /* 设置滚动条的宽度 */
                width: 0;
            }

            .m-info-zl {
                .mt(20px);
                .mb(20px);
                .h(80px);
                padding: 12px 12px 12px 12px;
                box-sizing: border-box;
                background: rgba(247, 247, 247, 1);

                .u-title,
                .u-number,
                .u-rate {
                    .fz(20px, 28px);
                    .bold(700);
                }

                .m-info-zl__info {
                    .flex;
                    justify-content: space-between;
                }

                .u-title {
                    color: rgba(65, 65, 64, 1);
                }

                .u-number {
                    color: rgba(181, 148, 87, 1);
                }

                .u-rate {
                    color: rgba(148, 126, 93, 1);
                }

                .m-info-zl__progress {
                    .mt(8px);
                    position: relative;
                    .size(100%, 12px);
                    background: white;

                    .u-active-progress {
                        position: absolute;
                        transition: 0.5s;
                        left: 0;
                        top: 0;
                        height: 100%;
                    }
                }
            }

            .m-cj-item {
                .mb(12px);
            }
        }

        &.isScroll {
            height: calc(100vh - 140px);
        }
    }

    .m-cj-list,
    .el-table__body-wrapper {
        height: 540px;
        overflow-y: auto;

        /* 针对Webkit内核的浏览器 */
        &::-webkit-scrollbar {
            /* 设置滚动条的宽度 */
            width: 10px;
        }

        /* 滚动条轨道 - 背景颜色/白底 */
        &::-webkit-scrollbar-track {
            background: #595958;
            border-radius: 10px;
        }

        /* 滚动条的滑块部分 */
        &::-webkit-scrollbar-thumb {
            background: #e2d3b9;
            border-radius: 10px;
        }

        /* 当鼠标悬停在滚动条滑块上时改变颜色 */
        &::-webkit-scrollbar-thumb:hover {
            background: #e2d3b9;
        }

        .el-table {
            &::before {
                height: 0;
            }
        }

        .el-table,
        .u-table-header_row,
        .u-table-header_cell {
            background-color: transparent;

            .el-table__body tr:hover > td {
                background-color: #f3f0ed;
            }
        }

        .u-table-header_cell {
            // .x;
            color: rgba(245, 224, 201, 1);

            .u-table-cell_left {
                padding-left: 0;
                padding-right: 0;
                .w(100%);
                text-align: left;
            }

            .u-table-cell_right {
                padding-left: 0;
                padding-right: 0;
                .w(100%);
                text-align: right;
            }
        }

        .u-table-cell {
            // .x;
            color: rgba(112, 83, 45, 1);

            a {
                color: rgba(112, 83, 45, 1);
            }
        }

        .u-table-row {
            //奇偶选择器
            &:nth-child(odd) {
                background: #ebe5df;
            }

            &:nth-child(even) {
                background: #fff;
            }
        }

        .u-table-header_row {
            .gutter {
                display: none !important;
            }
        }

        .u-achievement-name {
            .flex;
            align-items: center;

            img {
                padding-right: 4px;
            }

            span {
                color: #70532d;
            }
        }
    }
}

.m-role-dropdown {
    ::v-deep {
        .el-dropdown-menu__item {
            padding: 0;
        }

        .popper__arrow {
            display: none;
        }
    }

    .m-role-item {
        .flex;
        justify-content: space-between;
        gap: 20px;
        min-width: 180px;
        padding: 0 12px;

        &:hover {
            background: linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(204, 184, 155, 1) 100%);
            color: #947e5d;
        }

        &.active {
            color: #947e5d;
            background: linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(204, 184, 155, 1) 100%);
        }
    }
}

//底部总览信息
.m-zl-info_bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    .size(100%, 80px);
    padding: 12px 12px 12px 12px;
    box-sizing: border-box;
    background: rgba(247, 247, 247, 1);
    z-index: 9;

    .m-box_bottom {
        .flex;
        justify-content: space-between;
    }

    .u-title,
    .u-number,
    .u-rate {
        .fz(20px, 28px);
        .bold(700);
    }

    .u-title {
        color: rgba(65, 65, 64, 1);
    }

    .u-number {
        color: rgba(181, 148, 87, 1);
    }

    .u-rate {
        color: rgba(148, 126, 93, 1);
    }

    .m-info-zl__progress {
        .mt(8px);
        position: relative;
        .size(100%, 12px);
        background: white;

        .u-active-progress {
            position: absolute;
            transition: 0.5s;
            left: 0;
            top: 0;
            height: 100%;
        }
    }
}

.v-miniprogram {
    // 资历宝典
    .m-achievement-content {
        width: 100%;
        min-width: 100%;
        margin-left: 0;
        padding: 0 10px;
        box-sizing: border-box;
    }

    .m-achievement-main {
        margin-top: 0;
        height: 100%;
        flex-direction: column;
        gap: 0;
    }

    .p-achievement-overview {
        padding-top: 0;
        width: 100%;

        .m-overview-main {
            grid-template-columns: repeat(1, 1fr);
            grid-template-rows: repeat(1, 1fr);
        }
    }

    .p-achievement-overview .m-overview-header .m-header-info {
        flex: none;
        width: calc(100% - 20px);
        margin: 0 10px;
    }

    .m-achievement-sidebar .m-sidebar-nav li ul {
        margin-left: 0;
    }
}

// @import "../../assets/css/miniprogram.less";
</style>
