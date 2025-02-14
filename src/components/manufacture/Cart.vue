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
                            <el-popover
                                class="u-header-title"
                                popper-class="u-icon-popper"
                                placement="right"
                                :visible-arrow="false"
                                trigger="hover"
                            >
                                <Item :item_id="item.item_id" />
                                <div class="u-header-inner" slot="reference">
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
                            </el-popover>
                            <i
                                class="u-del"
                                :class="item.fold ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
                                @click="$set(item, 'fold', !item.fold)"
                            ></i>
                            <i class="el-icon-delete u-del" @click="onRemove(item)"></i>
                        </div>

                        <div class="u-info">
                            <el-divider content-position="left" v-if="!item.fold">
                                [ {{ item.server }} ] - <i class="el-icon-box"></i> 材料成本统计
                            </el-divider>
                            <div class="u-children" v-if="item.materials.length && !item.fold">
                                <div class="u-child" v-for="(material, k) in item.materials" :key="k">
                                    <el-popover
                                        popper-class="u-icon-popper"
                                        placement="right"
                                        :visible-arrow="false"
                                        trigger="hover"
                                    >
                                        <Item :item_id="material.item_id" />
                                        <div class="u-img" slot="reference">
                                            <img
                                                :src="iconLink(material.item.item_info.IconID)"
                                                :alt="material.item.item_info.Name"
                                            />
                                            <span>
                                                <span :class="`u-quality--${item.item.Quality}`">{{
                                                    material.item.item_info.Name
                                                }}</span>
                                                x
                                                <b>{{ material.count * item.count }}</b>
                                            </span>
                                        </div>
                                    </el-popover>
                                    <PriceItem
                                        class="u-price-num"
                                        :price="material.price"
                                        :origin_price="material.origin_price || 0"
                                        :name="material.item.item_info.Name"
                                        type="cart"
                                        @update_price="material.price = $event"
                                    />
                                </div>
                            </div>
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

                            <el-popover placement="top" trigger="hover" popper-class="m-price-popper" width="320">
                                <div class="u-price-detail">
                                    <div class="u-item-num">
                                        <span><i class="el-icon-coin"></i> 预计售价：</span>
                                        <span class="u-price">
                                            <PriceItem
                                                class="u-price-num"
                                                :price="item.price * item.count || 0"
                                                :origin_price="item.origin_price * item.count || 0"
                                                :name="item.recipe.Name"
                                                type="cart"
                                                @update_price="item.price = $event"
                                                :align="true"
                                            />
                                        </span>
                                    </div>
                                    <div class="u-item-num">
                                        <span><i class="el-icon-coin"></i> 项目成本：</span>
                                        <span class="u-price">
                                            <GamePrice
                                                class="u-price-num"
                                                :price="-calcCartItemCostPrice(item)"
                                                :align="true"
                                            />
                                        </span>
                                    </div>
                                    <div
                                        class="u-item-num"
                                        :class="{ 'no-padding': item.fold, 'is-cancel': !item.calc_tax }"
                                    >
                                        <span class="u-label"><i class="el-icon-coin"></i> 交易行税：</span>
                                        <span class="u-price">
                                            <i
                                                class="u-edit"
                                                :class="item.calc_tax ? 'el-icon-close' : 'el-icon-refresh-left'"
                                                title="取消税收"
                                                @click.stop="item.calc_tax = !item.calc_tax"
                                            ></i>
                                            <GamePrice
                                                class="u-price-num"
                                                :price="-calcCartItemTax(item)"
                                                :align="true"
                                            />
                                        </span>
                                    </div>
                                    <div
                                        class="u-item-num"
                                        :class="{
                                            'no-profit': calcCartItemProfit(item) < 0,
                                        }"
                                    >
                                        <span><i class="el-icon-coin"></i> 预计收益：</span>
                                        <span class="u-price">
                                            <GamePrice
                                                class="u-price-num"
                                                :price="calcCartItemProfit(item)"
                                                :align="true"
                                            />
                                        </span>
                                    </div>
                                </div>
                                <template #reference>
                                    <div
                                        class="u-item-num"
                                        :class="{
                                            'no-padding': item.fold,
                                            'no-profit': calcCartItemProfit(item) < 0,
                                        }"
                                    >
                                        <span><i class="el-icon-coin"></i> 预计收益：</span>
                                        <span class="u-price">
                                            <GamePrice
                                                class="u-price-num"
                                                :price="calcCartItemProfit(item)"
                                                :align="true"
                                            />
                                        </span>
                                    </div>
                                </template>
                            </el-popover>
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
                        <el-popover placement="top" trigger="hover" popper-class="m-price-popper" width="320">
                            <div class="u-price-detail">
                                <div class="u-item-num">
                                    <span><i class="el-icon-coin"></i> 预计售价：</span>
                                    <span class="u-price">
                                        <GamePrice class="u-price-num" :price="allPrice" :align="true" />
                                    </span>
                                </div>
                                <div class="u-item-num">
                                    <span><i class="el-icon-coin"></i> 材料成本：</span>
                                    <span class="u-price">
                                        <GamePrice class="u-price-num" :price="-allCostPrice" :align="true" />
                                    </span>
                                </div>
                                <div class="u-item-num">
                                    <span><i class="el-icon-coin"></i> 交易行税：</span>
                                    <span class="u-price">
                                        <GamePrice class="u-price-num" :price="-allTax" :align="true" />
                                    </span>
                                </div>
                                <div class="u-item-num">
                                    <span><i class="el-icon-coin"></i> 预期收益：</span>
                                    <span class="u-price">
                                        <GamePrice class="u-price-num" :price="allProfit" :align="true" />
                                    </span>
                                </div>
                            </div>
                            <template #reference>
                                <div
                                    class="u-num u-price"
                                    :class="{
                                        'no-profit': allProfit < 0,
                                    }"
                                >
                                    <span><i class="el-icon-coin"></i> 预期收益：</span>
                                    <GamePrice class="u-price-num" :price="allProfit" :align="true" />
                                </div>
                            </template>
                        </el-popover>
                    </div>
                </div>

                <CreatePlan :list="cartList" @clear="onRemove()" />
            </div>
        </div>
    </div>
