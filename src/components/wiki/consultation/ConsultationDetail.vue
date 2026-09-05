<script>
import Editor from "@tinymce/tinymce-vue";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import { getConsultation, replyConsultation, rateConsultation, cancelConsultation } from "@/service/achievementConsultation";
import { fetchAchievementWorkbenchCatalog, fetchAchievementWorkbenchMaps, fetchAchievementWorkbenchDifficultyDimensions } from "@/service/achievementWorkbench";
import { resolveAchievementWorkbenchDimensions } from "@/utils/achievementWorkbench";
import ConsultationAchievements from "./ConsultationAchievements.vue";

export default {
    name: "ConsultationDetail",
    components: { Editor, Article, ConsultationAchievements },
    props: { id: { type: [Number, String], required: true } },
    emits: ["changed"],
    data: () => ({ record: null, catalog: null, maps: [], dimensions: [], loading: false, error: "", saving: false,
        requestId: 0, tab: "plan", advice: "", rating: 0, review: "", editorReady: false, editorError: false,
        editorInit: { height: 320, menubar: false, branding: false, plugins: "lists link table", toolbar: "undo redo | bold italic underline | bullist numlist | link table | removeformat", convert_urls: false } }),
    computed: {
        completedIds() { return this.record?.completion?.ids || []; },
        planIds() { return (this.record?.plan?.schema || []).map(String); },
        visibleIds() { return this.tab === "plan" ? this.planIds : this.completedIds; },
    },
    watch: { id: { immediate: true, handler() { this.advice = ""; this.rating = 0; this.review = ""; this.tab = "plan"; this.load(); } } },
    mounted() { window.addEventListener("error", this.handleEditorLoadError, true); },
    beforeUnmount() { this.requestId += 1; window.removeEventListener("error", this.handleEditorLoadError, true); },
    methods: {
        handleEditorLoadError(event) {
            if (event.target?.tagName === "SCRIPT" && event.target.src === "https://cdn.jx3box.com/static/tinymce/tinymce.min.js") this.editorError = true;
        },
        date(value) { return value ? new Date(value).toLocaleString(this.$i18n.locale) : "—"; },
        async load() {
            const request = ++this.requestId;
            this.loading = true; this.error = ""; this.record = null;
            try {
                const record = await getConsultation(this.id);
                if (request !== this.requestId) return;
                const [catalog, maps, dimensions] = await Promise.all([
                    fetchAchievementWorkbenchCatalog("std"), fetchAchievementWorkbenchMaps("std"), fetchAchievementWorkbenchDifficultyDimensions(),
                ]);
                if (request !== this.requestId) return;
                this.record = record; this.catalog = catalog; this.maps = maps;
                this.dimensions = resolveAchievementWorkbenchDimensions(dimensions);
                this.editorReady = false; this.editorError = false;
            } catch (error) { if (request === this.requestId) this.error = error?.response?.data?.msg || error.message; }
            finally { if (request === this.requestId) this.loading = false; }
        },
        async submit(action) {
            if (this.saving) return;
            const id = this.id;
            const request = this.requestId;
            if (action === "cancel") {
                try { await this.$confirm(this.$t('achievementConsultation.cancelConfirm'), this.$t('achievementConsultation.cancel'), { type: 'warning' }); }
                catch { return; }
                if (request !== this.requestId || this.saving) return;
            }
            this.saving = true;
            try {
                if (action === "reply") await replyConsultation(id, this.advice);
                else if (action === "rate") await rateConsultation(id, { rating: this.rating, review: this.review });
                else await cancelConsultation(id);
                if (request !== this.requestId) return;
                this.$message.success(this.$t(action === 'reply' ? 'achievementConsultation.adviceSaved' : action === 'rate' ? 'achievementConsultation.ratingSaved' : 'achievementConsultation.cancelled'));
                this.$emit("changed");
                await this.load();
            } catch (error) { if (request === this.requestId) this.$message.error(error?.response?.data?.msg || error.message); }
            finally { this.saving = false; }
        },
    },
};
</script>

