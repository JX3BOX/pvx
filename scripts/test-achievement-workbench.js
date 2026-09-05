const assert = require("assert");
const path = require("path");
const babel = require("@babel/core");

function loadModule(file) {
    const result = babel.transformFileSync(file, {
        babelrc: false,
        configFile: false,
        presets: [[require.resolve("@babel/preset-env"), { targets: { node: "current" } }]],
    });
    const loadedModule = { exports: {} };
    const evaluate = new Function("module", "exports", "require", result.code);
    evaluate(loadedModule, loadedModule.exports, require);
    return loadedModule.exports;
}

const workbench = loadModule(path.resolve(__dirname, "../src/utils/achievementWorkbench.js"));
const {
    ACHIEVEMENT_WORKBENCH_EMPTY_TEXT,
    ACHIEVEMENT_WORKBENCH_FALLBACK_DIMENSIONS,
    ACHIEVEMENT_WORKBENCH_TIERS,
    applyAchievementWorkbenchEnrichment,
    formatAchievementWorkbenchValue,
    getAchievementWorkbenchDimensionSort,
    getAchievementWorkbenchDimensionValue,
    getAchievementWorkbenchRatingFill,
    normalizeAchievementWorkbenchDifficulty,
    normalizeAchievementWorkbenchDifficultyDimensions,
    normalizeAchievementWorkbenchRecord,
    normalizeAchievementWorkbenchRole,
    normalizeAchievementWorkbenchTags,
    resolveAchievementWorkbenchDimensions,
} = workbench;

const difficultyDimensions = normalizeAchievementWorkbenchDifficultyDimensions([
    {
        dimension_id: 5,
        dimension_key: "overall",
        dimension_label: "综合难度",
        dimension_desc: "获取成就的整体难度",
        sort_order: 50,
        is_required: 1,
    },
    {
        dimension_id: 4,
        dimension_key: "cost_effectiveness",
        dimension_label: "性价比",
        dimension_desc: "综合资历收益与投入成本后的性价比",
        sort_order: 40,
        is_required: 0,
    },
]);

assert.deepStrictEqual(difficultyDimensions, [
    {
        id: "4",
        key: "costEffectiveness",
        apiKey: "cost_effectiveness",
        scoreLabels: [],
        visible: true,
        recommendationDirection: null,
        recommendationWeight: null,
        label: "性价比",
        description: "综合资历收益与投入成本后的性价比",
        sortOrder: 40,
        required: false,
    },
    {
        id: "5",
        key: "overall",
        apiKey: "overall",
        scoreLabels: [],
        visible: true,
        recommendationDirection: null,
        recommendationWeight: null,
        label: "综合难度",
        description: "获取成就的整体难度",
        sortOrder: 50,
        required: true,
    },
]);

assert.deepStrictEqual(
    ACHIEVEMENT_WORKBENCH_FALLBACK_DIMENSIONS.map(({ key, sortOrder, required, i18nKey }) => ({
        key,
        sortOrder,
        required,
        i18nKey,
    })),
    [
        {
            key: "money",
            sortOrder: 10,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.money",
        },
        {
            key: "time",
            sortOrder: 20,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.time",
        },
        {
            key: "luck",
            sortOrder: 30,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.luck",
        },
        {
            key: "costEffectiveness",
            sortOrder: 40,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.costEffectiveness",
        },
        {
            key: "overall",
            sortOrder: 50,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.overall",
        },
    ]
);

assert.deepStrictEqual(
    resolveAchievementWorkbenchDimensions([]).map((dimension) => dimension.key),
    ["money", "time", "luck", "costEffectiveness", "overall"]
);
assert.deepStrictEqual(
    resolveAchievementWorkbenchDimensions([
        {
            dimension_id: 9,
            dimension_key: "operation",
            dimension_label: "操作",
            dimension_desc: "操作要求",
            sort_order: 5,
            is_required: 0,
        },
        {
            dimension_id: 1,
            dimension_key: "money",
            dimension_label: "接口金钱",
            sort_order: 10,
            is_required: 1,
        },
    ]),
    [
        {
            id: "9",
            key: "operation",
            apiKey: "operation",
            scoreLabels: [],
            visible: true,
            recommendationDirection: null,
            recommendationWeight: null,
            label: "操作",
            description: "操作要求",
            sortOrder: 5,
            required: false,
            i18nKey: null,
        },
        {
            id: "1",
            key: "money",
            label: "接口金钱",
            apiKey: "money",
            scoreLabels: [],
            visible: true,
            recommendationDirection: null,
            recommendationWeight: null,
            description: null,
            sortOrder: 10,
            required: true,
            i18nKey: "pages.wiki.difficultyDimensions.money",
        },
    ]
);

