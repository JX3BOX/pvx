import { $node, $cms, $next } from "@jx3box/jx3box-common/js/https";
import { __dataPath } from "@jx3box/jx3box-common/data/jx3box.json";
import axios from "axios";
const $n = $node();

// 获取技艺分组分类
async function getCraftJson() {
    const res = await axios.get(`${__dataPath}pvx/manufacture/output/craft_belong.json`);
    return res;
}
// 获取技艺某种类型的列表
function getManufactures(params) {
    return $n.get("/manufactures", { params });
}
// 获取技艺某种类型的单个详细信息
function getManufactureItem(type, id, client = "std") {
    return $n.get(`/manufacture/${type}/${id}`, {
        params: {
            client,
        },
    });
}
// 根据ids获取对应信息
function getOther(params) {
    return $n.get(`/other`, { params });
}
// 获取商店物品价格
function getItemsPrice(params) {
    return $n.get(`/craft/price`, { params });
}
// 获取交易行物品价格
function getAuctionPrice(params) {
    return $next().get(`/api/item-price/list`, { params });
}

function getUserInfo() {
    return $cms().get("/api/cms/user/my/info");
}

export {
    getManufactures,
    getManufactureItem,
    getCraftJson,
    getOther,
    getItemsPrice,
    getAuctionPrice,
    getUserInfo,
};