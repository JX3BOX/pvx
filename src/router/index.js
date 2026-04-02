import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "pvxroot",
        path: "/",
        component: () => import("@/App.vue"),
        meta: {
            i18n: {
                title: "pages.index.title",
                keywords: "pages.index.keywords",
                description: "pages.index.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/pvx/'),
    routes,
});

export default router;

