// 侠客行模块枚举 / 常量
// 业务组件中通过 `import { ... } from "./const"` 引用
// 字段名对齐 docx 文档（红尘侠影.docx）中的游戏原始字段名

/**
 * 品质 nQuality（对应 partnerquality.txt）
 */
export const QUALITY = {
    WHITE: 1,
    GREEN: 2,
    BLUE: 3,
    PURPLE: 4,
    ORANGE: 5,
};

/**
 * 稀有度 nRarity
 */
export const RARITY = {
    COMMON: 1,
    RARE: 2,
    EPIC: 3,
    LEGEND: 4,
};

/**
 * 武学类型 nKungfuIndex（对应 partnerkungfu.txt）
 * nIndex → szName 映射
 */
export const KUNGFU_INDEX = {
    0: "通用",
    1: "拳掌",
    2: "剑式",
    3: "刀式",
    // 按实际接口数据补充
};

/**
 * 技能类型 nType（对应 partnerskill.txt）
 * 1 = 普攻或特殊效果；2 = 技能
 */
export const SKILL_TYPE = {
    NORMAL: 1, // 普攻/特殊效果
    SKILL: 2,  // 技能
};

/**
 * 武学图标形状（招式区圆/方区分）
 * 被动武学 → 圆形；其他武学 → 方形
 * 判断依据：nType === 1 且非境界技能 → 圆形
 */
export const SKILL_SHAPE = {
    CIRCLE: "circle", // 被动/普攻 → 圆形
    SQUARE: "square", // 其他 → 方形
};

/**
 * 视图 TAB
 * 对齐 Figma Component 14: 基础信息、传记
 * 武学境界为"基础信息"tab 内的子区块，非独立 tab
 */
export const INFO_TABS = [
    { key: "info", label: "基础信息" },
    { key: "bio", label: "传记" },
];

/**
 * 列表展开高度（开发方案十二.1：已确认固定最大 600px）
 * 折叠状态需露出4个选择区域（2行卡片）
 * 计算：搜索框40px + gap20px + 卡片行(约107px)*2 + 行间距4px ≈ 278px
 */
export const LIST_EXPANDED_MAX_HEIGHT = 600;
export const LIST_COLLAPSED_MIN_HEIGHT = 280;

/**
 * 主题色（对齐 Figma 设计稿）
 */
export const THEME_COLOR = {
    PRIMARY: "#4F46E5",
    PRIMARY_SOFT: "rgba(79, 70, 229, 0.1)",
    PRIMARY_HOVER: "rgba(79, 70, 229, 0.05)",
};

/**
 * 侠客列表接口字段（partnernpcinfo.txt）
 * 用于 fields 参数指定返回字段
 */
export const PARTNER_LIST_FIELDS = [
    "dwID",            // 侠客ID
    "szName",          // 侠客名称
    "szNickName",      // 心法名称/昵称
    "nKungfuIndex",    // 武学类型
    "nQuality",        // 品质
    "nRarity",         // 稀有度
    "szSmallAvatarPath",   // 小头像路径
    "szMeetAvatarPath",    // 水墨圈图片路径
    "szUnlockAvatarPath",  // 未锁定图片路径
    "szBgPath",            // 背景图路径
    "bOutOfPrint",         // 是否绝版
    "bTryOut",             // 是否试用
    "szIntroduce",         // 侠客介绍
    "szDrawItemList",      // 抽卡所需道具
    "szLimitTip",          // 限制提示文本
    "nPrice",              // 园宅币兑换金额
].join(",");
