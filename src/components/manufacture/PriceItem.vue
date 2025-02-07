<template>
    <el-popover popper-class="m-add-price" placement="bottom-end" trigger="click" v-model="visible">
        <el-divider content-position="left"
            >修改 [ <b>{{ data.Name }}</b> ] 单价</el-divider
        >
        <div class="u-add">
            <el-input class="u-input" type="number" size="mini" v-model="my_Price.jin"></el-input>
            <img :src="`${img}/jin.png`" alt="金" />
            <el-input class="u-input" type="number" size="mini" v-model="my_Price.yin"></el-input>
            <img :src="`${img}/yin.png`" alt="银" />
            <el-input class="u-input" type="number" size="mini" v-model="my_Price.tong"></el-input>
            <img :src="`${img}/tong.png`" alt="铜" />
            <el-button class="u-button" size="mini" @click="inputPrice">确定</el-button>
        </div>
        <template slot="reference">
            <div class="m-price-item">
                <GamePrice v-if="data.Price" class="u-price-num" :price="data.Price" />
                <span class="u-null" v-else>暂无价格</span>
                <i class="u-edit el-icon-edit" title="修改价格"></i>
            </div>
        </template>
    </el-popover>
</template>
<script>
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import Bus from "@/store/bus.js";
export default {
    name: "PriceItem",
    props: ["data"],
    components: { GamePrice },
    data: function () {
        return {
            visible: false,
            my_Price: {
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
        inputPrice() {
            let { jin, yin, tong } = this.my_Price;
            jin = jin * 10000;
            yin = yin * 100;
            tong = tong * 1;
            const Price = jin + yin + tong;
            Bus.$emit("changePrice", { Price, id: this.data.id });

            this.visible = false;
            this.my_Price = {
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
