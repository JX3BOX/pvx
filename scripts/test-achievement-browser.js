const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { parse } = require("@vue/compiler-sfc");
const root = path.resolve(__dirname, "..");
const cache = new Map();
function load(file, dependencies = {}) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    const script = file.endsWith(".vue") ? parse(source).descriptor.script.content : source;
    const { code } = babel.transformSync(script, {
        babelrc: false,
        configFile: false,
        plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
    });
    const module = { exports: {} };
    new Function("module", "exports", "require", code)(module, module.exports, (name) => {
        if (name in dependencies) return dependencies[name];
        if (name.endsWith(".vue") || name === "@element-plus/icons-vue") return {};
        if (!name.startsWith("@/")) return require(name);
        const target = `src/${name.slice(2)}.js`;
        if (!cache.has(target)) cache.set(target, load(target));
        return cache.get(target);
    });
    return module.exports;
}
const browse = load("src/utils/achievementBrowse.js");
const leap = load("src/utils/achievementLeap.js");
const { normalizeAchievementWorkbenchTags } = load("src/utils/achievementWorkbench.js");
const { buildAchievementSchoolEligibilityContext } = load("src/utils/achievementSchoolEligibility.js");
const metadata = Object.fromEntries(
    Array.from({ length: 80 }, (_, index) => [String(index + 1), { point: 10, general: 1, visible: true }])
);
metadata[3].point = 0;
metadata[4].general = 0;
metadata[80].visible = false;
const menus = {
    1: { sub: 1, name: "杂闻", children: [{ sub: 1, detail: 11, name: "江湖", achievements: [1, 2, 5, 6, 80] }] },
    2: { sub: 2, name: "杂闻", children: [{ sub: 2, detail: 22, name: "江湖", achievements: [1, 7] }] },
    3: { sub: 3, name: "已完成分类", achievements: [2] },
};
const categories = browse.buildAchievementBrowseCategories({
    menus,
    metadata,
    completedIds: ["2"],
    ids: ["1", "5", "7", "80"],
    allLabel: "全部",
});
assert.strictEqual(categories.length, 2, "empty categories are hidden and duplicate names are merged");
assert.strictEqual(categories[1].totalCount, 6, "category progress counts unique achievement IDs");
assert.strictEqual(categories[1].completedCount, 1);
assert.strictEqual(categories[1].children.length, 1);
assert.deepStrictEqual(categories[1].paths, [["1"], ["2"]]);
assert.deepStrictEqual(categories[1].children[0].paths, [
    ["1", "11"],
    ["2", "22"],
]);
const records = Object.keys(metadata).map((id) => ({
    id,
    name: `成就 ${id}`,
    shortDescription: id === "7" ? "描述关键字" : "简介",
    points: metadata[id].point,
    category: { id: "1", subId: "11" },
    map: { id: "100" },
    mapIds: ["100"],
}));
let fetchRecords = async ({ ids }) => records.filter((record) => ids.includes(record.id));
let difficulty = async () => ({});
let tags = async () => ({});
const recordRequests = [];
const dialog = load("src/components/wiki/leap/AchievementLeapAddDialog.vue", {
    "@/service/achievementWorkbench": {
        fetchAchievementWorkbenchRecordsBatched: (...args) => {
            recordRequests.push(args[0]);
            return fetchRecords(...args);
        },
        fetchAchievementWorkbenchDifficultyMetrics: (...args) => difficulty(...args),
        fetchAchievementWorkbenchTags: (...args) => tags(...args),
    },
}).default;
const browser = load("src/components/wiki/leap/AchievementSelectionBrowser.vue").default;
function vm(component, props) {
    const emitted = [];
    const instance = {
        ...component.data(),
        ...props,
        $t: (key) => key,
        $emit: (...args) => emitted.push(args),
        $nextTick: (fn) => fn(),
        $refs: {},
        emitted,
    };
    for (const [name, method] of Object.entries(component.methods || {})) instance[name] = method.bind(instance);
    for (const [name, getter] of Object.entries(component.computed || {}))
        Object.defineProperty(instance, name, { get: () => getter.call(instance) });
    return instance;
}
async function main() {
    const picker = vm(dialog, {
        modelValue: false,
        metadata,
        menus,
        completedIds: ["2"],
        schoolEligibility: null,
        maps: [{ id: "100", name: "扬州" }],
        client: "std",
        selectedIds: ["1"],
        disabled: false,
    });
    await picker.loadIndex();
    assert.strictEqual(
        picker.index.length,
        76,
        "the picker includes the complete catalog beyond the old 60-item limit"
    );
    assert.ok(
        !picker.index.some((record) => ["2", "3", "4"].includes(record.id)),
        "completed, zero-point and retired items are excluded"
    );
    assert.ok(
        !picker.index.some((record) => record.id === "80"),
        "hidden regular achievements are excluded from the add dialog"
    );
    assert.ok(!recordRequests[0].ids.includes("80"), "hidden details are never requested for the catalog");
    assert.ok(!recordRequests[0].includeHidden, "the catalog does not fetch hidden details individually");
    assert.ok(
        picker.index.some((record) => record.id === "1"),
        "selected records remain visible for marking"
    );
    const view = vm(browser, {
        index: picker.index,
        records,
        metadata,
        menus,
        maps: picker.maps,
        completedIds: ["2"],
        selectedIds: ["1"],
        filters: { keyword: "", mapIds: [], categories: [] },
        disabled: false,
    });
    assert.strictEqual(view.pageIds.length, 15);
    assert.strictEqual(view.canAdd(records[0]), false);
    assert.strictEqual(view.canAdd(records[4]), true);
    view.page = 6;
    assert.strictEqual(view.pageIds.length, 1, "last-page items are reachable");
    view.filters.keyword = "描述关键字";
    assert.deepStrictEqual(view.pageIds, ["7"], "description search works and the page is clamped");
    view.updateFilter("categories", [["1", "11"]]);
    assert.deepStrictEqual(view.emitted.at(-1)[1].categories, [["1", "11"]]);
    view.filters = { keyword: "", mapIds: [], categories: [["1", "11"]] };
    assert.ok(view.matching.every((record) => record.category.id === "1" && record.category.subId === "11"),
        "category filters preserve the candidate list contract");
    picker.add(records[0]);
    assert.strictEqual(picker.emitted.length, 0, "selected items cannot emit another addition");
    picker.add(records[79]);
    assert.strictEqual(picker.emitted.length, 0, "hidden items cannot be added");
    picker.add(records[4]);
    assert.strictEqual(picker.emitted.at(-1)[0], "add");
    const editedRoute = leap.addAchievementLeapRouteItem(
        { items: [], currentPoints: 100, targetPoints: 110 },
        picker.emitted.at(-1)[1]
    );
    assert.strictEqual(editedRoute.selectedPoints, 10);
    assert.strictEqual(editedRoute.averageCostScore, null, "unknown cost remains null in the edited route summary");
    assert.strictEqual(editedRoute.totalMinutes, null, "unknown duration is normalized for the existing route metrics");
    await picker.loadPage(["1", "5"]);
    assert.ok(!recordRequests.at(-1).includeHidden, "page loading also excludes hidden detail fallback");
    assert.deepStrictEqual(
        picker.records.map((record) => record.id),
        ["1", "5"]
    );
    difficulty = async () => {
        throw new Error("difficulty offline");
    };
    await picker.loadPage(["6"]);
    assert.strictEqual(picker.detailError, false);
    assert.strictEqual(picker.enrichmentError, true, "optional enrichment failure does not block loaded records");
    assert.strictEqual(picker.records[0].id, "6");
    difficulty = async () => ({});
    const schoolTags = {
        5: normalizeAchievementWorkbenchTags([{ tag_label: "名称不用于判定", tag_type: "mount", tag_value: { operator: "include", values: [2] } }]),
        6: normalizeAchievementWorkbenchTags([{ tag_label: "多门派", tag_type: "mount", tag_value: { operator: "include", values: [1, 2] } }]),
        7: normalizeAchievementWorkbenchTags([{ tag_label: "排除天策", tag_type: "mount", tag_value: { operator: "exclude", values: [1] } }]),
        8: normalizeAchievementWorkbenchTags([{ tag_label: "排除万花", tag_type: "mount", tag_value: { operator: "exclude", values: [2] } }]),
        9: normalizeAchievementWorkbenchTags([{ tag_label: "门派：万花", tag_type: "normal", tag_value: null }]),
        10: normalizeAchievementWorkbenchTags([{ tag_label: "无相楼", tag_type: "learnable_school", tag_value: { key: "wuxianglou" } }]),
        11: normalizeAchievementWorkbenchTags([{ tag_label: "无效门派规则", tag_type: "mount", tag_value: null }]),
        12: normalizeAchievementWorkbenchTags([{ tag_label: "江湖角色", tag_type: "mount", tag_value: { operator: "include", values: [0] } }]),
        15: normalizeAchievementWorkbenchTags([{ tag_label: "接口允许天策", tag_type: "mount", tag_value: { operator: "include", values: [1] } }]),
    };
    tags = async () => schoolTags;
    const schoolPicker = vm(dialog, {
        modelValue: false, metadata, menus, completedIds: ["2"], maps: [], client: "std",
        selectedIds: [], disabled: false,
        schoolEligibility: buildAchievementSchoolEligibilityContext({ roleSchool: "天策" }),
    });
    schoolPicker.schoolEligibility.restrictionById.set("14", { schools: ["万花"], source: "legacy" });
    schoolPicker.schoolEligibility.restrictionById.set("15", { schools: ["万花"], source: "legacy" });
    await schoolPicker.loadIndex();
    assert.ok(!schoolPicker.index.some((item) => ["5", "7", "11", "12"].includes(item.id)),
        "API mount include/exclude values filter the whole catalog before pagination");
    assert.ok(["6", "8", "9", "10"].every((id) => schoolPicker.index.some((item) => item.id === id)),
        "own-school, multi-school, unrestricted and learnable-school records remain available");
    assert.ok(!schoolPicker.index.some((item) => item.id === "14"), "missing mount rules retain existing explicit restrictions");
    assert.ok(schoolPicker.index.some((item) => item.id === "15"), "API rules take precedence over legacy directory restrictions");
    schoolPicker.add(records[4]);
    assert.strictEqual(schoolPicker.emitted.length, 0, "restricted IDs cannot bypass addition validation");
    schoolPicker.add(records[5]);
    assert.strictEqual(schoolPicker.emitted.at(-1)[1].id, "6");
    assert.strictEqual(schoolPicker.emitted.at(-1)[1].tags[0].ruleType, "mount");
    schoolPicker.tagCache = { ...schoolPicker.tagCache, 6: schoolTags[5] };
    schoolPicker.add(records[5]);
    assert.strictEqual(schoolPicker.emitted.length, 1, "addition rechecks rules even if an ID remains in the index");
    tags = async () => { throw new Error("school rules offline"); };
    schoolPicker.resetContext();
    await schoolPicker.loadIndex();
    assert.strictEqual(schoolPicker.indexError, true, "missing school rules must not become unrestricted candidates");
    assert.deepStrictEqual(schoolPicker.index, []);
    tags = async () => schoolTags;
    schoolPicker.schoolEligibility = buildAchievementSchoolEligibilityContext({ roleSchool: "万花" });
    schoolPicker.resetContext();
    await schoolPicker.loadIndex();
    assert.ok(schoolPicker.index.some((item) => item.id === "5"), "changing role reloads school eligibility");
    assert.ok(!schoolPicker.index.some((item) => item.id === "8"));
    schoolPicker.schoolEligibility = buildAchievementSchoolEligibilityContext({ roleSchool: 0 });
    schoolPicker.resetContext();
    await schoolPicker.loadIndex();
    assert.ok(schoolPicker.index.some((item) => item.id === "12"), "school ID 0 is a real role school, not missing data");
    schoolPicker.schoolEligibility = null;
    schoolPicker.resetContext();
    await schoolPicker.loadIndex();
    assert.ok(!schoolPicker.index.some((item) => item.id === "6"), "unknown role school cannot pass a mount rule");
    assert.ok(schoolPicker.index.some((item) => item.id === "9"), "unknown role still sees unrestricted records");
    let resolveOldTags;
    tags = () => new Promise((resolve) => { resolveOldTags = resolve; });
    schoolPicker.resetContext();
    const oldSchoolIndex = schoolPicker.loadIndex();
    schoolPicker.schoolEligibility = buildAchievementSchoolEligibilityContext({ roleSchool: "天策" });
    schoolPicker.resetContext();
    tags = async () => schoolTags;
    await schoolPicker.loadIndex();
    const currentSchoolIds = schoolPicker.index.map((item) => item.id);
    resolveOldTags({});
    await oldSchoolIndex;
    assert.deepStrictEqual(schoolPicker.index.map((item) => item.id), currentSchoolIds,
        "old school tag requests cannot overwrite a new role's filtered catalog");
    tags = async () => ({});
    let resolveOld;
    fetchRecords = () =>
        new Promise((resolve) => {
            resolveOld = resolve;
        });
    const old = picker.loadPage(["7"]);
    fetchRecords = async ({ ids }) => records.filter((record) => ids.includes(record.id));
    await picker.loadPage(["8"]);
    resolveOld([records[6]]);
    await old;
    assert.deepStrictEqual(
        picker.records.map((record) => record.id),
        ["8"],
        "old pages cannot overwrite new results"
    );
    fetchRecords = () =>
        new Promise((resolve) => {
            resolveOld = resolve;
        });
    picker.indexReady = false;
    const staleIndex = picker.loadIndex();
    picker.resetContext();
    resolveOld(records);
    await staleIndex;
    assert.deepStrictEqual(picker.index, [], "old role or client requests cannot restore a stale catalog");
    console.log(
        "Achievement browser catalog, merged categories, pagination, selection and stale-loading tests passed."
    );
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
