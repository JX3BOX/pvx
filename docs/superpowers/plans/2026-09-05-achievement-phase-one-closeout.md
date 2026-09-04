# 资历宝典第一阶段收尾 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改动 OS、不设计或实现推荐生成逻辑的前提下，完成 PVX 资历宝典三个页面对公共难度维度、批量难度、同步完成率和成就标签接口的接入收口，使展示、排序、导出、空值规则和请求性能保持一致。

**Architecture:** 继续以 `src/service/achievementWorkbench.js` 作为唯一接口适配层，以 `src/utils/achievementWorkbench.js` 保存纯数据规则。页面容器以 Vue 3 Options API 持有动态维度定义并通过 props 下发；展示组件不猜测接口字段。难度星级抽成公共只读组件。接口失败时退回内置五维定义并保留页面基础能力，不能回退到 OS 管理接口或 `std` 数据。

**Tech Stack:** Vue 3 Options API、Vuex、Element Plus、Less、现有 Babel/Node `assert` 测试脚本、xlsx。

**Spec:** 本对话已确认的展示口径、`/Users/fifththirteen/Downloads/jx3boxcms_swagger.json`、`docs/design/achievement-layout.md`、`docs/agents/achievement-workbench-data-contract.md`。

## 全局边界

- 只修改 `/Users/fifththirteen/Documents/work/jx3box/pvx`；不修改 OS 项目及 CMS 后端。
- 只调用公共接口：
  - `GET /api/cms/pvx/wiki_achievement_difficulty/dimensions`
  - `POST /api/cms/pvx/wiki_achievement_difficulty/list?client=std|origin`
  - `POST /api/cms/pvx/wiki_achievement_tag/by-achievements?client=std|origin`
- 不调用任何 `/manage/...` 接口，也不把 OS 的维度 CRUD、标签维护、批量导入或配置统计复制到 PVX。
- 推荐功能明确移出本阶段。以下逻辑保持不变：
  - `src/utils/achievementLeap.js`
  - `src/utils/achievementSchoolEligibility.js`
  - `src/components/wiki/leap/AchievementLeapRecommendation.vue`
  - `AchievementLeapPage.vue` 中的 `loadRecommendation()`
  - `src/service/achievementWorkbench.js` 中供 `stage-v1` 使用的 `fetchAchievementWorkbenchDifficulty()`
- 系统推荐和玩家自选均保持现有本地 mock/逻辑；本阶段不新增浏览器端推荐规则，不新增或接入后端生成接口，也不把标签文案作为推荐、资格或活动时间规则。
- `tag_type/tag_value` 尚未进入公共响应前，标签只用于原样展示；前缀解析只负责把门派标签排在最前，不参与业务资格判断。
- `is_required` 只作为维度元数据保留，本阶段不据此排除成就。
- `0` 是合法星级和合法完成率；只有 `null`、`undefined` 和非有限数显示 `—`。
- 完成率统一命名为“同步完成率”：分母是已把角色成就同步到本系统的角色样本，不得写成“全服完成率”。界面不展示具体分子和分母。
- 没有地图时不渲染地图块；没有奖励引用时不渲染奖励块；常规成就不显示档位 tag，五甲保留；门派 tag 排在其他 tag 之前。
- 不修改受 Git 跟踪的 `.env.development`；本阶段不需要环境变量变更。
- 当前工作树已有本轮未提交改动。每个任务开始和结束都执行 `git status --short`、`git diff -- <本任务文件>`，只暂存明确列出的文件，不覆盖或回滚无关改动。

## 第一阶段完成定义

完成后必须同时满足：

1. 三个页面的维度名称、顺序和显示项由公共维度接口驱动；接口失败时才使用内置五维定义。
2. 星级支持 `0`、小数、`5` 和空值，小数不再通过 `Math.round` 丢失精度；五颗星后显示一位小数，不显示可见的 `x/5`，`aria-label` 可保留该比例。
3. `/achievements` 默认只读取当前可见页的难度和标签；只有用户主动选择维度排序时才批量补齐当前候选集。
4. `/achievements/compare` 的页面列和 Excel 导出使用同一份动态维度定义。
5. `/achievements/leap` 的展示字段与前两页一致，`SceneID` 能正确回填地图名；未由公共接口提供的“成本档”筛选不再出现。
6. `std` 与 `origin` 请求严格隔离；切服后的旧响应不能回写当前页面。
7. 推荐结果、推荐权重、推荐候选资格和方案生成结果没有发生变化。

