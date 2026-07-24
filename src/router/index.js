import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const routes = [
    {
        name: "pvxroot",
        path: "/",
        component: () => import("@/App.vue"),
        meta: {
            i18n: {
                title: "pages.index.title",
                keywords: "pages.index.keywords",
                description: "pages.index.description",
            },
        },
    },
    // ===== 剑侠录 =====
    {
        name: "questsection",
        path: "/questsection",
        component: () => import("@/views/questsection/Index.vue"),
        meta: {
            i18n: {
                title: "pages.questsection.title",
                keywords: "pages.questsection.keywords",
                description: "pages.questsection.description",
            },
        },
    },
    {
        name: "questsection-detail",
        path: "/questsection/:id(\\d+)",
        component: () => import("@/views/questsection/Index.vue"),
        meta: {
            i18n: {
                title: "pages.questsection.detail.title",
                keywords: "pages.questsection.detail.keywords",
                description: "pages.questsection.detail.description",
            },
        },
    },
    // ===== 侠客行 =====
    {
        name: "partner",
        path: "/partner",
        component: () => import("@/views/partner/Index.vue"),
        meta: {
            i18n: {
                title: "pages.partner.title",
                keywords: "pages.partner.keywords",
                description: "pages.partner.description",
            },
        },
    },
    {
        name: "partner-detail",
        path: "/partner/:id(\\d+)",
        component: () => import("@/views/partner/Index.vue"),
        meta: {
            i18n: {
                title: "pages.partner.detail.title",
                keywords: "pages.partner.detail.keywords",
                description: "pages.partner.detail.description",
            },
        },
    },
    // ===== 奇遇珍卷 =====
    {
        name: "adventure",
        path: "/codex/adventure",
        redirect: () => {
            const isMobile = window.innerWidth <= 768;
            return isMobile ? "/codex/adventure/portrait" : "/codex/adventure/landscape";
        },
        meta: {
            i18n: {
                title: "pages.adventure.treasure.title",
                keywords: "pages.adventure.treasure.keywords",
                description: "pages.adventure.treasure.description",
            },
        },

    },
    {
        name: "landscape",
        path: "/codex/adventure/landscape",
        component: () => import("@/views/adventure/treasure/pc/Landscape.vue"),
        meta: {
            i18n: {
                title: "pages.adventure.treasure.landscape.title",
                keywords: "pages.adventure.treasure.landscape.keywords",
                description: "pages.adventure.treasure.landscape.description",
            },

        },
    },
    {
        name: "portrait",
        path: "/codex/adventure/portrait",
        component: () => import("@/views/adventure/treasure/miniprogram/Portrait.vue"),
        meta: {
            i18n: {
                title: "pages.adventure.treasure.portrait.title",
                keywords: "pages.adventure.treasure.portrait.keywords",
                description: "pages.adventure.treasure.portrait.description",
            },
        },
    },

    // ===== 资历宝典 =====
    {
        name: "achievement",
        path: "/codex/achievement",
        component: () => import("@/views/wiki/index.vue"),
        redirect: "/codex/achievement/overview",
        children: [
            {
                name: "overview",
                path: "overview",
                component:
                    isMiniProgram() || isApp()
                        ? () => import("@/views/wiki/miniprogram/overview.vue")
                        : () => import("@/views/wiki/overview.vue"),
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
                path: "compare",
                component:
                    isMiniProgram() || isApp()
                        ? () => import("@/views/wiki/miniprogram/compare.vue")
                        : () => import("@/views/wiki/compare.vue"),
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
                path: "leap",
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
                path: "catalogue",
                meta: {
                    title: "目录列表",
                    i18n: {
                        title: "pages.wiki.catalogue.title",
                        keywords: "pages.wiki.catalogue.keywords",
                        description: "pages.wiki.catalogue.description",
                    },
                },
                component: () => import("@/views/wiki/miniprogram/catalogue.vue"),
            },
            {
                name: "list",
                path: "list",
                meta: {
                    title: "成就列表",
                    i18n: {
                        title: "pages.wiki.list.title",
                        keywords: "pages.wiki.list.keywords",
                        description: "pages.wiki.list.description",
                    },
                },
                component: () => import("@/views/wiki/miniprogram/achievement.vue"),
            },
            {
                name: "compare/catalogue",
                path: "compare/catalogue",
                meta: {
                    title: "对比目录列表",
                    i18n: {
                        title: "pages.wiki.compare.catalogue.title",
                        keywords: "pages.wiki.compare.catalogue.keywords",
                        description: "pages.wiki.compare.catalogue.description",
                    },
                },
                component: () => import("@/views/wiki/miniprogram/compare/compare_catalogue.vue"),
            },
            {
                name: "compare/achievement",
                path: "compare/achievement",
                meta: {
                    title: "对比成就列表",
                    i18n: {
                        title: "pages.wiki.compare.achievement.title",
                        keywords: "pages.wiki.compare.achievement.keywords",
                        description: "pages.wiki.compare.achievement.description",
                    },
                },
                component: () => import("@/views/wiki/miniprogram/compare/compare_achievement.vue"),
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory('/pvx/'),
    routes,
});

export default router;
