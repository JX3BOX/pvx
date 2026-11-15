# 奇遇珍卷布局数据规则

绝世奇遇的位置、尺寸、名称位置和图片配置维护在 `jx3box-data/data/serendipity/treasure_perfect.json`。推送 `jx3box-data` 的 `master` 分支会触发数据同步和 npm 发包。PVX 默认从 `https://data.jx3box.com/data/serendipity/treasure_perfect.json` 读取布局，可用 `VUE_APP_ADVENTURE_TREASURE_LAYOUT_URL` 覆盖地址。

## 加载规则

- 请求失败或返回无效配置时，使用随构建打包的 `@jx3box/jx3box-data/data/serendipity/treasure_perfect.json`。
- 远程布局包含打包版本里的所有绝世奇遇 ID 时，按远程 `perfect.items` 顺序展示。
- 远程缺项时，按打包版本的顺序补齐。同 ID 的远程配置覆盖打包配置，远程独有的条目追加在末尾。

## 层级规则

渲染时使用 `perfect.items` 数组索引作为 `z-index`。调整遮挡关系时直接调整数组顺序，越靠后的条目层级越高。
