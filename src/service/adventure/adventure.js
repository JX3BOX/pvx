import { $node, axios, $team } from "@jx3box/jx3box-common/js/api";
import { __dataPath } from "@/utils/config";

// 获取奇遇列表
function getAdventures(params) {
    return $node().get(`/serendipities`, {
        params,
    });
}
// 获取奇遇详情
function getAdventure(id, params) {
    return $node().get(`/serendipity/${id}`, { params });
}
// 获取奇遇任务链

function getAdventureTask(id, params) {
    return $node().get(`/serendipity/${id}/task`, { params });
}

function getSerendipityAchievementIds() {
    return axios.get(`${__dataPath}pvx/serendipity/output/serendipity.json`);
}
function getSerendipityAchievementId(dwId, { params }) {
    return $node().get(`/serendipity/${dwId}/achievement`, { params });
}
function getUserSchool() {
    return $team().get("api/team/my-game-roles");
}

export {
    getAdventures,
    getAdventure,
    getAdventureTask,
    getSerendipityAchievementIds,
    getSerendipityAchievementId,
    getUserSchool,
};
