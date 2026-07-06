import axios from "axios";
import treasurePerfect from "@jx3box/jx3box-common/data/treasure_perfect.json";

const ONLINE_TREASURE_PERFECT_URL =
    process.env.VUE_APP_ADVENTURE_TREASURE_LAYOUT_URL ||
    "https://cdn.jsdelivr.net/npm/@jx3box/jx3box-common/data/treasure_perfect.json";

const STYLE_LENGTH_KEYS = new Set(["top", "right", "bottom", "left", "width", "height", "fontSize", "lineHeight"]);

let layoutPromise;

function isValidTreasureLayout(layout) {
    return Array.isArray(layout?.perfect?.items);
}

function getLayoutItems(layout = {}) {
    return Array.isArray(layout?.perfect?.items) ? layout.perfect.items : [];
}

function getLayoutItemId(item = {}) {
    return Number(item.id || item.dwID);
}

function hasAllBaseItems(baseItems = [], overrideItems = []) {
    const overrideItemIds = new Set(overrideItems.map(getLayoutItemId).filter(Boolean));
    return baseItems.every((item) => overrideItemIds.has(getLayoutItemId(item)));
}

function mergeTreasureLayout(baseLayout = treasurePerfect, overrideLayout = {}) {
    const baseItems = getLayoutItems(baseLayout);
    const overrideItems = getLayoutItems(overrideLayout);

    if (hasAllBaseItems(baseItems, overrideItems)) {
        return {
            ...baseLayout,
            ...overrideLayout,
            perfect: {
                ...(baseLayout.perfect || {}),
                ...(overrideLayout.perfect || {}),
                items: overrideItems,
            },
        };
    }

    const overrideItemMap = overrideItems.reduce((map, item) => {
        const id = getLayoutItemId(item);
        if (id) map[id] = item;
        return map;
    }, {});
    const mergedItemIds = new Set();
    const items = baseItems.map((baseItem) => {
        const id = getLayoutItemId(baseItem);
        mergedItemIds.add(id);
        return {
            ...baseItem,
            ...(overrideItemMap[id] || {}),
        };
    });

    overrideItems.forEach((item) => {
        const id = getLayoutItemId(item);
        if (!mergedItemIds.has(id)) items.push(item);
    });

    return {
        ...baseLayout,
        ...overrideLayout,
        perfect: {
            ...(baseLayout.perfect || {}),
            ...(overrideLayout.perfect || {}),
            items,
        },
    };
}

function normalizeLayoutResponse(res) {
    const layout = res?.data?.data || res?.data || res;
    return isValidTreasureLayout(layout) ? mergeTreasureLayout(treasurePerfect, layout) : treasurePerfect;
}

export function getAdventureTreasureLayout(options = {}) {
    const url = String(options.url || ONLINE_TREASURE_PERFECT_URL || "").trim();
    if (!url) return Promise.resolve(treasurePerfect);

    if (!layoutPromise || options.force || options.url) {
        layoutPromise = axios
            .get(url, {
                withCredentials: false,
            })
            .then(normalizeLayoutResponse)
            .catch(() => treasurePerfect);
    }

    return layoutPromise;
}

export function getTreasurePerfectItems(layout = treasurePerfect) {
    const items = getLayoutItems(layout);
    return items.length ? items : getLayoutItems(treasurePerfect);
}

export function getTreasurePerfectItemMap(layout = treasurePerfect) {
    return getTreasurePerfectItems(layout).reduce((map, item) => {
        const id = Number(item.id || item.dwID);
        if (id) map[id] = item;
        return map;
    }, {});
}

export function getTreasurePerfectLayout(layout = treasurePerfect, mode = "portrait") {
    const perfectConfig = layout?.perfect || {};
    const fallbackConfig = treasurePerfect?.perfect || {};
    const assets = {
        ...(fallbackConfig.assets || {}),
        ...(perfectConfig.assets || {}),
    };
    const fallbackLayouts = fallbackConfig.layouts || {};
    const layouts = perfectConfig.layouts || {};
    const fallbackModeLayout = fallbackLayouts[mode] || fallbackLayouts.portrait || {};
    const selectedModeLayout = layouts[mode] || layouts.portrait || {};
    const fallbackCount = fallbackModeLayout.count || {};
    const selectedCount = selectedModeLayout.count || {};

    return {
        stage: selectedModeLayout.stage || fallbackModeLayout.stage || { width: 700, height: 700 },
        worldBackground: {
            src: assets.worldBackground,
            style: selectedModeLayout.worldBackgroundStyle || fallbackModeLayout.worldBackgroundStyle || {},
        },
        countBadge: selectedCount.badge || fallbackCount.badge,
        countStyle: selectedCount.style || fallbackCount.style || {},
        countImageStyle: selectedCount.imageStyle || fallbackCount.imageStyle || {},
        countTextStyle: selectedCount.textStyle || fallbackCount.textStyle || {},
        countFormat: selectedCount.format || fallbackCount.format || "inline",
        textBackground: assets.textBackground,
        textActiveBackground: assets.textActiveBackground,
    };
}

export function toTreasureCssStyle(style = {}) {
    return Object.entries(style || {}).reduce((result, [key, value]) => {
        if (value === undefined || value === null || value === "") return result;
        result[key] = STYLE_LENGTH_KEYS.has(key) && Number.isFinite(Number(value)) ? `${value}px` : value;
        return result;
    }, {});
}

export { treasurePerfect };
