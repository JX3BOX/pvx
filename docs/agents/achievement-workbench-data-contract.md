# 资历宝典统一字段协议

> 最后更新：2026-09-05。现行系统推荐由后端返回候选、分组、顺序与规则版本；`stage-v1` 仅保留为旧纯函数兼容说明，`school-v1` 用于本地方案编辑和分类计数。

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

综合难度（`overall`）在 UI 中始终渲染为支持小数填充的五颗星，并在星级后显示一位小数（如 `0.5`），不使用整数档位文案覆盖真实分数。其他维度优先展示公共定义中的 `score_labels`：每项为 `{ min, label }`，`min` 使用接口的 `0~50` 分值且按升序排列；标准模型值直接与 `min / 10` 比较，命中最高的已达到下限，不使用相等匹配，也不四舍五入后分档。例如下限为 `0、20、30、41` 时，对应 `[0,2)、[2,3)、[3,4.1)、[4.1,5]`，`1.99` 仍属于第一档。文案的悬浮提示保留具体分数；没有匹配文案时回退为星级展示。

所有展示入口通过 `AchievementDifficultyStars` 的 `dimensionKey` 传递维度标识。星级不显示可见的 `x/5`；`aria-label` 可使用“时间成本：2.5/5”保留完整语义。星级模式下 `0` 渲染为空星和 `0.0`，`null` 或非法值只渲染“—”。

`completionStatistics` 是已同步角色样本的完成统计，并非剑网 3 全服角色数据。当前所有成就展示入口及亲友对比导出均隐藏“同步完成率”和角色计数，字段仅保留在标准模型中，不影响角色自身进度或方案完成率。所有成就条目显示已有 `shortDescription`，长描述允许换行，无描述不创建空占位；描述使用纯文本插值，不作为 HTML 渲染。

`cost.tier` 当前没有公共数据来源，第一阶段不展示对应筛选，也不根据其他成本维度在前端推导成本档位。

标签类型由 `tag_label` 解析，当前没有独立的类型字段。适配器识别 `门派：`、`节日：`、`活动：`、`阵营：`（同时兼容半角冒号），并保留完整原始标签；未知前缀进入 `tagGroups.unknown`。前端标签只用于展示和调整展示顺序（门派标签优先），不重新判断后端推荐候选的资格，也不改变本地 `school-v1` 门派过滤。

## 4. 标准角色模型

| 字段         | 类型             | 当前来源/兼容别名             |
| ------------ | ---------------- | ----------------------------- |
| `id / jx3id` | `string \| null` | `jx3id / id / ID`             |
| `roleId`      | `number \| null` | 本人角色接口的数值 `ID`；推荐和咨询请求使用此值 |
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
-   `fetchAchievementWorkbenchTag(tagId, options)`：通过公共 `GET /api/cms/pvx/wiki_achievement_tag/{tag_id}` 读取单个标签，返回标准标签或 `null`，用于待开放活动名称；非法 ID 不请求，显式传递 `client`，不使用管理字段 `tag_remark`；
-   `src/utils/achievementWorkbench.js` 的 `applyAchievementWorkbenchEnrichment(records, context)`：按成就 ID 将难度和标签合并到基础标准记录；
-   `fetchAchievementWorkbenchDifficulty(ids, batchSize, options)`：保留旧标量难度适配与 `options.client` 透传，用于本地搜索添加、现有方案读取及旧调用方兼容；现行系统推荐不调用它计算候选或排序；
-   `fetchAchievementWorkbenchRecommendation({ roleId, camp, preferences })`：请求 CMS 后端推荐，使用数值角色 ID；检查业务响应和必需数组后保留后端结果，具体边界见 5.7；
-   `fetchAchievementWorkbenchLeapPlans(params)` / `fetchAchievementWorkbenchLeapPlan(id)`：标准化方案列表与详情；
-   `saveAchievementWorkbenchLeapPlan(payload, id)`：无 `id` 时创建，有 `id` 时更新，继续保持旧接口写入语义；
-   `deleteAchievementWorkbenchLeapPlan(id)`：删除用户方案。

