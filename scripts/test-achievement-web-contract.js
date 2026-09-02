const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const ROOT = path.resolve(__dirname, "..");

function loadModule(file) {
    const result = babel.transformFileSync(file, {
        babelrc: false,
        configFile: false,
        presets: [[require.resolve("@babel/preset-env"), { targets: { node: "current" } }]],
    });
    const loadedModule = { exports: {} };
    new Function("module", "exports", "require", result.code)(loadedModule, loadedModule.exports, require);
    return loadedModule.exports.default || loadedModule.exports;
}

function collectLeafPaths(value, prefix = "") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [prefix];
    return Object.keys(value).flatMap((key) => collectLeafPaths(value[key], prefix ? `${prefix}.${key}` : key));
}

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function listSourceFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) return listSourceFiles(target);
        return /\.(js|vue|less)$/.test(entry.name) ? [target] : [];
    });
}

const locales = ["zh-CN", "zh-TW", "en-US", "vi"].map((locale) => ({
    locale,
    messages: loadModule(path.join(ROOT, `src/locale/${locale}/pages.js`)),
}));
const i18nScopes = [
    "sidebar",
    "overview.ui.workbench",
    "compare.ui.workbench",
    "leap.ui.workbench",
];
const getScope = (messages, scope) => scope.split(".").reduce((value, key) => value?.[key], messages.wiki);

i18nScopes.forEach((scope) => {
    const baseline = collectLeafPaths(getScope(locales[0].messages, scope)).sort();
    assert.ok(baseline.length > 0, `zh-CN 缺少 pages.wiki.${scope}`);
    locales.slice(1).forEach(({ locale, messages }) => {
        assert.deepStrictEqual(
            collectLeafPaths(getScope(messages, scope)).sort(),
            baseline,
            `${locale} 的 pages.wiki.${scope} 键集合与 zh-CN 不一致`
        );
    });
});

