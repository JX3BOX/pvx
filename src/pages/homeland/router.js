import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const routes = [
    {
        name: "index",
        path: "/",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/homeland/miniprogram/Index.vue")
                : () => import("@/views/homeland/Index.vue"),
        meta: {
            i18n: {
                title: "pages.homeland.title",
                keywords: "pages.homeland.keywords",
                description: "pages.homeland.description",
            },
        },
    },
    {
        name: "tutorial",
        path: "/tutorial",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/homeland/miniprogram/Tutorial.vue")
                : () => import("@/views/homeland/Tutorial.vue"),
        meta: {
            i18n: {
                title: "pages.homeland.tutorial.title",
                keywords: "pages.homeland.tutorial.keywords",
                description: "pages.homeland.tutorial.description",
            },
        },
    },
    {
        name: "maps",
        path: "/maps",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/homeland/miniprogram/Map.vue")
                : () => import("@/views/homeland/Maps.vue"),
        meta: {
            i18n: {
                title: "pages.homeland.maps.title",
                keywords: "pages.homeland.maps.keywords",
                description: "pages.homeland.maps.description",
            },
        },
    },
    {
        name: "flower",
        path: "/flower",
        component: () => import("@/views/homeland/Flower.vue"),
        meta: {
            i18n: {
                title: "pages.homeland.flower.title",
                keywords: "pages.homeland.flower.keywords",
                description: "pages.homeland.flower.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/homeland/'),
    routes,
});

export default router;
