<script>
import AchievementSelectionBrowser from "./AchievementSelectionBrowser.vue";
import {
    fetchAchievementWorkbenchRecordsBatched,
    fetchAchievementWorkbenchDifficultyMetrics,
    fetchAchievementWorkbenchTags,
} from "@/service/achievementWorkbench";
import { buildAchievementLeapCandidates } from "@/utils/achievementLeap";
import { enrichAchievementRecommendationRecords } from "@/utils/achievementRecommendation";
import { applyAchievementWorkbenchEnrichment } from "@/utils/achievementWorkbench";

export default {
    name: "AchievementLeapAddDialog",
    components: { AchievementSelectionBrowser },
    props: {
        modelValue: { type: Boolean, default: false },
        metadata: { type: Object, default: () => ({}) },
        menus: { type: Object, default: () => ({}) },
        maps: { type: Array, default: () => [] },
        completedIds: { type: Array, default: () => [] },
        schoolEligibility: { type: Object, default: null },
        client: { type: String, default: "std" },
        dimensions: { type: Array, default: () => [] },
        selectedIds: { type: Array, default: () => [] },
        disabled: { type: Boolean, default: false },
    },
    emits: ["update:modelValue", "add"],
    data() {
        return {
            index: [],
            indexReady: false,
            indexLoading: false,
            indexError: false,
            recordCache: {},
            detailLoading: false,
            detailError: false,
            enrichmentFailedIds: [],
            pageIds: [],
            contextId: 0,
            pageRequestId: 0,
            filters: { keyword: "", mapIds: [], categories: [] },
        };
    },
    computed: {
        visibleMetadata() {
            return Object.fromEntries(
                Object.entries(this.metadata).filter(([, item]) => item?.visible === true)
            );
        },
        records() {
            return this.pageIds.map((id) => this.recordCache[id]).filter(Boolean);
        },
        enrichmentError() {
            return this.pageIds.some((id) => this.enrichmentFailedIds.includes(id));
        },
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(value) {
                if (value) this.loadIndex();
            },
        },
        completedIds() {
            this.resetContext();
        },
        client() {
            this.resetContext();
        },
        schoolEligibility() {
            this.resetContext();
        },
        metadata() {
            this.resetContext();
        },
    },
    beforeUnmount() {
        this.contextId += 1;
        this.pageRequestId += 1;
    },
    methods: {
        resetContext() {
            this.contextId += 1;
            this.pageRequestId += 1;
            this.index = [];
            this.indexReady = false;
            this.indexLoading = false;
            this.indexError = false;
            this.recordCache = {};
            this.detailLoading = false;
            this.detailError = false;
            this.enrichmentFailedIds = [];
            this.pageIds = [];
            this.filters = { keyword: "", mapIds: [], categories: [] };
            if (this.modelValue) this.loadIndex();
        },
        async loadIndex() {
            if (this.indexReady || this.indexLoading) return;
            const context = this.contextId;
            this.indexLoading = true;
            this.indexError = false;
            try {
                const candidates = buildAchievementLeapCandidates({
                    metadata: this.visibleMetadata,
                    menus: this.menus,
                    completedIds: this.completedIds,
                    schoolEligibility: this.schoolEligibility,
                });
                const records = await fetchAchievementWorkbenchRecordsBatched(
                    {
                        ids: candidates.map((item) => item.id),
                        client: this.client,
                        metadata: this.metadata,
                        completedIds: this.completedIds,
                        attributes: "ID,Name,ShortDesc,Sub,Detail,SceneID,dwMapID",
                    },
                    1000
                );
                if (context !== this.contextId) return;
                const returnedIds = new Set(records.map((record) => record.id));
                if (candidates.some((item) => !returnedIds.has(item.id)))
                    throw new Error("Incomplete achievement catalog");
                const allowed = buildAchievementLeapCandidates({
                    metadata: this.visibleMetadata,
                    menus: this.menus,
                    completedIds: this.completedIds,
                    schoolEligibility: this.schoolEligibility,
                    records,
                    allowedIds: records.map((record) => record.id),
                });
                this.index = enrichAchievementRecommendationRecords(allowed, this.menus, this.maps);
                this.indexReady = true;
            } catch (error) {
                if (context === this.contextId) {
                    this.indexError = true;
                    console.error("Failed to load unfinished achievements:", error);
                }
            } finally {
                if (context === this.contextId) this.indexLoading = false;
            }
        },
        async loadPage(ids = this.pageIds, retry = false) {
            this.pageIds = ids;
            const request = ++this.pageRequestId;
            const context = this.contextId;
            const missing = ids.filter((id) => retry || !this.recordCache[id]);
            this.detailLoading = Boolean(missing.length);
            this.detailError = false;
            if (!missing.length) return;
            const client = this.client;
            const current = () => context === this.contextId && request === this.pageRequestId;
            const results = await Promise.allSettled([
                fetchAchievementWorkbenchRecordsBatched({
                    ids: missing,
                    client,
                    metadata: this.metadata,
                    completedIds: this.completedIds,
                }),
                fetchAchievementWorkbenchDifficultyMetrics(missing, { client }),
                fetchAchievementWorkbenchTags(missing, { client }),
            ]);
            if (!current()) return;
            const [details, difficulty, tags] = results;
            if (details.status === "fulfilled") {
                const allowedIds = new Set(this.index.map((item) => item.id));
                const records = enrichAchievementRecommendationRecords(
                    details.value.filter((item) => allowedIds.has(item.id)),
                    this.menus,
                    this.maps
                );
                const enriched = applyAchievementWorkbenchEnrichment(records, {
                    difficultyById: difficulty.status === "fulfilled" ? difficulty.value : {},
                    tagsById: tags.status === "fulfilled" ? tags.value : {},
                });
                enriched.forEach((record) => {
                    this.recordCache[record.id] = record;
                });
                this.detailError = missing.some((id) => !this.recordCache[id]);
            } else {
                this.detailError = true;
                console.error("Failed to load achievement details:", details.reason);
            }
            const failed = difficulty.status === "rejected" || tags.status === "rejected";
            this.enrichmentFailedIds = [
                ...new Set([
                    ...this.enrichmentFailedIds.filter((id) => !missing.includes(id)),
                    ...(failed ? missing : []),
                ]),
            ];
            this.detailLoading = false;
        },
        retry() {
            if (this.indexError) this.loadIndex();
            else this.loadPage(this.pageIds, true);
        },
        add(item) {
            const id = String(item.id);
            if (
                this.disabled ||
                this.selectedIds.map(String).includes(id) ||
                !this.index.some((record) => record.id === id)
            )
                return;
            const [candidate] = buildAchievementLeapCandidates({
                metadata: this.visibleMetadata,
                menus: this.menus,
                completedIds: this.completedIds,
                schoolEligibility: this.schoolEligibility,
                records: [item],
                allowedIds: [id],
            });
            // The editor's route summaries also require normalized cost and duration fields.
            if (candidate) this.$emit("add", { ...item, ...candidate });
        },
    },
};
</script>

