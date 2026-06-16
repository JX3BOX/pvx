import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "home",
        path: "/",
        component: () => import("@/views/partner/Index.vue"),
        meta: {
            i18n: {
                title: "pages.partner.title",
                keywords: "pages.partner.keywords",
                description: "pages.partner.description",
            },
        },
    },
    {
        name: "detail",
        path: "/:id(\\d+)",
        component: () => import("@/views/partner/Index.vue"),
        meta: {
            i18n: {
                title: "pages.partner.detail.title",
                keywords: "pages.partner.detail.keywords",
                description: "pages.partner.detail.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory("/partner/"),
    routes,
});

export default router;
