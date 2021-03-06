import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const Index = () => import("@/views/pvg/Index.vue");
const Manufacture = () => import("@/views/pvg/Manufacture.vue");

const routes = [
    { name: "index", path: "/", component: Index ,meta : {}},
    { name: "manufacture", path: "/manufacture", component: Manufacture,meta : {
        name : 'ζθΊε©ζ'
    } },
];

const router = new VueRouter({
    mode: "history",
    base: '/pvg',
    routes,
});

export default router;
