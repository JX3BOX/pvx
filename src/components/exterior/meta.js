// 外观大全前台展示配置：分类白名单、体型映射、玩家友好标签与图片资源地址解析。
import { __cdn } from "@jx3box/jx3box-common/data/jx3box.json";
import { extractTextContent } from "@jx3box/jx3box-common/js/utils";

const CDN_BASE = (__cdn || "https://cdn.jx3box.com/").replace(/\/+$/, "");

// 列表顶栏仅展示真实外观分类，过滤写意脸型、写实脸型、体型、散件和系列。
export const VISIBLE_LIST_DOMAINS = ["outfit", "bundle", "hair", "pendant", "weapon", "effect", "posture"];
export const HIDDEN_LIST_DOMAINS = new Set(["face", "realistic_face", "body", "part", "family"]);

export const BODY_TYPES = [
    { id: 1, key: "man", label: "成男" },
    { id: 2, key: "woman", label: "成女" },
    { id: 5, key: "boy", label: "正太" },
    { id: 6, key: "girl", label: "萝莉" },
];

export const BODY_LABEL_MAP = {
    1: "成男",
    2: "成女",
    5: "正太",
    6: "萝莉",
};

export const DOMAIN_META = {
    family: { label: "系列", color: "#7c3aed", bg: "#f3e8ff", tier: 0 },
    bundle: { label: "礼盒", color: "#ea580c", bg: "#ffedd5", tier: 1 },
    outfit: { label: "成衣", color: "#4f46e5", bg: "#eef2ff", tier: 2 },
    hair: { label: "发型", color: "#db2777", bg: "#fce7f3", tier: 3 },
    pendant: { label: "挂件", color: "#0d9488", bg: "#ccfbf1", tier: 3 },
    weapon: { label: "武器", color: "#d97706", bg: "#fef3c7", tier: 3 },
    effect: { label: "特效", color: "#2563eb", bg: "#dbeafe", tier: 3 },
    posture: { label: "站姿", color: "#059669", bg: "#d1fae5", tier: 3 },
    part: { label: "散件", color: "#64748b", bg: "#f1f5f9", tier: 4 },
};

export const SLOT_LABELS = {
    hair: "头发",
    weapon: "武器",
    chest: "上衣",
    pants: "下装",
    hat: "帽子",
    bangle: "护腕",
    boots: "鞋子",
    waist: "腰带",
    Back: "背部挂件",
    BackCloak: "披风",
    Bag: "佩囊",
    Face: "面部挂件",
    Glasses: "眼饰",
    Head: "头饰",
    Waist: "腰部挂件",
    PendantPet: "挂宠",
    LHand: "左手饰",
    RHand: "右手饰",
    LShoulder: "左肩饰",
    RShoulder: "右肩饰",
    CircleBody: "环身特效",
    Footprint: "足迹特效",
    KillEffect: "击杀特效",
    KillFeed: "击杀播报",
};

export const CURRENCY_LABELS = {
    coin: "通宝",
    rewards: "积分",
};

// 面向玩家展示的高价值标签；过滤 has_item_source / missing_variant_definition 等工程内部标记。
export const PLAYER_TAG_META = {
    out_of_print: { label: "已绝版", tone: "rose" },
    limited: { label: "限定", tone: "amber" },
    tradable_item: { label: "可交易", tone: "emerald" },
    shop: { label: "商城", tone: "indigo" },
    collectible: { label: "可收集", tone: "sky" },
    owned_only: { label: "专属展示", tone: "slate" },
    weapon_enchantment: { label: "武器特效", tone: "violet" },
};

export const RELATION_LABELS = {
    package_link: "礼盒关联",
    variant: "系列款式",
    wrapped_outfit: "包身 / 内衬",
    match_hair: "配套发型",
    contains: "套装散件",
};

export const EDGE_COLORS = {
    package_link: "#ea580c",
    variant: "#7c3aed",
    wrapped_outfit: "#4f46e5",
    match_hair: "#db2777",
    contains: "#94a3b8",
};

export const MODEL_CAPABLE_DOMAINS = new Set([
    "outfit",
    "bundle",
    "part",
    "hair",
    "pendant",
    "weapon",
    "effect",
    "posture",
]);
export const CHARACTER_BOUND_DOMAINS = new Set(["outfit", "bundle", "part", "hair"]);
// 无配套发型时 3D 试穿默认搭配狐金，避免角色以光头展示。
export const DEFAULT_HAIR_KEY = "hair_557";

