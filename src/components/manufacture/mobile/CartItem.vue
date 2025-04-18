<template>
    <el-drawer
        :with-header="false"
        direction="btt"
        wrapper-closable
        append-to-body
        modal-append-to-body
        custom-class="m-manufacture-cart-item"
        @close="$emit('close')"
        :visible.sync="visible"
    >
        <div class="m-manufacture-cart-item-body">
            <div class="m-recipe-price">
                <span class="u-title">交易行售价</span>
                <span class="u-price">
                    <GamePrice class="u-price-num" v-if="item.price_unit" :price="item.price_unit"></GamePrice>
                    <div v-else class="u-empty">暂无价格</div>
                    <div
                        class="u-edit"
                        @click="
                            onUpdatePrice(item, {
                                server: '账单',
                                name: item.item.item_info?.Name,
                                icon: item.IconID,
                                origin_price: item.price_unit_origin,
                                price: item.price_unit,
                            })
                        "
                    >
                        <img svg-inline src="@/assets/img/manufacture/edit.svg" alt="" />
                    </div>
                </span>
            </div>
            <div class="m-materials" v-if="item.materials && item.materials.length">
                <div class="m-material-list">
                    <div class="m-material-item" v-for="(material, index) in item.materials" :key="index">
                        <img class="u-icon" :src="iconLink(material.item.item_info?.IconID)" alt="" />
                        <div class="u-section-1">
                            <div class="u-name">{{ material.item.item_info?.Name }} x{{ material.count }}</div>
                            <div class="u-price">
                                <GamePrice
                                    class="u-price-num"
                                    v-if="material.price_unit"
                                    :price="material.price_unit"
                                ></GamePrice>
                                <div v-else class="u-empty">暂无价格</div>
                            </div>
                        </div>
                        <div
                            class="u-edit"
                            @click="
                                onUpdatePrice(material, {
                                    server: '账单',
                                    item_id: material.item_id,
                                    name: material.item.item_info?.Name,
                                    icon: material.item.item_info?.IconID,
                                    origin_price: material.price_unit_origin,
                                    price: material.price_unit,
                                })
                            "
                        >
                            <img svg-inline src="@/assets/img/manufacture/edit.svg" alt="" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="m-save-button" @click="visible=false">确定</div>
        </div>
        <PriceUpdateDrawerVue ref="price-update"></PriceUpdateDrawerVue>
    </el-drawer>
</template>

<script>
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import { sumBy } from "lodash";
import PriceUpdateDrawerVue from "./PriceUpdateDrawer.vue";

export default {
    name: "ManufactureCartItem",
    components: { GamePrice, PriceUpdateDrawerVue },
    data: () => ({
        item: {},
        visible: false,
    }),
    computed: {},
    methods: {
        iconLink,
        open(item) {
            this.item = item;
            this.visible = true;
        },
        onUpdatePrice(item, { price, origin_price, name, icon }) {
            this.$refs["price-update"]
                .open({
                    icon,
                    name: name,
                    type: "cart",
                    price: price,
                    origin_price: origin_price,
                })
                .then((res) => {
                    item.price_unit = res;
                });
        },
    },
};
</script>

<style lang="less">
.m-manufacture-cart-item-body {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .m-recipe-price,
    .m-profit {
        display: flex;
        justify-content: space-between;
        padding: 12px;
        align-items: center;
        gap: 12px;

        border-radius: 8px;
        background: var(--black-5, rgba(28, 28, 28, 0.05));

        .u-title {
            /* 12 Bold */
            color: var(--Primary-Brand-2, #24292e);
            font-family: "Microsoft YaHei UI";
            font-size: 12px;
            font-style: normal;
            font-weight: 700;
            line-height: 18px; /* 150% */
        }

        .u-price-num,
        .u-empty {
            color: var(--Primary-Brand-2, #24292e);
        }

        .u-price {
            display: flex;
            align-items: center;
            gap: 8px;

            .fz(12px, 18px);
            font-weight: 400;
        }

        .u-edit {
            color: var(--black-40, #24292e);

            .pointer;
            .size(18px);
        }
    }

    .m-materials {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .u-title {
            color: var(--Primary-Brand-2, #fedaa3);

            .fz(12px, 18px);
            font-weight: 700;
        }
    }

    .m-material-list {
        .r(8px);
        display: flex;
        padding: 12px;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        background: var(--black-5, rgba(28, 28, 28, 0.05));
    }

    .m-material-item {
        display: flex;
        align-items: center;
        gap: 10px;
        align-self: stretch;

        .u-icon {
            .size(48px);
            .r(4px);
        }

        .u-section-1 {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            flex: 1 0 0;
        }

        .u-name {
            color: var(--black-80, rgba(28, 28, 28, 0.8));

            .fz(12px, 18px);
            font-weight: 700;
        }

        .u-price {
            color: var(--black-80, rgba(255, 255, 255, 0.8));
            font-weight: 400;
            .fz(12px, 18px);
        }

        .u-edit {
            color: var(--black-40, #24292e);

            .pointer;
            .size(18px);
        }
    }

    .m-save-button {
        .pointer;
        .fz(12px, 18px);
        .x();
        flex-grow: 1;
        border-radius: 8px;
        padding: 8px 20px;
        font-weight: 700;
        background: var(--Primary-Brand-2, #f0ddc0);
        color: var(--Primary-Brand-3, #24292e);
    }
}
</style>
