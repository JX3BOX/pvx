import fireworkAchievementIds from "@jx3box/jx3box-common/data/firework_achievement_ids.json";

export const FIREWORK_ACHIEVEMENT_IDS = Object.freeze([...fireworkAchievementIds]);

function appendAchievementIds(value, target) {
    if (Array.isArray(value)) {
        value.forEach((item) => appendAchievementIds(item, target));
        return;
    }

    if (value === null || value === undefined || value === "") return;
    target.add(String(value));
}

function walkMenuNode(node, target) {
    if (!node || typeof node !== "object") return;
    appendAchievementIds(node.achievements || [], target);
    (node.children || []).forEach((child) => walkMenuNode(child, target));
}

export function collectMenuAchievementIds(menus) {
    const ids = new Set();
    const roots = Array.isArray(menus) ? menus : Object.values(menus || {});
    roots.forEach((root) => walkMenuNode(root, ids));
    return ids;
}

export function normalizeAchievementMetadata(points) {
    return Object.entries(points || {}).reduce((metadata, [id, tuple]) => {
        if (!Array.isArray(tuple) || tuple.length < 3) return metadata;

        const point = Number(tuple[0]);
        const general = Number(tuple[1]);
        const visible = Number(tuple[2]);
        if (!Number.isFinite(point) || point < 0 || ![0, 1].includes(visible)) return metadata;

        metadata[String(id)] = {
            point,
            general: Number.isFinite(general) ? general : null,
            visible: visible === 1,
        };
        return metadata;
    }, {});
}

export function createAchievementPointMap(metadata) {
    return Object.entries(metadata || {}).reduce((points, [id, item]) => {
        points[id] = Number(item?.point) || 0;
        return points;
    }, {});
}

export function normalizeCompletedAchievementIds(value) {
    const source = Array.isArray(value) ? value : String(value || "").split(",");
    return new Set(source.map((id) => String(id).trim()).filter(Boolean));
}

export function selectMenuRootsByGeneral(menus, metadata, general) {
    const selectedGeneral = Number(general);
    const sourceEntries = Array.isArray(menus)
        ? menus.map((item, index) => [String(index), item])
        : Object.entries(menus || {});

    const selectedEntries = sourceEntries.filter(([, root]) => {
        const ids = collectMenuAchievementIds([root]);
        return [...ids].some((id) => metadata[id]?.general === selectedGeneral);
    });

    if (Array.isArray(menus)) return selectedEntries.map(([, item]) => item);
    return Object.fromEntries(selectedEntries);
}

function summarizeAchievementIds(ids, metadata, completedIds) {
    let completedCount = 0;
    let completedPoints = 0;
    let totalPoints = 0;
    let totalCount = 0;

    new Set([...ids].map(String)).forEach((id) => {
        const item = metadata[id];
        if (!item || Number(item.point) <= 0) return;

        totalCount += 1;
        totalPoints += item.point;
        if (completedIds.has(id)) {
            completedCount += 1;
            completedPoints += item.point;
        }
    });

    const percentage = (completed, total) =>
        total ? Math.min(100, Number(((completed / total) * 100).toFixed(2))) : null;

    return {
        completedCount,
        completedPoints,
        remainingCount: Math.max(0, totalCount - completedCount),
        remainingPoints: Math.max(0, totalPoints - completedPoints),
        totalCount,
        totalPoints,
        countProgress: percentage(completedCount, totalCount),
        pointProgress: percentage(completedPoints, totalPoints),
    };
}

function getAchievementIds(metadata, predicate) {
    return Object.entries(metadata || {})
        .filter(([id, item]) => predicate(item, id))
        .map(([id]) => id);
}

function isCountableAchievement(item) {
    return [0, 1, 2, 3].includes(item?.general) && item.point > 0;
}

function buildCategoryStatistic(key, ids, metadata, completedIds, extra = {}) {
    return {
        key,
        ...summarizeAchievementIds(ids, metadata, completedIds),
        ...extra,
    };
}

function buildScopedStatistic(key, ids, metadata, completedIds) {
    const hiddenIds = ids.filter((id) => metadata[id] && !metadata[id].visible);

    return {
        ...buildCategoryStatistic(key, ids, metadata, completedIds),
        hidden: summarizeAchievementIds(hiddenIds, metadata, completedIds),
    };
}

