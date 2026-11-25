import { createRouter, createWebHistory } from "vue-router";

let catalogScrollPosition;

function isCatalogList(route) {
    return route.name === "exterior-list" && !route.query.id;
}

const router = createRouter({
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
        if (savedPosition) return savedPosition;
        if (isCatalogList(to) && from.name === "exterior-list" && from.query.id && catalogScrollPosition) {
            return catalogScrollPosition;
        }
        if (to.name !== from.name || to.query.id !== from.query.id) return { top: 0 };
    },
});

router.beforeResolve((to, from) => {
    if (isCatalogList(from) && !isCatalogList(to)) {
        catalogScrollPosition =
            to.name === "exterior-list" ? { left: window.scrollX, top: window.scrollY } : undefined;
    }
});

export default router;
