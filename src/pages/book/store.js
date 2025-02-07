import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",
        recentReadList: JSON.parse(localStorage.getItem("book_readings")) || [],
        faceSingle: {},
        isCollapse: false,
        // 8为全部，默认
        currentBookType: 8,
    },
    mutations: {
        SET_RECENT_READ_LIST(state, data) {
            const len = state.recentReadList.length;
            if (!state.recentReadList.find((book) => book.idKey === data.idKey)) {
                if (len >= 20) {
                    state.recentReadList.splice(len - 1, 1);
                }
                state.recentReadList.unshift(data);
                localStorage.setItem("book_readings", JSON.stringify(state.recentReadList));
            }
        },
        CLEAR_RECENT_READ_LIST(state) {
            state.recentReadList = [];
            localStorage.removeItem("book_readings");
        },
        SET_CURRENT_BOOK_TYPE(state, type) {
            state.currentBookType = type;
        },
        toState(state, data) {
            Object.keys(data).forEach((item) => {
                state[item] = data[item];
            });
        },
    },
    getters: {},
    actions: {
        setRecentReadList({ commit }, data) {
            commit("SET_RECENT_READ_LIST", data);
        },
        clearRecentReadList({ commit }) {
            commit("CLEAR_RECENT_READ_LIST");
        },
        setCurrentBookType({ commit }, type) {
            commit("SET_CURRENT_BOOK_TYPE", type);
        },
    },
    modules: {},
};

export default new Vuex.Store(store);
