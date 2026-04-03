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
    // {
    //     name: "treasure",
    //     path: "/treasure",
    //     redirect: () => {
    //         const isMobile = window.innerWidth <= 768;
    //         return isMobile ? "/treasure/portrait" : "/treasure/landscape";
    //     },
    //     meta: {
    //         i18n: {
    //             title: "pages.adventure.treasure.title",
    //             keywords: "pages.adventure.treasure.keywords",
    //             description: "pages.adventure.treasure.description",
    //         },
    //     },

    // },
    // {
    //     name: "landscape",
    //     path: "/treasure/landscape",
    //     component: () => import("@/views/adventure/landscape.vue"),
    //     meta: {
    //         name: "横屏",
    //         i18n: {
    //             title: "pages.adventure.treasure.landscape.title",
    //             keywords: "pages.adventure.treasure.landscape.keywords",
    //             description: "pages.adventure.treasure.landscape.description",
    //         },

    //     },
    // },
    // {
    //     name: "portrait",
    //     path: "/treasure/portrait",
    //     component: () => import("@/views/adventure/portrait.vue"),
    //     meta: {
    //         name: "竖屏",
    //         i18n: {
    //             title: "pages.adventure.treasure.portrait.title",
    //             keywords: "pages.adventure.treasure.portrait.keywords",
    //             description: "pages.adventure.treasure.portrait.description",
    //         },
    //     },
    // },
];

const router = createRouter({
    history: createWebHistory('/adventure/'),
    routes,
});

export default router;

