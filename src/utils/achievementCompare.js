import { collectMenuAchievementIds } from "@/utils/achievementStatistics";
import {
    ACHIEVEMENT_WORKBENCH_EMPTY_TEXT,
    getAchievementWorkbenchDimensionValue,
} from "@/utils/achievementWorkbench";

export const COMMON_UNFINISHED_FILTER = "1,1";
export const COMMON_COMPLETED_FILTER = "common,2";
const UNFINISHED_STATUS = "1";
const COMPLETED_STATUS = "2";
const VALID_GENERALS = new Set([0, 1, 2, 3]);

function normalizeId(value) {
    if (value === null || value === undefined) return "";

    const normalizedValue = String(value).trim();
    return normalizedValue;
}

function getAchievementId(achievement) {
    if (!achievement || typeof achievement !== "object") return "";

    return normalizeId(achievement.ID ?? achievement.id);
}

function getRoleId(role) {
    if (!role || typeof role !== "object") return "";

    return normalizeId(role.jx3id ?? role.jx3Id ?? role.id);
}

function getRoleCompletedAchievementSource(role) {
    if (!role || typeof role !== "object") return [];

    if (Object.prototype.hasOwnProperty.call(role, "completedAchievements")) {
        return role.completedAchievements;
    }
    if (Object.prototype.hasOwnProperty.call(role, "completedAchievementIds")) {
        return role.completedAchievementIds;
    }
    if (Object.prototype.hasOwnProperty.call(role, "my_achievements")) {
        return role.my_achievements;
    }

    const statusList = role.achievementStatusList || role.achievements;
    if (!Array.isArray(statusList)) return [];

    return statusList.map((status) => status?.value).filter((value) => normalizeId(value) !== "-1");
}

function isEligibleMetadata(item) {
    return Boolean(
        item &&
            VALID_GENERALS.has(Number(item.general)) &&
            Number.isFinite(Number(item.point)) &&
            Number(item.point) >= 0
    );
}

function getMetadataPoint(metadata, id) {
    const point = Number(metadata?.[String(id)]?.point);
    return Number.isFinite(point) && point >= 0 ? point : 0;
}

function summarizeAchievementIds(ids, metadata, completedIds) {
    const completed = new Set(normalizeCompletedAchievementIds(completedIds));
    const achievementIds = [...new Set((ids || []).map(String))].filter((id) => isEligibleMetadata(metadata?.[id]));
    const totalPoints = achievementIds.reduce((total, id) => total + getMetadataPoint(metadata, id), 0);
    const completedAchievementIds = achievementIds.filter((id) => completed.has(id));
    const completedPoints = completedAchievementIds.reduce((total, id) => total + getMetadataPoint(metadata, id), 0);

    return {
        achievementIds,
        completedAchievementIds,
        completedCount: completedAchievementIds.length,
        completedPoints,
        countProgress: achievementIds.length
            ? Number(((completedAchievementIds.length / achievementIds.length) * 100).toFixed(2))
            : null,
        pointProgress: totalPoints ? Number(((completedPoints / totalPoints) * 100).toFixed(2)) : null,
        remainingCount: Math.max(0, achievementIds.length - completedAchievementIds.length),
        remainingPoints: Math.max(0, totalPoints - completedPoints),
        totalCount: achievementIds.length,
        totalPoints,
    };
}

function normalizeFilters(selectedFilters) {
    const source = Array.isArray(selectedFilters) ? selectedFilters : [selectedFilters];

    return source
        .map((filter) => {
            if (filter && typeof filter === "object") return filter.type;
            return filter;
        })
        .map((filter) => normalizeId(filter))
        .filter(Boolean);
}

function parseRoleFilter(filter) {
    const separatorIndex = filter.lastIndexOf(",");
    if (separatorIndex === -1) return null;

    const roleId = normalizeId(filter.slice(0, separatorIndex));
    const status = normalizeId(filter.slice(separatorIndex + 1));

    if (!roleId || ![UNFINISHED_STATUS, COMPLETED_STATUS].includes(status)) {
        return null;
    }

    return { roleId, status };
}

/**
 * 扁平化接口返回的成就列表。
 * 系列成就的第一项与主成就重复，因此沿用原页面协议，从第二项开始追加。
 *
 * @param {Array} rawAchievements - 接口返回的原始成就列表
 * @returns {Array} 保持原始顺序的扁平成就列表
 */
export function flattenAchievementList(rawAchievements) {
    if (!Array.isArray(rawAchievements)) return [];

    return rawAchievements.reduce((result, achievement) => {
        if (!achievement || typeof achievement !== "object") return result;

        result.push(achievement);

        if (Array.isArray(achievement.SeriesAchievementList)) {
            result.push(...achievement.SeriesAchievementList.slice(1).filter(Boolean));
        }

        return result;
    }, []);
}

