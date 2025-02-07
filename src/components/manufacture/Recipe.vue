<template>
    <div class="m-manufacture-recipe">
        <div class="m-recipe-list">
            <span class="m-recipe-group" v-for="(item, i) in list" :key="i">
                <span :class="['m-list m-title', { active: i == showIndex }]" @click="changeIndex(i)">
                    <span class="u-name">
                        <i :class="i == showIndex ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i>
                        {{ item.BelongName }}
                    </span>
                </span>
                <span
                    v-show="showIndex == i"
                    :class="['m-list', { active: itemId == _list.ID }, `u-quality-bg--${_list.Quality}`]"
                    v-for="(_list, k) in item.list"
                    :key="k"
                    @click="changeItem(_list.ID)"
                >
                    <span class="u-item">
                        <img class="u-img" :src="iconLink(_list.IconID)" :alt="_list.Name" /> {{ _list.Name }}</span
                    >
                    <div class="m-add" v-if="itemId == _list.ID">
                        <el-input-number
                            v-model.number="showItem.count"
                            size="small"
                            :min="1"
                            @input="onlyInteger"
                            @click.stop.native
                        ></el-input-number>
                        <el-button icon="el-icon-shopping-cart-2" size="small" @click="addCartItem"> </el-button>
                    </div>
                </span>
            </span>
        </div>
        <RecipeDetail
            v-loading="loading"
            :showItem="showItem"
            :prices="prices"
            :children="children"
            :server="server"
            v-on="$listeners"
        />
    </div>
