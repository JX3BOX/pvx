import Vue from "vue";
import Vuex from "vuex";
import { getAuctionPrice, getItemsPrice } from "@/service/manufacture/manufacture.js";
import { map, reduce } from "lodash";

Vue.use(Vuex);

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",

        // 使用 `服务器_id` 作为key存储价格
        prices: {},
        custom_prices: {},
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
            state.custom_prices = reduce(state.custom_prices, (prices, cur, key) => {
                if (!keys.includes(key)) prices[key] = cur;
                return prices;
            }, {});
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
    },
};

export default new Vuex.Store(store);
