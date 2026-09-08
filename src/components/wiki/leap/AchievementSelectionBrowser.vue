<script>
import { Search, Loading } from "@element-plus/icons-vue";
import AchievementRecommendationItems from "./AchievementRecommendationItems.vue";
import responsivePagination from "@/mixins/responsive-pagination";
import {
    achievementRecommendationFilterOptions,
    filterAchievementRecommendationItems,
} from "@/utils/achievementRecommendation";

export default {
    name: "AchievementSelectionBrowser",
    components: { Search, Loading, AchievementRecommendationItems },
    mixins: [responsivePagination],
    props: {
        index: { type: Array, default: () => [] },
        records: { type: Array, default: () => [] },
        filters: { type: Object, required: true },
        maps: { type: Array, default: () => [] },
        dimensions: { type: Array, default: () => [] },
        selectedIds: { type: Array, default: () => [] },
        loading: { type: Boolean, default: false },
        error: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
    },
    emits: ["update:filters", "visible-ids", "retry", "add"],
    data() {
        return { page: 1, pageSize: 15 };
    },
    computed: {
        filterOptions() {
            return achievementRecommendationFilterOptions(this.index, this.maps);
        },
        matching() {
            return filterAchievementRecommendationItems(this.index, this.filters);
        },
        currentPage() {
            return Math.min(this.page, Math.max(1, Math.ceil(this.matching.length / this.pageSize)));
        },
        pageIds() {
            return this.matching
                .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
                .map((item) => String(item.id));
        },
        visibleRecords() {
            const records = new Map(this.records.map((record) => [String(record.id), record]));
            return this.pageIds.map((id) => records.get(id)).filter(Boolean);
        },
        selectedIdSet() {
            return new Set(this.selectedIds.map(String));
        },
        unavailableIds() {
            return new Set(this.visibleRecords.filter((record) => !Number.isFinite(record.points) || record.points < 0)
                .map((record) => record.id));
        },
    },
    watch: {
        filters: {
            deep: true,
            handler() {
                this.page = 1;
                this.scrollToList();
            },
        },
        pageIds: {
            immediate: true,
            handler(ids) {
                this.$emit("visible-ids", ids);
            },
        },
    },
    methods: {
        updateFilter(key, value) {
            this.$emit("update:filters", { ...this.filters, [key]: value });
        },
        changePage(page) {
            this.page = page;
            this.scrollToList();
        },
        scrollToList() {
            this.$nextTick(() => {
                if (this.$refs.list) this.$refs.list.scrollTop = 0;
            });
        },
        canAdd(record) {
            return !this.disabled && !this.selectedIdSet.has(String(record.id)) && Number.isFinite(record.points) && record.points >= 0;
        },
        add(record) {
            if (this.canAdd(record)) this.$emit("add", record);
        },
    },
};
</script>

<template>
    <div class="m-achievement-selection-browser">
        <div class="m-candidates-filters">
            <el-cascader :model-value="filters.categories" :options="filterOptions.categories"
                :props="{ multiple: true, checkStrictly: true }" popper-class="m-leap-recommendation-category-popper"
                clearable filterable collapse-tags :placeholder="$t('achievementRecommendation.filterCategories')"
                @update:model-value="updateFilter('categories', $event)" />
            <el-select :model-value="filters.mapIds" multiple clearable filterable collapse-tags
                :placeholder="$t('achievementRecommendation.filterMaps')"
                @update:model-value="updateFilter('mapIds', $event)">
                <el-option v-for="map in filterOptions.maps" :key="map.id" :value="map.id" :label="map.name" />
            </el-select>
            <el-input :model-value="filters.keyword" clearable :placeholder="$t('achievementRecommendation.searchAchievements')"
                @update:model-value="updateFilter('keyword', $event)">
                <template #prefix><Search /></template>
            </el-input>
        </div>
        <div ref="list" class="m-selection-browser-content" :aria-busy="loading">
            <slot name="status" />
            <div v-if="loading" class="m-candidates-loading" :aria-label="$t('achievementRecommendation.loadingAchievements')" :class="{ 'is-empty': !visibleRecords.length }" role="status">
                <el-icon class="is-loading" aria-hidden="true"><Loading /></el-icon>
            </div>
            <AchievementRecommendationItems v-if="visibleRecords.length" :items="visibleRecords" :dimensions="dimensions"
                :selected-ids="selectedIdSet" :editable="false" candidate-mode table-layout :removable="false"
                :order-offset="(currentPage - 1) * pageSize" :disabled="disabled" :unavailable-ids="unavailableIds" @add="add" />
            <div v-if="!loading && error" class="m-candidates-error" role="alert">
                <span>{{ $t('achievementRecommendation.detailsFailed') }}</span>
                <el-button :disabled="disabled" @click="$emit('retry')">{{ $t('achievementRecommendation.retry') }}</el-button>
            </div>
            <p v-else-if="!loading && !visibleRecords.length" class="m-candidates-empty" role="status">
                {{ $t('achievementRecommendation.noFilterResults') }}
            </p>
        </div>
        <el-pagination v-if="matching.length > pageSize" class="m-selection-browser-pagination" background
            :layout="isPaginationPhoneViewport ? 'prev, slot, next' : 'prev, pager, next'" :pager-count="responsivePagerCount"
            :current-page="currentPage" :page-size="pageSize" :total="matching.length" @current-change="changePage">
            <span class="u-achievement-pagination-status" aria-live="polite">
                {{ currentPage }} / {{ Math.max(1, Math.ceil(matching.length / pageSize)) }}
            </span>
        </el-pagination>
    </div>
</template>

<style lang="less" scoped>
.m-achievement-selection-browser {
    display: flex; flex-direction: column; flex: 1 1 auto; min-width: 0; min-height: 0;
    .m-candidates-filters { flex: none; }
}
.m-selection-browser-content { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.m-selection-browser-pagination {
    display: flex; justify-content: center; flex: none; padding-top: 16px;
    @media (max-width: @phone) {
        :deep(.btn-prev), :deep(.btn-next) { min-width: 36px; width: 36px; height: 36px; }
    }
}
</style>
