<template>
    <div class="m-manufacture-cart">
        <div class="m-manufacture-title">
            <span class="u-title">成本计算器</span>
            <el-button
                v-if="cartList.length"
                class="u-del"
                plain
                type="info"
                size="mini"
                icon="el-icon-delete"
                @click="onRemove()"
            >
            </el-button>
        </div>
        <div class="m-cart-body">
            <div class="m-cart-scroll">
                <div class="m-cart-list" v-if="cartList.length">
                    <div class="m-item" v-for="(item, index) in cartList" :key="index">
                        <div class="u-header">
                            <div class="u-header-inner">
                                <div
                                    class="u-border"
                                    :style="{
                                        backgroundImage: item_border(item.item.Quality),
                                        opacity: item.item.Quality == 5 ? 0.9 : 1,
                                    }"
                                ></div>
                                <img
                                    class="u-img"
                                    :src="iconLink(item.item.item_info.IconID)"
                                    :alt="item.item.item_info.Name"
                                />
                                <span class="u-title" :class="`u-quality--${item.item.Quality}`">{{
                                    item.item.item_info.Name
                                }}</span>
                                <span v-if="item.fold"> x {{ item.count }} </span>
                            </div>
                            <i
                                class="u-del"
                                :class="item.fold ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
                                @click="$set(item, 'fold', !item.fold)"
                            ></i>
                            <i v-if="!item.is_material" class="el-icon-delete u-del" @click="onRemove(item)"></i>
                        </div>

                        <div class="u-info">
                            <el-divider content-position="left" v-if="!item.fold">
                                [ {{ item.server }} ] - <i class="el-icon-box"></i> 材料成本统计
                            </el-divider>
                            <!-- 材料列表 -->
                            <div class="u-children" v-if="item.materials.length && !item.fold">
                                <div class="u-child" v-for="(material, k) in item.materials" :key="k">
                                    <div class="u-img">
                                        <el-popover
                                            popper-class="u-icon-popper"
                                            placement="right"
                                            :visible-arrow="false"
                                            trigger="hover"
                                        >
                                            <Item :item_id="material.item_id" />
                                            <img
                                                slot="reference"
                                                :src="iconLink(material.item.item_info.IconID)"
                                                :alt="material.item.item_info.Name"
                                            />
                                        </el-popover>

                                        <span>
                                            <span :class="`u-quality--${material.item.Quality}`">{{
                                                material.item.item_info.Name
                                            }}</span>
                                            x
                                            <b>{{ material.count * item.count }}</b>
                                        </span>
                                    </div>

                                    <!-- 手搓/购买 模式切换 -->
                                    <template v-if="canMake(material)">
                                        <el-tooltip
                                            effect="dark"
                                            :content="material.make ? '改为购买' : '改为手搓'"
                                            placement="bottom"
                                        >
                                            <i
                                                class="u-button el-icon-scissors"
                                                :class="{ 'is-active': material.make }"
                                                @click="onSwitchMaterialSource(item, material)"
                                            ></i>
                                        </el-tooltip>
                                    </template>
                                    <PriceItem
                                        v-if="!material.make"
                                        class="u-price-num"
                                        :price="material.price"
                                        :origin_price="material.origin_price || 0"
                                        :name="material.item.item_info.Name"
                                        type="cart"
                                        @update_price="material.price = $event"
                                    />

                                    <GamePrice
                                        v-else
                                        class="u-price-num"
                                        :class="{ 'is-make': material.make }"
                                        :price="material.price"
                                    ></GamePrice>
                                </div>
                            </div>
                            <!-- 底部 -->
                            <div class="u-item-num" v-if="!item.fold">
                                <span>制作次数：</span>
                                <el-input-number
                                    v-model="item.count"
                                    size="mini"
                                    :min="1"
                                    @input="onlyInteger(index, item.count)"
                                    @click.stop.native
                                ></el-input-number>
                            </div>
                            <div class="u-item-num" v-if="!item.fold">
                                <span><i class="el-icon-sunny"></i> 消耗精力值：</span>
                                <b>{{ item.cost_vigor * item.count }}</b>
                            </div>
                            <div v-if="item.is_material" class="u-item-num">
                                <span><i class="el-icon-coin"></i> 预计花费：</span>
                                <span class="u-price">
                                    <GamePrice class="u-price-num" :price="calcCartItemCostPrice(item)" :align="true" />
                                </span>
                            </div>
                            <price-detail
                                v-else
                                :price="item.price * item.count"
                                :origin_price="item.origin_price * item.count"
                                :price_name="item.recipe.Name"
                                :cost="-calcCartItemCostPrice(item)"
                                :tax="-calcCartItemTax(item)"
                                :profit="calcCartItemProfit(item)"
                                :tax_mutable="true"
                                :price_mutable="true"
                                :calc_tax="item.calc_tax"
                                @update_price="item.price = $event"
                                @update_tax="item.calc_tax = $event"
                            ></price-detail>
                        </div>
                    </div>
                </div>
                <div class="m-null" v-else>- 暂未添加生产配方 -</div>
            </div>

            <div class="m-stat">
                <div class="m-all">
                    <div class="u-label">总计</div>
                    <div class="u-value">
                        <div class="u-num">
                            <span><i class="el-icon-sunny"></i> 消耗精力值：</span>
                            <b>{{ allExp }}</b>
                        </div>
                        <price-detail
                            :price="allPrice"
                            :cost="-allCostPrice"
                            :tax="allTax"
                            :profit="allProfit"
                        ></price-detail>
                    </div>
                </div>

                <CreatePlan :list="cartList" @clear="onRemove()" />
            </div>
        </div>
    </div>