const dynamicDimensionRecord = {
    difficulty: 4,
    difficultyDimensions: {
        overall: null,
        operation: 2.5,
        money: 0,
    },
    cost: { money: 3, time: 1, luck: 2 },
    costEffectiveness: 4,
};
const moneyBands = [{ min: 0, label: "免费" }, { min: 20, label: "少量" }, { min: 30, label: "花钱" }, { min: 41, label: "巨花钱" }];
for (const [value, label] of [[0, "免费"], [1.9, "免费"], [2, "少量"], [2.9, "少量"], [3, "花钱"], [4, "花钱"], [4.1, "巨花钱"], [5, "巨花钱"]]) {
    assert.strictEqual(workbench.getAchievementWorkbenchScoreLabel(value, moneyBands), label);
}
for (const [value, label] of [[0.5, "免费"], [1.99, "免费"], [2.99, "少量"], [4.09, "花钱"], ["4.1", "巨花钱"]]) {
    assert.strictEqual(workbench.getAchievementWorkbenchScoreLabel(value, moneyBands), label, "小数不能四舍五入后提前进入下一档");
}
for (const value of [null, undefined, "", false, -1, 5.1]) assert.strictEqual(workbench.getAchievementWorkbenchScoreLabel(value, moneyBands), null);
assert.strictEqual(workbench.getAchievementWorkbenchScoreLabel(5, [{ min: 0, label: "低概率" }, { min: 50, label: "纯看脸" }]), "纯看脸");
assert.strictEqual(workbench.getAchievementWorkbenchScoreLabel(4.9, [{ min: 0, label: "低概率" }, { min: 50, label: "纯看脸" }]), "低概率");
assert.strictEqual(workbench.getAchievementWorkbenchScoreLabel(2, []), null);
const labeledDimensions = normalizeAchievementWorkbenchDifficultyDimensions([{ dimension_key: "money", score_labels: moneyBands }]);
assert.deepStrictEqual(labeledDimensions[0].scoreLabels, moneyBands);
assert.deepStrictEqual(resolveAchievementWorkbenchDimensions(labeledDimensions)[0].scoreLabels, moneyBands, "normalizing twice must preserve labels");
assert.strictEqual(getAchievementWorkbenchDimensionValue(dynamicDimensionRecord, "operation"), 2.5);
assert.strictEqual(getAchievementWorkbenchDimensionValue(dynamicDimensionRecord, "money"), 0);
assert.strictEqual(getAchievementWorkbenchDimensionValue(dynamicDimensionRecord, "overall"), null);
assert.strictEqual(getAchievementWorkbenchDimensionValue(dynamicDimensionRecord, "time"), 1);
assert.strictEqual(getAchievementWorkbenchDimensionValue(dynamicDimensionRecord, "missing"), null);
assert.strictEqual(getAchievementWorkbenchDimensionValue({ difficultyDimensions: { operation: false } }, "operation"), null);

assert.strictEqual(getAchievementWorkbenchRatingFill(0), 0);
assert.strictEqual(getAchievementWorkbenchRatingFill(2.5), 50);
assert.strictEqual(getAchievementWorkbenchRatingFill(5), 100);
assert.strictEqual(getAchievementWorkbenchRatingFill(6), 100);
assert.strictEqual(getAchievementWorkbenchRatingFill(-1), 0);
assert.strictEqual(getAchievementWorkbenchRatingFill(null), null);
assert.strictEqual(getAchievementWorkbenchRatingFill("invalid"), null);
assert.deepStrictEqual(getAchievementWorkbenchDimensionSort("dimension:costEffectiveness:asc"), {
    key: "costEffectiveness",
    direction: "asc",
});
assert.strictEqual(getAchievementWorkbenchDimensionSort("difficulty-asc"), null);
assert.strictEqual(getAchievementWorkbenchDimensionSort("dimension:money:desc"), null);

const difficultyRecord = normalizeAchievementWorkbenchDifficulty({
    achievement_id: 7456,
    client: "std",
    difficulty: null,
    remark: "仅供后台使用",
    completed_role_count: 64480,
    total_role_count: 163396,
    dimensions: {
        money: 10,
        time: 40,
        luck: 50,
        cost_effectiveness: 10,
        overall: 20,
    },
});

