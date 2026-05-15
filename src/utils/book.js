import bookProfession from "@/assets/data/book_profession.json";
import bookMapInfoStd from "@/assets/data/stele_std_fwd.json";
import bookMapInfoOrigin from "@/assets/data/stele_origin_fwd.json";
import maps_std from "@jx3box/jx3box-data/data/fb/fb_map.json";
import maps_orgin from "@jx3box/jx3box-data/data/fb/fb_map_origin.json";

export const BOOK_TYPE_MAP = {
    11: "杂集",
    10: "道学",
    9: "佛学",
};

export const BOOK_TABS = [
    { id: 11, label: "杂集", bgColod: "#324148" },
    { id: 10, label: "道学", bgColod: "#194372" },
    { id: 9, label: "佛学", bgColod: "#947d2e" },
];

export function getBookMapInfo(client) {
    return client === "std" ? bookMapInfoStd : bookMapInfoOrigin;
}

export function getProfessionType(type) {
    const found = bookProfession.find((item) => item.id === Number(type));
    return found ? found.name : "";
}

export function getOrigin(item, bookMapInfo) {
    const tempId = item.DoodadTemplateID;
    const ShopNames = item?.ShopNames;
    const drops = item.drops || [];
    const quests = item?.Quests;
    let origin = "";
    if (tempId) {
        origin = origin + (origin ? "/" : "") + (bookMapInfo[tempId] ? "碑铭" : "其它");
    }
    if (ShopNames) {
        origin = origin + (origin ? "/" : "") + "商店";
    }
    if (drops.length) {
        origin = origin + (origin ? "/" : "") + "秘境";
    }
    if (quests) {
        origin = origin + (origin ? "/" : "") + "任务";
    }
    if (!origin) {
        origin = "其它";
    }
    return origin;
}

export function getBossOrigin(book, client) {
    const fbMaps = client === "std" ? maps_std : maps_orgin;
    const maps = Object.values(fbMaps)
        .map((item) => Object.values(item.dungeon))
        .reduce(function (a, b) {
            return a.concat(b);
        })
        .map((item) => {
            return item.maps.map((mItem) => {
                return {
                    map_id: Number(mItem.map_id),
                    name: mItem.mode + item.name,
                };
            });
        })
        .flat();
    const drops = book?.drops;
    if (drops && drops.length) {
        let origin = "";
        drops.forEach((item) => {
            origin =
                origin +
                (origin ? "<br />" : "") +
                ("[" + item.BossName + "]") +
                (maps.find((mItem) => mItem.map_id === item.MapID)
                    ? "(" + maps.find((mItem) => mItem.map_id === item.MapID).name + ")"
                    : "");
        });
        return origin;
    }
    return "";
}

export function getShopOrigin(book) {
    let shopNames = book?.ShopNames;
    if (shopNames) {
        shopNames = shopNames.replace(/\|/g, "<br />");
    }
    return shopNames;
}

export function getQuestOrigin(book) {
    const quests = book?.Quests;
    let questList = [];
    if (quests) {
        questList = quests.split(";").map((item) => {
            if (item.indexOf(":") > -1) {
                return {
                    questId: item.split(":")[0],
                    questName: item.split(":")[1],
                };
            }
        });
    }
    return questList;
}
