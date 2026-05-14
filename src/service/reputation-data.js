import { getList, getMenus } from "@/service/reputation";
import { getBreadcrumb } from "@jx3box/jx3box-common/js/system";
import maps_std from "@jx3box/jx3box-data/data/fb/fb_map.json";
import maps_origin from "@jx3box/jx3box-data/data/fb/fb_map_origin.json";

export function loadReputationList(client, per = 50) {
    const params = { page: 1, per, client };
    const maps = client === "std" ? maps_std : maps_origin;

    return getBreadcrumb("reputation-newest", { client })
        .then((data) => {
            const news = data.split(",").map((item) => Number(item));
            return getMenus({ client }).then((res) => {
                const list = res.data.dlc || [];
                const arr = Object.keys(maps)
                    .map((key) => `${key}(${maps[key].level}级)`)
                    .reverse();
                const versions = list.map((item, i) => ({
                    value: item.nDlcID,
                    total: item.total,
                    label: arr[i],
                }));
                const reversedVersions = versions.reverse();

                const promiseAll = reversedVersions.map((item) =>
                    getList({ dlc: item.value, ...params })
                );
                return Promise.all(promiseAll).then((res) => {
                    const allList = res.map((item) => item.data.list);
                    const newsList = allList.flat().filter((item) => news.includes(item.dwForceID));
                    const versionList = reversedVersions.map((item) => ({
                        ...item,
                        list: allList.flat().filter((reputation) => reputation.nDlcID === item.value),
                    }));
                    return { versions: reversedVersions, newsList, versionList };
                });
            });
        });
}
