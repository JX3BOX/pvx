# PVX WebView 统一页面规则

## 适用范围

PVX 项目本地的页面路由与组件展示。公共头仍可为宿主环境添加 `.v-miniprogram` 等标识，本项目不修改公共头逻辑。

## 规则

- 小程序、App WebView、手机浏览器和桌面浏览器使用同一套普通 Web Vue 页面。
- 项目路由不得通过 `isMiniProgram()`、`isApp()`、User-Agent 或视口宽度切换到独立的小程序/移动端 Vue 文件。
- 普通 Web 页面不得根据 `.v-miniprogram` 切换业务组件或隐藏普通 Web 功能。
- 历史 `miniprogram`、`mobile` Vue 和样式文件暂时保留，但不再作为项目页面入口，也不应被普通页面静态导入。
- 旧的专用 URL 如仍需兼容，应重定向到对应普通 Web 页面，不能继续加载旧 Vue。
- 手机尺寸适配统一在普通 Web 页面内通过响应式 CSS 完成。

## 当前兼容边界

- 公共头仍负责识别宿主，并可能在根节点添加 `.v-miniprogram`；PVX 不覆盖、不删除这项公共能力。
- PVX 本地普通页面、路由和当前生效的模块样式不得读取 `.v-miniprogram` 或 `.wechat-miniprogram` 来改变布局、隐藏功能或选择组件。
- 公共头在小程序中是否显示、是否保留顶部占位仍由公共组件决定；PVX 不通过本地样式补偿该区域。
- 历史专用 Vue、LESS 文件暂不删除，但只能作为归档代码存在。新增代码不得重新导入这些文件。
- `/adventure` 的 `portrait` / `landscape` 是“奇遇珍券”的窄屏版式选择，依据可用宽度而不是宿主环境；这是目前允许保留的明确例外。

## 本轮已统一的入口

以下模块的小程序、App WebView 和普通浏览器均进入普通 Web Vue：

- adventure、body、book、exam、face、furniture、homeland；
- horse、pet、pvg、reputation、wiki、achievement；
- 原先页面内部按终端切换的声望详情、奇遇任务、公告、百科侧栏等组件。

旧的显式小程序 URL 如脸型/体型数据、宠物搜索和百科子路由，仅做普通页面重定向，不继续加载旧 Vue。

## 排查与验收

- 检查所有 router 文件，确认 `component` 不再按终端或视口选择不同 Vue。
- 检查普通页面依赖，确认没有导入旧小程序/移动端页面组件。
- 生产构建成功，并确认旧页面不再因路由入口进入构建依赖图。
- 全仓检索当前入口及其依赖，确认没有新增生效的 `.v-miniprogram` / `.wechat-miniprogram` 选择器。
