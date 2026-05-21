/**
 * @description ECharts option 配置对象防御性校验工具。在 setOption 调用前对 option 执行校验与过滤，
 *   移除 series 中 null/undefined 项、缺少 type 的项，以及 data 中 null/undefined 元素，
 *   确保 ECharts 不会因读取 undefined.type 而崩溃。
 *   纯函数实现，不修改原始输入对象。
 * @module echarts-option-validator
 */

/**
 * 校验单个 series 项的 data 数组，过滤 null/undefined 元素
 * @param {Object} seriesItem - 单个 series 配置对象
 */
function validateSeriesData(seriesItem) {
    if (seriesItem.data == null) {
        seriesItem.data = [];
        return;
    }
    if (!Array.isArray(seriesItem.data)) {
        seriesItem.data = [];
        return;
    }
    seriesItem.data = seriesItem.data.filter(function (item) {
        return item !== null && item !== undefined;
    });
}

/**
 * 校验并过滤 option.series 数组中的无效项
 * @param {Object} option - 含 series 属性的 option 对象（已深拷贝）
 */
function validateSeries(option) {
    if (option.series == null || !Array.isArray(option.series)) {
        option.series = [];
        return;
    }
    option.series = option.series.filter(function (seriesItem) {
        if (seriesItem == null) return false;
        if (seriesItem.type == null || seriesItem.type === '') return false;
        validateSeriesData(seriesItem);
        return true;
    });
}

/**
 * ECharts option 配置对象防御性校验入口函数
 * @param {Object} option - ECharts setOption 调用时传入的 option 配置对象
 * @returns {Object|null} 经校验过滤后的安全 option 对象；若输入无效或校验后 series 为空，返回 null
 * @example
 *   const safeOption = validateEChartsOption(option);
 *   if (!safeOption) return;
 *   myChart.setOption(safeOption);
 */
export function validateEChartsOption(option) {
    if (option == null) return null;

    const safeOption = JSON.parse(JSON.stringify(option));

    validateSeries(safeOption);

    if (!safeOption.series || safeOption.series.length === 0) return null;

    return safeOption;
}
