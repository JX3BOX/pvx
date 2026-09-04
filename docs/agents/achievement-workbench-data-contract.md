# 资历宝典统一字段协议

> 最后更新：2026-09-05。当前前端规则版本：推荐 `stage-v1`（冻结），门派可完成性 `school-v1`。

## 1. 目的

资历宝典的基础成就信息继续使用 Node 接口，难度、完成统计和标签使用 CMS 公共接口增强。所有新版页面必须消费本协议的标准模型，不直接依赖接口字段的大小写或历史命名。后端替换字段时优先修改
`src/utils/achievementWorkbench.js` 和 `src/service/achievementWorkbench.js`，不在三个页面重复兼容逻辑。

## 2. 空值规则

-   数据层缺失值统一为 `null`；
-   展示层通过 `formatAchievementWorkbenchValue` 显示为 `—`；
-   `0`、`false` 和空数组都是有效值，不得转换成 `—`；
-   未获得角色完成上下文时，`completed` 为 `null`，不能默认成 `false`；
-   依赖缺失字段的排序、筛选、评分和自动建议必须禁用或降级，不能用虚构值参与计算。

## 3. 标准成就模型

| 字段                 | 类型                                | 当前来源/兼容别名                                   | 状态   |
| -------------------- | ----------------------------------- | --------------------------------------------------- | ------ |
| `id`                 | `string \| null`                    | `id / ID / AchievementID`                           | 当前   |
| `name`               | `string \| null`                    | `name / Name / AchievementName`                     | 当前   |
| `iconId`             | `string \| null`                    | `iconId / IconID`                                   | 当前   |
| `shortDescription`   | `string \| null`                    | `shortDescription / ShortDesc / Description`        | 当前   |
| `category.id`        | `string \| null`                    | `categoryId / CategoryID / Sub`                     | 当前   |
| `category.name`      | `string \| null`                    | `categoryName / CategoryName`                       | 部分   |
| `category.subId`     | `string \| null`                    | `subCategoryId / Detail`                            | 当前   |
| `category.subName`   | `string \| null`                    | `subCategory / subCategoryName`                     | 部分   |
| `map.id`             | `string \| null`                    | `mapId / MapID / SceneID`                           | 当前   |
| `map.name`           | `string \| null`                    | `mapName / MapName / map`                           | 部分   |
| `points`             | `number \| null`                    | `points / Point`，可由点数元数据补足                | 当前   |
| `general`            | `number \| null`                    | `general / General`，可由点数元数据补足             | 当前   |
| `visible`            | `boolean \| null`                   | `visible / Visible / IsVisible`，可由点数元数据补足 | 当前   |
| `tier`               | `normal / wujia / hidden / retired` | 显式 `tier` 或由 `general + visible` 推导           | 推导   |
| `retired`            | `boolean`                           | `tier === retired`                                  | 推导   |
| `completed`          | `boolean \| null`                   | 显式字段或角色已完成 ID 集合                        | 推导   |
| `completionByRole`   | `Record<string, boolean>`           | `completionByRole / doneBy`                         | 部分   |
| `reward.itemType`    | `string \| null`                    | `rewardItemType / ItemType`                         | 当前   |
| `reward.itemId`      | `string \| null`                    | `rewardItemId / ItemID`                             | 当前   |
| `difficulty`         | `number \| null`                    | CMS `dimensions.overall / 10`；无 CMS 难度记录时才使用旧值 | 当前   |
| `difficultyDimensions` | `Record<string, number \| null>`  | CMS `dimensions` 动态维度，键名转 camelCase         | 当前   |
| `estimatedMinutes`   | `number \| null`                    | `estimatedMinutes / estMinutes`                     | 待接口 |
| `cost.money`         | `number \| null`                    | CMS `dimensions.money / 10`                         | 当前   |
| `cost.time`          | `number \| null`                    | CMS `dimensions.time / 10`                          | 当前   |
| `cost.luck`          | `number \| null`                    | CMS `dimensions.luck / 10`                          | 当前   |
| `cost.tier`          | `string \| null`                    | 仅兼容旧 `costTier`，公共接口暂无来源                | 待接口 |
| `costEffectiveness`  | `number \| null`                    | CMS `dimensions.cost_effectiveness / 10`            | 当前   |
| `completionStatistics` | `{ completedRoleCount, totalRoleCount, rate }` | CMS 已同步角色样本完成统计                | 当前   |
| `tags`               | `AchievementTag[]`                   | CMS 成就标签                                        | 当前   |
| `tagGroups`          | `{ schools, festivals, activities, camps, unknown }` | 由标签前缀分组                         | 推导   |
| `restriction.school` | `string \| null`                    | `schoolLimit / school / cls`                        | 待接口 |
| `guideNote`          | `string \| null`                    | `guideNote / routeNote / note`                      | 待接口 |
| `updatedAt`          | `string \| null`                    | `updatedAt / UpdatedAt`                             | 待接口 |