</template>
<script>
import { getManufactureItem, getAuctionPrice, getOther, getItemsPrice } from "@/service/manufacture/manufacture";
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import RecipeDetail from "@/components/manufacture/RecipeDetail.vue";
import Bus from "@/store/bus.js";
export default {
    name: "Recipe",
    props: ["list", "craftKey", "server"],
    data: function () {
        return {
            showIndex: 0,
            showItem: {},
            loading: false,
            children: [],
            prices: {},
            itemId: 0,
        };
    },
    components: { RecipeDetail },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        iconLink,
        loadItem(id) {
            this.loading = true;
            getManufactureItem(this.craftKey, id, this.client)
                .then(async (res) => {
                    let _data = {},
                        _child = [],
                        _type = [],
                        _count = [];

                    // 处理数据：删除空数据 合并itemKey 提取材料id 和数量
                    Object.keys(res.data).forEach((key) => {
                        if (res.data[key]) {
                            _data[key] = res.data[key];
                            if (_data.CreateItemType1)
                                _data["itemKey"] = _data.CreateItemType1 + "_" + _data.CreateItemIndex1;
                            if (key.startsWith("RequireItemIndex")) _child.push(_data[key]);
                            if (key.startsWith("RequireItemType")) _type.push(_data[key]);
                            if (key.startsWith("RequireItemCount")) _count.push(_data[key]);
                        }
                    });

                    // 材料id和数量处理
                    _child = _child.map((id, i) => {
                        return { id: id, count: _count[i], priceID: _type[i] + "_" + id };
                    });

                    // 获取配方材料价格
                    const itemPrice = await this.getItemPrice(_child);
                    const tradePrice = await this.getTradePrice(_child, _data.itemKey);
                    const _prices = Object.assign(itemPrice, tradePrice);
                    Object.keys(_prices).forEach((id) => {
                        this.prices[id] = _prices[id];
                    });
                    // 将价格传给购物车
                    Bus.$emit("itemPrice", this.prices);

                    // 获取材料详情
                    this.getItemDetail(_child).then((res) => {
                        this.children = _child.map((item) => {
                            if (res[item.id]) item = Object.assign(item, res[item.id]);
                            return item;
                        });
                    });

                    // 添加配方 数量
                    _data.count = 1;
                    this.showItem = _data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 获取物品数据
        async getItemDetail(arr) {
            const ids = arr.map((item) => item.id).join();
            try {
                return await getOther({ client: this.client, ids, per: ids.length }).then((res) => {
                    let itemData = {};
                    res.data.list.forEach((item) => {
                        let _obj = {};
                        Object.keys(item).forEach((el) => {
                            if (item[el]) _obj[el] = item[el];
                        });
                        itemData[item.ID] = { ..._obj, ..._obj.item_info };
                        // 可删可不删
                        delete itemData[item.ID].Price;
                        delete itemData[item.ID].item_info;
                    });
                    return itemData;
                });
            } catch (e) {
                console.log("获取物品数据错误", e);
            }
        },
        // NPC出售价格
        async getItemPrice(arr) {
            const ids = arr.map((item) => item.id).join();
            return getItemsPrice({ ids, client: this.client }).then((res) => {
                let priceData = {};
                res.data.forEach((item) => {
                    priceData[item.ItemIndex] = item.Price;
                });
                return priceData;
            });
        },
        // 交易行价格
        async getTradePrice(arr, key) {
            const itemIds = arr
                .map((item) => item.priceID)
                .concat(key)
                .join();
            return getAuctionPrice({ itemIds, server: this.server }).then((res) => {
                let priceData = {};
                Object.keys(res.data.data).forEach((item) => {
                    priceData[item] = res.data.data[item].AvgPrice;
                });
                return priceData;
            });
        },
        // 切换分类
        changeIndex(i) {
            this.showIndex = this.showIndex == i ? -1 : i;
        },
        // 切换物品
        changeItem(id) {
            if (id == this.itemId) return;
            this.itemId = id;
            this.loadItem(id);
        },
        addCartItem() {
            const data = { ...this.showItem, children: this.children };
            this.$emit("addCartItem", data);
        },
        onlyInteger() {
            let number = this.showItem.count + "";
            number = number.replace(/[^\.\d]/g, "");
            number = number.replace(".", "");
            this.showItem.count = ~~number;
        },
    },
    watch: {
        list: {
            deep: true,
            handler: function (_list) {
                if (_list.length && _list[0].list.length) this.changeItem(_list[0].list[0].ID);
            },
        },
        prices(data) {
            Bus.$emit("itemPrice", data);
        },
        server() {
            this.loadItem(this.itemId);
        },
        craftKey() {
            this.showIndex = 0;
        },
    },
    mounted() {
        Bus.$on("changePrice", ({ id, Price }) => {
            if (this.prices[id]) delete this.prices[id];
            this.$set(this.prices, [id], Price);
        });
    },
};
</script>
<style lang="less">
.m-manufacture-recipe {
    .flex;
    .mr(10px);
    .m-recipe-list {
        .w(460px);
        .flex;
        .pr(10px);
        .mr(20px);
        min-height: 700px;
        max-height: calc(100vh - 250px);
        overflow: auto;
        flex-direction: column;
        gap: 20px;
    }
    .m-recipe-group {
        .flex;
        .color(#000);
        flex-direction: column;
        gap: 10px;
        .m-list {
            .flex;
            .size(100%,50px);
            .r(10px);
            .pointer;
            .fz(14px);
            justify-content: space-between;
            box-sizing: border-box;
            gap: 10px;
            background-color: #fff;
            padding: 0 20px;
            align-items: center;
            .u-item {
                .flex;
                gap: 10px;
                align-items: center;
            }

            &.active,
            &:hover {
                .bold;
                color: #fff;
                background: rgba(50, 65, 72, 0.3);
                &.u-quality-bg--0 {
                    background: rgba(50, 65, 72, 0.3);
                }
                &.u-quality-bg--1 {
                    background: @color;
                }
                &.u-quality-bg--2 {
                    background: #07ad36;
                }
                &.u-quality-bg--3 {
                    background: #3d83d3;
                }
                &.u-quality-bg--4 {
                    background: #b242da;
                }
                &.u-quality-bg--5 {
                    background: #f8983f;
                }
                &.u-quality-bg--6 {
                    background: #c00;
                }
            }
            &.m-title {
                .h(38px);
                .fz(16px);
                &.active,
                &:hover {
                    background: #24292e;
                }
                .u-name {
                    .flex;
                    gap: 10px;
                    align-items: center;
                }
            }
            .u-img {
                .size(30px);
            }
            .m-add {
                .flex;
                gap: 10px;
            }
        }
    }
    .m-recipe-detail {
        .w(460px);
        .r(10px);
        box-sizing: border-box;
        background-color: #fff;
    }
}
</style>