---

### Task 1: 建立动态维度与精确星级公共层

**Files:**

- Create: `src/components/wiki/AchievementDifficultyStars.vue`
- Modify: `src/utils/achievementWorkbench.js`
- Modify: `src/service/achievementWorkbench.js`
- Modify: `src/locale/zh-CN/pages.js`
- Modify: `src/locale/zh-TW/pages.js`
- Modify: `src/locale/en-US/pages.js`
- Modify: `src/locale/vi/pages.js`
- Test: `scripts/test-achievement-workbench.js`
- Test: `scripts/test-achievement-service.js`
- Test: `scripts/test-achievement-web-contract.js`

- [ ] **Step 1: 先补动态维度纯函数的失败测试**

在 `scripts/test-achievement-workbench.js` 增加以下断言：

- 接口返回乱序定义时按 `sortOrder` 排序；
- 空数组或请求失败后的调用方可解析出内置 `money/time/luck/costEffectiveness/overall` 五维；
- 接口新增未知 key，例如 `operation`，不会被丢弃；
- 从记录读取维度时优先使用 `difficultyDimensions[key]`；旧记录可从 `cost.money`、`cost.time`、`cost.luck`、`costEffectiveness`、`difficulty` 兼容取值；
- `0` 保留为 `0`；缺失和非法值返回 `null`；
- 星级填充百分比满足 `0 -> 0`、`2.5 -> 50`、`5 -> 100`、空值返回 `null`。

公共实现骨架：

```js
export const ACHIEVEMENT_WORKBENCH_FALLBACK_DIMENSIONS = Object.freeze([
    { key: "money", sortOrder: 10, required: true, i18nKey: "pages.wiki.difficultyDimensions.money" },
    { key: "time", sortOrder: 20, required: true, i18nKey: "pages.wiki.difficultyDimensions.time" },
    { key: "luck", sortOrder: 30, required: true, i18nKey: "pages.wiki.difficultyDimensions.luck" },
    {
        key: "costEffectiveness",
        sortOrder: 40,
        required: true,
        i18nKey: "pages.wiki.difficultyDimensions.costEffectiveness",
    },
    { key: "overall", sortOrder: 50, required: true, i18nKey: "pages.wiki.difficultyDimensions.overall" },
]);

export function resolveAchievementWorkbenchDimensions(dimensions = []) {
    const normalized = normalizeAchievementWorkbenchDifficultyDimensions(dimensions);
    const source = normalized.length ? normalized : ACHIEVEMENT_WORKBENCH_FALLBACK_DIMENSIONS;
    const fallbackByKey = Object.fromEntries(
        ACHIEVEMENT_WORKBENCH_FALLBACK_DIMENSIONS.map((dimension) => [dimension.key, dimension])
    );
    return source.map((dimension) => ({
        ...dimension,
        i18nKey: fallbackByKey[dimension.key]?.i18nKey || null,
    }));
}

export function getAchievementWorkbenchDimensionValue(record = {}, dimensionKey = "") {
    const fallback = {
        money: record?.cost?.money,
        time: record?.cost?.time,
        luck: record?.cost?.luck,
        costEffectiveness: record?.costEffectiveness,
        overall: record?.difficulty,
    };
    const value = record?.difficultyDimensions?.[dimensionKey] ?? fallback[dimensionKey];
    if (value === null || value === undefined || value === "") return null;
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : null;
}

export function getAchievementWorkbenchRatingFill(value, max = 5) {
    if (value === null || value === undefined || value === "") return null;
    const normalized = Number(value);
    const normalizedMax = Number(max);
    if (!Number.isFinite(normalized) || !Number.isFinite(normalizedMax) || normalizedMax <= 0) return null;
    return Math.max(0, Math.min(100, (normalized / normalizedMax) * 100));
}

export function getAchievementWorkbenchDimensionSort(sort = "") {
    const match = String(sort).match(/^dimension:([A-Za-z][A-Za-z0-9]*):asc$/);
    return match ? { key: match[1], direction: "asc" } : null;
}
```

- [ ] **Step 2: 运行纯函数测试，确认新断言失败**

Run: `npm run test:achievement-workbench`

Expected: FAIL，缺少上述导出或行为尚未实现。

