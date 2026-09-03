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
const schoolEligibility = loadModule(
    path.resolve(__dirname, "../src/utils/achievementSchoolEligibility.js"),
    { "@/utils/achievementStatistics": "achievement-statistics-test-module" },
    { "achievement-statistics-test-module": statistics }
);
const leap = loadModule(
    path.resolve(__dirname, "../src/utils/achievementLeap.js"),
    {
        "@/utils/achievementStatistics": "achievement-statistics-test-module",
        "@/utils/achievementSchoolEligibility": "achievement-school-eligibility-test-module",
    },
    {
        "achievement-statistics-test-module": statistics,
        "achievement-school-eligibility-test-module": schoolEligibility,
    }
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

const schoolMenus = {
    task: {
        sub: "task",
        name: "任务",
        children: [
            { name: "天策任务", achievements: [11] },
            { name: "万花任务", achievements: [12] },
            { name: "任务基础", achievements: [13] },
        ],
    },
    martial: {
        sub: "martial",
        name: "武学",
        children: [
            { name: "天策招式", achievements: [14] },
            { name: "万花招式", achievements: [15] },
            { name: "无相楼招式", achievements: [16] },
            { name: "轻功学习", achievements: [17] },
        ],
    },
    journey: {
        sub: "journey",
        name: "风雨江湖路",
        children: [
            { name: "第二幕", achievements: [3028, 3025] },
            { name: "第三幕", achievements: [18] },
        ],
    },
};
const schoolMetadata = Object.fromEntries(
    [11, 12, 13, 14, 15, 16, 17, 18, 3025, 3028].map((id) => [
        String(id),
        { point: 10, general: 1, visible: true },
    ])
);
const tianCeEligibility = schoolEligibility.buildAchievementSchoolEligibilityContext({
    menus: schoolMenus,
    roleSchool: "傲血战意",
});
assert.strictEqual(tianCeEligibility.school, "天策");
assert.strictEqual(schoolEligibility.normalizeAchievementRoleSchool("1"), "天策");
assert.strictEqual(schoolEligibility.normalizeAchievementRoleSchool("10026"), "天策");
assert.strictEqual(
    schoolEligibility.isAchievementEligibleForSchool({ id: 11, context: tianCeEligibility }),
    true
);
assert.strictEqual(
    schoolEligibility.isAchievementEligibleForSchool({ id: 12, context: tianCeEligibility }),
    false
);
assert.strictEqual(
    schoolEligibility.isAchievementEligibleForSchool({ id: 16, context: tianCeEligibility }),
    true
);
assert.strictEqual(
    schoolEligibility.isAchievementEligibleForSchool({ id: 3025, context: tianCeEligibility }),
    false
);
assert.deepStrictEqual(
    leap
        .buildAchievementLeapCandidates({
            metadata: schoolMetadata,
            menus: schoolMenus,
            schoolEligibility: tianCeEligibility,
        })
        .map((item) => item.id),
    ["11", "13", "14", "16", "17", "18", "3028"]
);
assert.deepStrictEqual(
    leap
        .buildAchievementLeapCategoryOptions(schoolMenus, schoolMetadata, [], {
            schoolEligibility: tianCeEligibility,
        })
        .map((item) => [item.name, item.incompleteCount]),
    [
        ["任务", 2],
        ["武学", 3],
        ["风雨江湖路", 2],
    ]
);
assert.deepStrictEqual(
    leap
        .buildAchievementLeapCandidates({
            metadata: schoolMetadata,
            menus: schoolMenus,
            records: [{ id: "12", restriction: { school: "天策" } }],
            allowedIds: [12],
            schoolEligibility: tianCeEligibility,
        })
        .map((item) => item.id),
    ["12"]
);
assert.strictEqual(
    schoolEligibility.isAchievementEligibleForSchool({
        id: 12,
        record: { restriction: { school: "不限" } },
        context: tianCeEligibility,
    }),
    true
);

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

const routeAfterAddition = leap.addAchievementLeapRouteItem(routeAfterRemoval, allCandidates.find((item) => item.id === "4"));
assert.deepStrictEqual(routeAfterAddition.items.map((item) => item.id), ["2", "4"]);
assert.strictEqual(routeAfterAddition.selectedPoints, 60);
assert.strictEqual(routeAfterAddition.projectedPoints, 160);
assert.strictEqual(routeAfterAddition.reached, true);
assert.strictEqual(
    leap.addAchievementLeapRouteItem(routeAfterAddition, allCandidates.find((item) => item.id === "4")),
    routeAfterAddition
);

const stageExpectations = [
    [0, "newbie"],
    [29999, "newbie"],
    [30000, "growth"],
    [75000, "sprint"],
    [100000, "tribulation"],
];
stageExpectations.forEach(([points, stage]) => {
    const profile = leap.resolveAchievementLeapStage(points);
    assert.strictEqual(profile.key, stage);
    assert.strictEqual(
        Object.values(profile.weights).reduce((total, weight) => total + weight, 0),
        100
    );
});

const recommendation = leap.buildAchievementLeapRecommendation({
    candidates: allCandidates,
    currentPoints: 10000,
    schoolEligibility: tianCeEligibility,
});
assert.strictEqual(recommendation.version, "stage-v1");
assert.strictEqual(recommendation.schoolEligibilityVersion, "school-v1");
assert.strictEqual(recommendation.roleSchool, "天策");
assert.strictEqual(recommendation.stageKey, "newbie");
assert.strictEqual(recommendation.strategy, "easy-first");
assert.strictEqual(recommendation.maxDifficulty, 2);
assert.deepStrictEqual(recommendation.categories.map((item) => item.name), ["秘境", "江湖"]);
assert.deepStrictEqual(recommendation.categoryIds, ["b", "a"]);
assert.strictEqual(recommendation.availableDimensionCount, 5);
assert.strictEqual(recommendation.totalDimensionCount, 6);

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
