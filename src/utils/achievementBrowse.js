import { buildAchievementCategoryProgress, buildAchievementOverallProgress } from "@/utils/achievementProgress";

// Merge directory aliases by their display names while retaining every filter path.
export function buildAchievementBrowseCategories({ menus, metadata, completedIds, ids, allLabel }) {
    const available = new Set(ids.map(String));
    const roots = new Map();
    const summarize = (achievementIds) =>
        buildAchievementOverallProgress(
            Object.fromEntries([...new Set(achievementIds)].map((id) => [id, metadata[id]])),
            completedIds
        );
    const progress = buildAchievementCategoryProgress({ menus, metadata, completedIds });
    for (const category of progress) {
        if (!category.achievementIds.some((id) => available.has(id))) continue;
        if (!roots.has(category.name))
            roots.set(category.name, { ...category, achievementIds: [], paths: [], childrenByName: new Map() });
        const root = roots.get(category.name);
        root.achievementIds.push(...category.achievementIds);
        root.paths.push([category.subId]);
        for (const child of category.children) {
            if (!child.achievementIds.some((id) => available.has(id))) continue;
            if (!root.childrenByName.has(child.name))
                root.childrenByName.set(child.name, { ...child, achievementIds: [], paths: [] });
            const merged = root.childrenByName.get(child.name);
            merged.achievementIds.push(...child.achievementIds);
            merged.paths.push([child.subId, child.detailId]);
        }
    }
    const categories = [...roots.values()].map(({ childrenByName, ...root }) => ({
        ...root,
        ...summarize(root.achievementIds),
        children: [...childrenByName.values()].map((child) => ({ ...child, ...summarize(child.achievementIds) })),
    }));
    return [
        {
            id: "all",
            name: allLabel,
            children: [],
            paths: [],
            ...summarize(progress.flatMap((category) => category.achievementIds)),
        },
        ...categories,
    ];
}
