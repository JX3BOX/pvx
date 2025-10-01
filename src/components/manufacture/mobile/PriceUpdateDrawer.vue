<template>
    <el-drawer
        :with-header="false"
        :visible.sync="visible"
        direction="btt"
        wrapper-closable
        append-to-body
        modal-append-to-body
        custom-class="m-price-change-drawer"
    >
        <div class="u-title">
            <img class="u-icon" :src="iconLink(icon)" alt="" />
            <div class="u-section">
                <span class="u-item-name">{{ name }}</span>
                <span v-if="type != 'cart'" class="u-price">
                    <span>[{{ server }}]昨日平均单价: </span>
                    <GamePrice v-if="origin_price" class="u-price-num" :price="origin_price"></GamePrice>
                    <span v-else>暂无价格</span>
                </span>
                <span v-else class="u-price">
                    <span>账单原价格: </span>
                    <GamePrice v-if="origin_price" class="u-price-num" :price="origin_price"></GamePrice>
                    <span v-else>无价格</span>
                </span>
            </div>
        </div>
        <div class="m-input">
            <el-input class="u-input" type="number" size="mini" v-model="newPrice.jin" @focus="$event.target.select()">
                <template #suffix>
                    <img :src="`${img}/jin.png`" alt="金" />
                </template>
            </el-input>

            <el-input class="u-input" type="number" size="mini" v-model="newPrice.yin" @focus="$event.target.select()">
                <template #suffix>
                    <img :src="`${img}/yin.png`" alt="银" />
                </template>
            </el-input>

            <el-input class="u-input" type="number" size="mini" v-model="newPrice.tong" @focus="$event.target.select()">
                <template #suffix>
                    <img :src="`${img}/tong.png`" alt="铜" />
                </template>
            </el-input>
        </div>
        <div class="m-actions">
            <div class="u-reset" @click="removeCustomPrice">重置</div>
            <div class="u-confirm" @click="confirm">确定</div>
        </div>
    </el-drawer>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";

export default {
    name: "ManufacturePriceItemMobile",
    components: { GamePrice },
    props: {},
    data: () => ({
        img: __imgPath + "image/price/",
        // 弹窗可见
        visible: false,
        // 修改价格类型 全局价格/账单内价格
        type: "",

        icon: "",
        name: "",
        origin_price: "",
        price: "",
        server: "",
        item_id: "",

        newPrice: {
            jin: "",
            yin: "",
            tong: "",
        },

        resolve: null,
        reject: null,
    }),
    methods: {
        iconLink,
        open(data) {
            this.visible = true;
            this.icon = data.icon || "";
            this.type = data.type || "cart";
            this.name = data.name || "物品";
            this.origin_price = data.origin_price || data.price || 0;
            this.price = data.price || 0;
            this.server = data.server || "";
            this.item_id = data.item_id || "";
            this.reset();
            if (this.type == "cart") {
                return new Promise((resolve, reject) => {
                    this.resolve = resolve;
                    this.reject = reject;
                });
            }
        },

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

        removeCustomPrice() {
            if (this.type == "cart") {
                this.resolve(this.origin_price);
            } else {
                this.$store.commit("remove_custom_prices", [`${this.server}_${this.item_id}`]);
            }
            this.visible = false;
        },

        confirm() {
            const { jin, yin, tong } = this.newPrice;
            const price = Number(jin * 10000) + Number(yin * 100) + Number(tong);
            if (this.type == "cart") {
                this.resolve(price);
            } else {
                this.$store.commit("update_custom_prices", {
                    [`${this.server}_${this.item_id}`]: {
                        from: "custom",
                        price,
                    },
                });
            }

            this.visible = false;
        },
    },
    computed: {
        title() {
            if (this.type == "cart") {
                return `修改 [${this.name}] 账单内单价`;
            } else if (this.type == "global") {
                return `[${this.server}] 修改 [${this.name}] 单价`;
            } else {
                return "";
            }
        },
    },
};
</script>

<style lang="less">
.m-price-change-drawer {
    .u-title {
        padding-left: 42px;
        .pr;
        .u-icon {
            .pa;
            .size(40px);
            left: 0;
        }
        .u-section {
            display: flex;
            flex-direction: column;
            gap: 4px;
            .u-item-name {
                color: var(--black-80, rgba(28, 28, 28, 0.8));
                .fz(12px, 18px);
                font-weight: 700;
            }
            .u-price {
                color: var(--black-40, rgba(28, 28, 28, 0.4));
                .fz(12px, 18px);
                font-weight: 400;
            }
        }

        color: var(--Primary-Brand-2, #fedaa3);
        .fz(12px, 18px);
        font-weight: 700;
    }

    .m-input {
        display: flex;
        align-items: center;
        gap: 8px;

        .u-input {
            .el-input__inner {
                border-radius: 8px;
                background: var(--black-5, rgba(255, 255, 255, 0.1));

                border: 1px solid #2828280d;
                color: var(--black-100, rgba(255, 255, 255, 0.4));
                .fz(12px, 18px);
                font-weight: 700;
            }

            .el-input__suffix {
                display: inline-flex;
                align-items: center;
            }
        }
    }

    .m-actions {
        display: flex;
        justify-content: space-between;
        gap: 16px;

        .u-reset,
        .u-confirm {
            .pointer;
            flex-grow: 1;
            border-radius: 8px;
            padding: 8px 20px;
            .fz(12px, 18px);
            font-weight: 700;
            .x();
        }

        .u-reset {
            background: var(--black-5, rgba(255, 255, 255, 0.1));
            color: var(--black-80, rgba(255, 255, 255, 0.8));
        }

        .u-confirm {
            background: var(--Primary-Brand-2, #fedaa3);
            color: var(--Primary-Brand-3, #24292e);
        }
    }
}
</style>
