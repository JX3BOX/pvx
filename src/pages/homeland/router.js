import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
const Flower = () => import("@/views/homeland/Flower.vue");
const Maps = () => import("@/views/homeland/Maps.vue");
const Tutorial = () => import("@/views/homeland/Tutorial.vue");
const Index = () => import("@/views/homeland/Index.vue");

const IndexMobile = () => import("@/views/homeland/mobile/Index.vue");
const TutorialMobile = () => import("@/views/homeland/mobile/Tutorial.vue");
const MobileMaps = () => import("@/views/homeland/mobile/Map.vue");
const routes = [
    { name: "index", path: "/", component: isMiniProgram() ?IndexMobile:Index },
    { name: "tutorial", path: "/tutorial", component: isMiniProgram()?TutorialMobile:Tutorial },
    { name: "maps", path: "/maps", component: isMiniProgram()?MobileMaps: Maps },
    { name: "flower", path: "/flower", component: Flower },
];

const router = new VueRouter({
    mode: "history",
    base: "/homeland",
    routes,
});

export default router;
