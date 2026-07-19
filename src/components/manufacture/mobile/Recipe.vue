<template>
    <div class="m-manufacture-recipes">
        <div class="m-toolbar">
            <el-input
                class="u-search"
                v-model="keyword"
                :placeholder="$t('pages.pvg.manufacture.ui.searchPlaceholder')"
            >
                <template #prefix>
                    <img svg-inline src="@/assets/img/manufacture/search.svg" alt="" />
                </template>
            </el-input>
        </div>
        <div class="m-recipe-list">
            <div class="m-recipe-subtype" v-for="subtype in recipeTree" :key="subtype.id">
                <button
                    type="button"
                    class="m-recipe-title"
                    :class="{ 'is-active': subtype.id == currentSubtype }"
                    @click="onClickSubtype(subtype.id)"
                >
                    {{ subtype.name }}
                </button>
                <div class="m-recipe-items" v-if="subtype.id == currentSubtype">
                    <button
                        type="button"
                        class="m-recipe-item"
                        v-for="recipe in subtype.recipes"
                        :key="recipe.ID"
                        @click="$emit('go-recipe', { recipe_type: craftType.key, recipe_id: recipe.ID })"
                    >
                        <img class="u-icon" :src="iconLink(recipe.IconID, client)" alt="" />
                        <span>{{ recipe.Name }}</span>
                    </button>
                </div>
            </div>
            <div v-if="!recipeTree.length" class="m-recipe-empty">
                <strong>{{ $t("pages.pvg.manufacture.ui.empty.title") }}</strong>
                <span>{{ $t("pages.pvg.manufacture.ui.empty.description") }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
export default {
    name: "ManufactureRecipes",
    components: {},
    props: {
        craftType: {
            type: Object,
            required: true,
        },
        craftSubtypes: {
            type: Array,
            required: true,
        },
        craftRecipes: {
            type: Array,
            required: true,
        },
    },
    data: () => ({
        keyword: "",

        currentSubtype: "",
    }),
    computed: {
        recipeTree() {
            const tree = {};
            for (const subtype of this.craftSubtypes) {
                let recipes = this.craftRecipes.filter((recipe) => recipe.Belong == subtype.BelongID);
                if (this.keyword) {
                    recipes = recipes.filter((recipe) => recipe.Name.includes(this.keyword));
                }
                tree[subtype.BelongID] = {
                    name: subtype.BelongName,
                    id: subtype.BelongID,
                    recipes: recipes.reverse(),
                };
            }

            return Object.values(tree).filter((subtype) => subtype.recipes.length > 0);
        },
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        iconLink,
        onClickSubtype(id) {
            if (this.currentSubtype === id) {
                this.currentSubtype = "";
            } else {
                this.currentSubtype = id;
            }
        },
    },
};
</script>

<style lang="less">
.m-manufacture-recipes {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: calc(100% - 24px);
    box-sizing: border-box;

    .m-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;

        .u-return {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            gap: 4px;
            padding: 9px;
            .r(8px);

            color: var(--black-80);
            background-color: var(--Primary-Brand-4);
            .fz(14px, 22px);

            .el-icon-back {
                .bold;
            }
        }

        .u-search {
            .el-input__wrapper {
                box-shadow: none;
                border: 1px solid #2828280d;
                .r(8px);
            }
            .el-input__inner {
                background: var(--Primary-Brand-4);
                color: var(--black-100);
            }
            .el-input__prefix {
                padding: 8px 0;

                @media (prefers-color-scheme: dark) {
                    & {
                        filter: invert(1);
                    }
                }
            }
        }
    }

    .m-recipe-list {
        flex-grow: 1;
        min-height: 0;
        overflow-y: auto;
        .scrollbar(4px);
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 92px;
    }

    .m-recipe-subtype,
    .m-recipe-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .m-recipe-title {
        position: sticky;
        top: 0;
        background: var(--black-5);
        color: var(--black-80);

        &.is-active {
            background: var(--Primary-Brand-2);
            color: var(--Primary-Brand-3);
        }
    }
    .m-recipe-title,
    .m-recipe-item {
        width: 100%;
        box-sizing: border-box;
        border: 0;
        text-align: left;
        cursor: pointer;
        padding: 8px;
        font-family: Microsoft YaHei UI;
        font-weight: 700;
        .fz(12px, 18px);
        .r(4px);
    }

    .m-recipe-item {
        display: flex;
        gap: 10px;
        background-color: var(--Primary-Brand-4);
        color: var(--black-80);
        line-height: 24px;

        .u-icon {
            .size(24px);
        }
    }

    .m-recipe-empty {
        display: flex;
        min-height: 180px;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 6px;
        border: 1px dashed var(--manufacture-mobile-line, #e6ebf3);
        border-radius: 14px;
        color: var(--manufacture-mobile-muted, #8da0bd);
        text-align: center;

        strong {
            color: var(--manufacture-mobile-ink, #17233c);
        }
    }
}
</style>