export function buildAchievementOverview({ metadata, completedAchievementIds, includeHidden = true }) {
    const completedIds = normalizeCompletedAchievementIds(completedAchievementIds);
    const allIds = Object.keys(metadata || {});
    const eligibleIds = getAchievementIds(metadata, isCountableAchievement);
    const formalIds = getAchievementIds(metadata, (item) => [1, 2].includes(item?.general) && isCountableAchievement(item));
    const retiredIds = getAchievementIds(metadata, (item) => item?.general === 0 && isCountableAchievement(item));
    const specialIds = getAchievementIds(metadata, (item) => item?.general === 3 && isCountableAchievement(item));
    const scopedIds = includeHidden ? eligibleIds : eligibleIds.filter((id) => metadata[id]?.visible);
    const scopedFormalIds = includeHidden ? formalIds : formalIds.filter((id) => metadata[id]?.visible);
    const scopedRetiredIds = includeHidden ? retiredIds : retiredIds.filter((id) => metadata[id]?.visible);
    const scopedSpecialIds = includeHidden ? specialIds : specialIds.filter((id) => metadata[id]?.visible);
    const regularIds = getAchievementIds(
        metadata,
        (item) => item?.general === 1 && item?.visible && isCountableAchievement(item)
    );
    const regularHiddenIds = getAchievementIds(
        metadata,
        (item) => item?.general === 1 && !item?.visible && item.point > 0
    );
    const wujiaIds = getAchievementIds(
        metadata,
        (item) => item?.general === 2 && item?.visible && isCountableAchievement(item)
    );
    const wujiaHiddenIds = getAchievementIds(
        metadata,
        (item) => item?.general === 2 && !item?.visible && item.point > 0
    );
    const fireworkIds = FIREWORK_ACHIEVEMENT_IDS.map(String).filter(
        (id) => metadata[id]?.general === 1 && metadata[id].visible && isCountableAchievement(metadata[id])
    );
    const retiredSeniority = summarizeAchievementIds(scopedRetiredIds, metadata, completedIds);
    const specialAchievements = summarizeAchievementIds(scopedSpecialIds, metadata, completedIds);
    const obtainable = summarizeAchievementIds(scopedFormalIds, metadata, completedIds);
    const overall = buildScopedStatistic("overall", scopedIds, metadata, completedIds);

    return {
        overall: {
            ...overall,
            obtainableRemainingCount: obtainable.remainingCount,
            obtainableRemainingPoints: obtainable.remainingPoints,
        },
        retiredSeniority,
        specialAchievements,
        categories: [
            buildCategoryStatistic("regular", regularIds, metadata, completedIds),
            buildCategoryStatistic("regularHidden", regularHiddenIds, metadata, completedIds, {
                hiddenGroup: true,
            }),
            buildCategoryStatistic("wujia", wujiaIds, metadata, completedIds),
            buildCategoryStatistic("wujiaHidden", wujiaHiddenIds, metadata, completedIds, {
                hiddenGroup: true,
            }),
            buildCategoryStatistic("fireworks", fireworkIds, metadata, completedIds, {
                includedIn: "regular",
            }),
            buildCategoryStatistic("retired", retiredIds, metadata, completedIds, {
                hiddenGroup: true,
                retiredGroup: true,
            }),
        ],
        scope: {
            includeHidden,
        },
        diagnostics: {
            unknownCompletedCount: [...completedIds].filter((id) => !metadata[id]).length,
            sourceGeneralThreeCount: allIds.filter((id) => metadata[id]?.general === 3).length,
            sourceZeroPointCount: allIds.filter(
                (id) => [0, 1, 2, 3].includes(metadata[id]?.general) && Number(metadata[id].point) === 0
            ).length,
            excludedZeroPointCount: allIds.filter(
                (id) => [0, 1, 2, 3].includes(metadata[id]?.general) && Number(metadata[id]?.point) === 0
            ).length,
            retiredAchievementCount: retiredIds.length,
            specialAchievementCount: specialIds.length,
            excludedInvalidGeneralCount: allIds.filter((id) => ![0, 1, 2, 3].includes(metadata[id]?.general)).length,
        },
    };
}
