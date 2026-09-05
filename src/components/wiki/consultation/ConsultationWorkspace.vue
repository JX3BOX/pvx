<script>
import { ArrowLeft, ArrowRight, ChatDotRound, Refresh } from "@element-plus/icons-vue";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getConsultationAccess, getConsultations } from "@/service/achievementConsultation";
import ConsultationDetail from "./ConsultationDetail.vue";

export default {
    name: "AchievementConsultationWorkspace",
    components: { ConsultationDetail, ArrowLeft, ArrowRight, ChatDotRound, Refresh },
    data: () => ({ authorized: false, checking: true, loading: false, error: "", scope: "public", status: "pending", page: 1,
        rows: [], total: 0, requestId: 0, accessRequestId: 0 }),
    computed: { detailId() { return this.$route.params.id || null; } },
    watch: { detailId(value) { if (!value && this.authorized) this.load(); } },
    created() { this.initialize(); },
    beforeUnmount() { this.requestId += 1; this.accessRequestId += 1; },
    methods: {
        showAvatar,
        date(value) { return value ? new Date(value).toLocaleString(this.$i18n.locale) : "-"; },
        changeScope() { this.page = 1; this.status = this.scope === "answered" ? "answered" : "pending"; this.load(); },
        changeStatus() { this.page = 1; this.load(); },
        async initialize() {
            const request = ++this.accessRequestId;
            this.checking = true; this.error = ""; this.authorized = false;
            try {
                const access = await getConsultationAccess();
                if (request !== this.accessRequestId) return;
                this.authorized = access.is_expert;
                if (this.authorized && !this.detailId) await this.load();
            } catch (error) { if (request === this.accessRequestId) this.error = error?.response?.data?.msg || error.message; }
            finally { if (request === this.accessRequestId) this.checking = false; }
        },
        async load() {
            if (!this.authorized) return;
            const request = ++this.requestId;
            this.loading = true; this.error = ""; this.rows = [];
            try {
                const result = await getConsultations({ scope: this.scope, status: this.status || undefined, page: this.page, per: 20 });
                if (request === this.requestId) { this.rows = result.list; this.total = result.total; }
            } catch (error) {
                if (request !== this.requestId) return;
                this.error = error?.response?.data?.msg || error.message;
                if (error?.response?.status === 403) this.authorized = false;
            } finally { if (request === this.requestId) this.loading = false; }
        },
    },
};
</script>

<template>
    <div class="m-consultation-workspace" v-loading="checking">
        <el-alert v-if="error" :title="error" type="error" :closable="false" />
        <el-button v-if="error" @click="initialize">{{ $t('achievementRecommendation.retry') }}</el-button>
        <el-empty v-if="!checking && !authorized" :description="$t('achievementConsultation.expertOnly')" />
        <template v-if="authorized">
            <template v-if="detailId">
                <router-link class="m-consultation-back" :to="{ name: 'consultation' }"><el-icon><ArrowLeft /></el-icon>{{ $t('achievementConsultation.back') }}</router-link>
                <ConsultationDetail :key="detailId" :id="detailId" />
            </template>
            <template v-else>
                <header class="m-consultation-workspace-heading">
                    <h1><el-icon><ChatDotRound /></el-icon>{{ $t('achievementConsultation.title') }}</h1>
                    <el-tooltip :content="$t('achievementConsultation.refresh')">
                        <el-button :loading="loading" :aria-label="$t('achievementConsultation.refresh')" @click="load"><el-icon><Refresh /></el-icon></el-button>
                    </el-tooltip>
                </header>
                <div class="m-consultation-toolbar">
                    <el-tabs v-model="scope" @tab-change="changeScope">
                        <el-tab-pane name="public" :label="$t('achievementConsultation.publicQueue')" />
                        <el-tab-pane name="directed" :label="$t('achievementConsultation.directedQueue')" />
                        <el-tab-pane name="answered" :label="$t('achievementConsultation.answeredQueue')" />
                    </el-tabs>
                    <el-select v-model="status" :aria-label="$t('achievementConsultation.status')" @change="changeStatus">
                        <el-option :value="''" :label="$t('achievementConsultation.all')" />
                        <el-option v-for="value in ['pending', 'answered', 'cancelled']" :key="value" :value="value" :label="$t(`achievementConsultation.${value}`)" />
                    </el-select>
                </div>
                <el-table :data="rows" v-loading="loading" row-key="id" class="m-consultation-queue">
                    <el-table-column :label="$t('achievementConsultation.question')" min-width="260">
                        <template #default="{ row }"><router-link class="m-consultation-queue-title" :to="{ name: 'consultation-detail', params: { id: row.id } }">{{ row.plan_title || $t('achievementConsultation.planUnavailable') }}</router-link><p class="m-consultation-queue-question">{{ row.question }}</p></template>
                    </el-table-column>
                    <el-table-column :label="$t('achievementConsultation.player')" min-width="170">
                        <template #default="{ row }"><div class="m-consultation-player"><img :src="showAvatar(row.user?.user_avatar)" alt="" loading="lazy" /><span>{{ row.user?.display_name || row.user_id }}</span></div></template>
                    </el-table-column>
                    <el-table-column :label="$t('achievementConsultation.createdAt')" width="180"><template #default="{ row }"><time class="m-consultation-queue-date">{{ date(row.created_at) }}</time></template></el-table-column>
                    <el-table-column :label="$t('achievementConsultation.status')" width="115"><template #default="{ row }"><span class="m-consultation-status" :class="row.status">{{ $t(`achievementConsultation.${row.status}`) }}</span></template></el-table-column>
                    <el-table-column width="96" fixed="right"><template #default="{ row }"><router-link class="m-consultation-open" :to="{ name: 'consultation-detail', params: { id: row.id } }">{{ $t('achievementConsultation.detail') }}<el-icon><ArrowRight /></el-icon></router-link></template></el-table-column>
                    <template #empty><el-empty :image-size="72" :description="$t('achievementConsultation.emptyQueue')" /></template>
                </el-table>
                <el-pagination v-if="total > 20" v-model:current-page="page" :total="total" :page-size="20" layout="prev, pager, next" @current-change="load" />
            </template>
        </template>
    </div>
