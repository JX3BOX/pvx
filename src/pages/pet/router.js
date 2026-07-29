import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "list",
        path: "/",
        component: () => import("@/views/pet/PetList.vue"),
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
        component: () => import("@/views/pet/PetSingle.vue"),
        meta: {
            i18n: {
                title: "pages.pet.single.title",
                keywords: "pages.pet.single.keywords",
                description: "pages.pet.single.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/pet/'),
    routes,
});

export default router;