const router = read("src/pages/wiki/router.js");
const rootRouter = read("src/router/index.js");
[
    ["overview", "/overview", "@/views/wiki/overview.vue"],
    ["compare", "/compare", "@/views/wiki/compare.vue"],
    ["leap", "/leap", "@/views/wiki/leap.vue"],
    ["leap-detail", "/leap/:id", "@/views/wiki/leap.vue"],
].forEach(([name, routePath, component]) => {
    assert.match(router, new RegExp(`name: ["']${name}["'][\\s\\S]+?path: ["']${routePath}["']`));
    assert.ok(router.includes(`import("${component}")`), `${name} 路由未挂载 ${component}`);
});
assert.doesNotMatch(router, /name: ["']overview-(normal|hidden|wujia|retired)["']/);
assert.doesNotMatch(rootRouter, /name: ["']overview-(normal|hidden|wujia|retired)["']/);
assert.doesNotMatch(rootRouter, /name: ["']overview-retired["']/);
assert.match(rootRouter, /name: ["']leap-detail["'][\s\S]+?path: ["']leap\/:id["']/);
assert.ok(rootRouter.includes('import("@/views/wiki/overview.vue")'));
assert.strictEqual((router.match(/workbenchPrimary: true/g) || []).length, 3);
assert.strictEqual((rootRouter.match(/workbenchPrimary: true/g) || []).length, 3);

const wrappers = {
    "src/views/wiki/overview.vue": "@/components/wiki/progress/AchievementProgressPage.vue",
    "src/views/wiki/compare.vue": "@/components/wiki/compare/AchievementComparePage.vue",
    "src/views/wiki/leap.vue": "@/components/wiki/leap/AchievementLeapPage.vue",
};
Object.entries(wrappers).forEach(([file, component]) => {
    const source = read(file);
    assert.ok(source.includes(component), `${file} 未挂载 ${component}`);
    assert.doesNotMatch(source, /\/(pc|mobile|form|detail)\.vue/);
});

const nav = read("src/components/wiki/AchievementWorkbenchNav.vue");
const workbenchShell = read("src/views/wiki/index.vue");
assert.ok(nav.includes('guideUrl: "/notice/95651"'));
assert.ok(nav.includes('target="_blank"'));
assert.deepStrictEqual(
    [...nav.matchAll(/routeName: "([^"]+)"/g)].map((match) => match[1]),
    ["overview", "compare", "leap"]
);
assert.ok(workbenchShell.includes('this.$route.meta.workbenchPrimary === true'));
assert.ok(workbenchShell.includes('<AchievementWorkbenchNav v-if="showWorkbenchNav"'));
assert.ok(workbenchShell.includes("'is-subpage': !showWorkbenchNav"));

const progressPage = read("src/components/wiki/progress/AchievementProgressPage.vue");
const progressSummary = read("src/components/wiki/progress/AchievementProgressSummary.vue");
const progressFilters = read("src/components/wiki/progress/AchievementProgressFilters.vue");
const progressList = read("src/components/wiki/progress/AchievementProgressList.vue");
const categoryBoard = read("src/components/wiki/progress/AchievementCategoryBoard.vue");
const comparePage = read("src/components/wiki/compare/AchievementComparePage.vue");
const compareRoleBar = read("src/components/wiki/compare/AchievementCompareRoleBar.vue");
const compareFilters = read("src/components/wiki/compare/AchievementCompareFilters.vue");
const compareCategories = read("src/components/wiki/compare/AchievementCompareCategoryTree.vue");
const compareMatrix = read("src/components/wiki/compare/AchievementCompareMatrix.vue");
const leapPage = read("src/components/wiki/leap/AchievementLeapPage.vue");
const leapPlanner = read("src/components/wiki/leap/AchievementLeapPlanner.vue");
const leapPlanList = read("src/components/wiki/leap/AchievementLeapPlanList.vue");
const leapRouteTable = read("src/components/wiki/leap/AchievementLeapRouteTable.vue");
assert.doesNotMatch(progressPage, /AchievementTierAchievementsPage|TIER_VIEW_DEFINITIONS|openTierAchievements/);
assert.ok(progressPage.includes(':active-tier="filters.tier"'));
assert.ok(progressPage.includes('@select-tier="selectTier"'));
assert.ok(progressPage.includes('return this.setListFilter("tier", tier)'));
assert.ok(progressPage.includes('achievementListTitle()'));
assert.ok(progressPage.includes('workbench.categoryPath'));
assert.ok(progressPage.includes('primary: parentCategory.name'));
assert.ok(progressPage.includes('secondary: this.selectedCategory.name'));
assert.ok(progressPage.includes(':title="achievementListTitle"'));
assert.doesNotMatch(progressPage, /workbench\.(allAchievements|categoryAchievements)/);
assert.doesNotMatch(progressList, /workbench\.allAchievements/);
assert.ok(progressPage.includes('includeHidden: this.filters.tier === "hidden"'));
assert.ok(progressPage.includes('tier: "normal"'));
assert.ok(progressPage.includes('sort: "default"'));
assert.ok(progressPage.includes('@reset-filters="resetListFilters"'));
assert.ok(progressPage.includes("this.filters = createDefaultFilters()"));
assert.ok(progressPage.includes(':show-category="false"'));
assert.ok(progressPage.includes('<template #filters>'));
assert.ok(progressSummary.includes('emits: ["select-tier", "select-role", "update:collapsed"]'));
assert.ok(progressSummary.includes('actionKey: "workbench.filterNormalAchievements"'));
assert.ok(progressSummary.includes('actionKey: "workbench.filterWujiaAchievements"'));
assert.ok(progressSummary.includes('actionKey: "workbench.filterHiddenAchievements"'));
assert.ok(progressSummary.includes(':aria-pressed="item.key === activeTier"'));
assert.ok(progressSummary.includes("$emit('select-tier', item.key)"));
assert.ok(progressSummary.includes("<Filter />"));
assert.ok(progressSummary.includes("@click=\"$emit('update:collapsed', !collapsed)\""));
assert.ok(progressSummary.includes('v-show="!collapsed"'));
assert.ok(progressSummary.includes(':aria-expanded="!collapsed"'));
assert.ok(progressSummary.includes('aria-controls="achievement-progress-summary-details"'));
assert.ok(progressSummary.includes("workbench.summaryCollapse"));
assert.ok(progressSummary.includes("workbench.summaryExpand"));
assert.ok(progressSummary.includes("min-height: 128px"));
assert.ok(progressSummary.includes("width: 144px"));
assert.ok(progressPage.includes("summaryCollapsed: false"));
assert.ok(progressPage.includes(':collapsed="summaryCollapsed"'));
assert.ok(progressPage.includes('@update:collapsed="summaryCollapsed = $event"'));
assert.ok(progressPage.includes(':compact-overview="summaryCollapsed"'));
assert.ok(progressPage.includes("is-summary-collapsed"));
assert.ok(progressPage.includes("height: clamp(480px, calc(100vh - 244px), 820px)"));
assert.doesNotMatch(progressSummary, /ArrowRight/);
assert.ok(progressFilters.includes('mapSelectValue()'));
assert.ok(progressFilters.includes('<el-option value="default"'));
assert.ok(progressFilters.includes('workbench.sortDefault'));
assert.ok(progressFilters.includes("$emit('reset-filters')"));
assert.ok(progressFilters.includes("<RefreshLeft"));
assert.doesNotMatch(progressFilters, /clear-search|workbench\.clear/);
assert.strictEqual((progressFilters.match(/<el-option value="all"/g) || []).length, 2);
assert.doesNotMatch(progressFilters, /workbench\.allTiers/);
assert.doesNotMatch(progressFilters, /<el-option value="retired"/);
assert.ok(progressList.includes('<slot name="filters" />'));
assert.ok(progressList.includes("fetchAchievementWorkbenchRewardItems"));
assert.ok(progressList.includes("hasAchievementRewards"));
assert.ok(progressList.includes("getRewardKey(record)"));
assert.ok(progressList.includes('<jx3-item :item="getRewardItem(record)" />'));
assert.ok(progressList.includes("pages.wiki.overview.ui.rewardLoading"));
assert.ok(progressList.includes("pages.wiki.overview.ui.rewardUnavailable"));
assert.ok(categoryBoard.includes('require.context("@/assets/img/wiki/overview/item"'));
assert.ok(categoryBoard.includes("category.children"));
assert.ok(categoryBoard.includes("m-progress-category-browser"));
assert.ok(categoryBoard.includes("m-progress-subcategory-panel"));
assert.ok(categoryBoard.includes("m-progress-subcategory-list"));
assert.ok(categoryBoard.includes("u-progress-category-direction"));
assert.ok(categoryBoard.includes("compactOverview"));
assert.ok(categoryBoard.includes("is-compact-overview"));
assert.doesNotMatch(categoryBoard, /grid-template-columns:\s*repeat\(2/);
assert.doesNotMatch(categoryBoard, /u-progress-category-toggle/);
assert.ok(fs.readdirSync(path.join(ROOT, "src/assets/img/wiki/overview/item")).length >= 18);
assert.doesNotMatch(progressSummary, /open(Normal|Wujia|Hidden|Retired)Achievements/);
assert.doesNotMatch(progressSummary, /workbench\.tierScope/);
assert.ok(comparePage.includes("roleSummaryCollapsed: false"));
assert.ok(comparePage.includes('currentRoleId: ""'));
assert.ok(comparePage.includes("roleId === this.currentRoleId"));
assert.ok(comparePage.includes(':collapsed="roleSummaryCollapsed"'));
assert.ok(comparePage.includes('@update:collapsed="roleSummaryCollapsed = $event"'));
assert.ok(comparePage.includes('<template #filters>'));
assert.ok(comparePage.includes('@reset-filters="resetCompareFilters"'));
assert.ok(comparePage.includes("selectMenuRootsByGeneral(this.menus, this.metadata, 1)"));
assert.ok(comparePage.includes("height: clamp(480px, calc(100vh - 244px), 820px)"));
assert.ok(comparePage.includes("selectedFilters: []"));
assert.ok(comparePage.includes('filters.commonIncomplete"'));
assert.doesNotMatch(comparePage, /COMMON_COMPLETED_FILTER|filters\.commonIncompleteRecommended/);
assert.ok(compareRoleBar.includes('emits: ["add-role", "remove-role", "update:collapsed"]'));
assert.ok(comparePage.includes("isCurrent: String(role.id || role.jx3id) === this.currentRoleId"));
assert.ok(compareRoleBar.includes('v-if="role.isCurrent"'));
assert.ok(compareRoleBar.includes('<Lock aria-hidden="true"'));
assert.ok(compareRoleBar.includes('v-show="!collapsed"'));
assert.ok(compareRoleBar.includes('aria-controls="achievement-compare-role-details"'));
assert.ok(compareFilters.includes('"reset-filters"'));
assert.ok(compareFilters.includes("<RefreshLeft"));
assert.doesNotMatch(compareFilters, /clear-search/);
assert.ok(compareCategories.includes('require.context("@/assets/img/wiki/overview/item"'));
assert.ok(compareCategories.includes("m-compare-category-browser"));
assert.ok(compareCategories.includes("m-compare-subcategory-panel"));
assert.ok(compareMatrix.includes('<slot name="filters" />'));
assert.ok(leapPage.includes('name: "leap-detail"'));
assert.ok(leapPage.includes("this.$route.params.id || this.$route.query.id"));
assert.ok(leapPage.includes('@remove="removeGeneratedRouteItem"'));
assert.ok(leapRouteTable.includes('emits: ["remove"]'));
assert.ok(leapRouteTable.includes('v-if="removable"'));
assert.doesNotMatch(leapPlanner, /selectedCategoryText|workbench\.selectedCategories/);
assert.ok(leapPlanList.includes("planCards()"));
assert.ok(leapPlanList.includes("m-leap-plan-card__progress-meta"));
assert.ok(leapPlanList.includes("grid-template-columns: repeat(4"));

const removedFiles = [
    "src/components/wiki/AchievementOverviewPanel.vue",
    "src/components/wiki/SeniorityItem.vue",
    "src/components/wiki/TreeProgress.vue",
    "src/components/wiki/sidebar.vue",
    "src/components/wiki/progress/AchievementTierAchievementsPage.vue",
    "src/assets/css/wiki/index.less",
    "src/assets/css/wiki/overview.less",
    "src/assets/css/modules/achievement-compare-theme.less",
    "src/assets/css/modules/achievement-leap-form.less",
    "src/assets/css/modules/achievement-leap-theme.less",
    "src/assets/css/modules/achievement-overview-theme.less",
];
removedFiles.forEach((file) => assert.strictEqual(fs.existsSync(path.join(ROOT, file)), false, `${file} 应已移除`));

const staleTokens = [
    "achievement-compare-theme",
    "achievement-leap-form",
    "achievement-leap-theme",
    "achievement-overview-theme",
    "AchievementOverviewPanel",
    "SeniorityItem",
    "TreeProgress",
];
const sourceFiles = listSourceFiles(path.join(ROOT, "src"));
staleTokens.forEach((token) => {
    const references = sourceFiles.filter((file) => fs.readFileSync(file, "utf8").includes(token));
    assert.deepStrictEqual(references, [], `仍存在旧 Web 引用 ${token}`);
});

const miniprogramRoot = path.join(ROOT, "src/views/wiki/miniprogram");
const miniprogramFiles = listSourceFiles(miniprogramRoot);
assert.ok(miniprogramFiles.length >= 10, "小程序/App 独立页面不完整");
assert.ok(fs.existsSync(path.join(ROOT, "src/components/wiki/RoleAvatar.vue")), "小程序共用角色头像组件缺失");
assert.ok(fs.existsSync(path.join(ROOT, "src/utils/wiki_miniprogram.js")), "小程序数据适配器缺失");
assert.ok(fs.readdirSync(path.join(ROOT, "src/assets/img/wiki_miniprogram")).length > 0, "小程序图片资源缺失");
miniprogramFiles.forEach((file) => {
    assert.doesNotMatch(fs.readFileSync(file, "utf8"), /@\/assets\/img\/wiki\//, `${file} 仍依赖已清理的 Web 素材`);
});

console.log("Achievement Web route, i18n and cleanup contract tests passed.");
