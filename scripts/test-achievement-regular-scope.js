const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { parse, compileTemplate } = require("@vue/compiler-sfc");

const root = path.resolve(__dirname, "..");
const cache = new Map();
const requests = [];
const services = {
    fetchAchievementWorkbenchRecordsBatched: async (options) => {
        requests.push(options);
        return options.ids.map((id) => ({ id, name: `成就 ${id}`, points: metadata[id].point }));
    },
    fetchAchievementWorkbenchDifficulty: async () => ({}),
    fetchAchievementWorkbenchDifficultyMetrics: async () => ({}),
    fetchAchievementWorkbenchTags: async () => ({}),
};
function load(file) {
    if (cache.has(file)) return cache.get(file);
    const filename = path.join(root, file);
    const source = fs.readFileSync(filename, "utf8");
    const descriptor = file.endsWith(".vue") ? parse(source).descriptor : null;
    if (descriptor) {
        assert.deepStrictEqual(compileTemplate({ source: descriptor.template.content, filename, id: "scope" }).errors, []);
    }
    const { code } = babel.transformSync(descriptor ? descriptor.script.content : source, {
        babelrc: false, configFile: false, plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
    });
    const module = { exports: {} };
    new Function("module", "exports", "require", code)(module, module.exports, (name) => {
        if (name.endsWith(".vue") || name === "@element-plus/icons-vue" || name === "xlsx") return {};
        if (name.startsWith("@/service/")) return services;
        if (name === "@/utils/config") return { __Root: "/" };
        if (name === "@jx3box/jx3box-common/js/user") return { isLogin: () => true };
        if (name === "@jx3box/jx3box-common/js/utils") return { showSchoolIcon: () => "" };
        return name.startsWith("@/") ? load(`src/${name.slice(2)}.js`) : require(name);
    });
    cache.set(file, module.exports);
    return module.exports;
}
function instance(component, props = {}) {
    const vm = { ...(component.data?.() || {}), $t: (key) => key, $store: { state: { client: "std" } }, ...props };
    Object.entries(component.methods || {}).forEach(([name, method]) => { vm[name] = method.bind(vm); });
    Object.entries(component.computed || {}).forEach(([name, get]) => {
        Object.defineProperty(vm, name, { get: get.bind(vm) });
    });
    return vm;
}

const metadata = {
    1: { point: 20, general: 1, visible: true },
    2: { point: 0, general: 1, visible: true },
    3: { point: 30, general: 1, visible: true },
    4: { point: 200, general: 1, visible: false },
    5: { point: 300, general: 2, visible: true },
    6: { point: 400, general: 0, visible: false },
    7: { point: 0, general: 3, visible: true },
};
const menus = { mixed: { sub: "mixed", name: "混合目录", achievements: [1, 2, 3, 4, 5, 6, 7] } };
const completedIds = [1, 2, 4, 5, 6, 7];
const plan = { schema: [1, 2, 3, 4, 5, 6, 7], meta: {}, title: "混合方案" };

