import { createStore } from "vuex";

export default createStore({
    state: {
        client: location.href.includes("origin") ? "origin" : "std",
    },
});