- [ ] **Step 3: 实现动态维度基础规则**

在 `src/utils/achievementWorkbench.js` 中：

- 定义五维兼容配置，只保存稳定 key、默认顺序和统一 i18n key；
- `resolveAchievementWorkbenchDimensions()` 有有效接口定义时完全按接口定义工作，接口为空时才返回 fallback；
- 未知维度保留接口 `label` 和 `description`；已知维度使用统一 i18n key，避免三个页面各自维护一套名称；
- `getAchievementWorkbenchDimensionValue()` 对动态字段使用 camelCase key，并提供五个旧字段兼容入口；
- 动态排序值统一为 `dimension:<key>:asc`。该 endpoint 返回的项目均按 0～5 难度/成本等级解释，值越低越优先；接口将来新增的维度按同一规则展示和排序；
- 空值判断使用显式 null 检查，不能用 truthy 判断吞掉 `0`。

- [ ] **Step 4: 先补维度请求缓存的失败测试**

在 `scripts/test-achievement-service.js` 增加并发与缓存测试：

- 同一缓存窗口内连续调用两次只发一个 GET；
- 两个并发调用复用同一个 in-flight Promise；
- `{ force: true }` 会重新请求；
- 请求失败会清除 in-flight 状态，下一次可重试；
- 缓存只作用于全局维度定义，不缓存带 `client` 的难度或标签数据。

缓存实现骨架：

```js
const ACHIEVEMENT_WORKBENCH_DIMENSION_CACHE_TTL = 60_000;
let difficultyDimensionsCache = null;
let difficultyDimensionsCachedAt = 0;
let difficultyDimensionsPromise = null;

export async function fetchAchievementWorkbenchDifficultyDimensions(options = {}) {
    const force = options.force === true;
    const cacheFresh =
        difficultyDimensionsCache &&
        Date.now() - difficultyDimensionsCachedAt < ACHIEVEMENT_WORKBENCH_DIMENSION_CACHE_TTL;
    if (!force && cacheFresh) return difficultyDimensionsCache;
    if (!force && difficultyDimensionsPromise) return difficultyDimensionsPromise;

    const request = getWikiAchievementDifficultyDimensions().then((response) =>
        normalizeAchievementWorkbenchDifficultyDimensions(
            getSuccessfulCmsData(response, "成就难度维度") || []
        )
    );
    difficultyDimensionsPromise = request;
    try {
        const dimensions = await request;
        difficultyDimensionsCache = dimensions;
        difficultyDimensionsCachedAt = Date.now();
        return dimensions;
    } finally {
        if (difficultyDimensionsPromise === request) difficultyDimensionsPromise = null;
    }
}
```

其中 `options.force` 默认为 `false`，缓存窗口使用文件内常量，例如 60 秒。

- [ ] **Step 5: 运行 service 测试，确认缓存断言失败**

Run: `npm run test:achievement-service`

Expected: FAIL，当前每次调用都会发 GET，且无 single-flight。

- [ ] **Step 6: 实现维度缓存与新接口批次常量**

在 `src/service/achievementWorkbench.js` 中：

- 为维度定义增加模块级 cache、cachedAt 和 in-flight Promise；
- 成功后缓存标准化结果，失败时清空 in-flight 并继续向调用方抛错；
- 将新版难度和标签 POST 的默认批次统一到命名常量 `5000`，降低全量导出或主动排序时的串行请求数；
- `fetchAchievementWorkbenchDifficulty()` 的旧 `500` 批次及其推荐调用保持不变。

- [ ] **Step 7: 创建公共星级组件**

`AchievementDifficultyStars.vue` 使用 Options API：

