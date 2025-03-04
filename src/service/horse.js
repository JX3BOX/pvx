import { $node, $next, $cms } from "@jx3box/jx3box-common/js/https";

const $ = $node();

function getHorses(params) {
    return $.get("/horses", {
        params: params,
    });
}

function getHorse(params) {
    return $.get(`/horse`, {
        params,
    });
}

function getAttrs(params) {
    return $.get("/horse/attrs", {
        params,
    });
}

function getFeeds(params) {
    return $.get("/horse/feeds", {
        params,
    });
}

function getGameReporter(params) {
    return $next().get("/api/game/reporter/horse", {
        params,
    });
}

// 赤兔 的卢
function getHorseReporter(type, server) {
    const params = {
        pageIndex: 1,
        pageSize: 50,
        server,
        type,
        subtype: "share_msg",
    };
    return $next().get("/api/game/reporter/horse", {
        params,
    });
}

function getUserInfo() {
    return $cms().get("/api/cms/user/my/info");
}

export { getHorses, getHorse, getAttrs, getFeeds, getGameReporter, getUserInfo, getHorseReporter };
