import { createPageRouter } from "@/bootstrap/router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const Paper = () => import("@/views/exam/Paper.vue");
const Question = () => import("@/views/exam/Question.vue");
const QuestionPublish = () => import("@/views/exam/QuestionPublish.vue");
const PaperPublish = () => import("@/views/exam/PaperPublish.vue");
const GameQuestionPublish = () => import("@/views/exam/GameQuestionPublish.vue");

const routes = [
    {
        name: "index",
        path: "/:type?",
        component: isMiniProgram() || isApp() ? () => import("@/views/exam/mobile/exam.vue") : () => import("@/views/exam/Index.vue"),
    },
    { name: "paper", path: "/paper/:id?", component: Paper },
    { name: "question", path: "/question/:id?", component: Question },
    { name: "questionPublish", path: "/questionPublish/:id?", component: QuestionPublish },
    { name: "paperPublish", path: "/paperPublish/:id?", component: PaperPublish },
    { name: "gameQuestionPublish", path: "/gameQuestionPublish/:id?", component: GameQuestionPublish },
];

export default createPageRouter("/exam", routes);
