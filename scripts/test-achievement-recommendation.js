const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { parse } = require("@vue/compiler-sfc");
const { compile } = require("@vue/compiler-dom");
const vue = require("vue");
const root = path.resolve(__dirname, "..");

function load(file, dependencies = {}) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    const source = file.endsWith(".vue") ? parse(text).descriptor.script.content : text;
    const { code } = babel.transformSync(source, {
        babelrc: false,
        configFile: false,
        plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
    });
    const module = { exports: {} };
    new Function("module", "exports", "require", code)(module, module.exports, (key) => {
        if (key in dependencies) return dependencies[key];
        throw new Error(`Unexpected dependency: ${key}`);
    });
    return module.exports;
}

const utils = load("src/utils/achievementRecommendation.js");
const workbench = load("src/utils/achievementWorkbench.js");
const definitions = workbench.normalizeAchievementWorkbenchDifficultyDimensions([
    { dimension_id: 1, dimension_key: "cost_effectiveness", dimension_label: "性价比", is_visible: false,
        recommendation_direction: "higher", recommendation_weight: "1.25" },
    { dimension_id: 2, dimension_key: "time", dimension_label: "时间", is_visible: true,
        recommendation_direction: "lower", recommendation_weight: "0.00" },
]);
assert.strictEqual(definitions[0].recommendationWeight, 1.25);
assert.strictEqual(definitions[1].recommendationWeight, 0);
for (const weight of [0, 3, 9.99, 10]) {
    const [dimension] = workbench.normalizeAchievementWorkbenchDifficultyDimensions([
        { dimension_id: 1, dimension_key: "time", dimension_label: "Time", recommendation_weight: weight },
    ]);
    assert.strictEqual(dimension.recommendationWeight, weight);
}
assert.strictEqual(definitions[0].apiKey, "cost_effectiveness");
assert.strictEqual(workbench.normalizeAchievementWorkbenchDifficultyDimensions(definitions)[0].apiKey, "cost_effectiveness");
assert.deepStrictEqual(workbench.resolveAchievementWorkbenchDimensions(definitions).map((d) => d.key), ["time"]);
assert.deepStrictEqual(workbench.resolveAchievementWorkbenchDimensions(definitions.slice(0, 1)), [], "all hidden must not restore built-in stars");
const categories = [{ id: "17", sourceIds: ["17", "41"] }, { id: "11", sourceIds: ["11"] }];
const selectedOptions = { categoryIds: ["17"], dimensionWeights: { time: 0 }, directionWeights: { dungeon: 0.7 } };
const selectedPreferences = utils.achievementRecommendationPreferences(selectedOptions, categories);
assert.deepStrictEqual(selectedPreferences, { category_ids: [17, 41], dimension_weights: { time: 0 },
    direction_weights: { dungeon: 0.7 } });
assert.strictEqual(selectedPreferences.dimension_ranges, undefined);
assert.strictEqual(utils.achievementRecommendationPreferences(utils.defaultAchievementRecommendationOptions(), categories).category_ids, undefined);
assert.deepStrictEqual(utils.achievementRecommendationPreferences({ ...selectedOptions, categoryIds: [] }, categories).category_ids, []);
const leapUtils = load("src/utils/achievementLeap.js", {
    "@/utils/achievementStatistics": {},
    "@/utils/achievementSchoolEligibility": {},
});
const result = {
    version: "server-v3",
    role: { role_id: 42, current_points: 50000, camp: "haoqi", stage: "lte_50000", snapshot_updated_at: null },
    recommendations: [
        { group: "bucket:0:scene:100", ids: [9, 2] },
        { group: "bucket:1:direction:reading", ids: [5] },
    ],
    camp_restricted_ids: [2],
    upcoming_events: [{ tag_id: 7, next_start_at: "2026-12-01T00:00:00+08:00", ids: [6] }],
    excluded_summary: { missing_dimensions: 4 },
};
const metadata = { 9: { point: 0 }, 2: { point: 10 }, 5: { point: 20 } };
const rows = utils.flattenAchievementRecommendation(result);
assert.deepStrictEqual(
    rows.map((row) => row.id),
    ["9", "2", "5"]
);
assert.strictEqual(rows[1].campRestricted, true);
assert.strictEqual(rows[0].campRestricted, false);
assert.deepStrictEqual(
    utils.selectAchievementRecommendation(result, metadata, 50010).map((row) => row.id),
    ["9", "2"]
);
assert.strictEqual(utils.selectAchievementRecommendation(result, metadata, 50100).length, 3);
assert.deepStrictEqual(utils.selectAchievementRecommendation(result, metadata, 50000), []);
assert.throws(() => utils.selectAchievementRecommendation(result, {}, 50100), /Missing achievement points/);
const records = [
    { id: "5", name: "长安阅读", points: 20, category: { id: "6", subId: "62" }, map: { id: "200" } },
    { id: "2", name: "扬州秘境", points: 10, category: { id: "11", subId: "112" }, map: { id: "100" } },
    { id: "9", name: "扬州游历", points: 0, category: { id: "8", subId: "82" }, map: { id: "100|200" } },
];
assert.deepStrictEqual(
    utils.hydrateAchievementRecommendation(rows, records).map((row) => row.id),
    ["9", "2", "5"]
);
assert.throws(() => utils.hydrateAchievementRecommendation(rows, []), /Missing achievement details/);
const maps = [{ id: "100", name: "扬州" }, { id: "200", name: "长安" }];
const menus = { 11: { sub: 11, name: "秘境", children: [{ detail: 112, name: "旧副本" }] } };
const enriched = utils.enrichAchievementRecommendationRecords(records, menus, maps);
assert.strictEqual(enriched[1].category.subName, "旧副本");
const filterOptions = utils.achievementRecommendationFilterOptions(enriched, maps);
assert.deepStrictEqual(filterOptions.maps.map((map) => map.name).sort(), ["扬州", "长安"].sort());
const noFilters = { keyword: "", mapIds: [], categories: [] };
assert.deepStrictEqual(utils.filterAchievementRecommendationItems(enriched, { ...noFilters, mapIds: ["100"] }).map((item) => item.id), ["2", "9"]);
assert.strictEqual(utils.filterAchievementRecommendationItems(enriched, { ...noFilters, mapIds: ["100", "200"] }).length, 3);
assert.deepStrictEqual(utils.filterAchievementRecommendationItems(enriched, { ...noFilters, categories: [["11", "112"]] }).map((item) => item.id), ["2"]);
assert.deepStrictEqual(utils.filterAchievementRecommendationItems(enriched, { ...noFilters, categories: [["11"]], keyword: " 秘境 " }).map((item) => item.id), ["2"]);
assert.strictEqual(utils.filterAchievementRecommendationItems(enriched, { ...noFilters, mapIds: ["200"], keyword: "秘境" }).length, 0);
const originalGroups = JSON.parse(JSON.stringify(result.recommendations));
const movedGroups = utils.moveAchievementRecommendationGroup(result.recommendations, result.recommendations[1].group, -1);
assert.deepStrictEqual(movedGroups.map((group) => group.ids), [[5], [9, 2]]);
assert.deepStrictEqual(result.recommendations, originalGroups);
assert.strictEqual(utils.moveAchievementRecommendationGroup(result.recommendations, result.recommendations[0].group, -1), result.recommendations);
const removedGroups = utils.removeAchievementRecommendationItem(movedGroups, "5");
assert.deepStrictEqual(removedGroups, originalGroups.slice(0, 1));
const movedItems = utils.hydrateAchievementRecommendation(utils.flattenAchievementRecommendation({ ...result, recommendations: movedGroups }), enriched);
assert.deepStrictEqual(utils.selectAchievementRecommendationItems(movedItems, 50000, 50010).map((item) => item.id), ["5"]);
const movedPlan = utils.buildAchievementRecommendationPlan({ items: movedItems, recommendation: result, title: " Plan ", targetPoints: 50100, roleId: "role", preferences: {} });
assert.deepStrictEqual(movedPlan.schema, ["5", "9", "2"]);
assert.deepStrictEqual(movedPlan.meta.recommendationGroups.map((group) => group.ids), [["5"], ["9", "2"]]);
assert.deepStrictEqual(movedPlan.meta.campRestrictedIds, ["2"]);
assert.strictEqual(movedPlan.title, "Plan");
assert.strictEqual(workbench.normalizeAchievementWorkbenchRole({ ID: 42, jx3id: "99999" }).roleId, 42);
assert.strictEqual(workbench.normalizeAchievementWorkbenchRole({ jx3id: "99999" }).roleId, null);

