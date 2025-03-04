import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const List = () => import("@/views/pet/PetList.vue");
const Single = () => import("@/views/pet/PetSingle.vue");

const routes = [
    { name: "list", path: "/", component: List },
    { name: "single", path: "/:id(\\d+)", component: Single },
];

const router = new VueRouter({
    mode: "history",
    base: "/pet",
    routes,
});

export default router;
