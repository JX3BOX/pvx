import { __imgPath } from "@/utils/config";
import paths from "@/assets/data/reputation_exchange_path.json";
import levelList from "@/assets/data/reputation_level.json";

export const LOST_RESPECT_UNAVAILABLE = "无法使用遗失的尊敬来提高该声望等级进度";

export function getReputationIcon(iconPath, type = "icon") {
    const rPath = iconPath ? iconPath.replace(/\//g, "\\") : "";
    const iconName = rPath
        ? rPath.split("\\")[rPath.split("\\").length - 1].toLowerCase().split(".tga")[0]
        : "";
    if (iconName) {
        return __imgPath + "reputation/reputation/std/" + type + "/" + iconName + ".png";
    }
    return "";
}

export function getBotIcon(iconPath) {
    const rPath = iconPath ? iconPath.replace(/\//g, "\\") : "";
    const iconName = rPath
        ? rPath.split("\\")[rPath.split("\\").length - 1].toLowerCase().split(".tga")[0]
        : "";
    if (iconName) {
        return __imgPath + "reputation/reputation/std/icon/" + iconName + ".png";
    }
    return "";
}

export function getReputationPath(name) {
    const found = paths.find((item) => item.reputations.includes(name));
    return found ? found.path : "";
}

export function getLevelDesc(level) {
    const found = levelList.find((item) => item.level === Number(level));
    return found ? found.name : "未知";
}
