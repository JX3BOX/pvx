import { collectMenuAchievementIds } from "@/utils/achievementStatistics";
import {
    isAchievementEligibleForSchool,
    resolveAchievementSchoolRestriction,
} from "@/utils/achievementSchoolEligibility";

const ACHIEVEMENT_LEAP_GENERAL = 1;

export const ACHIEVEMENT_LEAP_RECOMMENDATION_VERSION = "stage-v1";

export const ACHIEVEMENT_LEAP_CATEGORY_RECOMMENDATION_WEIGHTS = {
    candidateQuality: 75,
    incompleteCount: 15,
    availablePoints: 10,
};

export const ACHIEVEMENT_LEAP_STAGE_PROFILES = [
    {
        key: "newbie",
        minPoints: 0,
        maxPoints: 30000,
        maxDifficulty: 2,
        strategy: "easy-first",
        weights: { points: 15, efficiency: 20, difficulty: 25, money: 15, time: 15, luck: 10 },
    },
    {
        key: "growth",
        minPoints: 30000,
        maxPoints: 75000,
        maxDifficulty: 3,
        strategy: "efficiency",
        weights: { points: 20, efficiency: 25, difficulty: 15, money: 10, time: 20, luck: 10 },
    },
    {
        key: "sprint",
        minPoints: 75000,
        maxPoints: 100000,
        maxDifficulty: 4,
        strategy: "big-first",
        weights: { points: 30, efficiency: 25, difficulty: 10, money: 10, time: 15, luck: 10 },
    },
    {
        key: "tribulation",
        minPoints: 100000,
        maxPoints: Number.POSITIVE_INFINITY,
        maxDifficulty: null,
        strategy: "cost-first",
        weights: { points: 35, efficiency: 15, difficulty: 10, money: 10, time: 20, luck: 10 },
    },
];

const RECOMMENDATION_DIMENSIONS = ["points", "efficiency", "difficulty", "money", "time", "luck"];

function normalizeIds(value) {
    const source = value instanceof Set ? [...value] : Array.isArray(value) ? value : String(value || "").split(",");
    return [...new Set(source.map((id) => String(id).trim()).filter(Boolean))];
}

function normalizeMenuEntries(menus) {
    return Array.isArray(menus)
        ? menus.map((menu, index) => [String(menu?.sub ?? index), menu])
        : Object.entries(menus || {});
}

function normalizeMeta(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value !== "string") return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

function normalizeNullableNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const result = Number(value);
    return Number.isFinite(result) ? result : null;
}

function getPoint(metadata, id) {
    const point = normalizeNullableNumber(metadata?.[String(id)]?.point);
    return point !== null && point >= 0 ? point : 0;
}

function getCategoryIdentity(menu, fallbackId) {
    const id = String(menu?.sub ?? fallbackId);
    const name = String(menu?.name || fallbackId).trim();
    return { id, name };
}

function isEligibleMetadata(item) {
    return Boolean(
        item && Number(item.general) === ACHIEVEMENT_LEAP_GENERAL && normalizeNullableNumber(item.point) !== null
    );
}

export function filterAchievementLeapIds(ids, metadata = {}) {
    return normalizeIds(ids).filter((id) => Number(metadata?.[id]?.general) === ACHIEVEMENT_LEAP_GENERAL);
}

function resolveDifficulty(record, difficultyById, id) {
    const recordDifficulty = normalizeNullableNumber(record?.difficulty);
    if (recordDifficulty !== null) return recordDifficulty;
    return normalizeNullableNumber(difficultyById?.[String(id)]);
}

function buildCategoryIndex(menus, metadata) {
    const index = new Map();
    normalizeMenuEntries(menus).forEach(([fallbackId, menu]) => {
        const { id: categoryId, name: categoryName } = getCategoryIdentity(menu, fallbackId);
        filterAchievementLeapIds([...collectMenuAchievementIds([menu])], metadata).forEach((id) => {
            if (!index.has(String(id))) index.set(String(id), { id: categoryId, name: categoryName });
        });
    });
    return index;
}

