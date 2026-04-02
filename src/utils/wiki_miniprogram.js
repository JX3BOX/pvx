import { getUserRoles } from "@/service/team";
import { getRoleGameAchievements, getMenus, getAchievementPoints } from "@/service/achievement";
/********************************角色相关*********************************** */
// 缓存常量
const WIKI_MY_ROLES = "wiki_my_roles";
/**
 * 获取自己角色列表
 */
export async function getUserRolesList() {
    async function getRoleList() {
        let res = await getUserRoles();
        let list = res.data?.data?.list || [];
        sessionStorage.setItem(WIKI_MY_ROLES, JSON.stringify(list || []));
        return list;
    }
    let roleList = [];
    if (sessionStorage.getItem(WIKI_MY_ROLES)) {
        roleList = JSON.parse(sessionStorage.getItem(WIKI_MY_ROLES));
    } else {
        roleList = await getRoleList();
    }
    return roleList;
}

/*********************************成就菜单相关*********************************** */
/**
 * 获取指定jx3id成就列表
 */
export async function getRoleGameAchievementsList(jx3id) {
    let res = await getRoleGameAchievements(jx3id);
    let isSync = !!res.data?.data?.jx3id; // 是否在游戏中同步
    let list = (res.data?.data?.achievements || "")?.split(",");
    return {
        isSync,
        list,
    };
}
/**
 * 获取菜单及成就点列表
 */
const WIKI_ACHIEVEMENT_POINTS = "wiki_achievement_points";
export async function getMenuAndPoints(client) {
    let menuRes = await getMenus({ general: 1, client: client || "std" });
    let pointsRes = await getAchievementPoints();
    let menuList = menuRes.data?.data?.menus || [];
    let pointsList = pointsRes.data?.data?.points || [];
    sessionStorage.setItem(WIKI_ACHIEVEMENT_POINTS, JSON.stringify(pointsList || []));
    return {
        menuList,
        pointsList,
    };
}
/********************************成就完成状态汇总处理******************************************** */

/**
 * 获取成就完成状态汇总
 * @param {*} menuList 菜单列表
 * @param {*} finishAchievements 我全部已完成成就列表
 * @param {*} allAchievements 所有成就列表
 * @param {*} ownAchievements 针对已完成成就列表
 * @param {*} countData 成就点数据
 */
export function getAchievementsFinishStatus(
    menuList,
    finishAchievements,
    allAchievements = [],
    ownAchievements = [],
    countData = { allPoints: 0, ownPoints: 0 }
) {
    let pointsData = [];

    try {
        pointsData = JSON.parse(sessionStorage.getItem(WIKI_ACHIEVEMENT_POINTS));
    } catch (e) {}
    menuList.achievements.forEach((aItem) => {
        // 判断aItem是否是数组
        if (Array.isArray(aItem)) {
            aItem.forEach((item) => {
                if (pointsData[item]) {
                    countData.allPoints += pointsData[item];
                    allAchievements.push(item);
                    if (finishAchievements.includes(String(item))) {
                        countData.ownPoints += pointsData[item];
                        ownAchievements.push(item);
                    }
                }
            });
        } else {
            if (pointsData[aItem]) {
                countData.allPoints += pointsData[aItem];
                allAchievements.push(aItem);
                if (finishAchievements.includes(String(aItem))) {
                    countData.ownPoints += pointsData[aItem];
                    ownAchievements.push(aItem);
                }
            }
        }
    });

    if (menuList.children) {
        menuList.children.forEach((item) => {
            getAchievementsFinishStatus(item, finishAchievements, allAchievements, ownAchievements, countData);
        });
    }

    // 去重
    return {
        allAchievements: allAchievements,
        allPoints: countData.allPoints,
        ownAchievements: ownAchievements,
        ownPoints: countData.ownPoints,
    };
}
