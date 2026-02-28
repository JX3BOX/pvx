import Vue from "vue";
import VueRouter from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
Vue.use(VueRouter);

const VueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(to) {
    return VueRouterPush.call(this, to).catch((err) => err);
};

const Index = () => import("@/views/horse/Index.vue");
const Single = () => import("@/views/horse/HorseSingle.vue");

const IndexMobile = () => import("@/views/horse/mobile/Index.vue");
const SingleMobile = () => import("@/views/horse/mobile/HorseSingle.vue");
const routes = [
    { name: "index", path: "/", component:  isMiniProgram() || isApp() ? IndexMobile : Index },
    { name: "single", path: "/:id([0-9]_\\d+)", component: isMiniProgram() || isApp() ? SingleMobile : Single },
];

const router = new VueRouter({
    mode: "history",
    base: "/horse",
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