export function normalizeAchievementLeapPlan(raw = {}) {
    const meta = normalizeMeta(raw.meta);
    return {
        id: raw.id == null ? null : String(raw.id),
        title: String(raw.title || "").trim(),
        description: raw.desc || raw.description || null,
        schema: normalizeIds(raw.schema),
        meta,
        client: raw.client || null,
        official: raw.is_official === true || Number(raw.is_official) === 1,
        forkFrom: raw.fork_from == null ? null : String(raw.fork_from),
        createdAt: raw.created_at || raw.created || null,
        updatedAt: raw.updated_at || raw.updated || null,
        raw,
    };
}

export function buildAchievementLeapCategoryOptions(menus, metadata, completedIds = [], options = {}) {
    const completed = new Set(normalizeIds(completedIds));
    const categoryGroups = new Map();
    const schoolEligibility = options.schoolEligibility || null;

    normalizeMenuEntries(menus).forEach(([fallbackId, menu]) => {
        const category = getCategoryIdentity(menu, fallbackId);
        const achievementIds = filterAchievementLeapIds(
            [...collectMenuAchievementIds([menu])],
            metadata
        ).filter(
            (id) =>
                isEligibleMetadata(metadata?.[id]) &&
                getPoint(metadata, id) > 0 &&
                isAchievementEligibleForSchool({
                    id,
                    metadataItem: metadata?.[id],
                    context: schoolEligibility,
                })
        );
        if (!achievementIds.length) return;

        if (!categoryGroups.has(category.name)) {
            categoryGroups.set(category.name, {
                id: category.id,
                name: category.name,
                sourceIds: [],
                achievementIds: new Set(),
            });
        }

        const group = categoryGroups.get(category.name);
        group.sourceIds.push(category.id);
        achievementIds.forEach((id) => group.achievementIds.add(id));
    });

    return [...categoryGroups.values()]
        .map((category) => {
            const achievementIds = [...category.achievementIds];
            return {
                id: category.id,
                name: category.name,
                sourceIds: [...new Set(category.sourceIds)],
                achievementIds,
                count: achievementIds.length,
                incompleteCount: achievementIds.filter((id) => !completed.has(id)).length,
                points: achievementIds.reduce((total, id) => total + getPoint(metadata, id), 0),
            };
        })
        .filter((category) => category.incompleteCount > 0);
}

export function resolveAchievementLeapStage(currentPoints = 0) {
    const points = Math.max(0, Number(currentPoints) || 0);
    return (
        ACHIEVEMENT_LEAP_STAGE_PROFILES.find(
            (profile) => points >= profile.minPoints && points < profile.maxPoints
        ) || ACHIEVEMENT_LEAP_STAGE_PROFILES[ACHIEVEMENT_LEAP_STAGE_PROFILES.length - 1]
    );
}

function normalizeRange(value, minimum, maximum, { inverse = false } = {}) {
    const current = normalizeNullableNumber(value);
    if (current === null) return null;
    if (minimum === maximum) return 1;
    const normalized = Math.max(0, Math.min(1, (current - minimum) / (maximum - minimum)));
    return inverse ? 1 - normalized : normalized;
}

