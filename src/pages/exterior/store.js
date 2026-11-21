import { createStore } from "vuex";
import { jx3ClientType } from "@jx3box/jx3box-common/js/utils";

export default createStore({
    state: {
        pendingWarehouseGroups: {},
        client: jx3ClientType() === 2 ? "origin" : "std",
    },
    mutations: {
        setPendingWarehouseGroups(state, { account, groups }) {
            state.pendingWarehouseGroups[account] = groups;
        },
    },
});
