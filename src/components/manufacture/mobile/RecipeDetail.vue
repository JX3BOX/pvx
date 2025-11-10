<template>
    <div class="m-manufacture-recipe-detail">
        <div class="m-recipe-detail-title">
            <RecipeDetailTitle :recipe="recipe"></RecipeDetailTitle>
            <div class="u-add-cart" @click="onAddToCart">添加</div>
        </div>
        <template v-if="recipe.szTip">
            <span class="u-desc" v-for="text in textFilter(recipe.szTip)" :key="text">{{ text }}</span>
        </template>
        <div class="m-recipe-price">
            <span class="u-title">交易行售价</span>
            <span class="u-price">
                <GamePrice
                    class="u-price-num"
                    v-if="get_price(server, recipe.item_id)"
                    :price="get_price(server, recipe.item_id).price"
                ></GamePrice>
                <div v-else class="u-empty">暂无价格</div>

                <div
                    class="u-edit"
                    @click="
                        onUpdatePrice({
                            server,
                            item_id: recipe.item_id,
                            name: recipe.item.item_info?.Name,
                            icon: recipe.IconID,
                        })
                    "
                >
                    <img svg-inline src="@/assets/img/manufacture/edit.svg" alt="" />
                </div>
            </span>
        </div>
        <div class="m-materials" v-if="recipe.materials && recipe.materials.length">
            <div class="m-material-list">
                <div class="m-material-item" v-for="(material, index) in recipe.materials" :key="index">
                    <img class="u-icon" :src="iconLink(material.item.item_info?.IconID, client)" alt="" />
                    <div class="u-section-1">
                        <div class="u-name">{{ material.item.item_info?.Name }} x{{ material.count }}</div>
                        <div class="u-price">
                            <GamePrice
                                class="u-price-num"
                                v-if="get_price(server, material.item_id)"
                                :price="get_price(server, material.item_id).price"
                            ></GamePrice>
                            <div v-else class="u-empty">暂无价格</div>
                        </div>
                    </div>
                    <div
                        class="u-edit"
                        @click="
                            onUpdatePrice({
                                server,
                                item_id: material.item_id,
                                name: material.item.item_info?.Name,
                                icon: material.item.item_info?.IconID,
                            })
                        "
                    >
                        <img svg-inline src="@/assets/img/manufacture/edit.svg" alt="" />
                    </div>
                </div>
            </div>
        </div>
        <div class="m-profit">
            <span class="u-title">预计收益</span>
            <span class="u-price">
                <GamePrice class="u-price-num" :price="profit"></GamePrice>
            </span>
        </div>
        <RecipeChangeCountVue ref="count-change"></RecipeChangeCountVue>
        <PriceUpdateDrawer ref="price-update"></PriceUpdateDrawer>
    </div>
</template>

<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import { mapGetters } from "vuex";
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import RecipeDetailTitle from "./RecipeDetailTitle.vue";
import PriceUpdateDrawer from "./PriceUpdateDrawer.vue";
import { sum, pick } from "lodash";
import RecipeChangeCountVue from "./RecipeChangeCount.vue";

export default {
    name: "RecipeDetail",
    components: { GamePrice, RecipeDetailTitle, PriceUpdateDrawer, RecipeChangeCountVue },
    props: {
        recipe: {
            type: Object,
            default: () => ({}),
        },
    },
    data: () => ({}),
    computed: {
        ...mapGetters(["get_price"]),
        server() {
            return this.$store.state.server;
        },
        profit() {
            const price = this.get_price(this.server, this.recipe.item_id).price || 0;
            const materials = this.recipe.materials || [];
            const materials_price = materials.map(
                (material) => this.get_price(this.server, material.item_id).price || 0
            );
            return price - sum(materials_price);
        },
        client() {
            return this.$store.state.client;
        }
    },
    methods: {
        iconLink, // 描述过滤
        onUpdatePrice({ server, item_id, name, icon }) {
            this.$refs["price-update"].open({
                icon,
                type: "global",
                server: server,
                item_id: item_id,
                name: name,
                price: this.get_price(server, item_id).price || 0,
            });
        },
        textFilter(str) {
            // 匹配分段
            const regex = /<Text>text="(.*?)"\s*?font=(\d+)\s*?<\/text>/gimsy;
            let matches = [];
            let match;
            while ((match = regex.exec(str))) {
                matches.push(match);
            }

            // 格式化分段
            let result = [];
            for (let group of matches) {
                result.push(group[1].replace(/[\\n]/g, ""));
            }
            result = result.filter(Boolean);
            return result;
        },
        onAddToCart() {
            this.$refs["count-change"]
                .open({
                    count: 1,
                    yield_count: this.recipe?.CreateItemMin1 || 1,
                    yield_count_min: this.recipe?.CreateItemMin1 || 1,
                    yield_count_max: this.recipe?.CreateItemMax1 || 1,
                })
                .then((res) => {
                    const [count, yield_count] = res;
                    this.$emit("add-cart", [count, yield_count]);
                });
        },
    },
};
</script>

<style lang="less">
.m-manufacture-recipe-detail {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .m-recipe-detail-title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .u-add-cart {
            .r(8px);
            height: 18px;
            padding: 8px 20px;
            text-align: center;

            background: var(--Primary-Brand-2);
            color: var(--Primary-Brand-3);

            color: var(--Primary-Brand-3, #24292e);

            .fz(12px, 18px);
            font-weight: 700;
        }
    }

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

    .el-loading-mask {
        background-color: var(--background-color);
    }

    .u-desc {
        color: var(--black-40, rgba(255, 255, 255, 0.4));
        .fz(12px, 18px);
        font-weight: 400;
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
}
</style>
