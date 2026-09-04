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

function loadVueOptionsComponent(file, aliases = {}, injectedModules = {}) {
    const source = fs.readFileSync(file, "utf8");
    const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script, `${file} 缺少普通 script 区块`);
    const result = babel.transformSync(script, {
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
    return loadedModule.exports.default;
}

const statisticsModule = loadModule(path.resolve(__dirname, "../src/utils/achievementStatistics.js"));
const workbenchModule = loadModule(path.resolve(__dirname, "../src/utils/achievementWorkbench.js"));
const progress = loadModule(
    path.resolve(__dirname, "../src/utils/achievementProgress.js"),
    {
        "@/utils/achievementStatistics": "achievement-statistics-test-module",
        "@/utils/achievementWorkbench": "achievement-workbench-test-module",
    },
    {
        "achievement-statistics-test-module": statisticsModule,
        "achievement-workbench-test-module": workbenchModule,
    }
);
const progressPage = loadVueOptionsComponent(
    path.resolve(__dirname, "../src/components/wiki/progress/AchievementProgressPage.vue"),
    {
        "@jx3box/jx3box-common/js/user": "achievement-user-test-module",
        "@element-plus/icons-vue": "achievement-icons-test-module",
        "@/components/wiki/progress/AchievementCategoryBoard.vue": "achievement-component-test-module",
        "@/components/wiki/progress/AchievementProgressFilters.vue": "achievement-component-test-module",
        "@/components/wiki/progress/AchievementProgressList.vue": "achievement-component-test-module",
        "@/components/wiki/progress/AchievementProgressSummary.vue": "achievement-component-test-module",
        "@/components/design/PvxActionButton.vue": "achievement-component-test-module",
        "@/components/design/PvxEmptyState.vue": "achievement-component-test-module",
        "@/components/design/PvxSurface.vue": "achievement-component-test-module",
        "@/service/achievementWorkbench": "achievement-service-test-module",
        "@/utils/achievementWorkbench": "achievement-workbench-test-module",
        "@/utils/achievementProgress": "achievement-progress-test-module",
        "@/utils/config": "achievement-config-test-module",
    },
    {
        "achievement-user-test-module": { isLogin: () => true },
        "achievement-icons-test-module": {},
        "achievement-component-test-module": {},
        "achievement-service-test-module": {},
        "achievement-workbench-test-module": workbenchModule,
        "achievement-progress-test-module": progress,
        "achievement-config-test-module": { __Links: { account: { login: "" } } },
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

const difficultyById = {
    1: { difficulty: 3, cost: { time: 5 } },
    2: null,
    3: { difficulty: 0, cost: { time: 0 } },
    4: { difficulty: 1, cost: { time: 2 } },
    5: { difficulty: 1, cost: { time: 3 } },
    6: { difficulty: 1, cost: { time: 1 } },
};
assert.strictEqual(
    progress.hasAchievementDifficultyMetricCoverage(Object.keys(metadata), difficultyById, "difficulty"),
    true
);
assert.strictEqual(
    progress.hasAchievementDifficultyMetricCoverage(Object.keys(metadata), { 1: difficultyById[1] }, "difficulty"),
    false
);
assert.deepStrictEqual(
    progress.filterAchievementIds({
        metadata,
        completedIds: [],
        sort: "difficulty-asc",
        difficultyById,
    }),
    ["3", "4", "5", "6", "1", "2"]
);
assert.deepStrictEqual(
    progress.filterAchievementIds({
        metadata,
        completedIds: [],
        sort: "time-asc",
        difficultyById,
    }),
    ["3", "6", "4", "5", "1", "2"]
);
assert.deepStrictEqual(
    progress.filterAchievementIds({
        metadata,
        completedIds: [],
        sort: "difficulty-asc",
        difficultyById: { 1: difficultyById[1] },
    }),
    Object.keys(metadata)
);

const dynamicDifficultyById = {
    1: { difficultyDimensions: { money: 2, overall: null, operation: 1 } },
    2: null,
    3: { difficultyDimensions: { money: 0, overall: 4, operation: 2 } },
    4: { difficultyDimensions: { money: 1, overall: 1, operation: 1 } },
    5: { difficultyDimensions: { money: 1, overall: 1, operation: 1 } },
    6: { difficultyDimensions: { money: null, overall: 0, operation: null } },
};
assert.strictEqual(
    progress.hasAchievementDifficultyMetricCoverage(Object.keys(metadata), dynamicDifficultyById, "operation"),
    true
);
assert.strictEqual(
    progress.hasAchievementDifficultyMetricCoverage(
        Object.keys(metadata),
        { ...dynamicDifficultyById, 6: undefined },
        "operation"
    ),
    true
);
assert.strictEqual(
    progress.hasAchievementDifficultyMetricCoverage(
        Object.keys(metadata),
        Object.fromEntries(Object.entries(dynamicDifficultyById).filter(([id]) => id !== "6")),
        "operation"
    ),
    false
);
assert.deepStrictEqual(
    progress.filterAchievementIds({
        metadata,
        completedIds: [],
        sort: "dimension:money:asc",
        difficultyById: dynamicDifficultyById,
    }),
    ["3", "4", "5", "1", "2", "6"]
);
assert.deepStrictEqual(
    progress.filterAchievementIds({
        metadata,
        completedIds: [],
        sort: "dimension:overall:asc",
        difficultyById: dynamicDifficultyById,
    }),
    ["6", "4", "5", "3", "1", "2"]
);
assert.deepStrictEqual(
    progress.filterAchievementIds({
        metadata,
        completedIds: [],
        sort: "dimension:operation:asc",
        difficultyById: dynamicDifficultyById,
    }),
    ["1", "4", "5", "3", "2", "6"]
);
assert.deepStrictEqual(
    progress.filterAchievementIds({
        metadata,
        completedIds: [],
        sort: "dimension:operation:asc",
        difficultyById: Object.fromEntries(
            Object.entries(dynamicDifficultyById).filter(([id]) => id !== "6")
        ),
    }),
    Object.keys(metadata)
);

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
assert.deepStrictEqual(
    progress
        .filterAchievementRecords({
            records: [
                { id: "1", tier: "normal", points: 20, estimatedMinutes: 1, cost: { time: 4 } },
                { id: "2", tier: "normal", points: 30, estimatedMinutes: 999, cost: { time: 0 } },
                { id: "3", tier: "normal", points: 40, estimatedMinutes: 5, cost: { time: null } },
            ],
            sort: "time-asc",
        })
        .map((item) => item.id),
    ["2", "1", "3"]
);
assert.deepStrictEqual(
    progress
        .filterAchievementRecords({
            records: [
                { id: "1", tier: "normal", points: 10, difficultyDimensions: { operation: 2 } },
                { id: "2", tier: "normal", points: 40, difficultyDimensions: { operation: 0 } },
                { id: "3", tier: "normal", points: 30, difficultyDimensions: { operation: null } },
                { id: "4", tier: "normal", points: 50, difficultyDimensions: { operation: 2 } },
            ],
            sort: "dimension:operation:asc",
        })
        .map((item) => item.id),
    ["2", "1", "4", "3"]
);
assert.deepStrictEqual(
    progress
        .filterAchievementRecords({
            records: [
                { id: "1", tier: "normal", difficultyDimensions: { operation: 2 } },
                { id: "2", tier: "normal", difficultyDimensions: { operation: 0 } },
                { id: "3", tier: "normal", difficultyDimensions: {} },
            ],
            sort: "dimension:operation:asc",
        })
        .map((item) => item.id),
    ["1", "2", "3"]
);

const dimensionSortRequestContext = {
    requestId: 7,
    pageRequestId: 3,
    recordRequestId: 11,
    roleId: "role-old",
    client: "std",
    epoch: 5,
    candidateIds: ["1", "2"],
};
assert.strictEqual(
    progressPage.methods.isCurrentDimensionSortRequest.call(
        {
            dimensionSortRequestId: 7,
            pageRequestId: 3,
            recordRequestId: 11,
            currentRoleId: "role-new",
            metricCandidateIds: ["1", "2"],
            isCurrentEnrichmentRequest: () => true,
        },
        dimensionSortRequestContext
    ),
    false
);
assert.strictEqual(
    progressPage.methods.isCurrentDimensionSortRequest.call(
        {
            dimensionSortRequestId: 7,
            pageRequestId: 3,
            recordRequestId: 11,
            currentRoleId: "role-new",
            metricCandidateIds: ["1", "2"],
            isCurrentEnrichmentRequest: () => true,
        },
        {
            ...dimensionSortRequestContext,
            roleId: "role-new",
        }
    ),
    true
);

const candidateChangeCalls = [];
const candidateChangeContext = {
    filters: {
        tier: "normal",
        sort: "dimension:operation:asc",
    },
    page: 4,
    searchMode: false,
    cancelDimensionSortRequest() {
        candidateChangeCalls.push(["cancel"]);
    },
    setListSort(sort) {
        candidateChangeCalls.push(["sort", sort, this.filters.tier]);
        return Promise.resolve();
    },
    loadVisibleRecords() {
        candidateChangeCalls.push(["load"]);
        return Promise.resolve();
    },
    $nextTick() {
        return Promise.resolve();
    },
    loadVisibleEnrichment() {},
    visibleRecords: [],
};

function createDimensionSortFailureContext(loadDifficultyMetrics) {
    const errors = [];
    const loadCalls = [];
    const context = {
        dimensionSortRequestId: 0,
        pageRequestId: 3,
        recordRequestId: 11,
        currentRoleId: "role-current",
        currentClient: "std",
        enrichmentClient: "std",
        enrichmentEpoch: 5,
        metricCandidateIds: ["1", "2"],
        dimensionSortLoading: false,
        filters: { tier: "normal", sort: "priority" },
        page: 4,
        searchMode: false,
        visibleRecords: [],
        loadDifficultyMetrics,
        loadVisibleRecords() {
            loadCalls.push("records");
            return Promise.resolve();
        },
        loadVisibleEnrichment() {
            loadCalls.push("enrichment");
        },
        $nextTick() {
            return Promise.resolve();
        },
        $t(key) {
            return key;
        },
        $message: {
            error(key) {
                errors.push(key);
            },
        },
    };
    context.isCurrentEnrichmentRequest = progressPage.methods.isCurrentEnrichmentRequest.bind(context);
    context.isCurrentDimensionSortRequest = progressPage.methods.isCurrentDimensionSortRequest.bind(context);
    return { context, errors, loadCalls };
}

async function runPageBehaviorTests() {
    await progressPage.methods.setListFilter.call(candidateChangeContext, "tier", "wujia");
    assert.deepStrictEqual(candidateChangeCalls, [
        ["cancel"],
        ["sort", "dimension:operation:asc", "wujia"],
    ]);
    assert.strictEqual(candidateChangeContext.page, 1);

    const failedSort = createDimensionSortFailureContext(async () => {
        throw new Error("metrics unavailable");
    });
    await progressPage.methods.setListSort.call(failedSort.context, "dimension:operation:asc");
    assert.strictEqual(failedSort.context.filters.sort, "priority", "补数失败应保留进入请求前的排序");
    assert.strictEqual(failedSort.context.page, 4, "补数失败不应重置当前页");
    assert.deepStrictEqual(failedSort.loadCalls, [], "补数失败不应额外重载列表或可见项增强数据");
    assert.deepStrictEqual(
        failedSort.errors,
        ["pages.wiki.difficultyDimensions.sortLoadFailed"],
        "当前请求失败只提示一次独立的排序数据错误"
    );
    assert.strictEqual(failedSort.context.dimensionSortLoading, false, "当前失败请求必须结束 loading");

    let rejectStaleMetrics;
    const staleSort = createDimensionSortFailureContext(
        () =>
            new Promise((_, reject) => {
                rejectStaleMetrics = reject;
            })
    );
    const staleRequest = progressPage.methods.setListSort.call(staleSort.context, "dimension:operation:asc");
    await Promise.resolve();
    assert.strictEqual(staleSort.context.dimensionSortLoading, true);
    staleSort.context.dimensionSortRequestId += 1;
    staleSort.context.dimensionSortLoading = false;
    rejectStaleMetrics(new Error("stale metrics unavailable"));
    await staleRequest;
    assert.strictEqual(staleSort.context.filters.sort, "priority");
    assert.strictEqual(staleSort.context.page, 4);
    assert.deepStrictEqual(staleSort.loadCalls, []);
    assert.deepStrictEqual(staleSort.errors, [], "过期失败请求不得提示错误");
    assert.strictEqual(staleSort.context.dimensionSortLoading, false, "取消边界设置的 loading 状态不得被旧请求改写");
}

runPageBehaviorTests()
    .then(() => console.log("Achievement progress tests passed."))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
