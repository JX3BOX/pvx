import { __imgPath } from "@/utils/config";
import paths from "@/assets/data/reputation_exchange_path.json";
import levelList from "@/assets/data/reputation_level.json";
import defaultReputationIcon from "@/assets/img/reputation/reputation-null.png";

export const LOST_RESPECT_UNAVAILABLE = "无法使用遗失的尊敬来提高该声望等级进度";
export const DEFAULT_REPUTATION_ICON = defaultReputationIcon;

function getIconName(iconPath) {
    const rPath = iconPath ? iconPath.replace(/\//g, "\\") : "";
    return rPath ? rPath.split("\\")[rPath.split("\\").length - 1].toLowerCase().split(".tga")[0] : "";
}

export function getReputationIcon(iconPath, type = "icon") {
    const iconName = getIconName(iconPath);
    if (iconName) {
        return __imgPath + "reputation/reputation/std/" + type + "/" + iconName + ".png";
    }
    return DEFAULT_REPUTATION_ICON;
}

export function getBotIcon(iconPath) {
    const iconName = getIconName(iconPath);
    if (iconName) {
        return __imgPath + "reputation/reputation/std/icon/" + iconName + ".png";
    }
    return DEFAULT_REPUTATION_ICON;
}

export function getReputationPath(name) {
    const found = paths.find((item) => item.reputations.includes(name));
    return found ? found.path : "";
}

export function getLevelDesc(level) {
    const found = levelList.find((item) => item.level === Number(level));
    return found ? found.name : "未知";
}
