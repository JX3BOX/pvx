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
    tags = async () => {
        throw new Error("tags offline");
    };
    await picker.loadPage(["6"]);
    assert.strictEqual(picker.detailError, false);
    assert.strictEqual(picker.enrichmentError, true, "optional enrichment failure does not block loaded records");
    assert.strictEqual(picker.records[0].id, "6");
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
