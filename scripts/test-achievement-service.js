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
const workbench = loadModule(path.resolve(__dirname, "../src/utils/achievementWorkbench.js"));

const calls = {
    create: [],
    delete: [],
    detail: [],
    achievementDetail: [],
    list: [],
    maps: [],
    progress: [],
    update: [],
};

const achievementService = {
    getAchievementPointsV2: async () => ({ data: { data: { points: {} } } }),
    getAchievementsPost: async () => ({
        data: {
            data: [
                {
                    ID: 101,
                    Name: "可见成就",
                    Point: 10,
                    Visible: true,
                },
            ],
        },
    }),
    get_achievement: async (id, config) => {
        calls.achievementDetail.push([id, config]);
        return {
            data: {
                data: {
                    achievement: {
                        ID: Number(id),
                        Name: "隐藏成就",
                        Point: 20,
                        Visible: false,
                    },
                },
            },
        };
    },
    getMapList: async (params) => {
        calls.maps.push(params);
        return {
            data: {
                data: [
                    { ID: 101, MapName: "扬州", Region: 1, RegionName: "中原" },
                    { ID: 102, MapName: "1024_格子图", Region: 0, RegionName: null },
                    { id: 103, name: "成都", region: 2, regionName: "巴蜀" },
                    { ID: 104, MapName: "无区域场景", Region: 0 },
                ],
            },
        };
    },
    getMenus: async () => ({ data: { data: { menus: {} } } }),
    getRoleGameAchievements: async () => ({ data: { data: {} } }),
    searchAchievements: async () => ({ data: { data: { achievements: [] } } }),
};
const teamService = {
    getUserRoles: async () => ({ data: { data: { list: [] } } }),
};
const wikiService = {
    createdWikiAchievementLeapSchema: async (payload) => {
        calls.create.push(payload);
        return { data: { data: { id: 21, title: payload.title } } };
    },
    deleteWikiAchievementLeapSchema: async (id) => {
        calls.delete.push(id);
        return { data: { code: 0 } };
    },
    getMyKith: async () => ({ data: { data: [] } }),
    getMyKithRoles: async () => ({ data: { data: [] } }),
    getWikiAchievementLeapSchema: async (id) => {
        calls.detail.push(id);
        return { data: { data: { id, title: "详情方案", schema: ["101", "102"] } } };
    },
    getWikiAchievementLeapSchemaList: async (params) => {
        calls.list.push(params);
        return {
            data: {
                data: {
                    list: [{ id: 8, title: "列表方案", schema: "101,102" }],
                    total: 7,
                },
            },
        };
    },
    getWikiAchievementLeapSchemaProgress: async (ids) => {
        calls.progress.push(ids);
        return {
            data: {
                data: ids.map((id) => ({
                    achievement_id: id,
                    difficulty: id === "103" ? null : Number(id) - 90,
                })),
            },
        };
    },
    updateWikiAchievementLeapSchema: async (id, payload) => {
        calls.update.push([id, payload]);
        return { data: { data: { id, title: `${payload.title}-已更新` } } };
    },
};

const service = loadModule(
    path.resolve(__dirname, "../src/service/achievementWorkbench.js"),
    {
        "@/service/achievement": "achievement-service-test-module",
        "@/service/team": "team-service-test-module",
        "@/service/wiki": "wiki-service-test-module",
        "@/utils/achievementWorkbench": "achievement-workbench-test-module",
        "@/utils/achievementLeap": "achievement-leap-test-module",
        "@/utils/achievementStatistics": "achievement-statistics-test-module",
    },
    {
        "achievement-service-test-module": achievementService,
        "team-service-test-module": teamService,
        "wiki-service-test-module": wikiService,
        "achievement-workbench-test-module": workbench,
        "achievement-leap-test-module": leap,
        "achievement-statistics-test-module": statistics,
    }
);

(async () => {
    const params = { page: 2, per: 10, client: "std" };
    const plans = await service.fetchAchievementWorkbenchLeapPlans(params);
    assert.deepStrictEqual(calls.list, [params]);
    assert.strictEqual(plans.total, 7);
    assert.strictEqual(plans.list[0].id, "8");
    assert.deepStrictEqual(plans.list[0].schema, ["101", "102"]);

    const detail = await service.fetchAchievementWorkbenchLeapPlan(8);
    assert.deepStrictEqual(calls.detail, [8]);
    assert.strictEqual(detail.id, "8");
    assert.deepStrictEqual(detail.schema, ["101", "102"]);

    const payload = {
        title: "冲刺测试",
        desc: "保留现有接口字段",
        schema: ["101", "102"],
        meta: {
            targetPoints: 100000,
            estimatedMinutes: null,
            cost: { money: null, time: null, luck: null },
        },
    };
    const created = await service.saveAchievementWorkbenchLeapPlan(payload);
    assert.deepStrictEqual(calls.create, [payload]);
    assert.strictEqual(created.id, "21");
    assert.deepStrictEqual(created.meta, payload.meta);

    const updated = await service.saveAchievementWorkbenchLeapPlan(payload, "21");
    assert.deepStrictEqual(calls.update, [["21", payload]]);
    assert.strictEqual(updated.id, "21");
    assert.strictEqual(updated.title, "冲刺测试-已更新");
    assert.deepStrictEqual(updated.meta, payload.meta);

    await service.deleteAchievementWorkbenchLeapPlan("21");
    assert.deepStrictEqual(calls.delete, ["21"]);

    const difficulty = await service.fetchAchievementWorkbenchDifficulty(["101", "102", "103"], 2);
    assert.deepStrictEqual(calls.progress, [["101", "102"], ["103"]]);
    assert.deepStrictEqual(difficulty, { 101: 1.1, 102: 1.2, 103: null });

    const maps = await service.fetchAchievementWorkbenchMaps("std");
    assert.deepStrictEqual(calls.maps, [{ client: "std", _no_page: 1 }]);
    assert.deepStrictEqual(maps, [
        { id: "101", name: "扬州", regionId: "1", regionName: "中原" },
        { id: "103", name: "成都", regionId: "2", regionName: "巴蜀" },
    ]);

    const hiddenRecords = await service.fetchAchievementWorkbenchRecords({
        ids: ["101", "102"],
        metadata: {
            101: { point: 10, general: 1, visible: true },
            102: { point: 20, general: 1, visible: false },
        },
        client: "std",
        includeHidden: true,
    });
    assert.deepStrictEqual(calls.achievementDetail, [["102", { params: { client: "std" } }]]);
    assert.deepStrictEqual(
        hiddenRecords.map((record) => [record.id, record.name, record.tier]),
        [
            ["101", "可见成就", "normal"],
            ["102", "隐藏成就", "hidden"],
        ]
    );

    console.log("Achievement service contract tests passed.");
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
