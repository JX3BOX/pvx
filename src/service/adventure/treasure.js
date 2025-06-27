import { $cms, $team, $next, $node } from "@jx3box/jx3box-common/js/https";

const client = location.href.includes("origin") ? "origin" : "std";

// 获取用户信息
export function getUserInfo() {
    return $cms().get(`api/cms/user/my/info`, {
        params: {
            client,
        },
    });
}

// 获取用户角色
export function getUserRoles() {
    return $team({ proxy: true }).get(`api/team/my-game-roles?nopage`);
}

// 获取角色的成就状态
export function getRoleGameAchievements(jx3id) {
    return $next({ proxy: true }).get(`/api/next2/user-achievements`, {
        params: {
            jx3id,
        },
    });
}

// 根据服务器和角色名获取角色成就
export function getRoleGameAchievementsByRoleAndServer(params) {
    return $next({ proxy: true }).get(`/api/next2/user-achievements/by-role-and-server`, {
        params,
    });
}

// 获取奇遇列表
export function getAdventures(params) {
    return $node().get(`/serendipities`, {
        params: {
            ...params,
            client,
        },
    });
}

// 获取用户奇遇映射表
export function getAchievements() {
    return $node().get(`/serendipity/achievements`, {
        client,
    });
}
