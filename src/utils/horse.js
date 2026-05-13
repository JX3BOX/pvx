import { __cdn } from "@/utils/config";
import horsePlaceholder from "@/assets/img/horse/horse_item_bg_sm.jpg";

const GEAR_TYPES = ["头饰", "鞍饰", "足饰", "马饰"];

export function getHorseType(item) {
    if (item.SubType === 15) {
        return item.DetailType === 0 ? "普通坐骑" : "奇趣坐骑";
    }
    if (item.SubType === 23) {
        return GEAR_TYPES[item.DetailType] || "马具";
    }
    return "";
}

export function getHorseImgSrc(item, client, imgRoot, imgRoot2, isAuto = false) {
    const effectiveClient = isAuto ? client : "std";
    return `${__cdn}design/horse/${effectiveClient}/${item.ID}.png`;
}

export function getHorseModeName(item) {
    if (item.SubType === 15 && item.MagicAttributes?.length) {
        const attr = item.MagicAttributes.find((a) => a.id === "15650");
        return attr ? attr.name : "单骑";
    }
    return "";
}

export function getHorseFeedName(item, isRobot = false) {
    if (item.SubType !== 15 || !item.Feed) return "";
    const tip = item.Feed.FeedTip;
    const start = tip.indexOf("【");
    const end = tip.indexOf("】");
    const feed = tip.slice(start, end + 1);
    return isRobot ? feed.replace(/【|】/g, "") : feed;
}

export function getHorseSpeed(item) {
    if (!item.MoveSpeed) return "";
    return item.MoveSpeedDesc.split("移动速度提高")[1] || "";
}

export function handleHorseImgError(e) {
    e.target.src = horsePlaceholder;
}

export function getHorseLink(item) {
    const id = item.ItemID;
    const type = item.SubType === 15 ? 1 : 2;
    return `/horse/${id}?type=${type}`;
}
