const assert = require("assert");
const path = require("path");
const babel = require("@babel/core");
const fireworkAchievementIds = require("@jx3box/jx3box-common/data/firework_achievement_ids.json");

function loadModule(file) {
    const result = babel.transformFileSync(file, {
        babelrc: false,
        configFile: false,
        presets: [[require.resolve("@babel/preset-env"), { targets: { node: "current" } }]],
    });
    const loadedModule = { exports: {} };
    const evaluate = new Function("module", "exports", "require", result.code);
    evaluate(loadedModule, loadedModule.exports, require);
    return loadedModule.exports;
}

const statisticsModule = loadModule(path.resolve(__dirname, "../src/utils/achievementStatistics.js"));
const {
    FIREWORK_ACHIEVEMENT_IDS,
    buildAchievementOverview,
    collectMenuAchievementIds,
    createAchievementPointMap,
    normalizeAchievementMetadata,
    normalizeCompletedAchievementIds,
    selectMenuRootsByGeneral,
} = statisticsModule;

assert.strictEqual(FIREWORK_ACHIEVEMENT_IDS.length, 65);
assert.strictEqual(new Set(FIREWORK_ACHIEVEMENT_IDS).size, 65);
assert.deepStrictEqual(FIREWORK_ACHIEVEMENT_IDS, fireworkAchievementIds);
assert.strictEqual(FIREWORK_ACHIEVEMENT_IDS.includes(1573), true);
assert.strictEqual(FIREWORK_ACHIEVEMENT_IDS.includes(1707), false);
assert.strictEqual(FIREWORK_ACHIEVEMENT_IDS.includes(4493), false);

const allFireworksMetadata = normalizeAchievementMetadata(
    Object.fromEntries(FIREWORK_ACHIEVEMENT_IDS.map((id) => [id, [200, 1, 1]]))
);
const allFireworksOverview = buildAchievementOverview({
    metadata: allFireworksMetadata,
    completedAchievementIds: FIREWORK_ACHIEVEMENT_IDS,
});
const allFireworksSummary = allFireworksOverview.categories.find((item) => item.key === "fireworks");
assert.strictEqual(allFireworksSummary.totalCount, 65);
assert.strictEqual(allFireworksSummary.completedCount, 65);
assert.strictEqual(allFireworksSummary.totalPoints, 13000);
assert.strictEqual(allFireworksSummary.completedPoints, 13000);

const rawPoints = {
    1: [20, 1, 1],
    2: [30, 1, 1],
    3: [40, 2, 1],
    4: [50, 1, 0],
    5: [60, 2, 0],
    6: [70, 0, 0],
    7: [0, 3, 1],
    8: [0, 1, 0],
    9: [10, "unknown", 1],
    10: [500, 3, 1],
    4444: [200, 1, 1],
    invalid: [10, 1],
    invalidVisible: [10, 1, 2],
    negative: [-10, 1, 1],
    infinite: [Infinity, 1, 1],
};
const menus = {
    regular: {
        achievements: [1, [2, [[4444]]], 1],
        children: [{ achievements: [] }],
    },
    wujia: {
        achievements: [],
        children: [{ achievements: [[[3]]] }],
    },
};
const metadata = normalizeAchievementMetadata(rawPoints);

assert.deepStrictEqual([...collectMenuAchievementIds(menus)].sort(), ["1", "2", "3", "4444"]);
assert.deepStrictEqual([...normalizeCompletedAchievementIds("1, 4,,5 ")], ["1", "4", "5"]);
assert.deepStrictEqual(createAchievementPointMap(metadata), {
    1: 20,
    2: 30,
    3: 40,
    4: 50,
    5: 60,
    6: 70,
    7: 0,
    8: 0,
    9: 10,
    10: 500,
    4444: 200,
});
assert.strictEqual(metadata["9"].general, null);
assert.strictEqual(metadata.invalidVisible, undefined);
assert.strictEqual(metadata.negative, undefined);
assert.strictEqual(metadata.infinite, undefined);
assert.deepStrictEqual(Object.keys(selectMenuRootsByGeneral(menus, metadata, 1)), ["regular"]);
assert.deepStrictEqual(Object.keys(selectMenuRootsByGeneral(menus, metadata, 2)), ["wujia"]);

const overview = buildAchievementOverview({
    metadata,
    completedAchievementIds: [1, 4, 5, 6, 7, 8, 10, 4444, 4444, "missing"],
});
const groups = Object.fromEntries(overview.categories.map((item) => [item.key, item]));

