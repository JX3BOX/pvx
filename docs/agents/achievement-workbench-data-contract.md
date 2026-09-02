# 资历宝典统一字段协议

## 1. 目的

资历宝典当前继续使用旧接口，但“魔盒成就百科”原型包含一批后端尚未提供的字段。所有新版页面必须消费本协议的标准模型，不直接依赖接口字段的大小写或历史命名。后端替换字段时优先修改
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
| `difficulty`         | `number \| null`                    | `difficulty / Difficulty / diff`                    | 待接口 |
| `estimatedMinutes`   | `number \| null`                    | `estimatedMinutes / estMinutes`                     | 待接口 |
| `cost.money`         | `number \| null`                    | `moneyCost / money`                                 | 待接口 |
| `cost.time`          | `number \| null`                    | `timeCost / time`                                   | 待接口 |
| `cost.luck`          | `number \| null`                    | `luckCost / luck`                                   | 待接口 |
| `cost.tier`          | `string \| null`                    | `costTier`                                          | 待接口 |
| `restriction.school` | `string \| null`                    | `schoolLimit / school / cls`                        | 待接口 |
| `guideNote`          | `string \| null`                    | `guideNote / routeNote / note`                      | 待接口 |
| `updatedAt`          | `string \| null`                    | `updatedAt / UpdatedAt`                             | 待接口 |

成本类数值暂按原型使用 `1~5` 级，但前端只负责展示与排序，不擅自把它解释成具体金钱或时间数额。后端若改为实际数值，应新增单位字段或版本字段，不复用现有等级语义。

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
-   `fetchAchievementWorkbenchRecords(options)`：批量成就详情并转换为标准模型。
-   `fetchAchievementWorkbenchRecordsBatched(options)`：按安全批次读取较长方案或路线的成就详情；
-   `searchAchievementWorkbenchRecords(options)`：按关键词或地图调用现有搜索接口、展开系列成就并转换为标准模型；
-   `fetchAchievementWorkbenchMaps(client)`：读取并标准化地图选项；沿用旧地图选择器口径，仅保留具有有效 `RegionName` 的正式区域地图，区域为空的测试/内部场景不进入任何页面的筛选项。
-   `fetchAchievementWorkbenchFriends()`：读取并标准化当前用户的亲友列表；
-   `fetchAchievementWorkbenchFriendRoles(friendId)`：读取亲友角色并转换为标准角色模型。
-   `fetchAchievementWorkbenchDifficulty(ids)`：批量读取现有综合难度并统一换算为 `1~5` 星；
-   `fetchAchievementWorkbenchLeapPlans(params)` / `fetchAchievementWorkbenchLeapPlan(id)`：标准化方案列表与详情；
-   `saveAchievementWorkbenchLeapPlan(payload, id)`：无 `id` 时创建，有 `id` 时更新，继续保持旧接口写入语义；
-   `deleteAchievementWorkbenchLeapPlan(id)`：删除用户方案。

当前 `/api/node/achievement/list` 与 `/api/node/achievement/search` 会过滤隐藏成就。隐藏列表按页先调用批量接口，再对缺失 ID 使用 `/api/node/achievement/:id`（并发上限 6）补齐，因此分页展示与完成状态筛选可用；全量隐藏成就的关键词、分类和地图检索仍需要后端开放隐藏搜索，或在新接口中直接提供这些可检索字段。此限制保留在服务层，页面组件不感知旧接口的过滤行为。

渡劫方案的标准模型与路线纯函数位于 `src/utils/achievementLeap.js`。现有方案继续使用 `schema` 保存成就 ID；新版规划条件存入 `meta`，包括角色、目标资历、分类、地图、难度上限和排序策略。旧方案缺少这些字段时使用当前角色和方案剩余点数恢复详情，不反向伪造规划条件。

## 6. 后端字段替换流程

1. 在本文更新字段名、类型、单位和枚举；
2. 修改适配器别名或服务响应拆包；
3. 补充 `scripts/test-achievement-workbench.js`，同时覆盖缺失值、`0` 和 `false`；
4. 确认三页业务组件没有出现新的接口原始字段名；
5. 当字段稳定后，将对应状态从 `future` 更新为 `current`，再启用相关筛选和计算。
