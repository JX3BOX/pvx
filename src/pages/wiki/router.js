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
            workbenchPrimary: true,
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
            workbenchPrimary: true,
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
        beforeEnter: (to) => {
            if (!to.query.id) return true;
            const query = { ...to.query };
            const id = String(query.id);
            delete query.id;
            return { name: "leap-detail", params: { id }, query };
        },
        meta: {
            workbenchPrimary: true,
            i18n: {
                title: "pages.wiki.leap.title",
                keywords: "pages.wiki.leap.keywords",
                description: "pages.wiki.leap.description",
            },
        },
    },
    {
        name: "leap-detail",
        path: "/leap/:id",
        component: () => import("@/views/wiki/leap.vue"),
        meta: {
            i18n: {
                title: "pages.wiki.leap.title",
                keywords: "pages.wiki.leap.keywords",
                description: "pages.wiki.leap.description",
            },
        },
    },
    {
        name: "catalogue",
        path: "/catalogue",
        meta: {
            title: "目录列表",
            i18n: {
                title: "pages.wiki.catalogue.title",
                keywords: "pages.wiki.catalogue.keywords",
                description: "pages.wiki.catalogue.description",
            },
        },
        redirect: { name: "overview" },
    },
    {
        name: "list",
        path: "/list",
        meta: {
            title: "成就列表",
            i18n: {
                title: "pages.wiki.list.title",
                keywords: "pages.wiki.list.keywords",
                description: "pages.wiki.list.description",
            },
        },
        redirect: { name: "overview" },
    },
    {
        name: "compare/catalogue",
        path: "/compare/catalogue",
        meta: {
            title: "对比目录列表",
            i18n: {
                title: "pages.wiki.compare.catalogue.title",
                keywords: "pages.wiki.compare.catalogue.keywords",
                description: "pages.wiki.compare.catalogue.description",
            },
        },
        redirect: { name: "compare" },
    },
    {
        name: "compare/achievement",
        path: "/compare/achievement",
        meta: {
            title: "对比成就列表",
            i18n: {
                title: "pages.wiki.compare.achievement.title",
                keywords: "pages.wiki.compare.achievement.keywords",
                description: "pages.wiki.compare.achievement.description",
            },
        },
        redirect: { name: "compare" },
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