完成进度、角色对比和渡劫方案三页的展示字段统一通过上述增强接口读取，并消费同一份动态维度定义。完成进度默认只读取当前可见页的难度与标签，用户主动按某一维度排序时才补齐当前候选集；角色对比的页面与导出共用同一维度顺序；渡劫方案详情和本地编辑补充公共展示数据，推荐抽屉按当前分组与主动展开的同地点分组加载展示数据。

现行创建入口是正式服后端推荐抽屉。服务端决定候选资格、推荐分组及初始顺序，前端只提交偏好、补充展示信息、维护用户调整后的草稿，并按目标资历截取保存清单。旧 `stage-v1` 纯函数、手工规划字段与 `school-v1` 本地规则不定义后端算法，也不作为推荐失败时的自动回退。

### 5.1 成就团长指点

方案详情已接入真实咨询服务 `src/service/achievementConsultation.js`，基础路径为 `/api/cms/pvx/achievement_consultation`。页面仅为已登录用户的本人正式服方案显示入口；实际访问与回复权限仍由服务端返回。

-   创建请求：`POST` 基础路径，传入 `plan_id`、数值 `role_id`、可空的 `target_expert_id` 与 `question`；前端不提交角色完成快照或调整后的方案；
-   方案咨询列表：`GET` 基础路径，传入 `scope: "player"`、`plan_id`、`page`、`per`，读取 `list`、`total` 与 `pending_id`；有待处理咨询时打开现有详情；
-   详情：`GET /:id`，展示接口返回的 `plan`、`role`、`completion.ids / updated_at`、问题和 `advice_html`；完成数据缺失时提示未同步，不伪造完成状态；
-   专家能力与名单：`GET /access`、`GET /experts`；回复：`POST /:id/reply`，请求为 `{ advice_html }`；
-   撤销：`POST /:id/cancel`；评价：`POST /:id/rating`，请求为 `{ rating, review }`。页面依据 `is_owner`、`can_reply` 和 `status` 展示对应操作。

当前咨询提供专家富文本建议与玩家评价，不实现“原方案 / 调整方案”双版本改写；早期 `leap-guidance` 草案不属于现行接口契约。

### 5.2 完成进度兼容限制

完成进度页不再承载隐藏成就列表：隐藏分类总览卡片固定跳转 Wiki 维护文章 `/bbs/8104`，主列表档位仅有常规和五甲。现有 `/api/node/achievement/list` 与 `/api/node/achievement/search` 过滤隐藏成就的兼容逻辑保留在服务层，仅供其他仍需隐藏成就详情的调用方使用；若未来恢复站内隐藏列表，需要先补齐后端的隐藏成就全量搜索能力。

### 5.3 本地方案编辑与旧路线纯函数口径

渡劫方案的标准模型与旧路线纯函数位于 `src/utils/achievementLeap.js`。当前本地方案编辑、“添加成就”和分类计数，以及保留的旧自选纯函数共用以下候选条件；这些条件不用于二次过滤 5.7 的后端推荐结果：

-   当前角色尚未完成；
-   点数元数据 `general === 1`，不额外按 `visible` 过滤；
-   资历点数大于 `0`；
-   符合当前角色门派可完成性；
-   旧自选纯函数可再叠加所选一级分类、地图与难度上限；现行页面不提供独立的旧自选生成入口。

分类按显示名称合并、按成就 ID 去重，避免同名目录重复展示；分类数量使用上述口径下的未完成数量，数量为 `0` 的分类不返回。现有方案的原始 `schema` 仍由接口保留，方案读取、进度计算和详情展示先过滤为 `general=1`；进入本地编辑与搜索添加时再应用本地候选条件。推荐抽屉的直接创建使用后端结果与入选清单，不调用这些旧候选过滤器。

### 5.4 `stage-v1` 旧推荐纯函数（仅兼容）

本节保留 `buildAchievementLeapRecommendation` 的历史阈值、权重和返回字段，供旧纯函数测试与历史方案解释使用。现行 `loadRecommendation` 请求后端，不执行本节评分；不能用本节推断后端阶段边界、候选资格或排序。

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

