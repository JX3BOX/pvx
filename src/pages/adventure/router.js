import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const isMini = isMiniProgram() || isApp();

const routes = [
    {
        name: "list",
        path: "/",
        component: isMini
            ? () => import("@/views/adventure/miniprogram/AdventureList.vue")
            : () => import("@/views/adventure/AdventureList.vue"),
        meta: {
            i18n: {
                title: "pages.adventure.title",
                keywords: "pages.adventure.keywords",
                description: "pages.adventure.description",
            },
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component: isMini
            ? () => import("@/views/adventure/miniprogram/AdventureSingle.vue")
            : () => import("@/views/adventure/AdventureSingle.vue"),
        meta: {
            i18n: {
                title: "pages.adventure.single.title",
                keywords: "pages.adventure.single.keywords",
                description: "pages.adventure.single.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/adventure/'),
    routes,
});

export default router;
