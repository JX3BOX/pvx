<script>
import User from "@jx3box/jx3box-common/js/user";
import { createConsultation, getConsultations, getConsultationExperts } from "@/service/achievementConsultation";
import ConsultationDetail from "./ConsultationDetail.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { ChatDotRound } from "@element-plus/icons-vue";

export default {
    name: "PlanConsultations",
    components: { ConsultationDetail, ChatDotRound, PvxSurface },
    props: { plan: { type: Object, default: null }, defaultQuestion: { type: String, default: "" }, roles: { type: Array, required: true }, defaultRoleId: { type: String, default: "" } },
    data: () => ({ rows: [], total: 0, pendingId: null, page: 1, loading: false, error: "", saving: false, opening: false, dialog: false, detailId: null,
        experts: [], expertsLoading: false, expertsError: false, requestId: 0, expertRequestId: 0,
        form: { role_id: null, target_expert_id: null, question: "" } }),
    computed: {
        planRoleId() { return String(this.plan?.meta?.roleId || ""); },
        planRole() { return this.roles.find((role) => String(role.id) === this.planRoleId) || null; },
        consultationRoleId() { return this.planRoleId ? this.planRole?.roleId || null : this.form.role_id; },
        notificationId() {
            const value = this.$route.query.consultation_id;
            return typeof value === "string" && /^[1-9]\d*$/.test(value) ? value : null;
        },
    },
    watch: {
        'plan.id': { immediate: true, handler() { this.dialog = false; this.detailId = this.notificationId; this.page = 1; if (this.plan) this.load(); } },
        notificationId(value) { this.detailId = value; },
    },
    beforeUnmount() { this.requestId += 1; this.expertRequestId += 1; },
    methods: {
        async ensureConsultationLevel() {
            try {
                const asset = await User.getAsset();
                if (Number(User.getLevel(asset?.experience)) >= 2) return true;
                this.$message.error(this.$t('achievementConsultation.levelRequired'));
            } catch {
                this.$message.error(this.$t('achievementConsultation.levelCheckFailed'));
            }
            return false;
        },
        openDetail(id) {
            if (this.plan) this.detailId = id;
            else this.$router.push({ name: 'consultation-detail', params: { id } });
        },
        closeDetail() {
            this.detailId = null;
            if (this.notificationId) {
                const query = { ...this.$route.query };
                delete query.consultation_id;
                this.$router.replace({ query });
            }
        },
        async load() {
            const request = ++this.requestId;
            this.loading = true; this.error = "";
            try {
                const result = await getConsultations({ scope: "player", ...(this.plan ? { plan_id: this.plan.id } : {}), page: this.page, per: 10 });
                if (request === this.requestId) { this.rows = result.list; this.total = result.total; this.pendingId = result.pending_id; return true; }
            } catch (error) { if (request === this.requestId) this.error = error?.response?.data?.msg || error.message; }
            finally { if (request === this.requestId) this.loading = false; }
        },
        async openCreate() {
            if (this.saving || this.opening) return;
            this.opening = true;
            try {
                if (!await this.load()) { if (this.error) this.$message.error(this.error); return; }
                if (this.pendingId) { this.openDetail(this.pendingId); return; }
                if (!await this.ensureConsultationLevel()) return;
                this.form = { role_id: (this.planRoleId ? this.planRole : this.roles.find((role) => role.id === this.defaultRoleId))?.roleId || null,
                    target_expert_id: null, question: this.defaultQuestion || "" };
                this.dialog = true; this.loadExperts();
            } finally { this.opening = false; }
        },
        async loadExperts() {
            const request = ++this.expertRequestId;
            this.expertsLoading = true; this.expertsError = false;
            try { const result = await getConsultationExperts(); if (request === this.expertRequestId) this.experts = result.filter((expert) => String(expert.user_id) !== String(User.getInfo()?.uid)); }
            catch { if (request === this.expertRequestId) this.expertsError = true; }
            finally { if (request === this.expertRequestId) this.expertsLoading = false; }
        },
        async submit() {
            if (this.saving || !this.consultationRoleId || !this.form.question.trim()) return;
            if (this.form.target_expert_id != null && String(this.form.target_expert_id) === String(User.getInfo()?.uid)) return;
            const planId = this.plan?.id;
            this.saving = true;
            try {
                if (!await this.ensureConsultationLevel()) return;
                const result = await createConsultation({ ...(planId ? { plan_id: Number(planId) } : {}), ...this.form, role_id: this.consultationRoleId, question: this.form.question.trim() });
                if (planId !== this.plan?.id) return;
                this.$message.success(this.$t('achievementConsultation.submitted'));
                this.dialog = false; this.page = 1;
                if (!planId) {
                    if (result?.id) this.openDetail(result.id);
                    else this.$router.push({ name: 'consultation' });
                } else await this.load();
            } catch (error) { this.$message.error(error?.response?.data?.msg || error.message); }
            finally { this.saving = false; }
        },
    },
};
</script>

