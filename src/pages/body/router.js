import Vue from "vue";
import VueRouter from "vue-router";
import { isPhone } from "@/utils/index";
Vue.use(VueRouter);

const List = () => import("@/views/body/List.vue");
const Single = () => import("@/views/body/Single.vue");
const Data = () => import("@/views/body/Parse.vue");
const listMobile = () => import("@/views/body/mobile/List.vue");
const singleMobile = () => import("@/views/body/mobile/Single.vue");
const BodydatMobile = () => import("@/views/body/mobile/Bodydat.vue");

const routes = [
    { name: "list", path: "/", component: List },
    { name: "single", path: "/:id(\\d+)", component: Single },
    { name: "bodydata", path: "/bodydata", component: Data },
    { name: "listMobile", path: "/listMobile", component: listMobile },
    { name: "singleMobile", path: "/singleMobile/:id(\\d+)", component: singleMobile },
    { name: "bodydatMobile", path: "/BodydatMobile", component: BodydatMobile },
];

const router = new VueRouter({
    mode: "history",
    base: "/body",
    routes,
});
router.beforeEach((to, from, next) => {
    if (to.name === "list" && isPhone()) {
        next({ name: "listMobile", replace: true });
    } else {
        next();
    }
});
export default router;