难度维度接口的原始值为 `0~50`，标准模型统一除以 `10` 转为 `0~5` 级；`0` 是有效值。公共维度定义接口是三个页面展示项、名称和顺序的唯一配置来源，接口失败或返回空定义时才使用内置的 `money / time / luck / costEffectiveness / overall` 五维兼容配置。接口记录中显式存在但值为 `null` 的维度代表未配置，不得再由旧字段覆盖。`dimensions.time` 是时间成本等级，不是分钟，禁止写入 `estimatedMinutes`。CMS 难度记录中的 `remark` 是后台管理备注，不进入玩家端标准模型。

难度值在 UI 中统一渲染为支持小数填充的五颗星，并在星级后显示一位小数（如 `2.5`），不显示可见的 `x/5`；`aria-label` 可使用“时间成本：2.5/5”保留完整语义。`0` 渲染为空星和 `0.0`，`null` 或非法值只渲染“—”。

`completionStatistics.rate` 在 UI 中统一命名为“同步完成率”。它的分母是已将角色成就同步到本系统的角色样本，并非剑网 3 全服角色；`completedRoleCount` 与 `totalRoleCount` 只保留在标准模型中用于计算和排查，不直接展示给玩家。

`cost.tier` 当前没有公共数据来源，第一阶段不展示对应筛选，也不根据其他成本维度在前端推导成本档位。

标签接口当前仅提供 `tag_label`，没有独立的类型字段。适配器识别 `门派：`、`节日：`、`活动：`、`阵营：`（同时兼容半角冒号），并保留完整原始标签；未知前缀进入 `tagGroups.unknown`。第一阶段标签只用于原样展示和调整展示顺序（门派标签优先），不承担资格判断，也不直接改变 `stage-v1` 推荐和 `school-v1` 门派过滤。

## 4. 标准角色模型

| 字段         | 类型             | 当前来源/兼容别名             |
| ------------ | ---------------- | ----------------------------- |
| `id / jx3id` | `string \| null` | `jx3id / id / ID`             |
| `name`       | `string \| null` | `name / Name`                 |
| `server`     | `string \| null` | `server / Server`             |
| `school`     | `string \| null` | `school / mount / School`     |
| `bodyType`   | `string \| null` | `bodyType / body_type / body` |
| `level`      | `number \| null` | `level / Level`               |
| `isSelf`     | `boolean`        | `isSelf / self` 或调用上下文  |
| `updatedAt`  | `string \| null` | `updatedAt / UpdatedAt`       |

## 5. 现有接口适配

`src/service/achievementWorkbench.js` 当前提供：

