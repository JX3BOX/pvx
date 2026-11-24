// 外观大全接口封装：目录与图谱读取自 Node，模型/收藏/仓库/晒图读取自 CMS，默认体型读取自用户绑定角色，捏脸/体型库读取自 NEXT。
import { $cms, $next, $node } from "@jx3box/jx3box-common/js/api";
import User from "@jx3box/jx3box-common/js/user";
import { getUserRoles } from "@/service/team";
import { normalizeBodyType, resolveExteriorAssetUrl } from "@/components/exterior/meta";

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

export function getExteriorCount(params, signal) {
    return getCatalog("count", params, signal);
}

export function getExteriorsList(params, signal) {
    return getCatalog("list", params, signal);
}

export function getExteriorsDetail(id, signal) {
    return getCatalog(encodeURIComponent(id), undefined, signal);
}

const MAX_GRAPH_CACHE = 128;
const graphCache = new Map();
const graphInflight = new Map();

export function getExteriorGraph(id, signal) {
    return getCatalog(`${encodeURIComponent(id)}/graph`, undefined, signal);
}

export async function getExteriorGraphCached(id, signal) {
    const key = String(id || "").trim();
    if (!key) return null;
    const cached = graphCache.get(key);
    if (cached) {
        graphCache.delete(key);
        graphCache.set(key, cached);
        return cached;
    }

    let pending = graphInflight.get(key);
    if (!pending) {
        pending = getExteriorGraph(key)
            .then((graph) => {
                if (graph) {
                    if (graphCache.size >= MAX_GRAPH_CACHE) {
                        const oldest = graphCache.keys().next().value;
                        if (oldest) graphCache.delete(oldest);
                    }
                    graphCache.set(key, graph);
                }
                return graph || null;
            })
            .finally(() => {
                graphInflight.delete(key);
            });
        graphInflight.set(key, pending);
    }

    return raceSignal(pending, signal);
}

function escapeHtml(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// 玩家返图通过 CMS post_type="show" + meta_1 关联外观 key；支持传入逗号分隔的规范化 key 集合聚合礼盒与成衣返图。
function normalizeMetaKeys(exteriorKeys) {
    const rawList = Array.isArray(exteriorKeys) ? exteriorKeys : [exteriorKeys];
    return [...new Set(rawList.map((item) => String(item || "").trim()).filter(Boolean))].join(",");
}

export async function getExteriorShowcase(exteriorKeys, { page = 1, per = 12 } = {}, signal) {
    const meta1 = normalizeMetaKeys(exteriorKeys);
    if (!meta1) {
        return { list: [], total: 0, page, per, pages: 1 };
    }
    const { data } = await $cms({ mute: true }).get("/api/cms/posts", {
        params: { type: "show", meta_1: meta1, page, per },
        signal,
    });
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    const payload = data.data || {};
    const list = Array.isArray(payload.list) ? payload.list : [];
    const total = Number(payload.total ?? list.length) || 0;
    return {
        list,
        total,
        page: Number(payload.page || page) || 1,
        per: Number(payload.per || per) || per,
        pages: Number(payload.pages || Math.max(1, Math.ceil(total / per))) || 1,
    };
}

// 拉取当前登录用户在当前外观下的返图（包含审核中 visible="1" 的仅自己可见条目）。
export async function getMyExteriorShowcase(exteriorKeys, { per = 20 } = {}, signal) {
    if (!User.isLogin()) return [];
    const meta1 = normalizeMetaKeys(exteriorKeys);
    if (!meta1) return [];
    try {
        const { data } = await $cms({ mute: true }).get("/api/cms/posts/my", {
            params: { type: "show", meta_1: meta1, page: 1, per },
            signal,
        });
        if (data.code) return [];
        const list = Array.isArray(data.data?.list) ? data.data.list : [];
        return list.filter((post) => post && post.post_status !== "dustbin");
    } catch {
        return [];
    }
}

export async function getExteriorShowcasePost(id, signal) {
    const { data } = await $cms({ mute: true }).get(`/api/cms/post/${encodeURIComponent(id)}`, { signal });
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data || null;
}

export async function uploadShowcaseImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await $cms({ mute: true }).post("/api/cms/upload", formData);
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    const list = Array.isArray(data.data) ? data.data : [data.data?.url || data.data].filter(Boolean);
    const url = list[0];
    if (!url) throw new Error("图片上传失败，未返回有效地址");
    return url;
}