</template>

<style lang="less" scoped>
.m-consultation-workspace {
    min-width: 0; padding: 8px; color: #324346;
    --el-color-primary: #47777d;
    --el-color-primary-light-9: #f0f6f5;
    --el-border-color: #dce4e1;
    a { color: #47777d; text-decoration: none; }
    :deep(.el-pagination) { margin-top: 20px; justify-content: center; }
    :deep(.el-tabs__item) { font-size: 14px; color: #768281; }
    :deep(.el-tabs__item.is-active) { color: #47777d; font-weight: 600; }
    :deep(.el-tabs__nav-wrap::after) { height: 1px; background: #e2e8e4; }
    :deep(.el-table) { --el-table-header-bg-color: #f1f5f2; --el-table-tr-bg-color: #ffffff99; --el-table-border-color: #e4e9e5; --el-table-row-hover-bg-color: #f1f7f5; --el-table-header-text-color: #74827e; }
    :deep(.el-table__cell) { padding: 16px 0; }
    :deep(th.el-table__cell) { padding: 10px 0; font-size: 12px; font-weight: 500; }
    @media (max-width: 760px) { padding: 0; }
}
.m-consultation-workspace-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 18px; h1 { display: flex; align-items: center; gap: 10px; font-size: 20px; margin: 0; font-weight: 600; } h1 .el-icon { color: #a88139; } }
.m-consultation-toolbar { display: flex; align-items: start; gap: 24px; .el-tabs { flex: 1; min-width: 0; } .el-select { width: 145px; flex: none; } }
.m-consultation-queue-title { font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.m-consultation-queue-question { color: #7b8683; margin: 5px 0 0; font-size: 12px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow-wrap: anywhere; }
.m-consultation-player { display: flex; align-items: center; gap: 8px; font-size: 13px; img { width: 28px; height: 28px; border-radius: 4px; flex: none; } span { overflow-wrap: anywhere; } }
.m-consultation-queue-date { font-size: 12px; color: #82908b; }
.m-consultation-status { display: inline-block; padding: 3px 7px; border-radius: 4px; font-size: 12px; color: #7b8683; background: #f0f2f0; &.pending { color: #a07c35; background: #faf3e4; } &.answered { color: #47777d; background: #edf5f1; } }
.m-consultation-open, .m-consultation-back { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; }
.m-consultation-back { margin-bottom: 20px; }
@media (max-width: 600px) { .m-consultation-toolbar { display: block; .el-select { width: 100%; margin-bottom: 12px; } } }
</style>
