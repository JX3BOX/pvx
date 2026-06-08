import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "home",
        path: "/",
        component: () => import("@/views/swordsman/Index.vue"),
        meta: {
            i18n: {
                title: "pages.swordsman.title",
                keywords: "pages.swordsman.keywords",
                description: "pages.swordsman.description",
            },
        },
    },
    {
        name: "detail",
        path: "/:id(\\d+)",
        component: () => import("@/views/swordsman/Index.vue"),
        meta: {
            i18n: {
                title: "pages.swordsman.detail.title",
                keywords: "pages.swordsman.detail.keywords",
                description: "pages.swordsman.detail.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory("/swordsman/"),
    routes,
});

export default router;