function buildShowcasePayload({
    exteriorKey,
    exteriorName = "",
    title = "",
    content = "",
    pics = [],
    bodyType = "",
    roleType = null,
    client = "std",
}) {
    const cleanPics = pics.map((item) => String(item || "").trim()).filter(Boolean);
    if (!cleanPics.length) throw new Error("请至少上传一张外观截图");
    const cleanTitle = String(title || "").trim() || `${exteriorName || "外观"} · 玩家返图`;
    const cleanExcerpt = String(content || "").trim();
    const htmlBlocks = [];
    if (cleanExcerpt) {
        for (const line of cleanExcerpt.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (trimmed) htmlBlocks.push(`<p>${escapeHtml(trimmed)}</p>`);
        }
    }
    for (const pic of cleanPics) {
        htmlBlocks.push(`<p><img src="${escapeHtml(pic)}" alt="${escapeHtml(cleanTitle)}" /></p>`);
    }
    return {
        post_type: "show",
        meta_1: exteriorKey,
        post_title: cleanTitle,
        post_excerpt: cleanExcerpt.slice(0, 500),
        post_content: htmlBlocks.join("\n"),
        post_banner: cleanPics[0],
        post_subtype: bodyType || "",
        post_mode: "tinymce",
        post_status: "publish",
        // 默认设为仅自己可见（审核中），待运营在 OS 晒图管理审核通过后公开展示。
        visible: "1",
        comment: 0,
        original: 1,
        client,
        lang: "cn",
        post_meta: {
            pics: cleanPics,
            exterior_key: exteriorKey,
            exterior_name: exteriorName,
            role_type: roleType || null,
        },
    };
}

export async function createExteriorShowcase(options) {
    const payload = buildShowcasePayload(options);
    const { data } = await $cms({ mute: true }).post("/api/cms/post", payload);
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data;
}

export async function updateExteriorShowcase(id, options) {
    const payload = buildShowcasePayload(options);
    const { data } = await $cms({ mute: true }).put(`/api/cms/post/${encodeURIComponent(id)}`, payload);
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data;
}

export async function deleteExteriorShowcase(id) {
    const { data } = await $cms({ mute: true }).delete(`/api/cms/post/${encodeURIComponent(id)}`);
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data;
}

const MAX_MODEL_CACHE = 64;
const modelCache = new Map();
const modelInflight = new Map();
const warmedCatalogUrls = new Set();

function raceSignal(promise, signal) {
    if (!signal) return promise;
    if (signal.aborted) {
        return Promise.reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
    }
    return new Promise((resolve, reject) => {
        const onAbort = () => reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
        signal.addEventListener("abort", onAbort, { once: true });
        promise.then(
            (value) => {
                signal.removeEventListener("abort", onAbort);
                resolve(value);
            },
            (error) => {
                signal.removeEventListener("abort", onAbort);
                reject(error);
            }
        );
    });
}

export function warmExteriorCatalogUrl(url) {
    if (!url || typeof fetch !== "function" || warmedCatalogUrls.has(url)) return;
    if (warmedCatalogUrls.size >= 128) warmedCatalogUrls.clear();
    warmedCatalogUrls.add(url);
    fetch(url, { mode: "cors", credentials: "omit" })
        .then((res) => (res.ok ? res.arrayBuffer() : null))
        .catch(() => {
            warmedCatalogUrls.delete(url);
        });
}

