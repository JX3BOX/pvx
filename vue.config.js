const path = require("path");
const pkg = require("./package.json");
const { JX3BOX, SEO } = require("@jx3box/jx3box-common");
const VueProxyPlugin = require("@jx3box/jx3box-fe-proxy");

module.exports = {
    // map
    productionSourceMap: false,
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

    //❤️ Proxy ~
    devServer: {
        proxy: {
            ...VueProxyPlugin.generateBuiltinProxy(),
            // 专门为直接的 /api/next2/ 路径配置代理到 dev.next2.jx3box.com
            "/api/next2": {
                target: "https://dev.next2.jx3box.com",
                changeOrigin: true,
                pathRewrite: {
                    "^/api/next2": "/api/next2",
                },
                onProxyReq: function (request) {
                    request.setHeader("origin", "");
                },
            },
            "/api/summary-any": {
                target: "https://dev.next2.jx3box.com",
                changeOrigin: true,
                pathRewrite: {
                    "^/api/next2": "/api/next2",
                },
                onProxyReq: function (request) {
                    request.setHeader("origin", "");
                },
            },
        },
        disableHostCheck: true,
        port: process.env["DEV_PORT"] || 12028, // 默认端口
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
    transpileDependencies: [
        "htmlparser2",
        "cheerio",
        "dom-serializer",
        "domelementtype",
        "domhandler",
        "domutils",
        "entities",
        "parse5",
        "parse5-htmlparser2-tree-adapter",
    ],
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
        config.module
            .rule("images")
            .use("url-loader")
            .loader("url-loader")
            .tap((options) => Object.assign(options, { limit: 10240, esModule: false }));

        //💝 in-line svg imgs ~
        config.module.rule("vue").use("vue-svg-inline-loader").loader("vue-svg-inline-loader");

        //💖 import common less var * mixin ~
        const types = ["vue-modules", "vue", "normal-modules", "normal"];
        var preload_styles = [];
        preload_styles.push(
            path.resolve(__dirname, "./node_modules/csslab/base.less"),
            path.resolve(__dirname, "./node_modules/@jx3box/jx3box-common/css/var.less"),
            path.resolve(__dirname, "./src/assets/css/var.less")
        );
        function addStyleResource(rule) {
            rule.use("style-resource").loader("style-resources-loader").options({
                patterns: preload_styles,
            });
        }
        types.forEach((type) => addStyleResource(config.module.rule("less").oneOf(type)));
    },
};
