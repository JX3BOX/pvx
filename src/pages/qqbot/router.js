import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "qqbot-pvx-detail",
        path: "/pvx",
        component: () => import("@/views/qqbot/Detail.vue"),
        meta: {
            i18n: {
                title: "pages.qqbot.pvx.title",
                keywords: "pages.qqbot.pvx.keywords",
                description: "pages.qqbot.pvx.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/qqbot/'),
    routes,
});

export default router;
