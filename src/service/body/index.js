import { $next, $pay, $cms } from "@jx3box/jx3box-common/js/https";

function getBodyList(params) {
    return $next().get("/api/pvxbody", { params });
}

function getOneBodyInfo(id) {
    return $next().get(`/api/pvxbody/${id}`);
}

// 设置精选 
function setStar(id) {
    return $next().put(`/api/pvxbody/${id}/manager/set/star`);
}
// 取消一个精选
function cancelStar(id) {
    return $next().put(`/api/pvxbody/${id}/manager/cancel/star`);
}

// 管理员/作者上架体型 
function onlineBody(id, isAdmin) {
    if (isAdmin) return $next().put(`/api/pvxbody/${id}/manager/online`);
    return $next().put(`/api/pvxbody/${id}/online`);
}
// 管理员/作者下架体型 
function offlineBody(id, isAdmin) {
    if (isAdmin) return $next().put(`/api/pvxbody/${id}/manager/offline`);
    return $next().put(`/api/pvxbody/${id}/offline`);
}

// 删除一个体型，软删除 
function deleteBody(id) {
    return $next().delete(`/api/pvxbody/${id}`);
}
/**
 * 购买
 * postType {string} 体型固定填body
 * PostId {int}  体型的主键id， 【可以从体型列表中获取id】
 * priceType {string} 支付方式。【可以从体型列表中获取 priceType】
 * priceCount {int} 支付数量 【可以从体型列表中获取 priceCount】
 * payUserId {int} 购买人的id  【当前登录用户】
 * accessUserId {int} 出售人的id  【可以从体型列表中获取 user_id】
 */
function payBody(params) {
    const { postType, PostId, priceType, priceCount, payUserId, accessUserId } = params
    return $pay({ mute: true }).post(`/api/buy-licence/article/${postType}/${PostId}/pay/${priceType}/${priceCount}/from/${payUserId}/to/${accessUserId}`);
}
// 循环获取支付结果 
function loopPayStatus(id) {
    return $pay().get(`/api/buy-licence/result/${id}`);
}

function setPost(id, data) {
    return $cms().put(`/api/cms/post/${id}/setting`, data);
}

// 获取附件列表 
function getAccessoryList(postId, params) {
    return $next().get(`/api/charge_attachment/pvxbody/${postId}`, {
        params: params,
    });
}
// 获取下载地址
function getDownUrl(postId, uuid) {
    return $next().get(`/api/charge_attachment/download/pvxbody/${postId}/${uuid}`);
}

function getRandomFaceAndBody(params) {
    return $next().get(`/api/pvxbody/random-one/with-many-face`, {
        params
    });
}

function getRandomBody(params) {
    return $next().get(`/api/pvxbody/random`, {
        params: params,
    });
}


function getSliders(type, client, per = 10, source_ids) {
    let _params = {
        client: client,
        type: type,
        source_type: "body",
    };
    if (per) _params.per = per;
    if (source_ids) _params.source_ids = source_ids;
    return $cms({ mute: true }).get(`/api/cms/news/v2`, {
        params: _params,
    });
}

export {
    getOneBodyInfo,
    getBodyList,
    setStar,
    cancelStar,
    onlineBody,
    offlineBody,
    deleteBody,
    payBody,
    loopPayStatus,
    setPost,
    getAccessoryList,
    getRandomBody,
    getRandomFaceAndBody,
    getDownUrl,
    getSliders
};