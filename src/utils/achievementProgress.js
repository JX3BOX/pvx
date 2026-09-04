import { collectMenuAchievementIds, selectMenuRootsByGeneral } from "@/utils/achievementStatistics";
import {
    getAchievementWorkbenchDimensionSort,
    getAchievementWorkbenchDimensionValue,
} from "@/utils/achievementWorkbench";

const VALID_GENERALS = new Set([0, 1, 2, 3]);

function normalizeCompletedIds(value) {
    const source = value instanceof Set ? [...value] : Array.isArray(value) ? value : String(value || "").split(",");
    return new Set(source.map((id) => String(id).trim()).filter(Boolean));
}

function normalizeMenuEntries(menus) {
    return Array.isArray(menus)
        ? menus.map((menu, index) => [String(menu?.sub ?? index), menu])
        : Object.entries(menus || {});
}

function getPoint(metadata, id) {
    const point = Number(metadata?.[String(id)]?.point);
    return Number.isFinite(point) && point >= 0 ? point : 0;
}

function isEligibleMetadata(item) {
    return Boolean(item && VALID_GENERALS.has(Number(item.general)) && Number.isFinite(Number(item.point)));
}

function summarizeIds(ids, metadata, completedIds) {
    const completed = normalizeCompletedIds(completedIds);
    const uniqueIds = [...new Set((ids || []).map(String))].filter((id) => isEligibleMetadata(metadata?.[id]));
    const completedAchievementIds = uniqueIds.filter((id) => completed.has(id));
    const totalPoints = uniqueIds.reduce((total, id) => total + getPoint(metadata, id), 0);
    const completedPoints = completedAchievementIds.reduce((total, id) => total + getPoint(metadata, id), 0);

    return {
        achievementIds: uniqueIds,
        completedCount: completedAchievementIds.length,
        completedPoints,
        countProgress: uniqueIds.length
            ? Number(((completedAchievementIds.length / uniqueIds.length) * 100).toFixed(2))
            : null,
        pointProgress: totalPoints ? Number(((completedPoints / totalPoints) * 100).toFixed(2)) : null,
        remainingCount: Math.max(0, uniqueIds.length - completedAchievementIds.length),
        remainingPoints: Math.max(0, totalPoints - completedPoints),
        totalCount: uniqueIds.length,
        totalPoints,
    };
}

function buildCategoryProgressEntry({ menu, fallbackId, parentId = null, metadata, completedIds }) {
    const subId = String(menu?.sub ?? parentId ?? fallbackId);
    const detailId = menu?.detail === null || menu?.detail === undefined ? String(fallbackId) : String(menu.detail);
    const id = parentId === null ? subId : `${subId}:${detailId}`;
    const children = normalizeMenuEntries(menu?.children)
        .map(([childFallbackId, child]) =>
            buildCategoryProgressEntry({
                menu: child,
                fallbackId: childFallbackId,
                parentId: id,
                metadata,
                completedIds,
            })
        )
        .filter((category) => category.totalCount > 0);

    return {
        id,
        parentId,
        subId,
        detailId: parentId === null ? null : detailId,
        name: menu?.name || fallbackId,
        children,
        ...summarizeIds([...collectMenuAchievementIds([menu])], metadata, completedIds),
    };
}

export function getAchievementTier(metadataItem) {
    if (!metadataItem) return "normal";
    const general = Number(metadataItem.general);
    if (general === 0) return "retired";
    if (metadataItem.visible === false && [1, 2].includes(general)) return "hidden";
    if (general === 2) return "wujia";
    return "normal";
}

export function buildAchievementOverallProgress(metadata, completedIds) {
    return summarizeIds(Object.keys(metadata || {}), metadata, completedIds);
}

export function buildAchievementTierProgress(metadata, completedIds) {
    const idsByTier = {
        normal: [],
        wujia: [],
        hidden: [],
        retired: [],
    };

    Object.entries(metadata || {}).forEach(([id, item]) => {
        if (!isEligibleMetadata(item)) return;
        const tier = getAchievementTier(item);
        idsByTier[tier].push(id);
    });

    return Object.entries(idsByTier).map(([key, ids]) => ({
        key,
        ...summarizeIds(ids, metadata, completedIds),
    }));
}

export function buildAchievementCategoryProgress({ menus, metadata, completedIds }) {
    const regularMenus = selectMenuRootsByGeneral(menus, metadata, 1);

    return normalizeMenuEntries(regularMenus)
        .map(([fallbackId, menu]) =>
            buildCategoryProgressEntry({ menu, fallbackId, metadata, completedIds })
        )
        .filter((category) => category.totalCount > 0);
}

function normalizeAchievementDimensionKey(metric) {
    return metric === "difficulty" ? "overall" : metric;
}

function getAchievementSortDimensionKey(sort) {
    const dimensionSort = getAchievementWorkbenchDimensionSort(sort);
    if (dimensionSort) return dimensionSort.key;
    if (sort === "difficulty-asc") return "overall";
    if (sort === "time-asc") return "time";
    return null;
}

function getAchievementDifficultyMetric(difficulty, metric) {
    return getAchievementWorkbenchDimensionValue(difficulty, normalizeAchievementDimensionKey(metric));
}

function hasAchievementRecordMetric(record, metric) {
    const dimensionKey = normalizeAchievementDimensionKey(metric);
    const dimensions = record?.difficultyDimensions;
    if (
        dimensions &&
        typeof dimensions === "object" &&
        !Array.isArray(dimensions) &&
        Object.prototype.hasOwnProperty.call(dimensions, dimensionKey)
    ) {
        return true;
    }

    const fallbackSources = {
        money: record?.cost,
        time: record?.cost,
        luck: record?.cost,
        costEffectiveness: record,
        overall: record,
    };
    const fallbackKeys = {
        money: "money",
        time: "time",
        luck: "luck",
        costEffectiveness: "costEffectiveness",
        overall: "difficulty",
    };
    const source = fallbackSources[dimensionKey];
    const key = fallbackKeys[dimensionKey];
    return Boolean(source && key && Object.prototype.hasOwnProperty.call(source, key));
}

