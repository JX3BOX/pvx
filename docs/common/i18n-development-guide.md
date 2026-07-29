# PVX 国际化开发规范

## 1. 文档定位

本文以已经完成多语言改造的捏脸数据、体型数据页面为基线，统一说明 PVX 项目的语言包组织、词条命名、运行时接入、路由 SEO、移动端复用和验收要求。

本文适用于业务页面、公共组件以及桌面、平板和手机 Web 页面。视觉与多屏布局规则见 `docs/design/responsive-adaptation-guide.md`。

## 2. 当前语言基线

项目当前支持以下语言：

| 本地存储值 | vue-i18n locale | Element Plus locale | 语言包目录 |
| --- | --- | --- | --- |
| `zh-cn` | `zh-CN` | `zh-cn` | `src/locale/zh-CN` |
| `zh-tw` | `zh-TW` | `zh-tw` | `src/locale/zh-TW` |
| `en-us` | `en-US` | `en` | `src/locale/en-US` |
| `vi` | `vi` | `vi` | `src/locale/vi` |

未识别或当前 UI 包不支持的 locale 统一回退到 `zh-CN`。语言来源为 `localStorage.lang`，业务入口不得自行再定义另一套语言状态。

捏脸/体型基线中的 `common`、`faceBody`、`face`、`body` 四个词条树目前在四种语言中各有 146 个叶子键，键结构一致。新增或删除词条时必须继续保持结构对齐。

## 3. 运行时接入流程

每个独立业务入口按以下顺序接入国际化：

1. 从 `localStorage.lang` 读取语言并规范化为项目 locale。
2. 使用 `createJx3boxUiI18n` 创建 i18n 实例，确保 JX3BOX UI 组件也能访问 `$t`。
3. 调用 `mergeAppLocaleMessages` 合并本项目语言包。
4. `app.use(i18n)` 安装实例。
5. 调用 `initRouterI18nHead` 接管路由标题和 SEO 元信息。
6. 为 Element Plus 选择同一 locale 对应的语言包。

捏脸与体型入口的参考实现分别位于：

- `src/pages/face/index.js`
- `src/pages/body/index.js`
- `src/locale/index.js`
- `src/router/i18n-head.js`

业务入口不得只切换业务文案而遗漏 Element Plus，也不得另外创建与 JX3BOX UI 不共享的 i18n 实例。

## 4. 语言包目录与加载约定

语言包采用 `src/locale/<locale>/<module>.js` 结构。例如：

```text
src/locale/
├── zh-CN/pages.js
├── zh-TW/pages.js
├── en-US/pages.js
└── vi/pages.js
```

`src/locale/index.js` 会扫描 locale 目录下一层的 `.js` 文件，并把文件名作为一级模块名。`pages.js` 导出的 `faceBody.detail.purchase` 最终访问路径为：

```js
this.$t("pages.faceBody.detail.purchase");
```

加载器目前不递归加载 `<locale>` 下更深的子目录。新增语言文件后无需修改加载器，但不能把词条文件放到二级子目录中。

## 5. 词条树与命名规则

### 5.1 层级职责

以 Face / Body 为例：

| 层级 | 职责 | 示例 |
| --- | --- | --- |
| `pages.common` | 全站通用文案和标题后缀 | `appendTitle` |
| `pages.faceBody` | 捏脸、体型真正共享的角色、筛选、卡片和详情文案 | `roles.male`、`detail.purchase` |
| `pages.face` | 仅捏脸使用的页面标题、SEO、筛选和解析器文案 | `ui.filters.faceCode` |
| `pages.body` | 仅体型使用的页面标题、SEO 和解析器文案 | `ui.parse.importTitle` |

新模块遵循 `pages.<module>.<scene>.<meaning>`。先按业务语义分组，再描述词条用途，不按组件文件名或视觉位置命名。

推荐：

```js
pages.faceBody.detail.downloadData
pages.face.ui.parse.selectFile
pages.body.single.description
```

避免：

