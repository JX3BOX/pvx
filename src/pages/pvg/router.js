import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const routes = [
    {
        name: "manufacture",
        path: "/manufacture",
        component:
            window.innerWidth <= 768
                ? () => import("@/views/pvg/ManufactureMobile.vue")
                : () => import("@/views/pvg/Manufacture.vue"),
        meta: {
            name: "技艺助手",
            i18n: {
                title: "pages.pvg.manufacture.title",
                keywords: "pages.pvg.manufacture.keywords",
                description: "pages.pvg.manufacture.description",
            },
        },
    },
    {
        name: "price",
        path: "/price",
        component: isMiniProgram() || isApp()
            ? () => import("@/views/pvg/price/mobile/index.vue")
            : () => import("@/views/pvg/price/index.vue"),
        meta: {
            name: "价格走势",
            i18n: {
                title: "pages.pvg.price.title",
                keywords: "pages.pvg.price.keywords",
                description: "pages.pvg.price.description",
            },
        },
    },
    {
        name: "gonggao",
        path: "/gonggao",
        component: () => import("@/views/pvg/gonggao/Gonggao.vue"),
        redirect: {
            name: "daily",
        },
        meta: {
            name: "活动告示",
            i18n: {
                title: "pages.pvg.gonggao.title",
                keywords: "pages.pvg.gonggao.keywords",
                description: "pages.pvg.gonggao.description",
            },
        },
        children: [
            {
                name: "daily",
                path: "daily",
                component: () => import("@/components/pvg/gonggao/Daily.vue"),
                meta: {
                    name: "速览",
                    i18n: {
                        title: "pages.pvg.gonggao.daily.title",
                        keywords: "pages.pvg.gonggao.daily.keywords",
                        description: "pages.pvg.gonggao.daily.description",
                    },
                },
            },
            {
                name: "calendar",
                path: "calendar/:year(\\d+)/:month(\\d+)/:date(\\d+)?",
                component: () => import("@/components/pvg/gonggao/Calendar.vue"),
                meta: {
                    name: "日历",
                    i18n: {
                        title: "pages.pvg.gonggao.calendar.title",
                        keywords: "pages.pvg.gonggao.calendar.keywords",
                        description: "pages.pvg.gonggao.calendar.description",
                    },
                },
            },
            {
                name: "server",
                path: "server",
                component: () => import("@/components/pvg/gonggao/Server.vue"),
                meta: {
                    name: "开服状态",
                    i18n: {
                        title: "pages.pvg.gonggao.server.title",
                        keywords: "pages.pvg.gonggao.server.keywords",
                        description: "pages.pvg.gonggao.server.description",
                    },
                },
            },
            {
                name: "calendarSingle",
                path: "single/:id",
                component: () => import("@/components/pvg/gonggao/calendar/Single.vue"),
                meta: {
                    sidebar: true,
                    i18n: {
                        title: "pages.pvg.gonggao.single.title",
                        keywords: "pages.pvg.gonggao.single.keywords",
                        description: "pages.pvg.gonggao.single.description",
                    },
                },
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory('/pvg/'),
    routes,
});
const today = new Date();

router.beforeEach((to) => {
    if (to.fullPath === "/gonggao/calendar") {
        return `${to.fullPath}/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    }
    return true;
});

export default router;
