import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const routes = [
    {
        name: "list",
        path: "/",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/pet/miniprogram/PetList.vue")
                : () => import("@/views/pet/PetList.vue"),
        meta: {
            i18n: {
                title: "pages.pet.title",
                keywords: "pages.pet.keywords",
                description: "pages.pet.description",
            },
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/pet/miniprogram/PetSingle.vue")
                : () => import("@/views/pet/PetSingle.vue"),
        meta: {
            i18n: {
                title: "pages.pet.single.title",
                keywords: "pages.pet.single.keywords",
                description: "pages.pet.single.description",
            },
        },
    },
    {
        name: "search",
        path: "/search",
        component: () => import("@/views/pet/miniprogram/PetSearch.vue"),
        meta: {
            i18n: {
                title: "pages.pet.search.title",
                keywords: "pages.pet.search.keywords",
                description: "pages.pet.search.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/pet/'),
    routes,
});

export default router;
