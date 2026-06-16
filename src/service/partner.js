import { $node } from "@jx3box/jx3box-common/js/api";
const $ = $node();

/**
 * 获取侠客列表
 * @param {Object} params - 查询参数
 * @param {string} [params.client='std']
 * @param {string} [params.keyword]   关键词（名称/昵称/介绍，左侧搜索框使用）
 * @param {string} [params.name]      侠客名称搜索
 * @param {number} [params.kungfu_index]
 * @param {number} [params.quality]
 * @param {number} [params.try_out]   0=否 1=是
 * @param {number} [params.out_of_print] 0=否 1=是
 * @param {number} [params.rarity]
 * @param {number} [params.exchangeable] 0=否 1=是
 * @param {string} [params.fields]    指定返回字段，逗号分隔
 * @param {string} [params.order_key] 排序字段，逗号分隔
 * @param {string} [params.order_by]  asc/desc，逗号分隔，与 order_key 对应
 * @returns {Promise}
 */
export function getPartnerList(params = {}) {
    return $.get("/v2/partner/list", { params });
}

/**
 * 获取侠客详情
 * @param {number|string} id - 侠客 dwID
 * @param {Object} [params]
 * @param {string} [params.client='std']
 * @returns {Promise}
 */
export function getPartnerDetail(id, params = {}) {
    return $.get(`/v2/partner/${id}`, { params });
}
/**
 * 侠客技能详情接口所需字段（对齐 UI 显示需求：SkillList.vue + Info.vue）
 * - IconID: 技能图标
 * - Name: 技能名称
 * - Desc: 技能描述
 * - Type: 技能类型（用于判断圆/方图标）
 */
export const PARTNER_SKILL_FIELDS = ["IconID", "Name", "Desc", "Type"];

/**
 * 获取侠客技能详情
 * 接口格式：https://node.jx3box.com/resource/std/skill.[31761,31753].[IconID,Name,Desc]
 *
 * @param {Array<number|string>|number|string} ids - 技能 dwID 数组或单个 ID（必传，最少1个）
 * @param {Array<string>|string} [fields] - 字段过滤（可选），默认返回 PARTNER_SKILL_FIELDS 指定字段
 *                                          传入空数组 [] 或 null 则返回所有字段
 * @returns {Promise}
 *
 * @example
 * // 获取单个技能的默认字段 (IconID, Name, Desc, Type)
 * getPartnerSkillDetail(31761)
 *
 * @example
 * // 获取多个技能的默认字段
 * getPartnerSkillDetail([31761, 31753])
 *
 * @example
 * // 获取多个技能的指定字段
 * getPartnerSkillDetail([31761, 31753], ['IconID', 'Name'])
 *
 * @example
 * // 获取所有字段（不传 fields 或传空数组）
 * getPartnerSkillDetail([31761, 31753], [])
 */
export function getPartnerSkillDetail(ids, fields = PARTNER_SKILL_FIELDS) {
    // 处理 ids 参数：支持数组或单个值
    const idList = Array.isArray(ids) ? ids : [ids];
    if (idList.length === 0) {
        return Promise.reject(new Error("至少需要传入一个技能 ID"));
    }

    // 处理 fields 参数：null/undefined/空数组 -> 不传字段过滤（返回全部字段）
    // 默认使用 PARTNER_SKILL_FIELDS
    const shouldFilter = fields && Array.isArray(fields) && fields.length > 0;

    // 构建 URL：[id1,id2].[field1,field2]
    const idPart = `[${idList.join(",")}]`;
    const fieldPart = shouldFilter ? `[${Array.isArray(fields) ? fields.join(",") : fields}]` : "";

    return $.get(`resource/std/skill.${idPart}.${fieldPart}`);
}
