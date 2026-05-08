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
        is_fold: false,
        faceSingle: {},
        bodySingle: {},
        isCollapse: false,
        timezone: "Asia/Shanghai",
    },
    mutations: {
        SET_STATE(state, payload) {
            if (payload.isSession) {
                sessionStorage.setItem(payload.key, JSON.stringify(payload.value));
            }
            state[payload.key] = payload.value;
        },
        toState(state, data) {
            Object.keys(data).forEach((item) => {
                state[item] = data[item];
            });
        },
        SET_FACE_SINGLE(state, payload) {
            state.faceSingle = payload;
        },
        UPDATE_FACE_SINGLE(state, payload) {
            Object.keys(payload).forEach(function (key) {
                state.faceSingle[key] = payload[key];
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
