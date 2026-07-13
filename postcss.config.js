module.exports = {
    // 全局样式只做浏览器前缀处理；Tailwind 在 vue.config.js 中仅对
    // src/assets/css/tailwind.css 单独启用，避免污染 Less 的增量编译缓存。
    plugins: [require("autoprefixer")],
};
