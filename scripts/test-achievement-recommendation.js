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
const categories = [{ id: "17", name: "秘境", sourceIds: ["17", "41"] }, { id: "11", name: "任务", sourceIds: ["11"] }];
const defaultDirections = Object.fromEntries(Object.keys(utils.ACHIEVEMENT_RECOMMENDATION_DIRECTION_CATEGORIES).map((key) => [key, 1]));
const selectedOptions = { categoryIds: ["17"], dimensionWeights: { time: 0 }, directionWeights: { dungeon: 0.7 } };
const selectedPreferences = utils.achievementRecommendationPreferences(selectedOptions, categories);
assert.deepStrictEqual(selectedPreferences, { category_ids: [17, 41], dimension_weights: { time: 0 },
    direction_weights: { ...defaultDirections, dungeon: 0.7 } });
assert.strictEqual(selectedPreferences.dimension_ranges, undefined);
assert.strictEqual(utils.achievementRecommendationPreferences(utils.defaultAchievementRecommendationOptions(), categories).category_ids, undefined);
assert.deepStrictEqual(utils.achievementRecommendationPreferences({ ...selectedOptions, categoryIds: [] }, categories).category_ids, []);
assert.deepStrictEqual(utils.achievementRecommendationDirections(["11"], categories), ["quest"]);
assert.deepStrictEqual(utils.achievementRecommendationDirections(null, categories), ["dungeon", "quest"]);
assert.deepStrictEqual(utils.achievementRecommendationDirections([], categories), []);
assert.deepStrictEqual(utils.achievementRecommendationDirections(null, [
    { id: "1", name: "足迹" }, { id: "2", name: "阵营" }, { id: "3", name: "剑侠录" },
    { id: "4", name: "风雨江湖路" }, { id: "5", name: "新分类" },
]), ["map", "pvp", "story", "other"], "category aliases share one direction and unknown categories fall back to other");
assert.deepStrictEqual(utils.achievementRecommendationPreferences(utils.defaultAchievementRecommendationOptions(), categories).direction_weights, defaultDirections);
assert.deepStrictEqual(utils.achievementRecommendationPreferences({ ...selectedOptions, categoryIds: ["11"],
    directionWeights: { dungeon: 0, quest: 1.3, map: 0.7 } }, categories).direction_weights,
{ ...defaultDirections, quest: 1.3 }, "hidden overrides always submit 1, including old exclusions");
assert.deepStrictEqual(utils.achievementRecommendationPreferences({ ...selectedOptions, categoryIds: [],
    directionWeights: { dungeon: 0.7, quest: 1.3 } }, categories).direction_weights, defaultDirections);
for (const value of [undefined, null, 0, -1, 2, "0.7"]) {
    assert.strictEqual(utils.achievementRecommendationDirectionWeight(value), 1, "unsupported legacy weights default to the stage");
}
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
let categoryBuildArguments;
const countPage = load(pageFile, { ...pageDependencies, "@/utils/achievementLeap": {
    ...leapUtils, buildAchievementLeapCategoryOptions: (...args) => { categoryBuildArguments = args; return []; },
} }).default;
countPage.computed.categoryOptions.call({ menus: {}, metadata: {}, roleState: { completedIds: [123] },
    schoolEligibility: { school: "天策" } });
assert.deepStrictEqual(categoryBuildArguments, [{}, {}, [123], { visibleOnly: true }],
    "recommendation categories must not apply the local school-v1 eligibility context");
