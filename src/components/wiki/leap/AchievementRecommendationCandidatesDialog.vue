<script>
import { Search, Loading } from "@element-plus/icons-vue";
import AchievementRecommendationItems from "./AchievementRecommendationItems.vue";

export default {
    name: "AchievementRecommendationCandidatesDialog",
    components: { Search, Loading, AchievementRecommendationItems },
    props: {
        modelValue: { type: Boolean, default: false },
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
        loadingMessage() {
            if (this.filterIndexLoading) return this.$t("achievementRecommendation.loadingAchievements");
            if (this.waitingForIndex) return "";
            if (this.detailState.loading) return this.matchingCount
                ? this.$t("achievementRecommendation.loadingDetails", { count: this.items.length, total: this.matchingCount })
                : this.$t("achievementRecommendation.loadingAchievements");
            if (this.difficultyState.loading) return this.$t("achievementRecommendation.loadingDifficulty");
            if (this.tagState.loading) return this.$t("achievementRecommendation.loadingTags");
            return "";
        },
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
    <el-dialog draggable :model-value="modelValue" class="m-recommendation-candidates-dialog" width="1100px" top="6vh"
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
        <div v-if="loadingMessage" class="m-candidates-loading" :aria-label="$t('achievementRecommendation.loadingAchievements')" :class="{ 'is-empty': waitingForIndex || !items.length }" role="status">
            <el-icon class="is-loading" aria-hidden="true"><Loading /></el-icon>

        </div>
        <div v-if="!filterIndexLoading && filterIndexError" class="m-candidates-error" role="alert">
            <span>{{ $t('achievementRecommendation.filterIndexFailed') }}</span>
            <el-button text :disabled="disabled" @click="$emit('load-index')">{{ $t('achievementRecommendation.retry') }}</el-button>
        </div>
        <template v-if="!waitingForIndex">
            <div v-if="!difficultyState.loading && difficultyState.error" class="m-candidates-error" role="alert">
                <span>{{ $t('achievementRecommendation.difficultyFailed') }}</span>
                <el-button text :disabled="disabled" @click="$emit('retry-difficulty')">{{ $t('achievementRecommendation.retryDifficulty') }}</el-button>
            </div>
            <div v-if="!tagState.loading && tagState.error" class="m-candidates-error" role="alert">
                <span>{{ $t('achievementRecommendation.tagsFailed') }}</span>
                <el-button text :disabled="disabled" @click="$emit('retry-tags')">{{ $t('achievementRecommendation.retry') }}</el-button>
            </div>
            <AchievementRecommendationItems v-if="items.length" :items="items" :dimensions="dimensions" :selected-ids="emptySelection"
                :editable="false" candidate-mode table-layout :disabled="disabled" :unavailable-ids="unavailableIds" @add="add" @remove="remove" />
            <div v-if="!detailState.loading && detailState.error" class="m-candidates-error" role="alert">
                <span>{{ $t('achievementRecommendation.detailsFailed') }}</span>
                <el-button :disabled="disabled" @click="$emit('retry-details')">{{ $t('achievementRecommendation.retry') }}</el-button>
            </div>
            <p v-else-if="!loadingMessage && !items.length" class="m-candidates-empty" role="status">
                {{ $t(total ? 'achievementRecommendation.noFilterResults' : 'achievementRecommendation.noCandidates') }}
            </p>
        </template>
    </el-dialog>
</template>

<style lang="less" src="@/assets/css/modules/achievement-selection-dialog.less"></style>