```vue
<script>
import { getAchievementWorkbenchRatingFill } from "@/utils/achievementWorkbench";

export default {
    name: "AchievementDifficultyStars",
    props: {
        value: { type: [Number, String], default: null },
        max: { type: Number, default: 5 },
        label: { type: String, default: "" },
    },
    computed: {
        fillPercent() {
            return getAchievementWorkbenchRatingFill(this.value, this.max);
        },
        hasValue() {
            return this.fillPercent !== null;
        },
        normalizedValue() {
            if (!this.hasValue) return null;
            return Number(((this.fillPercent / 100) * this.max).toFixed(2));
        },
        displayValue() {
            return this.hasValue ? this.normalizedValue.toFixed(1) : "";
        },
        accessibleLabel() {
            if (!this.hasValue) return `${this.label || "星级"}：—`;
            return `${this.label || "星级"}：${this.normalizedValue}/${this.max}`;
        },
    },
};
</script>

<template>
    <span v-if="hasValue" class="c-achievement-rating" role="img" :aria-label="accessibleLabel">
        <span class="c-achievement-stars" aria-hidden="true">
            <span class="c-achievement-stars__empty">☆☆☆☆☆</span>
            <span class="c-achievement-stars__filled" :style="{ width: `${fillPercent}%` }">★★★★★</span>
        </span>
        <span class="c-achievement-stars__value" aria-hidden="true">{{ displayValue }}</span>
    </span>
    <span v-else class="c-achievement-stars__empty-value">—</span>
</template>
```

展示层叠的空心/实心五颗星，实心层宽度使用 `fillPercent`，从而精确显示 0.1、0.5 等小数；星级后显示一位小数（如 `2.5`），不要显示可见的 `2.5/5`。空值只渲染 `—`。组件提供可访问名称，如“时间成本：2.5/5”。

- [ ] **Step 8: 增加统一维度文案并补组件契约测试**

四个语言文件新增同构的公共维度 key、动态排序文案和维度加载失败文案。`scripts/test-achievement-web-contract.js` 检查：

- 公共星级组件存在并使用百分比填充；
- 公共星级组件和三个页面展示组件中没有 `Math.round` 星级取整；
- 组件为 null 和小数路径保留独立逻辑。

- [ ] **Step 9: 运行 Task 1 测试**

Run:

```bash
npm run test:achievement-workbench
npm run test:achievement-service
npm run test:achievement-web-contract
```

Expected: PASS。

- [ ] **Step 10: 检查点**

Run:

```bash
git diff --check
git diff -- src/utils/achievementWorkbench.js src/service/achievementWorkbench.js src/components/wiki/AchievementDifficultyStars.vue src/locale scripts/test-achievement-workbench.js scripts/test-achievement-service.js scripts/test-achievement-web-contract.js
```

若用户要求分任务提交，只暂存以上文件并使用提交信息：`feat(achievement): centralize difficulty dimensions and stars`。

---

### Task 2: 收口完成进度页的动态展示、排序和请求性能

**Files:**

- Modify: `src/components/wiki/progress/AchievementProgressPage.vue`
- Modify: `src/components/wiki/progress/AchievementProgressFilters.vue`
- Modify: `src/components/wiki/progress/AchievementProgressList.vue`
- Modify: `src/utils/achievementProgress.js`
- Modify: `src/locale/zh-CN/pages.js`
- Modify: `src/locale/zh-TW/pages.js`
- Modify: `src/locale/en-US/pages.js`
- Modify: `src/locale/vi/pages.js`
- Test: `scripts/test-achievement-progress.js`
- Test: `scripts/test-achievement-web-contract.js`

- [ ] **Step 1: 补动态排序和空值顺序的失败测试**

在 `scripts/test-achievement-progress.js` 覆盖：

- `dimension:money:asc`、`dimension:overall:asc` 和 `dimension:operation:asc`；
- `0` 排在正数前；
- 缺失值永远放在有值项之后；
- 同值时按原目录顺序稳定排序，不用对象枚举顺序制造抖动；
- 只加载了部分候选指标时，不静默把未加载项当成 0。

- [ ] **Step 2: 补页面请求策略的契约失败测试**

在 `scripts/test-achievement-web-contract.js` 将旧断言替换为：

- `initializePage()` 不再对常规与五甲全量 ID 立即调用 `loadDifficultyMetrics()`；
- `AchievementProgressPage` 在初始化时读取动态维度定义；
- 列表和筛选组件接收同一份 `dimensions`；
- 用户选择维度排序时才调用 `ensureDimensionMetrics(metricCandidateIds)`；
- 选项加载失败保持原排序并显示错误反馈；
- 列表通过 `v-for` 渲染维度，不再硬编码五个 span。

- [ ] **Step 3: 运行测试，确认失败**

Run:

```bash
npm run test:achievement-progress
npm run test:achievement-web-contract
```

Expected: FAIL，当前仍在初始化阶段全量预载，且只支持固定 difficulty/time 排序。

- [ ] **Step 4: 页面容器持有维度定义**