```js
pages.face.button1
pages.face.leftText
pages.face.SinglePaySectionLabel
```

### 5.2 共享与专用词条

- 两个及以上业务模块语义完全一致时，才提升到共享层。
- 文案相似但业务含义不同，应保留在各模块下，不能为了减少键数量强行合并。
- Face / Body 的类型差异优先由同一组件根据 `type` 选择两个明确的键。
- 页面标题、关键词、描述属于路由页面，不放入组件通用词条。
- 管理员操作、错误提示、空状态和异步结果也属于用户可见文案，必须进入语言包。

### 5.3 参数与复数

动态值使用具名参数，不拼接句子：

```vue
{{ $t("pages.faceBody.detail.updatedAt", { time: post.updated_at }) }}
{{ $t("pages.faceBody.detail.noImages", { type: typeLabel }) }}
```

不要写成：

```js
this.$t("pages.faceBody.detail.updatedAt") + post.updated_at;
```

数量需要区分单复数时使用 vue-i18n 的复数能力，不能默认英文、越南文与中文语序相同。占位符名称在四种语言中必须完全一致。

## 6. 组件中的使用方式

Options API 模板直接使用 `$t`：

```vue
<el-button>{{ $t("pages.faceBody.actions.publish") }}</el-button>
```

脚本、计算属性和消息提示中使用 `this.$t`：

```js
typeLabel() {
    return this.$t(this.type === "face" ? "pages.faceBody.detail.faceType" : "pages.faceBody.detail.bodyType");
}
```

兼容旧数据映射时可以先用 `$te` 判断词条是否存在，再回退到源数据；不能把缺失键本身展示给用户。

所有用户可见内容均需检查，包括：

- 标题、按钮、Tab、筛选项、占位符和空状态；
- 确认框、通知、错误提示和加载结果；
- 图片的可访问文本和图标按钮的可访问名称；
- 管理员、作者、登录后才出现的操作；
- 手机 Web 抽屉、悬浮操作栏、复制提示和数据解析错误。

注释、日志中的开发信息和纯内部枚举不要求翻译，但日志不得被当作界面错误提示直接展示。

## 7. 路由标题与 SEO

每条可访问路由应在 `meta.i18n` 中声明 `title`、`keywords` 和 `description`：

```js
meta: {
    i18n: {
        title: "pages.face.single.title",
        keywords: "pages.face.single.keywords",
        description: "pages.face.single.description",
    },
}
```

`initRouterI18nHead` 负责：

- 根据当前 locale 翻译路由元信息；
- 更新 `document.title`、keywords、description 和 `<html lang>`；
- 在语言切换但路由不变化时重新刷新 head；
- 缺键时回退到 `src/settings.js` 的默认配置；
- 为标题追加 `pages.common.appendTitle`，并避免重复追加。

详情页若需要把作品标题写入 `document.title`，仍必须使用已翻译的公共后缀，且不能绕过路由 head 后造成后续语言切换失效。

## 8. 数据与第三方组件边界

以下内容默认保持源数据，不做未经确认的翻译：

- 用户发布的标题、介绍、作者名和备注；
- 接口返回的游戏专名、服务器名及不可控内容；
- 文件名、捏脸码、数值参数和版本标识；
- 第三方组件内部已经维护的词条。

`@jx3box/jx3box-facedat` 的参数名称和解析逻辑由依赖包维护。业务层不复制它的完整语言包，也不为同一内部字段再造一套翻译；如果其界面确实缺少目标语言，应优先在依赖包中修复或记录清晰的边界。

协议命令中的固定关键词也不翻译。宠物详情的 QQ 机器人指令必须始终为 `宠物 {宠物名称}`，其中 `宠物` 是机器人协议关键词；界面切换到繁体中文、英文或越南文时，只翻译“回复”“即可获取攻略”等外围说明，不得把实际命令改为本地化词语。

