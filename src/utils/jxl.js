/**
 * 剑侠录模块工具函数
 * - 处理游戏内的图片路径格式
 * - 提供图片URL转换功能
 */

/**
 * 获取剑侠录章节图片完整URL
 * - 处理游戏内的图片路径格式
 * - 固定前缀：https://img.jx3box.com/image/questsection/std/mainplotmap/
 * - 图片名称：文件名（去掉扩展名）+ "_" + nImageFrame
 *
 * @param {String} imagePath - 图片路径（如 "ui\\Image\\WorldMap\\MainPlotMap\\MainPlotMap10.UITex"）
 * @param {Number} nImageFrame - 图片帧数（如 0）
 * @returns {String} 完整的图片URL
 *
 * @example
 * // 输入: imagePath="MainPlotMap10.UITex", nImageFrame=0
 * // 输出: "https://img.jx3box.com/image/questsection/std/mainplotmap/mainplotmap10_0.png"
 */
export function getJxlImageUrl(imagePath, nImageFrame) {
    if (!imagePath) return "";

    // 将路径中的 / 替换为 \（统一路径格式）
    const normalizedPath = imagePath.replace(/\//g, "\\");

    // 提取文件名（最后一个 \ 后面的部分）
    const pathParts = normalizedPath.split("\\");
    const fileName = pathParts[pathParts.length - 1];

    if (!fileName) return "";

    // 提取文件名（去掉扩展名）并转换为小写
    // 支持多种扩展名：.UITex, .tga, .png 等
    const baseName = fileName.toLowerCase().replace(/\.(uitex|tga|png|jpg|jpeg)$/i, "");

    // 拼接图片名称：baseName + "_" + nImageFrame
    // 如果 nImageFrame 不存在，则只使用 baseName
    const imageFrame = nImageFrame !== undefined && nImageFrame !== null ? nImageFrame : 0;
    const imageName = `${baseName}_${imageFrame}`;

    // 固定前缀
    const baseUrl = "https://img.jx3box.com/image/questsection/std/mainplotmap/";

    return baseUrl + imageName + ".png";
}

/**
 * 获取剑侠录章节图片URL
 * - 专门处理章节详情中的 Chapter.imagePath 和 Chapter.nImageFrame 字段
 *
 * @param {Object} chapter - 章节对象（包含 imagePath 和 nImageFrame 字段）
 * @returns {String} 完整的图片URL
 *
 * @example
 * // 输入: { imagePath: "ui\\Image\\WorldMap\\MainPlotMap\\MainPlotMap10.UITex", nImageFrame: 0 }
 * // 输出: "https://img.jx3box.com/image/questsection/std/mainplotmap/mainplotmap10_0.png"
 */
export function getChapterImageUrl(chapter) {
    if (!chapter || !chapter.imagePath) return "";
    return getJxlImageUrl(chapter.imagePath, chapter.nImageFrame);
}

/**
 * 获取剑侠录资料片图片URL
 * - 专门处理资料片的 Season.imagePath 和 Season.nImageFrame 字段
 *
 * @param {Object} season - 资料片对象（包含 imagePath 和 nImageFrame 字段）
 * @returns {String} 完整的图片URL
 */
export function getSeasonImageUrl(season) {
    if (!season || !season.imagePath) return "";
    return getJxlImageUrl(season.imagePath, season.nImageFrame);
}

/**
 * 格式化剑侠录详情内容
 * - 处理游戏内的特殊标签和转义字符
 * - 将 <G> 标签转换为高亮文本
 * - 将 \\n 转义字符转换为 <br> 标签
 *
 * @param {String} detail - 详情内容（如 szDetail 字段的值）
 * @returns {String} 格式化后的HTML内容
 *
 * @example
 * // 输入: "<G>你选择继续留在寺中修习。\\n<G>你到塔林却只见道恒的尸首。"
 * // 输出: "<span class='jxl-highlight'>你选择继续留在寺中修习。</span><br><span class='jxl-highlight'>你到塔林却只见道恒的尸首。</span>"
 */
export function formatJxlDetail(detail) {
    if (!detail) return "";

    let formattedDetail = detail;

    // 处理 \\n 转义字符，转换为 <br> 标签
    formattedDetail = formattedDetail.replace(/\\n/g, "<br>");

    // 处理 <G> 标签，转换为高亮文本
    // <G> 标签后面是高亮内容，直到遇到下一个 <G> 或 <br> 或字符串结束
    // 使用正则一次性匹配：<G>后面直到<br>或字符串结束的内容
    formattedDetail = formattedDetail.replace(/<G>([^<]*?)(<br>|$)/g, '<span class="jxl-highlight">$1</span>$2');

    return formattedDetail;
}
