import {
    getAchievementPointsV2,
    getAchievementRewardItems,
    get_achievement,
    getAchievementsPost,
    getMapList,
    getMenus,
    getRoleGameAchievements,
    searchAchievements,
} from "@/service/achievement";
import { getUserRoles } from "@/service/team";
import {
    createdWikiAchievementLeapSchema,
    deleteWikiAchievementLeapSchema,
    getMyKith,
    getMyKithRoles,
    getWikiAchievementDifficultyDimensions,
    getWikiAchievementDifficultyList,
    getWikiAchievementLeapSchema,
    getWikiAchievementLeapSchemaList,
    getWikiAchievementLeapSchemaProgress,
    getWikiAchievementTag,
    getWikiAchievementTagsByAchievements,
    getWikiAchievementRecommendation,
    updateWikiAchievementLeapSchema,
} from "@/service/wiki";
import {
    normalizeAchievementWorkbenchDifficulty,
    normalizeAchievementWorkbenchDifficultyDimensions,
    normalizeAchievementWorkbenchRecords,
    normalizeAchievementWorkbenchRole,
    normalizeAchievementWorkbenchTags,
} from "@/utils/achievementWorkbench";
import { normalizeAchievementLeapPlan } from "@/utils/achievementLeap";
import { normalizeAchievementMetadata } from "@/utils/achievementStatistics";

const CURRENT_DETAIL_ATTRIBUTES = [
    "ID",
    "Name",
    "ShortDesc",
    "Sub",
    "Detail",
    "IconID",
    "Point",
    "SceneID",
    "dwMapID",
    "ItemType",
    "ItemID",
].join(",");

const ACHIEVEMENT_WORKBENCH_DIMENSION_CACHE_TTL = 60_000;
const ACHIEVEMENT_WORKBENCH_PUBLIC_BATCH_SIZE = 5000;
const ACHIEVEMENT_WORKBENCH_PUBLIC_MAX_BATCH_SIZE = 20000;

let difficultyDimensionsCache = null;
let difficultyDimensionsCachedAt = 0;
let difficultyDimensionsPromise = null;

function normalizeCompletedAchievementIds(value) {
    const source = Array.isArray(value) ? value : String(value || "").split(",");
    return [...new Set(source.map((id) => String(id).trim()).filter(Boolean))];
}

function normalizeAchievementApiIds(value) {
    return [
        ...new Set(
            normalizeCompletedAchievementIds(value)
                .map(Number)
                .filter((id) => Number.isSafeInteger(id) && id > 0)
        ),
    ];
}

function normalizeAchievementClient(value) {
    return value === "origin" ? "origin" : "std";
}

function normalizeBatchSize(value, fallback = 500) {
    const size = Math.floor(Number(value));
    return Number.isFinite(size) && size > 0 ? size : fallback;
}

function getSuccessfulCmsPayload(response, resourceName) {
    const payload = response?.data;
    if (
        !payload ||
        typeof payload !== "object" ||
        Array.isArray(payload) ||
        !Object.prototype.hasOwnProperty.call(payload, "code")
    ) {
        throw new Error(`${resourceName}响应格式异常`);
    }
    if (payload.code !== 0 && payload.code !== "0") {
        const error = new Error(payload.msg || `${resourceName}加载失败`);
        error.code = payload.code;
        throw error;
    }
    return payload.data;
}

function getSuccessfulCmsData(response, resourceName) {
    const data = getSuccessfulCmsPayload(response, resourceName);
    if (!Array.isArray(data)) {
        throw new Error(`${resourceName}响应格式异常`);
    }
    return data;
}

function flattenAchievementRecords(records) {
    const seen = new Set();
    const result = [];

    function append(record) {
        if (!record || typeof record !== "object") return;
        const id = String(record.ID ?? record.id ?? "");
        if (id && !seen.has(id)) {
            seen.add(id);
            result.push(record);
        }
        (record.SeriesAchievementList || []).forEach(append);
    }

    (Array.isArray(records) ? records : []).forEach(append);
    return result;
}

function getAchievementDetailRecord(response) {
    return response?.data?.data?.achievement || response?.data?.data || null;
}