声望详情遵循同一规则：QQ 机器人指令必须始终为 `声望 {声望名称}`，其中 `声望` 是协议关键词。声望名、势力名、资料片名、地图名、NPC 名、提升方式和奖励内容均属于接口或游戏源数据，不在业务层猜测翻译；只翻译版本标签格式、字段名、分区说明、地图“坐标”等固定界面提示和机器人外围引导。

同一组件服务多个普通 Web 页面时，可以通过显式开关控制界面提示是否本地化。不得根据当前 locale 改变 QQ 机器人命令关键词、接口枚举或游戏源数据。

书籍普通 Web 使用 `pages.book` 词条树，列表筛选、分类、字段标签、视图切换、加载与空状态，以及详情导航、信息字段、抄录要求、阅读模式、套书标题和百科社区外围文案均进入语言包。简体中文、繁体中文、英文和越南文必须保持相同键结构。

书名、套书名、书籍正文、来源、地图、任务名和物品接口返回名称属于游戏源数据，不进行推测翻译。列表名称优先展示 `item-icon` 从物品接口或缓存取得的名称；只有普通 ID 与书籍组合 ID 均无法取得数据时，才展示书籍列表记录中的 `Name`。该备用值仍属于源数据，不应再经过 `$t`，也不能与接口名称同时出现。

书籍普通 Web 可以给 `PvxRobotTip`、`PvxUser` 传入书籍专用国际化前缀或现代样式变体；Bot 指令本身继续遵守固定协议关键词规则。

## 9. Web 与移动端复用原则

桌面、平板和手机 Web 必须共享同一套业务语义键。不能因为手机布局使用独立组件，就重新硬编码一套中文。

当前 Face / Body 的核心列表、详情和解析页使用 `pages.faceBody`、`pages.face`、`pages.body`。奇遇珍券竖版和技艺助手手机版等独立手机 Web 页面也必须复用对应模块词条。

移动端补齐时优先复用现有键；只有出现新的业务语义才新增词条，并同步四种语言。路由参数、接口枚举和 Bot 命令如果属于协议值，不应直接替换为翻译结果。

## 10. 长文本与布局联动

国际化不是只替换字符串。英文和越南文通常比中文更长，组件必须允许合理的弹性宽度、换行或截断。

- 按钮不能依赖固定中文宽度。
- 筛选标签在移动端可换行，但点击区域不能缩小。
- 标题与操作区必须分别设置 `min-width: 0` 和必要的 `flex-shrink`。
- 不用缩小到不可读字号解决溢出。
- 仅在确有语言差异时使用 `html:lang(...)` 修正布局，并把规则限制在模块根节点内。
- RTL 当前不在支持范围内；未来新增 RTL 语言时需单独评估方向性样式。

相关多屏规则见 `docs/design/responsive-adaptation-guide.md`。

## 11. 新页面接入清单

1. 确认页面入口已创建并安装共享 i18n 实例。
2. 在四个 locale 的同名模块文件中同步增加相同键结构。
3. 公共语义与模块专用语义分层正确。
4. 所有动态句子使用具名参数，没有字符串拼接。
5. 路由补齐 title、keywords 和 description。
6. Element Plus 与业务 locale 一致。
7. 检查普通、空数据、加载、错误、权限、购买和下载状态。
8. 检查桌面 Web、响应式手机 Web 和独立手机 Web 页面。
9. 使用英文和越南文检查长文本，使用繁体中文检查术语与标点。
10. 搜索新增文件中的硬编码用户可见中文，确认保留项确实属于协议值或源数据。

## 12. 验收标准

- 四种语言的键结构一致，不出现 key 直出。
- 切换语言后业务文案、Element Plus 和路由 head 保持一致。
- 插值参数完整，语序自然，没有拼接残片。
- 用户内容、游戏源数据与界面固定文案边界清晰。
- 英文、越南文无按钮遮挡、标签裁切和页面级横向滚动。
- 独立手机 Web 页面没有因独立模板遗漏新增词条。
- 第三方组件的国际化责任没有被业务层重复实现。
