import {
    fetchAchievementWorkbenchRoles,
    fetchAchievementWorkbenchRoleState,
    fetchAchievementWorkbenchCatalog,
    fetchAchievementWorkbenchRecordsBatched,
} from "@/service/achievementWorkbench";
import { getAdventures, getSerendipityAchievementId } from "./adventure";

// v2 starts empty; previous local storage remains untouched.
const STORAGE_KEY = "pvx.adventure-research.v2";
const clone = (value) => JSON.parse(JSON.stringify(value));

// Replace these three operations with the documented API when the backend is ready.
export async function listResearchRecords() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const local = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(local) || local.some((r) => !r?.role?.jx3id || !Array.isArray(r?.snapshot?.completedIds))) {
        throw new Error("本机记录格式异常，请备份后清理浏览器存储。");
    }
    return local;
}
export async function saveResearchRecord(record) {
    const records = await listResearchRecords();
    if (
        records.some(
            (r) =>
                r.client === record.client &&
                r.adventure.id === record.adventure.id &&
                r.role.jx3id === record.role.jx3id
        )
    ) {
        throw new Error("该角色已提交此奇遇，请先撤回原记录。");
    }
    const saved = clone({
        ...record,
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...records, saved]));
    return saved;
}
export async function removeResearchRecord(id) {
    const records = (await listResearchRecords()).filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
export const getResearchRoles = fetchAchievementWorkbenchRoles;
export async function getResearchAdventures() {
    const groups = await Promise.all(
        ["perfect", "normal"].map(async (type) => {
            const all = [];
            for (let page = 1; page <= 100; page++) {
                const response = await getAdventures({ client: "std", type, page, per: 100 });
                if (!Array.isArray(response.data?.list)) throw new Error("奇遇列表响应异常");
                all.push(...response.data.list);
                if (page >= (response.data.pages || 1)) break;
            }
            return all.map((r) => ({ id: String(r.dwID), name: r.szName, type })).filter((r) => r.name);
        })
    );
    return groups.flat();
}

export async function loadResearchSnapshot(role) {
    const [state, catalog] = await Promise.all([
        fetchAchievementWorkbenchRoleState(role.jx3id),
        fetchAchievementWorkbenchCatalog("std"),
    ]);
    if (!state.synced) {
        const error = new Error("该角色尚未同步成就，请先在游戏内同步。");
        error.code = "ROLE_NOT_SYNCED";
        throw error;
    }
    const values = state.completedIds.map((id) => catalog.metadata[id]?.point);
    const points = values.every((value) => Number.isFinite(value))
        ? values.reduce((sum, value) => sum + value, 0)
        : null;
    return { ...state, points };
}
export async function getResearchAchievementDetails(ids) {
    const catalog = await fetchAchievementWorkbenchCatalog("std");
    const records = await fetchAchievementWorkbenchRecordsBatched({
        ids,
        client: "std",
        includeHidden: true,
        metadata: catalog.metadata,
    });
    return records.map((record) => ({
        ...record,
        category: {
            ...record.category,
            name: record.category?.name || catalog.menus[record.category?.id]?.name || null,
        },
    }));
}
export async function getResearchTargetAchievements(id) {
    const response = await getSerendipityAchievementId(id, { params: { client: "std" } });
    return response.data;
}
