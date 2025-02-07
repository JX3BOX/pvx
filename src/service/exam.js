import { $next } from "@jx3box/jx3box-common/js/https";

//
function getExamPaperList(params) {
    return $next({ proxy: true }).get("/api/question/user-exam-paper", {
        params,
    });
}

function getExamQuestionList(params) {
    return $next({ proxy: true }).get("/api/question/public-list", {
        params,
    });
}

function getPaper(id) {
    return $next({ proxy: true }).get("api/question/user-exam-paper/" + id + "?details");
}

function getQuestion(id) {
    return $next({ proxy: true }).get("api/question/" + id + "/no-answer");
}

function getPublishQuestion(id) {
    return $next({ proxy: true }).get(`/api/question/${id}`);
}
function getPublishPaper(id) {
    return $next({ proxy: true }).get("/api/question/" + "exam-paper/" + id);
}

function submitAnswer(id, answers, force = false) {
    return $next({ proxy: true }).post(
        `api/question/user-exam-paper/${id}/i-finish-all${force ? "?force" : ""}`,
        answers
    );
}

function submitQuestionAnswer(id, answers) {
    return $next({ proxy: true }).post(`api/question/user-exam-paper/q/${id}/answer`, answers);
}

function getAnswer(id) {
    return $next({ proxy: true }).post(`api/question/user-exam-paper/${id}/i-need-answer`);
}

function getStat(type, id) {
    return $next({ proxy: true }).get("api/summary-any/" + type + "-" + id + "/stat");
}

function checkPaper(id, action) {
    return $next({ proxy: true }).put("api/question/exam-paper/" + id + "/opt", "", {
        params: {
            action: action,
        },
        withCredentials: true,
    });
}

function getExamRandom(count = 12) {
    return $next({ proxy: true }).get("api/game/exam/random", {
        params: {
            count,
        },
    });
}
function getExamByKey(params) {
    return $next({ proxy: true }).get("api/game/exam/search", {
        params,
    });
}
function createGameQuestion(data) {
    return $next({ proxy: true }).post("api/game/exam/ugc", data);
}

function getGameQuestion(rid) {
    return $next({ proxy: true }).get("api/game/exam/details/" + rid);
}

function createQuestion(data) {
    return $next({ proxy: true }).post("/api/question/create", data);
}

function updateQuestion(id, data) {
    return $next({ proxy: true }).put("/api/question/" + id + "/update", data);
}

function createPaper(data) {
    return $next({ proxy: true }).post("/api/question/" + "exam-paper", data);
}

function updatePaper(id, data) {
    return $next({ proxy: true }).put("/api/question/" + "exam-paper/" + id, data);
}

function getQuestions(query) {
    return $next({ proxy: true }).get("/api/question/" + "my-list", {
        params: query,
    });
}

function getPapers(query) {
    return $next({ proxy: true }).get("/api/question/exam-paper?my", {
        params: query,
    });
}

function deleteQuestion(id) {
    return $next({ proxy: true }).delete(`/api/question/my/${id}`);
}

function deletePaper(id) {
    return $next({ proxy: true }).delete(`/api/question/exam-paper/my/${id}`);
}

export {
    getExamPaperList,
    getExamQuestionList,
    getPaper,
    getQuestion,
    submitAnswer,
    submitQuestionAnswer,
    getAnswer,
    getStat,
    checkPaper,
    getExamRandom,
    createQuestion,
    updateQuestion,
    createPaper,
    updatePaper,
    getQuestions,
    getPapers,
    deleteQuestion,
    deletePaper,
    getExamByKey,
    createGameQuestion,
    getGameQuestion,
    getPublishQuestion,
    getPublishPaper,
};
