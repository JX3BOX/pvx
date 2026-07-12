// 侠客行模块工具函数 —— URL 生成 + 数据转换
// 字段名对齐 docx 文档（红尘侠影.docx）中的游戏原始字段名

import { KUNGFU_INDEX, SKILL_TYPE, SKILL_SHAPE } from "@/views/partner/const";

// ==================== URL 生成 ====================
// TODO 调整：仅需修改 4 个常量即可，业务代码无需变动

// 物品详情位于主站的独立物品库
const ITEM_WIKI_BASE_URL = "https://www.jx3box.com";
const ITEM_WIKI_PATH_PREFIX = "/item/view/";

// 武学数据库（占位）
const SKILL_DB_BASE_URL = "xxx";
const SKILL_DB_PATH_PREFIX = "/skill/";

/**
 * 生成物品百科跳转 URL
 * @param {string|number} itemId 道具 ID
 * @returns {string}
 */
export function getItemWikiUrl(itemId) {
    if (itemId === undefined || itemId === null) return "";
    return `${ITEM_WIKI_BASE_URL}${ITEM_WIKI_PATH_PREFIX}${itemId}`;
}

/**
 * 生成武学数据库跳转 URL
 * @param {string|number} skillId 武学 ID
 * @returns {string}
 */
export function getSkillDbUrl(skillId) {
    if (skillId === undefined || skillId === null) return "";
    return `${SKILL_DB_BASE_URL}${SKILL_DB_PATH_PREFIX}${skillId}`;
}

// ==================== 图片路径处理 ====================

/**
 * 侠客图片 CDN 基础路径
 * 参考 questsection.js 的实现方式
 */
const PARTNER_IMAGE_BASE = "https://img.jx3box.com/image/partner/";

/**
 * 需要移除的路径前缀
 * 游戏配置的路径格式如 "ui/Image/Partner/SmallAvatar/KangYanBie"
 */
const PARTNER_PATH_PREFIX = "ui/Image/Partner/";

/**
 * 将游戏内图片路径转为可访问的 URL
 * 游戏配置的路径格式如 "ui/Image/Partner/SmallAvatar/KangYanBie"
 * 需要移除 "ui/Image/Partner/" 前缀后转为小写，拼接为完整 URL
 *
 * @param {string} path 游戏内图片路径（如 "ui/Image/Partner/SmallAvatar/KangYanBie"）
 * @returns {string} 可访问的图片 URL（如 "https://img.jx3box.com/image/partner/smallavatar/kangyanbie.png"）
 *
 * @example
 * // 输入: "ui/Image/Partner/SmallAvatar/KangYanBie"
 * // 移除前缀: "SmallAvatar/KangYanBie"
 * // 转小写: "smallavatar/kangyanbie"
 * // 输出: "https://img.jx3box.com/image/partner/smallavatar/kangyanbie.png"
 */
