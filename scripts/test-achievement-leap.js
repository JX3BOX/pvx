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
    new Function("module", "exports", "require", result.code)(loadedModule, loadedModule.exports, localRequire);
    return loadedModule.exports;
}

function loadVueScriptModule(file, injectedModules = {}) {
    const source = fs.readFileSync(file, "utf8");
    const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script, `Missing script block in ${file}`);
    const result = babel.transformSync(script, {
        babelrc: false,
        configFile: false,
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

const leapPageSource = fs.readFileSync(
    path.resolve(__dirname, "../src/components/wiki/leap/AchievementLeapPage.vue"),
    "utf8"
);
const routeTableSource = fs.readFileSync(
    path.resolve(__dirname, "../src/components/wiki/leap/AchievementLeapRouteTable.vue"),
    "utf8"
);
const addDialogSource = fs.readFileSync(
    path.resolve(__dirname, "../src/components/wiki/leap/AchievementLeapAddDialog.vue"),
    "utf8"
);
const baseSettingsSource = fs.readFileSync(
    path.resolve(__dirname, "../src/components/wiki/leap/AchievementLeapBaseSettings.vue"),
    "utf8"
);
const detailHeaderSource = fs.readFileSync(
    path.resolve(__dirname, "../src/components/wiki/leap/AchievementLeapDetailHeader.vue"),
    "utf8"
);

const enrichmentSource = leapPageSource.slice(
    leapPageSource.indexOf("async enrichAchievementItems"),
    leapPageSource.indexOf("createDefaultForm")
);
const recommendationSource = leapPageSource.slice(
    leapPageSource.indexOf("async loadRecommendation"),
    leapPageSource.indexOf("async loadPlans")
);

// SFC contract: the page owns the resolved definitions and passes them to every display consumer.
assert.match(leapPageSource, /fetchAchievementWorkbenchDifficultyDimensions/);
assert.match(leapPageSource, /dimensions:\s*resolveAchievementWorkbenchDimensions\(\[\]\)/);
assert.match(leapPageSource, /fetchAchievementWorkbenchDifficultyDimensions\(\),/);
assert.ok(!leapPageSource.includes("fetchAchievementWorkbenchDifficultyDimensions().catch("), "recommendation definitions must not silently fall back");
assert.ok((leapPageSource.match(/:dimensions="dimensions"/g) || []).length >= 3);
assert.match(routeTableSource, /dimensions:\s*\{/);
assert.match(addDialogSource, /dimensions:\s*\{/);

// SFC contract: RouteTable renders and sorts every resolved dimension through shared helpers/components.
assert.match(routeTableSource, /import AchievementDifficultyStars/);
assert.match(routeTableSource, /getAchievementWorkbenchDimensionSort/);
assert.match(routeTableSource, /getAchievementWorkbenchDimensionValue/);
assert.match(routeTableSource, /v-for="dimension in dimensions"/);
assert.match(routeTableSource, /<AchievementDifficultyStars/);
assert.match(routeTableSource, /:value="getDimensionValue\(item, dimension\.key\)"/);
assert.match(routeTableSource, /:value="`dimension:\$\{dimension\.key\}:asc`"/);
assert.ok(!routeTableSource.includes("cost-effectiveness-desc"));
assert.ok(!routeTableSource.includes("costTier"));
assert.ok(!routeTableSource.includes("Math.round"));

// SFC contract: optional metadata columns are decided from the whole route, while map stays row-local.
["Tags", "SchoolRestriction", "GuideNote"].forEach((name) => {
    assert.match(routeTableSource, new RegExp(`show${name}Column\\(\\)`));
    assert.ok((routeTableSource.match(new RegExp(`v-if="show${name}Column"`, "g")) || []).length >= 2);
});
assert.match(routeTableSource, /v-if="item\.map\?\.name"/);
assert.match(routeTableSource, /getDisplayTags\(item\)/);

// SFC contract: normalized SceneID/map.id values are resolved against the page map list before display.
assert.match(enrichmentSource, /this\.maps/);
assert.match(enrichmentSource, /item\.map\?\.id/);
assert.match(enrichmentSource, /mapById\.get\(/);
assert.match(enrichmentSource, /item\.map\?\.name\s*\|\|\s*resolvedMap\?\.name/);

// SFC contract: AddDialog shows shared overall stars only when the resolved definition exists.
assert.match(addDialogSource, /import AchievementDifficultyStars/);
assert.match(addDialogSource, /overallDimension\(\)/);
assert.match(addDialogSource, /v-if="overallDimension"/);
assert.match(addDialogSource, /<AchievementDifficultyStars/);
assert.match(addDialogSource, /getDimensionValue\(item, overallDimension\.key\)/);
assert.ok(!addDialogSource.includes("Math.round"));
assert.ok(!addDialogSource.includes('.repeat(stars)'));

// Server recommendations must bypass the old local ranking and difficulty filters.
assert.match(recommendationSource, /fetchAchievementWorkbenchRecommendation\(/);
assert.ok(!recommendationSource.includes("buildAchievementLeapRecommendation("));
assert.ok(!recommendationSource.includes("fetchAchievementWorkbenchDifficulty("));
assert.ok(!recommendationSource.includes("fetchAchievementWorkbenchDifficultyMetrics("));

// Detail mismatch state owns a dedicated empty state and disables every plan action in the header.
assert.match(leapPageSource, /planClientMismatchTitle/);
assert.match(leapPageSource, /planClientMismatchDescription/);
assert.match(leapPageSource, /:actions-disabled="Boolean\(detailClientMismatch\)"/);
assert.match(detailHeaderSource, /actionsDisabled/);
assert.ok((detailHeaderSource.match(/:disabled="[^"]*actionsDisabled[^"]*"/g) || []).length >= 2);

const pageComponentImports = [
    "@/components/wiki/leap/AchievementLeapAddDialog.vue",
    "@/components/wiki/leap/AchievementLeapBaseSettings.vue",
    "@/components/wiki/leap/AchievementLeapDetailHeader.vue",
    "@/components/wiki/consultation/PlanConsultations.vue",
    "@/components/wiki/leap/AchievementLeapPlanList.vue",
    "@/components/wiki/leap/AchievementLeapRecommendationDrawer.vue",
    "@/components/wiki/leap/AchievementLeapRouteTable.vue",
    "@/components/wiki/leap/AchievementLeapSaveDialog.vue",
    "@/components/wiki/leap/AchievementLeapSummary.vue",
    "@/components/design/PvxActionButton.vue",
    "@/components/design/PvxEmptyState.vue",
    "@/components/design/PvxSurface.vue",
];

let pageRoleStateLoader = async (roleId) => ({
    jx3id: roleId,
    completedIds: [],
    synced: true,
    updatedAt: null,
});
let pagePlanLoader = async (id) => ({ id, client: "std", schema: [] });
let pageRecordsLoader = async () => [];
let pageDifficultyLoader = async () => ({});

function buildPageTestCandidates({ metadata = {}, records = [], allowedIds = null, difficultyById = {} } = {}) {
    const allowed = allowedIds == null ? null : new Set(allowedIds.map(String));
    const recordMap = new Map(records.map((record) => [String(record.id), record]));
    const ids = records.length ? records.map((record) => String(record.id)) : allowedIds || Object.keys(metadata);
    return [...new Set(ids.map(String))]
        .filter((id) => Number(metadata[id]?.general) === 1)
        .filter((id) => !allowed || allowed.has(id))
        .map((id) => ({
            ...recordMap.get(id),
            id,
            points: Number(metadata[id]?.point) || 0,
            difficulty: recordMap.get(id)?.difficulty ?? difficultyById[id] ?? null,
        }));
}

const leapPage = loadVueScriptModule(path.resolve(__dirname, "../src/components/wiki/leap/AchievementLeapPage.vue"), {
    "@/utils/achievementRecommendation": loadModule(path.resolve(__dirname, "../src/utils/achievementRecommendation.js")),
    ...Object.fromEntries(pageComponentImports.map((request) => [request, {}])),
    "@element-plus/icons-vue": {},
    "@jx3box/jx3box-common/js/user": { isLogin: () => true, getInfo: () => ({ uid: 42 }) },
    "@/service/achievementWorkbench": {
        fetchAchievementWorkbenchDifficulty: (...args) => pageDifficultyLoader(...args),
        fetchAchievementWorkbenchLeapPlan: (...args) => pagePlanLoader(...args),
        fetchAchievementWorkbenchRecordsBatched: (...args) => pageRecordsLoader(...args),
        fetchAchievementWorkbenchRoleState: (...args) => pageRoleStateLoader(...args),
    },
    "@/utils/achievementLeap": {
        buildAchievementLeapCandidates: buildPageTestCandidates,
        buildAchievementLeapPlanProgress: () => ({ remainingPoints: 0 }),
        filterAchievementLeapIds: (ids, sourceMetadata) =>
            [...new Set((ids || []).map(String))].filter((id) => Number(sourceMetadata[id]?.general) === 1),
    },
    "@/utils/achievementProgress": {
        buildAchievementOverallProgress: () => ({ completedPoints: 0 }),
    },
    "@/utils/achievementSchoolEligibility": {
        buildAchievementSchoolEligibilityContext: () => ({ version: "school-v1", school: null }),
    },
    "@/utils/achievementWorkbench": {
        applyAchievementWorkbenchEnrichment: (records) => records,
        resolveAchievementWorkbenchDimensions: () => [],
    },
    "@/utils/config": { __Links: { account: { login: "" } } },
}).default;

const baseSettings = loadVueScriptModule(
    path.resolve(__dirname, "../src/components/wiki/leap/AchievementLeapBaseSettings.vue"),
    { "@/components/design/PvxSurface.vue": {} }
).default;
const detailHeader = loadVueScriptModule(
    path.resolve(__dirname, "../src/components/wiki/leap/AchievementLeapDetailHeader.vue"),
    {
        "@element-plus/icons-vue": {},
        "@/components/design/PvxSurface.vue": {},
    }
).default;

function createGuidanceTestVm(successMessages) {
    const vm = {
        ...leapPage.data(),
        $store: { state: { client: "std" } },
        $route: { params: {}, query: {} },
        $t: (key) => key,
        $confirm: () => Promise.resolve(),
        $nextTick: () => Promise.resolve(),
        $router: {
            push: () => Promise.resolve(),
            replace: () => Promise.resolve(),
        },
        $message: {
            success: (message) => successMessages.push(message),
            error: () => {},
            warning: () => {},
        },
        roles: [
            { id: "role-std", name: "旧角色", server: "旧服" },
            { id: "role-origin", name: "新角色", server: "新服" },
        ],
        currentRoleId: "role-std",
    };
    Object.entries(leapPage.methods).forEach(([name, method]) => {
        vm[name] = method.bind(vm);
    });
    ["currentClient", "currentRole", "detailId", "canConsultPlan"].forEach((name) => {
        Object.defineProperty(vm, name, {
            configurable: true,
            get: () => leapPage.computed[name].call(vm),
        });
    });
    vm.loadRecommendation = () => {};
    return vm;
}

function runBaseSettingsStateTests() {
    const roleEvents = [];
    const roleVm = {
        modelValue: { title: "方案", roleId: "role-std" },
        $emit: (...args) => roleEvents.push(args),
    };
    baseSettings.methods.updateField.call(roleVm, "roleId", "role-origin");
    assert.deepStrictEqual(roleEvents, [["role-change", "role-origin"]]);

    const titleEvents = [];
    baseSettings.methods.updateField.call(
        { ...roleVm, $emit: (...args) => titleEvents.push(args) },
        "title",
        "新方案"
    );
    assert.deepStrictEqual(titleEvents, [["update:modelValue", { title: "新方案", roleId: "role-std" }]]);
    assert.match(baseSettingsSource, /:model-value="modelValue\.roleId"/);
}

function runDetailHeaderStateTests() {
    const emitted = [];
    const plan = { id: "plan-origin" };
    detailHeader.methods.emitPlanAction.call(
        { actionsDisabled: true, plan, $emit: (...args) => emitted.push(args) },
        "edit"
    );
    assert.deepStrictEqual(emitted, []);
    detailHeader.methods.emitPlanAction.call(
        { actionsDisabled: false, plan, $emit: (...args) => emitted.push(args) },
        "copy"
    );
    assert.deepStrictEqual(emitted, [["copy", plan]]);
}

async function runLeapStateConsistencyTests() {
    const originalDocument = global.document;
    const originalLocalStorage = global.localStorage;
    const originalConsoleError = console.error;
    global.document = { querySelector: () => null };
    global.localStorage = { setItem: () => {} };
    console.error = () => {};

    try {
        const hydrationCalls = [];
        pageRecordsLoader = async (options) => {
            hydrationCalls.push(options);
            const visible = { id: "visible", name: "可见成就" };
            const hidden = { id: "hidden", name: "隐藏成就" };
            return options.includeHidden ? [visible, hidden] : [visible];
        };
        pageDifficultyLoader = async () => ({});
        const hydrationVm = createGuidanceTestVm([]);
        hydrationVm.metadata = {
            hidden: { general: 1, visible: false, point: 10 },
            visible: { general: 1, visible: true, point: 20 },
        };
        hydrationVm.roleState = { completedIds: [] };
        hydrationVm.enrichAchievementItems = async (items) => items;
        const hydrated = await hydrationVm.hydratePlanItems(["hidden", "visible"], "std");
        assert.strictEqual(hydrationCalls[0].includeHidden, true);
        assert.deepStrictEqual(hydrated.items.map((item) => item.id), ["hidden", "visible"]);

        let rejectRoleState;
        pageRoleStateLoader = () =>
            new Promise((resolve, reject) => {
                rejectRoleState = reject;
            });
        const rejectedRoleVm = createGuidanceTestVm([]);
        const preservedRoute = { items: [{ id: "visible" }] };
        const preservedEditingPlan = { id: "plan-editing" };
        const preservedSearchResults = [{ id: "search-result" }];
        rejectedRoleVm.generatedRoute = preservedRoute;
        rejectedRoleVm.editingPlan = preservedEditingPlan;
        rejectedRoleVm.addSearchResults = preservedSearchResults;
        rejectedRoleVm.saveDialogVisible = true;
        rejectedRoleVm.addDialogVisible = true;
        rejectedRoleVm.plannerForm = { ...rejectedRoleVm.plannerForm, roleId: "role-origin" };
        const rejectedRoleChange = rejectedRoleVm.handleRoleChange("role-origin");
        await Promise.resolve();
        const stateWhileRoleLoading = {
            generatedRoute: rejectedRoleVm.generatedRoute,
            editingPlan: rejectedRoleVm.editingPlan,
            addSearchResults: rejectedRoleVm.addSearchResults,
            saveDialogVisible: rejectedRoleVm.saveDialogVisible,
            addDialogVisible: rejectedRoleVm.addDialogVisible,
        };
        rejectRoleState(new Error("role rejected"));
        await rejectedRoleChange;
        assert.deepStrictEqual(stateWhileRoleLoading, {
            generatedRoute: preservedRoute,
            editingPlan: preservedEditingPlan,
            addSearchResults: preservedSearchResults,
            saveDialogVisible: true,
            addDialogVisible: true,
        });
        assert.strictEqual(rejectedRoleVm.currentRoleId, "role-std");
        assert.strictEqual(rejectedRoleVm.plannerForm.roleId, "role-std");
        assert.strictEqual(rejectedRoleVm.generatedRoute, preservedRoute);
        assert.strictEqual(rejectedRoleVm.editingPlan, preservedEditingPlan);
        assert.strictEqual(rejectedRoleVm.addSearchResults, preservedSearchResults);
        assert.strictEqual(rejectedRoleVm.saveDialogVisible, true);
        assert.strictEqual(rejectedRoleVm.addDialogVisible, true);

        pageRoleStateLoader = async (roleId) => ({ jx3id: roleId, completedIds: [], synced: true });
        let replacedRoleId = null;
        const successfulRoleVm = createGuidanceTestVm([]);
        successfulRoleVm.generatedRoute = preservedRoute;
        successfulRoleVm.editingPlan = preservedEditingPlan;
        successfulRoleVm.addSearchResults = preservedSearchResults;
        successfulRoleVm.saveDialogVisible = true;
        successfulRoleVm.addDialogVisible = true;
        successfulRoleVm.recommendation = { role: { role_id: 1 } };
        successfulRoleVm.recommendationLoading = true;
        const previousRecommendationRequest = successfulRoleVm.recommendationRequestId;
        successfulRoleVm.$router.replace = ({ query }) => {
            replacedRoleId = query.jx3id;
            return Promise.resolve();
        };
        await successfulRoleVm.handleRoleChange("role-origin");
        assert.strictEqual(successfulRoleVm.currentRoleId, "role-origin");
        assert.strictEqual(successfulRoleVm.recommendation, null);
        assert.strictEqual(successfulRoleVm.recommendationLoading, false);
        assert.ok(successfulRoleVm.recommendationRequestId > previousRecommendationRequest);
        assert.strictEqual(successfulRoleVm.plannerForm.roleId, "role-origin");
        assert.strictEqual(replacedRoleId, "role-origin");
        assert.strictEqual(successfulRoleVm.generatedRoute, null);
        assert.strictEqual(successfulRoleVm.editingPlan, null);
        assert.deepStrictEqual(successfulRoleVm.addSearchResults, []);
        assert.strictEqual(successfulRoleVm.saveDialogVisible, false);
        assert.strictEqual(successfulRoleVm.addDialogVisible, false);

        let resolveSlowRoleState;
        let resolveLatestRoleState;
        pageRoleStateLoader = (roleId) =>
            new Promise((resolve) => {
                if (roleId === "role-slow") resolveSlowRoleState = resolve;
                else resolveLatestRoleState = resolve;
            });
        const concurrentRoleVm = createGuidanceTestVm([]);
        concurrentRoleVm.generatedRoute = preservedRoute;
        const slowRoleChange = concurrentRoleVm.loadRoleState("role-slow", { resetForm: true });
        const latestRoleChange = concurrentRoleVm.loadRoleState("role-latest", { resetForm: true });
        resolveLatestRoleState({ jx3id: "role-latest", completedIds: [], synced: true });
        await latestRoleChange;
        const latestRoute = { items: [{ id: "latest" }] };
        concurrentRoleVm.generatedRoute = latestRoute;
        resolveSlowRoleState({ jx3id: "role-slow", completedIds: [], synced: true });
        await slowRoleChange;
        assert.strictEqual(concurrentRoleVm.currentRoleId, "role-latest");
        assert.strictEqual(concurrentRoleVm.generatedRoute, latestRoute);

        const originPlan = { id: "plan-origin", title: "缘起方案", client: "origin", schema: ["visible"] };
        pagePlanLoader = async () => originPlan;
        const detailVm = createGuidanceTestVm([]);
        detailVm.metadata = { visible: { general: 1, visible: true, point: 20 } };
        let detailHydrationCount = 0;
        detailVm.hydratePlanItems = async () => {
            detailHydrationCount += 1;
            return { items: [{ id: "visible" }], difficultyById: {} };
        };
        detailVm.buildDetailRoute = () => ({ items: [{ id: "visible" }] });
        await detailVm.loadPlanDetail(originPlan.id);
        assert.strictEqual(detailHydrationCount, 0);
        assert.strictEqual(detailVm.detailPlan, originPlan);
        assert.deepStrictEqual(detailVm.detailClientMismatch, {
            planClient: "origin",
            currentClient: "std",
        });
        assert.strictEqual(detailVm.detailRoute, null);

        detailVm.$store.state.client = "origin";
        await detailVm.loadPlanDetail(originPlan.id);
        assert.strictEqual(detailHydrationCount, 1);
        assert.strictEqual(detailVm.detailClientMismatch, null);
        assert.deepStrictEqual(detailVm.detailRoute.items.map((item) => item.id), ["visible"]);

        const warningMessages = [];
        let closeCount = 0;
        let editorHydrationCount = 0;
        const editorVm = createGuidanceTestVm([]);
        editorVm.$t = (key, params) => ({ key, params });
        editorVm.$message.warning = (message) => warningMessages.push(message);
        editorVm.closePlanDetail = () => {
            closeCount += 1;
        };
        editorVm.hydratePlanItems = async () => {
            editorHydrationCount += 1;
            return { items: [] };
        };
        await editorVm.preparePlanForEditor(originPlan, { copy: true });
        assert.strictEqual(closeCount, 0);
        assert.strictEqual(editorHydrationCount, 0);
        assert.deepStrictEqual(warningMessages, [
            {
                key: "pages.wiki.leap.ui.workbench.planClientMismatchWarning",
                params: {
                    client: {
                        key: "pages.wiki.leap.ui.workbench.clients.origin",
                        params: undefined,
                    },
                },
            },
        ]);

        let resolveDetailPlan;
        pagePlanLoader = () =>
            new Promise((resolve) => {
                resolveDetailPlan = resolve;
            });
        const staleDetailVm = createGuidanceTestVm([]);
        staleDetailVm.metadata = { visible: { general: 1, visible: true, point: 20 } };
        staleDetailVm.hydratePlanItems = async () => ({ items: [{ id: "visible" }], difficultyById: {} });
        staleDetailVm.buildDetailRoute = () => ({ items: [{ id: "visible" }] });
        const staleDetailRequest = staleDetailVm.loadPlanDetail("plan-a");
        const detailRequestIdBeforeClear = staleDetailVm.detailRequestId;
        leapPage.watch.detailId.handler.call(staleDetailVm, "");
        const loadingAfterDetailClear = staleDetailVm.detailLoading;
        resolveDetailPlan({ id: "plan-a", title: "方案 A", client: "std", schema: ["visible"] });
        await staleDetailRequest;
        assert.ok(staleDetailVm.detailRequestId > detailRequestIdBeforeClear);
        assert.strictEqual(loadingAfterDetailClear, false);
        assert.strictEqual(staleDetailVm.detailPlan, null);
        assert.strictEqual(staleDetailVm.detailRoute, null);

        let resolveEditorHydration;
        const staleEditorVm = createGuidanceTestVm([]);
        staleEditorVm.metadata = { visible: { general: 1, visible: true, point: 20 } };
        staleEditorVm.hydratePlanItems = () =>
            new Promise((resolve) => {
                resolveEditorHydration = resolve;
            });
        staleEditorVm.buildDetailRoute = (plan, items) => ({ planId: plan.id, items });
        let editorCloseCount = 0;
        staleEditorVm.closePlanDetail = () => {
            editorCloseCount += 1;
            return Promise.resolve();
        };
        const detailLoads = [];
        staleEditorVm.loadPlanDetail = (id) => {
            detailLoads.push(id);
        };
        const staleEditorRequest = staleEditorVm.preparePlanForEditor({
            id: "plan-a",
            title: "方案 A",
            client: "std",
            schema: ["visible"],
            meta: { targetPoints: 100 },
        });
        await Promise.resolve();
        const editorRequestIdBeforeNavigation = staleEditorVm.editorRequestId;
        leapPage.watch.detailId.handler.call(staleEditorVm, "plan-b");
        const routeAfterNavigation = { planId: "plan-b", items: [{ id: "plan-b" }] };
        staleEditorVm.generatedRoute = routeAfterNavigation;
        resolveEditorHydration({ items: [{ id: "visible" }] });
        await staleEditorRequest;
        assert.ok(staleEditorVm.editorRequestId > editorRequestIdBeforeNavigation);
        assert.deepStrictEqual(detailLoads, ["plan-b"]);
        assert.strictEqual(staleEditorVm.generatedRoute, routeAfterNavigation);
        assert.strictEqual(staleEditorVm.editingPlan, null);
        assert.strictEqual(editorCloseCount, 0);
    } finally {
        pageRoleStateLoader = async (roleId) => ({
            jx3id: roleId,
            completedIds: [],
            synced: true,
            updatedAt: null,
        });
        pagePlanLoader = async (id) => ({ id, client: "std", schema: [] });
        pageRecordsLoader = async () => [];
        pageDifficultyLoader = async () => ({});
        console.error = originalConsoleError;
        if (originalDocument === undefined) delete global.document;
        else global.document = originalDocument;
        if (originalLocalStorage === undefined) delete global.localStorage;
        else global.localStorage = originalLocalStorage;
    }
}

function runConsultationEntryTests() {
    const view = createGuidanceTestVm([]);
    view.detailPlan = { id: "10", client: "std", raw: { user_id: 42 } };
    assert.strictEqual(view.canConsultPlan, true);
    let opened = 0;
    view.$refs = { consultations: { openCreate: () => { opened++; } } };
    view.requestPlanGuidance();
    assert.strictEqual(opened, 1);
    view.detailPlan.raw.user_id = 99;
    assert.strictEqual(view.canConsultPlan, false);
    view.requestPlanGuidance();
    assert.strictEqual(opened, 1);
    view.detailPlan.raw.user_id = 42;
    view.$store.state.client = "origin";
    assert.strictEqual(view.canConsultPlan, false);
    assert(!leapPageSource.includes("guidanceSimulation"));
    assert(leapPageSource.includes('<PlanConsultations v-if="canConsultPlan"'));
}

Promise.resolve()
    .then(runBaseSettingsStateTests)
    .then(runDetailHeaderStateTests)
    .then(runLeapStateConsistencyTests)
    .then(runConsultationEntryTests)
    .then(() => console.log("Achievement leap tests passed."))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
