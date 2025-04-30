import Vue from "vue";
import VueRouter from "vue-router";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
Vue.use(VueRouter);

const List = () => import("@/views/pet/PetList.vue");
const Single = () => import("@/views/pet/PetSingle.vue");
const ListMobile = () => import("@/views/pet/mobile/PetList.vue");
const SingleMobile = () => import("@/views/pet/mobile/PetSingle.vue");
const Search = () => import("@/views/pet/mobile/PetSearch.vue");
const routes = [
    { name: "list", path: "/", component: isMiniProgram() ? ListMobile : List  },
    { name: "single", path: "/:id(\\d+)", component: isMiniProgram() ? SingleMobile :Single },
    { name: "search", path: "/search", component: Search },
];

const router = new VueRouter({
    mode: "history",
    base: "/pet",
    routes,
});

export default router;