function buildRecommendationDimensionValues(candidates) {
    const source = Array.isArray(candidates) ? candidates : [];
    const pointValues = source.map((item) => Number(item.points) || 0);
    const efficiencyValues = source
        .map((item) => {
            const minutes = normalizeNullableNumber(item.estimatedMinutes);
            return minutes !== null && minutes > 0 ? (Number(item.points) || 0) / minutes : null;
        })
        .filter((value) => value !== null);
    const minuteValues = source
        .map((item) => normalizeNullableNumber(item.estimatedMinutes))
        .filter((value) => value !== null);
    const pointRange = [Math.min(...pointValues, 0), Math.max(...pointValues, 0)];
    const efficiencyRange = efficiencyValues.length
        ? [Math.min(...efficiencyValues), Math.max(...efficiencyValues)]
        : [0, 0];
    const minuteRange = minuteValues.length ? [Math.min(...minuteValues), Math.max(...minuteValues)] : [0, 0];

    return source.map((item) => {
        const minutes = normalizeNullableNumber(item.estimatedMinutes);
        const timeCost = normalizeNullableNumber(item.cost?.time);
        const efficiency = minutes !== null && minutes > 0 ? (Number(item.points) || 0) / minutes : null;
        return {
            item,
            values: {
                points: normalizeRange(item.points, pointRange[0], pointRange[1]),
                efficiency:
                    efficiency === null
                        ? null
                        : normalizeRange(efficiency, efficiencyRange[0], efficiencyRange[1]),
                difficulty: normalizeRange(item.difficulty, 1, 5, { inverse: true }),
                money: normalizeRange(item.cost?.money, 1, 5, { inverse: true }),
                time:
                    timeCost !== null
                        ? normalizeRange(timeCost, 1, 5, { inverse: true })
                        : normalizeRange(minutes, minuteRange[0], minuteRange[1], { inverse: true }),
                luck: normalizeRange(item.cost?.luck, 1, 5, { inverse: true }),
            },
        };
    });
}

function scoreRecommendationItem(values, weights) {
    let weightedScore = 0;
    let availableWeight = 0;
    RECOMMENDATION_DIMENSIONS.forEach((dimension) => {
        if (values[dimension] === null || values[dimension] === undefined) return;
        const weight = Number(weights?.[dimension]) || 0;
        weightedScore += values[dimension] * weight;
        availableWeight += weight;
    });
    return availableWeight ? Number(((weightedScore / availableWeight) * 100).toFixed(2)) : 0;
}

export function buildAchievementLeapRecommendation({
    candidates = [],
    currentPoints = 0,
    categoryLimit = 3,
    schoolEligibility = null,
} = {}) {
    const profile = resolveAchievementLeapStage(currentPoints);
    const source = (Array.isArray(candidates) ? candidates : []).filter(
        (item) => item?.id && Number(item.points) > 0
    );
    const stageCandidates = source.filter(
        (item) =>
            profile.maxDifficulty === null ||
            item.difficulty === null ||
            item.difficulty === undefined ||
            Number(item.difficulty) <= profile.maxDifficulty
    );
    const eligible = stageCandidates.length ? stageCandidates : source;
    const dimensionRows = buildRecommendationDimensionValues(eligible);
    const dimensionCoverage = Object.fromEntries(
        RECOMMENDATION_DIMENSIONS.map((dimension) => [
            dimension,
            eligible.length
                ? Number(
                      (
                          dimensionRows.filter((row) => row.values[dimension] !== null).length / eligible.length
                      ).toFixed(2)
                  )
                : 0,
        ])
    );
    const categoryMap = new Map();

    dimensionRows.forEach(({ item, values }) => {
        const categoryId = String(item.category?.id || "");
        const categoryName = String(item.category?.name || categoryId).trim();
        if (!categoryId || !categoryName) return;
        if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, { id: categoryId, name: categoryName, items: [] });
        }
        categoryMap.get(categoryName).items.push({
            ...item,
            recommendationScore: scoreRecommendationItem(values, profile.weights),
        });
    });

    const groups = [...categoryMap.values()];
    const maximumCount = Math.max(...groups.map((group) => group.items.length), 1);
    const maximumPoints = Math.max(
        ...groups.map((group) => group.items.reduce((total, item) => total + (Number(item.points) || 0), 0)),
        1
    );
    const categories = groups
        .map((group) => {
            const sortedItems = [...group.items].sort(
                (left, right) => right.recommendationScore - left.recommendationScore || right.points - left.points
            );
            const qualityItems = sortedItems.slice(0, Math.min(12, sortedItems.length));
            const qualityScore = qualityItems.length
                ? qualityItems.reduce((total, item) => total + item.recommendationScore, 0) / qualityItems.length
                : 0;
            const points = sortedItems.reduce((total, item) => total + (Number(item.points) || 0), 0);
            const opportunityScore = Math.log1p(sortedItems.length) / Math.log1p(maximumCount);
            const pointPoolScore = Math.sqrt(points / maximumPoints);
            return {
                id: group.id,
                name: group.name,
                incompleteCount: sortedItems.length,
                points,
                score: Number(
                    (
                        qualityScore * (ACHIEVEMENT_LEAP_CATEGORY_RECOMMENDATION_WEIGHTS.candidateQuality / 100) +
                        opportunityScore * ACHIEVEMENT_LEAP_CATEGORY_RECOMMENDATION_WEIGHTS.incompleteCount +
                        pointPoolScore * ACHIEVEMENT_LEAP_CATEGORY_RECOMMENDATION_WEIGHTS.availablePoints
                    ).toFixed(2)
                ),
            };
        })
        .sort((left, right) => right.score - left.score || right.points - left.points)
        .slice(0, Math.max(1, Number(categoryLimit) || 3));
    const selectedCategoryNames = new Set(categories.map((category) => category.name));
    const selectedCandidates = eligible.filter((item) => selectedCategoryNames.has(item.category?.name));

    return {
        version: ACHIEVEMENT_LEAP_RECOMMENDATION_VERSION,
        schoolEligibilityVersion: schoolEligibility?.version || null,
        roleSchool: schoolEligibility?.school || null,
        stageKey: profile.key,
        strategy: profile.strategy,
        maxDifficulty: profile.maxDifficulty,
        weights: { ...profile.weights },
        categoryWeights: { ...ACHIEVEMENT_LEAP_CATEGORY_RECOMMENDATION_WEIGHTS },
        dimensionCoverage,
        availableDimensionCount: RECOMMENDATION_DIMENSIONS.filter(
            (dimension) => dimensionCoverage[dimension] > 0
        ).length,
        totalDimensionCount: RECOMMENDATION_DIMENSIONS.length,
        categories,
        categoryIds: categories.map((category) => category.id),
        candidateCount: selectedCandidates.length,
        availablePoints: selectedCandidates.reduce((total, item) => total + (Number(item.points) || 0), 0),
    };
}