/**
 * 将角色已完成成就数据归一化为去重后的字符串 ID 数组。
 * 支持逗号分隔字符串、数字以及混合数组。
 *
 * @param {string|number|Array} rawCompletedAchievements - 原始已完成成就数据
 * @returns {Array<string>} 保持首次出现顺序的成就 ID
 */
export function normalizeCompletedAchievementIds(rawCompletedAchievements) {
    const source = Array.isArray(rawCompletedAchievements) ? rawCompletedAchievements : [rawCompletedAchievements];
    const normalizedIds = [];
    const seenIds = new Set();

    source.forEach((value) => {
        const values = typeof value === "string" ? value.split(",") : [value];

        values.forEach((item) => {
            const id = normalizeId(item);
            if (!id || seenIds.has(id)) return;

            seenIds.add(id);
            normalizedIds.push(id);
        });
    });

    return normalizedIds;
}

/**
 * 计算已完成成就对应的总资历点数。
 *
 * @param {string|number|Array} completedAchievementIds - 已完成成就 ID
 * @param {Object|Array} achievementPoints - 以成就 ID 为键的点数表
 * @returns {number} 有效点数之和
 */
export function calculateTotalPoints(completedAchievementIds, achievementPoints) {
    if (!achievementPoints || typeof achievementPoints !== "object") return 0;

    return normalizeCompletedAchievementIds(completedAchievementIds).reduce((total, achievementId) => {
        const point = Number(achievementPoints[achievementId]);
        return Number.isFinite(point) ? total + point : total;
    }, 0);
}

/**
 * 为角色生成与当前成就列表一一对应的完成状态。
 * 返回新的角色对象和状态数组，不修改传入角色或成就。
 *
 * @param {Array} roles - 对比角色列表
 * @param {Array} achievements - 当前成就列表
 * @returns {Array} 带 completedAchievements 和 achievementStatusList 的新角色列表
 */
export function buildRoleAchievementStatuses(roles, achievements) {
    const roleList = Array.isArray(roles) ? roles : [];
    const achievementList = Array.isArray(achievements) ? achievements : [];

    return roleList.map((role) => {
        const normalizedRole = role && typeof role === "object" ? role : {};
        const completedAchievements = normalizeCompletedAchievementIds(
            getRoleCompletedAchievementSource(normalizedRole)
        );
        const completedAchievementSet = new Set(completedAchievements);
        const achievementStatusList = achievementList.map((achievement, index) => {
            const achievementId = getAchievementId(achievement);
            const isCompleted = achievementId && completedAchievementSet.has(achievementId);

            return {
                key: index,
                value: isCompleted ? achievementId : "-1",
            };
        });

        return {
            ...normalizedRole,
            completedAchievements,
            achievementStatusList,
        };
    });
}

/**
 * 按角色完成状态筛选成就。
 *
 * 筛选协议：
 * - "1,1"：所有当前角色共同未完成
 * - "{jx3id},1"：指定角色未完成
 * - "{jx3id},2"：指定角色已完成
 * - 多个有效条件之间为 AND；角色条件只检查被指定的角色
 *
 * @param {Array} achievements - 待筛选的成就列表
 * @param {Array} roles - 当前对比角色列表
 * @param {string|Array} selectedFilters - 当前筛选条件
 * @returns {Array} 保持原始顺序的新成就数组
 */
export function filterAchievements(achievements, roles, selectedFilters) {
    const achievementList = Array.isArray(achievements) ? achievements : [];
    const roleList = Array.isArray(roles) ? roles : [];
    const filters = normalizeFilters(selectedFilters);

    if (!filters.length) return achievementList.slice();

    const roleCompletionMap = new Map();
    roleList.forEach((role) => {
        const roleId = getRoleId(role);
        if (!roleId || roleCompletionMap.has(roleId)) return;

        roleCompletionMap.set(
            roleId,
            new Set(normalizeCompletedAchievementIds(getRoleCompletedAchievementSource(role)))
        );
    });

    const hasCommonUnfinishedFilter = filters.includes(COMMON_UNFINISHED_FILTER);
    const hasCommonCompletedFilter = filters.includes(COMMON_COMPLETED_FILTER);
    const roleFilters = filters
        .filter((filter) => ![COMMON_UNFINISHED_FILTER, COMMON_COMPLETED_FILTER].includes(filter))
        .map((filter) => parseRoleFilter(filter))
        .filter(Boolean);

    if (!hasCommonUnfinishedFilter && !hasCommonCompletedFilter && !roleFilters.length) {
        return achievementList.slice();
    }
    if ((hasCommonUnfinishedFilter || hasCommonCompletedFilter) && roleCompletionMap.size === 0) {
        return [];
    }
    if (hasCommonUnfinishedFilter && hasCommonCompletedFilter) return [];

    return achievementList.filter((achievement) => {
        const achievementId = getAchievementId(achievement);

        if (hasCommonUnfinishedFilter) {
            const isCompletedByAnyRole = Array.from(roleCompletionMap.values()).some((completedIds) =>
                completedIds.has(achievementId)
            );
            if (isCompletedByAnyRole) return false;
        }

        if (hasCommonCompletedFilter) {
            const isCompletedByEveryRole = Array.from(roleCompletionMap.values()).every((completedIds) =>
                completedIds.has(achievementId)
            );
            if (!isCompletedByEveryRole) return false;
        }

        return roleFilters.every(({ roleId, status }) => {
            const completedIds = roleCompletionMap.get(roleId);
            if (!completedIds) return false;

            const isCompleted = completedIds.has(achievementId);
            return status === COMPLETED_STATUS ? isCompleted : !isCompleted;
        });
    });
}

