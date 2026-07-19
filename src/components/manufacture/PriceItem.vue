<template>
    <el-popover
        popper-class="m-add-price"
        placement="bottom-end"
        trigger="click"
        :width="420"
        v-model:visible="visible"
    >
        <div class="m-add-price__title">
            <span>修改</span>
            <strong :title="name">[{{ name }}]</strong>
            <span>{{ type == "cart" ? "账单单价" : "单价" }}</span>
        </div>
        <div class="u-add">
            <el-input class="u-input" type="number" size="small" v-model="newPrice.jin"></el-input>
            <img :src="`${img}/jin.png`" alt="金" />
            <el-input class="u-input" type="number" size="small" v-model="newPrice.yin"></el-input>
            <img :src="`${img}/yin.png`" alt="银" />
            <el-input class="u-input" type="number" size="small" v-model="newPrice.tong"></el-input>
            <img :src="`${img}/tong.png`" alt="铜" />
            <el-button class="u-button" size="small" @click="onUpdateCustomPrice">确定</el-button>
        </div>
        <template v-slot:reference>
            <div class="m-price-item">
                <template v-if="type == 'cart'">
                    <GamePrice v-if="showPrice" class="u-price-num" :price="showPrice" :align="align" />
                    <span class="u-null" v-else>暂无价格</span>
                    <i class="u-edit el-icon-edit" title="修改价格"></i>
                    <i
                        class="u-edit el-icon-close"
                        title="取消自定义价格"
                        v-if="price != origin_price"
                        @click.stop="onRemoveCustomPrice"
                    ></i>
                </template>
                <template v-else>
                    <GamePrice v-if="showPrice" class="u-price-num" :price="showPrice" :align="align" />
                    <span class="u-null" v-else>暂无价格</span>
                    <i class="u-edit el-icon-edit" title="修改价格"></i>
                    <i
                        class="u-edit el-icon-close"
                        title="取消自定义价格"
                        v-if="price.from == 'custom'"
                        @click.stop="onRemoveCustomPrice"
                    ></i>
                </template>
            </div>
        </template>
    </el-popover>
</template>
<script>
import GamePrice from "@jx3box/jx3box-ui/src/wiki/GamePrice.vue";
import { __imgPath } from "@/utils/config";

export default {
    name: "PriceItem",
    props: ["price", "server", "name", "item_id", "type", "origin_price", "align", "count"],
    components: { GamePrice },
    data: function () {
        return {
            visible: false,

            newPrice: {
                jin: "",
                yin: "",
                tong: "",
            },
        };
    },
    computed: {
        img() {
            return __imgPath + "image/price/";
        },
        showPrice() {
            if (this.type == "cart") {
                if (this.count) {
                    return this.price * this.count;
                } else {
                    return this.price;
                }
            } else {
                return this.price.price;
            }
        },
    },
    methods: {
        reset() {
            const price = this.price || 0;
            const jin = Math.floor(price / 10000);
            const yin = Math.floor((price % 10000) / 100);
            const tong = price % 100;
            this.newPrice = {
                jin,
                yin,
                tong,
            };
        },
        onRemoveCustomPrice() {
            if (this.type == "cart") {
                this.$emit("update_price", this.origin_price);
            } else {
                this.$store.commit("remove_custom_prices", [`${this.server}_${this.item_id}`]);
            }
        },
        onUpdateCustomPrice() {
            const { jin, yin, tong } = this.newPrice;
            const price = Number(jin * 10000) + Number(yin * 100) + Number(tong);
            if (this.type == "cart") {
                this.$emit("update_price", price);
            } else {
                this.$store.commit("update_custom_prices", {
                    [`${this.server}_${this.item_id}`]: {
                        from: "custom",
                        price,
                    },
                });
            }

            this.visible = false;
            this.reset();
        },
    },
    mounted() {
        this.reset();
    },
};
</script>
<style lang="less">
.m-price-item {
    .dbi;
    .pointer;
    .u-null {
        .fz(13px);
        color: #d00;
        opacity: 0.9;
    }
    .u-edit {
        .ml(5px);
        .pr(6px);
        color:@v4primary;
        .fz(12px);
    }
}
.m-add-price {
    box-sizing: border-box;
    max-width: calc(100vw - 32px);
    padding: 16px;

    .m-add-price__title {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 4px;
        margin-bottom: 14px;
        color: #334155;
        font-size: 14px;
        line-height: 22px;
        white-space: nowrap;

        strong {
            min-width: 0;
            overflow: hidden;
            color: #17233c;
            text-overflow: ellipsis;
        }
    }

    .u-add {
        .flex;
        align-items: center;
        gap: 6px;

        .u-input {
            flex: 0 0 72px;
            width: 72px;

            .el-input__wrapper {
                padding: 0 8px;
            }

            .el-input__inner {
                .x;
                width: 100%;
                padding: 0 5px;
            }
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
                -webkit-appearance: none;
            }
            input[type="number"] {
                -moz-appearance: textfield;
            }
        }
        img {
            flex: none;
            .size(20px,16px);
            margin: 0;
        }
        .u-button {
            flex: none;
            min-width: 60px;
            margin-left: 4px;
        }
    }
}

@media (max-width: 520px) {
    .m-add-price {
        .u-add {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 20px minmax(0, 1fr) 20px minmax(0, 1fr) 20px;

            .u-input {
                width: 100%;
            }

            .u-button {
                grid-column: 1 / -1;
                width: 100%;
                margin: 6px 0 0;
            }
        }
    }
}
</style>