async function fetchMissingAchievementRecords(ids, client) {
    const records = [];
    const batchSize = 6;

    for (let index = 0; index < ids.length; index += batchSize) {
        const batch = ids.slice(index, index + batchSize);
        const responses = await Promise.all(
            batch.map((id) =>
                get_achievement(id, {
                    params: { client },
                })
            )
        );
        responses.forEach((response) => {
            const record = getAchievementDetailRecord(response);
            if (record && typeof record === "object") records.push(record);
        });
    }

    return records;
}

export async function fetchAchievementWorkbenchCatalog(client = "std") {
    const [menuResponse, pointsResponse] = await Promise.all([
        getMenus({ general: "0,1,2,3", client }),
        getAchievementPointsV2(client),
    ]);

    return {
        client,
        menus: menuResponse.data?.data?.menus || {},
        metadata: normalizeAchievementMetadata(pointsResponse.data?.data?.points || {}),
        updatedAt: null,
    };
}

export async function fetchAchievementWorkbenchRoles() {
    const response = await getUserRoles();
    return (response.data?.data?.list || []).map((role) => normalizeAchievementWorkbenchRole(role, { isSelf: true }));
}

export async function fetchAchievementWorkbenchRecommendation({ roleId, camp, preferences = {} }) {
    if (!Number.isSafeInteger(roleId) || roleId <= 0) throw new Error("Invalid recommendation role ID");
    const response = await getWikiAchievementRecommendation({
        role_id: roleId, camp,
        ...(preferences.category_ids !== undefined ? { category_ids: preferences.category_ids } : {}),
        ...(preferences.dimension_weights ? { dimension_weights: preferences.dimension_weights } : {}),
        ...(preferences.dimension_ranges ? { dimension_ranges: preferences.dimension_ranges } : {}),
        ...(preferences.direction_weights ? { direction_weights: preferences.direction_weights } : {}),
    });
    const payload = response?.data;
    if (payload?.code !== 0 && payload?.code !== "0") {
        throw new Error(payload?.msg || "Recommendation request failed");
    }
    const result = payload.data;
    if (!result?.role || !Array.isArray(result.recommendations) ||
        !Array.isArray(result.camp_restricted_ids) || !Array.isArray(result.upcoming_events)) {
        throw new Error("Invalid recommendation response");
    }
    return result;
}

export async function fetchAchievementWorkbenchFriends() {
    const response = await getMyKith();
    return (response.data?.data || [])
        .map((friend) => ({
            id: String(friend?.kith_id ?? friend?.uid ?? friend?.id ?? ""),
            name: friend?.kith_info?.display_name || friend?.display_name || friend?.name || null,
            avatar: friend?.kith_info?.user_avatar || friend?.avatar || null,
        }))
        .filter((friend) => friend.id);
}

export async function fetchAchievementWorkbenchFriendRoles(friendId) {
    if (!friendId) return [];
    const response = await getMyKithRoles(friendId);
    return (response.data?.data || []).map((role) => normalizeAchievementWorkbenchRole(role, { isSelf: false }));
}

export async function fetchAchievementWorkbenchRoleState(jx3id) {
    if (!jx3id) {
        return {
            jx3id: null,
            completedIds: [],
            synced: false,
            updatedAt: null,
        };
    }

    const response = await getRoleGameAchievements(jx3id);
    const data = response.data?.data || {};
    return {
        jx3id: String(data.jx3id || jx3id),
        completedIds: normalizeCompletedAchievementIds(data.achievements),
        synced: Boolean(data.jx3id),
        updatedAt: data.updatedAt || null,
    };
}

export async function fetchAchievementWorkbenchRecords({
    ids = [],
    metadata = {},
    completedIds = [],
    attributes = CURRENT_DETAIL_ATTRIBUTES,
    client = "std",
    includeHidden = false,
} = {}) {
    const normalizedIds = normalizeCompletedAchievementIds(ids);
    if (!normalizedIds.length) return [];

    const response = await getAchievementsPost({
        ids: normalizedIds.join(","),
        attributes,
        client,
    });

    const batchRecords = response.data?.data || [];
    const returnedIds = new Set(
        (Array.isArray(batchRecords) ? batchRecords : [])
            .map((record) => String(record?.ID ?? record?.id ?? ""))
            .filter(Boolean)
    );
    const missingIds = includeHidden ? normalizedIds.filter((id) => !returnedIds.has(id)) : [];
    const missingRecords = missingIds.length ? await fetchMissingAchievementRecords(missingIds, client) : [];

    return normalizeAchievementWorkbenchRecords([...batchRecords, ...missingRecords], {
        metadata,
        completedIds,
    });
}

