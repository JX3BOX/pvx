import Vue from "vue";
import VueRouter from "vue-router";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
Vue.use(VueRouter);

const List = () => import("@/views/body/List.vue");
const Single = () => import("@/views/body/Single.vue");
const Data = () => import("@/views/body/Parse.vue");
const listMobile = () => import("@/views/body/mobile/List.vue");
const singleMobile = () => import("@/views/body/mobile/Single.vue");
const BodydatMobile = () => import("@/views/body/mobile/Bodydat.vue");

const routes = [
    { name: "list", path: "/", component: isMiniProgram() ? listMobile : List },
    { name: "single", path: "/:id(\\d+)", component: isMiniProgram() ? singleMobile : Single },
    { name: "bodydata", path: "/bodydata", component: Data },
    { name: "bodydatMobile", path: "/BodydatMobile", component: BodydatMobile },
];

const router = new VueRouter({
    mode: "history",
    base: "/body",
    routes,
});

export default router;
