import { createRouter, createWebHistory } from "vue-router";

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
        path: "/adventure",
        redirect: () => {
            const isMobile = window.innerWidth <= 768;
            return isMobile ? "/adventure/portrait" : "/adventure/landscape";
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
        path: "/adventure/landscape",
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
        path: "/adventure/portrait",
        component: () => import("@/views/adventure/treasure/mobile/Portrait.vue"),
        meta: {
            i18n: {
                title: "pages.adventure.treasure.portrait.title",
                keywords: "pages.adventure.treasure.portrait.keywords",
                description: "pages.adventure.treasure.portrait.description",
            },
        },
    },
    {
        path: "/codex/adventure/:view(landscape|portrait)?",
        redirect: (to) => to.params.view ? `/adventure/${to.params.view}` : "/adventure",
    },

    // ===== 资历宝典 =====
    {
        name: "achievement",
        path: "/achievements",
        component: () => import("@/views/wiki/index.vue"),
        children: [
            {
                name: "overview",
                path: "",
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
                path: "compare",
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
        ],
    },
    {
        path: "/codex/achievement/:section(.*)*",
        redirect: (to) => {
            const section = Array.isArray(to.params.section) ? to.params.section.join("/") : to.params.section;
            return ["compare", "leap"].includes(section) ? `/achievements/${section}` : "/achievements";
        },
    },
];

const router = createRouter({
    history: createWebHistory('/pvx/'),
    routes,
});

export default router;
