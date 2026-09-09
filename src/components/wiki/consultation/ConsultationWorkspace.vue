<script>
import { ArrowLeft, ArrowRight, Plus } from "@element-plus/icons-vue";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getConsultationAccess, getConsultations } from "@/service/achievementConsultation";
import User from "@jx3box/jx3box-common/js/user";
import { __Links } from "@/utils/config";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { fetchAchievementWorkbenchRoles } from "@/service/achievementWorkbench";
import PlanConsultations from "./PlanConsultations.vue";
import ConsultationDetail from "./ConsultationDetail.vue";

export default {
    name: "AchievementConsultationWorkspace",
    components: { Plus, PlanConsultations, PvxEmptyState, PvxSurface, ConsultationDetail, ArrowLeft, ArrowRight },
    data: () => ({ isLogin: User.isLogin(), isExpert: false, checking: true, loading: false, error: "", accessError: "", scope: "player", status: "", page: 1,
        roles: [], levelAllowed: false, creating: false, createRequestId: 0, rows: [], total: 0, requestId: 0, accessRequestId: 0 }),
    computed: {
        detailId() { return this.$route.params.id || null; },
        loginUrl() { return __Links.account.login + "?redirect=" + encodeURIComponent(location.href); },
        showStatusFilter() { return this.scope === "player" || this.scope === "directed"; },
        requestStatus() {
            if (this.scope === "public") return "pending";
            return this.scope === "answered" ? "answered" : this.status || undefined;
        },
        tabs() {
            const tabs = [{ name: "player", label: "achievementConsultation.publicQueue" }];
            if (this.isExpert) tabs.push(
                { name: "public", label: "achievementConsultation.expertPublicQueue" },
                { name: "directed", label: "achievementConsultation.directedQueue" },
                { name: "answered", label: "achievementConsultation.answeredQueue" },
            );
            return tabs;
        },
    },
    watch: { detailId(value) { if (!value && this.isLogin) this.load(); } },
    created() { this.initialize(); this.loadCreationAccess(); },
    beforeUnmount() { this.createRequestId += 1; this.requestId += 1; this.accessRequestId += 1; },
    methods: {
        showAvatar,
        async loadCreationAccess() {
            this.levelAllowed = false;
            if (!this.isLogin) return;
            try {
                const asset = await User.getAsset();
                this.levelAllowed = Number(User.getLevel(asset?.experience)) >= 2;
            } catch { /* Keep creation disabled when account level is unavailable. */ }
        },
        async openCreate() {
            if (!this.isLogin || !this.levelAllowed || this.creating || this.scope !== "player" || this.detailId) return;
            const request = ++this.createRequestId;
            this.creating = true;
            try {
                const roles = await fetchAchievementWorkbenchRoles();
                if (request !== this.createRequestId || this.scope !== "player" || this.detailId) return;
                this.roles = roles.filter((role) => role.roleId);
                if (!this.roles.length) { this.$message.error(this.$t('pages.wiki.leap.ui.bindRole')); return; }
                await this.$nextTick();
                await this.$refs.creator?.openCreate();
            } catch (error) { this.$message.error(error?.response?.data?.msg || error.message); }
            finally { if (request === this.createRequestId) this.creating = false; }
        },
        consultationSubmitted() { this.scope = "player"; this.status = ""; this.page = 1; this.load(); },
        date(value) { return value ? new Date(value).toLocaleString(this.$i18n.locale) : "-"; },
        changeScope() { this.page = 1; this.status = this.scope === "player" ? "" : this.scope === "answered" ? "answered" : "pending"; this.load(); },
        changeStatus() { this.page = 1; this.load(); },
        async initialize() {
            const request = ++this.accessRequestId;
            this.checking = true; this.accessError = ""; this.isExpert = false;
            this.requestId += 1;
            if (!this.isLogin) { this.checking = false; return; }
            try {
                const access = await getConsultationAccess();
                if (request !== this.accessRequestId) return;
                this.isExpert = access.is_expert === true || access.is_expert === 1;
            } catch (error) {
                if (request === this.accessRequestId) this.accessError = error?.response?.data?.msg || error.message;
            } finally {
                if (request === this.accessRequestId) {
                    this.checking = false;
                    if (!this.tabs.some((tab) => tab.name === this.scope)) { this.scope = "player"; this.status = ""; this.page = 1; }
                    if (!this.detailId) await this.load();
                }
            }
        },
        async load() {
            if (!this.isLogin) return;
            if (!this.tabs.some((tab) => tab.name === this.scope)) { this.scope = "player"; this.status = ""; this.page = 1; }
            const request = ++this.requestId;
            this.loading = true; this.error = ""; this.rows = []; this.total = 0;
            try {
                const result = await getConsultations({ scope: this.scope, status: this.requestStatus, page: this.page, per: 20 });
                if (request === this.requestId) { this.rows = result.list.filter((row) => !row.plan_id || Boolean(row.plan_title?.trim())); this.total = result.total; }
            } catch (error) {
                if (request !== this.requestId) return;
                this.error = error?.response?.data?.msg || error.message;
            } finally { if (request === this.requestId) this.loading = false; }
        },
    },
};
</script>

