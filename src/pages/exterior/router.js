import { createRouter, createWebHistory } from "vue-router";

export default createRouter({
    history: createWebHistory("/exterior/"),
    routes: [
        {
            name: "exterior-list",
            path: "/",
            component: () => import("@/views/exterior/List.vue"),
            meta: { i18n: { title: "pages.index.ui.menus.exterior" } },
        },
        {
            name: "exterior-house",
            path: "/house",
            component: () => import("@/views/exterior/House.vue"),
            meta: { i18n: { title: "exterior.warehouse.title" } },
        },
        {
            name: "exterior-studio",
            path: "/studio",
            component: () => import("@/views/exterior/Studio.vue"),
            meta: { i18n: { title: "exterior.studio.title" } },
        },
    ],
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || (to.name !== from.name || to.query.id !== from.query.id ? { top: 0 } : undefined);
    },
});
