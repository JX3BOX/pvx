import { $node,axios } from "@jx3box/jx3box-common/js/https";
const $ = $node()

export function getMenus (params) {
  return $.get(`/reputation/menus`, { params });
}

export function getNews (params) {
  return $.get(`/reputation/newest`, { params });
}

export function getList (params) {
  return $.get(`/reputations`, { params });
}

export function getInfo (params) {
  return $.get(`/reputation`, { params });
}

// 已弃用
export function getReputationLinkedAchievement () {
  return axios.get(`https://data.jx3box.com/pvx/reputation/output/reputation_std_achivement.json`);
}
