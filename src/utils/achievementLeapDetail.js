import { buildAchievementLeapPlanProgress, filterAchievementLeapIds } from "@/utils/achievementLeap";
import { flattenAchievementRecommendation } from "@/utils/achievementRecommendation";

export function buildAchievementLeapDetailRoute(plan, items, metadata, completedIds, currentPoints) {
    const regularIds = new Set(filterAchievementLeapIds(plan.schema, metadata));
    const recommendationItems = new Map(flattenAchievementRecommendation({
        recommendations: plan.meta?.recommendationGroups || [],
        camp_restricted_ids: plan.meta?.campRestrictedIds || [],
    }).map((item) => [item.id, item]));
    items = items.filter((item) => regularIds.has(String(item.id)))
        .map((item) => ({ ...item, ...recommendationItems.get(String(item.id)) }));
    const progress = buildAchievementLeapPlanProgress(plan, metadata, completedIds);
    const incomplete = items.filter((item) => !item.completed);
    const targetPoints = Number(plan.meta?.targetPoints) || currentPoints + progress.remainingPoints;
    const hasMinutes = incomplete.length > 0 && incomplete.every((item) => item.estimatedMinutes !== null);
    const hasDifficulty = incomplete.length > 0 && incomplete.every((item) => item.difficulty !== null);
    return {
        items,
        generationMode: plan.meta?.generationMode || "custom",
        recommendationVersion: plan.meta?.recommendationVersion || null,
        recommendationStage: plan.meta?.recommendationStage || null,
        recommendationCamp: plan.meta?.recommendationCamp || null,
        recommendationPreferences: plan.meta?.recommendationPreferences || null,
        requestedStrategy: plan.meta?.strategy || "big-first",
        strategy: plan.meta?.generatedStrategy || plan.meta?.strategy || "big-first",
        currentPoints: currentPoints,
        targetPoints,
        targetGap: Math.max(0, targetPoints - currentPoints),
        selectedPoints: progress.remainingPoints,
        projectedPoints: currentPoints + progress.remainingPoints,
        remainingGap: Math.max(0, targetPoints - currentPoints - progress.remainingPoints),
        reached: currentPoints + progress.remainingPoints >= targetPoints,
        totalMinutes: hasMinutes
            ? incomplete.reduce((total, item) => total + Number(item.estimatedMinutes), 0)
            : null,
        averageDifficulty: hasDifficulty
            ? Number(
                  (
                      incomplete.reduce((total, item) => total + Number(item.difficulty), 0) /
                      incomplete.length
                  ).toFixed(2)
              )
            : null,
        averageCostScore: null,
    };
}
