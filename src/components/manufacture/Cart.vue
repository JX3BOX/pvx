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
                @click="clearAllCart"
            >
            </el-button>
        </div>
        <div class="m-cart-body">
            <div class="m-cart-scroll">
                <div class="m-cart-list" v-if="cartList.length">
                    <div class="m-item" v-for="(item, index) in cartList" :key="index">
                        <div class="u-header">
                            <el-popover
                                popper-class="u-icon-popper"
                                placement="right"
                                :visible-arrow="false"
                                trigger="hover"
                            >
                                <Item :item_id="item.itemKey" />
                                <div class="u-header-inner" slot="reference">
                                    <div
                                        class="u-border"
                                        :style="{
                                            backgroundImage: item_border(item.Quality),
                                            opacity: item.Quality == 5 ? 0.9 : 1,
                                        }"
                                    ></div>
                                    <img class="u-img" :src="iconLink(item.IconID)" :alt="item.Name" />
                                    <span class="u-title" :class="`u-quality--${item.Quality}`">{{ item.Name }}</span>
                                </div>
                            </el-popover>
                            <i class="el-icon-delete u-del" @click="clearCart(item.ID)"></i>
                        </div>

                        <div class="u-info">
                            <el-divider content-position="left">
                                [ {{ server }} ] - <i class="el-icon-box"></i> 材料成本统计
                            </el-divider>
                            <div class="u-children" v-if="item.children.length">
                                <div class="u-child" v-for="(child, k) in item.children" :key="k">
                                    <el-popover
                                        popper-class="u-icon-popper"
                                        placement="right"
                                        :visible-arrow="false"
                                        trigger="hover"
                                    >
                                        <Item :item_id="child.price_id" />
                                        <div class="u-img" slot="reference">
                                            <img :src="iconLink(child.IconID)" :alt="child.Name" />
                                            <span>
                                                {{ child.Name }}x <b>{{ child.count * item.count }}</b>
                                            </span>
                                        </div>
                                    </el-popover>
                                    <PriceItem
                                        class="u-price-num"
                                        :data="{
                                            Price:
                                                prices[child.ID] * child.count * item.count ||
                                                prices[child.priceID] * child.count * item.count,
                                            Name: child.Name,
                                            id: child.ID,
                                        }"
                                    />
                                </div>
                            </div>
                            <div class="u-item-num">
                                <span>制作次数：</span>
                                <el-input-number
                                    v-model="item.count"
                                    size="mini"
                                    :min="1"
                                    @input="onlyInteger(index, item.count)"
                                    @click.stop.native
                                ></el-input-number>
                            </div>
                            <div class="u-item-num">
                                <span><i class="el-icon-sunny"></i> 消耗精力值：</span>
                                <b>{{ (item.CostVigor || item.CostStamina) * item.count }}</b>
                            </div>
                            <div class="u-item-num">
                                <span><i class="el-icon-coin"></i> 小计金额：</span>
                                <span class="u-price">
                                    <GamePrice class="u-price-num" :price="item.allPrices * item.count" />
                                </span>
                            </div>
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
                        <div class="u-num u-price">
                            <span><i class="el-icon-coin"></i> 消耗金钱：</span>
                            <GamePrice v-if="allPrice" class="u-price-num" :price="allPrice" />
                        </div>
                    </div>
                </div>

                <CreatePlan :list="cartList" @clear="clearAllCart" />
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
import Bus from "@/store/bus.js";
import { cloneDeep } from "lodash";
export default {
    name: "cart",
    props: ["data", "server"],
    components: { GamePrice, Item, CreatePlan, PriceItem },
    data: function () {
        return {
            counts: {},
            cartList: [],
            prices: {},
        };
    },
    computed: {
        allExp() {
            if (!this.cartList.length) return 0;
            let _num = 0;
            let _list = this.cartList.map((el) => {
                return { exp: el.CostVigor || el.CostStamina, count: el.count };
            });
            _list.forEach((item) => {
                _num += item.count * item.exp;
            });
            return _num;
        },
        allPrice() {
            if (!this.cartList.length) return 0;
            return this.cartList
                .map((item) => item.allPrices * item.count)
                .reduce((acc, cur) => {
                    return acc + cur;
                }, 0);
        },
    },

    methods: {
        iconLink,
        // 移除
        clearCart(id) {
            this.cartList = id ? this.cartList.filter((item) => item.ID !== id) : [];
        },
        // 全部清空
        clearAllCart() {
            this.cartList = [];
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
    },
    watch: {
        data: {
            deep: true,
            handler: function (item) {
                item = cloneDeep(item);
                const hasItem = this.cartList.some((cart) => cart.ID == item.ID);
                item.allPrices = this.itemPrices(item.children) || 0;

                hasItem
                    ? this.cartList.forEach((cart) => {
                          if (item.ID == cart.ID) cart.count += item.count;
                      })
                    : this.cartList.push(item);
            },
        },
        prices: {
            deep: true,
            handler: function () {
                this.cartList = this.cartList.map((item) => {
                    item.allPrices = this.itemPrices(item.children) || 0;
                    return item;
                });
            },
        },
    },
    mounted() {
        Bus.$on("itemPrice", (data) => {
            this.prices = data;
        });
    },
};
</script>
<style lang="less">
@import "~@/assets/css/manufacture/cart.less";
</style>
<style lang="less" scoped>
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
    .u-item-num.no-profit {
        .bold;
        color: #f56c6c;
    }
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
