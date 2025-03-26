<template>
    <el-popover popper-class="m-add-price" placement="bottom-end" trigger="click" v-model="visible">
        <el-divider content-position="left" v-if="type == 'cart'"
            >修改 [ <b>{{ name }}</b> ] 账单单价</el-divider
        >
        <el-divider content-position="left" v-else
            >修改 [ <b>{{ name }}</b> ] 单价</el-divider
        >
        <div class="u-add">
            <el-input class="u-input" type="number" size="mini" v-model="newPrice.jin"></el-input>
            <img :src="`${img}/jin.png`" alt="金" />
            <el-input class="u-input" type="number" size="mini" v-model="newPrice.yin"></el-input>
            <img :src="`${img}/yin.png`" alt="银" />
            <el-input class="u-input" type="number" size="mini" v-model="newPrice.tong"></el-input>
            <img :src="`${img}/tong.png`" alt="铜" />
            <el-button class="u-button" size="mini" @click="onUpdateCustomPrice">确定</el-button>
        </div>
        <template slot="reference">
            <div class="m-price-item">
                <template v-if="type == 'cart'">
                    <i class="u-edit el-icon-edit" title="修改价格"></i>
                    <i
                        class="u-edit el-icon-close"
                        title="取消自定义价格"
                        v-if="price != origin_price"
                        @click.stop="onRemoveCustomPrice"
                    ></i>
                    <GamePrice v-if="showPrice" class="u-price-num" :price="showPrice" :align="align" />
                    <span class="u-null" v-else>暂无价格</span>
                </template>
                <template v-else>
                    <i class="u-edit el-icon-edit" title="修改价格"></i>
                    <i
                        class="u-edit el-icon-close"
                        title="取消自定义价格"
                        v-if="price.from == 'custom'"
                        @click.stop="onRemoveCustomPrice"
                    ></i>
                    <GamePrice v-if="showPrice" class="u-price-num" :price="showPrice" :align="align" />
                    <span class="u-null" v-else>暂无价格</span>
                </template>
            </div>
        </template>
    </el-popover>
</template>
<script>
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";

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
        color: #08cfd9;
        .pr(6px);
    }
}
.m-add-price {
    .u-add {
        .flex;
        align-items: center;
        .u-input {
            .el-input__inner {
                .x;
                .w(60px);
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
            .size(25px,18px);
            margin: 0 3px;
        }
        .u-button {
            .ml(10px);
        }
    }
}
</style>
