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
    {
        name: "gonggao",
        path: "/gonggao",
        component: () => import("@/views/pvg/Gonggao.vue"),
        redirect: {
            name: "daily",
        },
        meta: {
            name: "活动告示",
        },
        children: [
            {
                name: "daily",
                path: "daily",
                component: () => import("@/components/gonggao/Daily.vue"),
                meta: {
                    name: "速览",
                },
            },
            {
                name: "calendar",
                path: "calendar/:year(\\d+)/:month(\\d+)/:date(\\d+)?",
                component: () => import("@/components/gonggao/Calendar.vue"),
                meta: {
                    name: "日历",
                },
            },
            {
                name: "server",
                path: "server",
                component: () => import("@/components/gonggao/Server.vue"),
                meta: {
                    name: "开服状态",
                },
            },
            {
                name: "calendarSingle",
                path: "single/:id",
                component: () => import("@/components/gonggao/calendar/Single.vue"),
                meta: {
                    sidebar: true,
                },
            },
        ],
    },
];

const router = new VueRouter({
    mode: "history",
    base: "/pvg",
    routes,
});

const today = new Date();

router.beforeEach((to, from, next) => {
    if (to.fullPath === "/gonggao/calendar") {
        next(`${to.fullPath}/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`);
    }
    next();
});

export default router;
