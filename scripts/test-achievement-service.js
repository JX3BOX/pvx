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

const originalLocation = global.location;
global.location = { href: "https://www.jx3box.com/pvx/" };
const achievementApiCalls = [];
const achievementApi = loadModule(
    path.resolve(__dirname, "../src/service/achievement.js"),
    { "@jx3box/jx3box-common/js/api": "node-api-test-module" },
    {
        "node-api-test-module": {
            $node: () => ({
                get: async (...args) => {
                    achievementApiCalls.push(["get", ...args]);
                    return { data: { data: [] } };
                },
                post: async (...args) => {
                    achievementApiCalls.push(["post", ...args]);
                    return { data: { data: [] } };
                },
            }),
            $cms: () => ({ get: async () => ({ data: { data: {} } }) }),
            $helper: () => ({ get: async () => ({ data: { data: {} } }) }),
            $next: () => ({ get: async () => ({ data: { data: {} } }) }),
        },
    }
);
if (originalLocation === undefined) delete global.location;
else global.location = originalLocation;

const wikiApiCalls = [];
const wikiApi = loadModule(
    path.resolve(__dirname, "../src/service/wiki.js"),
    { "@jx3box/jx3box-common/js/api": "cms-api-test-module" },
    {
        "cms-api-test-module": {
            $cms: () => ({
                get: async (...args) => {
                    wikiApiCalls.push(["get", ...args]);
                    return { data: { code: 0, data: [] } };
                },
                post: async (...args) => {
                    wikiApiCalls.push(["post", ...args]);
                    return { data: { code: 0, data: [] } };
                },
            }),
        },
    }
);

const calls = {
    create: [],
    delete: [],
    detail: [],
    difficultyDimensions: [],
    difficultyList: [],
    achievementDetail: [],
    achievementRecords: [],
    list: [],
    maps: [],
    progress: [],
    search: [],
    tagsByAchievements: [],
    update: [],
};
let difficultyDimensionFailuresRemaining = 0;