// 原子模型查询接口（单表读取，带进程内短期缓存与并发去重，支持详情页后台静默预热）。
export async function getExteriorModel(key, role, signal) {
    const validRole = [1, 2, 5, 6].includes(Number(role)) ? Number(role) : null;
    const cacheKey = `${key}:${validRole || "solo"}`;
    const cached = modelCache.get(cacheKey);
    if (cached) {
        modelCache.delete(cacheKey);
        modelCache.set(cacheKey, cached);
        return cached;
    }

    let pending = modelInflight.get(cacheKey);
    if (!pending) {
        const roleSuffix = validRole ? `/${validRole}` : "";
        pending = $cms({ mute: true })
            .get(`/api/cms/pvx/exterior/${encodeURIComponent(key)}/model${roleSuffix}`)
            .then(({ data }) => {
                if (data.code) throw Object.assign(new Error(data.msg), { code: data.code, retryAfter: data.data?.retry_after || 0 });
                const payload = data.data || {};
                const normalized = {
                    modelUrl: resolveExteriorAssetUrl(payload.modelUrl),
                    baseUrl: payload.baseUrl ? resolveExteriorAssetUrl(payload.baseUrl) : undefined,
                    isolated: Boolean(payload.isolated),
                };
                if (modelCache.size >= MAX_MODEL_CACHE) {
                    const oldest = modelCache.keys().next().value;
                    if (oldest) modelCache.delete(oldest);
                }
                modelCache.set(cacheKey, normalized);
                return normalized;
            })
            .catch((err) => {
                const body = err?.response?.data;
                if (body && (body.code || body.msg)) {
                    throw Object.assign(new Error(body.msg || err.message), {
                        code: body.code || err?.response?.status || err.code,
                        retryAfter: body.data?.retry_after || 0,
                        status: err?.response?.status,
                    });
                }
                throw err;
            })
            .finally(() => {
                modelInflight.delete(cacheKey);
            });
        modelInflight.set(cacheKey, pending);
    }

    return raceSignal(pending, signal);
}

export function prefetchExteriorModel(key, role) {
    if (!key || !User.isLogin() || cachedVerifyResult?.verified === false) return Promise.resolve(null);
    return getExteriorModel(key, role)
        .then((resolved) => {
            if (resolved?.modelUrl) warmExteriorCatalogUrl(resolved.modelUrl);
            if (resolved?.baseUrl) warmExteriorCatalogUrl(resolved.baseUrl);
            return resolved;
        })
        .catch(() => null);
}

let cachedDefaultRolePromise = null;

// 读取登录用户的默认游戏角色体型，用于列表封面与 3D 试穿的默认体型。
export function getDefaultUserBodyType() {
    if (!User.isLogin()) return Promise.resolve(null);
    if (cachedDefaultRolePromise) return cachedDefaultRolePromise;
    cachedDefaultRolePromise = getUserRoles()
        .then((res) => {
            const list = res?.data?.data?.list || [];
            if (!list.length) return null;
            const preferred =
                list.find((item) => item?.is_default === 1 || item?.is_default === true) ||
                list.find((item) => Number(item?.priority) > 0) ||
                list[0];
            const role = normalizeBodyType(preferred?.body_type ?? preferred?.bodyType ?? preferred?.body);
            if (!role) return null;
            return {
                role,
                name: preferred?.name || "",
                server: preferred?.server || "",
                mount: preferred?.mount || "",
            };
        })
        .catch(() => null);
    return cachedDefaultRolePromise;
}

const exteriorFavoritesPath = "/api/cms/pvx/exterior/favorites";
const exteriorWarehousePath = "/api/cms/pvx/exterior/warehouse";
const FACE_ASSETS_CDN_BASE = "https://cdn.jx3box.com/exterior/face-assets/v1";
export const WEAPON_STANCES_CDN_BASE = "https://cdn.jx3box.com/exterior/weapon-stances/v1";
export const FACE_EXPRESSIONS_CDN_BASE = "https://cdn.jx3box.com/exterior/face-expressions/v1";
export const PET_BEHAVIORS_CDN_BASE = "https://cdn.jx3box.com/exterior/pet-behaviors/v1";
export const UC_AUTH_URL = "/dashboard/auth";

let cachedVerifyResult = null;
let verifyStatusPromise = null;

export async function getUserVerifyStatus(force = false) {
    if (!User.isLogin()) {
        cachedVerifyResult = { loggedIn: false, verified: false, privileged: false, info: null };
        return cachedVerifyResult;
    }
    if (!force && cachedVerifyResult) return cachedVerifyResult;
    if (!force && verifyStatusPromise) return verifyStatusPromise;

    verifyStatusPromise = $cms({ mute: true })
        .get("/api/cms/user/my/info")
        .then(({ data }) => {
            if (data?.code) {
                throw Object.assign(new Error(data.msg || "用户信息获取失败"), { code: data.code });
            }
            const info = data?.data || {};
            const userGroup = Number(info.user_group || 0);
            const verified =
                !Number(info.deleted) &&
                !Number(info.user_status) &&
                (userGroup >= 16 || Boolean(info.wechat_mp_openid));
            cachedVerifyResult = {
                loggedIn: true,
                verified,
                privileged: userGroup >= 64,
                userGroup,
                wechatBound: Boolean(info.wechat_mp_openid),
                info,
            };
            return cachedVerifyResult;
        })
        .catch((err) => {
            verifyStatusPromise = null;
            if (err?.response?.status === 401) {
                cachedVerifyResult = { loggedIn: false, verified: false, privileged: false, info: null };
                return cachedVerifyResult;
            }
            // 网络短暂抖动不误锁，交由后端最终鉴权拦截
            return { loggedIn: true, verified: true, privileged: false, fallback: true, info: null };
        })
        .finally(() => {
            verifyStatusPromise = null;
        });

    return verifyStatusPromise;
}

