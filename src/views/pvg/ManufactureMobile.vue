<template>
    <div class="m-manufacture-mobile p-pvx-manufacture-mobile">
        <PvxSurface v-if="page == 'menu'" class="m-manufacture-mobile-hero" padding="small">
            <PvxSectionHeader
                :title="$t('pages.pvg.manufacture.ui.title')"
                :description="$t('pages.pvg.manufacture.ui.description')"
                level="h1"
            >
                <template #icon><Tools /></template>
            </PvxSectionHeader>
        </PvxSurface>
        <PvxSurface v-else class="m-manufacture-mobile-context" padding="none" radius="medium">
            <button type="button" class="u-back" @click="navigateBack">
                <ArrowLeft />
                <span>{{ backLabel }}</span>
            </button>
            <strong class="u-context-title">{{ contextTitle }}</strong>
        </PvxSurface>
        <Menu
            v-if="page == 'menu'"
            :craft-types="craftTypes"
            @go-plan="go('plan')"
            @go-recipe="go('recipe', $event)"
        ></Menu>
        <Recipe
            v-if="page == 'recipe'"
            :craft-type="currentCraftType"
            :craft-subtypes="currentCraftSubTypes"
            :craft-recipes="currentCraftRecipes"
            @go-recipe="go('detail', $event)"
        ></Recipe>
        <RecipeDetail
            v-if="page == 'detail'"
            :recipe="currentRecipe"
            v-loading="recipeLoading"
            @add-cart="onAddCartItem"
        ></RecipeDetail>
        <Plan v-if="page == 'plan'" :plan="plan" @edit-plan="onEditPlan"></Plan>

        <Cart
            v-model="cartVisible"
            :plan="plan"
            :editing="cartEditing"
            @update-plan="onPlanUpdate"
            @close="cartVisible = false"
        />
        <BottomBar v-if="showBottomBar" @go-cart="cartVisible = true" @go-plan="go('plan', $event)"></BottomBar>
    </div>
</template>

<script>
import Menu from "@/components/manufacture/mobile/Menu.vue";
import Recipe from "@/components/manufacture/mobile/Recipe.vue";
import RecipeDetail from "@/components/manufacture/mobile/RecipeDetail.vue";
import Cart from "@/components/manufacture/mobile/Cart.vue";
import BottomBar from "@/components/manufacture/mobile/BottomBar.vue";
import Plan from "@/components/manufacture/mobile/Plan.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import { ArrowLeft, Tools } from "@element-plus/icons-vue";

import { keyBy } from "lodash";
import manufactureData from "@/assets/data/manufacture.json";
import { getCraftJson, getManufactures, getManufactureItem, getItemMerges } from "@/service/manufacture/manufacture";
import { omit, pick } from "lodash";
import { nanoid } from "nanoid";
import { mapGetters } from "vuex";
import { getPlan } from "@/service/manufacture/plan";
const { craft_types } = manufactureData;

