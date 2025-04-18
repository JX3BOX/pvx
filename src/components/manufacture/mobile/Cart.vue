<template>
    <el-drawer
        :with-header="false"
        direction="btt"
        wrapper-closable
        append-to-body
        modal-append-to-body
        custom-class="m-manufacture-cart"
        @close="$emit('close')"
        v-bind="$attrs"
    >
        <div class="m-manufacture-cart-body">
            <div class="m-title">成本计算器</div>
            <div class="m-stat">
                <div class="m-stat-item">
                    <div class="u-title">精力</div>
                    <div class="u-value">{{ totalVigorCost }}</div>
                </div>
                <div class="m-stat-item">
                    <div class="u-title">售价(总)</div>
                    <div class="u-value">
                        <GamePrice :price="totalPrice" :align="true"></GamePrice>
                    </div>
                </div>
                <div class="m-stat-item">
                    <div class="u-title">税收</div>
                    <GamePrice :price="totalTax" :align="true"></GamePrice>
                </div>
                <div class="m-stat-item">
                    <div class="u-title">成本(总)</div>
                    <GamePrice :price="totalCostPrice" :align="true"></GamePrice>
                </div>
                <div class="m-stat-item">
                    <div class="u-title">预计收益(总)</div>
                    <GamePrice :price="totalProfit" :align="true"></GamePrice>
                </div>
            </div>
            <div class="m-save-button" @click="onSave">保存至清单</div>
            <div class="m-title">配方列表</div>
            <div class="m-cart-list">
                <div class="m-cart-item" v-for="(item, index) in cartList" :key="index">
                    <div class="u-header">
                        <img
                            class="u-icon"
                            :src="iconLink(item.item.item_info.IconID)"
                            :alt="item.item.item_info.Name"
                        />
                        <div class="u-name">{{ item.item.item_info.Name }}</div>
                        <div class="u-count">
                            <span>x{{ item.count }}</span>
                            <span class="u-make-count">({{ item.yield_count }})</span>
                        </div>
                        <div class="u-edit" @click="onEditItem(item)">
                            <img svg-inline src="@/assets/img/manufacture/edit.svg" alt="" />
                        </div>
                    </div>
                    <div class="m-materials">
                        <div class="m-material-item" v-for="(material, k) in item.materials" :key="k">
                            <img
                                class="u-icon"
                                :src="iconLink(material.item.item_info.IconID)"
                                :alt="material.item.item_info.Name"
                            />
                            <div class="u-name">{{ material.item.item_info.Name }}</div>
                            <div class="u-count">
                                <span>x{{ material.count * item.count }}</span>
                            </div>
                            <div class="u-price">
                                <GamePrice
                                    :price="material.price_unit * item.count * material.count"
                                    :align="true"
                                ></GamePrice>
                            </div>
                        </div>
                    </div>
                    <div class="m-stat m-stat__cart-item">
                        <div class="m-stat-item">
                            <div class="u-title">精力</div>
                            <div class="u-value">
                                {{ item.cost_vigor }}
                                <span v-if="item.count > 1">({{ calcItemVigorCost(item) }})</span>
                            </div>
                        </div>
                        <div class="m-stat-item">
                            <div class="u-title">售价(总)</div>
                            <div class="u-value">
                                <GamePrice :price="item.price_unit * item.yield_count" :align="true"></GamePrice>
                            </div>
                        </div>
                        <div class="m-stat-item">
                            <div class="u-title">税收</div>
                            <div class="u-value">
                                <GamePrice :price="calcItemTax(item)" :align="true"></GamePrice>
                            </div>
                        </div>
                        <div class="m-stat-item">
                            <div class="u-title">成本(总)</div>
                            <div class="u-value">
                                <GamePrice :price="calcItemCostPrice(item)" :align="true"></GamePrice>
                            </div>
                        </div>
                        <div class="m-stat-item">
                            <div class="u-title">预计收益(总)</div>
                            <div class="u-value">
                                <GamePrice :price="calcItemProfit(item)" :align="true"></GamePrice>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="m-save-button" @click="onSave">保存至清单</div>
        </div>
        <AskDrawerVue ref="ask-drawer"></AskDrawerVue>
        <RecipeChangeCountVue ref="change-count"></RecipeChangeCountVue>
        <PriceUpdateDrawerVue ref="price-change"></PriceUpdateDrawerVue>
        <CartItemVue ref="cart-item"></CartItemVue>
        <InputDrawerVue ref="input-drawer"></InputDrawerVue>
    </el-drawer>