export function getAchievementLeapCostScore(record) {
    const values = [record?.cost?.money, record?.cost?.time, record?.cost?.luck, record?.difficulty].map(
        normalizeNullableNumber
    );
    return values.every((value) => value !== null) ? values.reduce((total, value) => total + value, 0) : null;
}

export function getAchievementLeapCostTier(record) {
    if (record?.cost?.tier) return record.cost.tier;
    const score = getAchievementLeapCostScore(record);
    if (score === null) return null;
    if (score <= 7) return "free";
    if (score <= 11) return "good";
    if (score <= 15) return "grind";
    return "trap";
}

export function buildAchievementLeapCandidates({
    metadata = {},
    menus = {},
    completedIds = [],
    records = [],
    difficultyById = {},
    categoryIds = [],
    allowedIds = null,
    maxDifficulty = null,
    enforceDifficulty = false,
    includeZeroPoints = false,
    schoolEligibility = null,
} = {}) {
    const completed = new Set(normalizeIds(completedIds));
    const selectedCategories = new Set(normalizeIds(categoryIds));
    const selectedCategoryNames = new Set(
        normalizeMenuEntries(menus)
            .filter(
                ([fallbackId, menu]) =>
                    selectedCategories.has(getCategoryIdentity(menu, fallbackId).id) &&
                    filterAchievementLeapIds([...collectMenuAchievementIds([menu])], metadata).length > 0
            )
            .map(([fallbackId, menu]) => getCategoryIdentity(menu, fallbackId).name)
    );
    const allowed = allowedIds == null ? null : new Set(normalizeIds(allowedIds));
    const categoryIndex = buildCategoryIndex(menus, metadata);
    const recordMap = new Map((records || []).map((record) => [String(record?.id), record]));
    const max = normalizeNullableNumber(maxDifficulty);

    return Object.keys(metadata || {})
        .map(String)
        .filter((id) => isEligibleMetadata(metadata[id]))
        .filter((id) => includeZeroPoints || getPoint(metadata, id) > 0)
        .filter((id) => !completed.has(id))
        .filter((id) => !allowed || allowed.has(id))
        .filter((id) =>
            isAchievementEligibleForSchool({
                id,
                record: recordMap.get(id),
                metadataItem: metadata?.[id],
                context: schoolEligibility,
            })
        )
        .filter((id) => {
            if (!selectedCategories.size) return true;
            const category = categoryIndex.get(id);
            return (
                selectedCategories.has(String(category?.id || "")) ||
                selectedCategoryNames.has(String(category?.name || ""))
            );
        })
        .map((id) => {
            const record = recordMap.get(id) || {};
            const fallbackCategory = categoryIndex.get(id) || { id: null, name: null };
            const difficulty = resolveDifficulty(record, difficultyById, id);
            const schoolRestriction = resolveAchievementSchoolRestriction({
                id,
                record,
                metadataItem: metadata?.[id],
                context: schoolEligibility,
            });
            const candidate = {
                id,
                name: record.name || null,
                iconId: record.iconId || null,
                shortDescription: record.shortDescription || null,
                points: getPoint(metadata, id),
                category: {
                    id: record.category?.id || fallbackCategory.id,
                    name: record.category?.name || fallbackCategory.name,
                    subId: record.category?.subId || null,
                    subName: record.category?.subName || null,
                },
                map: record.map || { id: null, name: null },
                difficulty,
                estimatedMinutes: normalizeNullableNumber(record.estimatedMinutes),
                cost: {
                    money: normalizeNullableNumber(record.cost?.money),
                    time: normalizeNullableNumber(record.cost?.time),
                    luck: normalizeNullableNumber(record.cost?.luck),
                    tier: record.cost?.tier || null,
                },
                restriction: {
                    ...(record.restriction || {}),
                    school:
                        record.restriction?.school ||
                        (schoolRestriction?.schools || []).join("、") ||
                        null,
                },
                guideNote: record.guideNote || null,
                completed: false,
            };
            return {
                ...candidate,
                costScore: getAchievementLeapCostScore(candidate),
                costTier: getAchievementLeapCostTier(candidate),
            };
        })
        .filter((record) => {
            if (!enforceDifficulty || max === null || record.difficulty === null) return true;
            return record.difficulty <= max;
        });
}