在 `AchievementProgressPage.vue`：

- `data()` 增加 `difficultyDimensions`、`dimensionSortLoading`、`dimensionSortRequestId`；
- `initializePage()` 的首批并行请求中加入 `fetchAchievementWorkbenchDifficultyDimensions()`；失败时通过 `resolveAchievementWorkbenchDimensions([])` fallback，不使整个页面失败；
- 切换 `std/origin` 时重置带 client 的指标和标签缓存，但全局维度定义由 service cache 复用；
- 向 `AchievementProgressFilters` 和 `AchievementProgressList` 下发同一份已解析定义。

- [ ] **Step 5: 移除初始化全量预载，改为显式按需排序**

删除 `initializePage()` 中对所有常规和五甲 ID 的后台 `loadDifficultyMetrics()`。保留 `loadVisibleEnrichment()` 的当前页读取。

新增排序入口：

```js
async changeRecordSort(sort) {
    if (!getAchievementWorkbenchDimensionSort(sort)) {
        return this.setListFilter("sort", sort);
    }
    const loaded = await this.ensureDimensionMetrics(this.metricCandidateIds);
    if (loaded) this.setListFilter("sort", sort);
}
```

`ensureDimensionMetrics()` 必须：

- 使用当前 client、epoch 和独立 requestId 防止切服/切角色后的旧响应回写；
- 只请求 cache 中尚未出现的 ID；
- 调用 POST 批量接口并使用 Task 1 的新版默认批次；
- 成功响应中未配置的 ID 以 `null` 写入 cache，避免重复请求；
- 失败返回 `false`，保留原排序并给出一次错误提示；
- 不触发或复用任何推荐函数。

- [ ] **Step 6: 筛选与列表改用动态维度**

在 `AchievementProgressFilters.vue`：

- 移除 `difficultySortEnabled`、`timeCostSortEnabled` 两个硬编码 prop；
- 根据 definitions 生成可排序的当前维度选项；
- 排序补数期间禁用排序 select，避免重复并发请求。

在 `AchievementProgressList.vue`：

- 注册并使用 `AchievementDifficultyStars`；
- 用 `v-for="dimension in dimensions"` 渲染 label 与星级；
- 通过 `getAchievementWorkbenchDimensionValue(record, dimension.key)` 取值；
- 保留已确认规则：无地图不渲染、无奖励引用不渲染、常规 tag 不显示、五甲 tag 保留、门派业务 tag 排最前、同步完成率不显示分子分母。

- [ ] **Step 7: 实现纯函数动态排序**

在 `src/utils/achievementProgress.js`：

- 用统一解析器识别 `dimension:<key>:asc`；
- ID 列表排序从 `difficultyById[id]` 读取动态维度；
- 搜索结果记录排序从标准 record 读取相同维度；
- 两条路径使用同一 comparator，缺失值置后并保持稳定次序；
- 保留 `default`、`priority` 和 points 排序行为。

- [ ] **Step 8: 运行 Task 2 测试**

Run:

```bash
npm run test:achievement-progress
npm run test:achievement-workbench
npm run test:achievement-web-contract
```

Expected: PASS。

- [ ] **Step 9: 检查点**

Run:

```bash
git diff --check
git diff -- src/components/wiki/progress src/utils/achievementProgress.js src/locale scripts/test-achievement-progress.js scripts/test-achievement-web-contract.js
```

若用户要求分任务提交，提交信息：`feat(achievement): load progress dimensions on demand`。

---

### Task 3: 让亲友对比展示与导出共用动态维度

**Files:**

- Modify: `src/components/wiki/compare/AchievementComparePage.vue`
- Modify: `src/components/wiki/compare/AchievementCompareMatrix.vue`
- Modify: `src/utils/achievementCompare.js`
- Modify: `scripts/test-achievement-compare.js`
- Modify: `scripts/test-achievement-web-contract.js`

- [ ] **Step 1: 补导出映射纯函数测试**

在 `src/utils/achievementCompare.js` 增加纯函数 `buildAchievementCompareExportData({ records, roles, dimensions, translate })`，让 `AchievementComparePage.vue` 只负责提供数据并写入工作簿。测试以下行为：

- definitions 为 `[money, operation, overall]` 时，表头和每行严格按该顺序生成三列；
- 未知维度 `operation` 能导出；
- 值为 `0` 时导出 `0`，空值导出 `—`；
- 同步完成率导出百分比，不导出角色计数；
- 角色完成状态列仍位于动态维度之后。

