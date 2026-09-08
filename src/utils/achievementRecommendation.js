// The server owns eligibility. Detail queries must not change the draft order.
export function formatAchievementRecommendationDate(value, locale = "zh-CN") {
    if (typeof value !== "string" || !value.trim()) return "";
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toLocaleString(locale, { timeZone: "Asia/Shanghai" }) : "";
}

export function achievementRecommendationExclusions(summary) {
    if (!summary || typeof summary !== "object" || Array.isArray(summary)) return [];
    // Reasons may overlap. Keep server counts separate; never invent a deduplicated total.
    return Object.entries(summary).flatMap(([reason, value]) => {
        const count = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
        return Number.isSafeInteger(count) && count > 0 ? [{ reason, count }] : [];
    });
}

export function defaultAchievementRecommendationOptions() {
    return { categoryIds: null, dimensionWeights: {}, directionWeights: {} };
}

// These are category aliases for the preference UI, not eligibility rules for server results.
export const ACHIEVEMENT_RECOMMENDATION_DIRECTION_CATEGORIES = {
    dungeon: ["秘境"],
    quest: ["任务"],
    map: ["地图", "足迹"],
    misc: ["杂闻"],
    martial: ["武学"],
    cultivation: ["修为"],
    equipment: ["装备"],
    crafting: ["技艺"],
    reading: ["阅读"],
    combat: ["战斗"],
    reputation: ["声望"],
    guild: ["帮会"],
    pvp: ["对抗", "阵营"],
    holiday: ["节日"],
    activity: ["活动"],
    story: ["剧情", "剑侠录", "风雨江湖路"],
    housing: ["家园"],
    other: ["其他"],
};

export function achievementRecommendationDirections(categoryIds, categories = []) {
    const selected = categoryIds === null ? null : new Set(categoryIds.map(String));
    const directions = new Set(categories.filter((category) => !selected || selected.has(String(category.id)))
        .map((category) => Object.entries(ACHIEVEMENT_RECOMMENDATION_DIRECTION_CATEGORIES)
            .find(([, names]) => names.includes(category.name))?.[0] || "other"));
    return Object.keys(ACHIEVEMENT_RECOMMENDATION_DIRECTION_CATEGORIES).filter((key) => directions.has(key));
}

export function achievementRecommendationDirectionWeight(value) {
    return [1.3, 0.7].includes(value) ? value : 1;
}

export function achievementRecommendationPreferences(options, categories) {
    const directions = new Set(achievementRecommendationDirections(options.categoryIds, categories));
    return {
        ...(options.categoryIds === null ? {} : {
            category_ids: [...new Set(categories.filter((category) => options.categoryIds.includes(category.id))
                .flatMap((category) => category.sourceIds).map(Number))],
        }),
        dimension_weights: { ...options.dimensionWeights },
        direction_weights: Object.fromEntries(Object.keys(ACHIEVEMENT_RECOMMENDATION_DIRECTION_CATEGORIES)
            .map((direction) => [direction, directions.has(direction)
                ? achievementRecommendationDirectionWeight(options.directionWeights[direction]) : 1])),
    };
}

export function flattenAchievementRecommendation(recommendation) {
    const restricted = new Set(recommendation.camp_restricted_ids.map(String));
    return recommendation.recommendations.flatMap(({ group, ids }) =>
        ids.map((id) => ({ id: String(id), recommendationGroup: group, campRestricted: restricted.has(String(id)) }))
    );
}

export function selectAchievementRecommendation(recommendation, metadata, targetPoints) {
    const rows = flattenAchievementRecommendation(recommendation);
    return selectAchievementRecommendationItems(rows.map((row) => ({ ...row, points: metadata[row.id]?.point })),
        recommendation.role.current_points, targetPoints).map(({ points, ...row }) => row);
}

export function selectAchievementRecommendationItems(items, currentPoints, targetPoints, includedIds = []) {
    const selection = resolveAchievementRecommendationSelection(items, currentPoints, targetPoints, includedIds);
    if (selection.missingPointId !== null) throw new Error(`Missing achievement points: ${selection.missingPointId}`);
    return selection.items;
}

