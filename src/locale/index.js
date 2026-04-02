function loadLocaleModules() {
    // 约定：src/locale/<locale>/<module>.js
    // 例：src/locale/zh-CN/index.js  -> messages["zh-CN"].index
    //     src/locale/zh-CN/pages.js  -> messages["zh-CN"].pages
    //
    // 说明：
    // - 目前只收集“locale 目录下一层”的 .js 文件（不递归更深层级）
    // - 新增模块时只要添加文件即可，无需改这里
    const messages = {};

    // webpack require.context：Vue CLI / webpack5 可用
    // key 示例：./zh-CN/index.js
    // 注意：第二个参数必须为 true 才会扫描子目录，否则会导致业务词条完全无法加载
    const ctx = require.context("./", true, /^\.\/[^/]+\/[^/]+\.js$/);

    ctx.keys().forEach((key) => {
        const matched = key.match(/^\.\/([^/]+)\/([^/]+)\.js$/);
        if (!matched) return;

        const locale = matched[1];
        const moduleName = matched[2];
        if (!locale || !moduleName) return;

        const mod = ctx(key);
        const value = (mod && mod.default) || mod;
        if (!value) return;

        if (!messages[locale]) messages[locale] = {};
        messages[locale][moduleName] = value;
    });

    return messages;
}

export const APP_I18N_MESSAGES = loadLocaleModules();

export function mergeAppLocaleMessages(i18n) {
    if (!i18n || !i18n.global || typeof i18n.global.mergeLocaleMessage !== "function") return;
    Object.entries(APP_I18N_MESSAGES).forEach(([locale, message]) => {
        i18n.global.mergeLocaleMessage(locale, message);
    });
}
