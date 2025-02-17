<template>
    <el-popover placement="top" trigger="hover" popper-class="m-price-popper" width="320">
        <div class="u-price-detail">
            <div class="u-item-num">
                <span><i class="el-icon-coin"></i> 预计售价：</span>
                <span class="u-price">
                    <PriceItem
                        v-if="price_mutable"
                        class="u-price-num"
                        :price="price"
                        :origin_price="origin_price"
                        :name="price_name"
                        type="cart"
                        @update_price="$emit('update_price', $event)"
                        :align="true"
                    />
                    <GamePrice v-else class="u-price-num" :price="price" :align="true" />
                </span>
            </div>
            <div class="u-item-num">
                <span><i class="el-icon-coin"></i> 项目成本：</span>
                <span class="u-price">
                    <GamePrice class="u-price-num" :price="cost" :align="true" />
                </span>
            </div>
            <div class="u-item-num" :class="{ 'is-cancel': !calc_tax }">
                <span class="u-label"><i class="el-icon-coin"></i> 交易行税：</span>
                <span class="u-price">
                    <i
                        v-if="tax_mutable"
                        class="u-edit"
                        :class="calc_tax ? 'el-icon-close' : 'el-icon-refresh-left'"
                        title="取消税收"
                        @click.stop="$emit('update_tax', !calc_tax)"
                    ></i>
                    <GamePrice class="u-price-num" :price="tax" :align="true" />
                </span>
            </div>
            <div
                class="u-item-num"
                :class="{
                    'no-profit': profit < 0,
                }"
            >
                <span><i class="el-icon-coin"></i> 预计收益：</span>
                <span class="u-price">
                    <GamePrice class="u-price-num" :price="profit" :align="true" />
                </span>
            </div>
        </div>
        <template #reference>
            <div
                class="u-item-num"
                :class="{
                    'no-profit': profit < 0,
                }"
            >
                <span><i class="el-icon-coin"></i> 预计收益：</span>
                <span class="u-price">
                    <GamePrice class="u-price-num" :price="profit" :align="true" />
                </span>
            </div>
        </template>
    </el-popover>
</template>

<script>
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import PriceItem from "@/components/manufacture/PriceItem.vue";

export default {
    name: "PriceDetail",
    components: { GamePrice, PriceItem },
    props: {
        price: {
            type: Number,
            default: 0,
        },
        origin_price: {
            type: Number,
            default: 0,
        },
        price_name: {
            type: String,
            default: "",
        },
        price_mutable: {
            type: Boolean,
            default: false,
        },
        cost: {
            type: Number,
            default: 0,
        },
        calc_tax: {
            type: Boolean,
            default: true,
        },
        tax: {
            type: Number,
            default: 0,
        },
        tax_mutable: {
            type: Boolean,
            default: false,
        },
        profit: {
            type: Number,
            default: 0,
        },
    },
};
</script>

<style lang="less">
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

            & > .u-edit {
                margin-right: 6px;
            }
        }
    }
}
</style>
