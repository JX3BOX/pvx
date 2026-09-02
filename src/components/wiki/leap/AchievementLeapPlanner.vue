<script>
import { RefreshLeft, TrendCharts } from "@element-plus/icons-vue";
import PvxSurface from "@/components/design/PvxSurface.vue";

export default {
    name: "AchievementLeapPlanner",
    components: {
        PvxSurface,
        RefreshLeft,
        TrendCharts,
    },
    props: {
        modelValue: {
            type: Object,
            required: true,
        },
        roles: {
            type: Array,
            default: () => [],
        },
        categories: {
            type: Array,
            default: () => [],
        },
        maps: {
            type: Array,
            default: () => [],
        },
        currentPoints: {
            type: Number,
            default: 0,
        },
        generating: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue", "generate", "reset", "role-change"],
    computed: {
        targetGap() {
            return Math.max(0, Number(this.modelValue.targetPoints || 0) - this.currentPoints);
        },
        selectedCategoryIds() {
            return Array.isArray(this.modelValue.categoryIds) ? this.modelValue.categoryIds.map(String) : [];
        },
        canGenerate() {
            return (
                !this.generating &&
                Boolean(this.modelValue.roleId) &&
                Boolean(String(this.modelValue.title || "").trim()) &&
                Number(this.modelValue.targetPoints) > this.currentPoints
            );
        },
    },
    methods: {
        updateField(field, value) {
            const next = { ...this.modelValue, [field]: value };
            this.$emit("update:modelValue", next);
            if (field === "roleId") this.$emit("role-change", value);
        },
        toggleCategory(categoryId) {
            const category = this.categories.find((item) => String(item.id) === String(categoryId));
            const sourceIds = (category?.sourceIds || [categoryId]).map(String);
            const selected = new Set(this.selectedCategoryIds);
            const isSelected = sourceIds.some((id) => selected.has(id));
            sourceIds.forEach((id) => selected.delete(id));
            if (!isSelected) selected.add(String(categoryId));
            this.updateField("categoryIds", [...selected]);
        },
        isCategorySelected(category) {
            return (category.sourceIds || [category.id])
                .map(String)
                .some((id) => this.selectedCategoryIds.includes(id));
        },
        roleLabel(role) {
            return [role.name, role.server].filter(Boolean).join(" · ");
        },
        formatNumber(value) {
            return Number(value || 0).toLocaleString();
        },
    },
};
</script>

<template>
    <PvxSurface class="m-leap-planner" padding="medium">
        <header class="m-leap-planner__header">
            <div>
                <span class="u-leap-kicker">{{ $t("pages.wiki.leap.ui.workbench.plannerKicker") }}</span>
                <h1>{{ $t("pages.wiki.leap.ui.workbench.plannerTitle") }}</h1>
                <p>{{ $t("pages.wiki.leap.ui.workbench.plannerDescription") }}</p>
            </div>
            <span class="u-leap-data-note">{{ $t("pages.wiki.leap.ui.workbench.futureDataNote") }}</span>
        </header>

        <div class="m-leap-planner__grid">
            <label class="m-leap-field is-wide">
                <span>{{ $t("pages.wiki.leap.ui.planName") }}</span>
                <el-input
                    :model-value="modelValue.title"
                    :placeholder="$t('pages.wiki.leap.ui.enterPlanName')"
                    maxlength="40"
                    show-word-limit
                    @update:model-value="updateField('title', $event)"
                />
            </label>

            <label class="m-leap-field">
                <span>{{ $t("pages.wiki.leap.ui.workbench.planRole") }}</span>
                <el-select
                    :model-value="modelValue.roleId"
                    :placeholder="$t('pages.wiki.leap.ui.selectPlaceholder')"
                    @update:model-value="updateField('roleId', $event)"
                >
                    <el-option
                        v-for="role in roles"
                        :key="role.id"
                        :label="roleLabel(role)"
                        :value="role.id"
                    />
                </el-select>
            </label>

            <label class="m-leap-field">
                <span>{{ $t("pages.wiki.leap.ui.targetSeniority") }}</span>
                <el-input-number
                    :model-value="modelValue.targetPoints"
                    :min="0"
                    :step="1000"
                    :controls="false"
                    @update:model-value="updateField('targetPoints', $event)"
                />
            </label>

            <label class="m-leap-field">
                <span>{{ $t("pages.wiki.leap.ui.workbench.difficultyLimit") }}</span>
                <el-select
                    :model-value="modelValue.maxDifficulty ?? ''"
                    @update:model-value="updateField('maxDifficulty', $event === '' ? null : $event)"
                >
                    <el-option :label="$t('pages.wiki.leap.ui.workbench.noLimit')" value="" />
                    <el-option
                        v-for="level in 5"
                        :key="level"
                        :label="`${'★'.repeat(level)} ${$t('pages.wiki.leap.ui.workbench.andBelow')}`"
                        :value="level"
                    />
                </el-select>
            </label>

            <label class="m-leap-field">
                <span>{{ $t("pages.wiki.leap.ui.workbench.routeStrategy") }}</span>
                <el-select
                    :model-value="modelValue.strategy"
                    @update:model-value="updateField('strategy', $event)"
                >
                    <el-option :label="$t('pages.wiki.leap.ui.workbench.strategyEasy')" value="easy-first" />
                    <el-option :label="$t('pages.wiki.leap.ui.workbench.strategyPoints')" value="big-first" />
                    <el-option
                        :label="$t('pages.wiki.leap.ui.workbench.strategyEfficiencyPending')"
                        value="efficiency"
                        disabled
                    />
                    <el-option
                        :label="$t('pages.wiki.leap.ui.workbench.strategyCostPending')"
                        value="cost-first"
                        disabled
                    />
                </el-select>
            </label>

            <label class="m-leap-field is-wide">
                <span>{{ $t("pages.wiki.leap.ui.workbench.mapScope") }}</span>
                <el-select
                    :model-value="modelValue.mapId"
                    clearable
                    filterable
                    :placeholder="$t('pages.wiki.leap.ui.workbench.allMaps')"
                    @update:model-value="updateField('mapId', $event || '')"
                >
                    <el-option v-for="map in maps" :key="map.id" :label="map.label" :value="map.id" />
                </el-select>
            </label>
        </div>

        <section class="m-leap-category-picker" :aria-label="$t('pages.wiki.leap.ui.workbench.categoryScope')">
            <div class="m-leap-category-picker__heading">
                <strong>{{ $t("pages.wiki.leap.ui.workbench.categoryScope") }}</strong>
            </div>
            <div class="m-leap-category-picker__list">
                <button
                    v-for="category in categories"
                    :key="category.id"
                    type="button"
                    :class="{ 'is-active': isCategorySelected(category) }"
                    @click="toggleCategory(category.id)"
                >
                    <span>{{ category.name }}</span>
                    <small>{{ formatNumber(category.incompleteCount) }}</small>
                </button>
            </div>
        </section>

        <footer class="m-leap-planner__footer">
            <div class="m-leap-gap">
                <span>{{ $t("pages.wiki.leap.ui.currentSeniority") }}</span>
                <strong>{{ formatNumber(currentPoints) }}</strong>
                <i aria-hidden="true">/</i>
                <span>{{ $t("pages.wiki.leap.ui.workbench.targetGap") }}</span>
                <strong :class="{ 'is-complete': targetGap === 0 }">{{ formatNumber(targetGap) }}</strong>
            </div>
            <div class="m-leap-planner__actions">
                <button type="button" class="u-leap-secondary-button" @click="$emit('reset')">
                    <RefreshLeft />
                    {{ $t("pages.wiki.leap.ui.workbench.resetConditions") }}
                </button>
                <button
                    type="button"
                    class="u-leap-primary-button"
                    :disabled="!canGenerate"
                    @click="$emit('generate')"
                >
                    <TrendCharts />
                    {{
                        generating
                            ? $t("pages.wiki.leap.ui.generatingPlan")
                            : $t("pages.wiki.leap.ui.generatePlan")
                    }}
                </button>
            </div>
        </footer>
    </PvxSurface>
</template>

<style lang="less" scoped>
.m-leap-planner {
    color: #2e3738;
}

.m-leap-planner__header,
.m-leap-planner__footer {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
}

.m-leap-planner__header h1 {
    margin: 4px 0 6px;
    font-size: 24px;
    line-height: 1.25;
}

.m-leap-planner__header p {
    max-width: 760px;
    margin: 0;
    color: #7b8586;
    line-height: 1.7;
}

.u-leap-kicker {
    color: #a88139;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.16em;
}

.u-leap-data-note {
    max-width: 320px;
    padding: 7px 10px;
    border-radius: 8px;
    color: #7d705e;
    background: #f4efe4;
    font-size: 12px;
    line-height: 1.5;
}

.m-leap-planner__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-top: 22px;
}

