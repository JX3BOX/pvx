<template>
    <div class="m-manufacture-recipe">
        <div class="m-recipe-list">
            <span class="m-recipe-group" v-for="(item, i) in list" :key="i">
                <span :class="['m-list m-title', { active: i == showIndex }]" @click="changeIndex(i)">
                    <span class="u-name">
                        <i :class="i == showIndex ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i>
                        {{ item.BelongName }}
                    </span>
                </span>
                <span
                    v-show="showIndex == i"
                    :class="['m-list', { active: itemId == _list.ID }, `u-quality-bg--${_list.Quality}`]"
                    v-for="(_list, k) in item.list"
                    :key="k"
                    @click="changeItem(_list.ID)"
                >
                    <span class="u-item">
                        <img class="u-img" :src="iconLink(_list.IconID)" :alt="_list.Name" /> {{ _list.Name }}</span
                    >
                    <div class="m-add" v-if="itemId == _list.ID">
                        <el-input-number
                            v-model.number="recipe.count"
                            size="small"
                            :min="1"
                            @input="onlyInteger"
                            @click.stop.native
                        ></el-input-number>
                        <el-button icon="el-icon-shopping-cart-2" size="small" @click="addCartItem"> </el-button>
                    </div>
                </span>
            </span>
        </div>
        <RecipeDetail ref="recipe-detail" v-loading="loading" :recipe="recipe" :server="server" v-on="$listeners" />
    </div>
</template>
<script>
import { keyBy } from "lodash";
import { getManufactureItem, getOther } from "@/service/manufacture/manufacture";
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import RecipeDetail from "@/components/manufacture/RecipeDetail.vue";

export default {
    name: "Recipe",
    props: ["list", "craftKey", "server"],
    data: function () {
        return {
            showIndex: 0,
            recipe: {},
            loading: false,
            children: [],
            prices: {},
            itemId: 0,
        };
    },
    components: { RecipeDetail },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        iconLink,
        loadItem(id) {
            this.loading = true;
            this.getRecipe(this.craftKey, id, this.client)
                .then((recipe) => {
                    this.recipe = recipe;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        async getRecipe(craftType, id, client) {
            const resp = await getManufactureItem(craftType, id, client);
            const recipe = resp.data;
            const materials = [];
            // 获取材料列表
            recipe.item_id = recipe.CreateItemType1 + "_" + recipe.CreateItemIndex1;
            for (let i = 1; i <= 8; i++) {
                if (recipe[`RequireItemIndex${i}`]) {
                    materials.push({
                        item_id: recipe[`RequireItemType${i}`] + "_" + recipe[`RequireItemIndex${i}`],
                        count: recipe[`RequireItemCount${i}`],
                    });
                } else {
                    break;
                }
            }
            // 获取材料列表，并且把材料信息写到 materials
            const other_ids = [
                ...materials.map((item) => item.item_id.split("_").pop()),
                recipe.item_id.split("_").pop(),
            ].join(",");
            await getOther({ client: this.client, ids: other_ids, per: materials.length + 1 }).then((res) => {
                const others = keyBy(res.data.list, (item) => `5_${item.ID}`);
                materials.forEach((material) => {
                    const other = others[material.item_id];
                    material.item = other || { item_info: { Name: "未知" } };
                });
                if (others[recipe.item_id]) {
                    recipe.item = others[recipe.item_id] || { item_info: { Name: "未知" } };
                }
            });
            // 让store拿价格
            await this.$store.dispatch("fetch_prices", {
                server: this.server,
                ids: [...materials.map((item) => item.item_id), recipe.item_id],
            });

            recipe.materials = materials;
            recipe.count = 1;
            return recipe;
        },
        // 切换分类
        changeIndex(i) {
            this.showIndex = this.showIndex == i ? -1 : i;
        },
        // 切换物品
        changeItem(id) {
            if (id == this.itemId) return;
            this.itemId = id;
            this.loadItem(id);
        },
        addCartItem() {
            const data = { ...this.recipe, children: this.children };
            this.$emit("addCartItem", data);
        },
        onlyInteger() {
            const number = String(this.recipe.count)
                .replace(/[^\.\d]/g, "")
                .replace(".", "");
            this.recipe.count = ~~number;
        },
        async addCartItemAsMaterial({ item, recipe: _recipe, require_count, require_count_unit }) {
            const recipe = await this.getRecipe(this.craftKey, _recipe.ID, this.client);
            const count = Math.ceil(require_count / recipe.CreateItemMin1);
            recipe.count = count;
            this.$refs["recipe-detail"].onAddCartItem(recipe, {
                parent: item.id,
                require_count_unit
            });
        },
    },
    watch: {
        list: {
            deep: true,
            handler: function (_list) {
                if (_list.length && _list[0].list.length) this.changeItem(_list[0].list[0].ID);
            },
        },
        server() {
            this.loadItem(this.itemId);
        },
        craftKey() {
            this.showIndex = 0;
        },
    },
};
</script>
<style lang="less">
.m-manufacture-recipe {
    .flex;
    .mr(10px);
    .m-recipe-list {
        .w(460px);
        .flex;
        .pr(10px);
        .mr(20px);
        overflow: auto;
        flex-direction: column;
        gap: 20px;
        height: calc(100vh - 294px);
    }
    .m-recipe-group {
        .flex;
        .color(#000);
        flex-direction: column;
        gap: 10px;
        .m-list {
            .flex;
            .size(100%,50px);
            .r(10px);
            .pointer;
            .fz(14px);
            justify-content: space-between;
            box-sizing: border-box;
            gap: 10px;
            background-color: #fff;
            padding: 0 20px;
            align-items: center;
            .u-item {
                .flex;
                gap: 10px;
                align-items: center;
            }

            &.active,
            &:hover {
                .bold;
                color: #fff;
                background: rgba(50, 65, 72, 0.3);
                &.u-quality-bg--0 {
                    background: rgba(50, 65, 72, 0.3);
                }
                &.u-quality-bg--1 {
                    background: @color;
                }
                &.u-quality-bg--2 {
                    background: #07ad36;
                }
                &.u-quality-bg--3 {
                    background: #3d83d3;
                }
                &.u-quality-bg--4 {
                    background: #b242da;
                }
                &.u-quality-bg--5 {
                    background: #f8983f;
                }
                &.u-quality-bg--6 {
                    background: #c00;
                }
            }
            &.m-title {
                .h(38px);
                .fz(16px);
                &.active,
                &:hover {
                    background: #24292e;
                }
                .u-name {
                    .flex;
                    gap: 10px;
                    align-items: center;
                }
            }
            .u-img {
                .size(30px);
            }
            .m-add {
                .flex;
                gap: 10px;
            }
        }
    }
    .m-recipe-detail {
        .w(460px);
        .r(10px);
        box-sizing: border-box;
        background-color: #fff;
    }
}
</style>
