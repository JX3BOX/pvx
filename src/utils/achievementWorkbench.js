export const ACHIEVEMENT_WORKBENCH_EMPTY_TEXT = "—";

export const ACHIEVEMENT_WORKBENCH_FALLBACK_DIMENSIONS = Object.freeze(
    [
        {
            id: null,
            key: "money",
            label: null,
            description: null,
            sortOrder: 10,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.money",
        },
        {
            id: null,
            key: "time",
            label: null,
            description: null,
            sortOrder: 20,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.time",
        },
        {
            id: null,
            key: "luck",
            label: null,
            description: null,
            sortOrder: 30,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.luck",
        },
        {
            id: null,
            key: "costEffectiveness",
            label: null,
            description: null,
            sortOrder: 40,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.costEffectiveness",
        },
        {
            id: null,
            key: "overall",
            label: null,
            description: null,
            sortOrder: 50,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.overall",
        },
    ].map(Object.freeze)
);

const ACHIEVEMENT_WORKBENCH_DIMENSION_I18N_KEYS = Object.freeze(
    Object.fromEntries(
        ACHIEVEMENT_WORKBENCH_FALLBACK_DIMENSIONS.map((dimension) => [dimension.key, dimension.i18nKey])
    )
);

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
    difficulty: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    difficultyDimensions: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    estimatedMinutes: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.FUTURE,
    cost: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    costEffectiveness: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    completionStatistics: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    tags: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.CURRENT,
    tagGroups: ACHIEVEMENT_WORKBENCH_FIELD_STATUS.DERIVED,
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

