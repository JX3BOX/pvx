<script>
import { Search } from "@element-plus/icons-vue";
import AchievementRecommendationItems from "./AchievementRecommendationItems.vue";

export default {
    name: "AchievementRecommendationCandidatesDialog",
    components: { Search, AchievementRecommendationItems },
    props: {
        modelValue: { type: Boolean, default: false },
        notice: { type: String, default: "" },
        filters: { type: Object, required: true },
        items: { type: Array, required: true },
        total: { type: Number, required: true },
        matchingCount: { type: Number, required: true },
        dimensions: { type: Array, default: () => [] },
        disabled: { type: Boolean, default: false },
        metadata: { type: Object, required: true },
        filterOptions: { type: Object, required: true },
        filterIndexLoading: { type: Boolean, default: false },
        filterIndexError: { type: Boolean, default: false },
        waitingForIndex: { type: Boolean, default: false },
        detailState: { type: Object, default: () => ({}) },
        difficultyState: { type: Object, default: () => ({}) },
        tagState: { type: Object, default: () => ({}) },
    },
    emits: ["update:modelValue", "update:filters", "load-index", "retry-details", "retry-difficulty", "retry-tags", "add", "remove"],
    data() { return { emptySelection: new Set() }; },
    computed: {
        unavailableIds() {
            return new Set(this.items.filter((item) => {
                const point = this.metadata[item.id]?.point;
                return !Number.isFinite(point) || point < 0;
            }).map((item) => item.id));
        },
    },
    methods: {
        updateFilter(key, value) { this.$emit("update:filters", { ...this.filters, [key]: value }); },
        add(item) {
            if (this.disabled || this.unavailableIds.has(item.id)) return;
            this.$emit("add", item);
        },
        remove(item) {
            if (this.disabled) return;
            this.$emit("remove", item);
        },
    },
};
</script>