export default {
    name: "ManufactureMobile",
    components: { Menu, Recipe, RecipeDetail, Cart, BottomBar, Plan, PvxSurface, PvxSectionHeader, ArrowLeft, Tools },
    props: {},
    data: () => ({
        // 当前页面
        page: "menu",
        // 技艺类型
        craftTypeKey: "tailoring",
        // 技艺子类型
        craftSubType: {},
        // 技艺列表
        craftList: [],
        // 当前选中的技艺
        currentRecipeID: "",
        currentRecipe: {},
        recipeLoading: false,

        cartVisible: false,
        planId: "",
        plan: {},
        cartEditing: false,
    }),
    computed: {
        ...mapGetters(["get_price"]),
        server() {
            return this.$store.state.server;
        },
        showBottomBar() {
            return ["recipe", "detail"].includes(this.page);
        },
        client() {
            return this.$store.state.client;
        },
        craftTypes() {
            return craft_types[this.client];
        },
        currentCraftType() {
            return this.craftTypes.find((item) => item.key == this.craftTypeKey) || {};
        },
        currentCraftSubTypes() {
            if (!this.currentCraftType) return [];
            const subTypes = this.craftSubType[this.client] || [];
            return subTypes.filter((item) => item.ProfessionID == this.currentCraftType.ProfessionID);
        },
        currentCraftRecipes() {
            if (!this.currentCraftType) return [];
            return this.craftList.filter((item) => item.ProfessionID == this.currentCraftType.ProfessionID);
        },
        backLabel() {
            return this.page === "detail"
                ? this.$t("pages.pvg.manufacture.ui.actions.backToRecipes")
                : this.$t("pages.pvg.manufacture.ui.actions.backToCategories");
        },
        contextTitle() {
            if (this.page === "detail") return this.currentRecipe?.Name || this.currentCraftLabel;
            if (this.page === "plan") return this.plan?.title || this.$t("pages.pvg.manufacture.ui.cart.plans");
            return this.currentCraftLabel || this.$t("pages.pvg.manufacture.ui.sections.recipes.title");
        },
        currentCraftLabel() {
            const key = this.currentCraftType?.key;
            if (!key) return "";
            const path = `pages.pvg.manufacture.ui.crafts.${key}`;
            return this.$te(path) ? this.$t(path) : this.currentCraftType?.name || "";
        },
    },
    methods: {
        navigateBack() {
            if (this.page === "detail") {
                this.go("recipe", { craft_type: this.craftTypeKey }, true);
            } else {
                this.go("menu", {}, true);
            }
        },
        go(page, data, replace = false) {
            if (replace) {
                this.$router.replace({
                    query: {
                        page,
                        ...data,
                    },
                });
            } else {
                this.$router.push({
                    query: {
                        page,
                        ...data,
                    },
                });
            }
        },
        applyGo(page, data) {
            this.page = page || "menu";
            this.$nextTick(() => {
                window.scrollTo({ top: 0, behavior: "auto" });
            });
            if (page == "recipe") {
                this.craftTypeKey = data?.craft_type || this.craftTypeKey || "tailoring";
            }
            if (page == "detail") {
                this.craftTypeKey = data?.recipe_type || this.craftTypeKey || "tailoring";
                this.currentRecipeID = data?.recipe_id;
                this.recipeLoading = true;
                this.loadRecipe()
                    .then((recipe) => {
                        this.currentRecipe = recipe;
                    })
                    .catch((e) => {
                        this.$message.error(this.$t("pages.pvg.manufacture.ui.messages.recipeLoadFailed"));
                        this.go("recipe", null, true);
                    })
                    .finally(() => {
                        this.recipeLoading = false;
                    });
            }
            if (page == "plan") {
                this.planId = Number(data?.plan_id) || -1;
                this.loadPlan();
            }
        },
        loadPlan() {
            getPlan(this.planId).then((res) => {
                this.plan = res;
            });
        },
        loadSubtype() {
            getCraftJson().then((res) => {
                this.craftSubType = res.data;
            });
        },
        loadData() {
            getManufactures({
                mode: "simple",
                client: this.client,
            }).then((res) => {
                this.craftList = res.data;
            });
        },
        async loadRecipe() {
            const resp = await getManufactureItem(this.craftTypeKey, this.currentRecipeID, this.client);
            const recipe = resp.data;
            if (!recipe) throw new Error("Recipe not found");
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
            const other_ids = [...materials.map((item) => item.item_id), recipe.item_id].join(",");
            await getItemMerges(this.client, other_ids).then((res) => {
                const items = keyBy(res.data, "id");
                materials.forEach((material) => {
                    const other = items[material.item_id];
                    material.item = other || { item_info: { Name: this.$t("pages.pvg.manufacture.ui.common.unknown") } };
                });
                if (items[recipe.item_id]) {
                    recipe.item = items[recipe.item_id] || {
                        item_info: { Name: this.$t("pages.pvg.manufacture.ui.common.unknown") },
                    };
                }
            });
            this.$store.dispatch("fetch_prices", {
                server: this.server,
                ids: [...materials.map((item) => item.item_id), recipe.item_id],
            });
            recipe.materials = materials;
            recipe.count = 1;
            return recipe;
        },
        onAddCartItem([count, yieldCount]) {
            this.addCartItem(this.currentRecipe, {
                count: count,
                yield_count: yieldCount,
            });
            this.$message.success(
                this.$t("pages.pvg.manufacture.ui.messages.addedToCart", {
                    name: this.currentRecipe?.item?.item_info?.Name || this.currentRecipe?.Name || "",
                })
            );
        },
        addCartItem(recipe = this.currentRecipe, { parent, require_count_unit, count, yield_count } = {}) {
            const materials = recipe.materials.map((item) => {
                return {
                    ...item,
                    price_unit: this.get_price(this.server, item.item_id).price || 0,
                    price_unit_origin: this.get_price(this.server, item.item_id).price || 0,
                    make: false,
                };
            });
            const price_unit = this.get_price(this.server, recipe.item_id).price;
            const payload = {
                recipe: pick(recipe, [
                    "Name",
                    "CreateItemMin1",
                    "CreateItemMax1",
                    "Quality",
                    "IconID",
                    "nLevel",
                    "Exp",
                ]),
                ...pick(recipe, ["item_id", "item"]),
                server: this.server,
                materials: materials,
                count: count || 1,
                yield_count_unit: recipe.CreateItemMin1,
                yield_count: yield_count,
                price_unit: price_unit || 0,
                price_unit_origin: price_unit || 0,
                cost_vigor: recipe.CostVigor || recipe.CostStamina,
                calc_tax: true,
                id: nanoid(),
            };
            if (parent) {
                payload.parent = parent;
                payload.is_material = true;
            }
            if (require_count_unit) {
                payload.require_count_unit = require_count_unit;
            }
            this.$store.commit("cart_push", payload);
        },
        onEditPlan() {
            this.$store.commit("cart_set", this.plan.relation);
            this.cartEditing = true;
            this.cartVisible = true;
        },
        onPlanUpdate() {
            this.loadPlan();
            this.cartEditing = false;
            this.cartVisible = false;
        },
    },
    watch: {
        client: {
            handler() {
                this.loadData();
            },
            immediate: true,
        },
        "$route.query": {
            handler(query) {
                const page = query.page || "menu";
                const data = omit(query, ["page"]);
                this.applyGo(page, data);
            },
            immediate: true,
        },
    },
    mounted() {
        this.loadSubtype();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/manufacture/mobile/var.less";
@import "~@/assets/css/manufacture/mobile/element-override.less";
@import "~@/assets/css/modules/manufacture-mobile-theme.less";

.m-pvg-main {
    padding: 0;
}
.v-miniprogram .m-manufacture-mobile {
    padding-top: 12px;
}
.m-manufacture-mobile {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 78px;
    height: 100vh;
    box-sizing: border-box;

    background-color: var(--background-color);
}
</style>