// 根据当前外观与图谱关系，在前端拆解原子 3D 请求目标（主外观 + 配套/默认发型），保持后端 /model 接口纯粹轻量。
export function resolveExteriorModelPlan(item, graphNodes = [], graphEdges = []) {
    const key = item?.key || "";
    const domain = item?.domain || String(key).split("_")[0] || "";
    if (!key) return { targetKey: "", targetDomain: domain, hairKey: null };

    const nodeMap = new Map();
    for (const node of graphNodes || []) {
        if (node?.key) nodeMap.set(node.key, node);
    }
    const domainOf = (k) => nodeMap.get(k)?.domain || String(k || "").split("_")[0];
    const nameOf = (k) => String(nodeMap.get(k)?.name || nodeMap.get(k)?.game_name || "");

    const edges = [];
    const seenEdges = new Set();
    for (const edge of [...(graphEdges || []), ...(item?.relations || [])]) {
        if (!edge?.from_key || !edge?.to_key) continue;
        const sig = `${edge.from_key}|${edge.to_key}|${edge.kind || ""}`;
        if (seenEdges.has(sig)) continue;
        seenEdges.add(sig);
        edges.push(edge);
    }

    const neighborsOf = (nodeKey, allowedKinds = null) => {
        const result = [];
        for (const edge of edges) {
            if (allowedKinds && !allowedKinds.has(edge.kind)) continue;
            if (edge.from_key === nodeKey && edge.to_key !== nodeKey) result.push({ key: edge.to_key, kind: edge.kind });
            else if (edge.to_key === nodeKey && edge.from_key !== nodeKey)
                result.push({ key: edge.from_key, kind: edge.kind });
        }
        return result;
    };

    const pickPreferredHair = (candidates) => {
        if (!candidates.length) return null;
        const score = (entry) => {
            let s = entry.kind === "match_hair" ? 100 : 50;
            const name = nameOf(entry.key);
            if (name.includes("黑发")) s += 30;
            else if (name.includes("白发")) s += 10;
            else if (name.includes("金发")) s += 5;
            return s;
        };
        return [...candidates].sort((a, b) => score(b) - score(a) || a.key.localeCompare(b.key))[0].key;
    };

    const findCompanionHair = (rootKeys) => {
        const hairCandidates = [];
        const seenHair = new Set();
        const pushHair = (entry) => {
            if (domainOf(entry.key) !== "hair" || seenHair.has(entry.key)) return;
            seenHair.add(entry.key);
            hairCandidates.push(entry);
        };

        const bundleKeys = new Set();
        const outfitKeys = new Set();
        const partKeys = new Set();
        const inspect = (nodeKey) => {
            for (const nb of neighborsOf(nodeKey)) {
                pushHair(nb);
                const nbDomain = domainOf(nb.key);
                if (nbDomain === "bundle" && nb.kind === "package_link") bundleKeys.add(nb.key);
                if (nbDomain === "outfit" && (nb.kind === "contains" || nb.kind === "package_link")) {
                    outfitKeys.add(nb.key);
                }
                if (nbDomain === "part" && (nb.kind === "contains" || nb.kind === "package_link")) {
                    partKeys.add(nb.key);
                }
            }
        };

        for (const root of rootKeys) {
            if (domainOf(root) === "bundle") bundleKeys.add(root);
            if (domainOf(root) === "outfit") outfitKeys.add(root);
            if (domainOf(root) === "part") partKeys.add(root);
            inspect(root);
        }
        for (const outfitKey of [...outfitKeys]) inspect(outfitKey);
        for (const partKey of [...partKeys]) inspect(partKey);
        for (const bundleKey of [...bundleKeys]) {
            for (const nb of neighborsOf(bundleKey)) {
                pushHair(nb);
            }
        }
        return pickPreferredHair(hairCandidates);
    };

    if (domain === "hair") {
        return { targetKey: key, targetDomain: "hair", hairKey: null };
    }

    if (domain === "bundle") {
        const direct = neighborsOf(key, new Set(["package_link", "contains", "wrapped_outfit"]));
        // 礼盒通常通过 package_link -> part <- contains -- outfit 关联到主成衣，优先还原到完整成衣模型。
        let targetKey = key;
        let targetDomain = "bundle";
        const directOutfit = direct.find((nb) => domainOf(nb.key) === "outfit");
        if (directOutfit) {
            targetKey = directOutfit.key;
            targetDomain = "outfit";
        } else {
            const linkedParts = direct.filter((nb) => domainOf(nb.key) === "part");
            const inferredOutfits = [];
            for (const part of linkedParts) {
                for (const nb of neighborsOf(part.key, new Set(["contains"]))) {
                    if (domainOf(nb.key) === "outfit" && !inferredOutfits.includes(nb.key)) {
                        inferredOutfits.push(nb.key);
                    }
                }
            }
            if (inferredOutfits.length) {
                targetKey = inferredOutfits[0];
                targetDomain = "outfit";
            } else {
                const priority = ["part", "hair", "pendant", "weapon", "effect", "posture"];
                for (const wanted of priority) {
                    const found = direct.find((nb) => domainOf(nb.key) === wanted);
                    if (found) {
                        targetKey = found.key;
                        targetDomain = wanted;
                        break;
                    }
                }
            }
        }
        if (targetDomain === "hair") {
            return { targetKey, targetDomain, hairKey: null };
        }
        const companionHair = findCompanionHair([key, targetKey]);
        return {
            targetKey,
            targetDomain,
            hairKey: companionHair || DEFAULT_HAIR_KEY,
        };
    }

    if (domain === "outfit" || domain === "part") {
        if (domain === "part" && item?.slot === "hair") {
            return { targetKey: key, targetDomain: domain, hairKey: null };
        }
        const companionHair = findCompanionHair([key]);
        return {
            targetKey: key,
            targetDomain: domain,
            hairKey: companionHair || DEFAULT_HAIR_KEY,
        };
    }

    // 挂件/武器/特效/站姿：上身试穿时默认搭配狐金，单品悬浮时不额外请求发型。
    return {
        targetKey: key,
        targetDomain: domain,
        hairKey: DEFAULT_HAIR_KEY,
    };
}

