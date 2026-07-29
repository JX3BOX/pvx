# Index

## 业务

#### 综合

-   index 休闲栏目

#### 图鉴大全

-   adventure 奇遇大全
-   pet 宠物大全
-   horse 坐骑大全
-   furniture 家具大全
-   reputation 声望大全
-   book 书籍大全

#### 数据分享

-   face 捏脸数据
-   body 体型数据
-   homeland 家园蓝图

#### 信息查询

-   exam 剑三考试
-   pvg 商贾奇才

## 说明

#### 页面运行边界

1. 当前只维护浏览器 Web 页面，不再提供小程序/App 专用页面分流。
2. QQBot 独立页面入口已经下线；普通详情页的 Bot 指令引导、管理员刷图任务和奇遇珍券刷新仍保留。
3. 修改 `vue.config.js` 中的多页面入口后需要重启 `npm run dev`，浏览器刷新不会重新加载入口配置。

#### 奇遇大全

1. 在 ipad-y 开始就不再显示返回列表（无界&游戏内会直接访问 pc 站）
2. 会根据 ua 判断，若环境较低，自动切换至 game 业务自动转化成就 ID
