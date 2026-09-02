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
    const evaluate = new Function("module", "exports", "require", result.code);
    evaluate(loadedModule, loadedModule.exports, localRequire);
    return loadedModule.exports;
}

const statisticsModule = loadModule(path.resolve(__dirname, "../src/utils/achievementStatistics.js"));
const progress = loadModule(
    path.resolve(__dirname, "../src/utils/achievementProgress.js"),
    {
        "@/utils/achievementStatistics": "achievement-statistics-test-module",
    },
    {
        "achievement-statistics-test-module": statisticsModule,
    }
);

const metadata = {
    1: { point: 20, general: 1, visible: true },
    2: { point: 0, general: 1, visible: false },
    3: { point: 40, general: 2, visible: true },
    4: { point: 50, general: 2, visible: false },
    5: { point: 60, general: 0, visible: false },
    6: { point: 10, general: 3, visible: true },
};
const menus = {
    journey: {
        sub: 10,
        name: "足迹",
        achievements: [],
        children: [
            { sub: 10, detail: 101, name: "行走江湖", achievements: [1] },
            { sub: 10, detail: 102, name: "江湖见闻", achievements: [2] },
        ],
    },
    dungeon: { sub: 20, name: "秘境", achievements: [3, [4]], children: [] },
    ranking: { sub: 30, name: "个人江湖排名", achievements: [6], children: [] },
    retired: { sub: 40, name: "绝版", achievements: [5], children: [] },
};

const overall = progress.buildAchievementOverallProgress(metadata, [1, 4, 5]);
assert.strictEqual(overall.totalCount, 6);
assert.strictEqual(overall.completedCount, 3);
assert.strictEqual(overall.totalPoints, 180);
assert.strictEqual(overall.completedPoints, 130);
assert.strictEqual(overall.pointProgress, 72.22);

const tiers = Object.fromEntries(
    progress.buildAchievementTierProgress(metadata, [1, 4, 5]).map((item) => [item.key, item])
);
assert.strictEqual(tiers.normal.totalCount, 2);
assert.strictEqual(tiers.normal.completedCount, 1);
assert.strictEqual(tiers.hidden.totalCount, 2);
assert.strictEqual(tiers.hidden.completedPoints, 50);
assert.strictEqual(tiers.wujia.totalPoints, 40);
assert.strictEqual(tiers.retired.completedCount, 1);

const categories = progress.buildAchievementCategoryProgress({ menus, metadata, completedIds: [1, 4] });
assert.deepStrictEqual(
    categories.map((item) => [item.id, item.name, item.totalCount, item.completedCount]),
    [["10", "足迹", 2, 1]]
);
assert.deepStrictEqual(
    categories[0].children.map((item) => [item.id, item.parentId, item.name, item.totalCount]),
    [
        ["10:101", "10", "行走江湖", 1],
        ["10:102", "10", "江湖见闻", 1],
    ]
);

assert.deepStrictEqual(progress.filterAchievementIds({ metadata, completedIds: [1, 4, 5], completion: "incomplete" }), [
    "2",
    "3",
    "6",
]);
assert.deepStrictEqual(
    progress.filterAchievementIds({
        metadata,
        completedIds: [1, 4, 5],
        completion: "incomplete",
        sort: "priority",
    }),
    ["3", "6", "2"]
);
assert.deepStrictEqual(
    progress.filterAchievementIds({ metadata, completedIds: [], tier: "hidden", sort: "points-desc" }),
    ["4", "2"]
);
assert.deepStrictEqual(progress.paginateAchievementItems([1, 2, 3, 4, 5], 2, 2), [3, 4]);

const filteredRecords = progress.filterAchievementRecords({
    records: [
        { id: "1", category: { id: "10" }, tier: "normal", completed: true, points: 20 },
        { id: "2", category: { id: "10" }, tier: "hidden", completed: false, points: 0 },
        { id: "3", category: { id: "20" }, tier: "wujia", completed: false, points: 40 },
    ],
    categoryId: "10",
    tier: "hidden",
    completion: "incomplete",
});
assert.deepStrictEqual(
    filteredRecords.map((item) => item.id),
    ["2"]
);
assert.deepStrictEqual(
    progress
        .filterAchievementRecords({
            records: [
                { id: "3", tier: "normal", completed: true, points: 5 },
                { id: "1", tier: "normal", completed: false, points: 20 },
            ],
        })
        .map((item) => item.id),
    ["3", "1"]
);
assert.deepStrictEqual(
    progress
        .filterAchievementRecords({
            records: [
                { id: "3", tier: "normal", completed: true, points: 5 },
                { id: "1", tier: "normal", completed: false, points: 20 },
            ],
            sort: "priority",
        })
        .map((item) => item.id),
    ["1", "3"]
);
assert.deepStrictEqual(
    progress
        .filterAchievementRecords({
            records: [
                { id: "1", category: { id: "10", subId: "101" }, tier: "normal", completed: true },
                { id: "2", category: { id: "10", subId: "102" }, tier: "hidden", completed: false },
            ],
            categoryId: "10:101",
            categoryAchievementIds: ["1"],
        })
        .map((item) => item.id),
    ["1"]
);

console.log("Achievement progress tests passed.");
