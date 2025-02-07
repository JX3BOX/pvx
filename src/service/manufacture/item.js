import { $cms, $next, $node } from "@jx3box/jx3box-common/js/https";

function getProfile() {
    return $cms({ mute: true })
        .get("/api/cms/user/my/profile")
        .then((res) => {
            return res.data.data;
        });
}

function getGoodsData(params) {
    return $next().get(`api/item-groups/with-prices`, {
        params,
    });
}

// 获取物品
function get_item(item_id) {
    if (!item_id) return;
    return $node().get(`/item/${item_id}`);
}


export { getProfile, getGoodsData, get_item };
