<template>
    <div class="m-recipe-detail" v-if="recipe">
        <!-- 配方信息展示 -->
        <div class="m-item">
            <el-popover popper-class="u-icon-popper" placement="right" :visible-arrow="false" trigger="hover">
                <Item :item_id="recipe.item_id" />
                <div class="u-img" slot="reference">
                    <span class="u-amount" v-if="recipe.CreateItemMin1 != recipe.CreateItemMax1">
                        {{ recipe.CreateItemMin1 }}~{{ recipe.CreateItemMax1 }}
                    </span>
                    <span class="u-amount" v-else-if="recipe.CreateItemMin1 != 1">
                        {{ recipe.CreateItemMin1 }}
                    </span>
                    <div
                        class="u-border"
                        :style="{
                            backgroundImage: item_border(recipe.Quality),
                            opacity: recipe.Quality == 5 ? 0.9 : 1,
                        }"
                    ></div>
                    <img :src="iconLink(recipe.IconID)" :alt="recipe.Name" />
                </div>
            </el-popover>

            <div class="m-text">
                <span class="u-name" :class="`u-quality--${recipe.Quality}`">{{ recipe.Name }}</span>
                <div class="u-info">
                    <span>
                        需求等级: <b>{{ recipe.nLevel || "未知" }}</b>
                    </span>
                    <span>
                        消耗精力: <b>{{ recipe.CostVigor || recipe.CostStamina }}</b>
                    </span>
                    <span>
                        经验值: <b>{{ recipe.Exp }}</b>
                    </span>
                </div>
            </div>
        </div>

        <div class="u-price" v-if="client == 'std'">
            [{{ server }}] 昨日平均价格:
            <PriceItem
                :server="server"
                :name="recipe.Name"
                :item_id="recipe.item_id"
                :price="get_price(server, recipe.item_id)"
            />
        </div>

        <template v-if="recipe.szTip">
            <span class="u-desc" v-for="text in textFilter(recipe.szTip)" :key="text">{{ text }}</span>
        </template>
        <div class="u-children" v-if="recipe.materials && recipe.materials.length">
            <el-divider content-position="left">合成所需材料</el-divider>
            <div class="u-child" v-for="(material, index) in recipe.materials" :key="index">
                <el-popover
                    popper-class="u-icon-popper"
                    placement="right"
                    :visible-arrow="false"
                    width="auto"
                    trigger="hover"
                >
                    <Item :item_id="material.item_id" />
                    <div class="u-img" slot="reference">
                        <div
                            class="u-border"
                            :style="{
                                backgroundImage: item_border(material.item.Quality),
                                opacity: material.item.Quality == 5 ? 0.9 : 1,
                            }"
                        ></div>
                        <img :src="iconLink(material.item.item_info.IconID)" :alt="material.item.item_info.Name" />
                    </div>
                </el-popover>

                <div class="u-info">
                    <div class="u-name">
                        <span :class="`u-quality--${material.item.Quality}`"> {{ material.item.item_info.Name }}</span>
                        <span class="u-num"> 数量： {{ material.count || 1 }} </span>
                    </div>
                    <div class="u-price">
                        {{ getPriceType(get_price(server, material.item_id)) }}
                        <PriceItem
                            :server="server"
                            :name="material.item.item_info.Name"
                            :item_id="material.item_id"
                            :price="get_price(server, material.item_id)"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="m-add">
            <el-input-number v-model="recipe.count" :min="1" @click.stop.native></el-input-number>
            <el-button icon="el-icon-shopping-cart-2" type="success" @click="onAddCartItem()"> </el-button>
        </div>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import { __imgPath } from "@/utils/config";
import { pick } from "lodash";
import { nanoid } from "nanoid";

import Item from "@jx3box/jx3box-editor/src/Item.vue";
import PriceItem from "@/components/manufacture/PriceItem.vue";
export default {
    name: "RecipeDetail",
    props: ["recipe", "server"],
    components: { Item, PriceItem },
    data: function () {
        return {
            childrenList: [],
        };
    },
    computed: {
        ...mapGetters(["get_price"]),
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        iconLink,
        // 添加购物车
        onAddCartItem(recipe, { parent, require_count_unit } = {}) {
            recipe = recipe || this.recipe;
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
                server: this.server,
                materials: materials,
                ...pick(recipe, ["item_id", "item", "count"]),
                yield_count_unit: recipe.CreateItemMin1,
                yield_count: recipe.CreateItemMin1 * recipe.count,
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
            this.$emit("addCartItem", payload);
        },

        getPriceType(price) {
            if (price.from == "custom") {
                return "[自定义价格] 单价:";
            } else if (price.from == "npc") {
                return "[NPC出售] 单价:";
            } else {
                return `[${this.server}] 昨日平均单价:`;
            }
        },

        // 描述过滤
        textFilter(str) {
            // 匹配分段
            const regex = /<Text>text="(.*?)"\s*?font=(\d+)\s*?<\/text>/gimsy;
            let matches = [];
            let match;
            while ((match = regex.exec(str))) {
                matches.push(match);
            }

            // 格式化分段
            let result = [];
            for (let group of matches) {
                result.push(group[1].replace(/[\\n]/g, ""));
            }
            result = result.filter(Boolean);
            return result;
        },

        // icon边框
        item_border(id) {
            switch (id) {
                case 3:
                    return `url(${__imgPath}image/item/blue.png)`;
                case 4:
                    return `url(${__imgPath}image/item/purple.png)`;
                case 5:
                    return `url(${__imgPath}image/item/orange.gif)`;
                default:
                    return "";
            }
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/manufacture/recipe.less";
</style>
