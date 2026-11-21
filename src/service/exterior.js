import { $cms, $node } from "@jx3box/jx3box-common/js/api";

export const exteriorBodyTypes = { 1: "man", 2: "woman", 5: "boy", 6: "girl" };

const catalogPath = "/api/node/v2/exterior";

async function getCatalog(path, params, signal) {
    const { data } = await $node({ mute: true }).get(`${catalogPath}/${path}`, { params, signal });
    // Node 的业务错误也可能以 HTTP 200 返回。
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data;
}

export function getExteriorCategories() {
    return getCatalog("categories");
}

export function getExteriorsList(params) {
    return getCatalog("list", params);
}

export function getExteriorsDetail(id, signal) {
    return getCatalog(encodeURIComponent(id), undefined, signal);
}

export async function getExteriorShowcase(exteriorId) {
    const { data } = await $cms({ mute: true }).get("/api/cms/posts", {
        params: { type: "show", meta_1: exteriorId },
    });
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data.list;
}

export async function getExteriorModel(key, role) {
    const { data } = await $cms({ mute: true }).get(`/api/cms/pvx/exterior/${encodeURIComponent(key)}/model/${role}`);
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data;
}

const exteriorUserPath = "/api/cms/pvx/exterior/user";

async function exteriorUserRequest(method, path, payload) {
    const { data } = await $cms({ mute: true }).request({
        method,
        url: `${exteriorUserPath}/${path}`,
        data: payload,
        params: method === "get" ? { _no_cache: 1 } : undefined,
    });
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data;
}

async function getExteriorUserList(path) {
    const list = await exteriorUserRequest("get", path);
    if (!Array.isArray(list)) throw new Error("Unexpected exterior user list response");
    return list;
}

export function getExteriorStars() {
    return getExteriorUserList("star");
}

// 旧发型编号与新版编号并不相同，只有核实过的外观才建立对应关系。
const legacyExteriorRankKeys = new Map([["3_521", "hair_557"]]);

async function resolveRankedExterior({ exterior_id, exterior }) {
    if (exterior) return exterior;
    // 旧礼盒与新版 bundle 都用同一个游戏物品编号。
    const bundleId = /^1_(\d+)$/.exec(exterior_id)?.[1];
    const key = bundleId ? `bundle_${bundleId}` : legacyExteriorRankKeys.get(exterior_id);
    if (!key) return null;

    try {
        return await getExteriorsDetail(key);
    } catch (error) {
        if (error.code === 1000) return null;
        throw error;
    }
}

export async function getExteriorStarRanking() {
    // 榜单默认返回 10 条。已有外观资料的条目直接复用接口结果。
    const entries = await getExteriorUserList("star-top");
    const resolved = await Promise.all(
        entries.map(async (entry) => ({ ...entry, exterior: await resolveRankedExterior(entry) }))
    );
    return resolved.filter(({ exterior }) => exterior);
}

export async function isExteriorStarred(key) {
    const entries = await getExteriorStars();
    return entries.some(({ exterior_id }) => exterior_id === key);
}

export function addExteriorStar(key) {
    return exteriorUserRequest("post", `star/${encodeURIComponent(key)}`, {});
}

export function removeExteriorStar(key) {
    return exteriorUserRequest("delete", `star/${encodeURIComponent(key)}`);
}

export function getWarehouseEntries() {
    return getExteriorUserList("store");
}

export function getWarehouseGroups() {
    return getExteriorUserList("group");
}

export function createWarehouseGroup(name) {
    return exteriorUserRequest("post", "group", { name });
}

export function addWarehouseEntry(payload) {
    return exteriorUserRequest("post", "store", payload);
}

export function updateWarehouseEntry(id, payload) {
    return exteriorUserRequest("put", `store/${id}`, { ...payload, store_id: id });
}

export function checkOutWarehouseEntry(id, payload) {
    return exteriorUserRequest("put", `store/${id}/out`, payload);
}

export function deleteWarehouseEntry(id) {
    return exteriorUserRequest("delete", `store/${id}`);
}