export function resolveAchievementRecommendationSelection(items, currentPoints, targetPoints, includedIds = []) {
    const gap = Number(targetPoints) - currentPoints;
    const included = new Set(includedIds.map(String));
    if (!(gap > 0) && !included.size) return { items: [], missingPointId: null };
    const selected = [];
    let points = 0;
    for (const row of items) {
        const neededForTarget = points < gap;
        if (!neededForTarget && !included.has(String(row.id))) continue;
        const point = row.points;
        // Validate the target prefix and explicitly included extras, even after reaching the target.
        if (!Number.isFinite(point) || point < 0) return { items: [], missingPointId: row.id };
        selected.push(row);
        if (neededForTarget) points += point;
    }
    return { items: selected, missingPointId: null };
}

export function moveAchievementRecommendationGroup(groups, group, offset) {
    const from = groups.findIndex((entry) => entry.group === group);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= groups.length) return groups;
    const next = [...groups];
    next.splice(to, 0, next.splice(from, 1)[0]);
    return next;
}

export function removeAchievementRecommendationItem(groups, id) {
    return groups.map((group) => ({ ...group, ids: group.ids.filter((value) => String(value) !== String(id)) }))
        .filter((group) => group.ids.length);
}

export function achievementRecommendationPlace(group) {
    return /^bucket:\d+:((?:scene|map):.+)$/.exec(group)?.[1] || null;
}

export function arrangeAchievementRecommendationItems(items, recordsById, menus, originalGroupById) {
    const dungeonCategories = new Set(Object.values(menus || {})
        .filter((menu) => ACHIEVEMENT_RECOMMENDATION_DIRECTION_CATEGORIES.dungeon.includes(menu.name))
        .map((menu) => String(menu.sub ?? menu.id)));
    const dungeons = new Map();
    const blocks = [];
    const mapIds = (value) => [...new Set(String(value || "").split("|")
        .filter((id) => /^\d+$/.test(id) && Number(id) > 0))].sort((a, b) => Number(a) - Number(b)).join("|");
    items.forEach((item) => {
        const record = recordsById[item.id] || item;
        if (!dungeonCategories.has(String(record.category?.id))) {
            blocks.push([item]);
            return;
        }
        // Classification comes from the catalog, never from the presence of a scene group.
        // Keep the original location after dragging, including separate scene/map namespaces.
        const sceneId = mapIds(record.map?.sceneId);
        const worldMapId = mapIds(record.map?.worldMapId);
        const locationId = mapIds(record.map?.id);
        const place = achievementRecommendationPlace(originalGroupById[item.id] || item.recommendationGroup)
            || (sceneId ? `scene:${sceneId}` : worldMapId ? `map:${worldMapId}` : "")
            || (locationId ? `location:${locationId}` : `unknown:${item.id}`);
        // A dungeon creates a block at its first encounter, never at the front of the whole list.
        // Later achievements from that dungeon join it without grouping other achievements by map.
        if (!dungeons.has(place)) {
            const block = [];
            dungeons.set(place, block);
            blocks.push(block);
        }
        dungeons.get(place).push(item);
    });
    return blocks.flat();
}

export function moveAchievementRecommendationItem(groups, id, targetGroup, beforeId = null) {
    const source = groups.find((group) => group.ids.some((value) => String(value) === String(id)));
    const target = groups.find((group) => group.group === targetGroup);
    if (!source || !target) throw new Error("Unknown recommendation item or group");
    const value = source.ids.find((value) => String(value) === String(id));
    // Apply both sides together, so a cross-list drop never duplicates or temporarily loses an ID.
    return groups.map((group) => {
        const ids = group.ids.filter((value) => String(value) !== String(id));
        if (group.group === targetGroup) {
            const index = beforeId === null ? ids.length : ids.findIndex((value) => String(value) === String(beforeId));
            if (index < 0) throw new Error("Unknown recommendation insertion anchor");
            ids.splice(index, 0, value);
        }
        return { ...group, ids };
    }).filter((group) => group.ids.length);
}

export function filterAchievementRecommendationItems(items, filters) {
    const keyword = filters.keyword.trim().toLocaleLowerCase();
    const maps = new Set(filters.mapIds);
    return items.filter((item) => (!keyword || [item.name, item.shortDescription].filter(Boolean).join(" ").toLocaleLowerCase().includes(keyword)) &&
        (!maps.size || item.mapIds.some((id) => maps.has(id))) &&
        (!filters.categories.length || filters.categories.some(([category, detail]) =>
            item.category.id === category && (!detail || item.category.subId === detail))));
}

