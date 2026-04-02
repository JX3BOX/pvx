import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const routes = [
    {
        name: "index",
        path: "/",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/horse/mobile/Index.vue")
                : () => import("@/views/horse/Index.vue"),
        meta: {
            i18n: {
                title: "pages.horse.title",
                keywords: "pages.horse.keywords",
                description: "pages.horse.description",
            },
        },
    },
    {
        name: "single",
        path: "/:id([0-9]_\\d+)",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/horse/mobile/HorseSingle.vue")
                : () => import("@/views/horse/HorseSingle.vue"),
        meta: {
            i18n: {
                title: "pages.horse.single.title",
                keywords: "pages.horse.single.keywords",
                description: "pages.horse.single.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/horse/'),
    routes,
});

export default router;
