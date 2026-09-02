export const ACHIEVEMENT_WORKBENCH_EMPTY_TEXT = "—";

export const ACHIEVEMENT_WORKBENCH_TIERS = Object.freeze({
    NORMAL: "normal",
    WUJIA: "wujia",
    HIDDEN: "hidden",
    RETIRED: "retired",
});

export const ACHIEVEMENT_WORKBENCH_FIELD_STATUS = Object.freeze({
    CURRENT: "current",
    DERIVED: "derived",
    FUTURE: "future",
});

export const ACHIEVEMENT_WORKBENCH_FIELDS = Object.freeze({
    id: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    name: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    iconId: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    shortDescription: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    category: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    map: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    points: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    general: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    visible: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    tier: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.DERIVED,
    retired: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.DERIVED,
    completed: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.DERIVED,
    reward: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    difficulty: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.FUTURE,
    estimatedMinutes: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.FUTURE,
    cost: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.FUTURE,
    restriction: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.FUTURE,
    guideNote: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.FUTURE,
    updatedAt: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.FUTURE,
});

const TIER_ALIASES = Object.freeze({
    normal: ACHIEVEMENT_WORKBENCH_TIERS.NORMAL,
    regular: ACHIEVEMENT_WORKBENCH_TIERS.NORMAL,
    wujia: ACHIEVEMENT_WORKBENCH_TIERS.WUJIA,
    armor: ACHIEVEMENT_WORKBENCH_TIERS.WUJIA,
    hidden: ACHIEVEMENT_WORKBENCH_TIERS.HIDDEN,
    limited: ACHIEVEMENT_WORKBENCH_TIERS.RETIRED,
    retired: ACHIEVEMENT_WORKBENCH_TIERS.RETIRED,
});

function isPresent(value) {
    return value !== undefined && value !== null && value !== "";
}

function pickFirst(source, keys) {
    for (const key of keys) {
        if (isPresent(source?.[key])) return source[key];
    }
    return null;
}

function normalizeString(value) {
    if (!isPresent(value)) return null;
    const normalized = String(value).trim();
    return normalized || null;
}

function normalizeNumber(value) {
    if (!isPresent(value)) return null;
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : null;
}

function normalizeBoolean(value) {
    if (typeof value === "boolean") return value;
    if (!isPresent(value)) return null;
    if ([1, "1", "true", "yes"].includes(value)) return true;
    if ([0, "0", "false", "no"].includes(value)) return false;
    return null;
}

function normalizeTier(value) {
    const normalized = normalizeString(value)?.toLowerCase();
    return normalized ? TIER_ALIASES[normalized] || null : null;
}

function normalizeSchoolRestriction(value) {
    const normalized = normalizeString(value);
    if (!normalized || ["无", "不限", "all", "none"].includes(normalized.toLowerCase())) return null;
    return normalized;
}

function normalizeCompletionMap(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.entries(value).reduce((result, [roleId, completed]) => {
        result[String(roleId)] = Boolean(completed);
        return result;
    }, {});
}

function inferTier({ explicitTier, general, visible, retired }) {
    if (retired === true || general === 0) return ACHIEVEMENT_WORKBENCH_TIERS.RETIRED;
    if (explicitTier) return explicitTier;
    if (visible === false) return ACHIEVEMENT_WORKBENCH_TIERS.HIDDEN;
    if (general === 2) return ACHIEVEMENT_WORKBENCH_TIERS.WUJIA;
    return ACHIEVEMENT_WORKBENCH_TIERS.NORMAL;
}

function normalizeCompletedIds(value) {
    if (value instanceof Set) return new Set([...value].map(String));
    const source = Array.isArray(value) ? value : String(value || "").split(",");
    return new Set(source.map((id) => String(id).trim()).filter(Boolean));
}

export function formatAchievementWorkbenchValue(value, fallback = ACHIEVEMENT_WORKBENCH_EMPTY_TEXT) {
    return isPresent(value) ? value : fallback;
}

