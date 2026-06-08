import { $node } from "@jx3box/jx3box-common/js/api";
const $ = $node();

/**
 * 获取剑侠录菜单树
 * @param {Object} params - 查询参数
 * @param {string} [params.client='std'] - 客户端类型，固定值 std
 * @param {number} [params.season_id] - 季节ID
 * @param {number} [params.chapter_id] - 章节ID
 * @param {number} [params.section_id] - 小节ID
 * @param {string} [params.keyword] - 搜索关键词
 * @param {number} [params.hide_lock] - 是否隐藏锁定项
 * @returns {Promise} 菜单树数据
 */
export function getMenu(params) {
    return $.get(`/v2/questsection/menu`, { params });
}

/**
 * 获取剑侠录章节详情
 * @param {number|string} id - 小节ID（对应 nSectionID）
 * @param {Object} params - 查询参数
 * @param {string} [params.client='std'] - 客户端类型，固定值 std
 * @param {number} [params.season_id] - 季节ID
 * @param {number} [params.chapter_id] - 章节ID
 * @returns {Promise} 章节详情数据
 */
export function getDetail(id, params) {
    return $.get(`/v2/questsection/detail/${id}`, { params });
}