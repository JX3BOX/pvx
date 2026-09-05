<script>
import AchievementProgressList from "@/components/wiki/progress/AchievementProgressList.vue";
import { fetchAchievementWorkbenchRecordsBatched, fetchAchievementWorkbenchDifficultyMetrics } from "@/service/achievementWorkbench";
import { applyAchievementWorkbenchEnrichment } from "@/utils/achievementWorkbench";
import { enrichAchievementRecommendationRecords, filterAchievementRecommendationItems, achievementRecommendationFilterOptions } from "@/utils/achievementRecommendation";

export default {
    name: "ConsultationAchievements",
    components: { AchievementProgressList },
    props: {
        ids: { type: Array, required: true }, completedIds: { type: Array, required: true },
        metadata: { type: Object, required: true }, menus: { type: Object, required: true },
        maps: { type: Array, required: true }, dimensions: { type: Array, required: true }, title: { type: String, required: true },
    },
    data: () => ({ index: [], cache: {}, records: [], page: 1, loading: false, error: false, indexReady: false,
        contextId: 0, requestId: 0, filters: { keyword: "", categories: [], mapIds: [] } }),
    computed: {
        options() { return achievementRecommendationFilterOptions(this.index, this.maps); },
        matching() { return filterAchievementRecommendationItems(this.index, this.filters); },
        pageIds() { return this.matching.slice((this.page - 1) * 30, this.page * 30).map((item) => item.id); },
    },
    watch: {
        ids: { immediate: true, handler() { this.initialize(); } },
        pageIds() { if (this.indexReady) this.loadPage(); },
        filters: { deep: true, handler() { this.page = 1; } },
    },
    beforeUnmount() { this.contextId += 1; this.requestId += 1; },
    methods: {
        async initialize() {
            const context = ++this.contextId;
            this.requestId += 1; this.cache = {}; this.records = []; this.index = []; this.indexReady = false;
            this.page = 1; this.loading = true; this.error = false;
            try {
                const records = [];
                for (let start = 0; start < this.ids.length; start += 1000) {
                    const batch = await fetchAchievementWorkbenchRecordsBatched({ ids: this.ids.slice(start, start + 1000),
                        client: "std", includeHidden: true, attributes: "ID,Name,Sub,Detail,SceneID,dwMapID" }, 1000);
                    if (context !== this.contextId) return;
                    records.push(...batch);
                }
                const byId = new Map(enrichAchievementRecommendationRecords(records, this.menus, this.maps).map((item) => [item.id, item]));
                this.index = this.ids.map(String).map((id) => byId.get(id)).filter(Boolean);
                await this.$nextTick();
                if (context !== this.contextId) return;
                this.indexReady = true;
                await this.loadPage();
            } catch (error) { if (context === this.contextId) this.error = true; }
            finally { if (context === this.contextId) this.loading = false; }
        },
        async loadPage() {
            const request = ++this.requestId;
            const ids = this.pageIds;
            this.loading = true; this.error = false; this.records = [];
            try {
                const missing = ids.filter((id) => !this.cache[id]);
                if (missing.length) {
                    const [records, difficultyById] = await Promise.all([
                        fetchAchievementWorkbenchRecordsBatched({ ids: missing, metadata: this.metadata, completedIds: this.completedIds, client: "std", includeHidden: true }),
                        fetchAchievementWorkbenchDifficultyMetrics(missing, { client: "std" }),
                    ]);
                    if (request !== this.requestId) return;
                    enrichAchievementRecommendationRecords(applyAchievementWorkbenchEnrichment(records, { difficultyById }), this.menus, this.maps)
                        .forEach((item) => { this.cache[item.id] = item; });
                }
                if (request === this.requestId) this.records = ids.map((id) => this.cache[id]).filter(Boolean);
            } catch (error) { if (request === this.requestId) this.error = true; }
            finally { if (request === this.requestId) this.loading = false; }
        },
    },
};
</script>

<template>
    <AchievementProgressList :title="title" :records="records" :dimensions="dimensions" :total="matching.length" :page="page"
        :page-size="30" :loading="loading" :error="error" @page-change="page = $event" @retry="indexReady ? loadPage() : initialize()">
        <template #filters>
            <div class="m-consultation-achievement-filters">
                <el-input v-model="filters.keyword" clearable :placeholder="$t('achievementConsultation.searchAchievements')" />
                <el-cascader v-model="filters.categories" :options="options.categories" :props="{ multiple: true, checkStrictly: true }"
                    clearable collapse-tags :placeholder="$t('achievementRecommendation.filterCategories')" />
                <el-select v-model="filters.mapIds" multiple clearable filterable collapse-tags :placeholder="$t('achievementRecommendation.filterMaps')">
                    <el-option v-for="map in options.maps" :key="map.id" :value="map.id" :label="map.name" />
                </el-select>
            </div>
        </template>
    </AchievementProgressList>
</template>

<style lang="less" scoped>
.m-consultation-achievement-filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; padding: 12px;
    > * { min-width: 0; width: 100%; }
    @media (max-width: 760px) { grid-template-columns: 1fr; }
}
</style>