// 统一归属玩家返图：同一套外观的礼盒（标准/豪华）与 1:1 唯一散件共享主成衣的返图桶，避免玩家在重复入口分散晒图。
export function resolveCanonicalShowcaseTarget(item, graphNodes = [], graphEdges = []) {
    const key = item?.key || "";
    const fallback = {
        publishKey: key,
        publishName: item?.name || item?.game_name || key,
        queryKeys: key ? [key] : [],
        isCanonicalRedirect: false,
    };
    if (!key || !graphNodes.length || !graphEdges.length) return fallback;

    const nodeMap = new Map(graphNodes.map((node) => [node.key, node]));
    const domainOf = (nodeKey) => nodeMap.get(nodeKey)?.domain || String(nodeKey).split("_")[0];
    const nameOf = (nodeKey) => nodeMap.get(nodeKey)?.name || nodeMap.get(nodeKey)?.game_name || nodeKey;

    const outfitParts = new Map();
    const partOutfits = new Map();
    const bundleTargets = new Map();

    const addMapSet = (map, k, v) => {
        if (!map.has(k)) map.set(k, new Set());
        map.get(k).add(v);
    };

    for (const edge of graphEdges) {
        if (edge.kind === "contains" && domainOf(edge.from_key) === "outfit" && domainOf(edge.to_key) === "part") {
            addMapSet(outfitParts, edge.from_key, edge.to_key);
            addMapSet(partOutfits, edge.to_key, edge.from_key);
        }
        if (edge.kind === "package_link") {
            if (domainOf(edge.from_key) === "bundle") addMapSet(bundleTargets, edge.from_key, edge.to_key);
            else if (domainOf(edge.to_key) === "bundle") addMapSet(bundleTargets, edge.to_key, edge.from_key);
        }
    }

    const resolveBundleOutfits = (bundleKey) => {
        const outfits = new Set();
        for (const target of bundleTargets.get(bundleKey) || []) {
            if (domainOf(target) === "outfit") {
                outfits.add(target);
            } else if (domainOf(target) === "part") {
                for (const outfitKey of partOutfits.get(target) || []) {
                    outfits.add(outfitKey);
                }
            }
        }
        return [...outfits];
    };

    const collectOutfitGroupKeys = (outfitKey) => {
        const keys = new Set([outfitKey]);
        const parts = [...(outfitParts.get(outfitKey) || [])];
        if (parts.length === 1) keys.add(parts[0]);
        for (const bundleKey of bundleTargets.keys()) {
            const linkedOutfits = resolveBundleOutfits(bundleKey);
            if (linkedOutfits.length === 1 && linkedOutfits[0] === outfitKey) {
                keys.add(bundleKey);
            }
        }
        return [...keys];
    };

    const domain = item.domain || domainOf(key);
    if (domain === "outfit") {
        const queryKeys = collectOutfitGroupKeys(key);
        return {
            publishKey: key,
            publishName: item.name || item.game_name || nameOf(key),
            queryKeys,
            isCanonicalRedirect: false,
        };
    }

    if (domain === "bundle") {
        const linkedOutfits = resolveBundleOutfits(key);
        if (linkedOutfits.length === 1) {
            const primaryOutfit = linkedOutfits[0];
            const queryKeys = [...new Set([primaryOutfit, key, ...collectOutfitGroupKeys(primaryOutfit)])];
            return {
                publishKey: primaryOutfit,
                publishName: nameOf(primaryOutfit),
                queryKeys,
                isCanonicalRedirect: primaryOutfit !== key,
            };
        }
        return fallback;
    }

    if (domain === "part") {
        const parents = [...(partOutfits.get(key) || [])];
        if (parents.length === 1 && (outfitParts.get(parents[0])?.size || 0) === 1) {
            const primaryOutfit = parents[0];
            const queryKeys = [...new Set([primaryOutfit, key, ...collectOutfitGroupKeys(primaryOutfit)])];
            return {
                publishKey: primaryOutfit,
                publishName: nameOf(primaryOutfit),
                queryKeys,
                isCanonicalRedirect: primaryOutfit !== key,
            };
        }
        return fallback;
    }

    return fallback;
}

