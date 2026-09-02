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
    ACHIEVEMENT_WORKBENCH_TIERS,
    formatAchievementWorkbenchValue,
    normalizeAchievementWorkbenchRecord,
    normalizeAchievementWorkbenchRole,
} = workbench;

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
    name: "叶知秋",
    server: "蝶恋花",
    school: "藏剑",
    bodyType: "成男",
    level: 12640,
    isSelf: true,
    updatedAt: null,
});

console.log("Achievement workbench adapter tests passed.");