const apiCalls = [];
let response = { data: { code: 0, data: result } };
const wiki = load("src/service/wiki.js", {
    "@jx3box/jx3box-common/js/api": {
        $cms: () => ({
            post: async (...args) => {
                apiCalls.push(args);
                return response;
            },
        }),
    },
});
const service = load("src/service/achievementWorkbench.js", {
    "@/service/achievement": {},
    "@/service/team": {},
    "@/service/wiki": wiki,
    "@/utils/achievementWorkbench": workbench,
    "@/utils/achievementLeap": {},
    "@/utils/achievementStatistics": {},
});
let recommendationLoader = (...args) => service.fetchAchievementWorkbenchRecommendation(...args);
let detailLoader = async () => records;
const defaultDifficultyLoader = async (ids) => Object.fromEntries(ids.map((id) => [id, { difficultyDimensions: { money: 1.9 } }]));
let difficultyLoader = defaultDifficultyLoader;
const defaultTagsLoader = async (ids) => Object.fromEntries(ids.map((id) => [id, workbench.normalizeAchievementWorkbenchTags([])]));
let tagsLoader = defaultTagsLoader;
let eventTagLoader = async () => null;
const savedPlans = [];
let planSaver = async (payload, id) => { savedPlans.push({ payload, id }); return { ...payload, id: "88" }; };
const pageDependencies = {
    "@jx3box/jx3box-common/js/user": { isLogin: () => true },
    "@element-plus/icons-vue": {},
    "@/service/achievementWorkbench": {
        fetchAchievementWorkbenchRecommendation: (...args) => recommendationLoader(...args),
        fetchAchievementWorkbenchRecordsBatched: (...args) => detailLoader(...args),
        saveAchievementWorkbenchLeapPlan: (...args) => planSaver(...args),
    },
    "@/utils/achievementLeap": leapUtils,
    "@/utils/achievementProgress": {},
    "@/utils/achievementSchoolEligibility": {},
    "@/utils/achievementWorkbench": workbench,
    "@/utils/achievementRecommendation": utils,
    "@/utils/config": {},
};
const pageFile = "src/components/wiki/leap/AchievementLeapPage.vue";
const pageSource = fs.readFileSync(path.join(root, pageFile), "utf8");
for (const [, key] of pageSource.matchAll(/from "([^"]+\.vue)"/g)) pageDependencies[key] = {};
const page = load(pageFile, pageDependencies).default;
const panel = load("src/components/wiki/leap/AchievementLeapRecommendation.vue", {
    "./AchievementRecommendationItems.vue": {},
    "./AchievementRecommendationGroupIndex.vue": {},
    "@/components/design/PvxSurface.vue": {},
    "@element-plus/icons-vue": {},
    "@jx3box/jx3box-common/js/utils": { getLink() {}, iconLink() {} },
    "@/utils/achievementRecommendation": utils,
    "@/utils/achievementWorkbench": workbench,
    "@/service/achievementWorkbench": { fetchAchievementWorkbenchRecordsBatched: (...args) => detailLoader(...args),
        fetchAchievementWorkbenchDifficultyMetrics: (...args) => difficultyLoader(...args),
        fetchAchievementWorkbenchTags: (...args) => tagsLoader(...args),
        fetchAchievementWorkbenchTag: (...args) => eventTagLoader(...args) },
}).default;
const drawer = load("src/components/wiki/leap/AchievementLeapRecommendationDrawer.vue", {
    "@element-plus/icons-vue": {}, "./AchievementLeapRecommendation.vue": panel,
    "@/utils/achievementRecommendation": utils,
}).default;
const itemList = load("src/components/wiki/leap/AchievementRecommendationItems.vue", {
    "@element-plus/icons-vue": {}, "@jx3box/jx3box-common/js/utils": {}, "vuedraggable": {},
    "@/components/wiki/AchievementDifficultyStars.vue": {}, "@/utils/achievementWorkbench": workbench,
}).default;
assert.strictEqual(drawer.data().hasRequested, false);
const requestVm = { ...drawer.data(), canRequest: true, $emit: (event) => assert.strictEqual(event, "refresh") };
drawer.methods.requestRecommendation.call(requestVm);
assert.strictEqual(requestVm.hasRequested, true, "first request moves the button to the result header even before success");
assert.strictEqual(utils.achievementRecommendationPlace("bucket:0:scene:100"), "scene:100");
assert.strictEqual(utils.achievementRecommendationPlace("bucket:2:map:100"), "map:100");
assert.strictEqual(utils.achievementRecommendationPlace("bucket:2:direction:reading"), null);
assert.deepStrictEqual(drawer.data().expandedPreferences, [], "both preference sections start collapsed");
const recommendationTemplate = fs.readFileSync(path.join(root, "src/components/wiki/leap/AchievementLeapRecommendation.vue"), "utf8");
assert.ok(recommendationTemplate.indexOf("$t('achievementRecommendation.selectedOnly')") <
    recommendationTemplate.indexOf("$t('achievementRecommendation.allCandidates'"), "selected view comes before candidate backups");
for (const key of ["candidateHint", "refreshHint", "restoreDraftHint"]) {
    assert.ok(recommendationTemplate.includes(`achievementRecommendation.${key}`), `show clear ${key}`);
}
function panelVm(props = {}) {
    const vm = { ...panel.data(), recommendation: result, metadata, menus, maps, targetPoints: 50030,
        disabled: false, $refs: {}, $nextTick: (callback) => callback(), $i18n: { locale: "zh-CN" }, $t: (key) => key, ...props };
    Object.entries(panel.methods).forEach(([name, method]) => { vm[name] = method.bind(vm); });
    Object.entries(panel.computed).forEach(([name, getter]) => Object.defineProperty(vm, name, { get: () => getter.call(vm) }));
    vm.resetDraft();
    // Loader fixtures explicitly inspect the full candidate pool unless requested otherwise.
    vm.showSelectedOnly = props.showSelectedOnly ?? false;
    return vm;
}
assert.deepStrictEqual(drawer.computed.visibleDimensions.call({ dimensions: definitions }).map((d) => d.key), ["time"]);
assert.strictEqual(drawer.methods.dimensionWeight.call({ options: utils.defaultAchievementRecommendationOptions() }, { apiKey: "constructor", recommendationWeight: 8 }), 1);
assert.strictEqual(drawer.methods.directionLevel.call({ options: utils.defaultAchievementRecommendationOptions() }, "dungeon"), 2);
const weightOptions = utils.defaultAchievementRecommendationOptions();
const weightVm = {
    options: weightOptions,
    updateOptions(patch) { Object.assign(this.options, patch); },
};
drawer.methods.updateEntry.call(weightVm, "dimensionWeights", "time", 2);
assert.strictEqual(drawer.methods.dimensionWeight.call(weightVm, { apiKey: "time", recommendationWeight: 10 }), 2);
const highWeightPreferences = utils.achievementRecommendationPreferences(weightVm.options, categories);
assert.deepStrictEqual(highWeightPreferences.dimension_weights, { time: 2 });
drawer.methods.updateEntry.call(weightVm, "dimensionWeights", "time", undefined);
assert.strictEqual(drawer.methods.dimensionWeight.call(weightVm, { apiKey: "time", recommendationWeight: 8 }), 1);
assert.ok(!pageSource.includes("<AchievementLeapPlanner"));
assert.ok(pageSource.includes("<AchievementLeapRecommendationDrawer"));
assert.ok(!pageSource.includes("<AchievementLeapRecommendation\n"), "recommendation results must not be inline on the planner page");
function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
}

