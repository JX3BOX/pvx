import { createStore } from "vuex";

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",
        achievements: [],
        achievementsVirtual: [],
        role: null,
        viewAchievementsName: "",
        generalTotal: 0,
        armorTotal: 0,
    },
    mutations: {
        SET_STATE(state, payload) {
            if (payload.isSession) {
                sessionStorage.setItem(payload.key, JSON.stringify(payload.value));
            }
            state[payload.key] = payload.value;
        },
    },
    getters: {},
    actions: {},
    modules: {},
};

export default createStore(store);
