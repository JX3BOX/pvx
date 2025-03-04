import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const Flower = () => import("@/views/homeland/Flower.vue");
const Maps = () => import("@/views/homeland/Maps.vue");
const Tutorial = () => import("@/views/homeland/Tutorial.vue");
const Index = () => import("@/views/homeland/Index.vue");

const routes = [
    { name: "index", path: "/", component: Index },
    { name: "tutorial", path: "/tutorial", component: Tutorial },
    { name: "maps", path: "/maps", component: Maps },
    { name: "flower", path: "/flower", component: Flower },
];

const router = new VueRouter({
    mode: "history",
    base: "/homeland",
    routes,
});

export default router;
