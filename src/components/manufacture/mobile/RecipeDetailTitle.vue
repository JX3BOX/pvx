<template>
    <div class="m-recipe-title">
        <img class="u-icon" :src="iconLink(recipe.IconID, client)" alt="" />
        <div class="u-name">{{ recipe.Name }}</div>
        <div class="u-meta">
            <span v-if="recipe.nLevel"> 需求等级：{{ recipe.nLevel }} </span>
            <span v-if="recipe.CostVigor || recipe.CostStamina">
                需求精力：{{ recipe.CostVigor || recipe.CostStamina }}
            </span>
            <span v-if="recipe.Exp"> 经验值：{{ recipe.Exp }} </span>
        </div>
    </div>
</template>

<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
export default {
    name: "RecipeDetailTitle",
    props: { recipe: { type: Object, default: () => ({}) } },
    methods: { iconLink },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
};
</script>

<style lang="less">
.m-recipe-title {
    display: flex;
    flex-direction: column;
    padding-left: 48px;
    gap: 4px;
    .pr;

    .u-icon {
        .size(40px);
        .pa;
        left: 0;
    }

    .u-name {
        color: var(--black-80, rgba(255, 255, 255, 0.8));
        .fz(14px, 20px);
        font-weight: 700;
    }

    .u-meta {
        color: var(--black-40, rgba(255, 255, 255, 0.4));
        .fz(12px, 18px);
        font-weight: 400;
    }
}
</style>
