# 剑侠录业务维护说明

## 1. 文档职责

本文是 `/pvx/questsection` 的业务实现与维护边界。视觉和断点结果见
[`../design/questsection-layout.md`](../design/questsection-layout.md)，跨页面响应式实现规则见
[`../agents/responsive-detail-layout.md`](../agents/responsive-detail-layout.md)。

## 2. 模块入口与文件职责

| 文件 | 职责 |
| --- | --- |
| `src/views/questsection/Index.vue` | 页面外壳，接收侧栏选择并向内容区传递当前资料片和大章节 |
| `src/views/questsection/Sidebar.vue` | 菜单请求、资料片折叠、搜索、默认章节和路由章节定位 |
| `src/views/questsection/Content.vue` | 小节分组、详情请求、头图信息、正文和状态展示 |
| `src/service/questsection.js` | 菜单和小节详情接口 |
| `src/utils/questsection.js` | 头图地址和正文格式化 |
| `src/assets/css/questsection/*` | 剑侠录页面布局和样式 |

数据流为：

1. `Sidebar` 请求菜单并确定默认资料片、大章节；
2. `Sidebar` 通过 `select` 发出 `{ season, chapter }`；
3. `Index` 保存选择并传给 `Content`；
4. `Content` 按分组请求小节详情并展示正文。

## 3. 接口与数据合同

菜单：

```text
GET /v2/questsection/menu
```

小节详情：

```text
GET /v2/questsection/detail/:id
```

当前页面请求参数使用：

- `client: "std"`；
- `season_id: season.nSeasonID`；
- `chapter_id: chapter.nChapterID`。

菜单层级为资料片 `Season`、大章节 `Chapter`、小节 `Section`。代码依赖的主要字段包括：

- `nSeasonID`、`szTitle`；
- `nChapterID`、`Chapters`；
- `nSectionID`、`Sections`、`szTitle`；
- 详情中的 `Chapter.imagePath`、`Chapter.imageFrame`、`Chapter.title`、`Chapter.time`；
- 详情中的 `szDetail`。

字段或客户端规则变更前必须先核对接口，不要在页面增加猜测性 fallback。

## 4. 默认选择和路由定位

- 页面优先读取 `$route.params.id`，在菜单树中查找包含该小节的资料片和大章节。
- 找到路由小节后，应展开对应资料片并选择对应大章节。
- 没有有效路由小节时，优先选择标题为“风起稻香”的资料片。
- “风起稻香”不存在时使用菜单第一项。
- 默认选择资料片的第一个大章节。
- `Content` 根据路由小节在 `Sections` 中的位置计算初始分组。

后续修改默认选择时，不得只改侧栏选中态；侧栏、内容分组和路由小节必须指向同一数据。

## 5. 搜索与折叠

- 搜索同时匹配资料片标题和大章节标题。
- 资料片标题匹配时展示其全部大章节。
- 只有大章节标题匹配时，仅展示匹配章节。
- 搜索命中大章节后自动展开所属资料片。
- 手动折叠为手风琴逻辑，同一时间只保留一个资料片展开。

搜索只过滤现有菜单数据，不重新请求接口。

## 6. 小节分组与加载

- `SECTION_PAGE_SIZE` 固定为 `4`。
- 分组标签按实际索引生成，例如 `1-4`、`5-8`；最后不足 4 条时使用实际结束序号。
- 每次只展示当前分组的小节，不累计展示前后分组。
- 页面没有“加载更多”语义，不得恢复旧的累计加载状态。
- 切换分组时并发请求该组最多 4 条小节详情。
- 已成功请求的小节缓存在 `sectionDetailsMap`，同一大章节内避免重复请求。
- `requestSequence` 用于阻止旧请求覆盖新资料片、新章节或新分组。
- 只有整组详情均成功后才更新 `displayGroupIndex`。
- 分组加载失败时，视觉选中态回到已展示分组，并允许重试失败的目标分组。

`activeGroupIndex` 表示用户正在选择或请求的分组，`displayGroupIndex` 表示当前已完整展示的分组。两者不能无条件合并，否则失败请求会让 Tab 与正文不一致。

## 7. 头图和正文来源

- 头图及覆盖文字来自当前已展示分组第一条小节详情的 `Chapter`。
- 图片地址统一通过 `getQuestsectionImageUrl` 生成。
- 正文统一通过 `formatQuestsectionDetail` 格式化，不在模板中复制格式化逻辑。
- 章节标题优先使用菜单小节的 `szTitle`，没有时再使用详情的 `szTitle`。
- 正文序号使用小节在当前大章节全部 `Sections` 中的全局索引，不使用组内 `0-3` 索引。

## 8. 双 Tab 结构

模板同时存在桌面和手机两份 Tab：

- `m-questsection-content__chapters--desktop` 参与桌面头部 Grid；
- `m-questsection-content__chapters--mobile` 脱离头图卡片，负责手机横向滚动和 Sticky。

这是展示层的有意拆分，不是两套业务：

- 两份 Tab 必须读取同一个 `chapterGroups`；
- 两份 Tab 必须共享 `activeGroupIndex`；
- 两份 Tab 必须调用同一个 `handleGroupClick`；
- 不得分别保存选中项或加载状态。

## 9. 状态和终端边界

- 首次加载且无正文时展示加载状态。
- 无数据和加载失败使用公共空状态；失败状态提供重试。
- 普通手机 Web 隐藏错误反馈和 QQ 机器人操作区。
- 小程序环境继续隐藏错误反馈和 QQ 机器人。
- 普通 Web 与小程序的隐藏规则属于终端展示差异，不得影响章节请求和正文。
- 页面使用自然文档滚动，并使用公共 `PvxBacktop`。
- 普通移动 Web 的侧栏收为按资料片分组的可搜索章节 Select，选择值由“资料片 ID + 章节 ID”组成，仍调用桌面侧栏同一套 `selectChapter` 业务入口。
- 小程序继续使用原纵向章节侧栏，不启用普通移动 Web 的 Select。
- 头图元信息除年代外展示当前大章节的小节总数，固定文案由 `pages.questsection.ui.totalSections` 在四语言中维护。

## 10. 修改后的最低回归

- 路由小节能定位到正确资料片、大章节和 4 条分组；
- 无路由参数时默认进入“风起稻香”或第一资料片；
- 搜索资料片、搜索章节和清空搜索；
- 快速连续切换分组时旧响应不会覆盖新正文；
- 分组部分请求失败时 Tab 与已展示正文保持一致，重试可恢复；
- 最后一组不足 4 条时标签和正文序号正确；
- 桌面和手机 Tab 选中状态一致；
- 手机 Sticky Tab 可横向滚动，且不会被正文或公共头部遮挡。
