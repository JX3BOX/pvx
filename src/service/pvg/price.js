import axios from "axios";
import { $cms, $next } from "@jx3box/jx3box-common/js/https";
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
    return $next().post("api/auction/", data);
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
function getMyGoodsDetail(id) {
    return $cms().get("api/cms/app/item-plan/" + id);
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
