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

function sliceBetween(source, startToken, endToken) {
    const start = source.indexOf(startToken);
    const end = source.indexOf(endToken, start + startToken.length);
    assert.ok(start >= 0, `缺少源码片段起点：${startToken}`);
    assert.ok(end > start, `缺少源码片段终点：${endToken}`);
    return source.slice(start, end);
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
    "difficultyDimensions",
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

locales.forEach(({ locale, messages }) => {
    const difficultyDimensions = getScope(messages, "difficultyDimensions");
    assert.strictEqual(
        typeof difficultyDimensions?.sortLoadFailed,
        "string",
        `${locale} 缺少难度排序数据加载失败文案`
    );

    const leapWorkbench = getScope(messages, "leap.ui.workbench");
    ["planClientMismatchTitle", "planClientMismatchDescription", "planClientMismatchWarning"].forEach((key) => {
        assert.strictEqual(typeof leapWorkbench?.[key], "string", `${locale} 缺少渡劫方案跨客户端文案 ${key}`);
    });
    ["std", "origin"].forEach((client) => {
        assert.strictEqual(
            typeof leapWorkbench?.clients?.[client],
            "string",
            `${locale} 缺少渡劫方案客户端名称 ${client}`
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
    ["consultation", "/consultation", "@/views/wiki/consultation.vue"],
    ["consultation-detail", "/consultation/:id", "@/views/wiki/consultation.vue"],
].forEach(([name, routePath, component]) => {
    assert.match(router, new RegExp(`name: ["']${name}["'][\\s\\S]+?path: ["']${routePath}["']`));
    assert.ok(router.includes(`import("${component}")`), `${name} 路由未挂载 ${component}`);
});
assert.doesNotMatch(router, /name: ["']overview-(normal|hidden|wujia|retired)["']/);
assert.doesNotMatch(rootRouter, /name: ["']overview-(normal|hidden|wujia|retired)["']/);
assert.doesNotMatch(rootRouter, /name: ["']overview-retired["']/);
assert.match(rootRouter, /name: ["']leap-detail["'][\s\S]+?path: ["']leap\/:id["']/);
assert.ok(rootRouter.includes('import("@/views/wiki/overview.vue")'));
assert.strictEqual((router.match(/workbenchPrimary: true/g) || []).length, 4);
assert.strictEqual((rootRouter.match(/workbenchPrimary: true/g) || []).length, 4);

const wrappers = {
    "src/views/wiki/overview.vue": "@/components/wiki/progress/AchievementProgressPage.vue",
    "src/views/wiki/compare.vue": "@/components/wiki/compare/AchievementComparePage.vue",
    "src/views/wiki/leap.vue": "@/components/wiki/leap/AchievementLeapPage.vue",
    "src/views/wiki/consultation.vue": "@/components/wiki/consultation/ConsultationWorkspace.vue",
};
Object.entries(wrappers).forEach(([file, component]) => {
    const source = read(file);
    assert.ok(source.includes(component), `${file} 未挂载 ${component}`);
    assert.doesNotMatch(source, /\/(pc|mobile|form|detail)\.vue/);
});

const nav = read("src/components/wiki/AchievementWorkbenchNav.vue");
const difficultyStarsPath = path.join(ROOT, "src/components/wiki/AchievementDifficultyStars.vue");
assert.ok(fs.existsSync(difficultyStarsPath), "缺少公共难度星级组件");
const difficultyStars = fs.readFileSync(difficultyStarsPath, "utf8");
assert.ok(difficultyStars.includes('name: "AchievementDifficultyStars"'));
assert.ok(difficultyStars.includes("getAchievementWorkbenchRatingFill"));
assert.ok(difficultyStars.includes('role="img"'));
assert.ok(difficultyStars.includes(":aria-label=\"accessibleLabel\""));
assert.ok(difficultyStars.includes("c-achievement-stars__filled"));
assert.doesNotMatch(difficultyStars, /Math\.round/);
const workbenchShell = read("src/views/wiki/index.vue");
assert.ok(nav.includes('guideUrl: "/notice/95651"'));
assert.ok(nav.includes('target="_blank"'));
assert.deepStrictEqual(
    [...nav.matchAll(/routeName: "([^"]+)"/g)].map((match) => match[1]),
    ["overview", "compare", "leap", "consultation"]
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
const compareUtils = read("src/utils/achievementCompare.js");
const leapPage = read("src/components/wiki/leap/AchievementLeapPage.vue");
const leapDetailHeader = read("src/components/wiki/leap/AchievementLeapDetailHeader.vue");
const leapPlanner = read("src/components/wiki/leap/AchievementLeapPlanner.vue");
const leapPlanList = read("src/components/wiki/leap/AchievementLeapPlanList.vue");
const leapRouteTable = read("src/components/wiki/leap/AchievementLeapRouteTable.vue");
const leapAddDialog = read("src/components/wiki/leap/AchievementLeapAddDialog.vue");
const progressInitializeSource = sliceBetween(progressPage, "async initializePage()", "async selectRole(");
const progressVisibleRecordsSource = sliceBetween(progressPage, "async loadVisibleRecords()", "async setListFilter(");
const progressSortSource = sliceBetween(progressPage, "async setListSort(", "updateSearchField(");
const compareInitializeSource = sliceBetween(comparePage, "async initializePage()", "hasCompareRole(");
const compareExportSource = sliceBetween(comparePage, "async exportComparison()", "    },\n};");
const leapEnrichmentSource = sliceBetween(leapPage, "async enrichAchievementItems(", "replaceRouteDisplayItems(");
const leapRecommendationSource = sliceBetween(leapPage, "async loadRecommendation()", "async loadPlans(");
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
assert.ok(progressPage.includes("includeHidden: false"));
assert.ok(progressPage.includes('tier: "normal"'));
assert.ok(progressPage.includes('sort: "default"'));
assert.ok(progressPage.includes("pageSize: 15"));
assert.ok(progressPage.includes('@reset-filters="resetListFilters"'));
assert.ok(progressPage.includes("this.filters = createDefaultFilters()"));
assert.ok(categoryBoard.includes('if (!value || value === "all") this.expandedCategoryId = null;'));
assert.ok(progressPage.includes(':show-category="false"'));
assert.ok(progressPage.includes('<template #filters>'));
assert.ok(progressSummary.includes('emits: ["select-tier", "select-role", "update:collapsed"]'));
assert.ok(progressSummary.includes('actionKey: "workbench.filterNormalAchievements"'));
assert.ok(progressSummary.includes('actionKey: "workbench.filterWujiaAchievements"'));
assert.ok(progressSummary.includes('actionKey: "workbench.viewHiddenAchievements"'));
assert.ok(progressSummary.includes('href: `${__Root}bbs/8104`'));
assert.ok(progressSummary.includes('target="_blank"'));
assert.doesNotMatch(progressFilters, /<el-option value="hidden"/);
assert.ok(progressSummary.includes(':aria-pressed="item.key === activeTier"'));
assert.ok(progressSummary.includes("$emit('select-tier', item.key)"));
assert.ok(progressSummary.includes("<Filter v-else />"));
assert.ok(progressSummary.includes('<TopRight v-if="item.href" />'));
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
assert.doesNotMatch(progressPage, /height: 752px|calc\(100vh - 244px\)/);
assert.doesNotMatch(categoryBoard, /overflow-y: auto|max-height: (310|640)px/);
assert.doesNotMatch(progressList, /overflow-y: auto/);
assert.ok(progressPage.includes('@update:collapsed="summaryCollapsed = $event"'));
assert.ok(progressPage.includes(':compact-overview="summaryCollapsed"'));
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
assert.ok(progressList.includes('v-if="hasRewardReference(record)" class="m-progress-achievement-reward"'));
assert.doesNotMatch(progressList, /record\.category\.(?:name|subName)/);
assert.ok(progressList.includes("getRewardKey(record)"));
assert.ok(progressList.includes('<jx3-item :item="getRewardItem(record)" />'));
assert.ok(progressList.includes("pages.wiki.overview.ui.rewardLoading"));
assert.ok(progressList.includes("pages.wiki.overview.ui.rewardUnavailable"));
assert.ok(progressPage.includes("fetchAchievementWorkbenchDifficultyMetrics"));
assert.ok(progressPage.includes("fetchAchievementWorkbenchTags"));
assert.ok(progressPage.includes("fetchAchievementWorkbenchDifficultyDimensions"));
assert.ok(progressPage.includes("resolveAchievementWorkbenchDimensions"));
assert.ok(progressPage.includes("applyAchievementWorkbenchEnrichment"));
assert.match(progressInitializeSource, /fetchAchievementWorkbenchDifficultyDimensions\(\)/);
assert.doesNotMatch(progressInitializeSource, /loadDifficultyMetrics\(/);
assert.match(progressVisibleRecordsSource, /loadVisibleEnrichment\(ids\)/);
assert.ok(progressPage.includes(':dimensions="dimensions"'));
assert.ok(progressPage.includes(':sort-loading="dimensionSortLoading"'));
assert.ok(progressPage.includes('@update:sort="setListSort"'));
assert.match(progressSortSource, /getAchievementWorkbenchDimensionSort/);
assert.match(progressSortSource, /metricCandidateIds/);
assert.match(progressSortSource, /throwOnError: true/);
assert.match(progressSortSource, /isCurrentDimensionSortRequest/);
assert.match(progressSortSource, /pages\.wiki\.difficultyDimensions\.sortLoadFailed/);
assert.doesNotMatch(progressFilters, /difficultySortEnabled|timeCostSortEnabled|futureSortsEnabled/);
assert.ok(progressFilters.includes('v-for="dimension in dimensions"'));
assert.ok(progressFilters.includes('`dimension:${dimension.key}:asc`'));
assert.ok(progressFilters.includes("pages.wiki.difficultyDimensions.sortAscending"));
assert.ok(progressFilters.includes(':disabled="sortLoading"'));
assert.ok(progressList.includes("AchievementDifficultyStars"));
assert.ok(progressList.includes('v-for="dimension in dimensions"'));
assert.ok(progressList.includes("getAchievementWorkbenchDimensionValue"));
assert.doesNotMatch(progressList, /Math\.round|formatDifficultyRating|formatDifficulty\(/);
assert.ok(progressList.includes("getDisplayTags(record)"));
assert.ok(progressList.includes("record.tier === 'wujia'"));
assert.doesNotMatch(progressList, /record\.completionStatistics\?\.completedRoleCount/);
assert.doesNotMatch(progressList, /record\.completionStatistics\?\.totalRoleCount/);
assert.match(progressList, /v-if="record\.map\?\.name"[\s\S]*?<Location/);
assert.match(progressPage, /async loadCurrentRole[\s\S]*?this\.recordRequestId \+= 1;/);
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
assert.ok(comparePage.includes("fetchAchievementWorkbenchDifficultyMetrics"));
assert.ok(comparePage.includes("fetchAchievementWorkbenchTags"));
assert.ok(comparePage.includes("fetchAchievementWorkbenchDifficultyDimensions"));
assert.ok(comparePage.includes("resolveAchievementWorkbenchDimensions"));
assert.ok(comparePage.includes("applyAchievementWorkbenchEnrichment"));
assert.ok(comparePage.includes("resetCompareView()"));
assert.match(comparePage, /resetCompareView\(\)[\s\S]*?this\.searchRecords = null;[\s\S]*?this\.keyword = "";/);
assert.match(compareInitializeSource, /fetchAchievementWorkbenchDifficultyDimensions\(\)/);
assert.ok(comparePage.includes(':definitions="definitions"'));
assert.ok(compareMatrix.includes("AchievementDifficultyStars"));
assert.ok(compareMatrix.includes('v-for="definition in definitions"'));
assert.ok(compareMatrix.includes("getAchievementWorkbenchDimensionValue"));
assert.doesNotMatch(compareMatrix, /Math\.round|formatDifficultyRating|formatDifficulty\(/);
assert.doesNotMatch(compareMatrix, /record\.cost\?\.(?:money|time|luck)|record\.costEffectiveness/);
assert.ok(compareMatrix.includes("record.completionStatistics?.rate"));
assert.ok(compareMatrix.includes("record.tags"));
assert.ok(compareMatrix.includes("getDisplayTags(record)"));
assert.match(compareMatrix, /v-if="record\.tier === 'wujia'"/);
assert.match(compareMatrix, /v-if="record\.map\?\.name"/);
assert.doesNotMatch(compareMatrix, /record\.category\.(?:name|subName)/);
assert.match(compareMatrix, /\.m-compare-achievement\s*\{[\s\S]*?align-items:\s*start;/);
assert.doesNotMatch(compareMatrix, /formatLevel\(/);
assert.doesNotMatch(compareMatrix, /formatMinutes\(record\.estimatedMinutes\)/);
assert.ok(compareUtils.includes("buildAchievementCompareExportData"));
assert.ok(compareUtils.includes("getAchievementWorkbenchDimensionValue"));
assert.match(compareUtils, /const completionSets = roleList\.map\([\s\S]*?getRoleCompletedAchievementSource\(role\)/);
assert.match(compareExportSource, /dimensions:\s*snapshot\.definitions/);
assert.match(compareExportSource, /hasOwnProperty\.call\(role, "completedAchievements"\)/);
assert.match(compareExportSource, /buildAchievementCompareExportData\(/);
assert.doesNotMatch(compareExportSource, /completedRoleCount|totalRoleCount/);
assert.ok(compareCategories.includes(".m-compare-category-card.is-all small"));
assert.match(
    comparePage,
    /async addRole[\s\S]*?const pageRequestId = this\.pageRequestId;[\s\S]*?await fetchAchievementWorkbenchRoleState[\s\S]*?pageRequestId !== this\.pageRequestId[\s\S]*?this\.hasCompareRole\(roleId\)/
);
assert.ok(leapPage.includes('name: "leap-detail"'));
assert.ok(leapPage.includes("this.$route.params.id || this.$route.query.id"));
assert.ok(leapPage.includes("fetchAchievementWorkbenchDifficulty"));
assert.ok(leapPage.includes("fetchAchievementWorkbenchDifficultyMetrics"));
assert.ok(leapPage.includes("fetchAchievementWorkbenchTags"));
assert.ok(leapPage.includes("fetchAchievementWorkbenchDifficultyDimensions"));
assert.ok(leapPage.includes("resolveAchievementWorkbenchDimensions"));
assert.ok(leapPage.includes("applyAchievementWorkbenchEnrichment"));
assert.doesNotMatch(leapPage, /getAchievementLeapCost(?:Score|Tier)/);
assert.match(leapPage, /resetClientState\(\)[\s\S]*?this\.plansPage = 1;/);
assert.match(
    leapPage,
    /resetPlanner\(\)[\s\S]*?this\.routeRequestId \+= 1;[\s\S]*?this\.routeLoading = false;/
);
assert.ok((leapPage.match(/:dimensions="dimensions"/g) || []).length >= 3);
assert.ok(leapRouteTable.includes("AchievementDifficultyStars"));
assert.ok(leapRouteTable.includes('v-for="dimension in dimensions"'));
assert.ok(leapRouteTable.includes("getAchievementWorkbenchDimensionValue"));
assert.ok(leapRouteTable.includes("getAchievementWorkbenchDimensionSort"));
assert.ok(leapRouteTable.includes('`dimension:${dimension.key}:asc`'));
assert.doesNotMatch(leapRouteTable, /Math\.round|formatDifficultyRating|costTier|cost-effectiveness-desc/);
assert.doesNotMatch(leapRouteTable, /item\.cost\?\.(?:money|time|luck)|item\.costEffectiveness/);
assert.ok(leapRouteTable.includes("item.completionStatistics?.rate"));
assert.ok(leapRouteTable.includes("item.tags"));
assert.ok(leapRouteTable.includes("getDisplayTags(item)"));
assert.ok(leapRouteTable.includes("showCompletionRateColumn"));
assert.ok(leapRouteTable.includes("showTagsColumn"));
assert.ok(leapRouteTable.includes("showSchoolRestrictionColumn"));
assert.ok(leapRouteTable.includes("showGuideNoteColumn"));
assert.match(leapRouteTable, /v-if="item\.map\?\.name"/);
assert.doesNotMatch(leapRouteTable, /formatLevel\(/);
assert.doesNotMatch(leapRouteTable, /compareNullable\(left\.estimatedMinutes, right\.estimatedMinutes\)/);
assert.match(leapEnrichmentSource, /this\.maps/);
assert.match(leapEnrichmentSource, /item\.map\?\.id/);
assert.match(leapEnrichmentSource, /mapById\.get\(/);
assert.ok(leapAddDialog.includes("AchievementDifficultyStars"));
assert.ok(leapAddDialog.includes("overallDimension()"));
assert.ok(leapAddDialog.includes('v-if="overallDimension"'));
assert.doesNotMatch(leapAddDialog, /Math\.round|\.repeat\(stars\)/);
assert.match(leapRecommendationSource, /fetchAchievementWorkbenchRecommendation\(/);
assert.doesNotMatch(leapRecommendationSource, /fetchAchievementWorkbenchDifficulty\(/);
assert.doesNotMatch(leapRecommendationSource, /fetchAchievementWorkbenchDifficultyMetrics\(/);
assert.match(leapPage, /async loadRoleState[\s\S]*?this\.routeRequestId \+= 1;/);
assert.match(leapPage, /async loadRoleState[\s\S]*?this\.editorRequestId \+= 1;/);
assert.match(leapPage, /async generateRoute[\s\S]*?const roleRequestId = this\.roleRequestId;/);
assert.match(
    leapPage,
    /async preparePlanForEditor[\s\S]*?const requestId = \+\+this\.editorRequestId;[\s\S]*?const roleRequestId = this\.roleRequestId;[\s\S]*?isCurrentEditorRequest/
);
assert.match(
    leapPage,
    /async saveRoute[\s\S]*?const requestId = \+\+this\.saveRequestId;[\s\S]*?const roleRequestId = this\.roleRequestId;[\s\S]*?isCurrentSaveRequest/
);
assert.match(
    leapPage,
    /async handleRoleChange[\s\S]*?const client = this\.currentClient;[\s\S]*?const loaded = await this\.loadRoleState[\s\S]*?!loaded[\s\S]*?client !== this\.currentClient/
);
assert.ok(leapPage.includes("requestPlanGuidance()"));
assert.ok(leapPage.includes("<PlanConsultations"));
assert.ok(leapPage.includes("this.$refs.consultations?.openCreate()"));
assert.doesNotMatch(leapPage, /guidanceSimulation|guidanceRequestId/);
assert.ok(leapDetailHeader.includes("request-guidance"));
assert.ok(leapDetailHeader.includes('v-if="guidanceAllowed"'));
assert.ok(leapDetailHeader.includes("achievementConsultation.title"));
assert.ok(leapDetailHeader.includes('<el-dropdown trigger="click"'));
assert.ok(leapDetailHeader.includes("moreActions"));
assert.ok(leapDetailHeader.includes('class="u-leap-detail-menu-button" type="primary"'));
assert.ok(leapDetailHeader.includes('class="u-leap-detail-menu-button" type="danger"'));
assert.ok(leapDetailHeader.includes("min-width: 88px"));
assert.doesNotMatch(leapDetailHeader, /\.u-leap-detail-menu-button\s*\{[^}]*width:\s*100%/);
assert.ok(leapDetailHeader.includes("@click=\"emitPlanAction('edit')\""));
assert.ok(leapDetailHeader.includes("@click=\"emitPlanAction('delete')\""));
assert.ok(leapDetailHeader.includes("if (this.actionsDisabled || !this.plan) return;"));
assert.ok(leapPage.includes("await this.$confirm("));
assert.ok(leapPage.includes("if (this.detailId === String(plan.id)) await this.closePlanDetail();"));
assert.ok(leapPage.includes('@remove="removeGeneratedRouteItem"'));
assert.ok(leapRouteTable.includes('emits: ["remove"]'));
assert.ok(leapRouteTable.includes('v-if="removable"'));
assert.doesNotMatch(leapPlanner, /selectedCategoryText|workbench\.selectedCategories/);
assert.ok(leapPlanList.includes("planCards()"));
assert.ok(leapPlanList.includes("m-leap-plan-card__progress-meta"));
assert.ok(leapPlanList.includes("grid-template-columns: repeat(4"));
assert.ok(leapPlanList.includes('description: this.description(plan) || "—"'));
assert.doesNotMatch(leapPlanList, /u-leap-plan-icon/);
assert.match(
    leapPlanList,
    /m-leap-plan-card__title-row[\s\S]*?u-leap-plan-source[\s\S]*?<h3[\s\S]*?u-leap-plan-description/
);
assert.ok(leapPlanList.includes('{{ card.description }}</p>'));
assert.ok(leapPlanList.includes('emits: ["view", "page-change"]'));
assert.ok(leapPlanList.includes('role="link"'));
assert.ok(leapPlanList.includes("@keydown.enter.prevent=\"$emit('view', card.plan)\""));
assert.ok(leapPlanList.includes("@keydown.space.prevent=\"$emit('view', card.plan)\""));
assert.doesNotMatch(leapPlanList, /m-leap-plan-card__actions|\$emit\(['\"](edit|copy|delete)['\"]/);
assert.doesNotMatch(leapPage, /<AchievementLeapPlanList[\s\S]*?@(edit|copy|delete)=/);

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