assert.deepStrictEqual(overview.overall, {
    key: "overall",
    completedCount: 8,
    completedPoints: 900,
    remainingCount: 2,
    remainingPoints: 70,
    totalCount: 10,
    totalPoints: 970,
    countProgress: 80,
    pointProgress: 92.78,
    obtainableRemainingCount: 2,
    obtainableRemainingPoints: 70,
    hidden: {
        completedCount: 4,
        completedPoints: 180,
        remainingCount: 0,
        remainingPoints: 0,
        totalCount: 4,
        totalPoints: 180,
        countProgress: 100,
        pointProgress: 100,
    },
});
assert.deepStrictEqual(groups.regular, {
    key: "regular",
    completedCount: 2,
    completedPoints: 220,
    remainingCount: 1,
    remainingPoints: 30,
    totalCount: 3,
    totalPoints: 250,
    countProgress: 66.67,
    pointProgress: 88,
});
assert.strictEqual(groups.wujia.totalPoints, 40);
assert.strictEqual(groups.wujia.completedPoints, 0);
assert.strictEqual(groups.wujia.countProgress, 0);
assert.strictEqual(groups.wujia.pointProgress, 0);
assert.strictEqual(groups.regularHidden.totalPoints, 50);
assert.strictEqual(groups.regularHidden.completedPoints, 50);
assert.strictEqual(groups.regularHidden.totalCount, 2);
assert.strictEqual(groups.regularHidden.completedCount, 2);
assert.strictEqual(groups.regularHidden.hiddenGroup, true);
assert.strictEqual(groups.wujiaHidden.totalPoints, 60);
assert.strictEqual(groups.wujiaHidden.completedPoints, 60);
assert.strictEqual(groups.wujiaHidden.hiddenGroup, true);
assert.strictEqual(groups.fireworks.totalCount, 1);
assert.strictEqual(groups.fireworks.completedPoints, 200);
assert.strictEqual(groups.fireworks.includedIn, "regular");
assert.strictEqual(groups.retired.totalCount, 1);
assert.strictEqual(groups.retired.completedCount, 1);
assert.strictEqual(groups.retired.totalPoints, 70);
assert.strictEqual(groups.retired.completedPoints, 70);
assert.strictEqual(groups.retired.hiddenGroup, true);
assert.strictEqual(groups.retired.retiredGroup, true);
assert.deepStrictEqual(overview.retiredSeniority, {
    completedCount: 1,
    completedPoints: 70,
    remainingCount: 0,
    remainingPoints: 0,
    totalCount: 1,
    totalPoints: 70,
    countProgress: 100,
    pointProgress: 100,
});
assert.deepStrictEqual(overview.specialAchievements, {
    completedCount: 2,
    completedPoints: 500,
    remainingCount: 0,
    remainingPoints: 0,
    totalCount: 2,
    totalPoints: 500,
    countProgress: 100,
    pointProgress: 100,
});
assert.strictEqual(overview.diagnostics.unknownCompletedCount, 1);
assert.strictEqual(overview.diagnostics.sourceGeneralThreeCount, 2);
assert.strictEqual(overview.diagnostics.sourceZeroPointCount, 2);
assert.strictEqual(overview.diagnostics.includedZeroPointCount, 2);
assert.strictEqual(overview.diagnostics.retiredAchievementCount, 1);
assert.strictEqual(overview.diagnostics.specialAchievementCount, 2);
assert.strictEqual(overview.diagnostics.excludedInvalidGeneralCount, 1);
assert.strictEqual(
    groups.regular.completedPoints +
        groups.regularHidden.completedPoints +
        groups.wujia.completedPoints +
        groups.wujiaHidden.completedPoints +
        overview.retiredSeniority.completedPoints +
        overview.specialAchievements.completedPoints,
    overview.overall.completedPoints
);

const visibleOverview = buildAchievementOverview({
    metadata,
    completedAchievementIds: [1, 4, 5, 6, 7, 8, 10, 4444],
    includeHidden: false,
});
assert.deepStrictEqual(visibleOverview.overall, {
    key: "overall",
    completedCount: 4,
    completedPoints: 720,
    remainingCount: 2,
    remainingPoints: 70,
    totalCount: 6,
    totalPoints: 790,
    countProgress: 66.67,
    pointProgress: 91.14,
    obtainableRemainingCount: 2,
    obtainableRemainingPoints: 70,
    hidden: {
        completedCount: 0,
        completedPoints: 0,
        remainingCount: 0,
        remainingPoints: 0,
        totalCount: 0,
        totalPoints: 0,
        countProgress: null,
        pointProgress: null,
    },
});
assert.strictEqual(visibleOverview.scope.includeHidden, false);
assert.deepStrictEqual(visibleOverview.retiredSeniority, {
    completedCount: 0,
    completedPoints: 0,
    remainingCount: 0,
    remainingPoints: 0,
    totalCount: 0,
    totalPoints: 0,
    countProgress: null,
    pointProgress: null,
});
const visibleGroups = Object.fromEntries(visibleOverview.categories.map((item) => [item.key, item]));
assert.strictEqual(visibleGroups.regularHidden.totalPoints, 50);
assert.strictEqual(visibleGroups.wujiaHidden.totalPoints, 60);
assert.strictEqual(visibleGroups.retired.totalPoints, 70);