</template>
<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import Item from "@jx3box/jx3box-editor/src/Item.vue";
import PriceItem from "@/components/manufacture/PriceItem.vue";
import CreatePlan from "@/components/manufacture/CreatePlan.vue";
import PriceDetail from "@/components/manufacture/PriceDetail.vue";
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";

export default {
    name: "cart",
    components: { Item, GamePrice, CreatePlan, PriceItem, PriceDetail },
    props: ["craftList"],
    data: function () {
        return {
            cartList: [],
        };
    },
    computed: {
        allExp() {
            if (!this.cartList.length) return 0;
            return this.cartList
                .map((item) => item.cost_vigor * item.count)
                .reduce((acc, cur) => {
                    return acc + cur;
                }, 0);
        },
        allPrice() {
            if (!this.cartList.length) return 0;
            return this.cartList.reduce((acc, cur) => {
                if (cur.is_material) return acc;
                return acc + (cur.price || 0);
            }, 0);
        },
        allCostPrice() {
            if (!this.cartList.length) return 0;
            return this.cartList
                .map((item) => this.calcCartItemCostPrice(item))
                .reduce((acc, cur) => {
                    return acc + cur;
                }, 0);
        },
        allTax() {
            if (!this.cartList.length) return 0;
            return this.cartList
                .map((item) => (item.is_material ? 0 : this.calcCartItemTax(item)))
                .reduce((acc, cur) => {
                    return acc + cur;
                }, 0);
        },
        allProfit() {
            if (!this.cartList.length) return 0;
            return this.cartList
                .map((item) => (item.is_material ? 0 : this.calcCartItemProfit(item)))
                .reduce((acc, cur) => {
                    return acc + cur;
                }, 0);
        },

        crafts() {
            return this.craftList
                .map((item) => item.list)
                .reduce((acc, cur) => {
                    return acc.concat(cur);
                }, []);
        },
    },

    methods: {
        iconLink,
        // 移除
        onRemove(item) {
            if (!item) this.cartList = [];
            const materials = this.cartList.filter((i) => i.parent === item.id);
            this.cartList = this.cartList.filter((i) => i !== item && !materials.includes(i));
        },
        // 材料价格
        itemPrices(children) {
            return children
                .map((item) => {
                    let num = 0;
                    if (this.prices[item.priceID]) num = item.count * this.prices[item.priceID];
                    if (this.prices[item.ID]) num = item.count * this.prices[item.ID];

                    return num;
                })
                .reduce((acc, cur) => {
                    return acc + cur;
                }, 0);
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
        onlyInteger(index, number) {
            number = number + "";
            number = number.replace(/[^\.\d]/g, "");
            number = number.replace(".", "");
            this.cartList[index].count = ~~number;
        },
        add(recipe) {
            this.cartList.push(recipe);
        },
        calcCartItemCostPrice(item) {
            return (
                item.materials
                    .map((material) => {
                        return material.make ? 0 : material.price;
                    })
                    .reduce((acc, cur) => {
                        return acc + cur;
                    }, 0) * item.count
            );
        },
        calcCartItemTax(item) {
            return item.price * item.count * 0.05;
        },
        calcCartItemProfit(item) {
            const profit = item.price * item.count - this.calcCartItemCostPrice(item);
            if (item.calc_tax) return profit - this.calcCartItemTax(item);
            return profit;
        },
        canMake(material) {
            return this.crafts.some((item) => {
                return item.item_id == material.item_id;
            });
        },
        onSwitchMaterialSource(item, material) {
            // 如果当前是购买的
            if (!material.make) {
                const recipe = this.crafts.find((i) => i.item_id == material.item_id);
                // 切换为手搓
                material.make = true;
                // 获取材料的工艺以及相关物品价格，添加为新的cartItem
                this.$emit("material-make", { item, material, recipe, require_count: material.count * item.count });
            } else {
                // 切换为购买
                material.make = false;
                // 移除清单中的材料
                this.cartList = this.cartList.filter((i) => i.parent !== item.id);
            }
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/manufacture/cart.less";
</style>
<style lang="less" scoped>
.no-profit {
    .bold;
    color: #f56c6c;
}
.m-manufacture-title {
    justify-content: space-between;
    .u-del {
        .mr(10px);
    }
}
.m-cart-list .m-item:first-of-type .u-header {
    padding-top: 0;
}
.m-cart-body .m-item {
    .u-item-num.no-padding {
        padding-top: 0;
    }

    .u-header-inner {
        display: flex;
        align-items: center;
        flex-grow: 1;
        gap: 8px;
    }
    .u-header {
        display: flex;
        align-items: center;
        gap: 10px;
        .u-header-title {
            flex-grow: 1;
        }
        .u-del {
            color: #999;
            &:hover {
                background: none;
                border: 0;
                .pointer;
                color: #000;
            }
        }
    }
}
</style>