let cachedFaceExpressionsManifestPromise = null;

export function getFaceExpressionsManifest() {
    if (!cachedFaceExpressionsManifestPromise) {
        cachedFaceExpressionsManifestPromise = fetch(`${FACE_EXPRESSIONS_CDN_BASE}/manifest.json`, {
            mode: "cors",
            credentials: "omit",
        })
            .then((res) => {
                if (!res.ok) throw new Error(`面部表情清单加载失败: HTTP ${res.status}`);
                return res.json();
            })
            .catch((err) => {
                cachedFaceExpressionsManifestPromise = null;
                throw err;
            });
    }
    return cachedFaceExpressionsManifestPromise;
}

export function getFaceExpressionUrl(role, key) {
    const validRole = [1, 2, 5, 6].includes(Number(role)) ? Number(role) : 2;
    const clean = String(key || "").trim();
    if (!clean) return null;
    return `${FACE_EXPRESSIONS_CDN_BASE}/role-${validRole}/${encodeURIComponent(clean)}.json`;
}

let cachedPetBehaviorsManifestPromise = null;

export function getPetBehaviorsManifest() {
    if (!cachedPetBehaviorsManifestPromise) {
        cachedPetBehaviorsManifestPromise = fetch(`${PET_BEHAVIORS_CDN_BASE}/manifest.json`, {
            mode: "cors",
            credentials: "omit",
        })
            .then((res) => {
                if (!res.ok) throw new Error(`挂宠行为清单加载失败: HTTP ${res.status}`);
                return res.json();
            })
            .catch((err) => {
                cachedPetBehaviorsManifestPromise = null;
                throw err;
            });
    }
    return cachedPetBehaviorsManifestPromise;
}