旧纯函数默认返回得分最高的 3 个一级分类。其结果保留 `version`、`stageKey`、`strategy`、`maxDifficulty`、`weights`、`categoryWeights`、`dimensionCoverage`、`categories`、`candidateCount`、`availablePoints`、`roleSchool` 和 `schoolEligibilityVersion`；这些字段不是现行后端推荐响应模型。

### 5.5 方案持久化字段

现有方案继续使用 `schema` 保存去重后的成就 ID，规划上下文写入 `meta`：

| 字段 | 含义 |
| ---- | ---- |
| `createBy` | 当前固定为 `planner` |
| `roleId` | 生成时的当前角色 ID |
| `targetPoints` | 玩家目标资历总值 |
| `categoryIds` | 旧本地规划的一级分类 ID；后端推荐偏好保存在 `recommendationPreferences` |
| `mapId` | 旧本地规划的地图限制，无限制时为 `null` |
| `maxDifficulty` | 旧本地规划的难度上限，未限制时为 `null` |
| `strategy` | 现行后端推荐为 `server-order`；旧方案保留原本地策略 |
| `generatedStrategy` | 现行后端推荐为 `server-order`；旧方案保留实际采用的本地策略 |
| `generationMode` | 现行创建为 `recommended`，旧方案可为 `custom` |
| `recommendationVersion` | 后端返回的 `version`；旧推荐方案可为 `stage-v1` |
| `recommendationStage` | 后端返回的 `role.stage`；旧方案保留历史阶段 |
| `recommendationCamp` | 后端返回的 `role.camp` |
| `recommendationPreferences` | 本次请求采用的偏好对象 |
| `recommendationGroups` | 入选项目调整后的 `{ group, ids }` 分组与顺序 |
| `campRestrictedIds` | 入选项目中被后端标记为阵营受限的 ID |
| `schoolEligibilityVersion` | 本地编辑使用的门派可完成性规则版本 |
| `roleSchool` | 本地编辑使用的归一化角色门派 |
| `selectedPoints` | 保存时路线可获得的资历点数 |

`meta.roleId` 保持角色选择器使用的字符串角色标识，与推荐请求的数值 `role_id` 不同。后端推荐创建由 `buildAchievementRecommendationPlan` 生成 `client: "std"` 和入选项目的 `schema/meta`；候选总数与当前筛选结果不直接成为保存清单。

旧方案缺少上述字段时，使用当前角色和方案剩余点数恢复可展示详情，不反向伪造历史规划条件。本地编辑路线允许增加、删除成就；必须拒绝重复 ID，并在每次变更后重新计算 `selectedPoints`、预计达成资历、剩余缺口、清单项数、总耗时、平均难度和平均成本。保存时以调整后的 `schema/meta` 为准，详情查看态保持只读。

### 5.6 门派可完成性 `school-v1`

本地编辑、旧自选纯函数、分类数量和添加弹窗的门派可完成性统一由 `src/utils/achievementSchoolEligibility.js` 处理，不得复制另一套过滤。后端推荐结果不再通过该函数重排或排除：

| 范围 | 前端回退规则 |
| ---- | ------------ |
| 任务 | 读取“任务”一级分类下以“门派名 + 任务”命名的二级目录，仅允许相同门派角色完成 |
| 武学 | 读取“武学”一级分类下以“门派名 + 招式”命名的二级目录；“无相楼招式”为全门派公共项 |
| 风雨江湖路第二幕 | 目录不含门派名，按 `JOURNEY_SECOND_ACT_SCHOOL_BY_ID` 显式维护成就 ID 与门派映射 |

标准记录已有 `restriction.school`、`schoolLimit` 或 `SchoolLimit` 时，接口显式限制优先，手工规则只在字段缺失时回退；`* / all / none / 不限 / 无 / 通用 / 江湖` 视为不限制门派。角色 `school` 可输入门派 ID、门派名、心法名或心法 ID，最终统一为 `@jx3box/jx3box-data` 的标准门派名。无法识别角色门派时本地兼容逻辑不执行门派排除；这不代表后端采用相同规则。

### 5.7 现行后端推荐

