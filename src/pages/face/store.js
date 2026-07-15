import { createStore } from "vuex";

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",
        faceSingle: {},
    },
    mutations: {
        SET_FACE_SINGLE(state, payload) {
            state.faceSingle = payload;
        },
        UPDATE_FACE_SINGLE(state, payload) {
            Object.keys(payload).forEach((key) => {
                state.faceSingle[key] = payload[key];
            });
        },
    },
    getters: {},
    actions: {},
    modules: {},
};

export default createStore(store);