<template>
    <el-dialog draggable
        :model-value="modelValue"
        class="c-leap-add-dialog m-recommendation-candidates-dialog"
        width="1100px"
        top="6vh"
        append-to-body
        destroy-on-close
        :close-on-click-modal="false"
        :title="$t('achievementRecommendation.addAchievements')"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <p class="m-candidates-hint">{{ $t("achievementRecommendation.addAchievementsHint") }}</p>
        <AchievementSelectionBrowser
            v-if="modelValue"
            v-model:filters="filters"
            :index="index"
            :records="records"
            :maps="maps"
            :dimensions="dimensions"
            :selected-ids="selectedIds"
            :disabled="disabled"
            :loading="indexLoading || detailLoading"
            :error="indexError || detailError"
            @visible-ids="loadPage"
            @retry="retry"
            @add="add"
        >
            <template #status>
                <p v-if="enrichmentError" class="m-candidates-hint" role="status">
                    {{ $t("achievementRecommendation.enrichmentFailed") }}
                    <el-button text @click="loadPage(pageIds, true)">{{
                        $t("achievementRecommendation.retry")
                    }}</el-button>
                </p>
            </template>
        </AchievementSelectionBrowser>
    </el-dialog>
</template>

<style lang="less" src="@/assets/css/modules/achievement-selection-dialog.less"></style>
