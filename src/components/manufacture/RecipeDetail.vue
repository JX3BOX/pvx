<template>
    <div class="m-recipe-detail" v-if="item">
        <!-- 配方信息展示 -->
        <div class="m-item">
            <el-popover popper-class="u-icon-popper" placement="right" :visible-arrow="false" trigger="hover">
                <Item :item_id="item.itemKey" />
                <div class="u-img" slot="reference">
                    <span class="u-amount" v-if="item.CreateItemMin1 != item.CreateItemMax1">
                        {{ item.CreateItemMin1 }}~{{ item.CreateItemMax1 }}
                    </span>
                    <div
                        class="u-border"
                        :style="{ backgroundImage: item_border(item.Quality), opacity: item.Quality == 5 ? 0.9 : 1 }"
                    ></div>
                    <img :src="iconLink(item.IconID)" :alt="item.Name" />
                </div>
            </el-popover>

            <div class="m-text">
                <span class="u-name" :class="`u-quality--${item.Quality}`">{{ item.Name }}</span>
                <div class="u-info">
                    <span>
                        需求等级: <b>{{ item.nLevel || "未知" }}</b>
                    </span>
                    <span>
                        消耗精力: <b>{{ item.CostVigor || item.CostStamina }}</b>
                    </span>
                    <span>
                        经验值: <b>{{ item.Exp }}</b>
                    </span>
                </div>
            </div>
        </div>

        <div class="u-price" v-if="client == 'std'">
            [{{ server }}] 昨日平均价格:
            <GamePrice v-if="prices[item.itemKey]" class="u-price-num" :price="prices[item.itemKey]" />
            <span class="u-null" v-else> 暂无数据 </span>
        </div>

        <template v-if="item.szTip">
            <span class="u-desc" v-for="text in textFilter(item.szTip)" :key="text">{{ text }}</span>
        </template>
        <div class="u-children" v-if="childrenList && childrenList.length">
            <el-divider content-position="left">合成所需材料</el-divider>
            <div class="u-child" v-for="(el, index) in childrenList" :key="index">
                <el-popover
                    popper-class="u-icon-popper"
                    placement="right"
                    :visible-arrow="false"
                    width="auto"
                    trigger="hover"
                >
                    <Item :item_id="el.priceID" />
                    <div class="u-img" slot="reference">
                        <div
                            class="u-border"
                            :style="{ backgroundImage: item_border(el.Quality), opacity: el.Quality == 5 ? 0.9 : 1 }"
                        ></div>
                        <img :src="iconLink(el.IconID)" :alt="item.Name" />
                    </div>
                </el-popover>

                <div class="u-info">
                    <div class="u-name">
                        <span :class="`u-quality--${el.Quality}`"> {{ el.Name }}</span>
                        <span class="u-num"> 数量： {{ el.count || 1 }} </span>
                    </div>
                    <div class="u-price" v-if="client == 'std'">
                        {{ prices[el.ID] ? "[NPC出售] 单价：" : `[${server}] 昨日平均单价：` }}
                        <PriceItem
                            :data="{
                                Price: prices[el.ID] || prices[el.priceID],
                                Name: el.Name,
                                id: el.ID,
                            }"
                        />
                    </div>
                    <div class="u-price" v-else>
                        [NPC出售] 单价：
                        <PriceItem :data="{ Price: prices[el.ID], Name: el.Name, id: el.ID }" />
                    </div>
                </div>
            </div>
        </div>
        <div class="m-add">
            <el-input-number v-model="item.count" :min="1" @click.stop.native></el-input-number>
            <el-button icon="el-icon-shopping-cart-2" type="success" @click="addCartItem"> </el-button>
        </div>
    </div>
</template>
<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";

import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import Item from "@jx3box/jx3box-editor/src/Item.vue";
import PriceItem from "@/components/manufacture/PriceItem.vue";
export default {
    name: "RecipeDetail",
    props: ["showItem", "children", "prices", "server"],
    components: { Item, PriceItem, GamePrice },
    data: function () {
        return {
            item: {},
            childrenList: [],
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        iconLink,
        // 添加购物车
        addCartItem() {
            const data = { ...this.item, children: this.childrenList };
            this.$emit("addCartItem", data);
        },

        // 描述过滤
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

        // icon边框
        item_border(id) {
            switch (id) {
                case 3:
                    return `url(${__imgPath}image/item/blue.png)`;
                case 4:
                    return `url(${__imgPath}image/item/purple.png)`;
                case 5:
                    return `url(${__imgPath}image/item/orange.gif)`;
                default:
                    return "";
            }
        },
    },
    watch: {
        showItem: {
            deep: true,
            immediate: true,
            handler: function (data) {
                this.item = data;
            },
        },
        children: {
            deep: true,
            handler: function (list) {
                this.childrenList = list;
            },
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/manufacture/recipe.less";
</style>