export async function fetchAchievementWorkbenchRecordsBatched(options = {}, batchSize = 240) {
    const ids = normalizeCompletedAchievementIds(options.ids);
    if (!ids.length) return [];
    const chunks = [];
    for (let index = 0; index < ids.length; index += batchSize) {
        chunks.push(ids.slice(index, index + batchSize));
    }
    const records = [];
    for (const chunk of chunks) {
        records.push(
            ...(await fetchAchievementWorkbenchRecords({
                ...options,
                ids: chunk,
            }))
        );
    }
    return records;
}

export async function searchAchievementWorkbenchRecords({
    keyword = "",
    mapId = "",
    client = "std",
    metadata = {},
    completedIds = [],
} = {}) {
    const response = await searchAchievements({
        keyword: String(keyword || "").trim(),
        scene: mapId || "",
        client,
        _no_page: 1,
        limit: 99999,
    });
    const records = flattenAchievementRecords(response.data?.data?.achievements || []);
    return normalizeAchievementWorkbenchRecords(records, { metadata, completedIds });
}

export async function fetchAchievementWorkbenchMaps(client = "std") {
    const response = await getMapList({
        client,
        _no_page: 1,
    });

    return (response.data?.data || [])
        .map((map) => ({
            id: String(map.ID ?? map.id ?? ""),
            name: map.MapName || map.name || null,
            regionId: String(map.Region ?? map.region ?? ""),
            regionName: map.RegionName || map.regionName || null,
        }))
        .filter((map) => map.id && map.name && map.regionName);
}

export async function fetchAchievementWorkbenchRewardItems(keys = [], client = "std") {
    const response = await getAchievementRewardItems(keys, client);
    return response?.data?.list || [];
}

export async function fetchAchievementWorkbenchDifficultyDimensions(options = {}) {
    const force = options.force === true;
    const cacheFresh =
        difficultyDimensionsCache !== null &&
        Date.now() - difficultyDimensionsCachedAt < ACHIEVEMENT_WORKBENCH_DIMENSION_CACHE_TTL;

    if (difficultyDimensionsPromise) return difficultyDimensionsPromise;
    if (!force && cacheFresh) return difficultyDimensionsCache;

    const request = getWikiAchievementDifficultyDimensions().then((response) =>
        normalizeAchievementWorkbenchDifficultyDimensions(
            getSuccessfulCmsData(response, "成就难度维度") || []
        )
    );
    difficultyDimensionsPromise = request;

    try {
        const dimensions = await request;
        difficultyDimensionsCache = dimensions;
        difficultyDimensionsCachedAt = Date.now();
        return dimensions;
    } finally {
        if (difficultyDimensionsPromise === request) difficultyDimensionsPromise = null;
    }
}

export async function fetchAchievementWorkbenchDifficultyMetrics(ids = [], options = {}) {
    const normalizedIds = normalizeAchievementApiIds(ids);
    if (!normalizedIds.length) return {};
    const client = normalizeAchievementClient(options.client);
    const batchSize = Math.min(
        normalizeBatchSize(options.batchSize, ACHIEVEMENT_WORKBENCH_PUBLIC_BATCH_SIZE),
        ACHIEVEMENT_WORKBENCH_PUBLIC_MAX_BATCH_SIZE
    );
    const requestedIds = new Set(normalizedIds.map(String));
    const result = Object.fromEntries(normalizedIds.map((id) => [String(id), null]));

    for (let index = 0; index < normalizedIds.length; index += batchSize) {
        const chunk = normalizedIds.slice(index, index + batchSize);
        const response = await getWikiAchievementDifficultyList(chunk, { client });
        const records = getSuccessfulCmsData(response, "成就难度");
        (Array.isArray(records) ? records : []).forEach((record) => {
            const normalized = normalizeAchievementWorkbenchDifficulty(record);
            if (normalized.achievementId && requestedIds.has(normalized.achievementId)) {
                result[normalized.achievementId] = normalized;
            }
        });
    }

    return result;
}