export function filterAchievementIdsForCompare(achievementIds, roles, selectedFilters) {
    return filterAchievements(
        (achievementIds || []).map((id) => ({ id: String(id) })),
        roles,
        selectedFilters
    ).map((achievement) => achievement.id);
}

export function buildAchievementRoleProgress(roles, metadata) {
    const allIds = Object.keys(metadata || {}).filter((id) => isEligibleMetadata(metadata[id]));

    return (Array.isArray(roles) ? roles : []).map((role) => ({
        ...role,
        ...summarizeAchievementIds(allIds, metadata, getRoleCompletedAchievementSource(role)),
    }));
}

export function buildAchievementCrossStatistics({ achievementIds, metadata, roles }) {
    const roleList = Array.isArray(roles) ? roles : [];
    if (roleList.length < 2) return [];

    const primaryCompleted = new Set(normalizeCompletedAchievementIds(getRoleCompletedAchievementSource(roleList[0])));
    const secondaryCompleted = new Set(
        normalizeCompletedAchievementIds(getRoleCompletedAchievementSource(roleList[1]))
    );
    const statistics = {
        commonCompleted: { key: "commonCompleted", count: 0, points: 0 },
        primaryOnly: { key: "primaryOnly", count: 0, points: 0 },
        secondaryOnly: { key: "secondaryOnly", count: 0, points: 0 },
        commonIncomplete: { key: "commonIncomplete", count: 0, points: 0 },
    };

    [...new Set((achievementIds || []).map(String))]
        .filter((id) => isEligibleMetadata(metadata?.[id]))
        .forEach((id) => {
            const primaryDone = primaryCompleted.has(id);
            const secondaryDone = secondaryCompleted.has(id);
            let key = "commonIncomplete";
            if (primaryDone && secondaryDone) key = "commonCompleted";
            else if (primaryDone) key = "primaryOnly";
            else if (secondaryDone) key = "secondaryOnly";
            statistics[key].count += 1;
            statistics[key].points += getMetadataPoint(metadata, id);
        });

    const totalCount = Object.values(statistics).reduce((total, item) => total + item.count, 0);
    return Object.values(statistics).map((item) => ({
        ...item,
        percentage: totalCount ? Number(((item.count / totalCount) * 100).toFixed(2)) : 0,
    }));
}

export function buildAchievementCategoryComparison({ menus, metadata, roles }) {
    const menuEntries = Array.isArray(menus)
        ? menus.map((menu, index) => [String(menu?.sub ?? index), menu])
        : Object.entries(menus || {});

    return menuEntries
        .map(([fallbackId, menu]) => {
            const achievementIds = [...collectMenuAchievementIds([menu])].filter((id) =>
                isEligibleMetadata(metadata?.[id])
            );
            const roleProgress = (roles || []).map((role) => ({
                roleId: getRoleId(role),
                ...summarizeAchievementIds(achievementIds, metadata, getRoleCompletedAchievementSource(role)),
            }));
            const validProgress = roleProgress.map((item) => item.pointProgress).filter((value) => value !== null);
            const averageProgress = validProgress.length
                ? Number((validProgress.reduce((total, value) => total + value, 0) / validProgress.length).toFixed(2))
                : null;

            return {
                id: String(menu?.sub ?? fallbackId),
                name: menu?.name || fallbackId,
                achievementIds,
                averageProgress,
                roleProgress,
                totalCount: achievementIds.length,
            };
        })
        .filter((category) => category.totalCount > 0)
        .sort(
            (left, right) =>
                (left.averageProgress ?? Number.POSITIVE_INFINITY) - (right.averageProgress ?? Number.POSITIVE_INFINITY)
        );
}