-   `fetchAchievementWorkbenchCatalog(client)`：菜单与点数元数据；
-   `fetchAchievementWorkbenchRoles()`：本人角色；
-   `fetchAchievementWorkbenchRoleState(jx3id)`：完成 ID、同步状态与更新时间；
-   `fetchAchievementWorkbenchRecords(options)`：批量成就详情并转换为标准模型，显式透传 `client`，避免基础成就与 CMS 增强数据跨客户端混用。
-   `fetchAchievementWorkbenchRecordsBatched(options)`：按安全批次读取较长方案或路线的成就详情；
-   `searchAchievementWorkbenchRecords(options)`：按关键词或地图调用现有搜索接口、展开系列成就并转换为标准模型，并显式透传 `client`；
-   `fetchAchievementWorkbenchMaps(client)`：读取并标准化地图选项；沿用旧地图选择器口径，仅保留具有有效 `RegionName` 的正式区域地图，区域为空的测试/内部场景不进入任何页面的筛选项。
-   `fetchAchievementWorkbenchFriends()`：读取并标准化当前用户的亲友列表；
-   `fetchAchievementWorkbenchFriendRoles(friendId)`：读取亲友角色并转换为标准角色模型。
-   `fetchAchievementWorkbenchDifficultyDimensions()`：读取、排序并标准化动态难度维度定义；定义使用 60 秒缓存和并发 single-flight，页面通过统一 fallback 处理失败；
-   `fetchAchievementWorkbenchDifficultyMetrics(ids, options)`：按数字 ID 分批读取难度、成本与完成统计，显式传递 `client`，未配置 ID 返回 `null`；
-   `fetchAchievementWorkbenchTags(ids, options)`：按数字 ID 分批读取并解析标签，显式传递 `client`，无标签 ID 返回空标签组；
-   `src/utils/achievementWorkbench.js` 的 `applyAchievementWorkbenchEnrichment(records, context)`：按成就 ID 将难度和标签合并到基础标准记录；
-   `fetchAchievementWorkbenchDifficulty(ids, batchSize, options)`：`stage-v1` 暂时保留的旧推荐入口；继续使用旧标量字段，但显式透传 `options.client`，公共接口接入页面期间不得改用新维度，避免推荐结果静默变化；
-   `fetchAchievementWorkbenchLeapPlans(params)` / `fetchAchievementWorkbenchLeapPlan(id)`：标准化方案列表与详情；
-   `saveAchievementWorkbenchLeapPlan(payload, id)`：无 `id` 时创建，有 `id` 时更新，继续保持旧接口写入语义；
-   `deleteAchievementWorkbenchLeapPlan(id)`：删除用户方案。

完成进度、角色对比和渡劫方案三页的展示字段统一通过上述增强接口读取，并消费同一份动态维度定义。完成进度默认只读取当前可见页的难度与标签，用户主动按某一维度排序时才补齐当前候选集；角色对比的页面与导出共用同一维度顺序；渡劫页只在候选和路线已经由旧规则确定后补充难度维度、完成统计与标签。

推荐生成不属于本阶段新增范围。系统推荐和玩家自选均保持现有本地 mock/逻辑；`loadRecommendation`、候选难度上限和路线推荐排序继续使用 `fetchAchievementWorkbenchDifficulty(ids)`，现有 `stage-v1` 只作为兼容实现冻结，不继续增加前端标签资格或权重规则。本阶段不新增或接入后端生成接口，也不预设 endpoint、请求或响应结构。

### 5.1 成就团长指点（待接口）

详情页当前只模拟“确认 → 提交中 → 已提交”状态，不发送网络请求。正式接口建议以方案和角色为入口，客户端不得提交或覆盖角色完成快照：

-   玩家提交：`POST /api/achievement/leap-guidance`，请求仅包含 `planId`、`jx3id`、`client`；服务端读取并冻结提交时的原方案，同时查询该角色最新成就完成信息；
-   玩家查询：`GET /api/achievement/leap-guidance/:id`，返回申请状态、原方案快照、调整方案、审核说明和时间字段；
-   审核列表：`GET /api/achievement/leap-guidance?status=pending`，供 os 审核页分页使用；
-   审核上下文：`GET /api/achievement/leap-guidance/:id/review-context`，返回角色资料、最新完成 ID、原方案与标准成就字段；
-   审核提交：`PUT /api/achievement/leap-guidance/:id/review`，提交调整后的 `schema/meta`、审核说明与状态，禁止修改原方案快照。