export function resolveAchievementLeapStrategy(candidates, requestedStrategy = "easy-first") {
    const source = Array.isArray(candidates) ? candidates : [];
    if (
        requestedStrategy === "efficiency" &&
        source.some((record) => record.estimatedMinutes !== null && record.estimatedMinutes > 0)
    ) {
        return "efficiency";
    }
    if (requestedStrategy === "cost-first" && source.some((record) => record.costScore !== null)) {
        return "cost-first";
    }
    if (requestedStrategy === "easy-first" && source.some((record) => record.difficulty !== null)) {
        return "easy-first";
    }
    return "big-first";
}

export function sortAchievementLeapCandidates(candidates, requestedStrategy = "easy-first") {
    const strategy = resolveAchievementLeapStrategy(candidates, requestedStrategy);
    const result = [...(Array.isArray(candidates) ? candidates : [])];
    const unknownLast = (left, right) => {
        if (left === null && right !== null) return 1;
        if (left !== null && right === null) return -1;
        return 0;
    };

    result.sort((left, right) => {
        if (strategy === "efficiency") {
            const leftEfficiency =
                left.estimatedMinutes !== null && left.estimatedMinutes > 0
                    ? left.points / left.estimatedMinutes
                    : null;
            const rightEfficiency =
                right.estimatedMinutes !== null && right.estimatedMinutes > 0
                    ? right.points / right.estimatedMinutes
                    : null;
            return (
                unknownLast(leftEfficiency, rightEfficiency) ||
                (rightEfficiency || 0) - (leftEfficiency || 0) ||
                right.points - left.points
            );
        }
        if (strategy === "cost-first") {
            return (
                unknownLast(left.costScore, right.costScore) ||
                (left.costScore || 0) - (right.costScore || 0) ||
                right.points - left.points
            );
        }
        if (strategy === "easy-first") {
            return (
                unknownLast(left.difficulty, right.difficulty) ||
                (left.difficulty || 0) - (right.difficulty || 0) ||
                right.points - left.points
            );
        }
        return right.points - left.points || String(left.id).localeCompare(String(right.id));
    });
    return { items: result, strategy };
}

