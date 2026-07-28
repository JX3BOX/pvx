<template>
    <div class="p-achievement-overview p-pvx-achievement-overview p-achievement-leap">
        <PvxSurface v-if="!isLogin" class="m-achievement-state is-auth-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.leap.ui.loginRequired')"
                :description="$t('pages.wiki.leap.ui.loginDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton :href="loginUrl">
                        {{ $t("pages.wiki.leap.ui.goLogin") }}
                    </PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="pageError" class="m-achievement-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.leap.ui.loadFailed')"
                :description="$t('pages.wiki.leap.ui.loadFailedDescription')"
            >
                <template #icon><WarningFilled /></template>
                <template #action>
                    <PvxActionButton @click="loadUserRoles">
                        {{ $t("pages.wiki.leap.ui.retry") }}
                    </PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="!pageLoading && !currentRole" class="m-achievement-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.leap.ui.noRole')"
                :description="$t('pages.wiki.leap.ui.noRoleDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton href="/team/role/bind">
                        {{ $t("pages.wiki.leap.ui.bindRole") }}
                        <ArrowRight />
                    </PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <div v-else class="m-achievement-overview-layout" v-loading="pageLoading">
            <PvxSurface v-if="currentRole" class="m-achievement-hero" tag="header" padding="medium">
                <div class="m-achievement-hero__main">
                    <div class="m-achievement-hero__copy">
                        <span class="u-achievement-eyebrow">{{ $t("pages.wiki.leap.ui.eyebrow") }}</span>
                        <h1>{{ detailTitle }}</h1>
                        <p>{{ $t("pages.wiki.leap.ui.heroDescription") }}</p>

                        <div class="m-achievement-role">
                            <img
                                class="u-achievement-school"
                                :src="showSchoolIcon(currentRole.mount)"
                                :alt="$t('pages.wiki.leap.ui.schoolIcon')"
                            />
                            <div class="m-achievement-role__info">
                                <strong>{{ formatRoleLabel(currentRole) }}</strong>
                            </div>
                            <el-dropdown trigger="click">
                                <button
                                    type="button"
                                    class="u-achievement-role-switch"
                                    :aria-label="$t('pages.wiki.leap.ui.switchRole')"
                                >
                                    <span>{{ $t("pages.wiki.leap.ui.switchRole") }}</span>
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

                    <div class="m-achievement-avatar" :class="{ 'has-avatar-frame': showAvatarFrame }">
                        <img v-if="showAvatarFrame" class="u-avatar-border" :src="avatarFrame" alt="" />
                        <RoleAvatar
                            class="u-avatar-img"
                            :mount="currentRole.mount"
                            :body_type="currentRole.body_type"
                        />
                    </div>
                </div>

                <div class="m-achievement-summary">
                    <div class="m-achievement-summary__item">
                        <span>{{ $t("pages.wiki.leap.ui.currentSeniority") }}</span>
                        <strong>{{ formatNumber(currentRole.total || 0) }}</strong>
                    </div>
                    <div class="m-achievement-summary__item">
                        <span>{{ $t("pages.wiki.overview.ui.totalSeniority") }}</span>
                        <strong>{{ formatNumber(allPointsCount) }}</strong>
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
                v-if="currentRole && !showDetail"
                class="m-achievement-categories m-leap-plans"
                padding="medium"
            >
                <div class="m-achievement-section-header m-leap-plans__header">
                    <nav
                        class="m-achievement-context-nav"
                        :aria-label="$t('pages.wiki.leap.ui.planManagement')"
                    >
                        <button type="button" class="is-current" aria-current="page">
                            {{ $t("pages.wiki.leap.ui.title") }}
                        </button>
                    </nav>
                    <div class="m-leap-plans__actions">
                        <button type="button" class="u-leap-guide-button" @click="showGuide = true">
                            <QuestionFilled />
                            <span>{{ $t("pages.wiki.leap.ui.guideAction") }}</span>
                        </button>
                        <button type="button" class="u-leap-create-button" @click="showForm = true">
                            <CirclePlus />
                            <span>{{ $t("pages.wiki.leap.ui.createPlan") }}</span>
                        </button>
                    </div>
                </div>

                <div v-if="list.length" class="m-achievement-category-grid m-leap-plan-grid">
                    <article v-for="item in list" :key="item.id" class="m-leap-plan-shell">
                        <router-link
                            class="m-achievement-category-card m-leap-plan-card"
                            :class="{ 'is-complete': isSchemeComplete(item.schema) }"
                            target="_blank"
                            rel="noopener noreferrer"
                            :to="{ name: 'leap', query: { id: item.id } }"
                        >
                            <div class="m-achievement-category-card__top">
                                <div class="m-achievement-category-card__title">
                                    <span class="u-achievement-category-icon"><Document /></span>
                                    <span>
                                        <strong>{{ item.title }}</strong>
                                        <small class="u-leap-plan-description">
                                            <span>{{ sourceLabel(item) }}</span>
                                            <span>
                                                {{ $t("pages.wiki.leap.ui.improvablePoints") }}
                                                <b>+{{ formatNumber(getSchemePoints(item.schema).diffNum) }}</b>
                                            </span>
                                        </small>
                                    </span>
                                </div>
                                <span class="u-achievement-category-rate">
                                    <CircleCheckFilled v-if="isSchemeComplete(item.schema)" aria-hidden="true" />
                                    {{ getSchemeProgress(item.schema) }}%
                                </span>
                            </div>

                            <div class="m-achievement-category-card__meta">
                                <span>
                                    <img src="@/assets/img/wiki/overview/zl-logo.svg" alt="" />
                                    {{ formatNumber(getSchemePoints(item.schema).all) }}
                                </span>
                                <ArrowRight />
                            </div>

                            <div class="m-achievement-category-progress" aria-hidden="true">
                                <span :style="{ width: `${getSchemeProgress(item.schema)}%` }"></span>
                            </div>
                        </router-link>

                        <button
                            type="button"
                            class="u-leap-delete"
                            :aria-label="$t('pages.wiki.leap.ui.deletePlan', { title: item.title })"
                            @click="deleteItem(item)"
                        >
                            <Delete />
                        </button>
                    </article>
                </div>

                <PvxEmptyState
                    v-else
                    class="m-leap-empty"
                    :title="$t('pages.wiki.leap.ui.noPlans')"
                    :description="$t('pages.wiki.leap.ui.noPlansDescription')"
                >
                    <template #icon><DocumentAdd /></template>
                    <template #action>
                        <button type="button" class="u-leap-create-button is-empty-action" @click="showForm = true">
                            <CirclePlus />
                            <span>{{ $t("pages.wiki.leap.ui.createFirstPlan") }}</span>
                        </button>
                    </template>
                </PvxEmptyState>

                <div v-if="pageTotal > queryParams.per" class="u-leap-page">
                    <el-pagination
                        background
                        layout="prev, pager, next"
                        :page-size="queryParams.per"
                        :total="pageTotal"
                        @current-change="pageChange"
                    />
                </div>
            </PvxSurface>

            <PvxSurface
                v-else-if="currentRole"
                class="m-achievement-list m-leap-detail-surface"
                padding="medium"
            >
                <detail :currentRole="currentRole" />
            </PvxSurface>
        </div>

        <createFrom
            :show="showForm"
            :currentRole="currentRole || {}"
            :pointsData="pointsData"
            @reloadList="reloadList"
            @cancel="showForm = false"
        />

        <el-dialog
            v-model="showGuide"
            class="c-leap-guide-dialog"
            width="520px"
            append-to-body
            destroy-on-close
            :title="$t('pages.wiki.leap.ui.guideTitle')"
        >
            <div class="m-leap-guide">
                <p class="m-leap-guide__intro">
                    {{ $t("pages.wiki.leap.ui.guideDescription") }}
                </p>
                <ol class="m-leap-guide__steps">
                    <li>
                        <span aria-hidden="true">1</span>
                        <p>{{ $t("pages.wiki.leap.ui.guideStep1") }}</p>
                    </li>
                    <li>
                        <span aria-hidden="true">2</span>
                        <p>{{ $t("pages.wiki.leap.ui.guideStep2") }}</p>
                    </li>
                    <li>
                        <span aria-hidden="true">3</span>
                        <p>{{ $t("pages.wiki.leap.ui.guideStep3") }}</p>
                    </li>
                </ol>
            </div>
            <template #footer>
                <button type="button" class="u-leap-guide-confirm" @click="showGuide = false">
                    {{ $t("pages.wiki.leap.ui.guideGotIt") }}
                </button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { getRoleGameAchievements, getAchievementPoints } from "@/service/achievement";
