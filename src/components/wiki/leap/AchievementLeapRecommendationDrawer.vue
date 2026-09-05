<script>
import { RefreshLeft } from "@element-plus/icons-vue";
import AchievementLeapRecommendation from "./AchievementLeapRecommendation.vue";
import { defaultAchievementRecommendationOptions } from "@/utils/achievementRecommendation";

export default {
    name: "AchievementLeapRecommendationDrawer",
    components: { AchievementLeapRecommendation, RefreshLeft },
    props: {
        modelValue: { type: Boolean, default: false },
        options: { type: Object, required: true },
        dimensions: { type: Array, default: () => [] },
        categories: { type: Array, default: () => [] },
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
        maps: { type: Array, default: () => [] },
        menus: { type: Object, default: () => ({}) },
    },
    emits: ["update:modelValue", "update:options", "role-change", "update:targetPoints", "update:planTitle", "refresh", "apply"],
    data() {
        return { selection: null, mobileView: "preview", expandedPreferences: [], hasRequested: false };
    },
    computed: {
        visibleDimensions() {
            return this.dimensions.filter((dimension) => dimension.visible);
        },
        directionOptions() {
            return ["dungeon", "quest", "map", "misc", "martial", "cultivation", "equipment", "crafting",
                "reading", "combat", "reputation", "guild", "pvp", "holiday", "activity", "story", "housing", "other"];
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
            this.mobileView = "preview";
            this.$emit("refresh");
        },
        dimensionWeight(dimension) {
            return Object.prototype.hasOwnProperty.call(this.options.dimensionWeights, dimension.apiKey)
                ? this.options.dimensionWeights[dimension.apiKey] : 1;
        },
        directionLevel(direction) {
            return [0, 1.3, undefined, 0.7].indexOf(this.options.directionWeights[direction]);
        },
        directionLabel(level) { return this.$t(`achievementRecommendation.${["exclude", "less", "automatic", "prefer"][level]}`); },
        updateDirection(direction, level) { this.updateEntry("directionWeights", direction, [0, 1.3, undefined, 0.7][level]); },
        updateOptions(patch) {
            this.$emit("update:options", { ...this.options, ...patch });
        },
        updateEntry(field, key, value) {
            const entries = { ...this.options[field] };
            if (value === undefined) delete entries[key];
            else entries[key] = value;
            this.updateOptions({ [field]: entries });
        },
        reset() {
            this.$emit("update:options", defaultAchievementRecommendationOptions());
        },
    },
};
</script>

<template>
    <el-drawer
        :model-value="modelValue"
        :title="$t('achievementRecommendation.title')"
        size="min(1380px, 100vw)"
        class="m-leap-recommendation-drawer"
        append-to-body
        destroy-on-close
        :close-on-click-modal="!disabled"
        :close-on-press-escape="!disabled"
        :show-close="!disabled"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <div class="m-recommendation-mobile-tabs">
            <el-radio-group v-model="mobileView" size="small">
                <el-radio-button label="preview">{{ $t('achievementRecommendation.preview') }}</el-radio-button>
                <el-radio-button label="settings">{{ $t('achievementRecommendation.preferences') }}</el-radio-button>
            </el-radio-group>
        </div>
        <div v-if="modelValue" class="m-recommendation-workspace" :class="`is-mobile-${mobileView}`">
            <section class="m-recommendation-settings">
                <el-form label-position="top" :disabled="controlsDisabled">
                    <div class="m-recommendation-settings__heading">
                        <h3>{{ $t('achievementRecommendation.preferences') }}</h3>
                        <el-tooltip :content="$t('achievementRecommendation.reset')">
                            <el-button circle :aria-label="$t('achievementRecommendation.reset')" @click="reset">
                                <template #icon><RefreshLeft /></template>
                            </el-button>
                        </el-tooltip>
                    </div>
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
                    <el-form-item :label="$t('achievementRecommendation.categories')">
                        <el-checkbox :model-value="options.categoryIds === null" @update:model-value="updateOptions({ categoryIds: $event ? null : [] })">
                            {{ $t('achievementRecommendation.allCategories') }}
                        </el-checkbox>
                        <el-select
                            v-if="options.categoryIds !== null" :model-value="options.categoryIds" multiple filterable
                            :placeholder="$t('achievementRecommendation.chooseCategories')" @update:model-value="updateOptions({ categoryIds: $event })"
                        >
                            <el-option v-for="category in categories" :key="category.id" :value="category.id" :label="category.name" />
                        </el-select>
                    </el-form-item>
                    <el-collapse v-model="expandedPreferences" class="m-recommendation-preferences">
                        <el-collapse-item name="dimensions" :title="$t('achievementRecommendation.dimensions')">
                            <div v-for="dimension in visibleDimensions" :key="dimension.apiKey" class="m-recommendation-preference-row">
                                <span :title="dimension.description || dimension.label">{{ dimension.label }}<small>{{ dimensionWeight(dimension) }}×</small></span>
                                <el-slider :model-value="dimensionWeight(dimension)" :min="0" :max="2" :step="0.1"
                                    :aria-label="`${dimension.label} ${$t('achievementRecommendation.weight')}`"
                                    @update:model-value="updateEntry('dimensionWeights', dimension.apiKey, $event === 1 ? undefined : $event)" />
                            </div>
                        </el-collapse-item>
                        <el-collapse-item name="directions" :title="$t('achievementRecommendation.directionPreferences')">
                            <div v-for="direction in directionOptions" :key="direction" class="m-recommendation-preference-row">
                                <span>{{ $t(`achievementRecommendation.directions.${direction}`) }}<small>{{ directionLabel(directionLevel(direction)) }}</small></span>
                                <el-slider :model-value="directionLevel(direction)" :min="0" :max="3" :step="1" show-stops
                                    :format-tooltip="directionLabel" :aria-label="$t(`achievementRecommendation.directions.${direction}`)"
                                    @update:model-value="updateDirection(direction, $event)" />
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
                    :dimensions="visibleDimensions" :has-requested="hasRequested" :can-request="canRequest"
                    @refresh="requestRecommendation"
                    @selection-change="selection = $event"
                />
            </section>
        </div>
        <template #footer>
            <div class="m-recommendation-actions">
                <el-button type="primary" :disabled="!canApply" :loading="saving" @click="$emit('apply', selection)">
                    {{ $t('achievementRecommendation.apply') }}
                </el-button>
            </div>
        </template>
    </el-drawer>