const zeroPointOverview = buildAchievementOverview({
    metadata: normalizeAchievementMetadata({ 7: [0, 3, 1] }),
    completedAchievementIds: [7],
});
assert.strictEqual(zeroPointOverview.overall.pointProgress, null);
assert.strictEqual(zeroPointOverview.overall.countProgress, 100);
assert.strictEqual(zeroPointOverview.overall.totalCount, 1);
assert.strictEqual(zeroPointOverview.overall.completedCount, 1);
assert.deepStrictEqual(zeroPointOverview.retiredSeniority, {
    completedCount: 0,
    completedPoints: 0,
    remainingCount: 0,
    remainingPoints: 0,
    totalCount: 0,
    totalPoints: 0,
    countProgress: null,
    pointProgress: null,
});
assert.strictEqual(zeroPointOverview.specialAchievements.totalCount, 1);
assert.strictEqual(zeroPointOverview.specialAchievements.completedCount, 1);

const zeroPointFireworkId = FIREWORK_ACHIEVEMENT_IDS[0];
const zeroPointFireworkOverview = buildAchievementOverview({
    metadata: normalizeAchievementMetadata({ [zeroPointFireworkId]: [0, 1, 1] }),
    completedAchievementIds: [zeroPointFireworkId],
});
const zeroPointFireworkSummary = zeroPointFireworkOverview.categories.find((item) => item.key === "fireworks");
assert.strictEqual(zeroPointFireworkSummary.totalCount, 1);
assert.strictEqual(zeroPointFireworkSummary.completedCount, 1);
assert.strictEqual(zeroPointFireworkSummary.totalPoints, 0);
assert.strictEqual(zeroPointFireworkSummary.countProgress, 100);
assert.strictEqual(zeroPointFireworkSummary.pointProgress, null);

const zeroPointRemainingOverview = buildAchievementOverview({
    metadata: normalizeAchievementMetadata({ 11: [0, 1, 1] }),
    completedAchievementIds: [],
});
assert.strictEqual(zeroPointRemainingOverview.overall.totalCount, 1);
assert.strictEqual(zeroPointRemainingOverview.overall.completedCount, 0);
assert.strictEqual(zeroPointRemainingOverview.overall.remainingCount, 1);
assert.strictEqual(zeroPointRemainingOverview.overall.obtainableRemainingCount, 1);
assert.strictEqual(zeroPointRemainingOverview.overall.obtainableRemainingPoints, 0);
assert.strictEqual(zeroPointRemainingOverview.overall.countProgress, 0);
assert.strictEqual(zeroPointRemainingOverview.overall.pointProgress, null);

const categorizedZeroPointMetadata = normalizeAchievementMetadata({
    11: [0, 1, 1],
    12: [0, 1, 0],
    13: [0, 2, 1],
    14: [0, 2, 0],
    15: [0, 0, 0],
    16: [10, 0, 0],
});
const categorizedZeroPointOverview = buildAchievementOverview({
    metadata: categorizedZeroPointMetadata,
    completedAchievementIds: [11, 12, 13, 14, 15, 16],
});
const categorizedZeroPointGroups = Object.fromEntries(
    categorizedZeroPointOverview.categories.map((item) => [item.key, item])
);

