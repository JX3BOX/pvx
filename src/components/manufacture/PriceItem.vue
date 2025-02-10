<template>
    <el-popover popper-class="m-add-price" placement="bottom-end" trigger="click" v-model="visible">
        <el-divider content-position="left" v-if="type == 'cart'"
            >修改 [ <b>{{ name }}</b> ] 账单金额</el-divider
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
                    <GamePrice v-if="price" class="u-price-num" :price="price" />
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
                    <GamePrice v-if="price.price" class="u-price-num" :price="price.price" />
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
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";

export default {
    name: "PriceItem",
    props: ["price", "server", "name", "item_id", "type", "origin_price"],
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
    },
    methods: {
        onRemoveCustomPrice() {
            if (this.type == "cart") {
                this.$emit("update_price", this.origin_price);
            } else {
                this.$store.commit("remove_custom_prices", [`${this.server}_${this.item_id}`]);
            }
        },
        onUpdateCustomPrice() {
            const { jin, yin, tong } = this.newPrice;
            const price = Number(jin * 10000 + yin * 100 + tong);
            if (price) {
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
            }

            this.visible = false;
            this.newPrice = {
                jin: "",
                yin: "",
                tong: "",
            };
        },
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
