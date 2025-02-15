import Vue from "vue";
import VueRouter from "vue-router";
import { isPhone } from "@/utils/index";
Vue.use(VueRouter);

const faceList = () => import("@/views/face/List.vue");
const faceSingle = () => import("@/views/face/Single.vue");
const faceData = () => import("@/views/face/Parse.vue");

const faceListMobile = () => import("@/views/face/mobile/List.vue");
const routes = [
    { name: "list", path: "/", component: faceList },
    { name: "single", path: "/:id(\\d+)", component: faceSingle },
    { name: "facedata", path: "/facedata", component: faceData },
    { name: "listMobile", path: "/listMobile", component: faceListMobile },
];

const router = new VueRouter({
    mode: "history",
    base: "/face",
    routes,
});
router.beforeEach((to, from, next) => {
    if (to.name === "list" && isPhone()) {
        next({ name: "listMobile" });
    } else {
        next();
    }
});
export default router;
