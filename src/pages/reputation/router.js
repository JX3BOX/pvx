import Vue from "vue";
import VueRouter from "vue-router";

// 解决重复点击路由报错的BUG
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const Index = () => import("@/views/reputation/Index.vue");
const Single = () => import("@/views/reputation/Single.vue");
const Search = () => import("@/views/reputation/Search.vue");

const routes = [
    {
        name: "reputation",
        path: "/",
        component: Index,
        meta: {
            sidebar: false,
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component: Single,
    },
    {
        name: "search",
        path: "/search",
        component: Search,
    },
];

const router = new VueRouter({
    mode: "history",
    base: "/reputation",
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
