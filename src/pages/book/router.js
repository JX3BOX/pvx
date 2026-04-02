import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const routes = [
    {
        name: "index",
        path: "/",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/book/mobile/Index.vue")
                : () => import("@/views/book/Index.vue"),
        meta: {
            i18n: {
                title: "pages.book.title",
                keywords: "pages.book.keywords",
                description: "pages.book.description",
            },
        },
    },
    {
        name: "single",
        path: "/:id([0-9]+_\\d+)",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/book/mobile/Single.vue")
                : () => import("@/views/book/Single.vue"),
        meta: {
            i18n: {
                title: "pages.book.single.title",
                keywords: "pages.book.single.keywords",
                description: "pages.book.single.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/book/'),
    routes,
});

export default router;
