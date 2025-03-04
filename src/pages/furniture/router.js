import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const VueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(to) {
    return VueRouterPush.call(this, to).catch((err) => err);
};

const routes = [
    {
        name: "furniture",
        path: "/",
        component: () => import("@/views/furniture/Index.vue"),
        meta: {
            sidebar: false,
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component: () => import("@/views/furniture/Single.vue"),
    },
];

const router = new VueRouter({
    mode: "history",
    base: "/furniture",
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