assert.strictEqual(categorizedZeroPointOverview.overall.totalCount, 6);
assert.strictEqual(categorizedZeroPointOverview.overall.completedCount, 6);
assert.strictEqual(categorizedZeroPointOverview.overall.totalPoints, 10);
assert.strictEqual(categorizedZeroPointOverview.overall.completedPoints, 10);
assert.strictEqual(categorizedZeroPointOverview.overall.countProgress, 100);
assert.strictEqual(categorizedZeroPointOverview.overall.pointProgress, 100);
assert.strictEqual(categorizedZeroPointGroups.regular.totalCount, 1);
assert.strictEqual(categorizedZeroPointGroups.regularHidden.totalCount, 1);
assert.strictEqual(categorizedZeroPointGroups.wujia.totalCount, 1);
assert.strictEqual(categorizedZeroPointGroups.wujiaHidden.totalCount, 1);
assert.deepStrictEqual(categorizedZeroPointOverview.retiredSeniority, {
    completedCount: 2,
    completedPoints: 10,
    remainingCount: 0,
    remainingPoints: 0,
    totalCount: 2,
    totalPoints: 10,
    countProgress: 100,
    pointProgress: 100,
});
assert.strictEqual(categorizedZeroPointOverview.diagnostics.sourceZeroPointCount, 5);
assert.strictEqual(categorizedZeroPointOverview.diagnostics.includedZeroPointCount, 5);
assert.strictEqual(categorizedZeroPointOverview.diagnostics.retiredAchievementCount, 2);

const visibleCategorizedZeroPointOverview = buildAchievementOverview({
    metadata: categorizedZeroPointMetadata,
    completedAchievementIds: [11, 12, 13, 14, 15, 16],
    includeHidden: false,
});
assert.strictEqual(visibleCategorizedZeroPointOverview.overall.totalCount, 2);
assert.strictEqual(visibleCategorizedZeroPointOverview.overall.completedCount, 2);
assert.strictEqual(visibleCategorizedZeroPointOverview.overall.countProgress, 100);
assert.strictEqual(visibleCategorizedZeroPointOverview.overall.totalPoints, 0);
assert.strictEqual(visibleCategorizedZeroPointOverview.overall.pointProgress, null);
assert.strictEqual(visibleCategorizedZeroPointOverview.retiredSeniority.totalCount, 0);
assert.strictEqual(visibleCategorizedZeroPointOverview.retiredSeniority.completedCount, 0);

const retiredMetadata = normalizeAchievementMetadata({
    1: [20, 1, 1],
    2: [30, 1, 1],
    3: [40, 1, 0],
    4: [7, 0, 0],
    5: [11, 0, 0],
    6: [0, 0, 0],
    7: [500, 3, 1],
});
const retiredOverview = buildAchievementOverview({
    metadata: retiredMetadata,
    completedAchievementIds: [1, 3, 4, 4, 6, 7],
});
assert.strictEqual(retiredOverview.overall.totalCount, 7);
assert.strictEqual(retiredOverview.overall.completedCount, 5);
assert.strictEqual(retiredOverview.overall.totalPoints, 608);
assert.strictEqual(retiredOverview.overall.completedPoints, 567);
assert.strictEqual(retiredOverview.overall.remainingPoints, 41);
assert.strictEqual(retiredOverview.overall.obtainableRemainingPoints, 30);
assert.strictEqual(retiredOverview.overall.pointProgress, 93.26);
assert.deepStrictEqual(retiredOverview.retiredSeniority, {
    completedCount: 2,
    completedPoints: 7,
    remainingCount: 1,
    remainingPoints: 11,
    totalCount: 3,
    totalPoints: 18,
    countProgress: 66.67,
    pointProgress: 38.89,
});

const visibleRetiredOverview = buildAchievementOverview({
    metadata: retiredMetadata,
    completedAchievementIds: [1, 3, 4, 4, 6, 7],
    includeHidden: false,
});
assert.strictEqual(visibleRetiredOverview.overall.totalCount, 3);
assert.strictEqual(visibleRetiredOverview.overall.completedCount, 2);
assert.strictEqual(visibleRetiredOverview.overall.totalPoints, 550);
assert.strictEqual(visibleRetiredOverview.overall.completedPoints, 520);
assert.strictEqual(visibleRetiredOverview.overall.remainingPoints, 30);
assert.strictEqual(visibleRetiredOverview.overall.pointProgress, 94.55);
assert.deepStrictEqual(visibleRetiredOverview.retiredSeniority, {
    completedCount: 0,
    completedPoints: 0,
    remainingCount: 0,
    remainingPoints: 0,
    totalCount: 0,
    totalPoints: 0,
    countProgress: null,
    pointProgress: null,
});

const fireworksGuard = buildAchievementOverview({
    metadata: normalizeAchievementMetadata({
        1573: [200, 1, 1],
        4444: [200, 1, 1],
        4495: [200, 2, 1],
        4493: [200, 1, 1],
    }),
    completedAchievementIds: [1573, 4444, 4495, 4493],
});
assert.strictEqual(fireworksGuard.overall.totalCount, 4);
assert.strictEqual(fireworksGuard.categories.find((item) => item.key === "fireworks").totalCount, 2);

console.log("achievement statistics tests passed");