- [ ] **Step 2: 补矩阵契约失败测试并运行**

在 `scripts/test-achievement-web-contract.js` 检查：

- `AchievementComparePage` 获取并下发 `dimensions`；
- `AchievementCompareMatrix` 使用公共星级组件和动态循环；
- 固定的 `money/time/luck/costEffectiveness/overall` 五段模板不再存在；
- 成就图片仍保持顶部对齐；地图为空不渲染；分类占位文本不再渲染；
- 同步完成率没有计数明细。

Run:

```bash
npm run test:achievement-compare
npm run test:achievement-web-contract
```

Expected: FAIL，当前矩阵和导出均硬编码五维。

- [ ] **Step 3: 页面加载并下发动态定义**

在 `AchievementComparePage.vue`：

- 初始化时读取缓存后的维度定义；失败时使用 fallback；
- 页面切 client 时继续清空 difficulty/tag enrichment，不能把 `std` 数据用于 `origin`；
- 把 definitions 传给矩阵和导出构造函数。

- [ ] **Step 4: 矩阵改用公共星级组件**

在 `AchievementCompareMatrix.vue`：

- 注册 `AchievementDifficultyStars`；
- 使用动态 definitions 循环渲染难度摘要；
- label 使用统一 i18n，未知 key 回退接口 label；
- 删除本地 `formatDifficultyRating()`；
- 保持图片 `align-items: start` 和现有响应式矩阵滚动。

- [ ] **Step 5: 导出改为同源列定义**

`buildExcelData()` 不再写死五个字段。表头和行数据都从当前 resolved definitions 构造，保证页面顺序与导出顺序一致。导出时若维度接口暂时失败，则与页面共同使用 fallback，而不是各自作不同决定。

- [ ] **Step 6: 运行 Task 3 测试**

Run:

```bash
npm run test:achievement-compare
npm run test:achievement-service
npm run test:achievement-web-contract
```

Expected: PASS。

- [ ] **Step 7: 检查点**

Run:

```bash
git diff --check
git diff -- src/components/wiki/compare src/utils/achievementCompare.js scripts/test-achievement-compare.js scripts/test-achievement-web-contract.js
```

若用户要求分任务提交，提交信息：`feat(achievement): align compare dimensions and export`。

---

### Task 4: 收口渡劫页展示，但冻结推荐实现

**Files:**

- Modify: `src/components/wiki/leap/AchievementLeapPage.vue`
- Modify: `src/components/wiki/leap/AchievementLeapRouteTable.vue`
- Modify: `src/components/wiki/leap/AchievementLeapAddDialog.vue`
- Modify: `src/locale/zh-CN/pages.js`
- Modify: `src/locale/zh-TW/pages.js`
- Modify: `src/locale/en-US/pages.js`
- Modify: `src/locale/vi/pages.js`
- Test: `scripts/test-achievement-leap.js`
- Test: `scripts/test-achievement-web-contract.js`

- [ ] **Step 1: 为展示层补失败测试**

在 `scripts/test-achievement-web-contract.js` 增加：

- `AchievementLeapPage` 读取 dimensions 并传给路线表和添加弹窗；
- 路线表按 definitions 循环渲染列；
- 路线表和添加弹窗使用公共星级组件；
- 不存在 `costTier` 下拉、watch 和过滤分支；
- 性价比排序使用当前难度等级的升序语义；
- 只有 `SceneID`、没有 `map.name` 的记录会由页面已加载的 maps 回填名称；没有地图的记录仍不显示地图；
- tags、门派限制、路线备注等可选整列在全体无值时隐藏；
- 地图仍按单条记录是否有值决定显示；
- `loadRecommendation()` 仍调用原 `fetchAchievementWorkbenchDifficulty()`，不调用新版 metrics 生成推荐。

在 `scripts/test-achievement-leap.js` 保留全部 `stage-v1` 结果断言，作为“推荐没有变化”的回归护栏。

- [ ] **Step 2: 运行测试，确认展示断言失败且旧推荐基线通过**

Run:

```bash
npm run test:achievement-leap
npm run test:achievement-web-contract
```

Expected: `test:achievement-leap` 先保持 PASS；新 web contract 断言 FAIL。

- [ ] **Step 3: 页面容器接入 definitions**

