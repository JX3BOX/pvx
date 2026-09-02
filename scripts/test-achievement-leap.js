const assert = require("assert");
const path = require("path");
const babel = require("@babel/core");

function loadModule(file, aliases = {}, injectedModules = {}) {
    const result = babel.transformFileSync(file, {
        babelrc: false,
        configFile: false,
        plugins: [
            function resolveAliases() {
                return {
                    visitor: {
                        ImportDeclaration(importPath) {
                            const replacement = aliases[importPath.node.source.value];
                            if (replacement) importPath.node.source.value = replacement;
                        },
                    },
                };
            },
        ],
        presets: [[require.resolve("@babel/preset-env"), { targets: { node: "current" } }]],
    });
    const loadedModule = { exports: {} };
    const localRequire = (request) => injectedModules[request] || require(request);
    new Function("module", "exports", "require", result.code)(loadedModule, loadedModule.exports, localRequire);
    return loadedModule.exports;
}

const statistics = loadModule(path.resolve(__dirname, "../src/utils/achievementStatistics.js"));
const leap = loadModule(
    path.resolve(__dirname, "../src/utils/achievementLeap.js"),
    { "@/utils/achievementStatistics": "achievement-statistics-test-module" },
    { "achievement-statistics-test-module": statistics }
);

const metadata = {
    1: { point: 0, general: 1, visible: true },
    2: { point: 20, general: 1, visible: true },
    3: { point: 30, general: 1, visible: true },
    4: { point: 40, general: 1, visible: true },
};
const menus = {
    a: { sub: "a", name: "江湖", achievements: [1, 2] },
    b: { sub: "b", name: "秘境", children: [{ detail: "b-1", name: "首领", achievements: [3, 4] }] },
};

const normalizedPlan = leap.normalizeAchievementLeapPlan({
    id: 8,
    title: " 冲刺方案 ",
    schema: [1, "1", 2],
    meta: JSON.stringify({ targetPoints: 100000 }),
    is_official: 0,
});
assert.deepStrictEqual(normalizedPlan.schema, ["1", "2"]);
assert.strictEqual(normalizedPlan.title, "冲刺方案");
assert.strictEqual(normalizedPlan.meta.targetPoints, 100000);
assert.strictEqual(normalizedPlan.official, false);

const categoryMenus = {
    ...menus,
    c: { sub: "c", name: "江湖", achievements: [5] },
};
const categoryMetadata = {
    ...metadata,
    5: { point: 15, general: 2, visible: false },
};
const categories = leap.buildAchievementLeapCategoryOptions(categoryMenus, categoryMetadata, [2, 4]);
assert.deepStrictEqual(
    categories.map((item) => [item.id, item.sourceIds, item.count, item.incompleteCount, item.points]),
    [["b", ["b"], 2, 1, 70]]
);
assert.deepStrictEqual(
    leap.buildAchievementLeapCategoryOptions(categoryMenus, categoryMetadata, [4]).map((item) => item.id),
    ["a", "b"]
);

const mergedCategoryCandidates = leap.buildAchievementLeapCandidates({
    metadata: categoryMetadata,
    menus: categoryMenus,
    completedIds: [2],
    categoryIds: ["a"],
});
assert.deepStrictEqual(mergedCategoryCandidates.map((item) => item.id), []);
assert.deepStrictEqual(leap.filterAchievementLeapIds([2, 5], categoryMetadata), ["2"]);

const records = [
    { id: "2", name: "二", difficulty: 2, estimatedMinutes: null, cost: { money: 1, time: 1, luck: 1 } },
    { id: "3", name: "三", difficulty: 1, estimatedMinutes: null, cost: { money: null, time: null, luck: null } },
    { id: "4", name: "四", difficulty: 4, estimatedMinutes: null, cost: { money: 1, time: 1, luck: 1 } },
];
const candidates = leap.buildAchievementLeapCandidates({
    metadata,
    menus,
    completedIds: [1],
    records,
    categoryIds: ["b"],
    maxDifficulty: 3,
    enforceDifficulty: true,
});
assert.deepStrictEqual(candidates.map((item) => item.id), ["3"]);
assert.strictEqual(candidates[0].costScore, null);

const allCandidates = leap.buildAchievementLeapCandidates({ metadata, menus, completedIds: [1], records });
assert.ok(allCandidates.every((item) => item.points > 0));
const route = leap.buildAchievementLeapRoute({
    candidates: allCandidates,
    currentPoints: 100,
    targetPoints: 145,
    strategy: "easy-first",
});
assert.deepStrictEqual(route.items.map((item) => item.id), ["3", "2"]);
assert.strictEqual(route.selectedPoints, 50);
assert.strictEqual(route.projectedPoints, 150);
assert.strictEqual(route.reached, true);
assert.strictEqual(route.totalMinutes, null);
assert.strictEqual(route.averageDifficulty, 1.5);

const routeAfterRemoval = leap.removeAchievementLeapRouteItem(route, "3");
assert.deepStrictEqual(routeAfterRemoval.items.map((item) => item.id), ["2"]);
assert.strictEqual(routeAfterRemoval.selectedPoints, 20);
assert.strictEqual(routeAfterRemoval.projectedPoints, 120);
assert.strictEqual(routeAfterRemoval.remainingGap, 25);
assert.strictEqual(routeAfterRemoval.reached, false);
assert.strictEqual(routeAfterRemoval.averageDifficulty, 2);
assert.strictEqual(routeAfterRemoval.averageCostScore, 5);

const fallback = leap.buildAchievementLeapRoute({
    candidates: allCandidates.map((item) => ({ ...item, difficulty: null })),
    currentPoints: 0,
    targetPoints: 35,
    strategy: "easy-first",
});
assert.strictEqual(fallback.strategy, "big-first");
assert.deepStrictEqual(fallback.items.map((item) => item.id), ["4"]);

const progress = leap.buildAchievementLeapPlanProgress({ schema: [1, 2, 3, 5] }, categoryMetadata, [1, 3, 5]);
assert.deepStrictEqual(progress, {
    count: 3,
    totalPoints: 50,
    completedPoints: 30,
    remainingPoints: 20,
    completedCount: 2,
    progress: 60,
});

console.log("Achievement leap tests passed.");