.m-leap-field {
    display: grid;
    min-width: 0;
    gap: 7px;
    color: #697374;
    font-size: 13px;
}

.m-leap-field.is-wide {
    grid-column: span 2;
}

.m-leap-field :deep(.el-select),
.m-leap-field :deep(.el-input-number) {
    width: 100%;
}

.m-leap-category-picker {
    margin-top: 18px;
    padding: 14px;
    border: 1px solid rgba(72, 89, 88, 0.12);
    border-radius: 12px;
    background: #f8f5ee;
}

.m-leap-category-picker__heading {
    margin-bottom: 10px;
    color: #647071;
    font-size: 13px;
}

.m-leap-category-picker__heading strong {
    color: #344547;
}

.m-leap-category-picker__list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.m-leap-category-picker__list button {
    display: inline-flex;
    min-height: 36px;
    align-items: center;
    gap: 7px;
    padding: 7px 11px;
    border: 1px solid rgba(71, 119, 125, 0.16);
    border-radius: 8px;
    color: #526466;
    background: rgba(255, 255, 255, 0.72);
    cursor: pointer;
}

.m-leap-category-picker__list button:hover,
.m-leap-category-picker__list button.is-active {
    border-color: #47777d;
    color: #fff;
    background: #47777d;
}

.m-leap-category-picker__list small {
    opacity: 0.72;
    font-variant-numeric: tabular-nums;
}

