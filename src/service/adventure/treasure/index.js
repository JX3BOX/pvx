import { $cms, $team, $next, $node } from "@jx3box/jx3box-common/js/api";

const client = location.href.includes("origin") ? "origin" : "std";

export function getUserInfo() {
    return $cms().get(`api/cms/user/my/info`, {
        params: {
            client,
        },
    });
}

export function getUserRoles() {
    return $team().get(`api/team/my-game-roles?nopage`);
}

export function refreshAchievementsTask(data) {
    return $next().post(`/api/next2/qqbot/picture-task/refresh/role-achievements`, data);
}

export function getRoleGameAchievements(jx3id) {
    return $next().get(`/api/next2/user-achievements`, {
        params: {
            jx3id,
        },
    });
}

export function getRoleGameAchievementsByRoleAndServer(params) {
    return $next().get(`/api/next2/user-achievements/by-role-and-server`, {
        params,
    });
}

export function getAdventures(params) {
    return $node().get(`/serendipities`, {
        params: {
            ...params,
            client,
        },
    });
}

export function getAchievements() {
    return $node().get(`/serendipity/achievements`, {
        params: {
            client,
        },
    });
}