<template>
    <div class="m-consultation-detail" v-loading="loading">
        <el-alert v-if="error" :title="error" type="error" :closable="false" />
        <el-button v-if="error" @click="load">{{ $t('achievementRecommendation.retry') }}</el-button>
        <template v-if="record">
            <header>
                <h2>{{ record.plan?.title || $t('achievementConsultation.planUnavailable') }}</h2>
                <el-tag effect="plain">{{ $t(`achievementConsultation.${record.status}`) }}</el-tag>
            </header>
            <div class="m-consultation-meta">
                <span>{{ record.user?.display_name }} · {{ record.role ? [record.role.name, record.role.server].filter(Boolean).join(' · ') : $t('achievementConsultation.roleUnavailable') }}</span>
                <span>{{ $t('achievementConsultation.createdAt') }} {{ date(record.created_at) }}</span>
                <span>{{ $t('achievementConsultation.syncAt') }} {{ date(record.completion?.updated_at) }}</span>
            </div>
            <p class="m-consultation-question">{{ record.question }}</p>
            <el-alert v-if="!record.role || !record.plan || !record.completion" type="warning" :closable="false"
                :title="$t(!record.role ? 'achievementConsultation.roleUnavailable' : !record.plan ? 'achievementConsultation.planUnavailable' : 'achievementConsultation.noSync')" />
            <el-tabs v-model="tab">
                <el-tab-pane name="plan" :label="$t('achievementConsultation.currentPlan')" />
                <el-tab-pane name="completed" :label="$t('achievementConsultation.completed')" />
            </el-tabs>
            <ConsultationAchievements :key="`${record.id}:${tab}:${record.updated_at}`" :ids="visibleIds" :completed-ids="completedIds"
                :metadata="catalog.metadata" :menus="catalog.menus" :maps="maps" :dimensions="dimensions"
                :title="$t(tab === 'plan' ? 'achievementConsultation.currentPlan' : 'achievementConsultation.completed')" />
            <section v-if="record.advice_html" class="m-consultation-advice">
                <h3>{{ $t('achievementConsultation.advice') }} · {{ record.expert?.display_name }}</h3>
                <small>{{ date(record.replied_at) }}</small>
                <Article class="m-consultation-richtext" :content="record.advice_html" :pageable="false" />
                <div v-if="record.rating"><el-rate :model-value="record.rating" disabled /><p>{{ record.review }}</p></div>
                <el-form v-else-if="record.is_owner" :disabled="saving" label-position="top">
                    <el-form-item :label="$t('achievementConsultation.rating')"><el-rate v-model="rating" :aria-label="$t('achievementConsultation.rating')" /></el-form-item>
                    <el-form-item :label="$t('achievementConsultation.review')"><el-input v-model="review" type="textarea" maxlength="1000" :rows="3" /></el-form-item>
                    <el-button type="primary" :disabled="!rating" :loading="saving" @click="submit('rate')">{{ $t('achievementConsultation.submitRating') }}</el-button>
                </el-form>
            </section>
            <section v-if="record.can_reply" class="m-consultation-advice">
                <h3>{{ $t('achievementConsultation.advice') }}</h3>
                <Editor v-model="advice" :init="editorInit" :disabled="saving" tinymce-script-src="https://cdn.jx3box.com/static/tinymce/tinymce.min.js"
                    @init="editorReady = true" />
                <el-alert v-if="editorError" :title="$t('achievementConsultation.editorFailed')" type="error" :closable="false" />
                <el-button type="primary" :disabled="!editorReady || !advice.trim() || advice.length > 50000" :loading="saving" @click="submit('reply')">{{ $t('achievementConsultation.submitAdvice') }}</el-button>
            </section>
            <el-button v-if="record.is_owner && record.status === 'pending'" :loading="saving" @click="submit('cancel')">{{ $t('achievementConsultation.cancel') }}</el-button>
        </template>
    </div>
</template>

<style lang="less" scoped>
.m-consultation-detail { min-width: 0; min-height: 120px; color: #314043;
    --el-color-primary: #47777d;
    --el-border-color: #dce4e1;
    padding: 8px;
    header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    h2 { font-size: 18px; margin: 0; overflow-wrap: anywhere; } h3 { font-size: 15px; }
    :deep(.el-tabs__content) { display: none; }
}
.m-consultation-meta { display: flex; flex-wrap: wrap; gap: 8px 20px; color: #7a8586; font-size: 12px; margin: 12px 0; }
.m-consultation-question { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px; line-height: 1.8; padding: 12px 16px; border-left: 3px solid #b69a60; background: #f7f8f4; margin: 18px 0; }
.m-consultation-advice { border-top: 1px solid #e2e8e6; padding: 16px 0; margin-top: 20px;
    > .el-button { margin-top: 12px; } p { white-space: pre-wrap; overflow-wrap: anywhere; }
}
.m-consultation-richtext { margin: 16px 0; overflow-wrap: anywhere; overflow-x: auto; font-size: 14px; line-height: 1.8;
    :deep(img) { max-width: 100%; height: auto; } :deep(table) { border-collapse: collapse; }
    :deep(td), :deep(th) { border: 1px solid #d9e2df; padding: 6px; } :deep(pre) { white-space: pre-wrap; }
}
</style>
