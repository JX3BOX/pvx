<template>
    <div class="m-manufacture-plan-mobile">
        <div class="m-title">{{ plan.title }}</div>
        <div class="m-cart-list">
            <div class="m-cart-item" v-for="(item, index) in cartList" :key="index">
                <div class="u-header">
                    <img class="u-icon" :src="iconLink(item.item.item_info.IconID)" :alt="item.item.item_info.Name" />
                    <div class="u-name">{{ item.item.item_info.Name }}</div>
                    <div class="u-count">
                        <span>x{{ item.count }}</span>
                        <span class="u-make-count">({{ item.yield_count }})</span>
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
        <div class="m-title is-center">总计</div>
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
        <div class="m-save-button" @click="onEdit">修改清单</div>
    </div>
</template>

<script>
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import { sumBy } from "lodash";

export default {
    name: "ManufacturePlanMobile",
    components: { GamePrice },
    props: {
        plan: {
            type: Object,
            default: () => ({}),
        },
    },
    data: () => ({}),
    computed: {
        cartList() {
            return this.plan.relation || [];
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
        onEdit() {
            this.$emit("edit-plan", this.plan);
        },
    },
};
</script>

<style lang="less">
.m-manufacture-plan-mobile {
    height: 100%;
    overflow-y: auto;
    .scrollbar;
    display: flex;
    flex-direction: column;
    gap: 16px;
    .fz(12px, 18px);

    .m-title {
        color: var(--black-80, rgba(28, 28, 28, 0.8));
        font-weight: 700;

        &.is-center {
            text-align: center;
        }
    }
    .m-stat {
        display: flex;
        padding: 12px;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        border-radius: 8px;
        background: var(--black-5, rgba(28, 28, 28, 0.05));

        .m-stat-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .w(100%);
            color: var(--black-80, rgba(28, 28, 28, 0.8));
            .c-game-price {
                .u-value::before {
                    color: var(--black-80, #fedaa3);
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
                color: var(--black-80, rgba(28, 28, 28, 0.8));
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
            .u-make-count {
                color: var(--black-40, rgba(28, 28, 28, 0.4));
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
