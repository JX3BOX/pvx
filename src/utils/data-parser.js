/**
 * 数据解析工具
 * 从根源统一处理 face/body 数据的 JSON 解析，
 * 避免在组件计算属性中反复 try-catch 造成静默错误
 */

/**
 * 解析脸型数据
 * 后端返回的 data 字段可能是：
 * - 带转义的 JSON 字符串（含 \\）
 * - 普通 JSON 字符串
 * - 已解析的对象
 *
 * @param {string|object} rawData - 原始 data 字段
 * @returns {object|null} 解析后的对象，解析失败返回 null
 */
export function parseFaceData(rawData) {
    if (!rawData) return null;
    if (typeof rawData === "object") return rawData;

    let parsed = rawData;
    if (typeof rawData === "string") {
        try {
            parsed = JSON.parse(rawData);
        } catch {
            return null;
        }
    }

    if (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            return null;
        }
    }

    return typeof parsed === "object" ? parsed : null;
}

/**
 * 构建脸型数据展示所需的完整数据结构
 *
 * @param {string|object} rawData - 原始 data 字段
 * @returns {object|null} { json, object, type } 或 null
 */
export function buildFaceAllData(rawData) {
    const facedata = parseFaceData(rawData);
    if (!facedata || typeof facedata !== "object") return null;

    return {
        json: typeof rawData === "string" ? rawData : JSON.stringify(rawData),
        object: facedata,
        type: "face",
    };
}

/**
 * 解析体型数据
 * 后端返回的 data 字段可能是双重 JSON 编码的字符串
 *
 * @param {string|object} rawData - 原始 data 字段
 * @returns {object|null} { object, fieldRanges } 或 null
 */
export function parseBodyData(rawData) {
    if (!rawData) return null;
    if (typeof rawData === "object") {
        return {
            object: rawData,
            fieldRanges: rawData.fieldRanges || [],
        };
    }

    if (typeof rawData !== "string") return null;

    let parsed = null;
    try {
        parsed = JSON.parse(rawData);
    } catch {
        return null;
    }

    if (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            return null;
        }
    }

    if (typeof parsed !== "object" || parsed === null) return null;

    return {
        object: parsed,
        fieldRanges: parsed.fieldRanges || [],
    };
}
