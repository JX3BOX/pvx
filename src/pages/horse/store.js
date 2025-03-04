import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",
        faceSingle: {},
        isCollapse: false,
        timezone: "Asia/Shanghai", // 时区
    },
    mutations: {
        toState(state, data) {
            Object.keys(data).forEach((item) => {
                state[item] = data[item];
            });
        },
    },
    getters: {},
    actions: {},
    modules: {},
};

export default new Vuex.Store(store);