在 `AchievementLeapPage.vue`：

- 初始化并行读取维度定义，失败时 fallback；
- definitions 只下发给展示组件；
- `enrichAchievementItems()` 继续在路线已经确定后读取新版 metrics/tags；
- `enrichAchievementItems()` 使用页面已有的 maps 建立 `SceneID -> map.name` 索引，行为与完成进度、亲友对比一致；不能因为详情接口只返回 `SceneID` 就把有地图的成就误判为无地图；
- `loadRecommendation()` 函数体、候选构建、权重、门派兼容规则和方案生成流程不改。

- [ ] **Step 4: 路线表改为动态列和公共星级**

在 `AchievementLeapRouteTable.vue`：

- 动态渲染接口定义的维度列，并统一用 `AchievementDifficultyStars`；
- 当前维度排序都按 0～5 成本/难度等级升序，空值置后；将“性价比从高到低”的旧文案和 `-desc` 值移除；
- 删除 `costTier` 状态、watch、筛选条件和下拉，因为公共接口没有成本档字段，且前端推导公式属于已冻结推荐逻辑；
- 只有全表至少一条有值时才展示同步完成率、标签、门派限制、路线备注等可选列；
- 门派 tag 继续排最前；没有 tag 的单元格不制造业务含义，只显示 `—`；
- 更新“五维算账”和固定五维提示文案为“难度维度”，避免后台新增/停用维度后文案失真。

- [ ] **Step 5: 添加成就弹窗复用星级规则**

在 `AchievementLeapAddDialog.vue` 删除本地取整格式化函数，使用公共星级组件。仅当 `overall` 维度在 resolved definitions 中时展示综合难度；空值显示 `—`，不显示重复的 `x/5` 数字。

- [ ] **Step 6: 运行 Task 4 回归**

Run:

```bash
npm run test:achievement-leap
npm run test:achievement-workbench
npm run test:achievement-web-contract
```

Expected: 全部 PASS，且 `stage-v1` 的版本、分类、权重和结果断言没有变化。

- [ ] **Step 7: 审核推荐冻结边界**

Run:

```bash
git diff -- src/utils/achievementLeap.js src/utils/achievementSchoolEligibility.js src/components/wiki/leap/AchievementLeapRecommendation.vue
git diff -U20 -- src/components/wiki/leap/AchievementLeapPage.vue
```

Expected: 前三个文件无差异；`AchievementLeapPage.vue` 的差异只涉及维度定义加载、状态和 props，`loadRecommendation()` 函数体无差异。

- [ ] **Step 8: 检查点**

Run: `git diff --check`

若用户要求分任务提交，提交信息：`feat(achievement): align leap difficulty presentation`。

---

### Task 5: 更新业务文档并冻结后端推荐边界

**Files:**

- Modify: `docs/agents/achievement-workbench-data-contract.md`
- Modify: `docs/design/achievement-layout.md`
- Modify: `docs/project/achievement.md`

- [ ] **Step 1: 修正文档中的数据口径**

`docs/agents/achievement-workbench-data-contract.md` 必须写明：

- `completionStatistics` 是“已同步角色样本完成统计”，不是全服统计；
- UI 名称为“同步完成率”，计数仅保留在标准模型中用于算率，不直接展示；
- dimensions 是展示列和顺序的唯一公共配置来源，内置五维只用于接口失败 fallback；
- public tag 当前只承担展示，不承担资格或推荐规则；
- `cost.tier` 没有公共数据来源，因此第一阶段 UI 不展示对应筛选。

- [ ] **Step 2: 修正设计规范与已确认反馈**

`docs/design/achievement-layout.md` 更新：

- 星级允许小数填充，五颗星后显示一位小数，不显示可见的 `x/5`，`aria-label` 可保留该比例；
- 无地图、无奖励引用时整块隐藏；
- 常规档位 tag 隐藏、五甲保留、门派 tag 前置；
- 三页动态维度同源；
- 删除“无奖励记录显示 —”这一旧口径；
- 渡劫展示可以读取新接口，但推荐生成不属于第一阶段。

- [ ] **Step 3: 更新项目阶段状态**

`docs/project/achievement.md` 将本次定义为“公共数据接入收尾”，列出三个页面的完成标准。关于推荐只保留边界说明：系统推荐和玩家自选均保持现有本地 mock/逻辑，本阶段不新增或接入后端生成接口，也不设计 endpoint、request 或 response。

