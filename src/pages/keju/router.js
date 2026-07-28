import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "keju",
        path: "/",
        component: () => import("@/views/exam/Keju.vue"),
        meta: {
            i18n: {
                title: "pages.keju.title",
                keywords: "pages.keju.keywords",
                description: "pages.keju.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory("/keju/"),
    routes,
});

export default router;
