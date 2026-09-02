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
const compare = loadModule(
    path.resolve(__dirname, "../src/utils/achievementCompare.js"),
    {
        "@/utils/achievementStatistics": "achievement-statistics-test-module",
    },
    {
        "achievement-statistics-test-module": statisticsModule,
    }
);

const metadata = {
    1: { point: 10, general: 1, visible: true },
    2: { point: 20, general: 1, visible: true },
    3: { point: 30, general: 1, visible: true },
    4: { point: 40, general: 1, visible: true },
};
const menus = {
    a: {
        sub: "a",
        name: "江湖",
        children: [{ detail: "a-1", name: "游历", achievements: [1, 2] }],
    },
    b: {
        sub: "b",
        name: "秘境",
        children: [{ detail: "b-1", name: "首领", achievements: [3, 4] }],
    },
};
const roles = [
    { jx3id: "r1", name: "甲", completedAchievements: [1, 2] },
    { jx3id: "r2", name: "乙", completedAchievements: [2, 3] },
];

assert.deepStrictEqual(
    compare.filterAchievementIdsForCompare([1, 2, 3, 4], roles, [compare.COMMON_UNFINISHED_FILTER]),
    ["4"]
);
assert.deepStrictEqual(compare.filterAchievementIdsForCompare([1, 2, 3, 4], roles, [compare.COMMON_COMPLETED_FILTER]), [
    "2",
]);
assert.deepStrictEqual(compare.filterAchievementIdsForCompare([1, 2, 3, 4], roles, ["r1,2", "r2,1"]), ["1"]);

const roleProgress = compare.buildAchievementRoleProgress(roles, metadata);
assert.deepStrictEqual(
    roleProgress.map((role) => [role.jx3id, role.completedPoints, role.pointProgress]),
    [
        ["r1", 30, 30],
        ["r2", 50, 50],
    ]
);

const cross = Object.fromEntries(
    compare
        .buildAchievementCrossStatistics({ achievementIds: Object.keys(metadata), metadata, roles })
        .map((item) => [item.key, item])
);
assert.deepStrictEqual([cross.commonCompleted.count, cross.commonCompleted.points], [1, 20]);
assert.deepStrictEqual([cross.primaryOnly.count, cross.primaryOnly.points], [1, 10]);
assert.deepStrictEqual([cross.secondaryOnly.count, cross.secondaryOnly.points], [1, 30]);
assert.deepStrictEqual([cross.commonIncomplete.count, cross.commonIncomplete.points], [1, 40]);

const categories = compare.buildAchievementCategoryComparison({ menus, metadata, roles });
assert.strictEqual(categories[0].id, "b");
assert.strictEqual(categories[0].averageProgress, 21.43);
assert.strictEqual(categories[1].averageProgress, 83.34);

const tree = compare.buildAchievementCompareCategoryTree(menus, [2, 4]);
assert.deepStrictEqual(
    tree.map((category) => [category.id, category.count, category.children[0].count]),
    [
        ["a", 1, 1],
        ["b", 1, 1],
    ]
);

console.log("Achievement compare tests passed.");