async function testDrawerDraftLifecycle() {
    // Render the real drawer template and panel state without a browser or network.
    const node = () => ({ children: [], parent: null });
    const renderer = vue.createRenderer({
        createElement: node, createText: node, createComment: node,
        setText() {}, setElementText() {}, patchProp() {},
        parentNode: (entry) => entry.parent,
        nextSibling: (entry) => entry.parent?.children[entry.parent.children.indexOf(entry) + 1] || null,
        insert(entry, parent, anchor) {
            if (entry.parent) entry.parent.children.splice(entry.parent.children.indexOf(entry), 1);
            const index = anchor ? parent.children.indexOf(anchor) : -1;
            parent.children.splice(index < 0 ? parent.children.length : index, 0, entry);
            entry.parent = parent;
        },
        remove(entry) {
            entry.parent.children.splice(entry.parent.children.indexOf(entry), 1);
            entry.parent = null;
        },
    });
    const template = parse(fs.readFileSync(path.join(root, "src/components/wiki/leap/AchievementLeapRecommendationDrawer.vue"), "utf8")).descriptor.template.content;
    const render = new Function("Vue", compile(template, { mode: "function", prefixIdentifiers: true }).code)(vue);
    let activePanel;
    const component = { ...drawer, render, components: { ...drawer.components,
        RefreshLeft: { render: () => null },
        AchievementLeapRecommendation: { ...panel, render: () => null, mounted() { activePanel = this; } },
    } };
    const state = vue.reactive({ modelValue: false, recommendation: result });
    const app = renderer.createApp({ render: () => vue.h(component, {
        ...state, options: utils.defaultAchievementRecommendationOptions(), metadata, maps, menus,
        targetPoints: 50030, roleAvailable: true, planTitle: "Draft", roleId: "42",
    }) });
    const slotContainer = { render() { return vue.h("div", this.$slots.default?.()); } };
    const controls = new Set([...template.matchAll(/<(el-[\w-]+)/g)].map(([, name]) => name));
    controls.delete("el-drawer");
    for (const name of controls) app.component(name, slotContainer);
    // Element Plus lazily mounts content, then only unmounts it on close when requested.
    app.component("el-drawer", {
        props: { modelValue: Boolean, destroyOnClose: Boolean },
        data: () => ({ rendered: false }),
        watch: { modelValue: { immediate: true, handler(value) {
            if (value) this.rendered = true;
            else if (this.destroyOnClose) this.rendered = false;
        } } },
        render() { return this.rendered ? vue.h("div", this.$slots.default?.()) : null; },
    });
    app.config.globalProperties.$t = (key) => key;
    app.config.globalProperties.$i18n = { locale: "zh-CN" };
    detailLoader = async ({ ids }) => records.filter((record) => ids.includes(record.id));
    app.mount(node());
    const update = async (patch) => {
        Object.assign(state, patch);
        await vue.nextTick();
        await new Promise((resolve) => setImmediate(resolve));
    };
    try {
        assert.strictEqual(activePanel, undefined, "closed drawer must not fetch recommendation details before first opening");
        await update({ modelValue: true });
        activePanel.moveItem({ id: "2", group: "bucket:0:scene:100", beforeId: "9" });
        activePanel.reorderGroups([...activePanel.groups].reverse());
        activePanel.jumpTo("bucket:1:direction:reading");
        activePanel.showSelectedOnly = false;
        await update({ modelValue: false });
        await update({ modelValue: true });
        assert.deepStrictEqual(activePanel.groups.map((group) => group.ids.map(String)), [["5"], ["2", "9"]],
            "closing and reopening must preserve both group and item ordering");
        activePanel.removeItem({ id: "9" });
        await update({ modelValue: false });
        await update({ modelValue: true });
        assert.deepStrictEqual(activePanel.groups.map((group) => group.ids.map(String)), [["5"], ["2"]],
            "closing and reopening must preserve removed items and manual ordering");
        assert.strictEqual(activePanel.activeGroup, "bucket:1:direction:reading", "reopening must preserve the active group");
        assert.strictEqual(activePanel.showSelectedOnly, false, "reopening preserves the explicitly chosen candidate view");
        assert.deepStrictEqual(activePanel.selection.items.map((item) => item.id), ["5", "2"], "saved selection uses the retained draft");
        activePanel.restoreDraft();
        await vue.nextTick();
        assert.deepStrictEqual(activePanel.groups.map((group) => group.ids), [[9, 2], [5]], "explicit restore still resets the draft");
        activePanel.removeItem({ id: "9" });
        await update({ modelValue: false });
        await update({ recommendation: null });
        await update({ modelValue: true });
        assert.deepStrictEqual(activePanel.groups, [], "invalidated role or preferences cannot retain an old draft");
        await update({ modelValue: false });
        await update({ recommendation: { ...result, recommendations: [{ group: "new", ids: [5] }] } });
        await update({ modelValue: true });
        assert.deepStrictEqual(activePanel.groups.map((group) => group.ids), [[5]], "new recommendations replace the draft even while closed");
        assert.strictEqual(activePanel.activeGroup, "new");
    } finally {
        app.unmount();
    }
}

function testRecommendationViewScope() {
    const ids = Array.from({ length: 300 }, (_, index) => index + 1);
    const recommendation = { ...result, role: { ...result.role, current_points: 95000 }, recommendations: [
        { group: "first", ids: ids.slice(0, 100) },
        { group: "second", ids: ids.slice(100, 200) },
        { group: "third", ids: ids.slice(200) },
    ] };
    const vm = panelVm({ recommendation, targetPoints: 100000,
        metadata: Object.fromEntries(ids.map((id) => [id, { point: id === 120 ? 260 : 40 }])) });
    assert.strictEqual(vm.matchingRows.length, 300);
    assert.strictEqual(vm.selectedItems.length, 120);
    assert.deepStrictEqual(vm.targetSummary, { projectedPoints: 100020, targetPoints: 100000, remainingPoints: 0, surplusPoints: 20 });
    vm.jumpTo("third");
    vm.showSelectedOnly = true;
    vm.ensureActiveGroup();
    assert.strictEqual(vm.matchingRows.length, 120, "selected-only view excludes candidates outside the saved selection");
    assert.deepStrictEqual(vm.groupIndex.map(({ group, count }) => [group, count]), [["first", 100], ["second", 20]]);
    assert.strictEqual(vm.activeGroup, "first", "a hidden active group falls back to a visible selected group");
    const selection = vm.selection;
    const payload = utils.buildAchievementRecommendationPlan({ items: selection.items, recommendation,
        title: "Selected only", targetPoints: 100000, roleId: "42", preferences: {} });
    assert.strictEqual(payload.schema.length, 120, "saving still uses 120 selected achievements, never 300 candidates");
    assert.strictEqual(payload.schema[119], "120");
    assert.strictEqual(payload.meta.selectedPoints, 5020);
    vm.filterIndex = Object.fromEntries(ids.map((id) => [id, { id: String(id), name: `achievement-${id}`,
        mapIds: [], category: { id: "1", name: "Category" } }]));
    vm.filterIndexReady = true;
    vm.filters.keyword = "achievement-120";
    vm.ensureActiveGroup();
    assert.strictEqual(vm.matchingRows.length, 1);
    assert.strictEqual(vm.activeGroup, "second");
    assert.deepStrictEqual(vm.selection.items, selection.items, "view scope and search cannot alter the saved selection");
    assert.strictEqual(vm.targetSummary.projectedPoints, 100020, "projected points must not use just the visible search results");
    vm.filters.keyword = "";
    vm.showSelectedOnly = false;
    assert.strictEqual(vm.matchingRows.length, 300, "switching back restores candidates without resetting edits");
    vm.showSelectedOnly = true;
    vm.tab = "upcoming";
    assert.deepStrictEqual(vm.matchingRows.map((item) => item.id), ["6"], "upcoming events are not filtered by the plan selection");
    vm.tab = "recommended";
    vm.targetPoints = 100020;
    assert.deepStrictEqual(vm.targetSummary, { projectedPoints: 100020, targetPoints: 100020, remainingPoints: 0, surplusPoints: 0 });
    vm.targetPoints = 110000;
    assert.deepStrictEqual(vm.targetSummary, { projectedPoints: 107220, targetPoints: 110000, remainingPoints: 2780, surplusPoints: 0 });
    assert.strictEqual(vm.selection.ready, true, "an under-target plan remains saveable; this feature only clarifies its shortfall");
    vm.metadata[300] = {};
    assert.strictEqual(vm.targetSummary, null, "missing required points cannot be presented as a known projection or shortfall");
    assert.strictEqual(vm.selection.ready, false);
    vm.targetPoints = 95000;
    assert.strictEqual(vm.matchingRows.length, 0);
    assert.deepStrictEqual(vm.targetSummary, { projectedPoints: 95000, targetPoints: 95000, remainingPoints: 0, surplusPoints: 0 });
    vm.resetDraft();
    assert.strictEqual(vm.showSelectedOnly, true, "explicit draft reset defaults to the saved selection view");
    assert.strictEqual(panel.data().showSelectedOnly, true, "new panels default to selected achievements");
    const editVm = panelVm({ targetPoints: 50010 });
    editVm.showSelectedOnly = true;
    editVm.removeItem({ id: "2" });
    assert.deepStrictEqual(editVm.matchingRows.map((item) => item.id), ["9", "5"], "removing a selected item can bring the next candidate into the view");
    assert.deepStrictEqual(editVm.targetSummary, { projectedPoints: 50020, targetPoints: 50010, remainingPoints: 0, surplusPoints: 10 });
    editVm.reorderGroups([...editVm.groups].reverse());
    assert.deepStrictEqual(editVm.matchingRows.map((item) => item.id), ["5"], "manual ordering recalculates selection before filtering the view");
}