<template>
    <div class="m-consultation-workspace" :class="{ 'is-detail': detailId }" v-loading="checking">
        <el-alert v-if="error" :title="error" type="error" :closable="false" />
        <el-button v-if="error" @click="load">{{ $t('achievementRecommendation.retry') }}</el-button>
        <el-alert v-if="accessError" :title="$t('achievementConsultation.accessFailed')" type="warning" :closable="false">
            <el-button text @click="initialize">{{ $t('achievementRecommendation.retry') }}</el-button>
        </el-alert>
        <el-empty v-if="!isLogin" :description="$t('achievementConsultation.loginRequired')">
            <a :href="loginUrl">{{ $t('pages.wiki.leap.ui.goLogin') }}</a>
        </el-empty>
        <template v-if="isLogin">
            <template v-if="detailId">
                <ConsultationDetail :key="detailId" :id="detailId">
                    <template #back>
                        <router-link class="m-consultation-back" :to="{ name: 'consultation' }"><el-icon><ArrowLeft /></el-icon>{{ $t('achievementConsultation.back') }}</router-link>
                    </template>
                </ConsultationDetail>
            </template>
            <PvxSurface v-else class="m-consultation-surface" padding="small" radius="medium">
                <div class="m-consultation-toolbar">
                    <el-tabs v-model="scope" @tab-change="changeScope">
                        <el-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name" :label="$t(tab.label)" />
                    </el-tabs>
                    <el-radio-group v-model="status" class="m-consultation-status-filter"
                        :class="{ 'is-hidden': !showStatusFilter }" :aria-hidden="!showStatusFilter" :disabled="!showStatusFilter"
                        :aria-label="$t('achievementConsultation.status')" @change="changeStatus">
                        <el-radio-button :value="''">{{ $t('achievementConsultation.all') }}</el-radio-button>
                        <el-radio-button v-for="value in ['pending', 'answered']" :key="value" :value="value">{{ $t(`achievementConsultation.${value}`) }}</el-radio-button>
                    </el-radio-group>
                    <el-button v-if="scope === 'player'" type="primary" class="m-consultation-create"
                        :disabled="!levelAllowed" :loading="creating" @click="openCreate">
                        <el-icon><Plus /></el-icon>{{ $t('achievementConsultation.directRequest', '咨询成就高手') }}
                    </el-button>
                </div>
                <el-table :data="rows" v-loading="loading" row-key="id" class="m-consultation-queue">
                    <el-table-column :label="$t('achievementConsultation.question')" min-width="260">
                        <template #default="{ row }"><router-link class="m-consultation-queue-title" :to="{ name: 'consultation-detail', params: { id: row.id } }">{{ row.question || row.plan_title || $t('achievementConsultation.directTitle') }}</router-link><p v-if="row.plan_title || row.plan_id" class="m-consultation-queue-question">{{ row.plan_title || $t('achievementConsultation.planUnavailable') }}</p></template>
                    </el-table-column>
                    <el-table-column :label="$t('achievementConsultation.player')" min-width="170">
                        <template #default="{ row }"><div class="m-consultation-player"><img :src="showAvatar(row.user?.user_avatar)" alt="" loading="lazy" /><span>{{ row.user?.display_name || row.user_id }}</span></div></template>
                    </el-table-column>
                    <el-table-column :label="$t('achievementConsultation.createdAt')" width="180"><template #default="{ row }"><time class="m-consultation-queue-date">{{ date(row.created_at) }}</time></template></el-table-column>
                    <el-table-column :label="$t('achievementConsultation.status')" width="115"><template #default="{ row }"><span class="m-consultation-status" :class="row.status">{{ $t(`achievementConsultation.${row.status}`) }}</span></template></el-table-column>
                    <el-table-column min-width="220" align="right"><template #default="{ row }"><router-link class="m-consultation-open" :to="{ name: 'consultation-detail', params: { id: row.id } }">{{ $t('achievementConsultation.detail') }}<el-icon><ArrowRight /></el-icon></router-link></template></el-table-column>
                    <template #empty>
                        <PvxEmptyState v-if="!loading && !checking && !error" illustrated class="m-consultation-empty"
                            :title="$t('achievementConsultation.emptyQueue')" />
                    </template>
                </el-table>
                <el-pagination v-if="total > 20" v-model:current-page="page" :total="total" :page-size="20" layout="prev, pager, next" @current-change="load" />
            </PvxSurface>
            <PlanConsultations v-if="!detailId && scope === 'player'" ref="creator" :roles="roles"
                :default-role-id="roles[0]?.id || ''" @submitted="consultationSubmitted" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.m-consultation-workspace {
    min-width: 0; color: #314043;
    --el-color-primary: #5a7e84;
    --el-color-primary-light-9: #f3f6f4;
    --el-border-color: #e4e1d9;
    --el-text-color-primary: #314043;
    a { text-decoration: none; }
    > .el-alert { margin-bottom: 12px; }
    :deep(.el-pagination) { margin-top: 20px; justify-content: center; }
}
.m-consultation-surface {
    min-width: 0; min-height: 400px; border: 1px solid rgba(110, 87, 44, 0.1);
    background: rgba(255, 254, 250, 0.94); box-shadow: none; border-radius: 16px;
}
.m-consultation-toolbar {
    display: flex; align-items: center; flex-wrap: wrap; gap: 16px 24px;
    padding: 12px; margin-bottom: 16px; border-radius: 12px; background: #f8f7f3;
    .el-tabs { flex: 1 1 440px; min-width: 0; }
    :deep(.el-tabs__header) { margin: 0; }
    :deep(.el-tabs__content), :deep(.el-tabs__nav-wrap::after), :deep(.el-tabs__active-bar) { display: none; }
    :deep(.el-tabs__nav) { display: flex; gap: 6px; }
    // Element Plus removes padding on the first and last horizontal tabs.
    // Keep equal insets for the consultation pills, including the active first tab.
    :deep(.el-tabs--top .el-tabs__item.is-top:nth-child(2)),
    :deep(.el-tabs--top .el-tabs__item.is-top:last-child) { padding-left: 16px; padding-right: 16px; }
    :deep(.el-tabs__item) {
        min-height: 40px; height: auto; padding: 8px 16px; border: 1px solid transparent;
        border-radius: 24px; color: #6e572c; font-size: 14px; line-height: 1.5;
        &.is-active { background: #f1e7d8; border-color: #c3b08b; font-weight: 600; }
        &:focus-visible { outline: 2px solid #5a7e84; outline-offset: -2px; }
    }
}
.m-consultation-toolbar .m-consultation-create {
    flex: none; height: 30px; min-height: 30px; margin: 0; padding: 4px 12px;
    border-radius: 6px; font-size: 14px; line-height: 20px;
    :deep(> span) { display: inline-flex; align-items: center; gap: 4px; }
    .el-icon { margin: 0; font-size: 14px; }
}
.m-consultation-status-filter {
    display: flex; flex-wrap: wrap; gap: 4px; padding: 0; max-width: 100%;
    border: 0; border-radius: 0; background: transparent;
    &.is-hidden { visibility: hidden; pointer-events: none; }
    :deep(.el-radio-button__inner) {
        min-height: 30px; display: flex; align-items: center; justify-content: center;
        padding: 4px 10px; box-sizing: border-box; border: 0; border-radius: 6px; box-shadow: none;
        background: transparent; color: #737970; font-size: 14px; line-height: 1.4; white-space: normal;
    }
    :deep(.el-radio-button:first-child .el-radio-button__inner),
    :deep(.el-radio-button:last-child .el-radio-button__inner) { border: 0; border-radius: 6px; }
    :deep(.el-radio-button.is-active .el-radio-button__inner) { background: #5a7e84; color: #fff; box-shadow: none; }
    :deep(.el-radio-button__original-radio:focus-visible + .el-radio-button__inner) { outline: 2px solid #967944; outline-offset: -2px; }
}
.m-consultation-queue {
    width: 100%; border-radius: 12px;
    --el-table-header-bg-color: #f8f7f3;
    --el-table-tr-bg-color: #fffefa;
    --el-table-border-color: #ece9e1;
    --el-table-row-hover-bg-color: #f5f4ee;
    --el-table-header-text-color: #6e572c;
    --el-table-text-color: #314043;
    :deep(.el-table__empty-text) { width: 100%; line-height: 1.6; }
    :deep(.el-table__cell) { padding: 18px 0; font-size: 14px; }
    :deep(th.el-table__cell) { padding: 12px 0; font-weight: 500; }
    :deep(.cell) { padding: 0 16px; line-height: 1.6; }
}
.m-consultation-empty { min-height: 280px; width: 100%; border: 0; background: transparent; }
.m-consultation-queue-title {
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    color: #314043; font-size: 14px; font-weight: 600; overflow-wrap: anywhere; white-space: pre-wrap;
    &:hover { color: #5a7e84; }
}
.m-consultation-queue-question { color: #7a8586; margin: 6px 0 0; font-size: 13px; overflow-wrap: anywhere; }
.m-consultation-player {
    display: flex; align-items: center; gap: 10px; font-size: 14px;
    img { width: 32px; height: 32px; border-radius: 8px; flex: none; }
    span { overflow-wrap: anywhere; }
}
.m-consultation-queue-date { font-size: 13px; color: #7a8586; font-variant-numeric: tabular-nums; }
.m-consultation-status {
    display: inline-block; padding: 4px 10px; border-radius: 16px; font-size: 13px; white-space: nowrap;
    color: #7a8586; background: #f0efeb;
    &.pending { color: #967944; background: #f7efdf; }
    &.answered { color: #47777d; background: #edf3ef; }
}
.m-consultation-open, .m-consultation-back {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    min-height: 36px; padding: 6px 12px; border: 1px solid #c3b08b; border-radius: 20px;
    color: #6e572c; background: #fffefa; font-size: 14px; white-space: nowrap;
    &:hover { background: #f1e7d8; }
    &:focus-visible { outline: 2px solid #5a7e84; outline-offset: 2px; }
    .el-icon { flex: none; }
}
.m-consultation-back { flex: none; }
@media (max-width: 720px) {
    .m-consultation-surface { padding: 12px; }
    .m-consultation-toolbar { padding: 8px; gap: 12px; }
    .m-consultation-toolbar .el-tabs { flex-basis: 100%; }
    .m-consultation-toolbar .m-consultation-create { height: 36px; min-height: 36px; }
    .m-consultation-status-filter { width: 100%; .el-radio-button { flex: 1 1 auto; } :deep(.el-radio-button__inner) { min-height: 36px; } }
    .m-consultation-queue :deep(.cell) { padding: 0 12px; }
}
</style>
