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
        <div
            class="m-recommendation-categories__grid"
            role="group"
            :aria-label="$t('achievementRecommendation.categories')"
        >
            <label
                class="m-recommendation-category-card"
                :class="{ 'is-selected': modelValue === null, 'is-disabled': disabled }"
            >
                <input
                    type="checkbox"
                    :checked="modelValue === null"
                    :disabled="disabled"
                    @change="selectAll($event.target.checked)"
                />
                <span class="m-recommendation-category-card__icon" aria-hidden="true"
                    ><img src="@/assets/img/wiki/figma/tier-normal.svg" alt=""
                /></span>
                <span class="m-recommendation-category-card__name">{{
                    $t("achievementRecommendation.allCategories")
                }}</span>
            </label>
            <label
                v-for="category in cards"
                :key="category.id"
                class="m-recommendation-category-card"
                :class="{ 'is-selected': category.selected, 'is-disabled': disabled }"
            >
                <input
                    type="checkbox"
                    :checked="category.selected"
                    :disabled="disabled"
                    @change="selectCategory(category.id, $event.target.checked)"
                />
                <span class="m-recommendation-category-card__icon" aria-hidden="true">
                    <img v-if="category.icon" :src="category.icon" alt="" /><CollectionTag v-else />
                </span>
                <span class="m-recommendation-category-card__name">{{ category.name }}</span>
                <span
                    class="m-recommendation-category-card__count"
                    :aria-label="
                        $t('achievementRecommendation.categoryUnfinished', {
                            count: countsReady ? category.incompleteCount : '—',
                        })
                    "
                    :title="
                        [
                            $t('achievementRecommendation.categoryUnfinished', {
                                count: countsReady ? category.incompleteCount : '—',
                            }),
                            $t('achievementRecommendation.categorySchoolExcluded', { count: '—' }),
                        ].join(' · ')
                    "
                >
                    {{ countsReady ? category.incompleteCount : "—" }} / {{ category.count ?? category.achievementIds?.length ?? "—" }}
                </span>
            </label>
        </div>
        <p v-if="countsReady && !cards.length" class="m-recommendation-categories__hint">
            {{ $t("achievementRecommendation.noUnfinishedCategories") }}
        </p>
    </div>
</template>

<style lang="less" scoped>
.m-recommendation-categories {
    min-width: 0;
}
.m-recommendation-categories__grid {
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    gap: 8px 12px;
}
.m-recommendation-category-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-width: 0;
    min-height: 116px;
    box-sizing: border-box;
    margin: 0;
    padding: 12px 8px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    line-height: 1.5;
    font-size: 14px;
    text-align: center;
    input {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 16px;
        height: 16px;
        margin: 0;
        accent-color: #5a7e84;
        cursor: inherit;
        opacity: 0;
    }
    input:focus-visible {
        opacity: 1;
        outline: 2px solid #5a7e84;
        outline-offset: 3px;
    }
    &.is-selected {
        border-color: #5a7e84;
        background: #fff;
        box-shadow: inset 0 -3px #5a7e84;
        input {
            opacity: 1;
        }
        .m-recommendation-category-card__name {
            font-weight: 600;
        }
        .m-recommendation-category-card__icon img {
            filter: grayscale(1) brightness(0.55);
        }
    }
    &:hover:not(.is-disabled) {
        border-color: #5a7e84;
        input {
            opacity: 1;
        }
    }
    &.is-disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}
.m-recommendation-category-card__icon {
    display: flex;
    flex: none;
    width: 40px;
    height: 40px;
    margin-bottom: 4px;
    color: #967944;
    img,
    svg {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
}
.m-recommendation-category-card__name {
    min-width: 0;
    color: #333;
    font-weight: 400;
    overflow-wrap: anywhere;
}
.m-recommendation-category-card__count {
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    color: #999;
}
.m-recommendation-categories__hint {
    margin: 12px 0;
    color: #999;
    font-size: 14px;
}
@media (max-width: 1600px) {
    .m-recommendation-categories__grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }
}
@media (max-width: @phone) {
    .m-recommendation-categories__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
    }
}
</style>