function testRequiredRecommendationPoints() {
    const vm = panelVm({ metadata: { 9: { point: 20 }, 2: { point: 30 } }, targetPoints: 50050 });
    assert.strictEqual(vm.selection.ready, true, "missing points after reaching the target must not block creation");
    assert.deepStrictEqual(vm.selection.items.map((item) => item.id), ["9", "2"]);
    assert.strictEqual(vm.selectedPoints, 50);
    const plan = utils.buildAchievementRecommendationPlan({ items: vm.selection.items, recommendation: result,
        title: "Partial catalog", targetPoints: 50050, roleId: "42", preferences: {} });
    assert.deepStrictEqual(plan.schema, ["9", "2"]);
    assert.strictEqual(plan.meta.selectedPoints, 50);
    vm.targetPoints = 50051;
    assert.strictEqual(vm.selection.ready, false, "increasing the target must revalidate the newly required item");
    assert.deepStrictEqual(vm.selection.items, [], "unknown points cannot be silently treated as zero or skipped");
    vm.targetPoints = 50050;
    vm.reorderGroups([...vm.groups].reverse());
    assert.strictEqual(vm.selection.ready, false, "moving an unknown item ahead of the target boundary must block creation");
    vm.removeItem({ id: "5" });
    assert.strictEqual(vm.selection.ready, true, "an explicit removal can resolve missing required points");
    for (const point of [undefined, null, NaN, -1, "30"]) {
        vm.metadata = { 9: { point: 20 }, 2: { point } };
        assert.strictEqual(vm.selection.ready, false, `invalid required points (${point}) must block creation`);
    }
    vm.metadata = { 9: { point: 0 }, 2: { point: 30 } };
    vm.targetPoints = 50030;
    assert.strictEqual(vm.selection.ready, true, "a genuine zero-point item is valid and remains in server order");
    assert.deepStrictEqual(vm.selection.items.map((item) => item.id), ["9", "2"]);
}

async function testIndependentRecommendationData() {
    const vm = panelVm();
    const detailCalls = [];
    const metricCalls = [];
    const pendingMetrics = deferred();
    const flush = () => new Promise((resolve) => setImmediate(resolve));
    detailLoader = async ({ ids }) => { detailCalls.push(ids); return records.filter((record) => ids.includes(record.id)); };
    difficultyLoader = (ids) => { metricCalls.push(ids); return pendingMetrics.promise; };
    panel.watch.detailRows.handler.call(vm);
    await flush();
    assert.deepStrictEqual(vm.rows.map((item) => item.id), ["9", "2"], "slow difficulty must not hide successfully loaded details");
    assert.strictEqual(vm.detailsLoading, false);
    assert.strictEqual(vm.selection.ready, true, "difficulty is optional for creating a plan");
    assert.deepStrictEqual(metricCalls, [["9", "2"]], "difficulty still loads lazily for requested groups only");
    pendingMetrics.reject(new Error("difficulty offline"));
    await flush();
    assert.strictEqual(vm.detailsError, false);
    assert.strictEqual(vm.difficultyStates[vm.activeGroup].error, true);
    assert.deepStrictEqual(vm.rows.map((item) => item.id), ["9", "2"]);
    vm.moveItem({ id: "2", group: vm.activeGroup, beforeId: "9" });
    difficultyLoader = async (ids) => { metricCalls.push(ids); return defaultDifficultyLoader(ids); };
    await vm.loadDifficulty();
    assert.strictEqual(vm.difficultyStates[vm.activeGroup].error, false);
    assert.strictEqual(vm.rows[0].difficultyDimensions.money, 1.9);
    assert.deepStrictEqual(vm.rows.map((item) => item.id), ["2", "9"], "difficulty retry preserves manual edits");
    assert.strictEqual(detailCalls.length, 1, "retrying difficulty must not refetch successful details");
    await vm.loadDifficulty();
    assert.strictEqual(metricCalls.length, 2, "successful difficulty is cached across revisits");

    const missingVm = panelVm();
    difficultyLoader = async (ids) => Object.fromEntries(ids.map((id) => [id, null]));
    await missingVm.loadDifficulty();
    assert.strictEqual(missingVm.difficultyStates[missingVm.activeGroup].error, false, "unconfigured ratings are not transport errors");
    difficultyLoader = async () => { throw new Error("must use cached unconfigured values"); };
    await missingVm.loadDifficulty();
    assert.strictEqual(missingVm.difficultyStates[missingVm.activeGroup].error, false);

    const raceVm = panelVm();
    const oldMetrics = deferred();
    difficultyLoader = () => oldMetrics.promise;
    const oldRequest = raceVm.loadDifficulty();
    panel.watch.recommendation.handler.call(raceVm);
    difficultyLoader = defaultDifficultyLoader;
    await raceVm.loadDifficulty();
    oldMetrics.resolve({ 9: { difficultyDimensions: { money: 5 } } });
    await oldRequest;
    assert.strictEqual(raceVm.difficultyCache[9].difficultyDimensions.money, 1.9, "old results cannot overwrite a new recommendation");
    assert.strictEqual(raceVm.difficultyStates[raceVm.activeGroup].loading, false);

    const relatedVm = panelVm({ recommendation: { ...result, recommendations: [result.recommendations[0],
        { group: "bucket:2:scene:100", ids: [5] }] } });
    relatedVm.expandedGroups = ["bucket:2:scene:100"];
    difficultyLoader = async (ids) => {
        if (ids.includes("5")) throw new Error("related group difficulty offline");
        return defaultDifficultyLoader(ids);
    };
    panel.watch.detailRows.handler.call(relatedVm);
    await flush();
    assert.strictEqual(relatedVm.detailsError, false);
    assert.strictEqual(relatedVm.difficultyStates[relatedVm.activeGroup].error, false);
    assert.strictEqual(relatedVm.difficultyStates["bucket:2:scene:100"].error, true);
    assert.deepStrictEqual(relatedVm.groupRows("bucket:2:scene:100").map((item) => item.id), ["5"], "related-group failure preserves its details too");

    const detailFailureVm = panelVm();
    let cachedMetricCalls = 0;
    detailLoader = async () => [];
    difficultyLoader = async (ids) => { cachedMetricCalls += 1; return defaultDifficultyLoader(ids); };
    panel.watch.detailRows.handler.call(detailFailureVm);
    await flush();
    assert.strictEqual(detailFailureVm.detailsError, true, "real detail failures still require a detail retry");
    detailLoader = async ({ ids }) => records.filter((record) => ids.includes(record.id));
    await detailFailureVm.loadDetails();
    assert.strictEqual(detailFailureVm.detailsError, false);
    assert.strictEqual(detailFailureVm.rows[0].difficultyDimensions.money, 1.9, "difficulty arriving before details is retained");
    assert.strictEqual(cachedMetricCalls, 1, "detail retry does not refetch successful difficulty");

    const batchIds = Array.from({ length: 242 }, (_, i) => i + 1000);
    const batchVm = panelVm({ recommendation: { ...result, recommendations: [{ group: "large", ids: batchIds }] } });
    const batches = [];
    difficultyLoader = async (ids) => {
        batches.push(ids);
        if (ids.includes("1240")) throw new Error("second batch offline");
        return defaultDifficultyLoader(ids);
    };
    await batchVm.loadDifficulty();
    assert.strictEqual(batchVm.difficultyStates.large.error, true);
    assert.strictEqual(Object.keys(batchVm.difficultyCache).length, 240, "a later batch failure keeps earlier successful difficulty");
    difficultyLoader = async (ids) => { batches.push(ids); return defaultDifficultyLoader(ids); };
    await batchVm.loadDifficulty();
    assert.deepStrictEqual(batches.map((batch) => batch.length), [240, 2, 2], "retry fetches only failed or missing difficulty IDs");
    assert.strictEqual(batchVm.difficultyStates.large.error, false);
    assert.strictEqual(Object.keys(batchVm.difficultyCache).length, 242);
    difficultyLoader = defaultDifficultyLoader;
}

