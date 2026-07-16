import { createStore } from "vuex";

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",
        bodySingle: {},
        isCollapse: false,
        timezone: "Asia/Shanghai", // 时区
    },
    mutations: {
        toState(state, data) {
            Object.keys(data).forEach((item) => {
                state[item] = data[item];
            });
        },
        SET_BODY_SINGLE(state, payload) {
            state.bodySingle = payload;
        },
    },
    getters: {},
    actions: {},
    modules: {},
};

export default createStore(store);