const achievementService = {
    getAchievementPointsV2: async () => ({ data: { data: { points: {} } } }),
    getAchievementsPost: async (params) => {
        calls.achievementRecords.push(params);
        return {
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
        };
    },
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
    searchAchievements: async (params) => {
        calls.search.push(params);
        return { data: { data: { achievements: [] } } };
    },
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
    getWikiAchievementLeapSchemaProgress: async (ids, params) => {
        calls.progress.push([ids, params]);
        return {
            data: {
                data: ids.map((id) => ({
                    achievement_id: id,
                    difficulty: id === "103" ? null : Number(id) - 90,
                })),
            },
        };
    },
    getWikiAchievementDifficultyDimensions: async () => {
        calls.difficultyDimensions.push(true);
        if (difficultyDimensionFailuresRemaining > 0) {
            difficultyDimensionFailuresRemaining -= 1;
            throw new Error("维度接口临时失败");
        }
        return {
            data: {
                code: 0,
                msg: "Success",
                data: [
                    {
                        dimension_id: 5,
                        dimension_key: "overall",
                        dimension_label: "综合难度",
                        sort_order: 50,
                        is_required: 1,
                    },
                    {
                        dimension_id: 1,
                        dimension_key: "money",
                        dimension_label: "金钱",
                        sort_order: 10,
                        is_required: 1,
                    },
                ],
            },
        };
    },
    getWikiAchievementDifficultyList: async (ids, params) => {
        calls.difficultyList.push([ids, params]);
        if (ids.includes(500000)) {
            return { data: { code: 1001, msg: "测试错误", data: null } };
        }
        if (ids.includes(500001)) {
            return { data: { data: [] } };
        }
        if (ids.includes(500002)) {
            return { data: { code: 0, msg: "Success", data: {} } };
        }
        if (ids.includes(500003)) return { data: { code: null, data: [] } };
        if (ids.includes(500004)) return { data: { code: false, data: [] } };
        if (ids.includes(500005)) return { data: { code: "", data: [] } };
        return {
            data: {
                code: 0,
                msg: "Success",
                data: [...ids]
                    .reverse()
                    .filter((id) => id !== 999999)
                    .map((id) => ({
                        achievement_id: id,
                        client: params.client,
                        difficulty: null,
                        completed_role_count: id === 7456 ? 0 : 10,
                        total_role_count: 100,
                        dimensions: {
                            money: id === 7456 ? 0 : 20,
                            time: 40,
                            luck: 50,
                            cost_effectiveness: 10,
                            overall: id === 7456 ? 20 : 40,
                        },
                    })),
            },
        };
    },
    getWikiAchievementTagsByAchievements: async (ids, params) => {
        calls.tagsByAchievements.push([ids, params]);
        return {
            data: {
                code: 0,
                msg: "Success",
                data: [...ids]
                    .reverse()
                    .filter((id) => id !== 999999)
                    .map((id) => ({
                        achievement_id: id,
                        tags: id === 7456 ? [{ tag_id: 24, tag_label: "门派：衍天" }] : [],
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
    await achievementApi.getAchievementsPost({ ids: "7456", client: "origin" });
    await achievementApi.searchAchievements({ keyword: "测试", client: "origin" });
    assert.deepStrictEqual(achievementApiCalls, [
        ["post", "/api/node/achievement/list", { ids: "7456", client: "origin" }],
        ["get", "/api/node/achievement/search", { params: { keyword: "测试", client: "origin" } }],
    ]);

    await wikiApi.getWikiAchievementDifficultyDimensions();
    await wikiApi.getWikiAchievementLeapSchemaProgress([101, 102], { client: "origin" });
    await wikiApi.getWikiAchievementDifficultyList([7456, 7457], { client: "origin" });
    await wikiApi.getWikiAchievementTagsByAchievements([7456], { client: "std" });
    assert.deepStrictEqual(wikiApiCalls, [
        ["get", "/api/cms/pvx/wiki_achievement_difficulty/dimensions"],
        [
            "post",
            "/api/cms/pvx/wiki_achievement_difficulty/list",
            [101, 102],
            { params: { client: "origin" } },
        ],
        [
            "post",
            "/api/cms/pvx/wiki_achievement_difficulty/list",
            [7456, 7457],
            { params: { client: "origin" } },
        ],
        [
            "post",
            "/api/cms/pvx/wiki_achievement_tag/by-achievements",
            [7456],
            { params: { client: "std" } },
        ],
    ]);

    const dimensions = await service.fetchAchievementWorkbenchDifficultyDimensions();
    assert.deepStrictEqual(calls.difficultyDimensions, [true]);
    assert.deepStrictEqual(
        dimensions.map((dimension) => [dimension.id, dimension.key, dimension.sortOrder]),
        [
            ["1", "money", 10],
            ["5", "overall", 50],
        ]
    );

    const cachedDimensions = await service.fetchAchievementWorkbenchDifficultyDimensions();
    assert.strictEqual(cachedDimensions, dimensions);
    assert.deepStrictEqual(calls.difficultyDimensions, [true]);

    const dimensionCallOffset = calls.difficultyDimensions.length;
    const [concurrentDimensionsA, concurrentDimensionsB] = await Promise.all([
        service.fetchAchievementWorkbenchDifficultyDimensions({ force: true }),
        service.fetchAchievementWorkbenchDifficultyDimensions({ force: true }),
    ]);
    assert.deepStrictEqual(concurrentDimensionsA, dimensions);
    assert.deepStrictEqual(concurrentDimensionsB, dimensions);
    assert.strictEqual(calls.difficultyDimensions.length - dimensionCallOffset, 1);

    difficultyDimensionFailuresRemaining = 1;
    await assert.rejects(
        () => service.fetchAchievementWorkbenchDifficultyDimensions({ force: true }),
        /维度接口临时失败/
    );
    const retryCallOffset = calls.difficultyDimensions.length;
    await service.fetchAchievementWorkbenchDifficultyDimensions({ force: true });
    assert.strictEqual(calls.difficultyDimensions.length - retryCallOffset, 1);

    const difficultyMetrics = await service.fetchAchievementWorkbenchDifficultyMetrics(
        ["7456", "07456", "7.456e3", 7457, "7456", 999999],
        { client: "origin", batchSize: 2 }
    );
    assert.deepStrictEqual(calls.difficultyList, [
        [[7456, 7457], { client: "origin" }],
        [[999999], { client: "origin" }],
    ]);
    assert.strictEqual(difficultyMetrics["7456"].difficulty, 2);
    assert.strictEqual(difficultyMetrics["7456"].cost.money, 0);
    assert.strictEqual(difficultyMetrics["7456"].completionStatistics.rate, 0);
    assert.strictEqual(difficultyMetrics["7457"].difficulty, 4);
    assert.strictEqual(difficultyMetrics["999999"], null);

    const defaultDifficultyBatchOffset = calls.difficultyList.length;
    await service.fetchAchievementWorkbenchDifficultyMetrics(
        Array.from({ length: 5001 }, (_, index) => index + 1),
        { client: "std" }
    );
    assert.deepStrictEqual(
        calls.difficultyList.slice(defaultDifficultyBatchOffset).map(([ids]) => ids.length),
        [5000, 1]
    );

    const achievementTags = await service.fetchAchievementWorkbenchTags(["7456", 7457, 999999], {
        client: "std",
        batchSize: 2,
    });
    assert.deepStrictEqual(calls.tagsByAchievements, [
        [[7456, 7457], { client: "std" }],
        [[999999], { client: "std" }],
    ]);
    assert.deepStrictEqual(achievementTags["7456"].tagGroups.schools, ["衍天"]);
    assert.deepStrictEqual(achievementTags["7457"].tags, []);
    assert.deepStrictEqual(achievementTags["999999"].tagGroups, {
        schools: [],
        festivals: [],
        activities: [],
        camps: [],
        unknown: [],
    });

    const defaultTagBatchOffset = calls.tagsByAchievements.length;
    await service.fetchAchievementWorkbenchTags(
        Array.from({ length: 5001 }, (_, index) => index + 1),
        { client: "std" }
    );
    assert.deepStrictEqual(
        calls.tagsByAchievements.slice(defaultTagBatchOffset).map(([ids]) => ids.length),
        [5000, 1]
    );

    await assert.rejects(
        () => service.fetchAchievementWorkbenchDifficultyMetrics([500000]),
        /测试错误/
    );
    await assert.rejects(
        () => service.fetchAchievementWorkbenchDifficultyMetrics([500001]),
        /响应格式异常/
    );
    await assert.rejects(
        () => service.fetchAchievementWorkbenchDifficultyMetrics([500002]),
        /响应格式异常/
    );
    for (const id of [500003, 500004, 500005]) {
        await assert.rejects(
            () => service.fetchAchievementWorkbenchDifficultyMetrics([id]),
            /成就难度加载失败/
        );
    }

    const largeTagIds = Array.from({ length: 20001 }, (_, index) => index + 1);
    const tagCallOffset = calls.tagsByAchievements.length;
    await service.fetchAchievementWorkbenchTags(largeTagIds, { client: "std", batchSize: 25000 });
    assert.deepStrictEqual(
        calls.tagsByAchievements.slice(tagCallOffset).map(([ids]) => ids.length),
        [20000, 1]
    );

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

    const difficulty = await service.fetchAchievementWorkbenchDifficulty(
        ["101", "102", "103"],
        2,
        { client: "origin" }
    );
    assert.deepStrictEqual(calls.progress, [
        [["101", "102"], { client: "origin" }],
        [["103"], { client: "origin" }],
    ]);
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
    assert.strictEqual(calls.achievementRecords.at(-1).client, "std");
    assert.deepStrictEqual(
        hiddenRecords.map((record) => [record.id, record.name, record.tier]),
        [
            ["101", "可见成就", "normal"],
            ["102", "隐藏成就", "hidden"],
        ]
    );

    await service.fetchAchievementWorkbenchRecords({ ids: [101], client: "origin" });
    assert.strictEqual(calls.achievementRecords.at(-1).client, "origin");
    await service.searchAchievementWorkbenchRecords({ keyword: "测试", client: "origin" });
    assert.deepStrictEqual(calls.search, [
        { keyword: "测试", scene: "", client: "origin", _no_page: 1, limit: 99999 },
    ]);

    console.log("Achievement service contract tests passed.");
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
