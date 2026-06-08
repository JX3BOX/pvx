import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "home",
        path: "/",
        component: () => import("@/views/questsection/Index.vue"),
        meta: {
            i18n: {
                title: "pages.questsection.title",
                keywords: "pages.questsection.keywords",
                description: "pages.questsection.description",
            },
        },
    },
    {
        name: "detail",
        path: "/:id(\\d+)",
        component: () => import("@/views/questsection/Index.vue"),
        meta: {
            i18n: {
                title: "pages.questsection.detail.title",
                keywords: "pages.questsection.detail.keywords",
                description: "pages.questsection.detail.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory("/questsection/"),
    routes,
});

export default router;