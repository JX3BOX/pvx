import axios from "axios";
import { $cms, $next, $node } from "@jx3box/jx3box-common/js/api";
import { __spider2 } from "@/utils/config";

const $spider = axios.create({
    baseURL: __spider2,
});

// 获取金价数据
function getGoldPriceData() {
    return $spider.get("/api/spider/gold/trend");
}

// 获取系统关注的物品信息
function getSystemGoodsData(params) {
    return $cms().get("api/cms/pvx/item/group", {
        params,
    });
}

// 可交易目录没有名称、图标，按当前页 ID 补齐；详情缺失时保留目录记录。
async function getTradableGoodsPage({ index = 1, pageSize = 20, client = "std", signal } = {}) {
    const response = await $next({ mute: true }).get("/api/next2/tradable-item/list", {
        params: { index, pageSize },
        signal,
    });
    const payload = response.data;
    if (
        payload?.code !== 0 ||
        !payload.data?.page ||
        (payload.data.list != null && !Array.isArray(payload.data.list))
    ) {
        throw new Error(payload?.msg || "可交易物品列表返回异常");
    }
    const records = payload.data.list || [];
    const ids = [...new Set(records.map((item) => item.item_id))];
    const details = new Map();
    // 每批最多 20 件，避免详情接口分页截断。
    for (let offset = 0; offset < ids.length; offset += 20) {
        const batch = ids.slice(offset, offset + 20);
        try {
            const result = await $node({ mute: true }).get(`/item_merged/id/${batch.join(",")}`, {
                params: { client, per: batch.length },
                signal,
            });
            (result.data.list || []).forEach((item) => details.set(item.id, item));
        } catch (error) {
            if (signal?.aborted) throw error;
            // 报价仍可按原始 item_id 查询。
        }
    }
    const items = records.map((record) => {
        const detail = details.get(record.item_id);
        return { ...record, label: detail?.Name || record.item_id, icon: detail?.IconID || null };
    });
    return {
        items,
        page: payload.data.page,
        missingDetails: items.filter((item) => !details.get(item.item_id)?.Name || !item.icon).length,
    };
}

// 名称在 Node 服务端匹配；只校验当前候选批次，不扫描全部物品。
async function searchTradableGoodsBatch({ keyword, client, index = 1, signal, membershipCache }) {
    const isId = /^\d+_\d+(?:_\d+)?$/.test(keyword);
    const path = isId
        ? `/item_merged/id/${encodeURIComponent(keyword)}`
        : `/item_merged/name/${encodeURIComponent(keyword)}`;
    const response = await $node({ mute: true }).get(path, {
        params: { client, page: index, per: 20 },
        signal,
        timeout: 15000,
    });
    const payload = response.data;
    if (!Array.isArray(payload.list) || !Number.isFinite(Number(payload.total))) throw new Error("名称搜索返回异常");
    const candidates = payload.list;
    const accepted = new Set();
    let cursor = 0;
    let failure = null;
    const worker = async () => {
        while (cursor < candidates.length && !failure && !signal?.aborted) {
            const item = candidates[cursor++];
            const cached = membershipCache?.get(item.id);
            try {
                let tradable;
                if (cached && Date.now() - cached.time < 300000) {
                    tradable = cached.tradable;
                } else {
                    const check = await $next({ mute: true }).get("/api/next2/tradable-item/list", {
                        params: { item_id: item.id, index: 1, pageSize: 1 },
                        signal,
                        timeout: 15000,
                    });
                    if (check.data?.code !== 0 || !check.data.data?.page) throw new Error("可交易状态校验失败");
                    tradable = (check.data.data.list || []).some((record) => record.item_id === item.id);
                    membershipCache?.delete(item.id);
                    membershipCache?.set(item.id, { tradable, time: Date.now() });
                    if (membershipCache?.size > 1000) membershipCache.delete(membershipCache.keys().next().value);
                }
                if (tradable) accepted.add(item.id);
            } catch (error) {
                failure = error;
            }
        }
    };
    await Promise.all(Array.from({ length: Math.min(4, candidates.length) }, worker));
    if (signal?.aborted) throw new Error("Search canceled");
    if (failure) throw failure;
    return {
        items: candidates
            .filter((item) => accepted.has(item.id))
            .map((item) => ({ item_id: item.id, label: item.Name || item.id, icon: item.IconID || null })),
        total: Number(payload.total),
    };
}

// 获取服务器物价
// function getServerPriceData(params) {
//     return $next().get("api/item-price/list", {
//         params,
//     });
// }
// post 此处url最后要加/，不然会报错 301 Moved Permanently
function getServerPriceData(data, { signal } = {}) {
    return $next(signal ? { mute: true } : {}).post("/api/auction/", data, { signal });
}

// 单物品 daily 不传 server，获取各服历史序列供趋势聚合。
async function getDailyPriceTrend(itemId, signal) {
    const result = await $next({ mute: true }).post(
        "/api/auction/",
        {
            item_id: itemId,
            aggregate_type: "daily",
        },
        { signal, timeout: 15000 }
    );
    if (!Array.isArray(result.data)) throw new Error("日线数据返回异常");
    return result.data;
}

// 获取用户信息
function getUserInfo() {
    return $cms().get("api/cms/user/my/info");
}

// 获取我关注的清单
function getMyFollowList() {
    return $cms().get("api/cms/user/my/meta?key=follow_inventory");
}

// 设置我关注的清单
function setMyFollowList(data) {
    return $cms().post("api/cms/user/my/meta?key=follow_inventory", data);
}

// 获取清单详情
async function getMyGoodsDetail(id, client = "std") {
    const res = await $cms().get("api/cms/app/item-plan/" + id);
    const plan = res.data.data;
    const items = [];
    // 清单可能只保存 ID 和数量，旧清单还可能直接保存 ID 字符串。
    (plan?.relation || []).forEach((group) => {
        if (!Array.isArray(group.data)) return;
        group.data = group.data.map((item) => (typeof item === "string" ? { id: item, count: 1 } : item));
        items.push(...group.data);
    });
    const ids = [...new Set(items.filter((item) => item.id && (!item.Name || !item.IconID)).map((item) => item.id))];
    // 分批补齐，避免长清单被接口分页截断；某批失败仍保留原清单。
    const requests = [];
    for (let offset = 0; offset < ids.length; offset += 20) {
        const batch = ids.slice(offset, offset + 20);
        requests.push($node().get(`/item_merged/id/${batch.join(",")}`, { params: { client, per: batch.length } }));
    }
    const results = await Promise.allSettled(requests);
    const details = new Map();
    results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        (result.value.data.list || []).forEach((item) => details.set(item.id, item));
    });
    items.forEach((item) => {
        const detail = details.get(item.id);
        if (!detail) return;
        item.Name = item.Name || detail.Name;
        item.IconID = item.IconID || detail.IconID;
    });
    return res;
}

export {
    searchTradableGoodsBatch,
    getDailyPriceTrend,
    getGoldPriceData,
    getSystemGoodsData,
    getTradableGoodsPage,
    getServerPriceData,
    getUserInfo,
    getMyFollowList,
    setMyFollowList,
    getMyGoodsDetail,
};
