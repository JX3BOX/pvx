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

// 获取服务器物价
// function getServerPriceData(params) {
//     return $next().get("api/item-price/list", {
//         params,
//     });
// }
// post 此处url最后要加/，不然会报错 301 Moved Permanently
function getServerPriceData(data) {
    return $next().post("/api/auction/", data);
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
    getGoldPriceData,
    getSystemGoodsData,
    getServerPriceData,
    getUserInfo,
    getMyFollowList,
    setMyFollowList,
    getMyGoodsDetail,
};
