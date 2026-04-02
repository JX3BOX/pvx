import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const routes = [
    {
        name: "index",
        path: "/",
        redirect: "/overview",
    },
    {
        name: "overview",
        path: "/overview",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/wiki/miniprogram/overview.vue")
                : () => import("@/views/wiki/overview.vue"),
        meta: {
            i18n: {
                title: "pages.wiki.overview.title",
                keywords: "pages.wiki.overview.keywords",
                description: "pages.wiki.overview.description",
            },
        },
    },
    {
        name: "compare",
        path: "/compare",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/wiki/miniprogram/compare.vue")
                : () => import("@/views/wiki/compare.vue"),
        meta: {
            i18n: {
                title: "pages.wiki.compare.title",
                keywords: "pages.wiki.compare.keywords",
                description: "pages.wiki.compare.description",
            },
        },
    },
    {
        name: "leap",
        path: "/leap",
        component: () => import("@/views/wiki/leap.vue"),
        meta: {
            i18n: {
                title: "pages.wiki.leap.title",
                keywords: "pages.wiki.leap.keywords",
                description: "pages.wiki.leap.description",
            },
        },
    },
    {
        name: "catalogue",
        path: "/catalogue",
        meta: {
            title: "目录列表",
            i18n: {
                title: "pages.wiki.catalogue.title",
                keywords: "pages.wiki.catalogue.keywords",
                description: "pages.wiki.catalogue.description",
            },
        },
        component: () => import("@/views/wiki/miniprogram/catalogue.vue"),
    },
    {
        name: "list",
        path: "/list",
        meta: {
            title: "成就列表",
            i18n: {
                title: "pages.wiki.list.title",
                keywords: "pages.wiki.list.keywords",
                description: "pages.wiki.list.description",
            },
        },
        component: () => import("@/views/wiki/miniprogram/achievement.vue"),
    },
    {
        name: "compare/catalogue",
        path: "/compare/catalogue",
        meta: {
            title: "对比目录列表",
            i18n: {
                title: "pages.wiki.compare.catalogue.title",
                keywords: "pages.wiki.compare.catalogue.keywords",
                description: "pages.wiki.compare.catalogue.description",
            },
        },
        component: () => import("@/views/wiki/miniprogram/compare/compare_catalogue.vue"),
    },
    {
        name: "compare/achievement",
        path: "/compare/achievement",
        meta: {
            title: "对比成就列表",
            i18n: {
                title: "pages.wiki.compare.achievement.title",
                keywords: "pages.wiki.compare.achievement.keywords",
                description: "pages.wiki.compare.achievement.description",
            },
        },
        component: () => import("@/views/wiki/miniprogram/compare/compare_achievement.vue"),
    },
];

const router = createRouter({
    history: createWebHistory("/achievement/"),
    routes,
});

// router.beforeEach((to) => {
//     if (to.fullPath.includes("/#")) {
//         return to.fullPath.replace("/#", "");
//     }
//     return true;
// });

export default router;