-   接口：`POST /api/cms/pvx/wiki_achievement_recommendation`。页面仅在 `client === "std"` 且本人角色有数值 `roleId` 时允许请求，服务适配器要求其为正安全整数；当前传入 `camp: "neutral"`，不上传本地已完成 ID，也不把本地总资历作为后端快照。
-   请求由 `role_id`、`camp` 与偏好组成。页面偏好为 `category_ids`、`dimension_weights`、`direction_weights`；全部分类时省略 `category_ids`，分类 ID 来自合并分类的 `sourceIds`。服务适配器另兼容透传 `dimension_ranges`，当前抽屉没有对应设置控件。
-   维度偏好是相对权重，界面范围 `0~2`、步长 `0.1`，默认 `1` 时不单独覆盖；方向选项“排除 / 少做 / 自动 / 优先”分别提交 `0 / 1.3 / 省略 / 0.7`。前端不按这些值自行评分。
-   服务适配器接受业务 `code` 为数值或字符串 `0`，要求存在 `role` 和数组 `recommendations`、`camp_restricted_ids`、`upcoming_events`。当前消费 `version`、`role.current_points / stage / camp / status / snapshot_stale / snapshot_updated_at`、`recommendations[].group / ids`、`upcoming_events[].tag_id / ids / next_start_at` 与可选 `excluded_summary`；后端资格算法以服务端为准，不由前端兼容规则补写。
-   `recommendations` 保持服务端分组和初始顺序；草稿允许移动分组、组内及跨组移动项目、删除和恢复原始推荐。`camp_restricted_ids` 只标记提示，待开放活动独立展示，不进入当前推荐保存清单。
-   成就详情、难度和标签按当前分组、主动展开的同地点分组独立请求与缓存；失败可分别重试，成功但未配置的难度 `null` 和空标签组也应缓存。搜索、地图和分类筛选主动加载轻量全局索引，展示补数不得改变推荐资格、顺序或入选结果。
-   快照时间只取后端 `role.snapshot_updated_at`，按 `Asia/Shanghai` 显示并标注 `UTC+8`；缺失或非法时显示“同步时间未知”，不能由此推断角色从未同步或全未完成。过期提示遵从 `snapshot_stale`，前端不推断过期阈值。同步指引链接为 `https://www.jx3box.com/dashboard/role/sync`，新开页面保留当前草稿；玩家完成游戏内同步后再刷新推荐，刷新推荐自身不触发游戏数据同步。
-   待开放活动页签打开后，按 `tag_id` 从公共标签详情读取名称；加载失败可重试，名称缺失时回退“活动标签 #{id}”。开放时间仍只使用推荐响应的 `next_start_at`，按 `UTC+8` 展示，缺失或非法时提示未知，不从标签文案推算活动时间。
-   `excluded_summary` 只展示服务端返回的正安全整数原因计数，数值字符串兼容转换；已知原因使用对应说明，未知原因保留原始键并显示计数。各原因可能重叠，禁止相加声称为去重后的排除总数，也不据此重新筛选候选。
-   入选资历使用点数元数据与后端 `role.current_points`，按用户调整后的完整顺序取达到目标所需的最短前缀；仅校验该前缀内的点数。前缀内缺失、非法或负数点数阻止保存，不能当作 `0` 或跳过；已达标后的缺失点数不阻止保存。候选用尽仍不足目标时，只要所用点数完整且清单非空，允许保存并提示剩余缺口。
-   “全部候选 / 只看已入选”和名称、地图、分类筛选仅影响浏览；保存始终使用入选前缀，并再次按目标截取。抽屉关闭再打开保留草稿；角色、客户端、推荐偏好或新推荐结果使旧上下文失效，旧请求不得回写，新结果或主动恢复才重置草稿。

恢复与失败状态的补充约定见 [推荐稳定性规则](./achievement-recommendation-resilience.md)。

## 6. 后端字段替换流程

1. 在本文更新字段名、类型、单位和枚举；
2. 修改适配器别名或服务响应拆包；
3. 补充 `scripts/test-achievement-workbench.js`，同时覆盖缺失值、`0` 和 `false`；
4. 确认三页业务组件没有出现新的接口原始字段名；
5. 当字段稳定后，将对应状态从 `future` 更新为 `current`，再启用相关筛选和计算。
