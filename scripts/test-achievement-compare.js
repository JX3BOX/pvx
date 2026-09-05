const assert = require("assert");
const fs = require("fs");
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
const workbenchModule = loadModule(path.resolve(__dirname, "../src/utils/achievementWorkbench.js"));
const compare = loadModule(
    path.resolve(__dirname, "../src/utils/achievementCompare.js"),
    {
        "@/utils/achievementStatistics": "achievement-statistics-test-module",
        "@/utils/achievementWorkbench": "achievement-workbench-test-module",
    },
    {
        "achievement-statistics-test-module": statisticsModule,
        "achievement-workbench-test-module": workbenchModule,
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

const exportDimensions = [
    {
        key: "money",
        label: null,
        i18nKey: "pages.wiki.difficultyDimensions.money",
    },
    {
        key: "operation",
        label: "操作难度",
        i18nKey: null,
    },
    {
        key: "overall",
        label: null,
        i18nKey: "pages.wiki.difficultyDimensions.overall",
    },
];
const exportRecords = [
    {
        id: "1",
        name: "零成本成就",
        shortDescription: "完成江湖游历\n不消耗金钱",
        points: 0,
        category: { name: "江湖", subName: "游历" },
        difficultyDimensions: { money: 0, operation: null, overall: 4.5 },
        completionStatistics: { completedRoleCount: 12, totalRoleCount: 96, rate: 0.125 },
        tags: [
            { type: "festival", label: "节日：花朝节" },
            { type: "school", label: "门派：万花" },
            { type: "activity", label: "活动：花朝节" },
        ],
    },
    {
        id: "2",
        name: "操作入门",
        points: null,
        category: { name: null, subName: null },
        difficultyDimensions: { money: null, operation: 0, overall: null },
        completionStatistics: { completedRoleCount: 0, totalRoleCount: 96, rate: 0 },
        tags: [],
    },
];
const exportRoles = [
    {
        name: "甲",
        server: "梦江南",
        completedAchievements: ["1"],
        completedAchievementIds: [],
    },
    { name: "乙", server: "长安城", completedAchievementIds: ["2"] },
];
const exportTranslations = {
    "pages.wiki.compare.ui.export.headers.category": "成就分类",
    "pages.wiki.compare.ui.export.headers.achievement": "成就名称",
    "pages.wiki.compare.ui.export.headers.description": "成就描述",
    "pages.wiki.compare.ui.export.headers.points": "资历点数",
    "pages.wiki.difficultyDimensions.money": "金钱",
    "pages.wiki.difficultyDimensions.overall": "综合难度",
    "pages.wiki.compare.ui.export.headers.completionRate": "同步完成率",
    "pages.wiki.compare.ui.export.headers.tags": "标签",
    "pages.wiki.compare.ui.status.completed": "已完成",
    "pages.wiki.compare.ui.status.incomplete": "未完成",
};
const exportData =
    typeof compare.buildAchievementCompareExportData === "function"
        ? compare.buildAchievementCompareExportData({
              records: exportRecords,
              roles: exportRoles,
              dimensions: exportDimensions,
              translate: (key) => exportTranslations[key] || key,
          })
        : null;
assert.deepStrictEqual(exportData, [
    ["成就分类", "成就名称", "成就描述", "资历点数", "金钱", "操作难度", "综合难度", "标签", "甲 · 梦江南", "乙 · 长安城"],
    [
        "江湖 / 游历",
        "零成本成就",
        "完成江湖游历\n不消耗金钱",
        0,
        0,
        "—",
        4.5,
        "门派：万花, 节日：花朝节, 活动：花朝节",
        "已完成",
        "未完成",
    ],
    ["—", "操作入门", "—", "—", "—", 0, "—", "—", "未完成", "已完成"],
]);

const compareMatrixSource = fs.readFileSync(
    path.resolve(__dirname, "../src/components/wiki/compare/AchievementCompareMatrix.vue"),
    "utf8"
);
assert.match(
    compareMatrixSource,
    /v-if="record\.tier === 'wujia'"[\s\S]*?pages\.wiki\.overview\.ui\.statistics\.wujia/,
    "五甲记录应保留五甲档位 tag"
);
assert.doesNotMatch(compareMatrixSource, /v-if="record\.tier === 'normal'"/, "普通记录不应显示档位 tag");
assert.match(compareMatrixSource, /v-for="tag in getDisplayTags\(record\)"/, "业务 tags 应继续通过门派优先排序输出");

console.log("Achievement compare tests passed.");