</template>
<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import Item from "@jx3box/jx3box-editor/src/Item.vue";
import PriceItem from "@/components/manufacture/PriceItem.vue";
import CreatePlan from "@/components/manufacture/CreatePlan.vue";

export default {
    name: "cart",
    components: { GamePrice, Item, CreatePlan, PriceItem },
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
                .map((item) => this.calcCartItemTax(item))
                .reduce((acc, cur) => {
                    return acc + cur;
                }, 0);
        },
        allProfit() {
            if (!this.cartList.length) return 0;
            return this.cartList
                .map((item) => this.calcCartItemProfit(item))
                .reduce((acc, cur) => {
                    return acc + cur;
                }, 0);
        },
    },

    methods: {
        iconLink,
        // 移除
        onRemove(item) {
            if (!item) this.cartList = [];
            this.cartList = this.cartList.filter((i) => i !== item);
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
                        return material.price;
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
.m-price-popper {
    .u-item-num {
        .flex;
        .fz(13px);
        .pt(10px);
        align-items: center;
        word-break: keep-all;

        &:last-of-type {
            padding-top: 30px;
        }

        &.is-cancel .u-label {
            text-decoration: line-through;
            color: #999;
        }

        .u-edit {
            .pointer;
            color: #08cfd9;
        }

        .u-price {
            flex-grow: 1;
            width: 0;
            text-align: right;
        }
    }
}
.m-cart-body .m-item {
    .u-item-num.no-padding {
        padding-top: 0;
    }

    .u-header-inner {
        display: flex;
        align-items: center;
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