async function run() {
    const planPage = instance(load("src/components/wiki/leap/AchievementLeapPage.vue").default, {
        metadata, menus, roleState: { completedIds },
    });
    assert.strictEqual(planPage.currentPoints, 920, "方案当前资历包含全档位已获得资历");
    planPage.enrichAchievementItems = async (items) => items;
    const hydrated = await planPage.hydratePlanItems(plan.schema);
    assert.deepStrictEqual(hydrated.items.map((item) => item.id), ["1", "2", "3"]);
    const detail = planPage.buildDetailRoute(plan, [...hydrated.items, { id: "4", completed: false }]);
    assert.deepStrictEqual(detail.items.map((item) => item.id), ["1", "2", "3"]);
    assert.deepStrictEqual([detail.currentPoints, detail.selectedPoints, detail.projectedPoints], [920, 30, 950]);

    const cards = instance(load("src/components/wiki/leap/AchievementLeapPlanList.vue").default, {
        metadata, completedIds, plans: [plan],
    }).planCards;
    assert.deepStrictEqual(cards[0].progress, {
        count: 3, totalPoints: 50, completedPoints: 20, remainingPoints: 30, completedCount: 2, progress: 40,
    });

    const consultation = instance(load("src/components/wiki/consultation/ConsultationPlan.vue").default, {
        plan, metadata, menus, completedIds, maps: [], dimensions: [],
    });
    await consultation.load();
    assert.strictEqual(consultation.error, false);
    assert.deepStrictEqual(consultation.route.items.map((item) => item.id), ["1", "2", "3"]);
    assert.deepStrictEqual(
        [consultation.route.currentPoints, consultation.route.selectedPoints, consultation.route.projectedPoints],
        [920, 30, 950], "当前资历取全档位、方案增加资历只取常规，两种方案的预计达到值一致"
    );
    assert(requests.every((options) => options.includeHidden !== true && options.ids.join(",") === "1,2,3"));

    const progressComponent = load("src/components/wiki/progress/AchievementProgressPage.vue").default;
    const progress = instance(progressComponent, {
        snapshot: { catalog: { metadata, menus }, completedIds, role: { id: "role" }, maps: [], dimensions: [] },
    });
    progress.loadVisibleRecords = async () => {};
    await progress.initializePage();
    assert.strictEqual(progress.resultTotal, 3);
    assert.deepStrictEqual(
        [progress.overallProgress.totalCount, progress.overallProgress.totalPoints, progress.overallProgress.completedPoints],
        [7, 950, 920], "咨询中的角色总览仍统计全档位"
    );
    assert.strictEqual(progress.categories[0].totalCount, 7);
    const normalTier = progress.tierProgress.find((tier) => tier.key === "normal");
    assert.deepStrictEqual([normalTier.totalCount, normalTier.totalPoints, normalTier.completedPoints], [3, 50, 20]);
    assert.strictEqual(normalTier.pointProgress, 40);
    progress.enrichRecords = (records) => records;
    progress.searchRecords = load("src/utils/achievementWorkbench.js").normalizeAchievementWorkbenchRecords(
        Object.keys(metadata).map((id) => ({ ID: id })), { metadata, completedIds }
    );
    assert.deepStrictEqual(progress.filteredSearchRecords.map((item) => item.id), ["1", "2", "3"], "咨询搜索的常规结果不混入其他档位");
    progress.filters.completion = "incomplete";
    assert.deepStrictEqual(progress.filteredSearchRecords.map((item) => item.id), ["3"]);
    assert.strictEqual(Object.keys(metadata).length, 7, "读取方案和咨询不能修改原始目录或历史 schema");
    assert.deepStrictEqual(plan.schema, [1, 2, 3, 4, 5, 6, 7]);

    const summary = instance(load("src/components/wiki/progress/AchievementProgressSummary.vue").default, {
        tiers: progress.tierProgress,
    });
    assert.deepStrictEqual(summary.tierItems.map((item) => item.key), ["normal", "wujia", "hidden", "retired"]);
    const mainProgress = instance(progressComponent, { snapshot: null, metadata, menus, completedIds, roles: [] });
    assert.strictEqual(mainProgress.overallProgress.totalCount, 7, "独立完成进度页继续保留全档位总览");

    const compare = instance(load("src/components/wiki/compare/AchievementComparePage.vue").default, {
        metadata, menus, compareRoles: [{ id: "role", completedAchievements: completedIds }, { id: "friend", completedAchievements: [3] }],
    });
    assert.strictEqual(compare.roleProgress[0].completedPoints, 920);
    assert.strictEqual(compare.roleProgress[0].totalPoints, 950);
    assert.deepStrictEqual(compare.resultIds, ["1", "2", "3"]);
    assert.strictEqual(compare.resultPoints, 50);
    assert.strictEqual(compare.categoryComparison[0].roleProgress[0].totalPoints, 50);
    assert.deepStrictEqual(compare.crossStatistics.map((item) => [item.count, item.points]), [[0, 0], [2, 20], [1, 30], [0, 0]]);
    compare.selectedFilters = ["role,1"];
    assert.deepStrictEqual(compare.resultIds, ["3"]);
    assert.strictEqual(compare.roleProgress[0].completedPoints, 920, "列表筛选不能改变角色总资历");

    const recommendation = {
        role: { current_points: 920 }, recommendations: [{ group: "regular", ids: [3] }],
        camp_restricted_ids: [], upcoming_events: [],
    };
    const recommended = instance(load("src/components/wiki/leap/AchievementLeapRecommendation.vue").default, {
        metadata, recommendation, targetPoints: 950,
    });
    recommended.groups = recommendation.recommendations;
    assert.deepStrictEqual(recommended.selectedItems.map((item) => item.id), ["3"]);
    assert.strictEqual(recommended.selectedPoints, 30);
    assert.strictEqual(recommended.targetSummary.projectedPoints, 950, "推荐使用服务端全部当前资历加上实际入选资历");
    recommended.filters.keyword = "不匹配的搜索";
    assert.strictEqual(recommended.targetSummary.projectedPoints, 950, "展示筛选不改变方案入选资历");
    mainProgress.filters.tier = "wujia";
    assert.deepStrictEqual(mainProgress.filteredAchievementIds, ["5"]);
    assert.strictEqual(mainProgress.overallProgress.completedPoints, 920, "切换常规/五甲只改变列表范围");
    progress.searchRecords.push({ id: "999", tier: "normal", points: 999, completed: false });
    assert.deepStrictEqual(progress.filteredSearchRecords.map((item) => item.id), ["3"], "咨询中的搜索排除不在统计目录中的 ID");
    console.log("Plans use regular visible achievements; current points and role overviews retain all tiers.");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
