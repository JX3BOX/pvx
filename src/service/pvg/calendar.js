import { $cms, $helper } from "@jx3box/jx3box-common/js/https";

// 拼接年月日url
function genUrl(params) {
    const { year, month, date } = params;

    let url = "";

    year && (url += `/${year}`);
    month && (url += `/${month}`);
    date && (url += `/${date}`);

    return url;
}

// 获取日历列表
function getCalendar(params, client = "std") {
    let url = genUrl(params);

    return $cms().get("/api/cms/calendar/archive" + url, {
        params: {
            client,
        },
    });
}
// 获取日历排行榜
function getCalendarRank(params) {
    return $helper().get("api/calendar/rank", { params });
}
// 获取日历排行榜日期区间
function getRankDate() {
    return $cms().get("/api/cms/config", { params: { subtype: "calendar" } });
}
// 获取单日详情
function getDayCalendar(params) {
    let url = genUrl(params);

    return $cms().get("/api/cms/calendar/archive" + url);
}
// 新增日历
function addCalendar(data) {
    const url = genUrl(data);
    return $cms().post("/api/cms/calendar/archive" + url, data);
}
// 修改日历
function putCalendar(id, data) {
    return $cms().put(`/api/cms/calendar/${id}`, data);
}
// 管理日历
function manageCalendar(id, data) {
    return $cms().put(`/api/cms/calendar/${id}/manage`, data);
}
// 删除日历
function delCalendar(id) {
    return $cms().delete(`/api/cms/calendar/${id}`);
}
// 获取对应id的日历详情
function getDetail(id) {
    return $cms().get(`/api/cms/calendar/${id}`);
}
// 那年今日
function getHistory(params, query) {
    let url = genUrl(params);
    return $cms().get(`/api/cms/calendar/history${url}`, {
        params: query,
    });
}
// 获取日历计数
function getCalendarCount(params) {
    let url = genUrl(params);
    return $cms().get(`/api/cms/calendar/count${url}`);
}
// 获取海报信息
function getCalendarSlogans(params) {
    let url = genUrl(params);
    return $cms().get(`/api/cms/calendar/slogan${url}`);
}

// 获取用户信息
function getProfile() {
    return $cms().get("/api/cms/user/my/profile");
}

/**
 * @description 获取我的团队活动
 * @param {{ start_time: String, end_time: String }} params
 * @returns Promise
 */
function getMyTeamRaid(params) {
    return $cms().get("/api/cms/team/raids/my-join", {
        params,
    });
}

export {
    getCalendarRank,
    getRankDate,
    getCalendar,
    addCalendar,
    putCalendar,
    delCalendar,
    getDetail,
    getHistory,
    manageCalendar,
    getCalendarCount,
    getDayCalendar,
    getCalendarSlogans,
    getProfile,
    getMyTeamRaid,
};