export function resolvePetBehaviorClipUrl(clipRelPath) {
    if (!clipRelPath) return null;
    if (/^https?:\/\//i.test(clipRelPath)) return clipRelPath;
    return `${PET_BEHAVIORS_CDN_BASE}/${String(clipRelPath).replace(/^\/+/, "")}`;
}

let cachedWeaponStancesManifestPromise = null;

export function getWeaponStancesManifest() {
    if (!cachedWeaponStancesManifestPromise) {
        cachedWeaponStancesManifestPromise = fetch(`${WEAPON_STANCES_CDN_BASE}/manifest.json`, {
            mode: "cors",
            credentials: "omit",
        })
            .then((res) => {
                if (!res.ok) throw new Error(`武器姿态清单加载失败: HTTP ${res.status}`);
                return res.json();
            })
            .catch((err) => {
                cachedWeaponStancesManifestPromise = null;
                throw err;
            });
    }
    return cachedWeaponStancesManifestPromise;
}

export function getWeaponStanceClipUrl(role, aniId) {
    const validRole = [1, 2, 5, 6].includes(Number(role)) ? Number(role) : 2;
    const id = Number(aniId);
    if (!Number.isInteger(id) || id <= 0) return null;
    return `${WEAPON_STANCES_CDN_BASE}/clips/role-${validRole}/${id}.json`;
}

async function cmsRequest(method, url, payload, params) {
    const { data } = await $cms({ mute: true }).request({
        method,
        url,
        data: payload,
        params,
    });
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data;
}

export async function getExteriorStars(params = {}) {
    const list = await cmsRequest("get", exteriorFavoritesPath, undefined, params);
    return Array.isArray(list) ? list : [];
}

export async function getExteriorStarRanking({ limit = 20, domain = "" } = {}) {
    const params = { limit };
    if (domain) params.domain = domain;
    const list = await cmsRequest("get", `${exteriorFavoritesPath}/top`, undefined, params);
    return Array.isArray(list) ? list : [];
}

export function getExteriorFavoriteCount(key) {
    return cmsRequest("get", `${exteriorFavoritesPath}/count/${encodeURIComponent(key)}`);
}

export async function isExteriorStarred(key) {
    const res = await getExteriorFavoriteCount(key);
    return Boolean(res?.starred);
}

export function addExteriorStar(key, payload = {}) {
    return cmsRequest("post", `${exteriorFavoritesPath}/${encodeURIComponent(key)}`, payload);
}

export function updateExteriorStar(key, payload) {
    return cmsRequest("put", `${exteriorFavoritesPath}/${encodeURIComponent(key)}`, payload);
}

export function removeExteriorStar(key) {
    return cmsRequest("delete", `${exteriorFavoritesPath}/${encodeURIComponent(key)}`);
}

export function getWarehouseSummary() {
    return cmsRequest("get", `${exteriorWarehousePath}/summary`);
}

export async function getWarehouseItems(params = {}) {
    const list = await cmsRequest("get", `${exteriorWarehousePath}/items`, undefined, params);
    return Array.isArray(list) ? list : [];
}

export function createWarehouseItem(payload) {
    return cmsRequest("post", `${exteriorWarehousePath}/items`, payload);
}

export function updateWarehouseItem(id, payload) {
    return cmsRequest("put", `${exteriorWarehousePath}/items/${encodeURIComponent(id)}`, payload);
}

export function deleteWarehouseItem(id) {
    return cmsRequest("delete", `${exteriorWarehousePath}/items/${encodeURIComponent(id)}`);
}

export function sellWarehouseItem(id, payload) {
    return cmsRequest("post", `${exteriorWarehousePath}/items/${encodeURIComponent(id)}/sell`, payload);
}

export function getWarehouseSales(params = {}) {
    return cmsRequest("get", `${exteriorWarehousePath}/sales`, undefined, params);
}

export function undoWarehouseSale(id) {
    return cmsRequest("delete", `${exteriorWarehousePath}/sales/${encodeURIComponent(id)}`);
}

export async function getWarehouseGroups() {
    const list = await cmsRequest("get", `${exteriorWarehousePath}/groups`);
    return Array.isArray(list) ? list : [];
}

export function createWarehouseGroup(payload) {
    const body = typeof payload === "string" ? { name: payload } : payload;
    return cmsRequest("post", `${exteriorWarehousePath}/groups`, body);
}

export function updateWarehouseGroup(id, payload) {
    return cmsRequest("put", `${exteriorWarehousePath}/groups/${encodeURIComponent(id)}`, payload);
}

export function deleteWarehouseGroup(id) {
    return cmsRequest("delete", `${exteriorWarehousePath}/groups/${encodeURIComponent(id)}`);
}

export function getCharacterBaseModel(role, signal) {
    return getExteriorModel("character_base", role, signal);
}

export function getMetaBaseModelUrl(role) {
    const validRole = [1, 2, 5, 6].includes(Number(role)) ? Number(role) : 2;
    return `${FACE_ASSETS_CDN_BASE}/meta-base-${validRole}/model.gltf`;
}

export function getFaceDecalManifestUrl(role) {
    const validRole = [1, 2, 5, 6].includes(Number(role)) ? Number(role) : 2;
    return `${FACE_ASSETS_CDN_BASE}/role-${validRole}.json`;
}

export async function searchMallFaces(params = {}, signal) {
    const { data } = await $next({ mute: true }).get("/api/face", { params, signal });
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data || { list: [], page: {} };
}

export async function searchMallBodies(params = {}, signal) {
    const { data } = await $next({ mute: true }).get("/api/pvxbody", { params, signal });
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    return data.data || { list: [], page: {} };
}

export async function fetchMallAttachment(type, postId, signal) {
    const { data } = await $next({ mute: true }).get(`/api/charge_attachment/${type}/${postId}`, { signal });
    if (data.code) throw Object.assign(new Error(data.msg), { code: data.code });
    const list = data.data?.list || [];
    const item = list[0];
    if (!item) throw new Error("未找到可用的数据附件");
    if (item.data) {
        return {
            record: item,
            data: typeof item.data === "string" ? JSON.parse(item.data) : item.data,
        };
    }
    const fileUrl = item.url || item.file;
    if (fileUrl) {
        const res = await fetch(resolveExteriorAssetUrl(fileUrl), { signal });
        if (!res.ok) throw new Error(`下载附件失败: HTTP ${res.status}`);
        return {
            record: item,
            bytes: new Uint8Array(await res.arrayBuffer()),
        };
    }
    throw new Error("该作品未包含可直接应用的数据文件");
}
