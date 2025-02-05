import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",
    },
    mutations: {},
    getters: {},
    actions: {},
    modules: {},
};

export default new Vuex.Store(store);
