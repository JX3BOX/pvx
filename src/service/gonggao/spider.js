import { $next, $node } from "@jx3box/jx3box-common/js/https";
// 家园声望
function getHomeReputation(date, server = "梦江南") {
    const params = {
        server: server, // 所有服务器数据一致
        upload_time: date + " 07:00:00",
        // 上传时间, 查询时请格式化为 2006-01-02 07:00:00，表示查询当天上报的物价
    };
    return $next().get("/api/next2/npc-shop/list", {
        params,
    }); 
}
// 批量获取物品
function getItems(ids, client = "std") {
    const per = ids.length || 15;
    const params = {
        client,
        per,
    };
    const idString = ids.join(",");
    if (!idString) return;
    return $node().get(`/item_merged/id/${idString}`, {
        params,
    });
}
export { getHomeReputation, getItems };
