import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const isMini = isMiniProgram() || isApp();

const routes = [
    {
        name: "reputation",
        path: "/",
        component: () => isMini
            ? import("@/views/reputation/miniprogram/IndexMiniprogram.vue")
            : import("@/views/reputation/Index.vue"),
        meta: {
            sidebar: false,
            i18n: {
                title: "pages.reputation.title",
                keywords: "pages.reputation.keywords",
                description: "pages.reputation.description",
            },
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component: () => import("@/views/reputation/Single.vue"),
        meta: {
            i18n: {
                title: "pages.reputation.single.title",
                keywords: "pages.reputation.single.keywords",
                description: "pages.reputation.single.description",
            },
        },
    },
    {
        name: "search",
        path: "/search",
        component: () => isMini
            ? import("@/views/reputation/miniprogram/SearchMiniprogram.vue")
            : import("@/views/reputation/Search.vue"),
        meta: {
            i18n: {
                title: "pages.reputation.search.title",
                keywords: "pages.reputation.search.keywords",
                description: "pages.reputation.search.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/reputation/'),
    routes,
});

export default router;
