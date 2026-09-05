<script>
import { getAchievementWorkbenchRatingFill, getAchievementWorkbenchScoreLabel } from "@/utils/achievementWorkbench";

export default {
    name: "AchievementDifficultyStars",
    props: {
        scoreLabels: { type: Array, default: () => [] },
        value: {
            type: [Number, String],
            default: null,
        },
        max: {
            type: Number,
            default: 5,
        },
        label: {
            type: String,
            default: "",
        },
    },
    computed: {
        scoreLabel() { return getAchievementWorkbenchScoreLabel(this.value, this.scoreLabels); },
        fillPercent() {
            return getAchievementWorkbenchRatingFill(this.value, this.max);
        },
        hasValue() {
            return this.fillPercent !== null;
        },
        normalizedValue() {
            if (!this.hasValue) return null;
            return Number(((this.fillPercent / 100) * this.max).toFixed(2));
        },
        displayValue() {
            return this.hasValue ? this.normalizedValue.toFixed(1) : "";
        },
        accessibleLabel() {
            if (!this.hasValue) return this.label ? `${this.label}：—` : "—";
            const rating = `${this.normalizedValue}/${this.max}`;
            return this.label ? `${this.label}：${rating}` : rating;
        },
        fillStyle() {
            return {
                width: `${this.fillPercent ?? 0}%`,
            };
        },
    },
};
</script>

<template>
    <span v-if="scoreLabel" class="c-achievement-score-label" :title="accessibleLabel">{{ scoreLabel }}</span>
    <span v-else-if="hasValue" class="c-achievement-rating" role="img" :aria-label="accessibleLabel">
        <span class="c-achievement-stars" aria-hidden="true">
            <span class="c-achievement-stars__empty">☆☆☆☆☆</span>
            <span class="c-achievement-stars__filled" :style="fillStyle">★★★★★</span>
        </span>
        <span class="c-achievement-stars__value" aria-hidden="true">{{ displayValue }}</span>
    </span>
    <span v-else class="c-achievement-stars__empty-value">—</span>
</template>

<style lang="less" scoped>
.c-achievement-score-label { color: #365f64; overflow-wrap: anywhere; }
.c-achievement-rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
}

.c-achievement-stars {
    position: relative;
    display: inline-block;
    overflow: hidden;
    color: rgba(155, 145, 124, 0.28);
    line-height: 1;
    letter-spacing: 1px;
    white-space: nowrap;
}

.c-achievement-stars__value {
    color: #7d8584;
    font-variant-numeric: tabular-nums;
    line-height: 1;
}

.c-achievement-stars__empty {
    display: inline-block;
}

.c-achievement-stars__filled {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-block;
    overflow: hidden;
    color: #a7772a;
    white-space: nowrap;
}

.c-achievement-stars__empty-value {
    color: #9aa2a1;
}
</style>