</template>

<style lang="less">
.m-leap-recommendation-drawer {
    --el-color-primary: #47777d;
    --el-color-primary-light-3: #75989c;
    --el-color-primary-light-5: #a3bbbe;
    --el-color-primary-light-7: #c8d6d8;
    --el-color-primary-light-8: #dae4e5;
    --el-color-primary-light-9: #edf2f2;
    --el-color-primary-dark-2: #365f64;
    color: #314043;
    .el-drawer__header {
        margin: 0;
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8e6;
        color: #314043;
    }
    .el-drawer__title { font-size: 18px; font-weight: 600; }
    .el-drawer__body { padding: 0; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
    .el-drawer__footer { border-top: 1px solid #e2e8e6; padding: 16px 24px; }
}
.m-recommendation-actions {
    display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;
    .el-button { margin: 0; max-width: 100%; height: auto; min-height: 36px; }
    .el-button > span { white-space: normal; }
}
.m-recommendation-workspace {
    display: grid;
    grid-template-columns: 290px minmax(0, 1fr);
    flex: 1;
    min-height: 0;
    h3 { margin: 0; font-size: 15px; line-height: 1.5; }
    .el-input-number, .el-select { width: 100%; }
    .el-form-item { margin: 14px 0; }
    .el-form-item__label { font-size: 12px; color: #697374; }
}
.m-recommendation-settings, .m-recommendation-preview {
    min-width: 0;
    min-height: 0;
    padding: 16px;
}
.m-recommendation-settings { overflow-y: auto; border-right: 1px solid #e2e8e6; background: #fafcfb; }
.m-recommendation-preview { overflow: hidden; }
.m-recommendation-settings__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.m-recommendation-preference-row { display: grid; grid-template-columns: 94px minmax(0, 1fr); gap: 12px; align-items: center; min-height: 48px; font-size: 12px;
    > span { min-width: 0; overflow-wrap: anywhere; }
    small { display: block; color: #7a8586; font-size: 10px; }
    .el-slider { width: calc(100% - 12px); margin-inline: 6px; }
}
.m-recommendation-preferences { --el-collapse-header-bg-color: transparent; --el-collapse-content-bg-color: transparent;
    .el-collapse-item__header { font-size: 14px; color: #314043; }
    .el-collapse-item__content { padding-bottom: 8px; }
}
.m-recommendation-mobile-tabs { display: none; }
@media (max-width: 760px) {
    .m-recommendation-mobile-tabs { display: block; flex: none; padding: 10px 12px; border-bottom: 1px solid #e2e8e6; }
    .m-recommendation-workspace { grid-template-columns: minmax(0, 1fr); }
    .is-mobile-preview .m-recommendation-settings, .is-mobile-settings .m-recommendation-preview { display: none; }
    .m-recommendation-settings, .m-recommendation-preview { padding: 12px; }
    .m-recommendation-settings { border-right: 0; }
    .m-leap-recommendation-drawer .el-drawer__header { padding: 14px 16px; }
    .m-leap-recommendation-drawer .el-drawer__footer { padding: 12px; }
}
</style>
