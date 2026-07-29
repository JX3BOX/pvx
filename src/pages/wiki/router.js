import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "index",
        path: "/",
        redirect: "/overview",
    },
    {
        name: "overview",
        path: "/overview",
        component: () => import("@/views/wiki/overview.vue"),
        meta: {
            i18n: {
                title: "pages.wiki.overview.title",
                keywords: "pages.wiki.overview.keywords",
                description: "pages.wiki.overview.description",
            },
        },
    },
    {
        name: "compare",
        path: "/compare",
        component: () => import("@/views/wiki/compare.vue"),
        meta: {
            i18n: {
                title: "pages.wiki.compare.title",
                keywords: "pages.wiki.compare.keywords",
                description: "pages.wiki.compare.description",
            },
        },
    },
    {
        name: "leap",
        path: "/leap",
        component: () => import("@/views/wiki/leap.vue"),
        meta: {
            i18n: {
                title: "pages.wiki.leap.title",
                keywords: "pages.wiki.leap.keywords",
                description: "pages.wiki.leap.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory("/achievement/"),
    routes,
});

// router.beforeEach((to) => {
//     if (to.fullPath.includes("/#")) {
//         return to.fullPath.replace("/#", "");
//     }
//     return true;
// });

export default router;