function compareAchievementMetrics(leftValue, rightValue) {
    if (leftValue === null && rightValue === null) return 0;
    if (leftValue === null) return 1;
    if (rightValue === null) return -1;
    return leftValue - rightValue;
}

export function hasAchievementDifficultyMetricCoverage(ids, difficultyById = {}, metric = "difficulty") {
    if (!normalizeAchievementDimensionKey(metric)) return false;
    const normalizedIds = [...new Set((ids || []).map(String))];
    if (!normalizedIds.length) return false;
    return normalizedIds.every((id) => Object.prototype.hasOwnProperty.call(difficultyById, id));
}

function compareAchievementIds(leftId, rightId, metadata, completed, sort, difficultyById) {
    const left = metadata?.[leftId] || {};
    const right = metadata?.[rightId] || {};
    const leftPoint = getPoint(metadata, leftId);
    const rightPoint = getPoint(metadata, rightId);

    if (sort === "default") return 0;
    if (sort === "points-asc") return leftPoint - rightPoint || leftId.localeCompare(rightId);
    if (sort === "points-desc") return rightPoint - leftPoint || leftId.localeCompare(rightId);
    const dimensionKey = getAchievementSortDimensionKey(sort);
    if (dimensionKey) {
        return compareAchievementMetrics(
            getAchievementDifficultyMetric(difficultyById?.[leftId], dimensionKey),
            getAchievementDifficultyMetric(difficultyById?.[rightId], dimensionKey)
        );
    }

    const completionOrder = Number(completed.has(leftId)) - Number(completed.has(rightId));
    return (
        completionOrder || rightPoint - leftPoint || getAchievementTier(left).localeCompare(getAchievementTier(right))
    );
}

export function filterAchievementIds({
    metadata,
    completedIds,
    categoryAchievementIds = null,
    tier = "all",
    completion = "all",
    sort = "default",
    difficultyById = {},
}) {
    const completed = normalizeCompletedIds(completedIds);
    const sourceIds = categoryAchievementIds || Object.keys(metadata || {});
    const filteredIds = [...new Set(sourceIds.map(String))]
        .filter((id) => isEligibleMetadata(metadata?.[id]))
        .filter((id) => tier === "all" || getAchievementTier(metadata[id]) === tier)
        .filter((id) => completion === "all" || (completion === "completed" ? completed.has(id) : !completed.has(id)));
    const metric = getAchievementSortDimensionKey(sort);
    const effectiveSort =
        metric && !hasAchievementDifficultyMetricCoverage(filteredIds, difficultyById, metric) ? "default" : sort;

    return filteredIds.sort((left, right) =>
        compareAchievementIds(left, right, metadata, completed, effectiveSort, difficultyById)
    );
}

function compareRecords(left, right, sort) {
    const leftPoints = Number(left?.points) || 0;
    const rightPoints = Number(right?.points) || 0;

    if (sort === "default") return 0;
    if (sort === "points-asc") return leftPoints - rightPoints || String(left?.id).localeCompare(String(right?.id));
    if (sort === "points-desc") return rightPoints - leftPoints || String(left?.id).localeCompare(String(right?.id));
    const dimensionKey = getAchievementSortDimensionKey(sort);
    if (dimensionKey) {
        return compareAchievementMetrics(
            getAchievementDifficultyMetric(left, dimensionKey),
            getAchievementDifficultyMetric(right, dimensionKey)
        );
    }

    return Number(Boolean(left?.completed)) - Number(Boolean(right?.completed)) || rightPoints - leftPoints;
}

export function filterAchievementRecords({
    records,
    categoryId = "all",
    categoryAchievementIds = null,
    tier = "all",
    completion = "all",
    sort = "default",
    difficultyById = null,
}) {
    const categoryIds = categoryAchievementIds ? new Set(categoryAchievementIds.map(String)) : null;

    const filteredRecords = (Array.isArray(records) ? records : [])
        .filter(
            (record) =>
                categoryId === "all" ||
                (categoryIds
                    ? categoryIds.has(String(record?.id))
                    : String(record?.category?.id) === String(categoryId))
        )
        .filter((record) => tier === "all" || record?.tier === tier)
        .filter(
            (record) =>
                completion === "all" ||
                (completion === "completed" ? record?.completed === true : record?.completed === false)
        );
    const dimensionKey = getAchievementSortDimensionKey(sort);
    const hasMetricCoverage =
        !dimensionKey ||
        (difficultyById
            ? hasAchievementDifficultyMetricCoverage(
                  filteredRecords.map((record) => record?.id),
                  difficultyById,
                  dimensionKey
              )
            : filteredRecords.every((record) => hasAchievementRecordMetric(record, dimensionKey)));
    const effectiveSort = hasMetricCoverage ? sort : "default";

    return filteredRecords.sort((left, right) => compareRecords(left, right, effectiveSort));
}

export function paginateAchievementItems(items, page = 1, pageSize = 20) {
    const normalizedPageSize = Math.max(1, Number(pageSize) || 20);
    const normalizedPage = Math.max(1, Number(page) || 1);
    const start = (normalizedPage - 1) * normalizedPageSize;
    return (Array.isArray(items) ? items : []).slice(start, start + normalizedPageSize);
}
