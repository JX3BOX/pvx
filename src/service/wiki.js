import { $cms } from "@jx3box/jx3box-common/js/api";
// 贡献排行榜
export function getWikiRanking(params) {
    return $cms().get(`/api/cms/wiki/post/rank`, {
        params,
    });
}

//当前待审核的版本
export function getWiki(post_id, params) {
    return $cms().get(`/api/cms/wiki/post/id/${post_id}`, { params });
}

export function getUserInfo(uid) {
    return $cms({ mute: true }).get(`/api/cms/user/${uid}/info`);
}
//获取我的亲友列表（让用户选择亲友）
export function getMyKith(uid) {
    return $cms().get(`/api/cms/user/kith/my`);
}
//获取亲友的角色列表（选择亲友的角色）
export function getMyKithRoles(uid) {
    return $cms().get(`/api/cms/user/kith/game-roles/${uid}`);
}
//获取渡劫方案列表
export function getWikiAchievementLeapSchemaList(params) {
    return $cms().get(`/api/cms/pvx/wiki_achievement_leap_schema`, {
        params,
    });
}
//创建渡劫方案
export function createdWikiAchievementLeapSchema(params) {
    return $cms().post(`/api/cms/pvx/wiki_achievement_leap_schema`, params);
}
//获取单个渡劫方案
export function getWikiAchievementLeapSchema(id) {
    return $cms().get(`/api/cms/pvx/wiki_achievement_leap_schema/${id}`);
}
//更新单个渡劫方案
export function updateWikiAchievementLeapSchema(id, params) {
    return $cms().put(`/api/cms/pvx/wiki_achievement_leap_schema/${id}`, params);
}
//删除单个渡劫方案
export function deleteWikiAchievementLeapSchema(id) {
    return $cms().delete(`/api/cms/pvx/wiki_achievement_leap_schema/${id}`);
}
//获取某些成就的综合难度及完成进度
export function getWikiAchievementLeapSchemaProgress(ids, params = {}) {
    return $cms().post(`/api/cms/pvx/wiki_achievement_difficulty/list`, ids, { params });
}

// 获取启用的成就难度维度定义
export function getWikiAchievementDifficultyDimensions() {
    return $cms().get(`/api/cms/pvx/wiki_achievement_difficulty/dimensions`);
}

// 批量获取成就难度，使用 POST 避免成就 ID 过多导致查询串过长
export function getWikiAchievementDifficultyList(ids, params = {}) {
    return $cms().post(`/api/cms/pvx/wiki_achievement_difficulty/list`, ids, { params });
}

// 批量获取成就标签
export function getWikiAchievementTagsByAchievements(ids, params = {}) {
    return $cms().post(`/api/cms/pvx/wiki_achievement_tag/by-achievements`, ids, { params });
}

// 获取公开成就标签详情
export function getWikiAchievementTag(tagId, params = {}) {
    return $cms().get(`/api/cms/pvx/wiki_achievement_tag/${tagId}`, { params });
}

export function getWikiAchievementRecommendation(payload) {
    return $cms().post(`/api/cms/pvx/wiki_achievement_recommendation`, payload);
}

// 创建qqbot图片任务 刷图
export function refreshQQBotImage(data) {
    return $cms().post(`/api/cms/qqbot/picture_task`, data);
}
