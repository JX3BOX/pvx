import { $node, $next, $cms } from "@jx3box/jx3box-common/js/https";
import axios from "axios";
import { __spider2, __dataPath } from "@/utils/config";
const $spider = axios.create({
    baseURL: __spider2,
});

// 日常 - os
function getDailyFromOs(params = {}) {
    params.status = 1;
    return $cms().get(`/api/cms/pvx/activity`, {
        params,
    });
}

// 日常
function getDaily(params) {
    return $cms({ mute: true }).get(`/api/cms/game/daily`, {
        params,
    });
}

// 美人图
function getMeirentu(server = "蝶恋花") {
    return $spider.get("/api/spider/meirentu", {
        params: {
            server: server,
        },
    });
}

// 新美人图
function getMeirentuNew(params) {
    return $cms().get(`/api/cms/pvx/beauty-paint`, {
        params,
    });
}
// 查询美人图下一次出现的日期
function getMeirentuPredict(params) {
    return $cms().get(`/api/cms/pvx/beauty-paint/predict`, {
        params,
    });
}

// 宠物福缘
function getPetLucky() {
    return axios.get(__dataPath + "pvx/pet/output/pet_lucky.json");
}

function getPets(petids, client = "std") {
    return $node().get(`/pets`, {
        params: {
            ids: petids.join(","),
            client,
        },
    });
}

// 园宅会赛
function getFurniture(params) {
    return $cms({ mute: true }).get(`/api/cms/game/furniture/match`, {
        params,
    });
}

// function getCelebrities({ client = "std" } = {}) {
//     return $node().get(`/celebrities`, {
//         params: {
//             client,
//         },
//     });
// }

// 名望
function getCelebrities(params) {
    return $cms().get(`/api/cms/game/celebrity`, {
        params,
    });
}

function getGameReporter(params) {
    return $next().get("/api/game/reporter/horse", {
        params,
    });
}
function getChituHorse(server) {
    const params = {
        pageIndex: 1,
        pageSize: 50,
        server,
        type: "chitu-horse",
        subtype: "share_msg",
    };
    return $next().get("/api/game/reporter/horse", {
        params,
    });
}

// 新闻公告相关

// 游戏公告
function getGameNews(client) {
    return $cms().get("/api/cms/game/news", {
        params: {
            client: client,
        },
    });
}

function getPosts(client = "std", type, per = 7, subtype) {
    let params = {
        client: client,
        per,
    };
    if (!!type) {
        params.type = type;
    }
    if (subtype) params.subtype = subtype;
    return $cms({ mute: true }).get("/api/cms/posts/latest", {
        params: params,
    });
}
// 获取技改
function getChangelog(params) {
    return $cms().get(`/api/cms/pve/skill/changelog`, {
        params,
    });
}

export {
    getMeirentu,
    getDaily,
    getPetLucky,
    getPets,
    getFurniture,
    getCelebrities,
    getGameReporter,
    getChituHorse,
    getGameNews,
    getPosts,
    getChangelog,
    getDailyFromOs,
    getMeirentuNew,
    getMeirentuPredict,
};
