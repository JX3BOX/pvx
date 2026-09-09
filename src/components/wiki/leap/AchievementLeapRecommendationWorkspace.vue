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
        currentPoints: { type: Number, default: null },
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
                value: [1.3, 1, 0.7][index],
                label: this.$t(`achievementRecommendation.${key}`),
            }));
        },
        controlsDisabled() {
            return this.disabled || this.roleLoading || this.client !== "std";
        },
        canRequest() {
            return !this.controlsDisabled && this.roleAvailable && !this.loading;
        },
        canApply() {
            return (
                this.canRequest &&
                this.selection?.ready &&
                this.selection.recommendation === this.recommendation &&
                Boolean(this.selection.items.length) &&
                Boolean(this.planTitle.trim()) &&
                this.targetPoints > this.recommendation.role.current_points
            );
        },
    },
    watch: {
        recommendation: {
            immediate: true,
            handler(value) {
                if (value) this.hasRequested = true;
            },
        },
        loading(value) {
            if (value) this.hasRequested = true;
        },
        roleId() {
            this.hasRequested = false;
            this.settingsExpanded = true;
            this.selection = null;
        },
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
                ? this.options.dimensionWeights[dimension.apiKey]
                : 1;
        },
        dimensionPreferenceOptions(dimension) {
            const known = ["money", "time", "luck", "costEffectiveness", "overall"].includes(dimension.key);
            // Cost-saving copy assumes lower cost is preferred; custom directions use neutral copy.
            const reversedCost =
                dimension.key !== "costEffectiveness" && dimension.recommendationDirection === "higher";
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
            const directionWeights = Object.fromEntries(
                Object.entries(this.options.directionWeights).filter(
                    ([direction, weight]) => directions.has(direction) && [1.3, 0.7].includes(weight)
                )
            );
            this.updateOptions({ categoryIds, directionWeights });
        },
        directionWeight(direction) {
            return achievementRecommendationDirectionWeight(this.options.directionWeights[direction]);
        },
        updateDirection(direction, weight) {
            if (this.controlsDisabled || !this.directionOptions.includes(direction) || ![1.3, 1, 0.7].includes(weight))
                return;
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
        <header v-if="hasRequested" class="m-recommendation-page-heading">
            <h2>{{ $t("achievementRecommendation.title") }}</h2>
            <slot name="actions" />
        </header>
        <button
            v-if="hasRequested"
            type="button"
            class="m-recommendation-settings-toggle"
            :aria-expanded="settingsExpanded"
            aria-controls="recommendation-settings"
            @click="settingsExpanded = !settingsExpanded"
        >
            <span>{{ $t("achievementRecommendation.preferences") }}</span>
            <el-icon><ArrowUp v-if="settingsExpanded" /><ArrowDown v-else /></el-icon>
        </button>
        <div class="m-recommendation-workspace" :class="{ 'is-settings-collapsed': !settingsExpanded }">
            <section id="recommendation-settings" class="m-recommendation-settings">
                <el-form label-position="top" :disabled="controlsDisabled">
                    <div class="m-recommendation-settings__heading">
                        <h3>{{ $t("pages.wiki.leap.ui.workbench.baseSettings") }}</h3>
                        <el-tooltip :content="$t('achievementRecommendation.resetHint')">
                            <el-button :disabled="controlsDisabled || loading" @click="reset">
                                <el-icon><RefreshLeft /></el-icon>
                                <span>
                                    {{ $t("achievementRecommendation.reset") }}
                                </span>
                            </el-button>
                        </el-tooltip>
                    </div>
                    <div class="m-recommendation-base-fields">
                        <el-form-item :label="$t('achievementRecommendation.chooseRole')">
                            <el-select
                                :model-value="roleId"
                                filterable
                                :loading="roleLoading"
                                :placeholder="$t('achievementRecommendation.chooseRole')"
                                @update:model-value="$emit('role-change', $event)"
                            >
                                <el-option
                                    v-for="role in roles"
                                    :key="role.id"
                                    :value="role.id"
                                    :label="[role.name, role.server].filter(Boolean).join(' · ')"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('achievementRecommendation.planTitle')">
                            <el-input
                                :model-value="planTitle"
                                maxlength="40"
                                show-word-limit
                                @update:model-value="$emit('update:planTitle', $event)"
                            />
                        </el-form-item>
                        <el-form-item :label="$t('achievementRecommendation.targetPoints')">
                            <el-input-number
                                :model-value="targetPoints"
                                :min="1"
                                :step="1000"
                                :precision="0"
                                :controls="false"
                                @update:model-value="$emit('update:targetPoints', $event)"
                            />
                            <span v-if="currentPoints !== null && roleAvailable" class="m-recommendation-target-hint">
                                {{
                                    $t("achievementAppearance.increase", {
                                        points: Math.max(0, targetPoints - currentPoints).toLocaleString(),
                                    })
                                }}
                            </span>
                        </el-form-item>
                    </div>
                    <el-collapse v-model="expandedPreferences" class="m-recommendation-preferences">
                        <el-collapse-item name="categories" :title="$t('achievementRecommendation.categories')">
                            <template #title>
                                <span class="m-recommendation-category-heading">
                                    <strong>{{ $t("achievementRecommendation.categories") }}</strong>
                                </span>
                                <span class="m-recommendation-collapse-label">{{
                                    $t(
                                        expandedPreferences.includes("categories")
                                            ? "achievementAppearance.collapse"
                                            : "achievementAppearance.expand"
                                    )
                                }}</span>
                            </template>
                            <AchievementRecommendationCategories
                                :model-value="options.categoryIds"
                                :categories="categories"
                                :disabled="controlsDisabled"
                                :counts-ready="categoryCountsReady"
                                @update:model-value="updateCategories"
                            />
                        </el-collapse-item>
                        <el-collapse-item name="dimensions" :title="$t('achievementRecommendation.dimensions')">
                            <template #title>
                                <span>{{ $t("achievementRecommendation.dimensions") }}</span>
                                <span class="m-recommendation-collapse-label">{{
                                    $t(
                                        expandedPreferences.includes("dimensions")
                                            ? "achievementAppearance.collapse"
                                            : "achievementAppearance.expand"
                                    )
                                }}</span>
                            </template>
                            <div class="m-recommendation-preference-grid">
                                <div
                                    v-for="dimension in visibleDimensions"
                                    :key="dimension.apiKey"
                                    class="m-recommendation-dimension-preference"
                                >
                                    <span :title="dimension.description || dimension.label">{{ dimension.label }}</span>
                                    <el-radio-group
                                        :model-value="dimensionWeight(dimension)"
                                        :aria-label="dimension.label"
                                        :disabled="controlsDisabled"
                                        class="m-recommendation-dimension-options"
                                        @update:model-value="updateDimensionPreference(dimension, $event)"
                                    >
                                        <el-radio-button
                                            v-for="option in dimensionPreferenceOptions(dimension)"
                                            :key="option.value"
                                            :value="option.value"
                                        >
                                            {{ option.label }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </div>
                            </div>
                        </el-collapse-item>
                        <el-collapse-item
                            v-if="directionOptions.length"
                            name="directions"
                            :title="$t('achievementRecommendation.directionPreferences')"
                        >
                            <template #title>
                                <span>{{ $t("achievementRecommendation.directionPreferences") }}</span>
                                <span class="m-recommendation-collapse-label">{{
                                    $t(
                                        expandedPreferences.includes("directions")
                                            ? "achievementAppearance.collapse"
                                            : "achievementAppearance.expand"
                                    )
                                }}</span>
                            </template>
                            <div class="m-recommendation-preference-grid">
                                <div
                                    v-for="direction in directionOptions"
                                    :key="direction"
                                    class="m-recommendation-dimension-preference"
                                >
                                    <span>{{ $t(`achievementRecommendation.directions.${direction}`) }}</span>
                                    <el-radio-group
                                        :model-value="directionWeight(direction)"
                                        :aria-label="$t(`achievementRecommendation.directions.${direction}`)"
                                        :disabled="controlsDisabled"
                                        class="m-recommendation-dimension-options"
                                        @update:model-value="updateDirection(direction, $event)"
                                    >
                                        <el-radio-button
                                            v-for="option in directionPreferenceOptions"
                                            :key="option.value"
                                            :value="option.value"
                                        >
                                            {{ option.label }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </el-form>
            </section>
            <section v-show="hasRequested || error || client !== 'std'" class="m-recommendation-preview">
                <AchievementLeapRecommendation
                    :recommendation="recommendation"
                    :loading="loading"
                    :disabled="disabled"
                    :role-available="roleAvailable"
                    :client="client"
                    :error="error"
                    :metadata="metadata"
                    :maps="maps"
                    :menus="menus"
                    :target-points="targetPoints"
                    :completed-ids="completedIds"
                    :school-eligibility="schoolEligibility"
                    :dimensions="visibleDimensions"
                    :has-requested="hasRequested"
                    :can-request="canRequest"
                    @refresh="requestRecommendation"
                    @selection-change="selection = $event"
                />
            </section>
        </div>
        <div v-if="!hasRequested" class="m-recommendation-start-actions">
            <div class="m-recommendation-primary-actions">
            <el-button type="primary" :disabled="!canRequest" :loading="loading" @click="requestRecommendation">
                {{ $t("achievementRecommendation.start") }}
            </el-button>
            <slot name="consultation" />
            </div>
            <div class="m-recommendation-saved-actions"><slot name="actions" /></div>
        </div>
        <div v-if="recommendation" class="m-recommendation-actions">
            <el-button type="primary" :disabled="!canApply" :loading="saving" @click="$emit('apply', selection)">
                {{ $t("achievementRecommendation.apply") }}
            </el-button>
        </div>
    </div>
</template>

<style lang="less">
.m-leap-recommendation-workspace {
    min-width: 0;
    padding: 12px;
    border-radius: 16px;
    background: #fff;
    color: #333;
    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
    }
    .el-input-number,
    .el-select {
        width: 100%;
    }
    .el-form-item {
        min-width: 0;
        margin: 0;
    }
    .el-form-item__label {
        font-size: 14px;
        color: #333;
        line-height: 1.5;
        height: auto;
        margin-bottom: 8px;
    }
    .m-recommendation-page-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        padding: 12px;
        h2 {
            margin: 0;
            font-size: 20px;
        }
    }
    .m-recommendation-workspace {
        display: grid;
        min-width: 0;
        gap: 12px;
    }
    .m-recommendation-settings,
    .m-recommendation-preview {
        min-width: 0;
    }
    .m-recommendation-settings > .el-form {
        display: grid;
        gap: 0;
    }
    .m-recommendation-settings__heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 12px 0;
        border-radius: 16px 16px 0 0;
        background: #f8f7f3;
        h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            &::before {
                content: "";
                width: 6px;
                height: 18px;
                border-radius: 3px;
                background: #5a7e84;
            }
        }
        .el-button {
            color: #967944;
            border: 0;
            background: transparent;
            height: 28px;
        }
    }
    .m-recommendation-base-fields {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 12px;
        padding: 24px 12px 12px;
        border-radius: 0 0 16px 16px;
        background: #f8f7f3;
        .el-input__wrapper,
        .el-select__wrapper {
            min-height: 48px;
            padding-left: 24px;
            padding-right: 24px;
            border-radius: 28px;
        }
        .el-input__inner {
            height: 46px;
            text-align: left;
            font-size: 14px;
        }
        .el-input__count {
            right: 24px;
        }
        .el-form-item:last-child .el-form-item__content {
            position: relative;
        }
        .el-form-item:last-child .el-input__wrapper {
            padding-right: 145px;
        }
    }
    .m-recommendation-target-hint {
        position: absolute;
        right: 24px;
        max-width: 132px;
        pointer-events: none;
        color: #967944;
        font-size: 14px;
        line-height: 1.3;
    }
    .m-recommendation-preferences {
        border: 0;
        display: grid;
        gap: 12px;
        --el-collapse-header-bg-color: transparent;
        --el-collapse-content-bg-color: transparent;
        .el-collapse-item {
            background: #f8f7f3;
            border-radius: 16px;
            padding: 0 12px;
            overflow: hidden;
        }
        .el-collapse-item__header {
            display: flex;
            gap: 8px;
            min-height: 52px;
            height: auto;
            border: 0;
            color: #333;
            font-size: 16px;
            font-weight: 500;
            line-height: 1.5;
            &::before {
                content: "";
                width: 6px;
                height: 18px;
                flex: none;
                border-radius: 3px;
                background: #5a7e84;
            }
        }
        .el-collapse-item__arrow {
            color: #967944;
            margin: 0 4px 0 0;
        }
        .el-collapse-item__title {
            display: flex;
            min-width: 0;
            flex: 1;
            align-items: center;
            gap: 8px;
        }
        .el-collapse-item__wrap {
            border: 0;
        }
        .el-collapse-item__content {
            padding-bottom: 12px;
        }
    }
    .m-recommendation-category-heading {
        display: flex;
        align-items: center;
        strong {
            font-size: 16px;
            font-weight: 500;
        }
    }
    .m-recommendation-collapse-label {
        margin-left: auto;
        color: #967944;
        font-size: 14px;
        font-weight: 400;
    }
    .m-recommendation-preference-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
    }
    .m-recommendation-dimension-preference {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-width: 0;
        min-height: 102px;
        padding: 10px 12px;
        border-radius: 12px;
        background: #fff;
        font-size: 14px;
        text-align: center;
        > span {
            overflow-wrap: anywhere;
        }
    }
    .m-recommendation-dimension-options {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 4px;
        width: 100%;
        .el-radio-button {
            display: flex;
            min-width: 0;
        }
        .el-radio-button__inner {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: center;
            min-height: 52px;
            padding: 8px 4px;
            box-sizing: border-box;
            border: 1px solid transparent;
            border-radius: 8px;
            box-shadow: none;
            font-size: 14px;
            line-height: 1.5;
            white-space: normal;
            overflow-wrap: anywhere;
            color: #333;
            background: #fff;
        }
        .el-radio-button.is-active .el-radio-button__original-radio:not(:disabled) + .el-radio-button__inner {
            border-color: #5a7e84;
            color: #333;
            background: #fff;
            box-shadow: inset 0 -3px #5a7e84;
            font-weight: 600;
        }
        .el-radio-button.is-disabled .el-radio-button__inner {
            opacity: 0.6;
        }
        .el-radio-button__original-radio:focus-visible + .el-radio-button__inner {
            outline: 2px solid #5a7e84;
            outline-offset: 2px;
        }
    }
    .m-recommendation-settings-toggle {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        margin-bottom: 12px;
        border: 0;
        border-radius: 12px;
        background: #f8f7f3;
        color: #6e572c;
        font: inherit;
        cursor: pointer;
    }
    .is-settings-collapsed .m-recommendation-settings {
        display: none;
    }
    .m-recommendation-start-actions {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: start;
        gap: 12px;
        padding: 32px 12px 20px;
        .el-button {
            min-width: 240px;
            max-width: 100%;
            min-height: 56px;
            height: auto;
            margin: 0;
            padding: 12px 24px;
            border: 1px solid #967944;
            border-radius: 30px;
            color: #967944;
            background: #fff;
            font-size: 16px;
            font-weight: 600;
            > span {
                white-space: normal;
            }
        }
        .el-button--primary {
            color: #fff;
            background: #5a7e84;
            border-color: #5a7e84;
        }
    }
    .m-recommendation-primary-actions {
        grid-column: 2; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
        max-width: 660px; min-width: 0;
    }
    .m-recommendation-saved-actions { grid-column: 3; justify-self: end; min-width: 0; }
    @media (max-width: 1100px) {
        .m-recommendation-start-actions { grid-template-columns: minmax(0, 1fr) auto; }
        .m-recommendation-primary-actions { grid-column: 1; justify-self: center; }
        .m-recommendation-saved-actions { grid-column: 2; }
    }
    .m-recommendation-actions {
        position: sticky;
        bottom: 0;
        z-index: 6;
        display: flex;
        justify-content: center;
        padding: 12px;
        margin-top: 12px;
        border-radius: 12px;
        background: #fff;
        .el-button {
            min-width: 240px;
            max-width: 100%;
            min-height: 48px;
            height: auto;
            border-radius: 28px;
            > span {
                white-space: normal;
            }
        }
    }
    @media (max-width: 1500px) {
        .m-recommendation-preference-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
    }
    @media (max-width: 1000px) {
        .m-recommendation-preference-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .m-recommendation-base-fields {
            grid-template-columns: minmax(0, 1fr);
        }
    }
    @media (max-width: @phone) {
        .m-recommendation-preference-grid {
            grid-template-columns: minmax(0, 1fr);
        }
        .m-recommendation-base-fields {
            gap: 16px;
            padding-top: 16px;
            .el-input__inner {
                font-size: 16px;
            }
        }
        .m-recommendation-primary-actions { grid-column: 1; width: 100%; max-width: none; }
        .m-recommendation-saved-actions { grid-column: 1; width: 100%; }
        .m-recommendation-start-actions {
            grid-template-columns: minmax(0, 1fr);
            padding: 20px 0 8px;
            .el-button {
                width: 100%;
                min-width: 0;
                min-height: 48px;
            }
        }
        .m-recommendation-collapse-label {
            font-size: 13px;
        }
        .m-recommendation-actions .el-button {
            min-width: 0;
            width: 100%;
        }
    }
}
</style>
