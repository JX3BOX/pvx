import Vue from "vue";
import VueRouter from "vue-router";

// 解决重复点击路由报错的BUG
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const Index = () => import("@/views/book/Index.vue");
const Single = () => import("@/views/book/Single.vue");

const routes = [
    { name: "index", path: "/", component: Index },
    { name: "single", path: "/:id([0-9]+_\\d+)", component: Single },
];

const router = new VueRouter({
    mode: "history",
    base: "/book",
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return {
                x: 0,
                y: 0,
            };
        }
    },
});

router.beforeEach((to, from, next) => {
    if (to.fullPath.includes("/#")) {
        next(to.fullPath.replace("/#", ""));
    }
    next();
});

export default router;