.m-leap-planner__footer {
    align-items: center;
    margin-top: 18px;
}

.m-leap-gap,
.m-leap-planner__actions {
    display: flex;
    align-items: center;
    gap: 9px;
}

.m-leap-gap {
    color: #7a8586;
    font-size: 13px;
}

.m-leap-gap strong {
    color: #a3543f;
    font-size: 17px;
    font-variant-numeric: tabular-nums;
}

.m-leap-gap strong:first-of-type,
.m-leap-gap strong.is-complete {
    color: #365f64;
}

.m-leap-gap i {
    color: #c1b8a8;
    font-style: normal;
}

.u-leap-primary-button,
.u-leap-secondary-button {
    display: inline-flex;
    min-height: 40px;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px 16px;
    border: 1px solid #47777d;
    border-radius: 9px;
    cursor: pointer;
}

.u-leap-primary-button {
    color: #fff;
    background: #47777d;
}

.u-leap-secondary-button {
    color: #47777d;
    background: transparent;
}

.u-leap-primary-button:disabled {
    border-color: #aeb9b9;
    background: #aeb9b9;
    cursor: not-allowed;
}

.u-leap-primary-button svg,
.u-leap-secondary-button svg {
    width: 17px;
}

@media (max-width: 1080px) {
    .m-leap-planner__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 720px) {
    .m-leap-planner__header,
    .m-leap-planner__footer {
        display: grid;
    }

    .u-leap-data-note {
        max-width: none;
    }

    .m-leap-planner__grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .m-leap-field.is-wide {
        grid-column: auto;
    }

    .m-leap-gap {
        flex-wrap: wrap;
    }

    .m-leap-planner__actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .u-leap-primary-button,
    .u-leap-secondary-button {
        min-height: 44px;
    }
}

@media (max-width: 420px) {
    .m-leap-planner__actions {
        grid-template-columns: 1fr;
    }
}
</style>