async function testRecommendationPresentation() {
    const formatDate = utils.formatAchievementRecommendationDate;
    assert.strictEqual(formatDate(null, "zh-CN"), "");
    assert.strictEqual(formatDate("not-a-date", "zh-CN"), "");
    assert.strictEqual(formatDate("", "zh-CN"), "");
    assert.strictEqual(formatDate(false, "zh-CN"), "");
    assert.strictEqual(formatDate("2026-09-04T16:00:00Z", "zh-CN"),
        formatDate("2026-09-05T00:00:00+08:00", "zh-CN"), "snapshot and activity dates use UTC+8 regardless of browser timezone");
    assert.match(formatDate("2026-09-04T16:00:00Z", "zh-CN"), /2026\/9\/5/);
    assert.deepStrictEqual(utils.achievementRecommendationExclusions({ completed: 300, missing_dimensions: "4", future_rule: 2,
        empty: 0, negative: -1, infinite: Infinity, invalid: "unknown", fractional: 1.5, flag: true }),
    [{ reason: "completed", count: 300 }, { reason: "missing_dimensions", count: 4 }, { reason: "future_rule", count: 2 }]);
    assert.deepStrictEqual(utils.achievementRecommendationExclusions(null), []);
    assert.deepStrictEqual(utils.achievementRecommendationExclusions([1, 2]), []);

    const vm = panelVm();
    assert.strictEqual(vm.snapshotDateLabel, "", "a missing timestamp must not invent a date or assert no snapshot");
    assert.deepStrictEqual(vm.exclusions, [{ reason: "missing_dimensions", count: 4 }]);
    const selectedBefore = vm.selection.items.map((item) => item.id);
    detailLoader = async ({ ids }) => records.filter((record) => ids.includes(record.id));
    tagsLoader = async () => { throw new Error("tags offline"); };
    await vm.loadDetails();
    await vm.loadTags();
    assert.strictEqual(vm.tagStates[vm.activeGroup].error, true);
    assert.strictEqual(vm.detailsError, false);
    assert.deepStrictEqual(vm.rows.map((item) => item.id), ["9", "2"], "optional tag failure must not hide details");
    assert.strictEqual(vm.selection.ready, true);
    const calls = [];
    tagsLoader = async (ids) => {
        calls.push(ids);
        return { 9: workbench.normalizeAchievementWorkbenchTags([{ tag_id: 7, tag_label: "门派：万花", tag_desc: "公开说明" }]) };
    };
    await vm.loadTags();
    assert.strictEqual(vm.rows[0].tags[0].label, "门派：万花");
    assert.deepStrictEqual(vm.rows[1].tags, [], "successful missing tags are cached as empty");
    await vm.loadTags();
    assert.strictEqual(calls.length, 1, "a retry does not request already loaded tags");
    assert.deepStrictEqual(vm.selection.items.map((item) => item.id), selectedBefore, "tags never re-filter eligibility or reorder selection");

    const oldTags = deferred();
    const oldVm = panelVm();
    tagsLoader = () => oldTags.promise;
    const oldLoad = oldVm.loadTags();
    panel.watch.recommendation.handler.call(oldVm);
    oldTags.resolve({ 9: workbench.normalizeAchievementWorkbenchTags([{ tag_id: 7, tag_label: "旧标签" }]) });
    await oldLoad;
    assert.deepStrictEqual(oldVm.tagCache, {}, "a previous recommendation's tags must not overwrite a new result");

    const batchIds = Array.from({ length: 242 }, (_, i) => i + 1000);
    const batchVm = panelVm({ recommendation: { ...result, recommendations: [{ group: "large", ids: batchIds }] } });
    const batches = [];
    tagsLoader = async (ids) => {
        batches.push(ids);
        if (ids.includes("1240")) throw new Error("second tag batch offline");
        return defaultTagsLoader(ids);
    };
    await batchVm.loadTags();
    assert.strictEqual(batchVm.tagStates.large.error, true);
    assert.strictEqual(Object.keys(batchVm.tagCache).length, 240);
    tagsLoader = async (ids) => { batches.push(ids); return defaultTagsLoader(ids); };
    await batchVm.loadTags();
    assert.deepStrictEqual(batches.map((ids) => ids.length), [240, 2, 2], "retry keeps successful tag batches and only fetches missing IDs");
    assert.strictEqual(Object.keys(batchVm.tagCache).length, 242);

    const eventsVm = panelVm({ $t: (key, params) => params?.id ? `活动标签 #${params.id}` : key });
    eventsVm.tab = "upcoming";
    assert.match(eventsVm.groupIndex[0].label, /活动标签 #7/);
    eventTagLoader = async () => { throw new Error("event name offline"); };
    await eventsVm.loadEventTags();
    assert.strictEqual(eventsVm.eventTagsError, true);
    assert.match(eventsVm.groupIndex[0].label, /活动标签 #7/, "event ID remains usable when public tag names fail");
    let eventRequests = 0;
    eventTagLoader = async (id) => { eventRequests++; return { id: String(id), label: "节日：冬至", description: "节日说明" }; };
    await eventsVm.loadEventTags();
    assert.match(eventsVm.groupIndex[0].label, /节日：冬至/);
    assert.strictEqual(eventsVm.eventTagsError, false);
    await eventsVm.loadEventTags();
    assert.strictEqual(eventRequests, 1);
    assert.strictEqual(eventsVm.selection.ready, false, "upcoming activities still cannot be saved as current recommendations");

    const pendingEvent = deferred();
    const staleEventVm = panelVm();
    staleEventVm.tab = "upcoming";
    eventTagLoader = () => pendingEvent.promise;
    const eventRequest = staleEventVm.loadEventTags();
    panel.watch.recommendation.handler.call(staleEventVm);
    pendingEvent.resolve({ id: "7", label: "过期活动" });
    await eventRequest;
    assert.deepStrictEqual(staleEventVm.eventTagCache, {});

    const manyEventsVm = panelVm({ recommendation: { ...result,
        upcoming_events: Array.from({ length: 7 }, (_, i) => ({ tag_id: i + 20, ids: [i + 100], next_start_at: null })) } });
    manyEventsVm.tab = "upcoming";
    const heldEvents = [];
    eventTagLoader = (id) => { const pending = deferred(); heldEvents.push({ id, ...pending }); return pending.promise; };
    const firstEventBatch = manyEventsVm.loadEventTags();
    assert.strictEqual(heldEvents.length, 3, "activity names have a three-request concurrency limit");
    manyEventsVm.tab = "recommended";
    heldEvents.forEach((entry) => entry.resolve(null));
    await firstEventBatch;
    assert.strictEqual(heldEvents.length, 3, "leaving the activities tab stops queued lookups");
    const resumedIds = [];
    eventTagLoader = async (id) => { resumedIds.push(id); return null; };
    manyEventsVm.tab = "upcoming";
    await manyEventsVm.loadEventTags();
    assert.deepStrictEqual(resumedIds, ["23", "24", "25", "26"], "returning resumes only unrequested activity names");
    assert.strictEqual(Object.keys(manyEventsVm.eventTagCache).length, 7, "successful empty names remain cached");
    tagsLoader = defaultTagsLoader;
    eventTagLoader = async () => null;
}

async function testRecommendationSummaryRendering() {
    const template = parse(fs.readFileSync(path.join(root, "src/components/wiki/leap/AchievementLeapRecommendation.vue"), "utf8")).descriptor.template.content;
    const render = new Function("Vue", compile(template, { mode: "function", prefixIdentifiers: true }).code)(vue);
    const translations = load("src/locale/zh-CN/achievementRecommendation.js").default;
    const renderSummary = async (role, excluded_summary) => {
        const component = { ...panel, render, components: { ...panel.components,
            RefreshLeft: { render: () => null }, Search: { render: () => null } } };
        const app = vue.createSSRApp(component, { recommendation: { ...result, role, recommendations: [], upcoming_events: [], excluded_summary },
            hasRequested: true, canRequest: true, roleAvailable: true, targetPoints: 50030 });
        app.config.globalProperties.$i18n = { locale: "zh-CN" };
        app.config.globalProperties.$t = (key, params = {}) => {
            const text = key.split(".").slice(1).reduce((value, name) => value?.[name], translations) || key;
            return text.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
        };
        for (const name of new Set([...template.matchAll(/<(el-[\w-]+)/g)].map(([, tag]) => tag))) {
            app.component(name, { render() { return vue.h("div", this.$attrs, this.$slots.default?.()); } });
        }
        return require("@vue/server-renderer").renderToString(app);
    };
    const html = await renderSummary({ ...result.role, snapshot_updated_at: "2026-09-04T16:00:00Z", snapshot_stale: true },
        { completed: 300, missing_dimensions: 4, future_rule: 2, empty: 0 });
    assert.match(html, /成就同步时间：2026\/9\/5/);
    assert.match(html, /UTC\+8/);
    assert.match(html, /快照较旧/);
    assert.match(html, /href="https:\/\/www\.jx3box\.com\/dashboard\/role\/sync" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /重新生成推荐不会同步游戏数据/);
    assert.match(html, /<dt>已完成<\/dt><dd>300<\/dd>/);
    assert.match(html, /其他原因（future_rule）/);
    assert.doesNotMatch(html, /<dd>306<\/dd>|<dd>0<\/dd>/, "exclusion categories are not summed or padded with zero counts");
    const unknown = await renderSummary({ ...result.role, snapshot_updated_at: "invalid" }, {});
    assert.match(unknown, /同步时间未知/);
    assert.doesNotMatch(unknown, /Invalid Date|全部未完成|m-recommendation-exclusions|快照较旧/);
}

async function main() {
    const resetEvents = [];
    const resetVm = {
        controlsDisabled: false, loading: false, canRequest: true, recommendation: result,
        $emit(event, value) {
            resetEvents.push([event, value]);
            if (event === "update:options") this.recommendation = null;
        },
        $nextTick: () => Promise.resolve(),
    };
    resetVm.requestRecommendation = drawer.methods.requestRecommendation.bind(resetVm);
    const resetting = drawer.methods.reset.call(resetVm);
    assert.deepStrictEqual(resetEvents, [["update:options", utils.defaultAchievementRecommendationOptions()]],
        "reset updates preferences before requesting recommendations");
    await resetting;
    assert.deepStrictEqual(resetEvents.map(([event]) => event), ["update:options", "refresh"],
        "reset automatically requests recommendations once after the update");
    resetEvents.length = 0;
    resetVm.loading = true;
    await drawer.methods.reset.call(resetVm);
    assert.strictEqual(resetEvents.length, 0, "loading prevents resetting and duplicate requests");
    resetVm.loading = false;
    resetVm.recommendation = result;
    resetVm.canRequest = false;
    await drawer.methods.reset.call(resetVm);
    assert.deepStrictEqual(resetEvents.map(([event]) => event), ["update:options"],
        "without an eligible role reset preferences but do not request");
    resetEvents.length = 0;
    resetVm.canRequest = true;
    resetVm.recommendation = null;
    for (const hasRequested of [false, true]) {
        resetVm.hasRequested = hasRequested;
        await drawer.methods.reset.call(resetVm);
        assert.deepStrictEqual(resetEvents.map(([event]) => event), ["update:options"],
            "without a current result reset must not generate, even after a failed request");
        resetEvents.length = 0;
    }
    assert.ok(recommendationTemplate.includes('<el-tooltip v-if="recommendation" :content="$t(\'achievementRecommendation.restoreDraftHint\')">'),
        "undo is only shown when a recommendation exists");
    await testRecommendationPresentation();
    await testRecommendationSummaryRendering();
    testRecommendationViewScope();
    testRequiredRecommendationPoints();
    await testIndependentRecommendationData();
    await testDrawerDraftLifecycle();
    assert.strictEqual(await service.fetchAchievementWorkbenchRecommendation({ roleId: 42, camp: "haoqi" }), result);
    assert.deepStrictEqual(apiCalls, [
        ["/api/cms/pvx/wiki_achievement_recommendation", { role_id: 42, camp: "haoqi" }],
    ]);
    await service.fetchAchievementWorkbenchRecommendation({ roleId: 42, camp: "haoqi", preferences: selectedPreferences });
    assert.deepStrictEqual(apiCalls[1][1], { role_id: 42, camp: "haoqi", ...selectedPreferences });
    await service.fetchAchievementWorkbenchRecommendation({ roleId: 42, camp: "haoqi", preferences: highWeightPreferences });
    assert.strictEqual(apiCalls[2][1].dimension_weights.time, 2);
    await assert.rejects(
        service.fetchAchievementWorkbenchRecommendation({ roleId: "99999", camp: "haoqi" }),
        /Invalid recommendation role ID/
    );
    response = { data: { code: 400, msg: "Unavailable" } };
    await assert.rejects(service.fetchAchievementWorkbenchRecommendation({ roleId: 42, camp: "haoqi" }), /Unavailable/);
    response = { data: { code: 0, data: {} } };
    await assert.rejects(
        service.fetchAchievementWorkbenchRecommendation({ roleId: 42, camp: "haoqi" }),
        /Invalid recommendation response/
    );

    const vm = { ...page.data(), currentClient: "std", currentRole: { roleId: 42 }, $t: (key) => key };
    const first = deferred();
    recommendationLoader = () => first.promise;
    const oldRequest = page.methods.loadRecommendation.call(vm);
    assert.strictEqual(vm.recommendationLoading, true);
    vm.currentClient = "origin";
    await page.methods.loadRecommendation.call(vm);
    first.resolve(result);
    await oldRequest;
    assert.strictEqual(vm.recommendation, null);
    assert.strictEqual(vm.recommendationLoading, false);

    vm.currentClient = "std";
    const second = deferred();
    recommendationLoader = () => second.promise;
    const pending = page.methods.loadRecommendation.call(vm);
    vm.currentRole = { roleId: 43 };
    const nextResult = { ...result, role: { ...result.role, role_id: 43, camp: "neutral" } };
    recommendationLoader = async () => nextResult;
    await page.methods.loadRecommendation.call(vm);
    second.resolve(result);
    await pending;
    assert.strictEqual(vm.recommendation, nextResult);
    const filterRequest = deferred();
    recommendationLoader = () => filterRequest.promise;
    const pendingFilter = page.methods.loadRecommendation.call(vm);
    vm.invalidateRecommendation = page.methods.invalidateRecommendation.bind(vm);
    page.methods.changeRecommendationOptions.call(vm, selectedOptions);
    assert.strictEqual(vm.recommendation, null);
    filterRequest.resolve(result);
    await pendingFilter;
    assert.strictEqual(vm.recommendation, null, "old filters cannot overwrite new preferences");
    vm.categoryOptions = categories;
    let requested;
    recommendationLoader = async (payload) => { requested = payload; return result; };
    await page.methods.loadRecommendation.call(vm);
    assert.deepStrictEqual(requested.preferences, selectedPreferences);
    assert.strictEqual(requested.camp, "neutral", "the frontend requests both factions without a camp selector");
    assert.strictEqual(requested.roleId, 43, "requests use the selected role's database ID");
    vm.roleLoading = true;
    recommendationLoader = () => {
        throw new Error("Must not request while switching roles");
    };
    await page.methods.loadRecommendation.call(vm);
    assert.strictEqual(vm.recommendation, null);
    vm.roleLoading = false;

    vm.recommendation = result;
    vm.currentRoleId = "99999";
    vm.currentPoints = 0;
    vm.metadata = metadata;
    vm.plannerForm = { title: "Plan", targetPoints: 50010 };
    vm.schoolEligibility = { version: "school-v1", school: null };
    vm.isCurrentSaveRequest = page.methods.isCurrentSaveRequest.bind(vm);
    vm.loadPlans = async () => {};
    const openedPlans = [];
    vm.openPlan = async (plan) => openedPlans.push(plan);
    const messages = [];
    vm.$message = {
        error: (message) => messages.push(message), warning: (message) => messages.push(message), success: (message) => messages.push(message),
    };
    vm.recommendationDrawerVisible = true;
    vm.editingPlan = { id: "old-plan" };
    const selection = { recommendation: result, ready: true, items: utils.hydrateAchievementRecommendation(rows, records) };
    await page.methods.createRecommendedPlan.call(vm, selection);
    assert.strictEqual(savedPlans.length, 1);
    assert.strictEqual(savedPlans[0].id, undefined, "system recommendation creates a new plan, never overwrites the open editor");
    assert.strictEqual(vm.recommendationDrawerVisible, false);
    const plan = savedPlans[0].payload;
    assert.deepStrictEqual(plan.schema, ["9", "2"]);
    assert.deepStrictEqual(plan.meta.recommendationPreferences, selectedPreferences);
    assert.strictEqual(plan.meta.recommendationVersion, "server-v3");
    assert.strictEqual(plan.meta.selectedPoints, 10);
    assert.strictEqual(openedPlans[0].id, "88");
    const restored = utils.flattenAchievementRecommendation({
        recommendations: plan.meta.recommendationGroups,
        camp_restricted_ids: plan.meta.campRestrictedIds,
    });
    assert.deepStrictEqual(restored, rows.slice(0, 2));
    const pendingSave = deferred();
    let saveCalls = 0;
    planSaver = () => { saveCalls += 1; return pendingSave.promise; };
    vm.recommendationDrawerVisible = true;
    const saving = page.methods.createRecommendedPlan.call(vm, selection);
    await page.methods.createRecommendedPlan.call(vm, selection);
    assert.strictEqual(saveCalls, 1, "double clicking cannot create duplicate plans");
    vm.recommendationRequestId += 1;
    pendingSave.resolve({ id: "stale" });
    await saving;
    assert.strictEqual(openedPlans.length, 1, "stale save cannot navigate the new role or recommendation");
    assert.strictEqual(vm.saving, false);
    planSaver = async () => { throw new Error("save offline"); };
    await page.methods.createRecommendedPlan.call(vm, selection);
    assert.strictEqual(vm.recommendationDrawerVisible, true, "failed save preserves the draft");
    assert.strictEqual(vm.saving, false);
    assert.strictEqual(messages[messages.length - 1], "pages.wiki.leap.ui.createFailed");

    const detailVm = panelVm();
    const requestedGroups = [];
    detailLoader = async ({ ids }) => { requestedGroups.push(ids); return records.filter((record) => ids.includes(record.id)); };
    await detailVm.loadDetails();
    await detailVm.loadDifficulty();
    assert.deepStrictEqual(requestedGroups, [["9", "2"]], "initial fetch must only request the first group, not upcoming events");
    assert.deepStrictEqual(detailVm.rows.map((row) => row.id), ["9", "2"]);
    assert.strictEqual(detailVm.rows[0].difficultyDimensions.money, 1.9, "recommendation details include current-group difficulty metrics");
    assert.deepStrictEqual(detailVm.selection.items.map((row) => row.id), ["9", "2", "5"], "unvisited groups still contribute to the plan");
    assert.strictEqual(detailVm.selection.ready, true);
    const unvisitedPlan = utils.buildAchievementRecommendationPlan({ items: detailVm.selection.items, recommendation: result,
        title: "Lazy plan", targetPoints: 50030, roleId: "42", preferences: {} });
    assert.deepStrictEqual(unvisitedPlan.schema, ["9", "2", "5"]);
    detailVm.jumpTo(result.recommendations[1].group);
    await detailVm.loadDetails();
    detailVm.jumpTo(result.recommendations[0].group);
    await detailVm.loadDetails();
    assert.strictEqual(requestedGroups.length, 2, "returning to a group uses its detail cache");
    detailVm.reorderGroups([...detailVm.groups].reverse());
    await detailVm.loadDetails();
    assert.strictEqual(requestedGroups.length, 2, "reordering must not fetch other groups");
    assert.strictEqual(detailVm.activeGroup, result.recommendations[0].group, "reorder preserves the active group identity");
    assert.deepStrictEqual(detailVm.selection.items.map((row) => row.id), ["5", "9", "2"]);
    detailVm.filters.keyword = "not found";
    assert.deepStrictEqual(detailVm.visibleRows, []);
    assert.strictEqual(detailVm.selection.items.length, 3, "view filters do not remove plan items");
    detailVm.removeItem({ id: "9" });
    detailVm.removeItem({ id: "2" });
    assert.strictEqual(detailVm.activeGroup, result.recommendations[1].group, "empty group falls back to its neighbor");
    assert.strictEqual(detailVm.filters.keyword, "not found", "moving between groups preserves global filters");
    detailVm.removeItem({ id: "5" });
    await detailVm.loadDetails();
    assert.strictEqual(detailVm.activeGroup, "");
    assert.deepStrictEqual(detailVm.selection.items, []);
    detailVm.resetDraft();
    await detailVm.loadDetails();
    assert.strictEqual(requestedGroups.length, 2, "restoring a draft also reuses details");
    detailVm.tab = "upcoming";
    detailVm.jumpTo("event:7");
    assert.strictEqual(detailVm.selection.ready, false);
    const originalGroups = detailVm.groups;
    detailVm.reorderGroups([...detailVm.groups].reverse());
    assert.strictEqual(detailVm.groups, originalGroups, "upcoming groups are read-only");

    const raceVm = panelVm();
    const oldDetails = deferred();
    detailLoader = () => oldDetails.promise;
    const oldPage = raceVm.loadDetails();
    raceVm.jumpTo(result.recommendations[1].group);
    detailLoader = async () => [records[0]];
    await raceVm.loadDetails();
    oldDetails.resolve(records);
    await oldPage;
    assert.deepStrictEqual(raceVm.rows.map((record) => record.id), ["5"]);
    assert.deepStrictEqual(Object.keys(raceVm.recordCache), ["5"], "stale responses cannot populate another recommendation's cache");
    assert.strictEqual(raceVm.detailsLoading, false);
    raceVm.jumpTo(result.recommendations[0].group);
    detailLoader = async () => [];
    await raceVm.loadDetails();
    assert.strictEqual(raceVm.detailsError, true, "missing active-group details show a retryable error");
    detailLoader = async () => records.slice(1);
    await raceVm.loadDetails();
    assert.strictEqual(raceVm.detailsError, false);
    assert.deepStrictEqual(raceVm.rows.map((row) => row.id), ["9", "2"]);
    const missingPointsVm = panelVm({ metadata: {} });
    assert.strictEqual(missingPointsVm.selection.ready, false);
    assert.strictEqual(missingPointsVm.pointsMissing, true);
    const filterVm = panelVm();
    const indexCalls = [];
    const allRecords = [...records, { id: "6", name: "活动", category: { id: "18", subId: "181" }, map: { id: "300" } }];
    detailLoader = async (options, batchSize) => { indexCalls.push({ ...options, batchSize }); return allRecords.filter((item) => options.ids.includes(item.id)); };
    assert.deepStrictEqual(filterVm.filterOptions.maps, [], "filter choices must not fall back to the current group's details");
    await filterVm.loadFilterIndex();
    assert.strictEqual(indexCalls.length, 1);
    assert.strictEqual(indexCalls[0].attributes, "ID,Name,Sub,Detail,SceneID,dwMapID");
    assert.strictEqual(indexCalls[0].batchSize, 1000);
    assert.deepStrictEqual(indexCalls[0].ids, ["9", "2", "5", "6"]);
    assert.deepStrictEqual(Object.keys(filterVm.recordCache), [], "search index never substitutes for full scored details");
    const fullOptions = filterVm.filterOptions;
    filterVm.filters.keyword = "长安";
    filterVm.ensureActiveGroup();
    assert.strictEqual(filterVm.activeGroup, result.recommendations[1].group, "global name search finds an unvisited group");
    assert.deepStrictEqual(filterVm.activeRows.map((row) => row.id), ["5"]);
    assert.deepStrictEqual(filterVm.filterOptions, fullOptions, "options remain global even when results are narrowed");
    filterVm.filters = { ...noFilters, mapIds: ["200"] };
    filterVm.ensureActiveGroup();
    assert.deepStrictEqual(filterVm.groupIndex.map((group) => group.count), [1, 1]);
    filterVm.jumpTo(result.recommendations[0].group);
    assert.deepStrictEqual(filterVm.filters.mapIds, ["200"]);
    assert.deepStrictEqual(filterVm.activeRows.map((row) => row.id), ["9"], "only matching items of each group are displayed");
    filterVm.filters = { ...noFilters, categories: [["11", "112"]] };
    filterVm.ensureActiveGroup();
    assert.deepStrictEqual(filterVm.activeRows.map((row) => row.id), ["2"]);
    assert.strictEqual(filterVm.groupIndex.length, 1);
    assert.strictEqual(filterVm.selection.items.length, 3, "filters do not change the saved plan");
    filterVm.filters.keyword = "none";
    filterVm.ensureActiveGroup();
    assert.strictEqual(filterVm.activeGroup, "");
    assert.deepStrictEqual(filterVm.groupIndex, []);
    filterVm.filters = { ...noFilters };
    filterVm.ensureActiveGroup();
    assert.strictEqual(filterVm.groupIndex.length, 2, "clearing filters restores all groups");
    await filterVm.loadFilterIndex();
    assert.strictEqual(indexCalls.length, 1, "index is cached across filters and page navigation");
    filterVm.tab = "upcoming";
    filterVm.filters.keyword = "活动";
    filterVm.ensureActiveGroup();
    assert.strictEqual(filterVm.activeGroup, "event:7");
    assert.deepStrictEqual(filterVm.filterOptions.maps.map((map) => map.id), ["300"], "tabs have independent candidate sets");
    const subsetVm = panelVm({ recommendation: { ...result, recommendations: [
        { group: "a", ids: [9] }, { group: "hidden", ids: [2] }, { group: "b", ids: [5] },
    ] } });
    subsetVm.reorderGroups([{ group: "b" }, { group: "a" }]);
    assert.deepStrictEqual(subsetVm.groups.map((group) => group.group), ["b", "hidden", "a"], "filtered group reorder preserves hidden groups and their slots");
    const staleIndexVm = panelVm();
    const pendingIndex = deferred();
    detailLoader = () => pendingIndex.promise;
    const loadingIndex = staleIndexVm.loadFilterIndex();
    panel.watch.recommendation.handler.call(staleIndexVm);
    pendingIndex.resolve(allRecords);
    await loadingIndex;
    assert.strictEqual(staleIndexVm.filterIndexReady, false, "an old index cannot populate a new recommendation");
    assert.deepStrictEqual(staleIndexVm.filterIndex, {});
    detailLoader = async () => [];
    await staleIndexVm.loadFilterIndex();
    assert.strictEqual(staleIndexVm.filterIndexError, true, "incomplete index is an explicit retryable error");
    detailLoader = async () => allRecords;
    await staleIndexVm.loadFilterIndex();
    assert.strictEqual(staleIndexVm.filterIndexReady, true);
    assert.strictEqual(staleIndexVm.filterIndexError, false);
    const relatedResult = { ...result, recommendations: [result.recommendations[0],
        { group: "bucket:2:scene:100", ids: [5] }, { group: "bucket:3:map:100", ids: [6] }] };
    const relatedVm = panelVm({ recommendation: relatedResult, metadata: { ...metadata, 6: { point: 10 } } });
    assert.deepStrictEqual(relatedVm.relatedGroups.map((group) => group.group), ["bucket:2:scene:100"], "scene and world-map IDs are distinct namespaces");
    const relatedCalls = [];
    detailLoader = async ({ ids }) => { relatedCalls.push(ids); return records.filter((record) => ids.includes(record.id)); };
    await relatedVm.loadDetails();
    assert.deepStrictEqual(relatedCalls, [["9", "2"]], "collapsed same-place groups do not load eagerly");
    relatedVm.expandedGroups = ["bucket:2:scene:100"];
    const pendingRelated = deferred();
    detailLoader = () => pendingRelated.promise;
    const relatedLoading = relatedVm.loadDetails("bucket:2:scene:100");
    assert.strictEqual(relatedVm.detailsLoading, false, "loading another group must not hide the active list");
    assert.deepStrictEqual(relatedVm.rows.map((item) => item.id), ["9", "2"]);
    pendingRelated.resolve([records[0]]);
    await relatedLoading;
    assert.deepStrictEqual(relatedVm.groupRows("bucket:2:scene:100").map((item) => item.id), ["5"]);
    relatedVm.moveItem({ id: "5", group: relatedVm.activeGroup, beforeId: "2" });
    assert.deepStrictEqual(relatedVm.groups[0].ids.map(String), ["9", "5", "2"]);
    assert.strictEqual(relatedVm.relatedGroups.length, 0, "moving the last item removes its empty source group");
    assert.deepStrictEqual(relatedResult.recommendations[1].ids, [5], "draft moves never mutate the server response");
    assert.deepStrictEqual(relatedVm.draftRows.map((item) => item.id).sort(), ["2", "5", "6", "9"]);
    assert.strictEqual(relatedVm.draftRows.find((item) => item.id === "2").campRestricted, true);
    relatedVm.moveItem({ id: "2", group: relatedVm.activeGroup, beforeId: "9" });
    assert.deepStrictEqual(relatedVm.groups[0].ids.map(String), ["2", "9", "5"], "within-group moves preserve the requested order");
    const movedPlan = utils.buildAchievementRecommendationPlan({ items: relatedVm.selection.items, recommendation: relatedResult,
        title: "Moved plan", targetPoints: 50030, roleId: "42", preferences: {} });
    assert.deepStrictEqual(movedPlan.schema, ["2", "9", "5"]);
    assert.deepStrictEqual(movedPlan.meta.recommendationGroups[0].ids, ["2", "9", "5"]);
    assert.deepStrictEqual(movedPlan.meta.campRestrictedIds, ["2"]);
    const dropEvents = [];
    const listVm = { items: [{ id: "2" }, { id: "5" }], group: relatedVm.activeGroup, editable: true, disabled: false,
        $emit: (...args) => dropEvents.push(args) };
    itemList.methods.change.call(listVm, { moved: { element: { id: "5" }, newIndex: 0 } });
    assert.deepStrictEqual(dropEvents[0], ["move", { id: "5", group: relatedVm.activeGroup, beforeId: "2" }]);
    itemList.methods.change.call(listVm, { removed: { element: { id: "5" } } });
    assert.strictEqual(dropEvents.length, 1, "cross-list source removal cannot apply the same move twice");
    const filteredMove = utils.moveAchievementRecommendationItem([{ group: "target", ids: [1, 2, 3, 4] }], "4", "target", "2");
    assert.deepStrictEqual(filteredMove[0].ids, [1, 4, 2, 3], "hidden filtered rows remain in the draft around the visible insertion anchor");
    relatedVm.restoreDraft();
    assert.deepStrictEqual(relatedVm.groups, relatedResult.recommendations, "restore undoes item ordering and cross-group moves");
    assert.strictEqual(drawer.computed.canRequest.call({ controlsDisabled: true, roleAvailable: true }), false);
    assert.strictEqual(drawer.computed.canRequest.call({ controlsDisabled: false, roleAvailable: true, loading: false }), true);
    assert.strictEqual(drawer.computed.canRequest.call({ controlsDisabled: false, roleAvailable: false, loading: false }), false);
    assert.strictEqual(drawer.computed.controlsDisabled.call({ disabled: false, roleLoading: false, client: "std", roleAvailable: false }), false,
        "role selection remains available when there is no current role");
    const switchedDrawer = { hasRequested: true, selection: {} };
    drawer.watch.roleId.call(switchedDrawer);
    assert.deepStrictEqual(switchedDrawer, { hasRequested: false, selection: null });
    const drawerTemplate = parse(fs.readFileSync(path.join(root, "src/components/wiki/leap/AchievementLeapRecommendationDrawer.vue"), "utf8")).descriptor.template.content;
    assert.ok(drawerTemplate.includes('v-for="role in roles"'));
    assert.ok(drawerTemplate.includes("$emit('role-change', $event)"));
    assert.ok(!drawerTemplate.includes('achievementRecommendation.chooseCamp'));
    const drawerVm = { canRequest: true, recommendation: result, selection: { ...selection, ready: false }, planTitle: "Plan", targetPoints: 50010 };
    assert.strictEqual(drawer.computed.canApply.call(drawerVm), false);
    drawerVm.selection = selection;
    assert.strictEqual(drawer.computed.canApply.call(drawerVm), true);
    drawerVm.selection = { ...selection, recommendation: { ...result } };
    assert.strictEqual(drawer.computed.canApply.call(drawerVm), false, "an old preview cannot be submitted for a new recommendation");
    const upcomingRows = panel.computed.upcomingRows.call({ recommendation: result });
    assert.deepStrictEqual(
        upcomingRows.map((row) => row.id),
        ["6"]
    );
    assert.ok(!rows.some((row) => row.id === "6"));

    const keys = (value, prefix = "") =>
        Object.entries(value)
            .flatMap(([key, entry]) =>
                typeof entry === "object" ? keys(entry, `${prefix}${key}.`) : [`${prefix}${key}`]
            )
            .sort();
    const locales = ["zh-CN", "zh-TW", "en-US", "vi"].map(
        (locale) => load(`src/locale/${locale}/achievementRecommendation.js`).default
    );
    locales.slice(1).forEach((locale) => assert.deepStrictEqual(keys(locale), keys(locales[0])));
    console.log("Achievement recommendation multipliers, filtering, draft editing, plan creation, stale requests and locale tests passed.");
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
