const path = require("path");
const pkg = require("./package.json");
const { JX3BOX, SEO } = require("@jx3box/jx3box-common");
const commonDomains = require("@jx3box/jx3box-common/data/jx3box.json");

module.exports = {
    // map
    productionSourceMap: false,
    lintOnSave: false,
    //❤️ Multiple pages ~
    pages: {
        index: {
            title: "休闲栏目",
            entry: "src/pages/index/index.js",
            template: "public/index.html",
            filename: "index.html",
        },
        adventure: {
            title: "奇遇大全",
            entry: "src/pages/adventure/index.js",
            template: "public/index.html",
            filename: "adventure/index.html",
        },
        pvg: {
            title: "商贾奇才 - JX3BOX",
            entry: "src/pages/pvg/index.js",
            template: "public/index.html",
            filename: "pvg/index.html",
        },
        reputation: {
            title: "声望大全",
            entry: "src/pages/reputation/index.js",
            template: "public/index.html",
            filename: "reputation/index.html",
        },
        book: {
            title: "书籍大全 - JX3BOX",
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
        pet: {
            title: "宠物大全 - JX3BOX",
            entry: "src/pages/pet/index.js",
            template: "public/index.html",
            filename: "pet/index.html",
        },
        furniture: {
            title: "家具大全 - JX3BOX",
            entry: "src/pages/furniture/index.js",
            template: "public/index.html",
            filename: "furniture/index.html",
        },
        horse: {
            title: "坐骑大全 - JX3BOX",
            entry: "src/pages/horse/index.js",
            template: "public/index.html",
            filename: "horse/index.html",
        },
        homeland: {
            title: "家园蓝图 - JX3BOX",
            entry: "src/pages/homeland/index.js",
            template: "public/index.html",
            filename: "homeland/index.html",
        },
        qqbot: {
            title: "QQRobot - JX3BOX",
            entry: "src/pages/qqbot/index.js",
            template: "public/index.html",
            filename: "qqbot/index.html",
        },
    },

    //⚛️ Proxy ~
    devServer: {
        host: "localhost",
        // 与 @jx3box/jx3box-common/js/api.js 对齐：
        // 本地开发开启 `VUE_APP_PROXY_ENABLE=1` 后，会把请求 baseURL 切到 `${VUE_APP_PROXY_PREFIX}/${serviceKey}`
        proxy: buildEnvProxy(),
        allowedHosts: "all",
        port: process.env.DEV_PORT || 12028,
    },

    outputDir: process.env["BUILD_MODE"] == "preview" ? path.resolve(__dirname, pkg.name) : "dist", // 指定构建输出的目录

    //❤️ define path for static files ~
    publicPath:
        //FOR Localhost => development
        (process.env.NODE_ENV === "development" && "/") ||
        //BY relative path
        (process.env.BUILD_MODE === "preview" && `/${pkg.name}/`) ||
        //BY origin
        (process.env.STATIC_PATH === "origin" && `${JX3BOX.__staticPath["origin"]}${pkg.name}/`) ||
        //BY github
        (process.env.STATIC_PATH === "github" && `${JX3BOX.__staticPath["github"]}${pkg.name}/`) ||
        //BY jsdelivr
        (process.env.STATIC_PATH === "jsdelivr" && `${JX3BOX.__staticPath["jsdelivr"]}${pkg.name}@gh-pages/`) ||
        //BY OSS=>CDN
        (process.env.STATIC_PATH === "mirror" && `${JX3BOX.__staticPath["mirror"]}${pkg.name}/`) ||
        //BY relative path
        (process.env.STATIC_PATH === "repo" && `/${pkg.name}/`) ||
        //BY root path or bind a domain
        (process.env.STATIC_PATH == "root" && "/") ||
        //for lost
        "/",
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
    chainWebpack: (config) => {
        //💘 html-webpack-plugin ~
        // Multiple pages disable the block below
        // config.plugin("html").tap((args) => {
        //     args[0].meta = {
        //         //------设置SEO信息
        //         Keywords: Setting.keys,
        //         Description: Setting.desc,
        //     };
        //     args[0].title = Setting.title + SEO.title; //------自动添加标题后缀
        //     return args;
        // });

        //💝 in-line small imgs ~
        config.module.rule("images").set("parser", {
            dataUrlCondition: {
                maxSize: 10 * 1024,
            },
        });

        //💝 in-line svg imgs ~
        config.module.rule("vue").use("vue-svg-inline-loader").loader("vue-svg-inline-loader");

        //💖 import common less var * mixin ~
        const types = ["vue-modules", "vue", "normal-modules", "normal"];
        var preload_styles = [];
        preload_styles.push(
            path.resolve(__dirname, "./node_modules/@jx3box/jx3box-common/css/var.less"),
            path.resolve(__dirname, "./node_modules/@jx3box/jx3box-common/css/mixin.less"),
            path.resolve(__dirname, "./src/assets/css/mixin.less"),
            path.resolve(__dirname, "./src/assets/css/var.less"),
            path.resolve(__dirname, "./node_modules/csslab/base.less")
        );
        function addStyleResource(rule) {
            rule.use("style-resource").loader("style-resources-loader").options({
                patterns: preload_styles,
            });
        }
        types.forEach((type) => addStyleResource(config.module.rule("less").oneOf(type)));

        config.externals = {
            tinyMCE: "tinyMCE",
        };
    },
};

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
                // API 代理不需要 websocket，避免给 dev server 叠加 upgrade 监听器
                ws: false,
                cookieDomainRewrite: "",
                pathRewrite: (p) => p.replace(contextRe, ""),
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
    };

    return Object.keys(serviceTargets).reduce((acc, key) => Object.assign(acc, mk(key, serviceTargets[key])), {});
}