export function resolveImagePath(path) {
    if (!path) return "";

    // 移除 "ui/Image/Partner/" 前缀（支持正斜杠和反斜杠）
    let normalizedPath = path;
    if (normalizedPath.toLowerCase().startsWith(PARTNER_PATH_PREFIX.toLowerCase())) {
        normalizedPath = normalizedPath.slice(PARTNER_PATH_PREFIX.length);
    } else if (normalizedPath.toLowerCase().startsWith(PARTNER_PATH_PREFIX.toLowerCase().replace(/\//g, "\\"))) {
        normalizedPath = normalizedPath.slice(PARTNER_PATH_PREFIX.length);
    }
    //移除路径后缀的.tga（不区分大小写）
    normalizedPath = normalizedPath.replace(/\.tga$/i, "");

    // 将路径转为小写
    normalizedPath = normalizedPath.toLowerCase();

    // 拼接完整 URL
    return `${PARTNER_IMAGE_BASE}${normalizedPath}.png`;
}

/**
 * 处理侠客头像路径
 * szSmallAvatarPath 字段格式如 "ui/Image/Partner/SmallAvatar/KangYanBie"
 *
 * @param {string} path 头像路径
 * @returns {string} 头像 URL
 */
export function resolveAvatarPath(path) {
    return resolveImagePath(path);
}

/**
 * 将技能 IconID 转为可访问的图标 URL
 * 格式：https://icon.jx3box.com/icon/{IconID}.png
 * @param {number|string} iconId 技能图标 ID
 * @returns {string}
 */
export function resolveSkillIcon(iconId) {
    if (!iconId) return "";
    return `https://icon.jx3box.com/icon/${iconId}.png`;
}

// ==================== 数据转换 ====================

/**
 * 解析抽卡道具列表字符串
 * 格式："物品表ID_物品ID;物品表ID_物品ID"
 *
 * @param {string} drawItemList 原始字符串
 * @returns {Array<{tableId: string, itemId: string}>}
 */
export function parseDrawItemList(drawItemList) {
    if (!drawItemList) return [];
    return drawItemList
        .split(";")
        .filter(Boolean)
        .map((item) => {
            const [tableId, itemId] = item.split("_");
            return { tableId, itemId };
        });
}

/**
 * 判断技能图标形状
 * 规则：nType === SKILL_TYPE.NORMAL（普攻/特殊效果）→ 圆形，其他 → 方形
 *
 * @param {number} nType 技能类型
 * @returns {string} SKILL_SHAPE.CIRCLE | SKILL_SHAPE.SQUARE
 */
export function getSkillShape(nType) {
    return nType === SKILL_TYPE.NORMAL ? SKILL_SHAPE.CIRCLE : SKILL_SHAPE.SQUARE;
}

/**
 * 获取武学类型名称
 *
 * @param {number} nKungfuIndex 武学类型编号
 * @returns {string}
 */
export function getKungfuName(nKungfuIndex) {
    return KUNGFU_INDEX[nKungfuIndex] || "未知";
}

/**
 * 将接口返回的侠客列表项映射为组件所需格式
 * 接口返回字段对齐 partnernpcinfo.txt
 *
 * 特殊处理：
 * - 第一个元素 szName 为空时，显示为"全部"
 * - 头像路径：szSmallAvatarPath 需转小写拼接
 *
 * @param {Object} item 接口返回的原始侠客对象
 * @param {number} index 列表索引（用于判断是否为第一个元素）
 * @returns {Object} 组件友好的格式
 */
export function mapPartnerListItem(item, index = 0) {
    if (!item) return null;

    // 第一个元素 szName 为空时，显示为"全部"
    const isFirstItem = index === 0;
    const displayName = isFirstItem && !item.szName ? "全部" : item.szName || "";

    return {
        id: item.dwID,
        name: displayName,
        nickname: item.szNickName || "",
        kungfuIndex: item.nKungfuIndex,
        kungfuName: getKungfuName(item.nKungfuIndex),
        quality: item.nQuality,
        rarity: item.nRarity,
        // 头像：szSmallAvatarPath 转小写拼接
        avatar: resolveAvatarPath(item.szSmallAvatarPath),
        // 水墨圈：szMeetAvatarPath 转小写拼接
        meetAvatar: resolveImagePath(item.szMeetAvatarPath),
        // 解锁图：szUnlockAvatarPath 转小写拼接
        unlockAvatar: resolveImagePath(item.szUnlockAvatarPath),
        // 背景：szBgPath 转小写拼接
        bgPath: resolveImagePath(item.szBgPath),
        // 状态
        isOutOfPrint: item.bOutOfPrint === 1,
        isTryOut: item.bTryOut === 1,
        // 介绍
        introduce: item.szIntroduce || "",
        // 抽卡道具
        drawItems: parseDrawItemList(item.szDrawItemList),
        // 限制提示
        limitTip: item.szLimitTip || "",
        // 园宅币价格
        price: item.nPrice || null,
        // 是否为"全部"项
        isAll: isFirstItem && !item.szName,
    };
}

/**
 * 解析传记内容中的纯文本
 * 格式：<text>text="内容" font=18</text>
 *
 * @param {string} content 原始内容
 * @returns {string} 纯文本内容
 */
export function parseStoryContent(content) {
    if (!content) return "";
    // 匹配 <text>text="..." 格式，提取双引号内的内容
    const match = content.match(/text="([^"]*)"/);
    if (match && match[1]) {
        return match[1];
    }
    // 如果没有匹配到，返回原始内容（去除标签）
    return content.replace(/<[^>]+>/g, "").trim();
}

/**
 * 将接口返回的侠客详情映射为组件所需格式
 * 详情接口返回完整的侠客数据，包含技能、境界、传记、语音等
 * 字段名对齐 detail.json（大写开头：Skills, Stages, Stories, Voices）
 *
 * @param {Object} detail 接口返回的原始详情对象
 * @returns {Object} 组件友好的格式
 */
export function mapPartnerDetail(detail) {
    if (!detail) return null;
    // 基础信息复用列表映射
    const base = mapPartnerListItem(detail);
    if (!base) return null;

    // 武学境界：添加技能名称占位（接口只返回 skillID，名称需要额外查询）
    const stages = (detail.Stages || [])
        .sort((a, b) => a.stage - b.stage)
        .map((s, index) => ({
            stage: s.stage,
            title: s.title || "",
            // 技能信息（名称需要占位，后续可通过技能接口补充）
            skillId: s.skillID,
            skillName: "",
            skillDesc: "",
            level: s.level,
            // 境界图标形状：圆形（Figma Frame 311 使用 28x28 圆形图标）
            shape: SKILL_SHAPE.CIRCLE,
            // 解锁道具（境界需要道具解锁）
            unlockItems: [],
            // 如果原始数据已有 IconID 则直接使用
            icon: s.IconID ? resolveSkillIcon(s.IconID) : "",
            iconId: s.IconID || null,
        }));

    // 武学招式：添加名称占位
    const skills = (detail.Skills || []).map((s, index) => ({
        id: s.skillID,
        // 技能名称占位（后续会被 getPartnerSkillDetail 覆盖）
        name: "",
        desc: "",
        level: s.level,
        type: s.type,
        shape: getSkillShape(s.type),
        openStage: s.openStage,
        // 如果原始数据已有 IconID 则直接使用，否则留空等待 skill detail API 补充
        icon: s.IconID ? resolveSkillIcon(s.IconID) : "",
        iconId: s.IconID || null,
    }));

    // 基础属性（从接口数据提取）
    const attrs = [
        { key: "quality", label: "品质", value: getQualityLabel(detail.nQuality), rawValue: detail.nQuality },
        { key: "rarity", label: "稀有度", value: getRarityLabel(detail.nRarity), rawValue: detail.nRarity },
        { key: "kungfu", label: "武学类型", value: detail.Kungfu?.name || "", rawValue: detail.nKungfuIndex },
        { key: "nickname", label: "心法", value: detail.szNickName || "-" },
    ];

    return {
        ...base,
        // 武学类型信息（Kungfu 对象）
        kungfu: detail.Kungfu
            ? {
                  name: detail.Kungfu.name || "",
                  path: resolveImagePath(detail.Kungfu.path),
                  frame: detail.Kungfu.frame,
                  index: detail.Kungfu.index,
              }
            : null,
        // 品质信息（Quality 对象）
        qualityInfo: detail.Quality
            ? {
                  quality: detail.Quality.quality,
                  avatarBgPath: resolveImagePath(detail.Quality.avatarBgPath),
                  travelBgPath: resolveImagePath(detail.Quality.travelBgPath),
                  avatarBgFrame: detail.Quality.avatarBgFrame,
                  travelBgFrame: detail.Quality.travelBgFrame,
                  avatarCirclePath: resolveImagePath(detail.Quality.avatarCirclePath),
                  avatarCircleFrame: detail.Quality.avatarCircleFrame,
              }
            : null,
        // 礼物信息（Gift 对象）
        gift: detail.Gift
            ? {
                  item: detail.Gift.item,
                  type: detail.Gift.type,
                  index: detail.Gift.index,
              }
            : null,
        // 武学招式（Skills 数组）
        skills,
        // 武学境界（Stages 数组）
        stages,
        // 基础属性
        attrs,
        // 传记（Stories 数组）
        bios: (detail.Stories || []).map((s) => ({
            id: s.nIndex,
            title: s.szTitle || "",
            content: parseStoryContent(s.szContent),
            openLevel: s.nOpenLevel,
            questId: s.dwQuestID,
        })),
        // 语音（Voices 数组）
        voices: (detail.Voices || [])
            .sort((a, b) => a.nIndex - b.nIndex)
            .map((v) => ({
                id: v.nIndex,
                type: v.nType,
                openLevel: v.nOpenLevel,
                desc: v.szDesc || "",
                path: v.szPath || "",
                soundEvent: v.SoundEvent || "",
                questId: v.dwQuestID,
            })),
        // 语音纯文本
        voiceText: (detail.Voices || [])
            .map((v) => v.szDesc)
            .filter(Boolean)
            .join("\n"),
    };
}

/**
 * 获取品质标签
 * @param {number} quality 品质值
 * @returns {string}
 */
export function getQualityLabel(quality) {
    const labels = {
        1: "白色",
        2: "绿色",
        3: "蓝色",
        4: "紫色",
        5: "橙色",
    };
    return labels[quality] || `品质${quality}`;
}

/**
 * 获取稀有度标签
 * @param {number} rarity 稀有度值
 * @returns {string}
 */
export function getRarityLabel(rarity) {
    const labels = {
        1: "普通",
        2: "稀有",
        3: "史诗",
        4: "传说",
    };
    return labels[rarity] || `稀有度${rarity}`;
}
