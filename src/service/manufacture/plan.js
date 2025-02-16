import { $cms, $node } from "@jx3box/jx3box-common/js/https";

// 单个清单搜索
export function getPlan(id) {
    return $cms()
        .get(`/api/cms/app/item-plan/${id}`)
        .then((res) => {
            return res.data.data;
        });
}
// 删除清单
export function deletePlan(id) {
    return $cms().delete(`/api/cms/app/item-plan/${id}`);
}

// 获取我的清单
export function getPlans() {
    return $cms()
        .get(`/api/cms/app/item-plan/mine`, { params: { no_page: 1, _no_cache: 1, type: 3 } })
        .then((res) => {
            return res.data.data;
        });
}

export function updatePlan(id, data) {
    return $cms().put(`/api/cms/app/item-plan/${id}`, data);
}

// 新增清单
export function addMyPlan(data) {
    return $cms().post(`/api/cms/app/item-plan`, data);
}

export function batchDeletePlan(ids) {
    return $cms().delete(`/api/cms/app/item-plan/batch/${ids}`);
}

export function getPlansByIds(ids) {
    return $cms()
        .get(`/api/cms/app/item-plan/mine`, { params: { ids, _no_cache: 1, type: 3 } })
        .then((res) => {
            return res.data.data;
        });
}
