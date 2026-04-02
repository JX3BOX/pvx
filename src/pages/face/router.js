import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const routes = [
    {
        name: "list",
        path: "/",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/face/mobile/List.vue")
                : () => import("@/views/face/List.vue"),
        meta: {
            i18n: {
                title: "pages.face.title",
                keywords: "pages.face.keywords",
                description: "pages.face.description",
            },
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component:
            isMiniProgram() || isApp()
                ? () => import("@/views/face/mobile/Single.vue")
                : () => import("@/views/face/Single.vue"),
        meta: {
            i18n: {
                title: "pages.face.single.title",
                keywords: "pages.face.single.keywords",
                description: "pages.face.single.description",
            },
        },
    },
    {
        name: "facedata",
        path: "/facedata",
        component: () => import("@/views/face/Parse.vue"),
        meta: {
            i18n: {
                title: "pages.face.facedata.title",
                keywords: "pages.face.facedata.keywords",
                description: "pages.face.facedata.description",
            },
        },
    },
    {
        name: "faceDataMobile",
        path: "/FaceDataMobile",
        component: () => import("@/views/face/mobile/FaceData.vue"),
        meta: {
            i18n: {
                title: "pages.face.faceDataMobile.title",
                keywords: "pages.face.faceDataMobile.keywords",
                description: "pages.face.faceDataMobile.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/face/'),
    routes,
});

export default router;