<template>
    <PvxSurface v-if="plan" class="m-plan-consultations" padding="small" radius="medium" v-loading="loading">
        <header><h2><el-icon><ChatDotRound /></el-icon>{{ $t('achievementConsultation.records') }}</h2></header>
        <el-alert v-if="error" :title="error" type="error" :closable="false" />
        <el-button v-if="error" @click="load">{{ $t('achievementRecommendation.retry') }}</el-button>
        <p v-else-if="!loading && !rows.length" class="m-plan-consultations__empty" role="status">{{ $t(plan ? 'achievementConsultation.noRequests' : 'achievementConsultation.noDirectRequests') }}</p>
        <div v-for="row in rows" :key="row.id" class="m-plan-consultation-row">
            <div><strong>{{ row.question }}</strong><small>{{ row.expert?.display_name || row.target_expert?.display_name || $t('achievementConsultation.public') }} · {{ $t(`achievementConsultation.${row.status}`) }}</small></div>
            <el-button text @click="detailId = row.id">{{ $t(row.status === 'answered' ? 'achievementConsultation.viewAdvice' : 'achievementConsultation.detail') }}</el-button>
        </div>
        <el-pagination v-if="total > 10" v-model:current-page="page" :total="total" :page-size="10" layout="prev, pager, next" @current-change="load" />
    </PvxSurface>
        <el-dialog draggable v-model="dialog" class="m-plan-consultation-dialog" :title="$t(plan ? 'achievementConsultation.request' : 'achievementConsultation.directRequest')" width="min(540px, calc(100vw - 24px))" append-to-body
            :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
            <el-form label-position="top" :disabled="saving">
                <el-form-item v-if="planRoleId" :label="$t('achievementRecommendation.chooseRole')">
                    <el-input :model-value="planRole ? [planRole.name, planRole.server].filter(Boolean).join(' · ') : $t('achievementConsultation.roleUnavailable')" disabled />
                </el-form-item>
                <el-form-item v-else :label="$t('achievementRecommendation.chooseRole')" required><el-select v-model="form.role_id" filterable>
                    <el-option v-for="role in roles" :key="role.id" :value="role.roleId" :label="[role.name, role.server].filter(Boolean).join(' · ')" :disabled="!role.roleId" />
                </el-select></el-form-item>
                <el-form-item :label="$t('achievementConsultation.expert')"><el-select v-model="form.target_expert_id" :placeholder="$t('achievementConsultation.public')" filterable :loading="expertsLoading">
                    <el-option :value="null" :label="$t('achievementConsultation.public')" />
                    <el-option v-for="expert in experts" :key="expert.user_id" :value="Number(expert.user_id)" :label="`${expert.user?.display_name || expert.user_id} (#${expert.user_id})`" />
                </el-select></el-form-item>
                <el-button v-if="expertsError" @click="loadExperts">{{ $t('achievementConsultation.retryExperts') }}</el-button>
                <el-form-item :label="$t('achievementConsultation.question')" required><el-input v-model="form.question" type="textarea" :rows="5" :placeholder="$t('achievementConsultation.questionPlaceholder')" maxlength="2000" show-word-limit /></el-form-item>
            </el-form>
            <template #footer><el-button type="primary" :loading="saving" :disabled="!consultationRoleId || !form.question.trim()" @click="submit">{{ $t('achievementConsultation.submit') }}</el-button></template>
        </el-dialog>
        <el-dialog draggable :model-value="Boolean(detailId)" class="m-plan-consultation-detail-dialog" :title="$t('achievementConsultation.detail')" width="min(1180px, calc(100vw - 24px))" append-to-body destroy-on-close
            @update:model-value="!$event && closeDetail()"><ConsultationDetail v-if="detailId" :id="detailId" @changed="load" /></el-dialog>
</template>

<style lang="less" scoped>
.m-plan-consultations { min-width: 0;
    header { display: flex; justify-content: space-between; align-items: center; gap: 12px; } h2 { display: flex; align-items: center; gap: 8px; font-size: 17px; margin: 0; color: #47777d; }
    :deep(.el-select) { width: 100%; }
}
.m-plan-consultations__empty { margin: 8px 0 0; color: #7a8586; font-size: 14px; line-height: 1.6; }
.m-plan-consultation-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #edf0ee;
    > div { min-width: 0; } strong { display: block; font-size: 14px; font-weight: 500; overflow-wrap: anywhere; }
    small { display: block; margin-top: 5px; color: #7a8586; } .el-button { flex: none; }
}
</style>

<style lang="less">
.m-plan-consultation-dialog, .m-plan-consultations { --el-color-primary: #47777d; --el-border-color: #dce4e1; }
</style>
