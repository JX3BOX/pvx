import { $next } from "@jx3box/jx3box-common/js/api";

/**
 * 订阅作者
 * @param {string|number} authorId 作者ID
 * @returns {Promise} 返回订阅结果
 */
export function subscribeAuthor(authorId) {
    return $next().post(`/api/next2/rss/subscribe/author/${authorId}`);
}

/**
 * 取消订阅作者
 * @param {string|number} authorId 作者ID
 * @returns {Promise} 返回取消订阅结果
 */
export function unsubscribeAuthor(authorId) {
    return $next().delete(`/api/next2/rss/subscribe/author/${authorId}`);
}
