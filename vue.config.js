const pages = {
    // 含首页、奇遇珍卷、资历宝典
    index: {
        title: "休闲栏目",
        entry: "src/main.js",
        template: "public/index.html",
        filename: "index.html",
    },

    face: {
        title: "捏脸数据",
        entry: "src/pages/face/index.js",
        template: "public/index.html",
        filename: "face/index.html",
    },
    body: {
        title: "体型数据",
        entry: "src/pages/body/index.js",
        template: "public/index.html",
        filename: "body/index.html",
    },
    homeland: {
        title: "家园蓝图",
        entry: "src/pages/homeland/index.js",
        template: "public/index.html",
        filename: "homeland/index.html",
    },

    adventure: {
        title: "奇遇大全",
        entry: "src/pages/adventure/index.js",
        template: "public/index.html",
        filename: "adventure/index.html",
    },
    pet: {
        title: "宠物大全",
        entry: "src/pages/pet/index.js",
        template: "public/index.html",
        filename: "pet/index.html",
    },
    horse: {
        title: "坐骑大全",
        entry: "src/pages/horse/index.js",
        template: "public/index.html",
        filename: "horse/index.html",
    },
    furniture: {
        title: "家具大全",
        entry: "src/pages/furniture/index.js",
        template: "public/index.html",
        filename: "furniture/index.html",
    },
    reputation: {
        title: "声望大全",
        entry: "src/pages/reputation/index.js",
        template: "public/index.html",
        filename: "reputation/index.html",
    },
    book: {
        title: "书籍大全",
        entry: "src/pages/book/index.js",
        template: "public/index.html",
        filename: "book/index.html",
    },

    exam: {
        title: "剑三考试 - JX3BOX",
        entry: "src/pages/exam/index.js",
        template: "public/index.html",
        filename: "exam/index.html",
    },
    pvg: {
        title: "商贾奇才 - JX3BOX",
        entry: "src/pages/pvg/index.js",
        template: "public/index.html",
        filename: "pvg/index.html",
    },
    qqbot: {
        title: "QQBot PVX",
        entry: "src/pages/qqbot/index.js",
        template: "public/index.html",
        filename: "qqbot/index.html",
    },
};

const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const commonDomains = require("@jx3box/jx3box-common/data/jx3box.json");

module.exports = {
    productionSourceMap: false,
    //❤️ define path for static files ~
    publicPath: process.env.BUILD_PREVIEW
        ? "/" + process.env.APP_NAME
        : process.env.NODE_ENV === "development"
        ? "/"
        : process.env.STATIC_PATH + "/" + process.env.APP_NAME,

    //🌈多页面配置，详见 https://cli.vuejs.org/zh/config/#pages
    pages: pages,

    //⚛️ Proxy ~
    devServer: {
        host: "localhost",
        // 与 @jx3box/jx3box-common/js/api.js 对齐：
        // 本地开发开启 `VUE_APP_PROXY_ENABLE=1` 后，会把请求 baseURL 切到 `${VUE_APP_PROXY_PREFIX}/${serviceKey}`
        proxy: buildEnvProxy(),
        // 多页面 + vue-router history 模式：直接打开 `/pvg/manufacture` 这类地址时，
        // 需要回退到对应页面的 `index.html`，否则 Express 会返回 `Cannot GET ...` 404
        historyApiFallback: {
            disableDotRule: true,
            rewrites: buildHistoryApiFallbackRewrites(pages),
        },
        allowedHosts: "all",
        port: process.env.DEV_PORT || 12028,
    },

    // 依赖包（element-plus/theme-chalk 等）会输出大量 Sass deprecation 警告
    // 这些不是运行错误，开启 quietDeps 让它们不刷屏（只保留项目自身的警告）
    css: {
        loaderOptions: {
            sass: {
                sassOptions: {
                    quietDeps: true,
                },
            },
            scss: {
                sassOptions: {
                    quietDeps: true,
                },
            },
        },
    },

    // 过滤依赖包里的已知兼容性 warning（不影响运行，但会刷屏）
    configureWebpack: {
        stats: {
            warningsFilter: [/node_modules[\\\\/]+@jx3box[\\\\/]+jx3box-common[\\\\/]+/],
        },
        plugins: [
            new webpack.DefinePlugin({
                // 全局注入，用于 JS 或其他代码中
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
            }),
        ],
    },

    //❤️ Webpack configuration
    chainWebpack: (config) => {
        //💝 in-line small imgs ~
        config.module.rule("images").set("parser", {
            dataUrlCondition: {
                maxSize: 4 * 1024, // 4KiB
            },
        });

        // 💝 quick svg ~
        config.module
            .rule("svg")
            .exclude.add(path.join(__dirname, "src/assets/img/icon")) // 排除自定义svg目录
            .end();
        config.module
            .rule("icons") // 新规则
            .test(/\.svg$/)
            .include.add(path.join(__dirname, "src/assets/img/icon")) // 新规则应用于我们存放svg的目录
            .end()
            .use("svg-sprite-loader") // 用sprite-loader接卸
            .loader("svg-sprite-loader")
            .options({
                symbolId: "icon-[name]",
            })
            .end();

        //💝 in-line svg imgs ~
        config.module.rule("vue").use("vue-svg-inline-loader").loader("vue-svg-inline-loader");

        //💖 import common less var * mixin ~
        const types = ["vue-modules", "vue", "normal-modules", "normal"];
        types.forEach((type) => addStyleResource(config.module.rule("less").oneOf(type)));

        config.externals = {
            tinyMCE: "tinyMCE",
        };
    },
};

