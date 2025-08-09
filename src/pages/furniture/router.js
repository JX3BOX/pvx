import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
const VueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(to) {
    return VueRouterPush.call(this, to).catch((err) => err);
};
const furnitureList = () => import("@/views/furniture/Index.vue");
const furnitureSingle = () => import("@/views/furniture/Single.vue");
const furnitureListMobile = () => import("@/views/furniture/mobile/index.vue");
const furnitureSingleMobile = () => import("@/views/furniture/mobile/Single.vue");
const routes = [
    {
        name: "furniture",
        path: "/",
        component: isMiniProgram() ? furnitureListMobile : furnitureList,
        meta: {
            sidebar: false,
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component:isMiniProgram() ?furnitureSingleMobile:furnitureSingle,
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
