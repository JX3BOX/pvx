import Vue from "vue";
import Vuex from "vuex";
import { getAuctionPrice, getItemsPrice, getOther, getUserInfo } from "@/service/manufacture/manufacture.js";
import { map, reduce } from "lodash";
import { cloneDeep } from "lodash";
import User from "@jx3box/jx3box-common/js/user";

Vue.use(Vuex);

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",

        // 使用 `服务器_id` 作为key存储价格
        prices: {},
        custom_prices: {},

        // gonggao
        server: "梦江南",
        craft_key: "",
        item_id: "",
        item: {},
        itemData: {},
        priceData: {},
        auctionPrice: {},
        cartList: [],
        childrenList: [],
        hasItems: [],
        favList: [],
        serverList: [],
        uid: User.getInfo().uid || 0,
        isLogin: User.isLogin(),
        isExpand: true,
        systemGoodsType: "",
    },
    mutations: {
        update_prices(state, prices) {
            state.prices = {
                ...state.prices,
                ...prices,
            };
        },
        update_custom_prices(state, prices) {
            state.custom_prices = {
                ...state.custom_prices,
                ...prices,
            };
        },
        remove_custom_prices(state, keys) {
            state.custom_prices = reduce(
                state.custom_prices,
                (prices, cur, key) => {
                    if (!keys.includes(key)) prices[key] = cur;
                    return prices;
                },
                {}
            );
        },

        // gonggao
        SET_STATE: (state, payload) => {
            state[payload.key] = payload.value;
        },
        toState(state, data) {
            Object.keys(data).forEach((item) => {
                state[item] = data[item];
            });
        },
        toMergeItem(state, { itemData }) {
            let childrenList = state.childrenList;
            Object.keys(itemData).forEach((item) => {
                childrenList = childrenList.map((el) => {
                    if (el.id == item) el = Object.assign(el, itemData[item]);
                    return el;
                });
            });
            state.childrenList = childrenList;
        },
        toMergePrice(state, { priceData }) {
            const childrenList = state.childrenList.map((item) => {
                if (priceData[item.id]) item.Price = priceData[item.id];
                return item;
            });
            state.childrenList = childrenList;
        },
        // 加入购物车
        toCart(state, { item }) {
            if (state.cartList.filter((cart) => cart.ID == item.ID && cart.IdKey == item.IdKey).length == 0) {
                state.cartList.push(cloneDeep(item));
            } else {
                state.cartList = state.cartList.map((cart) => {
                    if (cart.ID == item.ID && cart.IdKey == item.IdKey) cart.count += item.count;
                    return cart;
                });
            }
        },
        // 自定义价格
        toMyPrice(state, { id, Price }) {
            state.priceData = Object.assign({}, state.priceData, {
                [id]: Price,
            });
            if (state.cartList.length)
                state.cartList = state.cartList.map((item) => {
                    item.childrenList = item.childrenList.map((el) => {
                        if (el.ID == id) el.Price = Price;
                        return el;
                    });
                    return item;
                });
        },
        setServer(state, server) {
            state.server = server;
        },
        setFavList(state, list) {
            state.favList = list;
        },
        setServerList(state, list) {
            state.serverList = list;
        },
    },
    getters: {
        get_price: (state) => (server, item_id) => {
            const key = `${server}_${item_id}`;
            return state.custom_prices[key] || state.prices[key] || "";
        },
    },
    actions: {
        async fetch_prices({ commit, state }, { server, ids }) {
            const keys = ids.map((id) => `${server}_${id}`).filter((key) => !state.prices[key]);
            if (keys.length === 0) return Promise.resolve();

            const [auction_prices, npc_prices] = await Promise.all([
                getAuctionPrice({
                    server,
                    itemIds: ids.join(","),
                }).then((res) => {
                    const data = res.data.data;
                    return Object.entries(data).reduce((payload, [id, { Server, AvgPrice }]) => {
                        const key = `${Server}_${id}`;
                        const item = { price: AvgPrice, server: Server, from: "auction" };
                        return { ...payload, [key]: item };
                    }, {});
                }),
                getItemsPrice({
                    client: state.client,
                    ids: keys.map((key) => key.split("_").pop()).join(","),
                }).then((res) => {
                    const data = res.data;
                    return data.reduce((payload, { Price, ItemIndex }) => {
                        const key = `${server}_5_${ItemIndex}`;
                        const item = { price: Price, server, from: "npc" };
                        return { ...payload, [key]: item };
                    }, {});
                }),
            ]);
            commit(
                "update_prices",
                keys.reduce((payload, key) => {
                    const price = npc_prices[key] || auction_prices[key];
                    if (!price) return payload;
                    return { ...payload, [key]: price };
                }, {})
            );
        },

        // gonggao
        asyncChildrenList(ctx, arr) {
            const state = ctx.state;
            const { client } = state;
            const ids = arr.map((item) => item.id).filter((item) => !state.priceData[item]);
            const item_ids = arr.map((item) => item.id).filter((item) => !state.itemData[item]);

            if (item_ids.length) {
                getOther({ client, ids: item_ids.join(), per: arr.length }).then((res) => {
                    let itemData = {};
                    res.data.list.forEach((item) => {
                        let _obj = {};
                        Object.keys(item).forEach((el) => {
                            if (item[el]) _obj[el] = item[el];
                        });
                        delete _obj.Price;
                        itemData[item.ID] = _obj;
                    });
                    itemData = Object.assign(state.itemData, itemData);
                    ctx.commit("toState", { itemData });
                    ctx.commit("toMergeItem", { itemData });
                });
            } else {
                ctx.commit("toMergeItem", { itemData: state.itemData });
            }

            if (ids.length) {
                getItemsPrice({ ids: ids.join(), client }).then((res) => {
                    let priceData = {};
                    res.data.forEach((item) => {
                        priceData[item.ItemIndex] = item.Price;
                    });
                    priceData = Object.assign(state.priceData, priceData);
                    ctx.commit("toState", { priceData });
                    ctx.commit("toMergePrice", { priceData });
                });
            } else {
                ctx.commit("toMergePrice", { priceData: state.priceData });
            }
        },
        //添加物品进购物车
        toAddCart(ctx, { count }) {
            const state = ctx.state;
            let { item, childrenList, priceData, auctionPrice } = state;
            item.childrenList = childrenList.map((child) => {
                if (!child.Price) {
                    if (auctionPrice[child.price_id]) child.Price = auctionPrice[child.price_id];
                    if (priceData[child.id]) child.Price = priceData[child.id];
                }
                return child;
            });
            item.count = count;
            ctx.commit("toCart", { item });
        },
        toLogin() {
            User.toLogin();
        },
        getMyServer({ state, commit }) {
            if (state.isLogin) {
                getUserInfo().then((res) => {
                    commit("setServer", res.data?.data?.jx3_server);
                });
            }
        },
    },
};

export default new Vuex.Store(store);