</template>

<script>
import { addMyPlan, updatePlan } from "@/service/manufacture/plan";
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import { sumBy } from "lodash";
import RecipeChangeCountVue from "./RecipeChangeCount.vue";
import PriceUpdateDrawerVue from "./PriceUpdateDrawer.vue";
import AskDrawerVue from "./AskDrawer.vue";
import CartItemVue from "./CartItem.vue";
import InputDrawerVue from "./InputDrawer.vue";
import dayjs from "dayjs";

export default {
    name: "ManufactureCartMobile",
    components: { GamePrice, RecipeChangeCountVue, PriceUpdateDrawerVue, AskDrawerVue, CartItemVue, InputDrawerVue },
    props: {
        plan: {
            type: Object,
            default: () => ({}),
        },
        editing: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({}),
    computed: {
        cartList() {
            return this.$store.state.cart_list || [];
        },
        totalVigorCost() {
            return sumBy(this.cartList, (item) => {
                return this.calcItemVigorCost(item);
            });
        },
        totalPrice() {
            return sumBy(this.cartList, (item) => {
                return item.price_unit * item.yield_count;
            });
        },
        totalCostPrice() {
            return sumBy(this.cartList, (item) => {
                return this.calcItemCostPrice(item);
            });
        },
        totalTax() {
            return sumBy(this.cartList, (item) => {
                if (item.is_material) return 0;
                return this.calcItemTax(item);
            });
        },
        totalProfit() {
            return sumBy(this.cartList, (item) => {
                return this.calcItemProfit(item);
            });
        },
    },
    methods: {
        iconLink,
        calcItemVigorCost(item) {
            return item.cost_vigor * item.count;
        },
        calcItemCostPrice(item) {
            return (
                sumBy(item.materials, (material) => {
                    if (material.make) {
                        return 0;
                    } else {
                        return material.price_unit * material.count;
                    }
                }) * item.count
            );
        },
        calcItemTax(item) {
            return item.price_unit * item.yield_count * 0.05;
        },
        calcItemProfit(item) {
            const profit = item.price_unit * item.yield_count - this.calcItemCostPrice(item);
            if (item.calc_tax) return profit - this.calcItemTax(item);
            return profit;
        },
        onEditItem(item) {
            this.$refs["ask-drawer"]
                .open()
                .then((type) => {
                    if (type == "count") {
                        this.$refs["change-count"]
                            .open({
                                count: item.count,
                                yield_count: item.yield_count,
                                yield_count_min: item.recipe.CreateItemMin1,
                                yield_count_max: item.recipe.CreateItemMax1,
                            })
                            .then((res) => {
                                const [count, yield_count] = res;
                                item.count = count;
                                item.yield_count = yield_count;
                            });
                    } else if (type == "price") {
                        this.$refs["cart-item"].open(item);
                    } else if (type == "delete") {
                        this.$store.commit("cart_delete", item);
                    }
                })
                .catch(() => {});
        },
        onSave() {
            this.$refs["input-drawer"]
                .open({
                    value: this.editing ? this.plan.title : `新建清单 ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
                })
                .then((res) => {
                    if (this.editing) {
                        const payload = {
                            relation: this.cartList,
                        };
                        return updatePlan(this.plan.id, payload);
                    } else {
                        const payload = {
                            title: res,
                            relation: this.cartList,
                            type: 3,
                            public: 1,
                        };
                        return addMyPlan(payload);
                    }
                })
                .then((res) => {
                    if (!res) return;
                    this.$message({
                        message: "保存成功",
                        type: "success",
                    });
                    this.$store.commit("cart_flush");
                    if (this.editing) {
                        this.$emit("update-plan", res);
                    } else {
                        this.$emit("add-plan", res);
                    }
                })
                .catch(() => {});
        },
    },
};
</script>

<style lang="less">
.m-manufacture-cart-body {
    max-height: 350px;
    overflow-y: auto;
    .scrollbar;
    display: flex;
    flex-direction: column;
    gap: 16px;
    .fz(12px, 18px);

    .m-title {
        color: var(--black-80, rgba(28, 28, 28, 0.8));
        font-weight: 700;
    }
    .m-stat {
        display: flex;
        padding: 12px;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        border-radius: 8px;
        background: var(--Primary-Brand-2, #24292e);

        .m-stat-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .w(100%);

            color: var(--Primary-Brand-3, #fedaa3);
            .c-game-price {
                .u-value::before {
                    color: var(--Primary-Brand-3, #fedaa3);
                    opacity: 0.2;
                }
            }

            font-weight: 700;

            .u-value {
                font-weight: 400;
            }
        }
    }
    .m-stat__cart-item {
        width: 100%;
        background: transparent;

        .m-stat-item {
            .u-title {
                color: var(--black-80, rgba(28, 28, 28, 0.8));
            }
            .u-value {
                color: var(--black-40, rgba(28, 28, 28, 0.4));
            }
            .c-game-price {
                .u-value::before {
                    color: var(--black-40, #fedaa3);
                    opacity: 0.2;
                }
            }
        }
    }
    .m-save-button {
        display: flex;
        height: 40px;
        padding: 0px 12px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
        border-radius: 8px;
        background: var(--Primary-Brand-2, #fedaa3);

        color: var(--Primary-Brand-3, #fedaa3);
        font-weight: 700;
    }
    .m-cart-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .m-cart-item {
        border-radius: 8px;
        background: var(--black-5, rgba(255, 255, 255, 0.1));
        display: flex;
        flex-direction: column;
        padding: 12px;
        align-items: center;
        gap: 12px;

        .u-header {
            width: 100%;
            display: flex;
            gap: 8px;
            align-items: center;
            .u-icon {
                .size(24px);
                .r(4px);
            }
            .u-name {
                flex-grow: 1;
            }
            .u-name,
            .u-count {
                color: var(--black-80, rgba(28, 28, 28, 0.8));
                .fz(14px, 20px);
                font-weight: 700;
            }
            .u-make-count,
            .u-edit {
                color: var(--black-40, rgba(28, 28, 28, 0.4));
            }
            .u-edit {
                .size(18px);
            }
        }
    }
    .m-materials {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        padding: 12px 0;
        .pr;
        &::before,
        &::after {
            .pa;
            content: "";
            left: calc(50% - 80px);
            width: 160px;
            height: 1px;
            background: var(--black-5, rgba(255, 255, 255, 0.1));
        }
        &::after {
            bottom: 0;
        }
        &::before {
            top: 0;
        }

        .m-material-item {
            width: calc(100%-32px);
            display: flex;
            align-items: center;
            gap: 2px;
            padding-left: 32px;

            .u-icon {
                .size(18px);
                .r(4px);
            }
            .u-name,
            .u-count {
                color: var(--black-80, rgba(28, 28, 28, 0.8));
                .fz(12px, 18px);
                font-weight: 700;
            }
            .u-price {
                text-align: right;
                color: var(--black-40, rgba(28, 28, 28, 0.4));
                .fz(12px, 18px);
                font-weight: 400;
                flex-grow: 1;

                .c-game-price {
                    .u-value::before {
                        color: var(--black-40, rgba(28, 28, 28, 0.4));
                        opacity: 0.2;
                    }
                }
            }
        }
    }
}
</style>
