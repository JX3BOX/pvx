import { $helper, $cms, $node, $next } from "@jx3box/jx3box-common/js/api";

const $ = $node();

// 获取成就公告
export function getBreadcrumb(key = "wiki_cj_ac") {
    return $cms()
        .get(`/api/cms/breadcrumb/${key}`)
        .then((res) => {
            return res.data.data.html || "";
        });
}

// 获取成就统计信息
export function getTotalCount() {
    return $.get(`api/node/achievement/count`);
}

// 获取成就列表
export function get_achievements(params) {
    return $.get(`api/node/achievement/list`, {
        params,
    });
}

// 获取单个成就
export function get_achievement(achievement_id, params) {
    if (!achievement_id) return null;
    return $.get(`api/node/achievement/${achievement_id}`, params);
}

export function get_relation_achievements(source_id) {
    if (!source_id) return null;
    return $.get(`/api/node/achievement/${source_id}/relations`);
}

const client = location.href.includes("origin") ? "origin" : "std";

// 获取成就统计信息
export function getAchievementsTotal() {
    return $.get(`/api/node/achievement/count`, {
        params: {
            client,
        },
    });
}

// 侧边栏分组
export function getMenus(params) {
    return $.get(`/api/node/achievement/menus`, {
        params,
    });
}

export function getAchievementPoints(general) {
    return $.get(`/api/node/achievement/points`, {
        params: {
            general,
            client,
        },
    });
}

// 获取菜单下成就
export function getMenuAchievements(sub, detail, params) {
    let url = `/api/cms/helper/achievements/${sub}`;
    if (detail) url += `/${detail}`;
    return $cms().get(url, {
        params: {
            client,
            ...params,
        },
    });
}

// 获取成就列表
export function getAchievements(params) {
    return $.get(`/api/node/achievement/list`, {
        params: Object.assign(params, { client }),
    });
}
// 获取成就列表Post
export function getAchievementsPost(params) {
    return $.post(`/api/node/achievement/list`, Object.assign(params, { client }));
}

export function searchAchievements(params) {
    return $.get(`/api/node/achievement/search`, {
        params: Object.assign(params, { client }),
    });
}

export function getRelationAchievements(source_id) {
    return $.get(`/api/node/achievement/${source_id}/relations`, {
        params: {
            client,
        },
    });
}

export function getNewestAchievements(page) {
    return $.get(`/api/node/achievement/newest`, {
        params: {
            page,
            client,
        },
    });
}

export function getAdventureAchievements(page) {
    return $.get(`/api/node/achievement/adventure`, {
        params: {
            page,
            client,
        },
    });
}

export function getWaitingAchievements(page) {
    return $cms().get(`/api/cms/helper/achievements/waiting`, {
        params: {
            page,
            client,
        },
    });
}

export function getRareAchievements(page) {
    return $.get(`/api/node/achievement/rare`, {
        params: {
            page,
            client,
        },
    });
}

// 已废弃
export function getOutPrintAchievements(page) {
    return $helper().get(`/api/achievements/out_print`, {
        params: {
            page,
            client,
        },
    });
}

// 贡献排行榜
export function getAchievementRanking(params) {
    return $cms().get(`/api/cms/wiki/post/rank`, {
        params,
    });
}

// 获取虚拟角色的成就状态
export function getVirtualRoleAchievements() {
    return $next().get(`/api/next2/virtual-achievements`);
}

// 上报虚拟角色的成就状态 只需上报新的成就ID即可，不需要上报已经完成的成就ID
export function setVirtualRoleAchievements(data) {
    return $next().post(`/api/next2/virtual-achievements`, data);
}

// 取消虚拟角色已完成的成就
export function cancelVirtualRoleAchievements(data) {
    return $next().post(`/api/next2/virtual-achievements/cancel`, data);
}

// 获取角色成就
export function getRoleGameAchievements(jx3id) {
    return $next().get(`/api/next2/user-achievements`, {
        params: {
            jx3id,
        },
    });
}

// 获取地图列表
export function getMapList(params) {
    return $.get("/api/node/v2/map/list", {
        params,
    });
}
