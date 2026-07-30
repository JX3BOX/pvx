import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const ExamIndex =
    isMiniProgram() || isApp()
        ? () => import("@/views/exam/mobile/exam.vue")
        : () => import("@/views/exam/Index.vue");

const indexMeta = {
    i18n: {
        title: "pages.exam.title",
        keywords: "pages.exam.keywords",
        description: "pages.exam.description",
    },
};

function redirectLegacyIndex(to) {
    const type = to.query.tab === "paper" || to.params.type === "3" ? "paper" : "question";
    const query = { ...to.query };
    delete query.tab;
    return { name: `${type}List`, query, hash: to.hash };
}

const routes = [
    {
        name: "index",
        path: "/",
        redirect: redirectLegacyIndex,
    },
    {
        name: "legacyIndex",
        path: "/:type(2|3)",
        redirect: redirectLegacyIndex,
    },
    {
        name: "questionList",
        path: "/question",
        component: ExamIndex,
        meta: indexMeta,
    },
    {
        name: "paperList",
        path: "/paper",
        component: ExamIndex,
        meta: indexMeta,
    },
    {
        name: "paper",
        path: "/paper/:id",
        component: () => import("@/views/exam/Paper.vue"),
        meta: {
            i18n: {
                title: "pages.exam.paper.title",
                keywords: "pages.exam.paper.keywords",
                description: "pages.exam.paper.description",
            },
        },
    },
    {
        name: "question",
        path: "/question/:id",
        component: () => import("@/views/exam/Question.vue"),
        meta: {
            i18n: {
                title: "pages.exam.question.title",
                keywords: "pages.exam.question.keywords",
                description: "pages.exam.question.description",
            },
        },
    },
    {
        name: "questionPublish",
        path: "/questionPublish/:id?",
        component: () => import("@/views/exam/QuestionPublish.vue"),
        meta: {
            i18n: {
                title: "pages.exam.questionPublish.title",
                keywords: "pages.exam.questionPublish.keywords",
                description: "pages.exam.questionPublish.description",
            },
        },
    },
    {
        name: "paperPublish",
        path: "/paperPublish/:id?",
        component: () => import("@/views/exam/PaperPublish.vue"),
        meta: {
            i18n: {
                title: "pages.exam.paperPublish.title",
                keywords: "pages.exam.paperPublish.keywords",
                description: "pages.exam.paperPublish.description",
            },
        },
    },
    {
        name: "gameQuestionPublish",
        path: "/gameQuestionPublish/:id?",
        component: () => import("@/views/exam/GameQuestionPublish.vue"),
        meta: {
            i18n: {
                title: "pages.exam.gameQuestionPublish.title",
                keywords: "pages.exam.gameQuestionPublish.keywords",
                description: "pages.exam.gameQuestionPublish.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory('/exam/'),
    routes,
});

export default router;