export function normalizeAchievementWorkbenchRecord(raw = {}, context = {}) {
    const metadata = context.metadata || {};
    const id = normalizeString(pickFirst(raw, ["id", "ID", "AchievementID"]));
    const itemMetadata = id ? metadata[id] || {} : {};
    const general = normalizeNumber(
        pickFirst(raw, ["general", "General"]) ?? pickFirst(itemMetadata, ["general", "General"])
    );
    const visible = normalizeBoolean(
        pickFirst(raw, ["visible", "Visible", "IsVisible"]) ??
            pickFirst(itemMetadata, ["visible", "Visible", "IsVisible"])
    );
    const explicitRetired = normalizeBoolean(pickFirst(raw, ["retired", "Retired", "isRetired"]));
    const explicitTier = normalizeTier(pickFirst(raw, ["tier", "Tier", "rarityTier"]));
    const tier = inferTier({ explicitTier, general, visible, retired: explicitRetired });
    const hasCompletionContext = Object.prototype.hasOwnProperty.call(context, "completedIds");
    const completedIds = normalizeCompletedIds(context.completedIds);
    const explicitCompleted = normalizeBoolean(pickFirst(raw, ["completed", "done", "isCompleted"]));
    const completionByRole = normalizeCompletionMap(pickFirst(raw, ["completionByRole", "doneBy"]));

    return {
        id,
        name: normalizeString(pickFirst(raw, ["name", "Name", "AchievementName"])),
        iconId: normalizeString(pickFirst(raw, ["iconId", "IconID"])),
        shortDescription: normalizeString(
            pickFirst(raw, ["shortDescription", "ShortDesc", "description", "Description"])
        ),
        category: {
            id: normalizeString(pickFirst(raw, ["categoryId", "CategoryID", "Sub"])),
            name: normalizeString(pickFirst(raw, ["categoryName", "CategoryName"])),
            subId: normalizeString(pickFirst(raw, ["subCategoryId", "SubCategoryID", "Detail"])),
            subName: normalizeString(pickFirst(raw, ["subCategory", "subCategoryName", "SubCategoryName"])),
        },
        map: {
            id: normalizeString(pickFirst(raw, ["mapId", "MapID", "SceneID"])),
            name: normalizeString(pickFirst(raw, ["mapName", "MapName", "map"])),
        },
        points: normalizeNumber(
            pickFirst(raw, ["points", "Point", "point"]) ?? pickFirst(itemMetadata, ["points", "Point", "point"])
        ),
        general,
        visible,
        tier,
        retired: tier === ACHIEVEMENT_WORKBENCH_TIERS.RETIRED,
        completed: explicitCompleted ?? (hasCompletionContext && id ? completedIds.has(id) : null),
        completionByRole,
        reward: {
            itemType: normalizeString(pickFirst(raw, ["rewardItemType", "ItemType"])),
            itemId: normalizeString(pickFirst(raw, ["rewardItemId", "ItemID"])),
        },
        difficulty: normalizeNumber(pickFirst(raw, ["difficulty", "Difficulty", "diff"])),
        estimatedMinutes: normalizeNumber(pickFirst(raw, ["estimatedMinutes", "estMinutes", "EstimatedMinutes"])),
        cost: {
            money: normalizeNumber(pickFirst(raw, ["moneyCost", "money", "MoneyCost"])),
            time: normalizeNumber(pickFirst(raw, ["timeCost", "time", "TimeCost"])),
            luck: normalizeNumber(pickFirst(raw, ["luckCost", "luck", "LuckCost"])),
            tier: normalizeString(pickFirst(raw, ["costTier", "CostTier"])),
        },
        restriction: {
            school: normalizeSchoolRestriction(pickFirst(raw, ["schoolLimit", "school", "cls", "SchoolLimit"])),
        },
        guideNote: normalizeString(pickFirst(raw, ["guideNote", "routeNote", "note", "GuideNote"])),
        updatedAt: normalizeString(pickFirst(raw, ["updatedAt", "UpdatedAt"])),
    };
}

export function normalizeAchievementWorkbenchRole(raw = {}, options = {}) {
    const id = normalizeString(pickFirst(raw, ["jx3id", "id", "ID"]));
    return {
        id,
        jx3id: id,
        name: normalizeString(pickFirst(raw, ["name", "Name"])),
        server: normalizeString(pickFirst(raw, ["server", "Server"])),
        school: normalizeString(pickFirst(raw, ["school", "mount", "School"])),
        bodyType: normalizeString(pickFirst(raw, ["bodyType", "body_type", "body"])),
        level: normalizeNumber(pickFirst(raw, ["level", "Level"])),
        isSelf: normalizeBoolean(pickFirst(raw, ["isSelf", "self"])) ?? Boolean(options.isSelf),
        updatedAt: normalizeString(pickFirst(raw, ["updatedAt", "UpdatedAt"])),
    };
}

export function normalizeAchievementWorkbenchRecords(records, context = {}) {
    return (Array.isArray(records) ? records : []).map((record) =>
        normalizeAchievementWorkbenchRecord(record, context)
    );
}