export function resolveExteriorAssetUrl(path) {
    if (!path || typeof path !== "string") return "";
    const trimmed = path.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed.replace(/^https?:\/\/oss\.jx3box\.com/i, CDN_BASE);
    }
    return `${CDN_BASE}/${trimmed.replace(/^\/+/, "")}`;
}

export function normalizeBodyType(raw) {
    if (raw == null || raw === "") return null;
    const numeric = Number(raw);
    if (BODY_LABEL_MAP[numeric]) return numeric;
    const text = String(raw).trim();
    if (text === "成男" || text === "StandardMale" || text === "man") return 1;
    if (text === "成女" || text === "StandardFemale" || text === "woman") return 2;
    if (text === "正太" || text === "LittleBoy" || text === "boy") return 5;
    if (text === "萝莉" || text === "LittleGirl" || text === "girl") return 6;
    return null;
}

export function pickExteriorCover(images, preferredRole = 2) {
    if (!images) return "";
    const covers = images.cover || {};
    const roleKey = preferredRole ? String(preferredRole) : "";
    const candidate =
        (roleKey && covers[roleKey]) ||
        covers.all ||
        covers["2"] ||
        covers["1"] ||
        covers["6"] ||
        covers["5"] ||
        Object.values(covers).find(Boolean) ||
        []
            .concat(Object.values(images.portrait || {}))
            .flat()
            .find(Boolean) ||
        []
            .concat(Object.values(images.detail || {}))
            .flat()
            .find(Boolean) ||
        "";
    return resolveExteriorAssetUrl(candidate);
}

export function formatExteriorPrice(price) {
    if (!price) return "";
    const amount = Number(price.amount);
    const formattedAmount = Number.isFinite(amount) ? amount.toLocaleString("zh-CN") : String(price.amount ?? "");
    const currency = CURRENCY_LABELS[price.currency] || price.currency || "";
    const duration = price.duration_days ? `（${price.duration_days}天）` : "";
    return `${formattedAmount} ${currency}${duration}`.trim();
}

export function parseExteriorDescription(text) {
    if (!text) return "";
    if (text.startsWith("<Text>")) {
        return extractTextContent(text)
            .map((segment) => segment.text || "")
            .join("")
            .trim();
    }
    return String(text).trim();
}

export function getPlayerTags(item) {
    if (!item) return [];
    const seen = new Set();
    const badges = [];
    for (const tag of item.game_tags || item.tags || []) {
        const meta = PLAYER_TAG_META[tag];
        if (!meta || seen.has(meta.label)) continue;
        seen.add(meta.label);
        badges.push({ key: `game:${tag}`, label: meta.label, tone: meta.tone });
    }
    for (const tag of item.community_tags || []) {
        const label = String(tag || "").trim();
        if (!label || seen.has(label)) continue;
        seen.add(label);
        badges.push({ key: `community:${label}`, label, tone: "indigo" });
    }
    return badges;
}