import { getWikiAchievementLeapSchemaList, deleteWikiAchievementLeapSchema } from "@/service/wiki";
import { getUserRoles } from "@/service/team";
import { getMyInfo } from "@/service/user";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
import createFrom from "./form.vue";
import detail from "./detail.vue";
import User from "@jx3box/jx3box-common/js/user";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import { __imgPath, __Links } from "@/utils/config";
import {
    ArrowRight,
    CircleCheckFilled,
    CirclePlus,
    Delete,
    Document,
    DocumentAdd,
    QuestionFilled,
    UserFilled,
    WarningFilled,
} from "@element-plus/icons-vue";

export default {
    components: {
        ArrowRight,
        CircleCheckFilled,
        CirclePlus,
        createFrom,
        Delete,
        detail,
        Document,
        DocumentAdd,
        QuestionFilled,
        PvxActionButton,
        PvxEmptyState,
        PvxSurface,
        RoleAvatar,
        UserFilled,
        WarningFilled,
    },
    data() {
        return {
            isLogin: User.isLogin(),
            userInfo: null,
            currentRole: null,
            roleList: [],
            loading: false,
            pageLoading: User.isLogin(),
            pageError: false,
            list: [],
            queryParams: { page: 1, per: 9 },
            pageTotal: 0,
            showForm: false,
            showGuide: false,
            pointsData: {},
            showDetail: Boolean(this.$route.query.id),
        };
    },
    computed: {
        loginUrl() {
            return __Links.account.login + "?redirect=" + encodeURIComponent(location.href);
        },
        detailTitle() {
            return this.showDetail
                ? this.$t("pages.wiki.leap.ui.planDetail")
                : this.$t("pages.wiki.leap.ui.title");
        },
        avatarFrame() {
            const frame = this.userInfo?.user_avatar_frame;
            return frame ? __imgPath + `avatar/images/${frame}/${frame}.svg` : "";
        },
        showAvatarFrame() {
            return Boolean(this.avatarFrame);
        },
        achievementIdSet() {
            return new Set(
                String(this.currentRole?.achievements || "")
                    .split(",")
                    .filter(Boolean)
                    .map(String)
            );
        },
        allPointsCount() {
            return Object.values(this.pointsData).reduce((total, point) => total + Number(point || 0), 0);
        },
        totalProgress() {
            if (!this.allPointsCount) return "0.00";
            return Math.min(
                100,
                Number((((this.currentRole?.total || 0) / this.allPointsCount) * 100).toFixed(2))
            ).toFixed(2);
        },
    },
    watch: {
        "$route.query.id"(id) {
            this.showDetail = Boolean(id);
        },
    },
    created() {
        if (this.isLogin) this.loadUserRoles();
    },
    methods: {
        showSchoolIcon,
        formatNumber(value) {
            return Number(value || 0).toLocaleString();
        },
        formatRoleLabel(role) {
            return [role?.name, role?.server].filter(Boolean).join(" · ");
        },
        sourceLabel(row) {
            return row.is_official == 1
                ? this.$t("pages.wiki.leap.ui.officialSource")
                : this.$t("pages.wiki.leap.ui.playerSource");
        },
        reloadList() {
            this.showForm = false;
            this.getSchemaList(true);
        },
        async loadUserRoles() {
            this.pageLoading = true;
            this.pageError = false;
            try {
                const [roleRes, userInfo] = await Promise.all([getUserRoles(), getMyInfo()]);
                this.userInfo = userInfo;
                this.roleList = roleRes.data?.data?.list || [];
                this.currentRole = this.roleList[0] || null;
                if (this.currentRole) await this.getPoints();
            } catch (error) {
                this.pageError = true;
            } finally {
                this.pageLoading = false;
            }
        },
        async getPoints() {
            const res = await getAchievementPoints();
            this.pointsData = res.data?.data?.points || {};
            await this.getSchemaList();
        },
        async onChangeRole(role) {
            await this.getRoleGameAchievements(role);
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        async getRoleGameAchievements(role) {
            const target = role || this.currentRole;
            if (!target?.jx3id) return;
            const res = await getRoleGameAchievements(target.jx3id);
            if (role) this.currentRole = role;
            this.currentRole.achievements = res.data?.data?.achievements || "";
            const ids = String(this.currentRole.achievements).split(",").filter(Boolean);
            this.currentRole.total = ids.reduce((total, id) => total + Number(this.pointsData[id] || 0), 0);
        },
        pageChange(page) {
            this.queryParams.page = page;
            this.getSchemaList(true);
        },
        async getSchemaList(skipRoleReload = false) {
            this.loading = true;
            try {
                const res = await getWikiAchievementLeapSchemaList(this.queryParams);
                this.list = res.data?.data?.list || [];
                this.pageTotal = res.data?.data?.total || 0;
                if (!skipRoleReload) await this.getRoleGameAchievements();
            } finally {
                this.loading = false;
            }
        },
        getSchemePoints(schema = []) {
            return this.schemeCompute(
                schema.map((id) => ({
                    ID: String(id),
                    Point: Number(this.pointsData[id] || 0),
                }))
            );
        },
        getSchemeProgress(schema) {
            const points = this.getSchemePoints(schema);
            if (!points.all) return 0;
            return Math.min(100, Number((((points.all - points.diffNum) / points.all) * 100).toFixed(2)));
        },
        isSchemeComplete(schema) {
            const points = this.getSchemePoints(schema);
            return points.all > 0 && points.diffNum === 0;
        },
        schemeCompute(achievements = []) {
            return achievements.reduce(
                (result, achievement) => {
                    result.all += achievement.Point;
                    if (!this.achievementIdSet.has(String(achievement.ID))) {
                        result.diffNum += achievement.Point;
                    }
                    return result;
                },
                { all: 0, diffNum: 0 }
            );
        },
        async deleteItem(row) {
            try {
                await this.$confirm(
                    this.$t("pages.wiki.leap.ui.deleteConfirm", { title: row.title }),
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

            try {
                await deleteWikiAchievementLeapSchema(row.id);
                this.$message.success(this.$t("pages.wiki.leap.ui.deleteSuccess"));
                await this.getSchemaList(true);
            } catch (error) {
                console.error("Failed to delete leap plan:", error);
                this.$message.error(this.$t("pages.wiki.leap.ui.deleteFailed"));
            }
        },
    },
};
</script>