建议响应模型为 `{ id, status, role, originalPlan, adjustedPlan, reviewerNote, createdAt, reviewedAt }`。`status` 第一版使用 `pending / reviewing / completed / rejected / cancelled`。完成后玩家端必须并列展示“原方案”和“调整方案”，不得使用调整结果覆盖原方案；审核时还需再次排除已完成项目和门派不可完成项目，并记录所用规则版本。

### 5.2 完成进度兼容限制

完成进度页不再承载隐藏成就列表：隐藏分类总览卡片固定跳转 Wiki 维护文章 `/bbs/8104`，主列表档位仅有常规和五甲。现有 `/api/node/achievement/list` 与 `/api/node/achievement/search` 过滤隐藏成就的兼容逻辑保留在服务层，仅供其他仍需隐藏成就详情的调用方使用；若未来恢复站内隐藏列表，需要先补齐后端的隐藏成就全量搜索能力。

### 5.3 渡劫候选统一口径

渡劫方案的标准模型与路线纯函数位于 `src/utils/achievementLeap.js`。推荐、自选、分类计数和本地“添加成就”共用同一候选条件：

-   当前角色尚未完成；
-   点数元数据 `general === 1`，不额外按 `visible` 过滤；
-   资历点数大于 `0`；
-   符合当前角色门派可完成性；
-   自选时再叠加所选一级分类、地图与难度上限。

分类按显示名称合并、按成就 ID 去重，避免同名目录重复展示；分类数量使用上述口径下的未完成数量，数量为 `0` 的分类不返回。旧方案的原始 `schema` 仍由接口保留，但页面读取、进度计算和详情展示会先过滤为 `general=1`；重新推荐、添加、保存或审核时必须再次应用当前候选规则。

### 5.4 `stage-v1` 推荐规则

阶段根据当前角色已获得资历点判定，区间上限不包含边界值：

| 阶段 | `stageKey` | 资历区间 | 最大难度 | 默认策略 | 资历收益 | 耗时效率 | 低难度 | 低金钱 | 低时间 | 低随机性 |
| ---- | ---------- | -------- | -------- | -------- | -------- | -------- | ------ | ------ | ------ | -------- |
| 入门期 | `newbie` | `[0, 30000)` | 2 | `easy-first` | 15 | 20 | 25 | 15 | 15 | 10 |
| 成长期 | `growth` | `[30000, 75000)` | 3 | `efficiency` | 20 | 25 | 15 | 10 | 20 | 10 |
| 冲刺期 | `sprint` | `[75000, 100000)` | 4 | `big-first` | 30 | 25 | 10 | 10 | 15 | 10 |
| 渡劫期 | `tribulation` | `[100000, +∞)` | 不限 | `cost-first` | 35 | 15 | 10 | 10 | 20 | 10 |

六个维度的计算语义：

-   资历收益：候选成就点数在当前候选池内归一化，点数越高得分越高；
-   耗时效率：`points / estimatedMinutes`，效率越高得分越高；
-   低难度：`difficulty` 的 `1~5` 级反向归一化；
-   低金钱、低随机性：分别对 `cost.money`、`cost.luck` 的 `1~5` 级反向归一化；
-   低时间：优先使用 `cost.time` 的 `1~5` 级反向归一化，缺失时回退到 `estimatedMinutes` 的候选池反向归一化。

单项评分只累计非空维度，并以这些维度的可用权重重新归一化到 `0~100`；`null` 不得按 `0` 分参与计算。阶段难度过滤后若完全没有候选，允许回退到未应用阶段难度上限的候选池，避免系统建议为空，但返回结果必须保留实际采用的阶段和难度信息供页面解释。