export function enrichAchievementRecommendationRecords(records, menus, maps) {
    const categoryNames = new Map();
    const detailNames = new Map();
    Object.values(menus || {}).forEach((menu) => {
        const sub = String(menu.sub ?? menu.id ?? "");
        categoryNames.set(sub, menu.name);
        (menu.children || []).forEach((child) => detailNames.set(`${sub}:${child.detail ?? child.id}`, child.name));
    });
    const mapNames = new Map(maps.map((map) => [String(map.id), map.name]));
    return records.map((item) => {
        const mapIds = [...new Set(String(item.map?.id || "").split("|").filter((id) => /^\d+$/.test(id) && Number(id) > 0))];
        return { ...item, mapIds,
            map: { ...item.map, name: mapIds.map((id) => mapNames.get(id)).filter(Boolean).join(" / ") || item.map?.name || "" },
            category: { ...item.category,
                name: categoryNames.get(item.category.id) || item.category.name || item.category.id,
                subName: detailNames.get(`${item.category.id}:${item.category.subId}`) || item.category.subName || item.category.subId,
            },
        };
    });
}

export function achievementRecommendationFilterOptions(items, maps) {
    const categories = new Map();
    const mapIds = new Set();
    items.forEach((item) => {
        item.mapIds.forEach((id) => mapIds.add(id));
        const category = item.category;
        if (!category.id) return;
        if (!categories.has(category.id)) categories.set(category.id, { value: category.id, label: category.name, children: [] });
        const children = categories.get(category.id).children;
        if (category.subId && !children.some((child) => child.value === category.subId)) {
            children.push({ value: category.subId, label: category.subName });
        }
    });
    return {
        categories: [...categories.values()].map((category) => category.children.length ? category : { value: category.value, label: category.label }),
        maps: [...mapIds].map((id) => ({ id, name: maps.find((map) => String(map.id) === id)?.name || id })),
    };
}

export function hydrateAchievementRecommendation(rows, records) {
    const byId = new Map(records.map((record) => [String(record.id), record]));
    return rows.map((row) => {
        const record = byId.get(row.id);
        if (!record) throw new Error(`Missing achievement details: ${row.id}`);
        return { ...record, ...row };
    });
}

export function achievementRecommendationPlanMetadata(items) {
    const groups = new Map();
    const restricted = [];
    items.forEach((item) => {
        if (!item.recommendationGroup) return;
        if (!groups.has(item.recommendationGroup)) groups.set(item.recommendationGroup, []);
        groups.get(item.recommendationGroup).push(item.id);
        if (item.campRestricted) restricted.push(item.id);
    });
    return {
        recommendationGroups: [...groups].map(([group, ids]) => ({ group, ids })),
        campRestrictedIds: restricted,
    };
}

export function buildAchievementRecommendationPlan({ items, recommendation, title, targetPoints, roleId, preferences }) {
    return {
        title: title.trim(), schema: items.map((item) => item.id), client: "std",
        meta: {
            createBy: "planner", roleId, targetPoints, generationMode: "recommended",
            strategy: "server-order", generatedStrategy: "server-order",
            recommendationVersion: recommendation.version, recommendationStage: recommendation.role.stage,
            recommendationCamp: recommendation.role.camp, recommendationPreferences: preferences,
            selectedPoints: items.reduce((sum, item) => sum + item.points, 0),
            ...achievementRecommendationPlanMetadata(items),
        },
    };
}

export function achievementRecommendationGroupLabel(group, maps, translate) {
    if (/^manual:\d+$/.test(group)) return translate("achievementRecommendation.manualGroup");
    const match = /^bucket:(\d+):(scene|map|direction):(.+)$/.exec(group);
    if (!match) return group;
    const [, bucket, kind, key] = match;
    const directionToken = `achievementRecommendation.directions.${key}`;
    const directionLabel = kind === "direction" ? translate(directionToken) : "";
    const place =
        kind === "direction"
            ? directionLabel === directionToken
                ? key
                : directionLabel
            : maps.find((map) => String(map.id) === key)?.name ||
              translate(`achievementRecommendation.${kind}`, { id: key });
    return translate("achievementRecommendation.groupLabel", { band: Number(bucket) + 1, place });
}