export async function fetchAchievementWorkbenchTags(ids = [], options = {}) {
    const normalizedIds = normalizeAchievementApiIds(ids);
    if (!normalizedIds.length) return {};
    const client = normalizeAchievementClient(options.client);
    const batchSize = Math.min(
        normalizeBatchSize(options.batchSize, ACHIEVEMENT_WORKBENCH_PUBLIC_BATCH_SIZE),
        ACHIEVEMENT_WORKBENCH_PUBLIC_MAX_BATCH_SIZE
    );
    const requestedIds = new Set(normalizedIds.map(String));
    const result = Object.fromEntries(
        normalizedIds.map((id) => [String(id), normalizeAchievementWorkbenchTags([])])
    );

    for (let index = 0; index < normalizedIds.length; index += batchSize) {
        const chunk = normalizedIds.slice(index, index + batchSize);
        const response = await getWikiAchievementTagsByAchievements(chunk, { client });
        const records = getSuccessfulCmsData(response, "成就标签");
        (Array.isArray(records) ? records : []).forEach((record) => {
            const achievementId = String(record?.achievement_id ?? record?.achievementId ?? "");
            if (achievementId && requestedIds.has(achievementId)) {
                result[achievementId] = normalizeAchievementWorkbenchTags(record?.tags);
            }
        });
    }

    return result;
}

export async function fetchAchievementWorkbenchTag(tagId, options = {}) {
    const id = typeof tagId === "number" || typeof tagId === "string" ? Number(tagId) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0) return null;
    const client = normalizeAchievementClient(options.client);
    const response = await getWikiAchievementTag(id, { client });
    const data = getSuccessfulCmsPayload(response, "成就标签");
    if (data === null) return null;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("成就标签响应格式异常");
    }
    return normalizeAchievementWorkbenchTags([data]).tags[0] || null;
}

// 方案详情与手动添加保留旧标量难度兼容读取，新推荐不经过这里，避免重新筛选服务端结果。
export async function fetchAchievementWorkbenchDifficulty(ids = [], batchSize = 500, options = {}) {
    const normalizedIds = normalizeCompletedAchievementIds(ids);
    if (!normalizedIds.length) return {};
    const normalizedBatchSize = normalizeBatchSize(batchSize);
    const client = normalizeAchievementClient(options.client);
    const chunks = [];
    for (let index = 0; index < normalizedIds.length; index += normalizedBatchSize) {
        chunks.push(normalizedIds.slice(index, index + normalizedBatchSize));
    }

    const result = {};
    for (const chunk of chunks) {
        const response = await getWikiAchievementLeapSchemaProgress(chunk, { client });
        (response.data?.data || []).forEach((item) => {
            const id = String(item?.achievement_id ?? item?.id ?? "");
            if (!id) return;
            const value = item?.difficulty;
            const rawDifficulty = value === null || value === undefined || value === "" ? null : Number(value);
            result[id] = rawDifficulty !== null && Number.isFinite(rawDifficulty) ? rawDifficulty / 10 : null;
        });
    }
    return result;
}

export async function fetchAchievementWorkbenchLeapPlans(params = {}) {
    const response = await getWikiAchievementLeapSchemaList(params);
    const data = response.data?.data;
    const list = Array.isArray(data) ? data : data?.list || [];
    return {
        list: list.map(normalizeAchievementLeapPlan),
        total: Number(data?.total ?? list.length) || 0,
    };
}

export async function fetchAchievementWorkbenchLeapPlan(id) {
    const response = await getWikiAchievementLeapSchema(id);
    return normalizeAchievementLeapPlan(response.data?.data || {});
}

export async function saveAchievementWorkbenchLeapPlan(payload, id = null) {
    const response = id
        ? await updateWikiAchievementLeapSchema(id, payload)
        : await createdWikiAchievementLeapSchema(payload);
    return normalizeAchievementLeapPlan({ ...payload, id, ...(response.data?.data || {}) });
}

export function deleteAchievementWorkbenchLeapPlan(id) {
    return deleteWikiAchievementLeapSchema(id);
}
