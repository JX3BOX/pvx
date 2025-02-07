import Vue from "vue";
import VueRouter from "vue-router";

// 解决重复点击路由报错的BUG
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const routes = [
    {
        name: "manufacture",
        path: "/manufacture",
        component: () => import("@/views/pvg/Manufacture.vue"),
        meta: {
            name: "技艺助手",
        },
    },
];

const router = new VueRouter({
    mode: "history",
    base: "/pvg",
    routes,
});

export default router;
