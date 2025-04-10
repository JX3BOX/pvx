import { $next, $pay, $cms } from "@jx3box/jx3box-common/js/https";
//收藏
export function setCollect(id, type, post_title) {
    return $next().post(`/api/article/favorites/add/${id}/${type}`, {
        post_title: post_title,
    });
}
//获取收藏
export function getCollectList(id, type) {
    return $next().get(`/api/article/favorites/is-my/${id}/${type}`);
}
//取消收藏
export function cancelCollect(id) {
    return $next().delete(`/api/article/favorites/my/${id}`);
}
