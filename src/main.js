// 1.Create APP
import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App);

// 2.Router
import router from "./router";
app.use(router);

// 3.Store
import store from "./store";
app.use(store);

// 4.Components
import { createHead } from "@vueuse/head";
const head = createHead();
app.use(head);

// 5.i18n
import { createJx3boxUiI18n, getJx3boxUiAvailableLocales } from "@jx3box/jx3box-ui";
import { mergeAppLocaleMessages } from "@/locale";
import { initRouterI18nHead } from "@/router/i18n-head";
const __langKey = (localStorage.getItem("lang") || "zh-cn").toLowerCase();
const __langMap = {
    "zh-cn": "zh-CN",
    "en-us": "en-US",
    "zh-tw": "zh-TW",
    vi: "vi",
};
const __preferredI18nLocale = __langMap[__langKey] || "zh-CN";
const __supportedI18nLocales = getJx3boxUiAvailableLocales();
const __i18nLocale = __supportedI18nLocales.includes(__preferredI18nLocale) ? __preferredI18nLocale : "zh-CN";

// 安装 JX3BOX-UI 的 i18n（提供 $t，避免 $jx3boxT 渲染期访问未定义的 $t 产生大量 warning）
const __i18n = createJx3boxUiI18n({ locale: __i18nLocale });
mergeAppLocaleMessages(__i18n);
// UI 包内部存在大量缺失 key 的情况（不影响功能），关闭 warning 避免刷屏
__i18n.global.missingWarn = false;
__i18n.global.fallbackWarn = false;
app.use(__i18n);

// 根据路由 meta 自动更新 title/keywords/description（同时支持语言切换）
initRouterI18nHead(router, __i18n, head);

// 6.UI

// 6.1 JX3BOX UI
import "@jx3box/jx3box-common/css/normalize.css";
import "@jx3box/jx3box-common/css/font.css";
import { install as JX3BOX_UI } from "@jx3box/jx3box-ui";
app.use(JX3BOX_UI);

// 6.2 Element Plus
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import zhTw from "element-plus/es/locale/lang/zh-tw";
import vi from "element-plus/es/locale/lang/vi";
import "element-plus/dist/index.css";
import "@jx3box/jx3box-common/css/element-plus-theme.scss";
import "@jx3box/jx3box-common/css/element-fonticon.css";

const __elementLocaleMap = {
    "zh-CN": zhCn,
    "en-US": en,
    "zh-TW": zhTw,
    vi,
};
const __elementLocale = __elementLocaleMap[__i18nLocale] || zhCn;
app.use(ElementPlus, {
    locale: __elementLocale,
});
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 6.3 Tailwind
import "@/assets/css/tailwind.css";

// 7. 其它扩展


// Final.Mount DOM
app.mount("#app");
