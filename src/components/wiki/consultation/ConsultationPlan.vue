<script>
import AchievementLeapSummary from "@/components/wiki/leap/AchievementLeapSummary.vue";
import AchievementLeapRouteTable from "@/components/wiki/leap/AchievementLeapRouteTable.vue";
import {
    fetchAchievementWorkbenchRecordsBatched, fetchAchievementWorkbenchDifficulty,
    fetchAchievementWorkbenchDifficultyMetrics, fetchAchievementWorkbenchTags,
} from "@/service/achievementWorkbench";
import { normalizeAchievementLeapPlan, filterAchievementLeapIds, buildAchievementLeapCandidates } from "@/utils/achievementLeap";
import { buildAchievementLeapDetailRoute } from "@/utils/achievementLeapDetail";
import { buildAchievementOverallProgress } from "@/utils/achievementProgress";
import { applyAchievementWorkbenchEnrichment } from "@/utils/achievementWorkbench";

export default {
    name: "ConsultationPlan",
    components: { AchievementLeapSummary, AchievementLeapRouteTable },
    props: {
        plan: { type: Object, required: true },
        metadata: { type: Object, required: true },
        menus: { type: Object, required: true },
        completedIds: { type: Array, required: true },
        maps: { type: Array, required: true },
        dimensions: { type: Array, required: true },
    },
    data: () => ({ items: [], loading: false, error: false, requestId: 0 }),
    computed: {
        normalizedPlan() { return normalizeAchievementLeapPlan(this.plan); },
        route() {
            const currentPoints = buildAchievementOverallProgress(this.metadata, this.completedIds).completedPoints;
            return buildAchievementLeapDetailRoute(this.normalizedPlan, this.items, this.metadata, this.completedIds, currentPoints);
        },
    },
    watch: {
        plan: { immediate: true, handler() { this.load(); } },
        completedIds() { this.load(); },
    },
    beforeUnmount() { this.requestId += 1; },
    methods: {
        async load() {
            const request = ++this.requestId;
            this.loading = true; this.error = false; this.items = [];
            const ids = filterAchievementLeapIds(this.normalizedPlan.schema, this.metadata);
            try {
                const [records, difficultyById, metrics, tags] = await Promise.all([
                    fetchAchievementWorkbenchRecordsBatched({ ids, metadata: this.metadata, completedIds: this.completedIds, client: "std", includeHidden: true }),
                    fetchAchievementWorkbenchDifficulty(ids, 500, { client: "std" }).catch(() => ({})),
                    fetchAchievementWorkbenchDifficultyMetrics(ids, { client: "std" }).catch(() => ({})),
                    fetchAchievementWorkbenchTags(ids, { client: "std" }).catch(() => ({})),
                ]);
                if (request !== this.requestId) return;
                const candidates = buildAchievementLeapCandidates({
                    metadata: this.metadata, menus: this.menus, completedIds: [], records, difficultyById,
                    allowedIds: ids, includeZeroPoints: true,
                });
                const byId = new Map(candidates.map((item) => [item.id, item]));
                const completed = new Set(this.completedIds.map(String));
                const ordered = ids.map((id) => byId.get(id)).filter(Boolean)
                    .map((item) => ({ ...item, completed: completed.has(item.id) }));
                const mapNames = new Map(this.maps.map((map) => [String(map.id), map.name]));
                this.items = applyAchievementWorkbenchEnrichment(ordered, { difficultyById: metrics, tagsById: tags })
                    .map((item) => ({ ...item, map: {
                        ...item.map, name: item.map?.name || mapNames.get(String(item.map?.id)) || null,
                    } }));
            } catch (error) {
                if (request === this.requestId) this.error = true;
            } finally {
                if (request === this.requestId) this.loading = false;
            }
        },
    },
};
</script>

<template>
    <div class="m-consultation-plan" v-loading="loading">
        <div v-if="error" role="alert">
            <el-alert :title="$t('pages.wiki.leap.ui.workbench.planDetailLoadFailed')" type="error" :closable="false" />
            <el-button @click="load">{{ $t('achievementRecommendation.retry') }}</el-button>
        </div>
        <template v-else-if="!loading">
            <AchievementLeapSummary :route="route" />
            <AchievementLeapRouteTable :items="route.items" :dimensions="dimensions" :maps="maps" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.m-consultation-plan { display: grid; gap: 16px; min-height: 180px; min-width: 0; }
</style>
