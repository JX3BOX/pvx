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
    getWikiAchievementLeapSchema,
    getWikiAchievementLeapSchemaList,
    getWikiAchievementLeapSchemaProgress,
    updateWikiAchievementLeapSchema,
} from "@/service/wiki";
import { normalizeAchievementWorkbenchRecords, normalizeAchievementWorkbenchRole } from "@/utils/achievementWorkbench";
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
    "ItemType",
    "ItemID",
].join(",");

function normalizeCompletedAchievementIds(value) {
    const source = Array.isArray(value) ? value : String(value || "").split(",");
    return [...new Set(source.map((id) => String(id).trim()).filter(Boolean))];
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

export async function fetchAchievementWorkbenchDifficulty(ids = [], batchSize = 500) {
    const normalizedIds = normalizeCompletedAchievementIds(ids);
    if (!normalizedIds.length) return {};
    const chunks = [];
    for (let index = 0; index < normalizedIds.length; index += batchSize) {
        chunks.push(normalizedIds.slice(index, index + batchSize));
    }

    const result = {};
    for (const chunk of chunks) {
        const response = await getWikiAchievementLeapSchemaProgress(chunk);
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