分类评分不是简单按数量排序，计算方式为：

-   候选质量 `75%`：分类内推荐分最高的前 12 项取平均；
-   未完成存量 `15%`：`log1p(分类数量) / log1p(最大分类数量)`；
-   可获得资历池 `10%`：`sqrt(分类点数 / 最大分类点数)`。

默认返回得分最高的 3 个一级分类。推荐结果至少保留 `version`、`stageKey`、`strategy`、`maxDifficulty`、`weights`、`categoryWeights`、`dimensionCoverage`、`categories`、`candidateCount`、`availablePoints`、`roleSchool` 和 `schoolEligibilityVersion`，以便页面解释推荐依据并支持后续调权回溯。

### 5.5 方案持久化字段

现有方案继续使用 `schema` 保存去重后的成就 ID，规划上下文写入 `meta`：

| 字段 | 含义 |
| ---- | ---- |
| `createBy` | 当前固定为 `planner` |
| `roleId` | 生成时的当前角色 ID |
| `targetPoints` | 玩家目标资历总值 |
| `categoryIds` | 玩家自选或系统推荐采用的一级分类 ID |
| `mapId` | 地图限制，无限制时为 `null` |
| `maxDifficulty` | 难度上限，未限制时为 `null` |
| `strategy` | 玩家请求或系统推荐的排程策略 |
| `generatedStrategy` | 缺字段降级后实际使用的策略 |
| `generationMode` | `recommended` 或 `custom` |
| `recommendationVersion` | 推荐规则版本，自选时为 `null` |
| `recommendationStage` | 推荐阶段，自选时为 `null` |
| `schoolEligibilityVersion` | 门派可完成性规则版本 |
| `roleSchool` | 生成时归一化后的角色门派 |
| `selectedPoints` | 保存时路线可获得的资历点数 |

旧方案缺少上述字段时，使用当前角色和方案剩余点数恢复可展示详情，不反向伪造历史规划条件。本地生成或编辑路线允许增加、删除成就；必须拒绝重复 ID，并在每次变更后重新计算 `selectedPoints`、预计达成资历、剩余缺口、清单项数、总耗时、平均难度和平均成本。保存时以调整后的 `schema/meta` 为准，详情查看态保持只读。

### 5.6 门派可完成性 `school-v1`

门派可完成性统一由 `src/utils/achievementSchoolEligibility.js` 处理，不得在推荐、自选、分类数量或添加弹窗中复制另一套过滤：

| 范围 | 前端回退规则 |
| ---- | ------------ |
| 任务 | 读取“任务”一级分类下以“门派名 + 任务”命名的二级目录，仅允许相同门派角色完成 |
| 武学 | 读取“武学”一级分类下以“门派名 + 招式”命名的二级目录；“无相楼招式”为全门派公共项 |
| 风雨江湖路第二幕 | 目录不含门派名，按 `JOURNEY_SECOND_ACT_SCHOOL_BY_ID` 显式维护成就 ID 与门派映射 |

标准记录已有 `restriction.school`、`schoolLimit` 或 `SchoolLimit` 时，接口显式限制优先，手工规则只在字段缺失时回退；`* / all / none / 不限 / 无 / 通用 / 江湖` 视为不限制门派。角色 `school` 可输入门派 ID、门派名、心法名或心法 ID，最终统一为 `@jx3box/jx3box-data` 的标准门派名。无法识别角色门派时不执行前端门派排除，待接口字段补齐后再由服务端给出确定结果。

## 6. 后端字段替换流程

1. 在本文更新字段名、类型、单位和枚举；
2. 修改适配器别名或服务响应拆包；
3. 补充 `scripts/test-achievement-workbench.js`，同时覆盖缺失值、`0` 和 `false`；
4. 确认三页业务组件没有出现新的接口原始字段名；
5. 当字段稳定后，将对应状态从 `future` 更新为 `current`，再启用相关筛选和计算。