export function buildAchievementCompareCategoryTree(menus, visibleAchievementIds = null) {
    const visible = visibleAchievementIds ? new Set((visibleAchievementIds || []).map(String)) : null;
    const menuEntries = Array.isArray(menus)
        ? menus.map((menu, index) => [String(menu?.sub ?? index), menu])
        : Object.entries(menus || {});
    const filterIds = (ids) => [...new Set((ids || []).map(String))].filter((id) => !visible || visible.has(id));

    return menuEntries
        .map(([fallbackId, menu]) => {
            const children = (menu?.children || [])
                .map((child, index) => {
                    const allAchievementIds = [...collectMenuAchievementIds([child])];
                    return {
                        id: String(child?.detail ?? child?.sub ?? index),
                        name: child?.name || String(child?.detail ?? index),
                        sourceCount: allAchievementIds.length,
                        achievementIds: filterIds(allAchievementIds),
                    };
                })
                .map((child) => ({ ...child, count: child.achievementIds.length }));
            const allAchievementIds = [...collectMenuAchievementIds([menu])];
            const achievementIds = filterIds(allAchievementIds);
            return {
                id: String(menu?.sub ?? fallbackId),
                name: menu?.name || fallbackId,
                achievementIds,
                sourceCount: allAchievementIds.length,
                count: achievementIds.length,
                children,
            };
        })
        .filter((category) => category.sourceCount > 0);
}

function orderAchievementTags(tags) {
    const schoolTags = [];
    const otherTags = [];

    (Array.isArray(tags) ? tags : []).forEach((tag) => {
        if (tag?.type === "school") {
            schoolTags.push(tag);
        } else {
            otherTags.push(tag);
        }
    });

    return [...schoolTags, ...otherTags];
}

export function buildAchievementCompareExportData({ records = [], roles = [], dimensions = [], translate } = {}) {
    const roleList = Array.isArray(roles) ? roles : [];
    const dimensionList = Array.isArray(dimensions) ? dimensions : [];
    const translateLabel = typeof translate === "function" ? translate : (key) => key;
    const formatValue = (value) =>
        value === null || value === undefined || value === "" ? ACHIEVEMENT_WORKBENCH_EMPTY_TEXT : value;
    const formatDimensionLabel = (dimension) =>
        dimension?.i18nKey
            ? translateLabel(dimension.i18nKey)
            : dimension?.label || dimension?.key || ACHIEVEMENT_WORKBENCH_EMPTY_TEXT;
    const completionSets = roleList.map(
        (role) => new Set(normalizeCompletedAchievementIds(getRoleCompletedAchievementSource(role)))
    );
    const headers = [
        translateLabel("pages.wiki.compare.ui.export.headers.category"),
        translateLabel("pages.wiki.compare.ui.export.headers.achievement"),
        translateLabel("pages.wiki.compare.ui.export.headers.points"),
        ...dimensionList.map(formatDimensionLabel),
        translateLabel("pages.wiki.compare.ui.export.headers.completionRate"),
        translateLabel("pages.wiki.compare.ui.export.headers.tags"),
        ...roleList.map(
            (role) => `${formatValue(role?.name)} · ${formatValue(role?.server)}`
        ),
    ];
    const rows = (Array.isArray(records) ? records : []).map((record) => {
        const completionRate = Number(record?.completionStatistics?.rate);
        const hasCompletionRate =
            record?.completionStatistics?.rate !== null &&
            record?.completionStatistics?.rate !== undefined &&
            Number.isFinite(completionRate);
        const tags = orderAchievementTags(record?.tags)
            .map((tag) => tag?.label)
            .filter(Boolean)
            .join(", ");

        return [
            [record?.category?.name, record?.category?.subName].filter(Boolean).join(" / ") ||
                ACHIEVEMENT_WORKBENCH_EMPTY_TEXT,
            formatValue(record?.name),
            formatValue(record?.points),
            ...dimensionList.map((dimension) =>
                formatValue(getAchievementWorkbenchDimensionValue(record, dimension?.key))
            ),
            hasCompletionRate
                ? `${(completionRate * 100).toFixed(2)}%`
                : ACHIEVEMENT_WORKBENCH_EMPTY_TEXT,
            tags || ACHIEVEMENT_WORKBENCH_EMPTY_TEXT,
            ...completionSets.map((completedIds) =>
                completedIds.has(String(record?.id))
                    ? translateLabel("pages.wiki.compare.ui.status.completed")
                    : translateLabel("pages.wiki.compare.ui.status.incomplete")
            ),
        ];
    });

    return [headers, ...rows];
}
