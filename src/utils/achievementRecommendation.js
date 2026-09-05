// The server owns eligibility and ordering. Detail queries must not change either.
export function defaultAchievementRecommendationOptions() {
    return { categoryIds: null, dimensionWeights: {}, directionWeights: {} };
}

export function achievementRecommendationPreferences(options, categories) {
    return {
        ...(options.categoryIds === null ? {} : {
            category_ids: [...new Set(categories.filter((category) => options.categoryIds.includes(category.id))
                .flatMap((category) => category.sourceIds).map(Number))],
        }),
        dimension_weights: { ...options.dimensionWeights },
        direction_weights: { ...options.directionWeights },
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

export function selectAchievementRecommendationItems(items, currentPoints, targetPoints) {
    const gap = Number(targetPoints) - currentPoints;
    if (!(gap > 0)) return [];
    const selected = [];
    let points = 0;
    for (const row of items) {
        if (points >= gap) break;
        const point = row.points;
        if (!Number.isFinite(point) || point < 0) throw new Error(`Missing achievement points: ${row.id}`);
        selected.push(row);
        points += point;
    }
    return selected;
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
    return items.filter((item) => (!keyword || (item.name || "").toLocaleLowerCase().includes(keyword)) &&
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
