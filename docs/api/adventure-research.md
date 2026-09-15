# 奇遇前置反推接口草案

页面：`/pvx/adventure-research`。以下新增接口尚未实现。

## 当前接入

-   角色：`GET /api/team/my-game-roles?nopage&custom=0`。
-   同步成就：`GET /api/next2/user-achievements?jx3id=...`。
-   奇遇：`GET /serendipities?type=perfect|normal&client=std`，仅绝世和普通奇遇。
-   地图：复用 `fetchAchievementWorkbenchMaps`，按区域显示且支持搜索。
-   成就元数据、详情、奇遇对应成就沿用现有 service。
-   图片：复用 Element Plus `el-upload` 单框批量上传，复用公共包 `upload` 方法，调用已有 `POST /api/cms/upload`，保存返回的 URL；每条最多 3 张，每张最大 5MB。图片上传到公共服务，记录仍仅保存在本机。
-   日常：预置选项复用 `src/assets/data/daily_keys.json` 中 type=1 的大战、战场、声望日常，并补充茶馆、门派日常、阵营日常。玩家可多选或输入其他任务。此处记录日常类别，不推断当天轮换内容或自动判定完成。
-   本地数据协议使用 `pvx.adventure-research.v2`，初始为空；旧版存储保持不动，不自动加载或上传。

## 待新增接口

建议前缀 `/api/cms/pvx/adventure_research`，响应沿用 `{ code: 0, data: ... }`。

| 方法   | 路径                                                              | 内容                                           |
| ------ | ----------------------------------------------------------------- | ---------------------------------------------- |
| POST   | `/records`                                                        | 保存记录，服务端校验角色归属并固化同步成就快照 |
| GET    | `/records?client=std&adventure_id=123&type=perfect&page=1&per=20` | 分页记录，支持 mine=1                          |
| GET    | `/records/{id}`                                                   | 详情和授权可见的快照                           |
| DELETE | `/records/{id}`                                                   | 本人或管理员撤回，汇总同步失效                 |
| GET    | `/statistics?client=std&adventure_id=123`                         | 有效角色数、共有成就、日常统计                 |

奇遇筛选复用已有列表，无需另建筛选配置或上传接口。

### 提交示例

```json
{
    "client": "std",
    "adventure_id": 123,
    "role_id": 456,
    "triggered_at": "2026-09-14T03:10:00.000Z",
    "map_id": "100",
    "activity": "完成任务后准备钓鱼",
    "completed_dailies": ["大战", "茶馆日常"],
    "notes": "其他细节",
    "images": ["https://cdn.jx3box.com/upload/example.png"]
}
```

服务端校验图片 URL/上传归属，不信任客户端提供的用户 ID、完成 ID 或资历。`client + adventure_id + jx3id` 对有效记录唯一，重复请求返回业务错误。修正记录暂通过撤回后重提。

### Record 模型

```text
id, client, status, created_at, can_withdraw
adventure: { id, name, type: perfect|normal }
role: { role_id, jx3id, name, server }
triggered_at, map_id, map, activity, completed_dailies[], notes, images[]
snapshot: {
  synced: boolean,
  updated_at: string|null,
  captured_at: string,
  completed_ids: string[],
  points: number|null
}
```

时间为 ISO 8601，页面按 Asia/Shanghai 展示。列表默认不传全部完成 ID，汇总由统计接口提供。前端 service 转换 snake_case 为现有 camelCase。

### 汇总结果

```json
{
    "sample_count": 20,
    "excluded_record_count": 2,
    "minimum_points": 18000,
    "excluded_achievement_ids": [999],
    "achievements": [{ "id": "100", "count": 20, "rate": 1, "common": true }],
    "dailies": [{ "name": "大战", "count": 15 }]
}
```

-   按客户端和奇遇隔离，角色去重；撤回和缺失同步记录不计入。
-   已同步空成就集合是有效样本，每项成就、日常每个角色只计一次。
-   排除目标奇遇自身成就；对应关系缺失时显式返回不可分析状态。
-   成就快照不会随玩家后续同步变化；同步时间、触发时间、固化时间分别保存。
-   缺失资历为 null，零有效；无样本时最低资历为 null。
-   共有项只是候选线索，最低资历不是触发门槛。

日常参考：项目日常分类、[官方新手指南中的秘境与门派日常](https://jx3.xoyo.com/zl/new-jl.html)、[魔盒入门资料的日常章节](https://cdn.jx3box.com/upload/post/2024/11/7/423730_341740.pdf)。不采用旧资料中的具体等级、奖励或轮换副本作为当前配置。

表单顺序：触发行为（必填、拒绝纯空白）→ 背包和仓库截图（单框批量，最多三张）→ 已完成日常 → 其他补充（选填）。上传中禁止保存；上传失败显示错误，可重新选择上传。