// 注入全局样式资源（变量、mixin 等）
// 本地css/var.less、mixin.less会覆盖node_modules里的同名文件，方便定制化
// 注意此类文件都是变量和mixin函数，不要写全局样式，否则可能会被重复注入多次
function addStyleResource(rule) {
    const preload_styles = [
        path.resolve(__dirname, "./node_modules/@jx3box/jx3box-common/css/var.less"),
        path.resolve(__dirname, "./node_modules/@jx3box/jx3box-common/css/mixin.less"),
        // 本项目自定义变量/混入（路径在 src 下）
        path.resolve(__dirname, "./src/assets/css/var.less"),
        path.resolve(__dirname, "./src/assets/css/mixin.less"),
        path.resolve(__dirname, "./node_modules/csslab/base.less"),
    ].filter((p) => fs.existsSync(p));
    rule.use("style-resource").loader("style-resources-loader").options({
        patterns: preload_styles,
    });
}

function normalizeTarget(value) {
    if (!value) return "";
    const trimmed = String(value).trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed.replace(/^\/+/, "")}`;
}

function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildEnvProxy() {
    const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
    if (nodeEnv && nodeEnv !== "development") return {};

    // Vue CLI 加载 .env 的时机/覆盖关系可能导致这里读不到或读到意外值：
    // - 明确设置为 false 才禁用
    // - 未设置/无法读取时，仍然生成代理（仅在 devServer 生效）
    const rawEnabled = String(process.env.VUE_APP_PROXY_ENABLE || "").toLowerCase();
    const disabled = ["0", "false", "no", "off"].includes(rawEnabled);
    if (disabled) return {};

    const prefix = process.env.VUE_APP_PROXY_PREFIX || "/__proxy";
    const mk = (serviceKey, target) => {
        const normalized = normalizeTarget(target);
        if (!normalized) return {};
        const context = `${prefix}/${serviceKey}`;
        const contextRe = new RegExp(`^${escapeRegExp(context)}`);
        return {
            [context]: {
                target: normalized,
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: "",
                pathRewrite: (p) => p.replace(contextRe, ""),
                onProxyReq: (request) => {
                    // 本地开发时避免把 localhost 的来源头转发给上游，
                    // 某些支付/会员接口会直接按 Origin/Referer 拒绝请求。
                    request.setHeader("origin", "");
                    request.setHeader("referer", "");
                },
            },
        };
    };

    const serviceTargets = {
        cms: process.env.VUE_APP_CMS_API || commonDomains.__cms,
        next: process.env.VUE_APP_NEXT_API || commonDomains.__next,
        team: process.env.VUE_APP_TEAM_API || commonDomains.__team,
        pay: process.env.VUE_APP_PAY_API || commonDomains.__pay,
        lua: process.env.VUE_APP_LUA_API || commonDomains.__lua,
        node: process.env.VUE_APP_NODE_API || commonDomains.__node,
        helper: process.env.VUE_APP_HELPER_API || commonDomains.__helperUrl,
        pull: process.env.VUE_APP_PULL_API || commonDomains.__pull,
    };

    return Object.keys(serviceTargets).reduce((acc, key) => Object.assign(acc, mk(key, serviceTargets[key])), {});
}

function buildHistoryApiFallbackRewrites(pages) {
    // 主站入口（index）在本项目里实际挂在 `/pvx/`（见 `src/router/index.js`）
    const rewrites = [{ from: /^\/pvx(?:\/.*)?$/, to: "/index.html" }];

    // 其他子应用：`/<pageName>/...` -> `/<pageName>/index.html`
    Object.keys(pages || {})
        .filter((name) => name && name !== "index")
        .forEach((name) => {
            rewrites.push({
                from: new RegExp(`^/${escapeRegExp(name)}(?:/.*)?$`),
                to: `/${name}/index.html`,
            });
        });

    return rewrites;
}
