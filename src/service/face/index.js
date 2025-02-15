import { $next, $pay, $cms } from "@jx3box/jx3box-common/js/https";
import axios from 'axios'
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
/**
 * 获取捏脸列表
 * @param {*} params 参数
 */
function getFaceList(params) {
    return $next().get("/api/face", { params });
}

/**
 * 兼容旧版的接口
 */
function getFaceOld(id) {
    return $next().get(`/api/face/old/${id}`);
}

/**
 * 获取一个捏脸
 * @param {int} id
 */
function getOneFaceInfo(id) {
    return $next().get(`/api/face/${id}`);
}
/**
 * 管理员设置一个精选
 * @param {int} id
 */
function setStar(id) {
    return $next().put(`/api/face/${id}/manager/set/star`);
}
/**
 * 管理员取消一个精选
 * @param {int} id
 */
function cancelStar(id) {
    return $next().put(`/api/face/${id}/manager/cancel/star`);
}
/**
 * 管理员/作者上架捏脸
 * @param {int} id
 * @param {Boolean} isAdmin
 */
function onlineFace(id, isAdmin) {
    if (isAdmin) {
        return $next().put(`/api/face/${id}/manager/online`);
    }
    return $next().put(`/api/face/${id}/online`);
}
/**
 * 管理员/作者下架捏脸
 * @param {int} id
 * @param {Boolean} isAdmin
 */
function offlineFace(id, isAdmin) {
    if (isAdmin) {
        return $next().put(`/api/face/${id}/manager/offline`);
    }
    return $next().put(`/api/face/${id}/offline`);
}

/**
 * 删除一个捏脸，软删除
 * @param id
 */
function deleteFace(id) {
    return $next().delete(`/api/face/${id}`);
}
/**
 * 购买捏脸
 * postType {string} 捏脸固定填face
 * PostId {int}  捏脸的主键id， 【可以从捏脸列表中获取id】
 * priceType {string} 支付方式。【可以从捏脸列表中获取 priceType】
 * priceCount {int} 支付数量 【可以从捏脸列表中获取 priceCount】
 * payUserId {int} 购买人的id  【当前登录用户】
 * accessUserId {int} 出售人的id  【可以从捏脸列表中获取 user_id】
 */
function payFace(params) {
    return $pay({ mute: true }).post(
        `/api/buy-licence/article/${params.postType}/${params.PostId}/pay/${params.priceType}/${params.priceCount}/from/${params.payUserId}/to/${params.accessUserId}`, {}
    );
}
/**
 * 循环获取支付结果
 * @param {Object} id  购买记录id
 */
function loopPayStatus(id) {
    return $pay().get(`/api/buy-licence/result/${id}`);
}
/**
 * 获取附件列表
 * @param {int} postId
 * @param {Object} params
 */
function getAccessoryList(postId, params) {
    return $next().get(`/api/charge_attachment/face/${postId}`, {
        params: params,
    });
}

/**
 * 获取最新一个附件（没有被作者或者管理删除的最新一个版本）
 * @param {int} postId
 * @param {Object} params
 */
function getNewAccessory(postId, params) {
    return $next().get(`/api/charge_attachment/face/${postId}/lastest`, {
        params: params,
    });
}
/**
 * 获取下载地址
 * @param {int} postId
 * @param {Object} uuid
 */
function getDownUrl(postId, uuid) {
    return $next().get(`/api/charge_attachment/download/face/${postId}/${uuid}`);
}

/**
 * 获取下载历史（当文章被删除后，或者附件被删除后,曾经下载过的数据，可以通过这个接口查询重新下载）
 * @param params
 * @returns {Promise<AxiosResponse<any>>}
 */
function getDownHistory(params) {
    return $next().get(`/api/charge_attachment/download-history`, {
        params: params,
    });
}

function getRandomFace(params) {
    return $next().get(`/api/face/random`, {
        params: params,
    });
}

function getRandomFaceAndBody(params) {
    return $next().get(`/api/face/random-one/with-many-body`, {
        params
    });
}

// 捏脸海报
function getSliders(type, client, per = 10, source_ids) {
    let _params = {
        client: client,
        type: type,
        source_type: "face",
    };

    if (per) {
        _params.per = per;
    }

    if (source_ids) {
        _params.source_ids = source_ids;
    }

    return $cms({ mute: true }).get(`/api/cms/news/v2`, {
        params: _params,
    });
}

function setPost(id, data) {
    return $cms().put(`/api/cms/post/${id}/setting`, data);
}

function getUserInfo(uid) {
    return $cms().get(`/api/cms/user/${uid}/info`, {
        params: {
            nocache: 1
        }
    });
}

function getDecorationJson() {
    let url = __imgPath + "decoration/index.json"
    return axios.get(url)
}
//获取装扮
function getDecoration(params) {
    return $cms().get(`/api/cms/user/decoration`,{
        params
    });
}
export {
    getFaceList,
    getOneFaceInfo,
    setStar,
    cancelStar,
    onlineFace,
    offlineFace,
    deleteFace,
    payFace,
    loopPayStatus,
    getAccessoryList,
    getNewAccessory,
    getDownUrl,
    getDownHistory,
    getRandomFace,
    getFaceOld,
    getSliders,
    getRandomFaceAndBody,
    setPost,
    getUserInfo,
    getDecorationJson,
    getDecoration
};