const panel = load("src/components/wiki/leap/AchievementLeapRecommendation.vue", {
    "./AchievementLeapAddDialog.vue": { render: () => null },
    "./AchievementRecommendationCandidatesDialog.vue": { render: () => null },
    "./AchievementRecommendationActionDialog.vue": { render: () => null },
    "./AchievementRecommendationItems.vue": {},
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
const categorySelector = load("src/components/wiki/leap/AchievementRecommendationCategories.vue", {
    "@element-plus/icons-vue": { CollectionTag: { render: () => null } },
    "@/utils/achievementCategoryImages": { achievementCategoryImages: { 任务: "/icons/任务.png", 秘境: "/icons/秘境.png" } },
}).default;
const categoryTemplate = parse(fs.readFileSync(path.join(root, "src/components/wiki/leap/AchievementRecommendationCategories.vue"), "utf8")).descriptor.template.content;
categorySelector.render = new Function("Vue", compile(categoryTemplate, { mode: "function", prefixIdentifiers: true }).code)(vue);
const workspace = load("src/components/wiki/leap/AchievementLeapRecommendationWorkspace.vue", {
    "@element-plus/icons-vue": {}, "./AchievementLeapRecommendation.vue": panel,
    "./AchievementRecommendationCategories.vue": categorySelector,
    "@/utils/achievementRecommendation": utils,
}).default;
const itemList = load("src/components/wiki/leap/AchievementRecommendationItems.vue", {
    "@element-plus/icons-vue": {}, "@jx3box/jx3box-common/js/utils": {}, "vuedraggable": {},
    "@/components/wiki/AchievementDifficultyStars.vue": {}, "@/utils/achievementWorkbench": workbench,
}).default;
assert.strictEqual(workspace.data().hasRequested, false);
const requestVm = { ...workspace.data(), canRequest: true, $emit: (event) => assert.strictEqual(event, "refresh") };
workspace.methods.requestRecommendation.call(requestVm);
assert.strictEqual(requestVm.hasRequested, true, "first request moves the button to the result header even before success");
assert.strictEqual(utils.achievementRecommendationPlace("bucket:0:scene:100"), "scene:100");
assert.strictEqual(utils.achievementRecommendationPlace("bucket:2:map:100"), "map:100");
assert.strictEqual(utils.achievementRecommendationPlace("bucket:2:direction:reading"), null);
assert.deepStrictEqual(workspace.data().expandedPreferences, ["categories"], "categories start expanded; both preference sections start collapsed");
const recommendationTemplate = fs.readFileSync(path.join(root, "src/components/wiki/leap/AchievementLeapRecommendation.vue"), "utf8");
for (const key of ["candidateHint", "refreshHint", "restoreDraftHint"]) {
    assert.ok(recommendationTemplate.includes(`achievementRecommendation.${key}`), `show clear ${key}`);
}
function panelVm(props = {}) {
    const vm = { ...panel.data(), recommendation: result, metadata, menus, maps, completedIds: [], targetPoints: 50030,
        disabled: false, messages: [], $message: { success(message) { vm.messages.push(message); } }, $refs: {}, $nextTick: (callback) => callback(), $i18n: { locale: "zh-CN" }, $t: (key) => key, ...props };
    Object.entries(panel.methods).forEach(([name, method]) => { vm[name] = method.bind(vm); });
    Object.entries(panel.computed).forEach(([name, getter]) => Object.defineProperty(vm, name, { get: () => getter.call(vm) }));
    vm.resetDraft();
    return vm;
}
assert.deepStrictEqual(workspace.computed.visibleDimensions.call({ dimensions: definitions }).map((d) => d.key), ["time"]);
assert.strictEqual(workspace.methods.dimensionWeight.call({ options: utils.defaultAchievementRecommendationOptions() }, { apiKey: "constructor", recommendationWeight: 8 }), 1);
assert.strictEqual(workspace.methods.directionWeight.call({ options: utils.defaultAchievementRecommendationOptions() }, "dungeon"), 1);
const preferenceVm = { options: utils.defaultAchievementRecommendationOptions(), categories, controlsDisabled: false,
    $t: (key) => key, $emit(event, value) { assert.strictEqual(event, "update:options"); this.options = value; } };
Object.entries(workspace.methods).forEach(([key, method]) => { preferenceVm[key] = method.bind(preferenceVm); });
Object.entries(workspace.computed).filter(([key]) => key.startsWith("direction")).forEach(([key, getter]) =>
    Object.defineProperty(preferenceVm, key, { get: () => getter.call(preferenceVm) }));
assert.deepStrictEqual(preferenceVm.directionPreferenceOptions.map((option) => option.value), [1.3, 1, 0.7]);
preferenceVm.updateDirection("dungeon", 0.7);
preferenceVm.updateCategories(["11"]);
assert.deepStrictEqual(preferenceVm.directionOptions, ["quest"]);
assert.deepStrictEqual(preferenceVm.options.directionWeights, {}, "deselecting a category discards its override");
preferenceVm.updateDirection("quest", 1.3);
preferenceVm.updateDirection("dungeon", 0.7);
preferenceVm.updateDirection("quest", 0);
assert.deepStrictEqual(preferenceVm.options.directionWeights, { quest: 1.3 }, "hidden directions and removed exclusion levels cannot be set");
preferenceVm.updateDirection("quest", 1);
assert.deepStrictEqual(preferenceVm.options.directionWeights, {});
preferenceVm.updateCategories(null);
assert.strictEqual(preferenceVm.directionWeight("dungeon"), 1, "reselecting does not restore a hidden preference");
preferenceVm.controlsDisabled = true;
preferenceVm.updateCategories([]);
preferenceVm.updateDirection("quest", 0.7);
assert.strictEqual(preferenceVm.options.categoryIds, null);
assert.deepStrictEqual(preferenceVm.options.directionWeights, {});

const categoryVm = { categories, modelValue: null, disabled: false,
    $emit(event, value) { assert.strictEqual(event, "update:modelValue"); this.modelValue = value; } };
Object.entries(categorySelector.methods).forEach(([key, method]) => { categoryVm[key] = method.bind(categoryVm); });
Object.defineProperty(categoryVm, "cards", { get: () => categorySelector.computed.cards.call(categoryVm) });
assert.ok(categoryVm.cards.every((card) => card.selected));
assert.strictEqual(categoryVm.cards.find((card) => card.name === "任务").icon, "/icons/任务.png", "use the progress category icon registry");
categoryVm.selectCategory("17", false);
assert.deepStrictEqual(categoryVm.modelValue, ["11"]);
categoryVm.selectCategory("17", true);
assert.strictEqual(categoryVm.modelValue, null, "selecting every card restores all-category mode");
categoryVm.selectAll(false);
assert.deepStrictEqual(categoryVm.modelValue, []);
assert.ok(categoryVm.cards.every((card) => !card.selected));
categoryVm.selectCategory("17", true);
assert.deepStrictEqual(categoryVm.modelValue, ["17"]);
categoryVm.selectAll(true);
categoryVm.disabled = true;
categoryVm.selectAll(false);
categoryVm.selectCategory("17", false);
assert.strictEqual(categoryVm.modelValue, null, "disabled category controls cannot change the selection");
const weightOptions = utils.defaultAchievementRecommendationOptions();
const weightVm = {
    options: weightOptions,
    updateOptions(patch) { Object.assign(this.options, patch); },
};
workspace.methods.updateEntry.call(weightVm, "dimensionWeights", "time", 2);
assert.strictEqual(workspace.methods.dimensionWeight.call(weightVm, { apiKey: "time", recommendationWeight: 10 }), 2);
const highWeightPreferences = utils.achievementRecommendationPreferences(weightVm.options, categories);
assert.deepStrictEqual(highWeightPreferences.dimension_weights, { time: 2 });
workspace.methods.updateEntry.call(weightVm, "dimensionWeights", "time", undefined);
assert.strictEqual(workspace.methods.dimensionWeight.call(weightVm, { apiKey: "time", recommendationWeight: 8 }), 1);
assert.ok(!pageSource.includes("<AchievementLeapPlanner"));
assert.ok(pageSource.includes("<AchievementLeapRecommendationWorkspace"));
assert.ok(pageSource.includes('v-show="!detailMode && !generatedRoute"'), "detail navigation must retain the recommendation component");
function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((done, fail) => {
        resolve = done;
        reject = fail;
    });
    return { promise, resolve, reject };
}

async function testWorkspaceDraftLifecycle() {
    // Render the real workspace template and panel state without a browser or network.
    const node = () => ({ children: [], parent: null, style: {} });
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
    const template = parse(fs.readFileSync(path.join(root, "src/components/wiki/leap/AchievementLeapRecommendationWorkspace.vue"), "utf8")).descriptor.template.content;
    const render = new Function("Vue", compile(template, { mode: "function", prefixIdentifiers: true }).code)(vue);
    let activePanel;
    const component = { ...workspace, render, components: { ...workspace.components,
        RefreshLeft: { render: () => null },
        AchievementLeapRecommendation: { ...panel, render: () => null, mounted() { activePanel = this; } },
    } };
    const state = vue.reactive({ detailMode: false, recommendation: result });
    const app = renderer.createApp({ render: () => vue.withDirectives(vue.h(component, {
        ...state, options: utils.defaultAchievementRecommendationOptions(), metadata, maps, menus,
        targetPoints: 50030, roleAvailable: true, planTitle: "Draft", roleId: "42",
    }), [[vue.vShow, !state.detailMode]]) });
    const slotContainer = { render() { return vue.h("div", this.$slots.default?.()); } };
    const controls = new Set([...template.matchAll(/<(el-[\w-]+)/g)].map(([, name]) => name));
    for (const name of controls) app.component(name, slotContainer);
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
        assert.ok(activePanel, "the homepage mounts recommendation results directly");
        await update({ detailMode: false });
        activePanel.moveItem({ id: "2", group: "bucket:0:scene:100", beforeId: "9" });
        activePanel.moveItem({ id: "5", group: "bucket:0:scene:100", beforeId: "2" });
        activePanel.filters.keyword = "backup query";
        await update({ detailMode: true });
        await update({ detailMode: false });
        assert.deepStrictEqual(activePanel.groups.map((group) => group.ids.map(String)), [["5", "2", "9"]],
            "viewing a saved plan and returning must preserve both group and item ordering");
        activePanel.removeItem({ id: "9" });
        await update({ detailMode: true });
        await update({ detailMode: false });
        assert.deepStrictEqual(activePanel.groups.map((group) => group.ids.map(String)), [["5", "2", "9"]],
            "unselecting preserves candidate data and manual ordering");
        assert.strictEqual(activePanel.filters.keyword, "backup query", "returning preserves shared filters");
        assert.deepStrictEqual(activePanel.selection.items.map((item) => item.id), ["5", "2"], "saved selection uses the retained draft");
        activePanel.restoreDraft();
        await vue.nextTick();
        assert.deepStrictEqual(activePanel.groups.map((group) => group.ids), [[9, 2], [5]], "explicit restore still resets the draft");
        activePanel.removeItem({ id: "9" });
        await update({ detailMode: true });
        await update({ recommendation: null });
        await update({ detailMode: false });
        assert.deepStrictEqual(activePanel.groups, [], "invalidated role or preferences cannot retain an old draft");
        await update({ detailMode: true });
        await update({ recommendation: { ...result, recommendations: [{ group: "new", ids: [5] }] } });
        await update({ detailMode: false });
        assert.deepStrictEqual(activePanel.groups.map((group) => group.ids), [[5]], "new recommendations replace the draft even while closed");
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
    assert.strictEqual(vm.candidateRows.length, 180);
    assert.strictEqual(vm.selectedItems.length, 120);
    assert.deepStrictEqual(vm.targetSummary, { projectedPoints: 100020, targetPoints: 100000, remainingPoints: 0, surplusPoints: 20 });
    assert.strictEqual(vm.matchingRows.length, 120, "selected-only view excludes candidates outside the saved selection");
    assert.deepStrictEqual(vm.matchingRows.map((row) => row.id), ids.slice(0, 120).map(String), "selection spans original group boundaries in one list");
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
    assert.strictEqual(vm.matchingRows.length, 1);
    assert.deepStrictEqual(vm.selection.items, selection.items, "view scope and search cannot alter the saved selection");
    assert.strictEqual(vm.targetSummary.projectedPoints, 100020, "projected points must not use just the visible search results");
    vm.filters.keyword = "";
    vm.candidatesVisible = true;
    assert.strictEqual(vm.matchingRows.length, 120, "opening alternatives never changes the main list");
    assert.strictEqual(vm.matchingCandidates.length, 180, "alternatives exclude selected achievements");
    vm.filters.keyword = "achievement-121";
    assert.deepStrictEqual(vm.matchingCandidates.map((row) => row.id), ["121"]);
    assert.strictEqual(vm.matchingRows.length, 0, "candidate filters stay synchronized with the main list");
    vm.filters.keyword = "";
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
    assert.strictEqual(vm.candidatesVisible, false, "reset closes alternatives");
    assert.strictEqual(panel.data().candidatesVisible, false, "alternatives are loaded only when opened");
    const editVm = panelVm({ targetPoints: 50010 });
    editVm.removeItem({ id: "2" });
    assert.deepStrictEqual(editVm.matchingRows.map((item) => item.id), ["9", "5"], "a removal refills the target deficit from other candidates");
    assert.deepStrictEqual(editVm.targetSummary, { projectedPoints: 50020, targetPoints: 50010, remainingPoints: 0, surplusPoints: 10 });
    editVm.moveItem({ id: "5", group: "bucket:0:scene:100", beforeId: "9" });
    assert.deepStrictEqual(editVm.matchingRows.map((item) => item.id), ["5", "9"], "manual ordering cannot change selection membership");
}

function testFilteredRecommendationDetails() {
    const vm = panelVm({ targetPoints: 50010 });
    vm.recordCache = Object.fromEntries(utils.enrichAchievementRecommendationRecords(records.map((record) => ({ ...record,
        iconId: `icon-${record.id}`, shortDescription: `description-${record.id}` })), menus, maps).map((record) => [record.id, record]));
    vm.filterIndex = Object.fromEntries(Object.values(vm.recordCache).map((record) => [record.id, {
        ...record, iconId: "", shortDescription: "", points: 0,
    }]));
    vm.filterIndexReady = true;
    assert.strictEqual(vm.visibleRows.find((row) => row.id === "2").iconId, "icon-2");
    vm.filters = { keyword: "秘境", mapIds: ["100"], categories: [["11"]] };
    assert.strictEqual(vm.visibleRows.length, 1);
    assert.strictEqual(vm.visibleRows[0].iconId, "icon-2", "filter index must not overwrite the full-detail icon");
    assert.strictEqual(vm.visibleRows[0].shortDescription, "description-2", "filtering preserves the description too");
    assert.strictEqual(vm.visibleRows[0].points, 10, "index defaults cannot overwrite point display");
    assert.strictEqual(vm.visibleRows[0].campRestricted, true, "draft eligibility metadata remains authoritative");
    vm.filters = { keyword: "长安", mapIds: ["200"], categories: [["6"]] };
    assert.strictEqual(vm.visibleCandidates[0].iconId, "icon-5", "candidate filters use the same complete details");
    assert.strictEqual(vm.visibleCandidates[0].shortDescription, "description-5");
    assert.deepStrictEqual(vm.matchingRows, [], "candidate and selected views share the same filters");
}

function testCandidateActions() {
    const recommendation = { ...result, recommendations: [
        { group: "bucket:0:scene:100", ids: [9, 2] },
        { group: "bucket:2:scene:100", ids: [5, 6] },
        { group: "bucket:0:map:100", ids: [7] },
    ] };
    const vm = panelVm({ recommendation, targetPoints: 50010, metadata: { ...metadata, 6: { point: 30 }, 7: { point: 40 } } });
    vm.filterIndexReady = true;
    vm.candidatesVisible = true;
    const ids = () => vm.selection.items.map((item) => item.id);
    vm.requestAction("add", { id: "5" }, "candidates");
    assert.deepStrictEqual(ids(), ["9", "2"], "opening confirmation cannot mutate selection");
    assert.deepStrictEqual(vm.actionRows.map((row) => row.id), ["5"], "confirmations default to a single item");
    assert.deepStrictEqual(vm.relatedActionRows.map((row) => row.id), ["5", "6"], "related additions ignore selected items and distinguish scene/map IDs");
    vm.pendingAction = null;
    assert.deepStrictEqual(ids(), ["9", "2"], "cancel keeps the selection intact");
    vm.requestAction("add", { id: "5" }, "candidates");
    vm.confirmAction();
    assert.deepStrictEqual(ids(), ["9", "2", "5"], "an addition keeps every original selected item and adds an extra");
    assert.deepStrictEqual(vm.messages, ["achievementRecommendation.candidatesAdded"], "confirmed additions show one success message");
    assert.ok(!recommendationTemplate.includes("actionNotice"), "action feedback must not persist above the selected list");
    assert.strictEqual(vm.targetSummary.surplusPoints, 20);
    assert.deepStrictEqual(vm.candidateRows.map((row) => row.id), ["6", "7"]);
    vm.requestAction("remove", { id: "6" }, "candidates");
    vm.pendingAction.scope = "related";
    assert.deepStrictEqual(vm.actionRows.map((row) => row.id), ["6"], "deleting alternatives cannot reach related selected items");
    vm.confirmAction();
    assert.deepStrictEqual(ids(), ["9", "2", "5"], "deleting alternatives leaves selection unchanged");
    vm.requestAction("remove", { id: "2" }, "selected");
    vm.confirmAction();
    assert.deepStrictEqual(ids(), ["9", "5"]);
    assert.deepStrictEqual(vm.candidateRows.map((row) => row.id), ["2", "7"], "unselected items return to alternatives without replacements");
    vm.requestAction("remove", { id: "9" }, "selected");
    vm.pendingAction.scope = "related";
    assert.deepStrictEqual(vm.actionRows.map((row) => row.id), ["9", "5"], "related selected removals cannot delete unselected siblings");
    vm.confirmAction();
    assert.deepStrictEqual(ids(), ["7"], "group removal refills from candidates outside all prior removals");
    assert.deepStrictEqual(vm.candidateRows.map((row) => row.id), ["9", "2", "5"]);
    assert.strictEqual(vm.targetSummary.remainingPoints, 0);
    vm.requestAction("add", { id: "5" }, "candidates");
    vm.pendingAction.scope = "related";
    vm.confirmAction();
    assert.deepStrictEqual(ids(), ["9", "2", "5", "7"], "bulk add keeps the existing selection and includes available candidates in the same map");
    vm.requestAction("add", { id: "5" }, "candidates");
    assert.strictEqual(vm.pendingAction, null, "an already-selected item cannot be added twice");
    vm.targetPoints = 51000;
    assert.deepStrictEqual(ids(), ["9", "2", "5", "7"], "target edits do not silently undo manual membership");
    vm.requestAction("remove", { id: "7" }, "selected");
    vm.disabled = true;
    vm.confirmAction();
    assert.ok(vm.selectedIds.has("7"), "disabled confirmations cannot edit the draft");
    vm.disabled = false;
    vm.targetPoints = 50010;
    vm.restoreDraft();
    assert.strictEqual(vm.pendingAction, null, "reset invalidates pending confirmations");
    assert.deepStrictEqual(ids(), ["9", "2"]);
    assert.deepStrictEqual(vm.candidateRows.map((row) => row.id), ["5", "6", "7"], "undo restores deleted alternatives too");
    vm.metadata = { ...vm.metadata, 6: {} };
    vm.candidatesVisible = true;
    vm.requestAction("add", { id: "5" }, "candidates");
    vm.pendingAction.scope = "related";
    assert.strictEqual(vm.actionMissingPointId, "6");
    vm.confirmAction();
    assert.deepStrictEqual(ids(), ["9", "2"], "invalid points prevent partial group additions");
    vm.pendingAction.scope = "single";
    vm.confirmAction();
    assert.deepStrictEqual(ids(), ["9", "2", "5"], "a valid single addition can proceed independently");
}

function testManualAdditions() {
    const vm = panelVm({ targetPoints: 50010, metadata: { ...metadata, 5: { point: 20, general: 1 },
        8: { point: 50, general: 1 }, 10: { point: 25, general: 1 }, 11: { point: null, general: 1 } }, completedIds: ["10"] });
    const item = { id: "8", name: "额外成就", points: 50, category: { id: "11", subId: "111" }, mapIds: [] };
    const ids = () => vm.selectedItems.map((entry) => entry.id);
    const original = ids();
    vm.addVisible = true;
    vm.requestManualAdd(item);
    assert.strictEqual(vm.pendingAction.source, "manual");
    assert.deepStrictEqual(vm.actionItems.map((entry) => entry.name), ["额外成就"]);
    assert.deepStrictEqual(ids(), original, "opening confirmation does not change selection");
    vm.pendingAction = null;
    assert.ok(!vm.draftRows.some((row) => row.id === "8"), "cancel leaves the recommendation pool untouched");
    vm.requestManualAdd(item);
    vm.confirmAction();
    assert.deepStrictEqual(ids(), [...original, "8"], "manual additions outside server candidates retain the initial selection");
    assert.strictEqual(vm.targetSummary.surplusPoints, 50);
    assert.strictEqual(vm.originalGroupById[8], "manual:8");
    assert.strictEqual(utils.achievementRecommendationGroupLabel("manual:8", [], (key) => key), "achievementRecommendation.manualGroup");
    const savedItems = utils.selectAchievementRecommendationItems(vm.selection.items, 50000, 50010, vm.selection.includedIds);
    assert.deepStrictEqual(savedItems.map((entry) => entry.id), ids(), "saving retains manually selected surplus achievements");
    vm.requestManualAdd(item);
    assert.strictEqual(vm.pendingAction, null, "duplicate manual additions are rejected");
    for (const id of ["10", "11", "404"]) {
        vm.requestManualAdd({ ...item, id });
        assert.strictEqual(vm.pendingAction, null, "completed or invalid-point records cannot be added");
    }
    vm.requestAction("remove", item, "selected");
    vm.confirmAction();
    assert.deepStrictEqual(ids(), original);
    assert.ok(vm.candidateRows.some((row) => row.id === "8"), "removed manual items return to candidates");
    vm.requestManualAdd(item); vm.confirmAction();
    assert.strictEqual(vm.draftRows.filter((row) => row.id === "8").length, 1, "re-adding does not duplicate the draft row");
    vm.requestManualAdd({ ...item, id: "5", points: 20 }); vm.confirmAction();
    assert.strictEqual(vm.draftRows.filter((row) => row.id === "5").length, 1, "existing server candidates use their original row");
    vm.restoreDraft();
    assert.deepStrictEqual(ids(), original, "undo restores the original membership");
    assert.ok(!vm.draftRows.some((row) => row.id === "8"));
}

function testRemovalRefill() {
    const ids = [1, 2, 3, 4, 5];
    const vm = panelVm({ recommendation: { ...result, recommendations: [{ group: "same-map", ids }] },
        targetPoints: 50050, metadata: { 1: { point: 30 }, 2: { point: 20 }, 3: { point: 10 }, 4: { point: 30 }, 5: { point: 40 } } });
    vm.filterIndexReady = true;
    vm.candidatesVisible = true;
    const selected = () => vm.selection.items.map((item) => item.id);
    const remove = (id) => { vm.requestAction("remove", { id }, "selected"); vm.confirmAction(); };
    vm.requestAction("add", { id: "3" }, "candidates"); vm.confirmAction();
    remove("3");
    assert.deepStrictEqual(selected(), ["1", "2"], "no replacements are added when the remaining total meets the target");
    vm.filters.keyword = "no visible matches";
    remove("1");
    assert.deepStrictEqual(selected(), ["2", "4"], "refill follows the full candidate order and excludes previous removals regardless of filters");
    assert.deepStrictEqual(vm.autoFillExcludedIds, ["3", "1"]);
    remove("4");
    assert.deepStrictEqual(selected(), ["2", "5"], "subsequent removal cannot immediately reselect previously removed achievements");
    remove("5");
    assert.deepStrictEqual(selected(), ["2"], "candidate exhaustion preserves the remaining manual selection");
    assert.strictEqual(vm.targetSummary.remainingPoints, 30);
    assert.strictEqual(vm.selection.ready, true, "an honest shortfall remains saveable when points are complete");
    vm.requestAction("add", { id: "1" }, "candidates"); vm.confirmAction();
    assert.deepStrictEqual(selected(), ["1", "2"], "an explicit selection can restore an automatically excluded item");
    assert.ok(!vm.autoFillExcludedIds.includes("1"));
    vm.restoreDraft();
    assert.deepStrictEqual(vm.autoFillExcludedIds, [], "undo resets automatic refill exclusions");
    vm.filterIndexReady = true;
    vm.metadata[3] = {};
    remove("1");
    assert.strictEqual(vm.selectionResult.missingPointId, "3", "refill cannot skip a required candidate with missing points");
    assert.strictEqual(vm.selection.ready, false);
}

async function testCandidateLoading() {
    const vm = panelVm({ targetPoints: 50010 });
    const calls = [];
    detailLoader = async ({ ids }) => { calls.push(ids); return records.filter((record) => ids.includes(record.id)); };
    await vm.loadDetails();
    assert.deepStrictEqual(calls, [["9", "2"]], "main view only loads selected details");
    vm.candidatesVisible = true;
    await vm.loadDetails("candidates");
    assert.deepStrictEqual(calls, [["9", "2"], ["5"]], "alternatives load independently when opened");
    assert.deepStrictEqual(vm.visibleRows.map((item) => item.id), ["9", "2"]);
    assert.deepStrictEqual(vm.visibleCandidates.map((item) => item.id), ["5"]);
    vm.filterIndexReady = true;
    vm.requestAction("add", { id: "5" }, "candidates");
    vm.confirmAction();
    await vm.loadDetails();
    assert.strictEqual(calls.length, 2, "adding reuses the alternative detail cache");
    assert.deepStrictEqual(vm.visibleRows.map((item) => item.id), ["9", "2", "5"]);
    assert.deepStrictEqual(vm.visibleCandidates, []);
    const pending = deferred();
    const closed = panelVm({ targetPoints: 50010 });
    closed.candidatesVisible = true;
    detailLoader = () => pending.promise;
    const loading = closed.loadDetails("candidates");
    closed.candidatesVisible = false;
    pending.resolve(records.filter((record) => record.id === "5"));
    await loading;
    assert.deepStrictEqual(closed.recordCache, {}, "closing alternatives stops stale dialog results");
    detailLoader = async ({ ids }) => records.filter((record) => ids.includes(record.id));
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
    vm.moveItem({ id: "5", group: "bucket:0:scene:100", beforeId: "9" });
    assert.strictEqual(vm.selection.ready, true, "reordering cannot select an unknown alternative");
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
    assert.deepStrictEqual(vm.rows.map((item) => item.id), ["9", "2", "5"], "slow difficulty must not hide successfully loaded details");
    assert.strictEqual(vm.detailsLoading, false);
    assert.strictEqual(vm.selection.ready, true, "difficulty is optional for creating a plan");
    assert.deepStrictEqual(metricCalls, [["9", "2", "5"]], "difficulty batches cross group boundaries without loading upcoming activities");
    pendingMetrics.reject(new Error("difficulty offline"));
    await flush();
    assert.strictEqual(vm.detailsError, false);
    assert.strictEqual(vm.difficultyStates[vm.tab].error, true);
    assert.deepStrictEqual(vm.rows.map((item) => item.id), ["9", "2", "5"]);
    vm.moveItem({ id: "2", group: "bucket:0:scene:100", beforeId: "9" });
    difficultyLoader = async (ids) => { metricCalls.push(ids); return defaultDifficultyLoader(ids); };
    await vm.loadDifficulty();
    assert.strictEqual(vm.difficultyStates[vm.tab].error, false);
    assert.strictEqual(vm.rows[0].difficultyDimensions.money, 1.9);
    assert.deepStrictEqual(vm.rows.map((item) => item.id), ["2", "9", "5"], "difficulty retry preserves manual edits");
    assert.strictEqual(detailCalls.length, 1, "retrying difficulty must not refetch successful details");
    await vm.loadDifficulty();
    assert.strictEqual(metricCalls.length, 2, "successful difficulty is cached across revisits");

    const missingVm = panelVm();
    difficultyLoader = async (ids) => Object.fromEntries(ids.map((id) => [id, null]));
    await missingVm.loadDifficulty();
    assert.strictEqual(missingVm.difficultyStates[missingVm.tab].error, false, "unconfigured ratings are not transport errors");
    difficultyLoader = async () => { throw new Error("must use cached unconfigured values"); };
    await missingVm.loadDifficulty();
    assert.strictEqual(missingVm.difficultyStates[missingVm.tab].error, false);

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
    assert.strictEqual(raceVm.difficultyStates[raceVm.tab].loading, false);

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
    const batchVm = panelVm({ recommendation: { ...result, recommendations: [{ group: "large", ids: batchIds }] },
        metadata: Object.fromEntries(batchIds.map((id) => [id, { point: 10 }])), targetPoints: 60000 });
    const batches = [];
    difficultyLoader = async (ids) => {
        batches.push(ids);
        if (ids.includes("1240")) throw new Error("second batch offline");
        return defaultDifficultyLoader(ids);
    };
    await batchVm.loadDifficulty();
    assert.strictEqual(batchVm.difficultyStates.recommended.error, true);
    assert.strictEqual(Object.keys(batchVm.difficultyCache).length, 240, "a later batch failure keeps earlier successful difficulty");
    difficultyLoader = async (ids) => { batches.push(ids); return defaultDifficultyLoader(ids); };
    await batchVm.loadDifficulty();
    assert.deepStrictEqual(batches.map((batch) => batch.length), [240, 2, 2], "retry fetches only failed or missing difficulty IDs");
    assert.strictEqual(batchVm.difficultyStates.recommended.error, false);
    assert.strictEqual(Object.keys(batchVm.difficultyCache).length, 242);
    difficultyLoader = defaultDifficultyLoader;
}

async function testContinuousRecommendationBatches() {
    const ids = Array.from({ length: 242 }, (_, index) => index + 1000);
    const batchRecords = ids.map((id) => ({ id: String(id), name: `Achievement ${id}`, points: 10,
        category: { id: "11", subId: "112" }, map: { id: "100" } }));
    const vm = panelVm({ recommendation: { ...result, recommendations: [
        { group: "bucket:0:scene:100", ids: ids.slice(0, 100) },
        { group: "bucket:2:scene:100", ids: ids.slice(100) },
    ] }, metadata: Object.fromEntries(ids.map((id) => [id, { point: 10 }])), targetPoints: 60000 });
    const tail = deferred();
    const calls = [];
    detailLoader = async ({ ids }) => {
        calls.push(ids);
        if (ids.includes("1240")) return tail.promise;
        return batchRecords.filter((record) => ids.includes(record.id));
    };
    const loading = vm.loadDetails();
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepStrictEqual(calls.map((batch) => batch.length), [240, 2], "requests combine groups into bounded sequential batches");
    assert.strictEqual(vm.detailsLoading, true);
    assert.deepStrictEqual(vm.visibleRows.map((row) => row.id), ids.slice(0, 240).map(String), "loaded rows appear before the complete list finishes");
    tail.reject(new Error("tail offline"));
    await loading;
    assert.strictEqual(vm.detailsError, true);
    assert.strictEqual(vm.visibleRows.length, 240, "a later failure preserves the already visible prefix");
    detailLoader = async ({ ids }) => { calls.push(ids); return batchRecords.filter((record) => ids.includes(record.id)); };
    await vm.loadDetails();
    assert.deepStrictEqual(calls.map((batch) => batch.length), [240, 2, 2], "retry only loads missing details");
    assert.strictEqual(vm.detailsError, false);
    assert.deepStrictEqual(vm.visibleRows.map((row) => row.id), ids.map(String));
    vm.filters = { keyword: "", mapIds: ["100"], categories: [] };
    vm.filterIndex = Object.fromEntries(batchRecords.map((row) => [row.id, { ...row, mapIds: ["100"] }]));
    assert.deepStrictEqual(vm.visibleRows.map((row) => row.id), ids.map(String), "filtering keeps the continuous order");
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
    assert.strictEqual(vm.tagStates[vm.tab].error, true);
    assert.strictEqual(vm.detailsError, false);
    assert.deepStrictEqual(vm.rows.map((item) => item.id), ["9", "2", "5"], "optional tag failure must not hide details");
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
    const batchVm = panelVm({ recommendation: { ...result, recommendations: [{ group: "large", ids: batchIds }] },
        metadata: Object.fromEntries(batchIds.map((id) => [id, { point: 10 }])), targetPoints: 60000 });
    const batches = [];
    tagsLoader = async (ids) => {
        batches.push(ids);
        if (ids.includes("1240")) throw new Error("second tag batch offline");
        return defaultTagsLoader(ids);
    };
    await batchVm.loadTags();
    assert.strictEqual(batchVm.tagStates.recommended.error, true);
    assert.strictEqual(Object.keys(batchVm.tagCache).length, 240);
    tagsLoader = async (ids) => { batches.push(ids); return defaultTagsLoader(ids); };
    await batchVm.loadTags();
    assert.deepStrictEqual(batches.map((ids) => ids.length), [240, 2, 2], "retry keeps successful tag batches and only fetches missing IDs");
    assert.strictEqual(Object.keys(batchVm.tagCache).length, 242);

    const eventsVm = panelVm({ $t: (key, params) => params?.id ? `活动标签 #${params.id}` : key });
    eventsVm.tab = "upcoming";
    assert.match(eventsVm.upcomingRows[0].eventLabel, /活动标签 #7/);
    eventTagLoader = async () => { throw new Error("event name offline"); };
    await eventsVm.loadEventTags();
    assert.strictEqual(eventsVm.eventTagsError, true);
    assert.match(eventsVm.upcomingRows[0].eventLabel, /活动标签 #7/, "event ID remains usable when public tag names fail");
    let eventRequests = 0;
    eventTagLoader = async (id) => { eventRequests++; return { id: String(id), label: "节日：冬至", description: "节日说明" }; };
    await eventsVm.loadEventTags();
    assert.match(eventsVm.upcomingRows[0].eventLabel, /节日：冬至/);
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
    const renderSummary = async (role, excluded_summary, { recommendations = [], upcoming_events = [], targetPoints = 50030 } = {}) => {
        const component = { ...panel, render, components: { ...panel.components,
            RefreshLeft: { render: () => null }, Search: { render: () => null } } };
        const app = vue.createSSRApp(component, { recommendation: { ...result, role, recommendations, upcoming_events, excluded_summary },
            hasRequested: true, canRequest: true, roleAvailable: true, metadata, targetPoints });
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
    const navigation = (markup) => markup.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] || "";
    assert.match(html, /成就同步时间：2026\/9\/5/);
    assert.match(html, /入选 0 项/, "the sticky summary remains visible with a valid recommendation");
    assert.match(html, /预计达到/, "the sticky summary retains the target projection");
    assert.match(html, /已入选清单/, "the main list defaults to selected achievements");
    assert.doesNotMatch(navigation(html), /查看候选|待开放活动|当前推荐/, "the main list no longer has a candidate scope switch");
    assert.match(html, /查看候选 \(0\)/, "the summary owns the alternative dialog button");
    const alternatives = await renderSummary(result.role, {}, { recommendations: result.recommendations, targetPoints: 50010 });
    assert.match(alternatives, /查看候选 \(1\)/, "the button counts only unselected candidates");
    assert.doesNotMatch(alternatives, /当前推荐|只看已入选|全部候选/, "the default view does not repeat the candidate pool as tabs or radio buttons");
    const allSelected = await renderSummary(result.role, {}, { recommendations: result.recommendations });
    assert.match(allSelected, /查看候选 \(0\)/, "an empty dialog explains when all candidates are selected");
    const upcoming = await renderSummary(result.role, {}, { upcoming_events: result.upcoming_events });
    assert.match(navigation(upcoming), /待开放活动 \(1\)/, "only nonempty upcoming activities show an entry");
    assert.doesNotMatch(html, /UTC\+8/);
    assert.match(html, /快照较旧/);
    assert.match(html, /href="\/pvx\/achievements\/guide#sync" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /重新生成推荐不会同步游戏数据/);
    assert.match(html, /<dt>已完成<\/dt><dd>300<\/dd>/);
    assert.match(html, /其他原因（future_rule）/);
    assert.doesNotMatch(html, /<dd>306<\/dd>|<dd>0<\/dd>/, "exclusion categories are not summed or padded with zero counts");
    const unknown = await renderSummary({ ...result.role, snapshot_updated_at: "invalid" }, {});
    assert.match(unknown, /同步时间未知/);
    assert.doesNotMatch(unknown, /Invalid Date|全部未完成|m-recommendation-exclusions|快照较旧/);
}

async function main() {
    const categoryMessages = load("src/locale/zh-CN/achievementRecommendation.js").default;
    const categoryApp = vue.createSSRApp(categorySelector, {
        modelValue: null, countsReady: true,
        categories: [{ id: "7", name: "任务", incompleteCount: 42, schoolExcludedCount: 999 }],
    });
    categoryApp.config.globalProperties.$t = (key, params = {}) =>
        String(categoryMessages[key.replace("achievementRecommendation.", "")] || key)
            .replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? ""));
    const categoryHtml = await require("@vue/server-renderer").renderToString(categoryApp);
    assert.ok(categoryHtml.includes("未完成 42"));
    assert.ok(categoryHtml.includes("门派排除 —"));
    assert.ok(!categoryHtml.includes("999"), "never display a frontend-computed school exclusion count as backend data");
    assert.ok(categoryHtml.includes('/icons/任务.png'));
    const resetEvents = [];
    const resetVm = {
        controlsDisabled: false, loading: false, canRequest: true, recommendation: result,
        $emit(event, value) {
            resetEvents.push([event, value]);
            if (event === "update:options") this.recommendation = null;
        },
        $nextTick: () => Promise.resolve(),
    };
    resetVm.requestRecommendation = workspace.methods.requestRecommendation.bind(resetVm);
    const resetting = workspace.methods.reset.call(resetVm);
    assert.deepStrictEqual(resetEvents, [["update:options", utils.defaultAchievementRecommendationOptions()]],
        "reset updates preferences before requesting recommendations");
    await resetting;
    assert.deepStrictEqual(resetEvents.map(([event]) => event), ["update:options", "refresh"],
        "reset automatically requests recommendations once after the update");
    resetEvents.length = 0;
    resetVm.loading = true;
    await workspace.methods.reset.call(resetVm);
    assert.strictEqual(resetEvents.length, 0, "loading prevents resetting and duplicate requests");
    resetVm.loading = false;
    resetVm.recommendation = result;
    resetVm.canRequest = false;
    await workspace.methods.reset.call(resetVm);
    assert.deepStrictEqual(resetEvents.map(([event]) => event), ["update:options"],
        "without an eligible role reset preferences but do not request");
    resetEvents.length = 0;
    resetVm.canRequest = true;
    resetVm.recommendation = null;
    for (const hasRequested of [false, true]) {
        resetVm.hasRequested = hasRequested;
        await workspace.methods.reset.call(resetVm);
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
    testFilteredRecommendationDetails();
    testCandidateActions();
    testManualAdditions();
    testRemovalRefill();
    await testCandidateLoading();
    await testIndependentRecommendationData();
    await testContinuousRecommendationBatches();
    await testWorkspaceDraftLifecycle();
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
    vm.createDefaultForm = page.methods.createDefaultForm.bind(vm);
    vm.clearEditor = () => page.methods.clearEditor.call(vm);
    vm.loadPlans = async () => {};
    const openedPlans = [];
    vm.openPlan = async (plan) => {
        assert.strictEqual(vm.editingPlan, null, "exit editing before navigating to the created detail");
        assert.strictEqual(vm.generatedRoute, null, "created detail navigation cannot carry an editor draft");
        openedPlans.push(plan);
    };
    const messages = [];
    vm.$message = {
        error: (message) => messages.push(message), warning: (message) => messages.push(message), success: (message) => messages.push(message),
    };
    vm.planListVisible = true;
    vm.editingPlan = { id: "old-plan" };
    vm.generatedRoute = { items: [{ id: "old-item" }] };
    vm.saveDialogVisible = true;
    vm.addDialogVisible = true;
    const previousEditorRequestId = vm.editorRequestId;
    const selection = { recommendation: result, ready: true, items: utils.hydrateAchievementRecommendation(rows, records) };
    await page.methods.createRecommendedPlan.call(vm, selection);
    assert.strictEqual(savedPlans.length, 1);
    assert.strictEqual(savedPlans[0].id, undefined, "system recommendation creates a new plan, never overwrites the open editor");
    assert.strictEqual(vm.planListVisible, false);
    assert.strictEqual(vm.editingPlan, null, "successful recommendation creation exits an existing editor");
    assert.strictEqual(vm.generatedRoute, null, "returning from the created detail must not restore the old route");
    assert.strictEqual(vm.saveDialogVisible, false);
    assert.strictEqual(vm.addDialogVisible, false);
    assert.deepStrictEqual(vm.plannerForm, { title: "Plan", targetPoints: 50010 }, "saved recommendation keeps its title and target when returning");
    assert.ok(vm.editorRequestId > previousEditorRequestId, "in-flight editor hydration cannot restore cleared state");
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
    const manualSelection = { ...selection, includedIds: ["9", "2", "5"] };
    vm.plannerForm = { title: "Plan", targetPoints: 50010 };
    await page.methods.createRecommendedPlan.call(vm, manualSelection);
    assert.deepStrictEqual(savedPlans[1].payload.schema, ["9", "2", "5"], "saving must retain manual additions beyond the target");
    assert.strictEqual(savedPlans[1].payload.meta.selectedPoints, 30);
    const manualShortfall = { ...selection, items: selection.items.filter((item) => item.id === "9"), includedIds: ["9"] };
    vm.plannerForm = { title: "Plan", targetPoints: 50010 };
    await page.methods.createRecommendedPlan.call(vm, manualShortfall);
    assert.deepStrictEqual(savedPlans[2].payload.schema, ["9"], "saving an edited shortfall must not pull in candidates");
    openedPlans.splice(1);
    const pendingSave = deferred();
    let saveCalls = 0;
    planSaver = () => { saveCalls += 1; return pendingSave.promise; };
    vm.planListVisible = true;
    vm.plannerForm = { title: "Plan", targetPoints: 50010 };
    const saving = page.methods.createRecommendedPlan.call(vm, selection);
    await page.methods.createRecommendedPlan.call(vm, selection);
    assert.strictEqual(saveCalls, 1, "double clicking cannot create duplicate plans");
    vm.recommendationRequestId += 1;
    const preservedEditor = { id: "new-context-plan" };
    const preservedRoute = { items: [{ id: "5" }] };
    const preservedForm = vm.plannerForm;
    vm.editingPlan = preservedEditor;
    vm.generatedRoute = preservedRoute;
    pendingSave.resolve({ id: "stale" });
    await saving;
    assert.strictEqual(openedPlans.length, 1, "stale save cannot navigate the new role or recommendation");
    assert.strictEqual(vm.editingPlan, preservedEditor, "stale saves cannot clear the current editor");
    assert.strictEqual(vm.generatedRoute, preservedRoute);
    assert.strictEqual(vm.saving, false);
    planSaver = async () => { throw new Error("save offline"); };
    await page.methods.createRecommendedPlan.call(vm, selection);
    assert.strictEqual(vm.planListVisible, true, "failed save preserves the draft");
    assert.strictEqual(vm.editingPlan, preservedEditor, "failed creation cannot discard the editor");
    assert.strictEqual(vm.generatedRoute, preservedRoute);
    assert.strictEqual(vm.plannerForm, preservedForm);
    assert.strictEqual(vm.saving, false);
    assert.strictEqual(messages[messages.length - 1], "pages.wiki.leap.ui.createFailed");

    Object.defineProperty(vm, "recommendationDisabled", {
        get: () => page.computed.recommendationDisabled.call(vm),
    });
    vm.planListVisible = false;
    assert.strictEqual(vm.recommendationDisabled, true, "the recommendation entry is disabled while editing");
    let blockedRequests = 0;
    recommendationLoader = async () => { blockedRequests += 1; return result; };
    await page.methods.loadRecommendation.call(vm);
    assert.strictEqual(blockedRequests, 0, "editing cannot start a recommendation request");
    vm.editingPlan = null;
    assert.strictEqual(vm.recommendationDisabled, true, "a copied local draft also disables recommendations");
    vm.clearEditor();
    assert.strictEqual(vm.recommendationDisabled, false, "discarding the editor re-enables recommendations");
    vm.saving = true;
    assert.strictEqual(vm.recommendationDisabled, true, "saving keeps the entry disabled");
    vm.saving = false;

    const detailVm = panelVm();
    const requestedBatches = [];
    detailLoader = async ({ ids }) => { requestedBatches.push(ids); return records.filter((record) => ids.includes(record.id)); };
    await detailVm.loadDetails();
    await detailVm.loadDifficulty();
    assert.deepStrictEqual(requestedBatches, [["9", "2", "5"]], "one list loads all matching groups together, excluding upcoming events");
    assert.deepStrictEqual(detailVm.rows.map((row) => row.id), ["9", "2", "5"]);
    assert.strictEqual(detailVm.rows[0].difficultyDimensions.money, 1.9);
    detailVm.moveItem({ id: "5", group: "bucket:0:scene:100", beforeId: "9" });
    await detailVm.loadDetails();
    assert.strictEqual(requestedBatches.length, 1, "reordering reuses detail cache");
    assert.deepStrictEqual(detailVm.selection.items.map((row) => row.id), ["5", "9", "2"]);
    detailVm.filters.keyword = "not found";
    assert.deepStrictEqual(detailVm.visibleRows, []);
    assert.strictEqual(detailVm.selection.items.length, 3, "view filters do not remove plan items");
    for (const id of ["9", "2", "5"]) detailVm.removeItem({ id });
    await detailVm.loadDetails();
    assert.deepStrictEqual(detailVm.selection.items, []);
    detailVm.resetDraft();
    await detailVm.loadDetails();
    assert.strictEqual(requestedBatches.length, 1, "restoring a draft reuses details");
    detailVm.tab = "upcoming";
    assert.strictEqual(detailVm.selection.ready, false);
    const originalGroups = detailVm.groups;
    detailVm.moveItem({ id: "5", group: "bucket:0:scene:100", beforeId: "9" });
    detailVm.removeItem({ id: "9" });
    assert.strictEqual(detailVm.groups, originalGroups, "upcoming items are read-only");

    const raceVm = panelVm();
    const oldDetails = deferred();
    detailLoader = () => oldDetails.promise;
    const oldDetailRequest = raceVm.loadDetails();
    raceVm.recommendation = { ...result, recommendations: [result.recommendations[1]] };
    panel.watch.recommendation.handler.call(raceVm);
    detailLoader = async () => [records[0]];
    await raceVm.loadDetails();
    oldDetails.resolve(records);
    await oldDetailRequest;
    assert.deepStrictEqual(raceVm.rows.map((record) => record.id), ["5"]);
    assert.deepStrictEqual(Object.keys(raceVm.recordCache), ["5"], "stale responses cannot populate a new recommendation's cache");
    assert.strictEqual(raceVm.detailsLoading, false);

    const filterVm = panelVm();
    const indexCalls = [];
    const allRecords = [...records, { id: "6", name: "活动", category: { id: "18", subId: "181" }, map: { id: "300" } }];
    detailLoader = async (options, batchSize) => { indexCalls.push({ ...options, batchSize }); return allRecords.filter((item) => options.ids.includes(item.id)); };
    assert.deepStrictEqual(filterVm.filterOptions.maps, []);
    await filterVm.loadFilterIndex();
    assert.strictEqual(indexCalls.length, 1);
    assert.strictEqual(indexCalls[0].attributes, "ID,Name,ShortDesc,Sub,Detail,SceneID,dwMapID");
    assert.strictEqual(indexCalls[0].batchSize, 1000);
    assert.deepStrictEqual(indexCalls[0].ids, ["9", "2", "5", "6"]);
    assert.deepStrictEqual(Object.keys(filterVm.recordCache), [], "search index never substitutes for full scored details");
    const fullOptions = filterVm.filterOptions;
    filterVm.filters.keyword = "长安";
    assert.deepStrictEqual(filterVm.matchingRows.map((row) => row.id), ["5"]);
    assert.deepStrictEqual(filterVm.filterOptions, fullOptions, "options remain global when results are narrowed");
    filterVm.filters = { ...noFilters, mapIds: ["200"] };
    assert.deepStrictEqual(filterVm.matchingRows.map((row) => row.id), ["9", "5"], "map search returns matches from every group in one list");
    filterVm.filters = { ...noFilters, categories: [["11", "112"]] };
    assert.deepStrictEqual(filterVm.matchingRows.map((row) => row.id), ["2"]);
    assert.strictEqual(filterVm.selection.items.length, 3, "filters do not change the saved plan");
    filterVm.filters.keyword = "none";
    assert.deepStrictEqual(filterVm.matchingRows, []);
    filterVm.filters = { ...noFilters };
    assert.strictEqual(filterVm.matchingRows.length, 3);
    await filterVm.loadFilterIndex();
    assert.strictEqual(indexCalls.length, 1, "filter index is cached");
    filterVm.tab = "upcoming";
    filterVm.filters.keyword = "活动";
    assert.deepStrictEqual(filterVm.matchingRows.map((row) => row.id), ["6"]);
    assert.deepStrictEqual(filterVm.filterOptions.maps.map((map) => map.id), ["300"], "tabs have independent candidate sets");
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

    const placesResult = { ...result, recommendations: [result.recommendations[0],
        { group: "bucket:3:map:100", ids: [6] }, { group: "bucket:2:scene:100", ids: [5] }] };
    const placesVm = panelVm({ recommendation: placesResult, metadata: { ...metadata, 6: { point: 10 } } });
    assert.deepStrictEqual(placesVm.draftRows.map((row) => row.id), ["9", "2", "5", "6"],
        "same scene stays adjacent across cost bands, while map and scene ID namespaces stay separate");
    assert.deepStrictEqual(placesResult.recommendations.map((group) => group.ids), [[9, 2], [6], [5]], "arranging the draft must not mutate the response");
    detailLoader = async ({ ids }) => allRecords.filter((record) => ids.includes(record.id));
    await placesVm.loadDetails();
    assert.deepStrictEqual(placesVm.visibleRows.map((row) => row.id), ["9", "2", "5"], "main list omits the remaining candidate");
    placesVm.moveItem({ id: "5", group: "bucket:0:scene:100", beforeId: "2" });
    assert.deepStrictEqual(placesVm.groups[0].ids.map(String), ["9", "5", "2"]);
    assert.strictEqual(placesVm.groups.length, 2, "moving the last item removes its empty source group");
    assert.strictEqual(placesVm.draftRows.find((item) => item.id === "2").campRestricted, true);
    placesVm.moveItem({ id: "2", group: "bucket:0:scene:100", beforeId: "9" });
    const movedPlan = utils.buildAchievementRecommendationPlan({ items: placesVm.selection.items, recommendation: placesResult,
        title: "Moved plan", targetPoints: 50030, roleId: "42", preferences: {} });
    assert.deepStrictEqual(movedPlan.schema, ["2", "9", "5"]);
    assert.deepStrictEqual(movedPlan.meta.recommendationGroups[0].ids, ["2", "9", "5"]);
    assert.deepStrictEqual(movedPlan.meta.campRestrictedIds, ["2"]);
    const dropEvents = [];
    const listVm = { items: [{ id: "2", recommendationGroup: "first" }, { id: "5", recommendationGroup: "second" }],
        editable: true, disabled: false, $emit: (...args) => dropEvents.push(args) };
    itemList.methods.change.call(listVm, { moved: { element: listVm.items[1], newIndex: 0 } });
    assert.deepStrictEqual(dropEvents[0], ["move", { id: "5", group: "first", beforeId: "2" }]);
    itemList.methods.change.call(listVm, { moved: { element: listVm.items[0], newIndex: 1 } });
    assert.deepStrictEqual(dropEvents[1], ["move", { id: "2", group: "second", beforeId: null }], "dropping at the end appends to the final group");
    listVm.disabled = true;
    itemList.methods.change.call(listVm, { moved: { element: listVm.items[0], newIndex: 1 } });
    assert.strictEqual(dropEvents.length, 2);
    const filteredMove = utils.moveAchievementRecommendationItem([{ group: "target", ids: [1, 2, 3, 4] }], "4", "target", "2");
    assert.deepStrictEqual(filteredMove[0].ids, [1, 4, 2, 3], "hidden filtered rows remain in the draft around the insertion anchor");
    placesVm.restoreDraft();
    assert.deepStrictEqual(placesVm.draftRows.map((row) => row.id), ["9", "2", "5", "6"], "restore returns to the original map-adjacent order");
    assert.strictEqual(workspace.computed.canRequest.call({ controlsDisabled: true, roleAvailable: true }), false);
    assert.strictEqual(workspace.computed.canRequest.call({ controlsDisabled: false, roleAvailable: true, loading: false }), true);
    assert.strictEqual(workspace.computed.canRequest.call({ controlsDisabled: false, roleAvailable: false, loading: false }), false);
    assert.strictEqual(workspace.computed.controlsDisabled.call({ disabled: false, roleLoading: false, client: "std", roleAvailable: false }), false,
        "role selection remains available when there is no current role");
    const switchedWorkspace = { hasRequested: true, selection: {} };
    workspace.watch.roleId.call(switchedWorkspace);
    assert.deepStrictEqual(switchedWorkspace, { hasRequested: false, selection: null });
    const workspaceTemplate = parse(fs.readFileSync(path.join(root, "src/components/wiki/leap/AchievementLeapRecommendationWorkspace.vue"), "utf8")).descriptor.template.content;
    assert.ok(workspaceTemplate.includes('v-for="role in roles"'));
    assert.ok(workspaceTemplate.includes("$emit('role-change', $event)"));
    assert.ok(!workspaceTemplate.includes('achievementRecommendation.chooseCamp'));
    const workspaceVm = { canRequest: true, recommendation: result, selection: { ...selection, ready: false }, planTitle: "Plan", targetPoints: 50010 };
    assert.strictEqual(workspace.computed.canApply.call(workspaceVm), false);
    workspaceVm.selection = selection;
    assert.strictEqual(workspace.computed.canApply.call(workspaceVm), true);
    workspaceVm.selection = { ...selection, recommendation: { ...result } };
    assert.strictEqual(workspace.computed.canApply.call(workspaceVm), false, "an old preview cannot be submitted for a new recommendation");
    const upcomingRows = panel.computed.upcomingRows.call({ recommendation: result, eventGroupLabel: () => "event" });
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
