import { $next, $pay, $cms } from "@jx3box/jx3box-common/js/https";
// 获取粉丝数
export function getFans(uid) {
    return $next().get(`/api/next2/rss/overview/author/${uid}`);
}
// 获取用户信息
export function getUserInfo(uid) {
    return $cms().get(`/api/cms/user/${uid}/info`);
}
