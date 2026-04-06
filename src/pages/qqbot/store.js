import { createStore } from "vuex";

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",
    },
    mutations: {},
    getters: {},
    actions: {},
    modules: {},
};

export default createStore(store);
