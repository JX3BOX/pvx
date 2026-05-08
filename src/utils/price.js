/**
 * 价格格式化工具
 * 统一 face/body 模块的价格展示逻辑
 */

/**
 * 格式化价格文本
 *
 * @param {number} priceType - 价格类型：0=免费, 1=盒币, 2=金箔
 * @param {number} priceCount - 价格数量
 * @returns {string} 格式化后的价格文本
 */
export function formatPriceText(priceType, priceCount) {
    if (priceType === 1) return `售价：${priceCount} 盒币`;
    if (priceType === 2) return `售价：${priceCount} 金箔`;
    return "";
}
