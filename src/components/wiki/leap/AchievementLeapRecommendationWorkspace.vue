<script>
import { RefreshLeft, ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import AchievementLeapRecommendation from "./AchievementLeapRecommendation.vue";
import AchievementRecommendationCategories from "./AchievementRecommendationCategories.vue";
import {
    defaultAchievementRecommendationOptions,
    achievementRecommendationDirections,
    achievementRecommendationDirectionWeight,
} from "@/utils/achievementRecommendation";

export default {
    name: "AchievementLeapRecommendationWorkspace",
    components: { RefreshLeft, ArrowDown, ArrowUp, AchievementLeapRecommendation, AchievementRecommendationCategories },
    props: {
        options: { type: Object, required: true },
        dimensions: { type: Array, default: () => [] },
        categories: { type: Array, default: () => [] },
        categoryCountsReady: { type: Boolean, default: false },
        recommendation: { type: Object, default: null },
        roles: { type: Array, default: () => [] },
        roleId: { type: String, default: "" },
        roleLoading: { type: Boolean, default: false },
        targetPoints: { type: Number, required: true },
        planTitle: { type: String, default: "" },
        loading: { type: Boolean, default: false },
        saving: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        roleAvailable: { type: Boolean, default: false },
        client: { type: String, default: "std" },
        error: { type: String, default: "" },
        metadata: { type: Object, default: () => ({}) },
        completedIds: { type: Array, default: () => [] },
        schoolEligibility: { type: Object, default: null },
        maps: { type: Array, default: () => [] },
        menus: { type: Object, default: () => ({}) },
    },
    emits: ["update:options", "role-change", "update:targetPoints", "update:planTitle", "refresh", "apply"],
    data() {
        return { selection: null, settingsExpanded: true, expandedPreferences: ["categories"], hasRequested: false };
    },
    computed: {
        visibleDimensions() {
            return this.dimensions.filter((dimension) => dimension.visible);
        },
        directionOptions() {
            return achievementRecommendationDirections(this.options.categoryIds, this.categories);
        },
        directionPreferenceOptions() {
            return ["less", "automatic", "prefer"].map((key, index) => ({
                value: [1.3, 1, 0.7][index], label: this.$t(`achievementRecommendation.${key}`),
            }));
        },
        controlsDisabled() {
            return this.disabled || this.roleLoading || this.client !== "std";
        },
        canRequest() {
            return !this.controlsDisabled && this.roleAvailable && !this.loading;
        },
        canApply() {
            return this.canRequest && this.selection?.ready && this.selection.recommendation === this.recommendation &&
                Boolean(this.selection.items.length) && Boolean(this.planTitle.trim()) &&
                this.targetPoints > this.recommendation.role.current_points;
        },
    },
    watch: {
        recommendation: { immediate: true, handler(value) { if (value) this.hasRequested = true; } },
        loading(value) { if (value) this.hasRequested = true; },
        roleId() { this.hasRequested = false; this.selection = null; },
    },
    methods: {
        requestRecommendation() {
            if (!this.canRequest) return;
            this.hasRequested = true;
            this.settingsExpanded = false;
            this.$emit("refresh");
        },
        dimensionWeight(dimension) {
            return Object.prototype.hasOwnProperty.call(this.options.dimensionWeights, dimension.apiKey)
                ? this.options.dimensionWeights[dimension.apiKey] : 1;
        },
        dimensionPreferenceOptions(dimension) {
            const known = ["money", "time", "luck", "costEffectiveness", "overall"].includes(dimension.key);
            // Cost-saving copy assumes lower cost is preferred; custom directions use neutral copy.
            const reversedCost = dimension.key !== "costEffectiveness" && dimension.recommendationDirection === "higher";
            const key = known && !reversedCost ? dimension.key : "generic";
            return ["care", "normal", "ignore"].map((level, index) => ({
                value: 2 - index,
                label: this.$t(`achievementRecommendation.dimensionPreferences.${key}.${level}`),
            }));
        },
        updateDimensionPreference(dimension, value) {
            if (this.controlsDisabled) return;
            this.updateEntry("dimensionWeights", dimension.apiKey, value === 1 ? undefined : value);
        },
        updateCategories(categoryIds) {
            if (this.controlsDisabled) return;
            const directions = new Set(achievementRecommendationDirections(categoryIds, this.categories));
            const directionWeights = Object.fromEntries(Object.entries(this.options.directionWeights)
                .filter(([direction, weight]) => directions.has(direction) && [1.3, 0.7].includes(weight)));
            this.updateOptions({ categoryIds, directionWeights });
        },
        directionWeight(direction) {
            return achievementRecommendationDirectionWeight(this.options.directionWeights[direction]);
        },
        updateDirection(direction, weight) {
            if (this.controlsDisabled || !this.directionOptions.includes(direction) || ![1.3, 1, 0.7].includes(weight)) return;
            this.updateEntry("directionWeights", direction, weight === 1 ? undefined : weight);
        },
        updateOptions(patch) {
            this.$emit("update:options", { ...this.options, ...patch });
        },
        updateEntry(field, key, value) {
            const entries = { ...this.options[field] };
            if (value === undefined) delete entries[key];
            else entries[key] = value;
            this.updateOptions({ [field]: entries });
        },
        async reset() {
            if (this.controlsDisabled || this.loading) return;
            const hadRecommendation = Boolean(this.recommendation);
            this.$emit("update:options", defaultAchievementRecommendationOptions());
            if (!hadRecommendation) return;
            await this.$nextTick();
            this.requestRecommendation();
        },
    },
};
</script>

<template>
    <div class="m-leap-recommendation-workspace">
        <header class="m-recommendation-page-heading">
            <h2>{{ $t('achievementRecommendation.title') }}</h2>
            <slot name="actions" />
        </header>
        <button type="button" class="m-recommendation-settings-toggle" :aria-expanded="settingsExpanded"
            aria-controls="recommendation-settings" @click="settingsExpanded = !settingsExpanded">
            <span>{{ $t('achievementRecommendation.preferences') }}</span>
            <el-icon><ArrowUp v-if="settingsExpanded" /><ArrowDown v-else /></el-icon>
        </button>
        <div class="m-recommendation-workspace" :class="{ 'is-settings-collapsed': !settingsExpanded }">
            <section id="recommendation-settings" class="m-recommendation-settings">
                <el-form label-position="top" :disabled="controlsDisabled">
                    <div class="m-recommendation-settings__heading">
                        <h3>{{ $t('achievementRecommendation.preferences') }}</h3>
                        <el-tooltip :content="$t('achievementRecommendation.resetHint')">
                            <el-button :disabled="controlsDisabled || loading" @click="reset">
                                <el-icon><RefreshLeft /></el-icon>
                                <span>
                                {{ $t('achievementRecommendation.reset') }}
                                </span>
                            </el-button>
                        </el-tooltip>
                    </div>
                    <div class="m-recommendation-base-fields">
                        <el-form-item :label="$t('achievementRecommendation.planTitle')">
                            <el-input :model-value="planTitle" maxlength="40" @update:model-value="$emit('update:planTitle', $event)" />
                        </el-form-item>
                        <el-form-item :label="$t('achievementRecommendation.targetPoints')">
                            <el-input-number
                                :model-value="targetPoints" :min="1" :step="1000" :precision="0" controls-position="right"
                                @update:model-value="$emit('update:targetPoints', $event)"
                            />
                        </el-form-item>
                        <el-form-item :label="$t('achievementRecommendation.chooseRole')">
                            <el-select :model-value="roleId" filterable :loading="roleLoading" :placeholder="$t('achievementRecommendation.chooseRole')"
                                @update:model-value="$emit('role-change', $event)">
                                <el-option v-for="role in roles" :key="role.id" :value="role.id" :label="[role.name, role.server].filter(Boolean).join(' · ')" />
                            </el-select>
                        </el-form-item>
                    </div>
                    <el-collapse v-model="expandedPreferences" class="m-recommendation-preferences">
                        <el-collapse-item name="categories" :title="$t('achievementRecommendation.categories')">
                            <template #title>
                                <span class="m-recommendation-category-heading">
                                    <strong>{{ $t('achievementRecommendation.categories') }}</strong>
                                </span>
                            </template>
                            <AchievementRecommendationCategories :model-value="options.categoryIds" :categories="categories"
                                :disabled="controlsDisabled" :counts-ready="categoryCountsReady"
                                @update:model-value="updateCategories" />
                        </el-collapse-item>
                        <el-collapse-item name="dimensions" :title="$t('achievementRecommendation.dimensions')">
                            <div class="m-recommendation-preference-grid">
                                <div v-for="dimension in visibleDimensions" :key="dimension.apiKey" class="m-recommendation-dimension-preference">
                                    <span :title="dimension.description || dimension.label">{{ dimension.label }}</span>
                                    <el-radio-group :model-value="dimensionWeight(dimension)" :aria-label="dimension.label"
                                        :disabled="controlsDisabled" class="m-recommendation-dimension-options"
                                        @update:model-value="updateDimensionPreference(dimension, $event)">
                                        <el-radio-button v-for="option in dimensionPreferenceOptions(dimension)" :key="option.value" :value="option.value">
                                            {{ option.label }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </div>
                            </div>
                        </el-collapse-item>
                        <el-collapse-item v-if="directionOptions.length" name="directions" :title="$t('achievementRecommendation.directionPreferences')">
                            <div class="m-recommendation-preference-grid">
                                <div v-for="direction in directionOptions" :key="direction" class="m-recommendation-dimension-preference">
                                    <span>{{ $t(`achievementRecommendation.directions.${direction}`) }}</span>
                                    <el-radio-group :model-value="directionWeight(direction)" :aria-label="$t(`achievementRecommendation.directions.${direction}`)"
                                        :disabled="controlsDisabled" class="m-recommendation-dimension-options"
                                        @update:model-value="updateDirection(direction, $event)">
                                        <el-radio-button v-for="option in directionPreferenceOptions" :key="option.value" :value="option.value">
                                            {{ option.label }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </el-form>
            </section>
            <section class="m-recommendation-preview">
                <AchievementLeapRecommendation
                    :recommendation="recommendation" :loading="loading" :disabled="disabled"
                    :role-available="roleAvailable" :client="client" :error="error" :metadata="metadata" :maps="maps"
                    :menus="menus" :target-points="targetPoints"
                    :completed-ids="completedIds" :school-eligibility="schoolEligibility"
                    :dimensions="visibleDimensions" :has-requested="hasRequested" :can-request="canRequest"
                    @refresh="requestRecommendation"
                    @selection-change="selection = $event"
                />
            </section>
        </div>
        <div v-if="recommendation" class="m-recommendation-actions">
            <el-button type="primary" :disabled="!canApply" :loading="saving" @click="$emit('apply', selection)">
                {{ $t('achievementRecommendation.apply') }}
            </el-button>
        </div>
    </div>
</template>

<style lang="less">
.m-leap-recommendation-workspace {
    --el-color-primary: #47777d;
    --el-color-primary-light-3: #75989c;
    --el-color-primary-light-5: #a3bbbe;
    --el-color-primary-light-7: #c8d6d8;
    --el-color-primary-light-8: #dae4e5;
    --el-color-primary-light-9: #edf2f2;
    --el-color-primary-dark-2: #365f64;
    min-width: 0;
    color: #314043;
    h3 { margin: 0; font-size: 15px; line-height: 1.5; }
    .el-input-number, .el-select { width: 100%; }
    .el-form-item { min-width: 0; margin: 0; }
    .el-form-item__label { font-size: 12px; color: #697374; }
}
.m-recommendation-page-heading {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    margin-bottom: 16px;
    h2 { margin: 0; font-size: 20px; line-height: 1.5; }
}
.m-recommendation-workspace { display: grid; min-width: 0; gap: 16px; }
.m-recommendation-settings, .m-recommendation-preview {
    min-width: 0; padding: 20px; border: 1px solid #e2e8e6; border-radius: 12px; background: #fffdf9;
}
.m-recommendation-preview { background: #fff; }
.m-recommendation-settings__heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.m-recommendation-base-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 16px 0; }
.m-recommendation-preference-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0 24px; }
.m-recommendation-settings-toggle { display: none; }
.m-recommendation-actions {
    position: sticky; bottom: 0; z-index: 6;
    display: flex; justify-content: flex-end; padding: 12px 20px; margin-top: 12px;
    border: 1px solid #e2e8e6; border-radius: 10px; background: #fffdf9;
    .el-button { margin: 0; max-width: 100%; height: auto; min-height: 40px; }
    .el-button > span { white-space: normal; }
}
.m-leap-recommendation-workspace {
    .m-recommendation-dimension-preference {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 0;
        font-size: 12px;
        > span { color: #314043; overflow-wrap: anywhere; }
    }
    .m-recommendation-dimension-options {
        --el-radio-button-checked-bg-color: #47777d;
        --el-radio-button-checked-text-color: #fff;
        --el-radio-button-checked-border-color: #47777d;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 4px;
        width: 100%;
        .el-radio-button { display: flex; min-width: 0; }
        .el-radio-button__inner {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-height: 40px;
            padding: 8px 4px;
            box-sizing: border-box;
            border: 1px solid #dce5e2;
            border-radius: 6px;
            box-shadow: none;
            outline: none;
            font-size: 12px;
            line-height: 1.5;
            white-space: normal;
            overflow-wrap: anywhere;
            color: #586669;
            background: #fff;
            transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
        }
        .el-radio-button.is-active .el-radio-button__original-radio:not(:disabled) + .el-radio-button__inner {
            border-color: #47777d;
            background: #47777d;
            color: #fff;
            box-shadow: none;
        }
        .el-radio-button.is-disabled .el-radio-button__inner { opacity: 0.6; }
        .el-radio-button__original-radio:focus-visible + .el-radio-button__inner {
            outline: 2px solid #75989c;
            outline-offset: 2px;
        }
        @media (hover: hover) {
            .el-radio-button__original-radio:not(:disabled) + .el-radio-button__inner:hover {
                border-color: #a3bbbe;
                background: #edf2f2;
                color: #365f64;
            }
            .el-radio-button.is-active .el-radio-button__original-radio:not(:disabled) + .el-radio-button__inner:hover {
                border-color: #365f64;
                background: #365f64;
                color: #fff;
            }
        }
        @media (prefers-reduced-motion: reduce) {
            .el-radio-button__inner { transition: none; }
        }
    }
}
.m-recommendation-category-heading {
    display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 12px; padding: 8px 0; line-height: 1.5;
    strong { font-size: 16px; color: #314043; }
}
.m-recommendation-preferences { --el-collapse-header-bg-color: transparent; --el-collapse-content-bg-color: transparent;
    .el-collapse-item__header { font-size: 14px; color: #314043; }
    .el-collapse-item__content { padding-bottom: 8px; }
}

@media (max-width: @phone) {
    .m-leap-recommendation-workspace {
        .m-recommendation-page-heading { gap: 8px; padding-left: 16px; h2 { font-size: 18px; } }
        .m-recommendation-settings-toggle {
            display: flex; width: 100%; align-items: center; justify-content: space-between;
            padding: 12px; margin-bottom: 10px; border: 1px solid #dce5e2; border-radius: 8px;
            background: #fffdf9; color: #314043; font: inherit; cursor: pointer;
        }
        .is-settings-collapsed .m-recommendation-settings { display: none; }
        .m-recommendation-base-fields { grid-template-columns: minmax(0, 1fr); gap: 12px; }
        .m-recommendation-preference-grid { grid-template-columns: minmax(0, 1fr); }
        .m-recommendation-settings, .m-recommendation-preview { padding: 12px; }
        .m-recommendation-settings__heading { flex-wrap: wrap; gap: 8px; }
        .el-input__wrapper, .el-select__wrapper { min-height: 40px; box-sizing: border-box; }
        .el-form-item__label { height: auto; line-height: 1.5; overflow-wrap: anywhere; }
        .m-recommendation-actions { padding: 10px; .el-button { width: 100%; min-height: 44px; } }
        .m-recommendation-preferences .el-collapse-item__header { min-height: 44px; height: auto; line-height: 1.5; }
    }
}
</style>