assert.strictEqual(difficultyRecord.achievementId, "7456");
assert.strictEqual(difficultyRecord.client, "std");
assert.strictEqual(difficultyRecord.difficulty, 2);
assert.deepStrictEqual(difficultyRecord.difficultyDimensions, {
    money: 1,
    time: 4,
    luck: 5,
    costEffectiveness: 1,
    overall: 2,
});
assert.deepStrictEqual(difficultyRecord.cost, { money: 1, time: 4, luck: 5 });
assert.strictEqual(difficultyRecord.costEffectiveness, 1);
assert.deepStrictEqual(difficultyRecord.completionStatistics, {
    completedRoleCount: 64480,
    totalRoleCount: 163396,
    rate: 64480 / 163396,
});
assert.strictEqual(Object.prototype.hasOwnProperty.call(difficultyRecord, "remark"), false);

const zeroDifficultyRecord = normalizeAchievementWorkbenchDifficulty({
    achievement_id: "0-score",
    difficulty: 30,
    completed_role_count: 0,
    total_role_count: 0,
    dimensions: { money: 0, overall: 0, future_dimension: null },
});
assert.strictEqual(zeroDifficultyRecord.difficulty, 0);
assert.strictEqual(zeroDifficultyRecord.cost.money, 0);
assert.strictEqual(zeroDifficultyRecord.difficultyDimensions.futureDimension, null);
assert.strictEqual(zeroDifficultyRecord.completionStatistics.rate, null);

const legacyDifficultyRecord = normalizeAchievementWorkbenchDifficulty({
    achievement_id: 42,
    difficulty: 30,
    dimensions: {},
});
assert.strictEqual(legacyDifficultyRecord.difficulty, 3);

const explicitNullOverallDifficultyRecord = normalizeAchievementWorkbenchDifficulty({
    achievement_id: 44,
    difficulty: 30,
    dimensions: { overall: null },
});
assert.strictEqual(explicitNullOverallDifficultyRecord.difficulty, null);

const invalidDifficultyRecord = normalizeAchievementWorkbenchDifficulty({
    achievement_id: 43,
    difficulty: 55,
    dimensions: {
        money: -10,
        time: false,
        luck: "20",
        overall: 60,
    },
});
assert.strictEqual(invalidDifficultyRecord.difficulty, null);
assert.deepStrictEqual(invalidDifficultyRecord.cost, { money: null, time: null, luck: 2 });
assert.strictEqual(invalidDifficultyRecord.difficultyDimensions.overall, null);

const tagBundle = normalizeAchievementWorkbenchTags([
    { tag_id: 24, tag_label: "门派：衍天", tag_desc: "" },
    { tag_id: 25, tag_label: "节日:清明", tag_desc: "清明活动" },
    { tag_id: 26, tag_label: "活动：周年" },
    { tag_id: 27, tag_label: "阵营：浩气" },
    { tag_id: 28, tag_label: "难度：休闲" },
    { tag_id: 29, tag_label: "绝版" },
    { tag_id: 30, tag_label: "门派：衍天" },
]);

assert.deepStrictEqual(tagBundle.tagGroups, {
    schools: ["衍天"],
    festivals: ["清明"],
    activities: ["周年"],
    camps: ["浩气"],
    unknown: ["难度：休闲", "绝版"],
});
assert.deepStrictEqual(tagBundle.tags[0], {
    id: "24",
    label: "门派：衍天",
    description: null,
    type: "school",
    category: "门派",
    value: "衍天",
});
assert.strictEqual(tagBundle.tags[1].type, "festival");
assert.strictEqual(tagBundle.tags[1].description, "清明活动");

const enrichedRecords = applyAchievementWorkbenchEnrichment(
    [
        normalizeAchievementWorkbenchRecord({ ID: 7456, Name: "测试成就", costTier: "free" }),
        normalizeAchievementWorkbenchRecord({ ID: 999999, Name: "未配置成就", difficulty: 1.5 }),
    ],
    {
        difficultyById: {
            7456: difficultyRecord,
            999999: null,
        },
        tagsById: {
            7456: tagBundle,
        },
    }
);

assert.strictEqual(enrichedRecords[0].difficulty, 2);
assert.deepStrictEqual(enrichedRecords[0].difficultyDimensions, difficultyRecord.difficultyDimensions);
assert.deepStrictEqual(enrichedRecords[0].cost, { money: 1, time: 4, luck: 5, tier: "free" });
assert.strictEqual(enrichedRecords[0].costEffectiveness, 1);
assert.deepStrictEqual(enrichedRecords[0].completionStatistics, difficultyRecord.completionStatistics);
assert.deepStrictEqual(enrichedRecords[0].tagGroups.schools, ["衍天"]);
assert.strictEqual(enrichedRecords[0].estimatedMinutes, null);
assert.strictEqual(enrichedRecords[0].guideNote, null);
assert.strictEqual(enrichedRecords[1].difficulty, 1.5);
assert.deepStrictEqual(enrichedRecords[1].difficultyDimensions, {});
assert.deepStrictEqual(enrichedRecords[1].tags, []);

