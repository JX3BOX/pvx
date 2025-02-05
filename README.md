# PVX项目v2

## 项目结构

```text
pvx/
├── public/               # 静态资源
│   └── index.html
├── src/                 # 源代码
│   ├── assets/         # 资源文件
│   │   ├── css/
│   │   └── img/
│   ├── components/     # 组件
│   ├── views/         # 页面
│   ├── pages/         # 多页面
│   ├── utils/         # 工具函数
│   ├── service/           # API接口
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
├── .gitignore         # Git忽略文件
├── package.json       # 项目配置
├── README.md          # 项目说明
└── vue.config.js      # VueCli配置

```

### 注意事项

pages里面的多页面用文件夹包裹，内含入口文件(index.js)，路由文件(router.js)以及状态管理文件(store.js)。


## 新增页面

1. `pages` 文件夹内新增相关页面文件
2. `vue.config.js` 新增 `pages options`
3. `views`, `assets/css /img` 都分好模块