- [ ] **Step 4: 文档一致性检查**

Run:

```bash
rg -n "全服完成率|全服完成统计|无奖励的记录显示|costTier|性价比从高到低" docs src/components/wiki
git diff --check
```

Expected: 不再出现与当前口径冲突的文案；代码中的历史内部字段只有明确兼容用途时才保留。

- [ ] **Step 5: 检查点**

Run: `git diff -- docs/agents/achievement-workbench-data-contract.md docs/design/achievement-layout.md docs/project/achievement.md`

若用户要求分任务提交，提交信息：`docs(achievement): define phase one data boundary`。

---

### Task 6: 全量自动验证与一次浏览器验收

**Files:**

- Verify only; only修复本阶段引入的问题。

- [ ] **Step 1: 运行全部资历宝典测试**

Run:

```bash
npm run test:achievement-statistics
npm run test:achievement-workbench
npm run test:achievement-progress
npm run test:achievement-compare
npm run test:achievement-leap
npm run test:achievement-service
npm run test:achievement-web-contract
```

Expected: 全部 PASS。

- [ ] **Step 2: 运行静态检查与生产构建**

Run:

```bash
npm run lint
git diff --check
npm run build
```

Expected: lint、diff check、production build 全部成功；构建不新增受 Git 跟踪的环境配置。

- [ ] **Step 3: 复用现有测试浏览器做一次集中验收**

只在自动检查通过后打开或复用已有浏览器，依次检查：

- `http://localhost:12028/pvx/achievements`
- `http://localhost:12028/pvx/achievements/compare`
- `http://localhost:12028/pvx/achievements/leap`

验收数据场景：

- `std` 与 `origin` 各切换一次，Network 中 client 参数正确且旧请求不回写；
- 维度 GET 在缓存窗口内不因三个页面反复请求；
- 初次进入完成进度页只加载可见页 metrics/tags；主动选择维度排序后才批量补齐候选指标，且不是默认 500 条串行 20 多次；
- 星级覆盖 0、小数、满星和空值；小数视觉不四舍五入；
- 渡劫成就只有 `SceneID` 时可正确显示地图名；真正没有地图和奖励的项目不出现对应块；
- 常规 tag 不出现、五甲保留、门派业务 tag 最前；
- 同步完成率只显示百分比；
- 对比页面与 Excel 导出维度顺序一致；
- 渡劫路线没有成本档筛选，动态维度列和排序正常；
- 桌面宽度与一个窄屏宽度下没有页面级横向溢出，表格只在自身容器内滚动。

- [ ] **Step 4: 验证推荐无回归**

以 `npm run test:achievement-leap` 的现有 `stage-v1` 固定断言和推荐文件零差异作为护栏；浏览器只确认推荐入口仍可正常加载，不在本阶段评价或调整推荐质量。若固定断言或推荐源码发生变化，立即停止收尾，不以“接口替换”为由接受推荐变化。

- [ ] **Step 5: 最终差异审核**

Run:

```bash
git status --short
git diff --stat
git diff --check
git diff -- src/utils/achievementLeap.js src/utils/achievementSchoolEligibility.js src/components/wiki/leap/AchievementLeapRecommendation.vue
rg -n "/manage/" src/components/wiki src/service
```

Expected:

- 只有 PVX 本阶段文件变化；
- 推荐规则文件无差异；
- PVX 新实现没有 `/manage/` 调用；
- 无冲突标记、调试日志、临时 mock 或环境文件变更。

若用户要求最终提交，只按审核后的明确文件列表暂存，提交信息：`feat(achievement): close public difficulty integration phase`。

## 本阶段明确不做

- 后端推荐接口的 URL、请求参数、返回结构和缓存策略；
- 推荐权重、推荐阶段、候选池、门派/体型/阵营/节日/活动资格判断；
- OS 管理页能力、导入能力或数据治理统计；
- 玩家自定义难度评价；
- 服务端标签筛选、动态分页或搜索接口扩展；
- 将 CMS `remark` 暴露到 PVX；
- 依据标签前缀自动改变推荐结果；
- 修改现有渡劫方案 CRUD 数据结构。

这些内容不阻塞第一阶段收尾；系统推荐和玩家自选在本阶段继续保持现有本地 mock/逻辑。
