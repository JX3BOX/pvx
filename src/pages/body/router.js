import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: "list",
        path: "/",
        component: () => import("@/views/body/List.vue"),
        meta: {
            i18n: {
                title: "pages.body.title",
                keywords: "pages.body.keywords",
                description: "pages.body.description",
            },
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component: () => import("@/views/body/Single.vue"),
        meta: {
            i18n: {
                title: "pages.body.single.title",
                keywords: "pages.body.single.keywords",
                description: "pages.body.single.description",
            },
        },
    },
    {
        name: "bodydata",
        path: "/bodydata",
        component: () => import("@/views/body/Parse.vue"),
        meta: {
            i18n: {
                title: "pages.body.bodydata.title",
                keywords: "pages.body.bodydata.keywords",
                description: "pages.body.bodydata.description",
            },
        },
    },
    {
        name: "bodydatMobile",
        path: "/BodydatMobile",
        redirect: { name: "bodydata" },
        meta: {
            i18n: {
                title: "pages.body.bodydatMobile.title",
                keywords: "pages.body.bodydatMobile.keywords",
                description: "pages.body.bodydatMobile.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/body/'),
    routes,
});

export default router;
