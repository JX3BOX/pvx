<template>
    <div class="m-manufacture-recipes">
        <div class="m-toolbar">
            <el-input class="u-search" v-model="keyword" placeholder="你想要搜索什么？">
                <template #prefix>
                    <img svg-inline src="@/assets/img/manufacture/search.svg" alt="" />
                </template>
            </el-input>
        </div>
        <div class="m-recipe-list">
            <div class="m-recipe-subtype" v-for="(subtype, index) in recipeTree" :key="index">
                <div
                    class="m-recipe-title"
                    :class="{ 'is-active': subtype.id == currentSubtype }"
                    @click="onClickSubtype(subtype.id)"
                >
                    {{ subtype.name }}
                </div>
                <div class="m-recipe-items" v-if="subtype.id == currentSubtype">
                    <div
                        class="m-recipe-item"
                        v-for="(recipe, index) in subtype.recipes"
                        :key="index"
                        @click="$emit('go-recipe', { recipe_type: craftType.key, recipe_id: recipe.ID })"
                    >
                        <img class="u-icon" :src="iconLink(recipe.IconID)" alt="" />
                        {{ recipe.Name }}
                    </div>
                </div>
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
            .el-input__inner {
                .r(8px);
                border: 1px solid #2828280d;
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
}
</style>
