import Vue from "vue";
import VueRouter from "vue-router";

import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
Vue.use(VueRouter);

const faceList = () => import("@/views/face/List.vue");
const faceSingle = () => import("@/views/face/Single.vue");
const faceData = () => import("@/views/face/Parse.vue");

const faceListMobile = () => import("@/views/face/mobile/List.vue");
const faceListSingle = () => import("@/views/face/mobile/Single.vue");

const FaceDataMobile = () => import("@/views/face/mobile/FaceData.vue");
const routes = [
    { name: "list", path: "/", component: isMiniProgram() || isApp() ? faceListMobile : faceList },
    { name: "single", path: "/:id(\\d+)", component: isMiniProgram() || isApp() ? faceListSingle : faceSingle },
    { name: "facedata", path: "/facedata", component: faceData },
    { name: "faceDataMobile", path: "/FaceDataMobile", component: FaceDataMobile },
];

const router = new VueRouter({
    mode: "history",
    base: "/face",
    routes,
});
export default router;
