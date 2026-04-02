import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const routes = [
    {
        name: "furniture",
        path: "/",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/furniture/mobile/index.vue")
                : () => import("@/views/furniture/Index.vue"),
        meta: {
            sidebar: false,
            i18n: {
                title: "pages.furniture.title",
                keywords: "pages.furniture.keywords",
                description: "pages.furniture.description",
            },
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/furniture/mobile/Single.vue")
                : () => import("@/views/furniture/Single.vue"),
        meta: {
            i18n: {
                title: "pages.furniture.single.title",
                keywords: "pages.furniture.single.keywords",
                description: "pages.furniture.single.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/furniture/'),
    routes,
});

export default router;
