import { createStore } from "vuex";

let store = {
    state: {
        client : location.href.includes('std') ? 'std' : 'origin',
    },
    mutations: {},
    getters: {},
    actions: {},
    modules: {},
};

export default createStore(store);