const explicitNullEnrichment = applyAchievementWorkbenchEnrichment(
    [
        normalizeAchievementWorkbenchRecord({
            ID: 1025,
            difficulty: 4,
            money: 4,
            time: 4,
            luck: 4,
        }),
    ],
    {
        difficultyById: {
            1025: normalizeAchievementWorkbenchDifficulty({
                achievement_id: 1025,
                difficulty: 40,
                dimensions: {
                    overall: null,
                    money: null,
                    time: 0,
                    luck: null,
                    cost_effectiveness: null,
                },
            }),
        },
    }
)[0];
assert.strictEqual(explicitNullEnrichment.difficulty, null);
assert.strictEqual(explicitNullEnrichment.cost.money, null);
assert.strictEqual(explicitNullEnrichment.cost.time, 0);
assert.strictEqual(explicitNullEnrichment.cost.luck, null);
assert.strictEqual(explicitNullEnrichment.costEffectiveness, null);

const currentRecord = normalizeAchievementWorkbenchRecord(
    {
        ID: 1024,
        Name: "轻功试炼",
        ShortDesc: "完成一次轻功试炼",
        Sub: 12,
        Detail: 34,
        IconID: 567,
        SceneID: 89,
        Point: 0,
        ItemType: "item",
        ItemID: 9001,
    },
    {
        metadata: {
            1024: { point: 0, general: 1, visible: true },
        },
        completedIds: [1024],
    }
);

assert.strictEqual(currentRecord.id, "1024");
assert.strictEqual(currentRecord.points, 0);
assert.strictEqual(currentRecord.completed, true);
assert.strictEqual(currentRecord.visible, true);
assert.strictEqual(currentRecord.tier, ACHIEVEMENT_WORKBENCH_TIERS.NORMAL);
assert.strictEqual(currentRecord.difficulty, null);
assert.strictEqual(currentRecord.cost.money, null);
assert.strictEqual(formatAchievementWorkbenchValue(currentRecord.points), 0);
assert.strictEqual(formatAchievementWorkbenchValue(currentRecord.difficulty), ACHIEVEMENT_WORKBENCH_EMPTY_TEXT);
assert.strictEqual(normalizeAchievementWorkbenchRecord({ ID: 1024 }).completed, null);

const hiddenWujiaRecord = normalizeAchievementWorkbenchRecord(
    { ID: 2048, Name: "隐藏五甲", Point: 40 },
    {
        metadata: {
            2048: { point: 40, general: 2, visible: false },
        },
    }
);
assert.strictEqual(hiddenWujiaRecord.tier, ACHIEVEMENT_WORKBENCH_TIERS.HIDDEN);

const prototypeRecord = normalizeAchievementWorkbenchRecord({
    id: "a1",
    name: "高手！万花",
    categoryId: "wuxue",
    categoryName: "武学",
    subCategory: "门派武学",
    map: "扬州",
    points: 25,
    tier: "limited",
    difficulty: 3,
    estMinutes: 45,
    money: 1,
    time: 2,
    luck: 4,
    cls: "万花",
    note: "仅万花门派",
    doneBy: { r1: true, r2: false },
});

assert.strictEqual(prototypeRecord.tier, ACHIEVEMENT_WORKBENCH_TIERS.RETIRED);
assert.strictEqual(prototypeRecord.retired, true);
assert.strictEqual(prototypeRecord.estimatedMinutes, 45);
assert.deepStrictEqual(prototypeRecord.cost, { money: 1, time: 2, luck: 4, tier: null });
assert.strictEqual(prototypeRecord.restriction.school, "万花");
assert.strictEqual(prototypeRecord.guideNote, "仅万花门派");
assert.deepStrictEqual(prototypeRecord.completionByRole, { r1: true, r2: false });

const role = normalizeAchievementWorkbenchRole(
    {
        ID: 456,
        jx3id: 123,
        name: "叶知秋",
        server: "蝶恋花",
        mount: "藏剑",
        body_type: "成男",
        level: "12640",
    },
    { isSelf: true }
);

assert.deepStrictEqual(role, {
    id: "123",
    jx3id: "123",
    roleId: 456,
    name: "叶知秋",
    server: "蝶恋花",
    school: "藏剑",
    bodyType: "成男",
    level: 12640,
    isSelf: true,
    updatedAt: null,
});

console.log("Achievement workbench adapter tests passed.");