export function buildAchievementLeapRouteMetrics(items, currentPoints, targetPoints) {
    const source = Array.isArray(items) ? items : [];
    const current = Math.max(0, Number(currentPoints) || 0);
    const target = Math.max(0, Number(targetPoints) || 0);
    const targetGap = Math.max(0, target - current);
    const selectedPoints = source.reduce((total, item) => total + (Number(item.points) || 0), 0);
    const hasCompleteMinutes = source.length > 0 && source.every((item) => item.estimatedMinutes !== null);
    const hasCompleteDifficulty = source.length > 0 && source.every((item) => item.difficulty !== null);
    const hasCompleteCost = source.length > 0 && source.every((item) => item.costScore !== null);

    return {
        items: source,
        currentPoints: current,
        targetPoints: target,
        targetGap,
        selectedPoints,
        projectedPoints: current + selectedPoints,
        remainingGap: Math.max(0, targetGap - selectedPoints),
        reached: targetGap > 0 && selectedPoints >= targetGap,
        totalMinutes: hasCompleteMinutes
            ? source.reduce((total, item) => total + Number(item.estimatedMinutes), 0)
            : null,
        averageDifficulty: hasCompleteDifficulty
            ? Number((source.reduce((total, item) => total + Number(item.difficulty), 0) / source.length).toFixed(2))
            : null,
        averageCostScore: hasCompleteCost
            ? Number((source.reduce((total, item) => total + Number(item.costScore), 0) / source.length).toFixed(2))
            : null,
    };
}

export function buildAchievementLeapRoute({
    candidates = [],
    currentPoints = 0,
    targetPoints = 0,
    strategy = "easy-first",
} = {}) {
    const current = Math.max(0, Number(currentPoints) || 0);
    const target = Math.max(0, Number(targetPoints) || 0);
    const targetGap = Math.max(0, target - current);
    const sorted = sortAchievementLeapCandidates(candidates, strategy);
    const items = [];
    let selectedPoints = 0;

    for (const item of sorted.items) {
        if (selectedPoints >= targetGap) break;
        items.push(item);
        selectedPoints += Number(item.points) || 0;
    }

    return {
        requestedStrategy: strategy,
        strategy: sorted.strategy,
        ...buildAchievementLeapRouteMetrics(items, current, target),
    };
}

export function removeAchievementLeapRouteItem(route, itemId) {
    const id = String(itemId ?? "");
    const items = (route?.items || []).filter((item) => String(item.id) !== id);
    return {
        ...(route || {}),
        ...buildAchievementLeapRouteMetrics(items, route?.currentPoints, route?.targetPoints),
    };
}

export function addAchievementLeapRouteItem(route, item) {
    if (!route || !item?.id) return route;
    const id = String(item.id);
    const source = Array.isArray(route.items) ? route.items : [];
    if (source.some((entry) => String(entry.id) === id)) return route;
    return {
        ...route,
        ...buildAchievementLeapRouteMetrics([...source, item], route.currentPoints, route.targetPoints),
    };
}

export function buildAchievementLeapPlanProgress(plan, metadata, completedIds) {
    const completed = new Set(normalizeIds(completedIds));
    const schema = filterAchievementLeapIds(plan?.schema, metadata);
    const totalPoints = schema.reduce((total, id) => total + getPoint(metadata, id), 0);
    const completedPoints = schema.reduce(
        (total, id) => total + (completed.has(id) ? getPoint(metadata, id) : 0),
        0
    );
    return {
        count: schema.length,
        totalPoints,
        completedPoints,
        remainingPoints: Math.max(0, totalPoints - completedPoints),
        completedCount: schema.filter((id) => completed.has(id)).length,
        progress: totalPoints ? Number(((completedPoints / totalPoints) * 100).toFixed(2)) : null,
    };
}
