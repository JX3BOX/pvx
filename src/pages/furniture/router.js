import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "furniture",
        path: "/",
        component: () => import("@/views/furniture/Index.vue"),
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
        component: () => import("@/views/furniture/Single.vue"),
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
