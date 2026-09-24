import { collectMenuAchievementIds, selectMenuRootsByGeneral } from "@/utils/achievementStatistics";
import { isAchievementEligibleForSchool } from "@/utils/achievementSchoolEligibility";
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

function summarizeIds(ids, metadata, completedIds, schoolEligibility = null, adjustSchoolProgress = true) {
    const completed = normalizeCompletedIds(completedIds);
    const uniqueIds = [...new Set((ids || []).map(String))].filter((id) => isEligibleMetadata(metadata?.[id]));
    const completedAchievementIds = uniqueIds.filter((id) => completed.has(id));
    const totalPoints = uniqueIds.reduce((total, id) => total + getPoint(metadata, id), 0);
    const completedPoints = completedAchievementIds.reduce((total, id) => total + getPoint(metadata, id), 0);
    // 门派豁免只影响汇总百分比，不改变实际完成数量、资历或完成 ID。
    const exemptIds = schoolEligibility?.school
        ? uniqueIds.filter((id) => !completed.has(id) && !isAchievementEligibleForSchool({
            id, metadataItem: metadata[id], context: schoolEligibility,
        }))
        : [];
    const exemptPoints = exemptIds.reduce((total, id) => total + getPoint(metadata, id), 0);
    const progressPoints = completedPoints + (adjustSchoolProgress ? exemptPoints : 0);

    return {
        achievementIds: uniqueIds,
        completedCount: completedAchievementIds.length,
        completedPoints,
        countProgress: uniqueIds.length
            ? Number((((completedAchievementIds.length + (adjustSchoolProgress ? exemptIds.length : 0)) / uniqueIds.length) * 100).toFixed(2))
            : null,
        pointProgress: totalPoints ? Number(((progressPoints / totalPoints) * 100).toFixed(2)) : null,
        remainingCount: Math.max(0, uniqueIds.length - completedAchievementIds.length),
        remainingPoints: Math.max(0, totalPoints - completedPoints),
        remainingAvailablePoints: Math.max(0, totalPoints - completedPoints - exemptPoints),
        totalCount: uniqueIds.length,
        totalPoints,
    };
}

// 菜单顶层数组项代表一个系列；系列内的各阶段仍独立累计资历。
export function buildAchievementSeriesCounts(menus, metadata, completedIds) {
    const completed = normalizeCompletedIds(completedIds);
    const groups = new Map();
    const visit = (menu) => {
        (menu?.achievements || []).forEach((entry) => {
            const ids = [...new Set((Array.isArray(entry) ? entry.flat(Infinity) : [entry])
                .map(String))].filter((id) => isEligibleMetadata(metadata?.[id]));
            if (ids.length) groups.set([...ids].sort().join(","), ids);
        });
        normalizeMenuEntries(menu?.children).forEach(([, child]) => visit(child));
    };
    normalizeMenuEntries(menus).forEach(([, menu]) => visit(menu));
    const totalCount = groups.size;
    const completedCount = [...groups.values()].filter((ids) => ids.every((id) => completed.has(id))).length;
    return {
        totalCount,
        completedCount,
        remainingCount: totalCount - completedCount,
        countProgress: totalCount ? Number((completedCount / totalCount * 100).toFixed(2)) : null,
    };
}

function buildCategoryProgressEntry({ menu, fallbackId, parentId = null, metadata, completedIds, schoolEligibility = null }) {
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
                schoolEligibility,
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
        ...summarizeIds([...collectMenuAchievementIds([menu])], metadata, completedIds, schoolEligibility, parentId === null),
        ...buildAchievementSeriesCounts([menu], metadata, completedIds),
    };
}

export function getAchievementTier(metadataItem) {
    if (!metadataItem) return "normal";
    const general = Number(metadataItem.general);
    if (general === 0) return "retired";
    if (general === 3) return "special";
    if (metadataItem.visible === false && [1, 2].includes(general)) return "hidden";
    if (general === 2) return "wujia";
    return "normal";
}

export function buildAchievementOverallProgress(metadata, completedIds, schoolEligibility = null) {
    return summarizeIds(Object.keys(metadata || {}), metadata, completedIds, schoolEligibility);
}

export function selectHiddenAchievementMetadata(metadata = {}) {
    return Object.fromEntries(Object.entries(metadata).filter(([, item]) =>
        item.visible === false && Number(item.general) === 1 && Number(item.point) > 0
    ));
}

export function buildAchievementTierProgress(metadata, completedIds, completableHiddenIds = null) {
    const idsByTier = {
        normal: [],
        wujia: [],
        hidden: [],
        retired: [],
        special: [],
    };

    Object.entries(metadata || {}).forEach(([id, item]) => {
        if (!isEligibleMetadata(item)) return;
        const tier = getAchievementTier(item);
        idsByTier[tier].push(id);
    });

    idsByTier.hidden = Object.keys(selectHiddenAchievementMetadata(metadata));
    const completable = completableHiddenIds === null ? null : new Set(completableHiddenIds.map(String));
    const remainingHidden = completable === null ? null : summarizeIds(
        idsByTier.hidden.filter((id) => completable.has(id)), metadata, completedIds
    );

    return Object.entries(idsByTier).map(([key, ids]) => ({
        key,
        ...summarizeIds(ids, metadata, completedIds),
        ...(key === "hidden" ? {
            remainingCount: remainingHidden?.remainingCount ?? null,
            remainingPoints: remainingHidden?.remainingPoints ?? null,
            remainingAvailablePoints: remainingHidden?.remainingPoints ?? null,
        } : {}),
    }));
}

