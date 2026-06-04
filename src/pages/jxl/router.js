import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "home",
        path: "/",
        component: () => import("@/views/jxl/Index.vue"),
        meta: {
            i18n: {
                title: "pages.jxl.title",
                keywords: "pages.jxl.keywords",
                description: "pages.jxl.description",
            },
        },
    },
    {
        name: "detail",
        path: "/:id(\\d+)",
        component: () => import("@/views/jxl/Index.vue"),
        meta: {
            i18n: {
                title: "pages.jxl.detail.title",
                keywords: "pages.jxl.detail.keywords",
                description: "pages.jxl.detail.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory("/jxl/"),
    routes,
});

export default router;