const ACHIEVEMENT_TAG_TYPE_BY_CATEGORY = Object.freeze({
    门派: "school",
    节日: "festival",
    活动: "activity",
    阵营: "camp",
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

function normalizeDimensionKey(value) {
    const normalized = normalizeString(value);
    if (!normalized) return null;
    return normalized.replace(/_([a-z0-9])/gi, (_, letter) => letter.toUpperCase());
}

function normalizeDifficultyLevel(value) {
    if (typeof value === "boolean") return null;
    const normalized = normalizeNumber(value);
    return normalized === null || normalized < 0 || normalized > 50 ? null : normalized / 10;
}

function createEmptyAchievementTagGroups() {
    return {
        schools: [],
        festivals: [],
        activities: [],
        camps: [],
        unknown: [],
    };
}

function cloneAchievementTagGroups(value = {}) {
    const result = createEmptyAchievementTagGroups();
    Object.keys(result).forEach((key) => {
        result[key] = Array.isArray(value?.[key]) ? [...value[key]] : [];
    });
    return result;
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

export function normalizeAchievementWorkbenchDifficultyDimensions(rawDimensions = []) {
    return (Array.isArray(rawDimensions) ? rawDimensions : [])
        .map((dimension) => ({
            id: normalizeString(pickFirst(dimension, ["dimensionId", "dimension_id", "id"])),
            key: normalizeDimensionKey(pickFirst(dimension, ["dimensionKey", "dimension_key", "key"])),
            apiKey: normalizeString(pickFirst(dimension, ["apiKey", "dimension_key", "key"])),
            label: normalizeString(pickFirst(dimension, ["dimensionLabel", "dimension_label", "label"])),
            description: normalizeString(
                pickFirst(dimension, ["dimensionDescription", "dimension_desc", "description"])
            ),
            scoreLabels: pickFirst(dimension, ["scoreLabels", "score_labels"]) || [],
            sortOrder: normalizeNumber(pickFirst(dimension, ["sortOrder", "sort_order"])),
            required: normalizeBoolean(pickFirst(dimension, ["required", "isRequired", "is_required"])) ?? false,
            visible: normalizeBoolean(pickFirst(dimension, ["visible", "is_visible"])) ?? true,
            recommendationDirection: pickFirst(dimension, ["recommendationDirection", "recommendation_direction"]),
            recommendationWeight: normalizeNumber(pickFirst(dimension, ["recommendationWeight", "recommendation_weight"])),
        }))
        .filter((dimension) => dimension.key)
        .sort(
            (left, right) =>
                (left.sortOrder ?? Number.MAX_SAFE_INTEGER) - (right.sortOrder ?? Number.MAX_SAFE_INTEGER)
        );
}

export function resolveAchievementWorkbenchDimensions(rawDimensions = []) {
    const normalized = normalizeAchievementWorkbenchDifficultyDimensions(rawDimensions);
    const source = normalized.length ? normalized : ACHIEVEMENT_WORKBENCH_FALLBACK_DIMENSIONS;

    return source.filter((dimension) => dimension.visible !== false).map((dimension) => ({
        ...dimension,
        i18nKey: ACHIEVEMENT_WORKBENCH_DIMENSION_I18N_KEYS[dimension.key] || null,
    }));
}

export function getAchievementWorkbenchDimensionValue(record = {}, dimensionKey = "") {
    const dimensions = record?.difficultyDimensions;
    let value = null;

    if (
        dimensions &&
        typeof dimensions === "object" &&
        !Array.isArray(dimensions) &&
        Object.prototype.hasOwnProperty.call(dimensions, dimensionKey)
    ) {
        value = dimensions[dimensionKey];
    } else {
        const fallbackValues = {
            money: record?.cost?.money,
            time: record?.cost?.time,
            luck: record?.cost?.luck,
            costEffectiveness: record?.costEffectiveness,
            overall: record?.difficulty,
        };
        value = fallbackValues[dimensionKey];
    }

    if (!isPresent(value) || typeof value === "boolean") return null;
    return normalizeNumber(value);
}

export function getAchievementWorkbenchRatingFill(value, max = 5) {
    if (!isPresent(value) || typeof value === "boolean") return null;
    const normalized = normalizeNumber(value);
    const normalizedMax = normalizeNumber(max);
    if (normalized === null || normalizedMax === null || normalizedMax <= 0) return null;
    return Math.max(0, Math.min(100, (normalized / normalizedMax) * 100));
}

export function getAchievementWorkbenchScoreLabel(value, bands = []) {
    if (!isPresent(value) || typeof value === "boolean") return null;
    const rating = normalizeNumber(value);
    if (rating === null || rating < 0 || rating > 5) return null;
    return [...bands].reverse().find((band) => rating >= band.min / 10)?.label || null;
}

export function getAchievementWorkbenchDimensionSort(value = "") {
    const matched = String(value).match(/^dimension:([A-Za-z][A-Za-z0-9]*):asc$/);
    return matched ? { key: matched[1], direction: "asc" } : null;
}

export function normalizeAchievementWorkbenchDifficulty(raw = {}) {
    const rawDimensions =
        raw?.dimensions && typeof raw.dimensions === "object" && !Array.isArray(raw.dimensions)
            ? raw.dimensions
            : {};
    const difficultyDimensions = Object.entries(rawDimensions).reduce((result, [key, value]) => {
        const normalizedKey = normalizeDimensionKey(key);
        if (normalizedKey) result[normalizedKey] = normalizeDifficultyLevel(value);
        return result;
    }, {});
    const completedRoleCount = normalizeNumber(
        pickFirst(raw, ["completedRoleCount", "completed_role_count"])
    );
    const totalRoleCount = normalizeNumber(pickFirst(raw, ["totalRoleCount", "total_role_count"]));

    return {
        achievementId: normalizeString(pickFirst(raw, ["achievementId", "achievement_id", "id"])),
        client: normalizeString(raw?.client),
        difficulty: Object.prototype.hasOwnProperty.call(difficultyDimensions, "overall")
            ? difficultyDimensions.overall
            : normalizeDifficultyLevel(pickFirst(raw, ["difficulty", "Difficulty", "diff"])),
        difficultyDimensions,
        cost: {
            money: difficultyDimensions.money ?? null,
            time: difficultyDimensions.time ?? null,
            luck: difficultyDimensions.luck ?? null,
        },
        costEffectiveness: difficultyDimensions.costEffectiveness ?? null,
        completionStatistics: {
            completedRoleCount,
            totalRoleCount,
            rate:
                completedRoleCount !== null && totalRoleCount !== null && totalRoleCount > 0
                    ? completedRoleCount / totalRoleCount
                    : null,
        },
    };
}

export function normalizeAchievementWorkbenchTags(rawTags = []) {
    const tagGroups = createEmptyAchievementTagGroups();
    const groupKeyByType = {
        school: "schools",
        festival: "festivals",
        activity: "activities",
        camp: "camps",
    };
    const tags = (Array.isArray(rawTags) ? rawTags : [])
        .map((tag) => {
            const label = normalizeString(pickFirst(tag, ["label", "tagLabel", "tag_label"]));
            if (!label) return null;
            const match = label.match(/^([^：:]+)[：:]\s*(.+)$/);
            const category = match ? normalizeString(match[1]) : null;
            const value = match ? normalizeString(match[2]) : null;
            const type = ACHIEVEMENT_TAG_TYPE_BY_CATEGORY[category] || "unknown";
            const groupKey = groupKeyByType[type];
            const groupValue = groupKey && value ? value : label;
            const target = groupKey ? tagGroups[groupKey] : tagGroups.unknown;
            if (!target.includes(groupValue)) target.push(groupValue);

            return {
                id: normalizeString(pickFirst(tag, ["id", "tagId", "tag_id"])),
                label,
                description: normalizeString(pickFirst(tag, ["description", "tagDesc", "tag_desc"])),
                type,
                category,
                value,
            };
        })
        .filter(Boolean);

    return { tags, tagGroups };
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
            id: normalizeString(pickFirst(raw, ["mapId", "MapID", "SceneID"]) || raw.dwMapID),
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
        difficultyDimensions: {},
        estimatedMinutes: normalizeNumber(pickFirst(raw, ["estimatedMinutes", "estMinutes", "EstimatedMinutes"])),
        cost: {
            money: normalizeNumber(pickFirst(raw, ["moneyCost", "money", "MoneyCost"])),
            time: normalizeNumber(pickFirst(raw, ["timeCost", "time", "TimeCost"])),
            luck: normalizeNumber(pickFirst(raw, ["luckCost", "luck", "LuckCost"])),
            tier: normalizeString(pickFirst(raw, ["costTier", "CostTier"])),
        },
        costEffectiveness: null,
        completionStatistics: {
            completedRoleCount: null,
            totalRoleCount: null,
            rate: null,
        },
        tags: [],
        tagGroups: createEmptyAchievementTagGroups(),
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
        roleId: normalizeNumber(raw.ID),
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

export function applyAchievementWorkbenchEnrichment(records = [], context = {}) {
    const difficultyById = context.difficultyById || {};
    const tagsById = context.tagsById || {};

    return (Array.isArray(records) ? records : []).map((record) => {
        const id = String(record?.id ?? "");
        const difficulty = difficultyById[id];
        const hasDifficulty = difficulty !== null && difficulty !== undefined;
        const tagBundle = tagsById[id];
        const completionStatistics = hasDifficulty
            ? difficulty?.completionStatistics || {}
            : record?.completionStatistics || {};

        return {
            ...record,
            difficulty: hasDifficulty ? difficulty?.difficulty ?? null : record?.difficulty ?? null,
            difficultyDimensions: hasDifficulty
                ? { ...(difficulty?.difficultyDimensions || {}) }
                : { ...(record?.difficultyDimensions || {}) },
            cost: {
                money: hasDifficulty ? difficulty?.cost?.money ?? null : record?.cost?.money ?? null,
                time: hasDifficulty ? difficulty?.cost?.time ?? null : record?.cost?.time ?? null,
                luck: hasDifficulty ? difficulty?.cost?.luck ?? null : record?.cost?.luck ?? null,
                tier: record?.cost?.tier ?? null,
            },
            costEffectiveness: hasDifficulty
                ? difficulty?.costEffectiveness ?? null
                : record?.costEffectiveness ?? null,
            completionStatistics: {
                completedRoleCount: completionStatistics.completedRoleCount ?? null,
                totalRoleCount: completionStatistics.totalRoleCount ?? null,
                rate: completionStatistics.rate ?? null,
            },
            tags: Array.isArray(tagBundle?.tags)
                ? [...tagBundle.tags]
                : Array.isArray(record?.tags)
                ? [...record.tags]
                : [],
            tagGroups: cloneAchievementTagGroups(tagBundle?.tagGroups || record?.tagGroups),
        };
    });
}