export function buildAchievementCategoryProgress({ menus, metadata, completedIds, schoolEligibility = null, allMenus = false }) {
    const regularMenus = allMenus ? menus : selectMenuRootsByGeneral(menus, metadata, 1);

    return normalizeMenuEntries(regularMenus)
        .map(([fallbackId, menu]) =>
            buildCategoryProgressEntry({ menu, fallbackId, metadata, completedIds, schoolEligibility })
        )
        .filter((category) => category.totalCount > 0);
}

// 按菜单的默认顺序建立目录；不为缺失的一级/二级目录制造分类。
export function buildAchievementHiddenCategoryProgress({ menus, records = [], metadata, completedIds }) {
    const roots = normalizeMenuEntries(menus).map(([, menu]) => menu);
    const groups = new Map();
    records.forEach((record) => {
        const item = metadata?.[record.id];
        if (item?.visible !== false || Number(item.general) !== 1 || !(Number(item.point) > 0)) return;
        const sub = String(record.category?.id || "");
        const order = roots.findIndex((root) => String(root.sub) === sub);
        const menu = roots[order];
        if (!menu?.name) return;
        const name = menu.name;
        if (!groups.has(name)) groups.set(name, {
            id: `hidden:${sub}`, parentId: null, name, order,
            achievementIds: [], childGroups: new Map(),
        });
        const group = groups.get(name);
        group.order = Math.min(group.order, order);
        group.achievementIds.push(String(record.id));
        const children = normalizeMenuEntries(menu.children).map(([, child]) => child);
        const detail = String(record.category?.subId || "");
        const childOrder = children.findIndex((child) => String(child.detail) === detail);
        const childMenu = children[childOrder];
        if (!childMenu?.name) return;
        if (!group.childGroups.has(childMenu.name)) group.childGroups.set(childMenu.name, {
            id: `${group.id}:${sub}:${detail}`, parentId: group.id, name: childMenu.name,
            iconId: record.iconId || "",
            order: order * 1000 + childOrder, achievementIds: [], children: [],
        });
        group.childGroups.get(childMenu.name).achievementIds.push(String(record.id));
    });
    return [...groups.values()].sort((left, right) => left.order - right.order)
        .map(({ childGroups, order, ...group }) => ({
            ...group,
            ...summarizeIds(group.achievementIds, metadata, completedIds),
            children: [...childGroups.values()].sort((left, right) => left.order - right.order)
                .map(({ order, ...child }) => ({
                    ...child, ...summarizeIds(child.achievementIds, metadata, completedIds),
                })),
        }));
}

export function searchHiddenAchievementRecords(records, { keyword = "", mapId = "" } = {}) {
    const query = String(keyword).trim().toLocaleLowerCase();
    return records.filter((record) => {
        const text = `${record.name || ""} ${record.shortDescription || ""}`.toLocaleLowerCase();
        const mapIds = [record.map?.id, record.map?.sceneId, record.map?.worldMapId]
            .flatMap((value) => String(value || "").split(/[,;\s]+/));
        return (!query || text.includes(query)) && (!mapId || mapIds.includes(String(mapId)));
    });
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
    includedAchievementIds = null,
}) {
    const completed = normalizeCompletedIds(completedIds);
    const included = includedAchievementIds === null
        ? null
        : new Set([...includedAchievementIds].map(String));
    const sourceIds = categoryAchievementIds || Object.keys(metadata || {});
    const filteredIds = [...new Set(sourceIds.map(String))]
        .filter((id) => isEligibleMetadata(metadata?.[id]))
        .filter((id) => !included || included.has(id))
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
    metadata = null,
    categoryId = "all",
    categoryAchievementIds = null,
    tier = "all",
    completion = "all",
    sort = "default",
    difficultyById = null,
    includedAchievementIds = null,
}) {
    const categoryIds = categoryAchievementIds ? new Set(categoryAchievementIds.map(String)) : null;
    const included = includedAchievementIds === null
        ? null
        : new Set([...includedAchievementIds].map(String));

    const filteredRecords = (Array.isArray(records) ? records : [])
        .filter((record) => !metadata || isEligibleMetadata(metadata[String(record?.id)]))
        .filter((record) => !included || included.has(String(record?.id)))
        .filter(
            (record) =>
                categoryId === "all" ||
                (categoryIds
                    ? categoryIds.has(String(record?.id))
                    : String(record?.category?.id) === String(categoryId))
        )
        .filter((record) => tier === "all" ||
            (metadata ? getAchievementTier(metadata[String(record?.id)]) : record?.tier) === tier)
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
