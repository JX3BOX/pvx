import Vue from "vue";
import VueRouter from "vue-router";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";

// 解决重复点击路由报错的BUG
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const Paper = () => import("@/views/exam/Paper.vue");
const Question = () => import("@/views/exam/Question.vue");
const QuestionPublish = () => import("@/views/exam/QuestionPublish.vue");
const PaperPublish = () => import("@/views/exam/PaperPublish.vue");
const GameQuestionPublish = () => import("@/views/exam/GameQuestionPublish.vue");

const routes = [
    {
        name: "index",
        path: "/:type?",
        component: isMiniProgram() ? () => import("@/views/exam/mobile/exam.vue") : () => import("@/views/exam/Index.vue"),
    },
    { name: "paper", path: "/paper/:id?", component: Paper },
    { name: "question", path: "/question/:id?", component: Question },
    { name: "questionPublish", path: "/questionPublish/:id?", component: QuestionPublish },
    { name: "paperPublish", path: "/paperPublish/:id?", component: PaperPublish },
    { name: "gameQuestionPublish", path: "/gameQuestionPublish/:id?", component: GameQuestionPublish },
];

const router = new VueRouter({
    mode: "history",
    base: "/exam",
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return {
                x: 0,
                y: 0,
            };
        }
    },
});

router.beforeEach((to, from, next) => {
    if (to.fullPath.includes("/#")) {
        next(to.fullPath.replace("/#", ""));
    }
    next();
});

export default router;