<template>
    <el-dialog :model-value="modelValue" class="m-recommendation-candidates-dialog" width="1100px" top="6vh"
        append-to-body destroy-on-close :close-on-click-modal="false"
        :title="$t('achievementRecommendation.candidatesTitle', { count: total.toLocaleString($i18n.locale) })"
        @update:model-value="$emit('update:modelValue', $event)">
        <p class="m-candidates-hint">{{ $t('achievementRecommendation.candidatesHint') }}</p>
        <div class="m-candidates-filters">
            <el-cascader :model-value="filters.categories" :options="filterOptions.categories" :props="{ multiple: true, checkStrictly: true }"
                popper-class="m-leap-recommendation-category-popper" clearable filterable collapse-tags
                :placeholder="$t('achievementRecommendation.filterCategories')"
                @update:model-value="updateFilter('categories', $event)" @visible-change="$event && $emit('load-index')" />
            <el-select :model-value="filters.mapIds" multiple clearable filterable collapse-tags :loading="filterIndexLoading"
                :placeholder="$t('achievementRecommendation.filterMaps')"
                @update:model-value="updateFilter('mapIds', $event)" @visible-change="$event && $emit('load-index')">
                <el-option v-for="map in filterOptions.maps" :key="map.id" :value="map.id" :label="map.name" />
            </el-select>
            <el-input :model-value="filters.keyword" clearable :placeholder="$t('achievementRecommendation.filterCandidates')"
                @update:model-value="updateFilter('keyword', $event)" @focus="$emit('load-index')">
                <template #prefix><Search /></template>
            </el-input>
        </div>
        <div class="m-candidates-status">
            <span role="status">{{ notice }}</span>
            <span>{{ $t('achievementRecommendation.visibleCount', { count: items.length }) }}</span>
        </div>
        <p v-if="filterIndexLoading" role="status">{{ $t('achievementRecommendation.loadingFilterIndex') }}</p>
        <div v-else-if="filterIndexError" class="m-candidates-error" role="alert">
            <span>{{ $t('achievementRecommendation.filterIndexFailed') }}</span>
            <el-button text :disabled="disabled" @click="$emit('load-index')">{{ $t('achievementRecommendation.retry') }}</el-button>
        </div>
        <template v-if="!waitingForIndex">
            <p v-if="difficultyState.loading" role="status">{{ $t('achievementRecommendation.loadingDifficulty') }}</p>
            <div v-else-if="difficultyState.error" class="m-candidates-error" role="alert">
                <span>{{ $t('achievementRecommendation.difficultyFailed') }}</span>
                <el-button text :disabled="disabled" @click="$emit('retry-difficulty')">{{ $t('achievementRecommendation.retryDifficulty') }}</el-button>
            </div>
            <p v-if="tagState.loading" role="status">{{ $t('achievementRecommendation.loadingTags') }}</p>
            <div v-else-if="tagState.error" class="m-candidates-error" role="alert">
                <span>{{ $t('achievementRecommendation.tagsFailed') }}</span>
                <el-button text :disabled="disabled" @click="$emit('retry-tags')">{{ $t('achievementRecommendation.retry') }}</el-button>
            </div>
            <AchievementRecommendationItems v-if="items.length" :items="items" :dimensions="dimensions" :selected-ids="emptySelection"
                :editable="false" candidate-mode :disabled="disabled" :unavailable-ids="unavailableIds" @add="add" @remove="remove" />
            <p v-if="detailState.loading" role="status">{{ $t('achievementRecommendation.loadingDetails', { count: items.length, total: matchingCount }) }}</p>
            <div v-else-if="detailState.error" class="m-candidates-error" role="alert">
                <span>{{ $t('achievementRecommendation.detailsFailed') }}</span>
                <el-button :disabled="disabled" @click="$emit('retry-details')">{{ $t('achievementRecommendation.retry') }}</el-button>
            </div>
            <p v-else-if="!items.length" class="m-candidates-empty" role="status">
                {{ $t(total ? 'achievementRecommendation.noFilterResults' : 'achievementRecommendation.noCandidates') }}
            </p>
        </template>
        <template #footer>
            <el-button @click="$emit('update:modelValue', false)">{{ $t('achievementRecommendation.closeCandidates') }}</el-button>
        </template>
    </el-dialog>
</template>

<style lang="less">
.m-recommendation-candidates-dialog,
.m-recommendation-action-dialog {
    --el-color-primary: #47777d;
    --el-color-primary-light-3: #75989c;
    --el-color-primary-light-5: #a3bbbe;
    --el-color-primary-light-7: #c8d6d8;
    --el-color-primary-light-8: #dae4e5;
    --el-color-primary-light-9: #edf2f2;
    --el-color-primary-dark-2: #365f64;
}
.m-recommendation-candidates-dialog {
    display: flex; flex-direction: column; box-sizing: border-box;
    max-width: calc(100vw - 32px); max-height: 88vh; max-height: 88dvh;
    .el-dialog__header, .el-dialog__footer { flex: none; }
    .el-dialog__title { overflow-wrap: anywhere; }
    .el-dialog__body { min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
    .m-candidates-hint { margin: 0 0 14px; line-height: 1.6; color: #697374; }
    .m-candidates-filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;
        > * { width: 100%; min-width: 0; } svg { width: 16px; height: 16px; }
    }
    .m-candidates-status { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
        min-height: 36px; font-size: 12px; color: #47777d;
        > :last-child { color: #697374; margin-left: auto; }
    }
    .m-candidates-error { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: #ae3b40; }
    .m-candidates-empty { padding: 48px 12px; text-align: center; color: #697374; }
    @media (max-width: @phone) {
        margin-top: 16px; max-height: calc(100vh - 32px); max-height: calc(100dvh - 32px);
        .m-candidates-filters { grid-template-columns: minmax(0, 1fr); }
        .el-button { min-height: 40px; }
    }
}
</style>
