import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "list",
        path: "/",
        component: () => import("@/views/adventure/AdventureList.vue"),
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
        component: () => import("@/views/adventure/AdventureSingle.vue"),
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
