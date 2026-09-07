<script>
import { CollectionTag } from "@element-plus/icons-vue";
import { achievementCategoryImages } from "@/utils/achievementCategoryImages";

export default {
    name: "AchievementRecommendationCategories",
    components: { CollectionTag },
    props: {
        modelValue: { type: Array, default: null },
        categories: { type: Array, default: () => [] },
        disabled: { type: Boolean, default: false },
        countsReady: { type: Boolean, default: false },
    },
    emits: ["update:modelValue"],
    computed: {
        cards() {
            const selected = this.modelValue === null ? null : new Set(this.modelValue.map(String));
            return this.categories.map((category) => ({
                ...category,
                icon: achievementCategoryImages[category.name] || "",
                selected: !selected || selected.has(String(category.id)),
            }));
        },
    },
    methods: {
        selectAll(checked) {
            if (this.disabled) return;
            this.$emit("update:modelValue", checked ? null : []);
        },
        selectCategory(id, checked) {
            if (this.disabled) return;
            const selected = new Set(this.cards.filter((card) => card.selected).map((card) => card.id));
            if (checked) selected.add(id);
            else selected.delete(id);
            this.$emit("update:modelValue", selected.size === this.categories.length ? null : [...selected]);
        },
    },
};
</script>

<template>
    <div class="m-recommendation-categories">
        <div class="m-recommendation-categories__grid" role="group" :aria-label="$t('achievementRecommendation.categories')">
            <label class="m-recommendation-category-card" :class="{ 'is-selected': modelValue === null, 'is-disabled': disabled }">
                <input type="checkbox" :checked="modelValue === null" :disabled="disabled" @change="selectAll($event.target.checked)" />
                <span class="m-recommendation-category-card__name">{{ $t('achievementRecommendation.allCategories') }}</span>
            </label>
            <label v-for="category in cards" :key="category.id" class="m-recommendation-category-card"
                :class="{ 'is-selected': category.selected, 'is-disabled': disabled }">
                <input type="checkbox" :checked="category.selected" :disabled="disabled" @change="selectCategory(category.id, $event.target.checked)" />
                <span class="m-recommendation-category-card__icon" aria-hidden="true">
                    <img v-if="category.icon" :src="category.icon" alt="" /><CollectionTag v-else />
                </span>
                <span class="m-recommendation-category-card__name">{{ category.name }}</span>
                <span class="m-recommendation-category-card__count"
                    :aria-label="$t('achievementRecommendation.categoryUnfinished', { count: countsReady ? category.incompleteCount : '—' })"
                    :title="[$t('achievementRecommendation.categoryUnfinished', { count: countsReady ? category.incompleteCount : '—' }), $t('achievementRecommendation.categorySchoolExcluded', { count: '—' })].join(' · ')">
                    {{ countsReady ? category.incompleteCount : '—' }}
                </span>
            </label>
        </div>
        <p v-if="countsReady && !cards.length" class="m-recommendation-categories__hint">{{ $t('achievementRecommendation.noUnfinishedCategories') }}</p>
    </div>
</template>

<style lang="less" scoped>
.m-recommendation-categories {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 8px 0;

    input {
        flex: none;
        width: 14px;
        height: 14px;
        margin: 0;
        accent-color: #365f64;
        cursor: inherit;
    }

    label {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        min-height: 40px;
        box-sizing: border-box;
        margin: 0;
        padding: 8px 10px;
        border: 1px solid #e6e4dc;
        border-radius: 6px;
        background: #fffdf9;
        cursor: pointer;
        line-height: 1.5;
        font-size: 12px;
    }

    input:focus-visible { outline: 2px solid #47777d; outline-offset: 3px; }
    .m-recommendation-category-card.is-selected { border-color: #9bb6b9; background: #f3f6f5; }
    @media (hover: hover) {
        label:not(.is-disabled):hover { border-color: #75989c; background: #f3f6f5; }
        .m-recommendation-category-card.is-selected:not(.is-disabled):hover { border-color: #75989c; background: #edf2f2; }
    }
    label.is-disabled { opacity: 0.6; cursor: not-allowed; }
}
.m-recommendation-categories__hint { margin: 0; font-size: 12px; line-height: 1.6; color: #7f8c91; }
.m-recommendation-categories__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
    min-width: 0;
}
.m-recommendation-category-card {
    &__name { flex: 1; min-width: 0; color: #365f64; font-weight: 600; overflow-wrap: anywhere; }
    &__icon { display: inline-flex; flex: none; width: 16px; height: 16px; }
    &__icon img, &__icon svg { width: 100%; height: 100%; object-fit: contain; }
    &__count { flex: none; font-size: 12px; font-variant-numeric: tabular-nums; color: #8b999f; }
}
@media (max-width: @phone) {
    .m-recommendation-categories {
        gap: 12px;
        label { padding: 8px; }
    }
    .m-recommendation-categories__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .m-recommendation-category-card__count { font-size: 12px; }
}
</style>
