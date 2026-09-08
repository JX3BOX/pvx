# 资历宝典四模块统计口径核对

核对日期：2026-09-08。适用普通 Web `/pvx/achievements` 下的四个主模块及其子页面、抽屉、弹窗和导出；小程序/App 与独立 Wiki 不在这次页面核对范围内。

现行规则已归入[统计业务规则 5.5](../project/achievement-statistics.md#55-当前-web-四模块统计范围)及[模块维护说明 6.1](../project/achievement.md#61-四模块及子页面的统计范围)。业务定义以这两份文档为准，本文保留核对记录与实现位置。

## 统一规则

- 角色总览、当前资历、总资历对比：有效 `general=0/1/2/3` 的全部已获得资历，包含隐藏和绝版。
- 常规范围：`general=1 && visible=true`。零资历成就参与数量和完成数量统计。
- 方案自身的数量、资历、完成率：只计算方案内的常规可见 ID，按 ID 去重；预计达到值为角色全部当前资历加上方案内未完成项资历。
- 完成进度的门派折算仅改变总览、全部和一级分类的百分比，不改写真实数量、资历、完成 ID 或方案完成率，沿用现有规则。
- 方案条数、咨询记录数、角色数、页数分别统计其业务对象，不套用成就档位筛选。

## 页面核对表

| 页面或入口 | 统计范围 | 实现来源 |
| --- | --- | --- |
| 完成进度：总览、左侧全部 | 全档位；列表切换常规/五甲、搜索、状态筛选不改变角色总资历 | `AchievementProgressPage.overallProgress` → `buildAchievementOverallProgress` |
| 完成进度：分类总览 | 常规可见、五甲可见、常规/五甲隐藏、绝版分别统计；特殊档位只进入总览 | `buildAchievementTierProgress` |
| 完成进度：一级/二级分类进度 | 对应目录的成就集合；按 ID 去重，一级可折算门派百分比，二级使用实际完成比例 | `buildAchievementCategoryProgress` |
| 完成进度：列表、搜索、地图与分页 | 按当前档位和完成状态筛选；默认常规可见。搜索以当前 points 元数据确定有效 ID 和档位 | `filterAchievementIds`、`filterAchievementRecords` |
| 亲友对比：角色概览、矩阵角色表头、总资历对比 | 全档位角色总资历，不随成就列表筛选变化 | `AchievementComparePage.roleProgress` → `buildAchievementRoleProgress` |
| 亲友对比：目录数量、结果数量与资历、导出 | 常规可见范围内的当前筛选结果；导出复用 `resultIds` | `regularMetadata`、`baseResultIds`、`resultIds`、`fetchExportRecords` |
| 亲友对比：分类分析、交叉统计 | 常规可见全集；交叉统计按已完成 ID 交集/差集计算 | `categoryComparison`、`crossStatistics` |
| 渡劫方案：推荐偏好分类数量 | 未完成、正资历、常规可见；不使用前端门派规则推算后端排除数 | `buildAchievementLeapCategoryOptions` |
| 渡劫方案：系统推荐及候选、待开放活动 | 候选资格、排除数和阶段由推荐接口负责；前端按实际入选项计算方案数量和资历，候选与待开放活动按当前展示记录计数，展示筛选不改变入选统计 | `AchievementLeapRecommendation`、`achievementRecommendation.js` |
| 渡劫方案：推荐目标和预计达到 | 服务端 `role.current_points` 加上当前入选资历；不用常规资历替换角色当前资历 | `selectionResult`、`targetSummary` |
| 渡劫方案：方案列表、详情、复制、编辑 | 方案统计与明细统一限定常规可见，历史零资历项保留；角色当前资历仍为全档位 | `filterAchievementLeapIds`、`buildAchievementLeapPlanProgress`、`buildAchievementLeapDetailRoute` |
| 渡劫方案：添加成就弹窗 | 未完成、正资历、常规可见并符合本地门派可完成条件；数量从候选 ID 与当前筛选得出 | `AchievementLeapAddDialog`、`AchievementSelectionBrowser` |
| 渡劫方案详情：咨询记录、咨询弹窗 | 列表总数统计咨询记录；打开详情后复用咨询方案和完成进度组件 | `PlanConsultations` → `ConsultationDetail` |
| 渡劫咨询：公开、定向、已回复队列 | 接口返回的咨询记录数量，不是成就数量 | `ConsultationWorkspace` |
| 渡劫咨询：详情中的方案 | 常规可见方案统计，角色当前资历全档位，与普通方案详情相同 | `ConsultationPlan` → `buildAchievementLeapDetailRoute` |
| 渡劫咨询：详情中的完成进度 | 与主完成进度组件相同：全档位总览、按档位分类卡、默认常规列表；使用咨询角色完成记录 | `ConsultationDetail.progressSnapshot` → `AchievementProgressPage` |
| 使用指南 | 静态说明，无动态资历统计 | `views/wiki/guide.vue` |

旧 `catalogue`、`list` 地址重定向至完成进度，旧 `compare/catalogue`、`compare/achievement` 重定向至亲友对比，旧 `leap?id=...` 重定向至方案详情，均没有另行计算统计。

## 本次发现与修正

1. 亲友对比的角色概览、表头和总资历对比此前误用了常规元数据，现恢复全档位；列表及常规分析仍限定常规可见。
2. 完成进度的搜索此前仅依赖详情记录的 `tier`。现与目录筛选一样使用 points 元数据，排除未知 ID，避免接口默认档位扩大列表数量；咨询复用组件同步生效。

推荐候选资格和各项排除数仍属于后端计算。本次核对覆盖前端消费、入选及目标统计，不将其视为后端资格算法的重新验证，也不在前端重算门派排除。

## 回归覆盖

`scripts/test-achievement-regular-scope.js` 使用同一份包含常规、零资历、隐藏、五甲、绝版和特殊成就的目录，对照完成进度、亲友对比、推荐入选、保存方案及咨询预览：角色当前资历始终为全档位，常规结果与方案增量不混入其他档位。另由 compare/progress/leap/recommendation/service/web-contract 及咨询流程测试覆盖筛选、导出、接口适配、旧路由和分页。
