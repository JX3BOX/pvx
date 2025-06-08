import Vue from "vue";
import VueRouter from "vue-router";

// 解决重复点击路由报错的BUG
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const qqbot = () => import("@/views/qqbot/Detail.vue");
const routes = [{ name: "qqbot-pvx-detail", path: "/pvx", component: qqbot }];

const router = new VueRouter({
    mode: "history",
    base: "/qqbot",
    routes,
});

export default router;
