import { ref, watch } from "vue";
import settings from "@/settings";

function normalizeHtmlLang(locale) {
    if (!locale) return "zh-CN";
    if (locale === "vi") return "vi";
    return String(locale);
}

function isMissingI18nValue(value, key) {
    if (value === undefined || value === null) return true;
    const str = String(value).trim();
    if (!str) return true;
    // vue-i18n 默认：找不到 key 会返回 key 本身
    return key ? str === String(key) : false;
}

function withSuffix(title) {
    // 注意：suffix 由业务侧在 settings.js 中定义，可能包含刻意的前后空格
    // 这里不要对 suffix 做 trim/replace，保持原样拼接
    const base = String(title || "").trim();
    const suffix = String(settings?.suffix ?? "");
    if (!base) return "";
    if (!suffix) return base;
    if (base.endsWith(suffix)) return base;
    return `${base}${suffix}`;
}

function buildHeadObjFromRoute(to, i18n) {
    if (!to) return;
    if (!i18n || !i18n.global || typeof i18n.global.t !== "function") return;

    const locale =
        i18n.global.locale && typeof i18n.global.locale === "object" && "value" in i18n.global.locale
            ? i18n.global.locale.value
            : i18n.global.locale;

    const htmlLang = normalizeHtmlLang(locale);

    const i18nMeta = to.meta && to.meta.i18n ? to.meta.i18n : null;

    const rawTitleKey = i18nMeta && i18nMeta.title ? i18nMeta.title : "";
    const rawKeywordsKey = i18nMeta && i18nMeta.keywords ? i18nMeta.keywords : "";
    const rawDescriptionKey = i18nMeta && i18nMeta.description ? i18nMeta.description : "";

    const rawTitle = rawTitleKey ? i18n.global.t(rawTitleKey) : "";
    const rawKeywords = rawKeywordsKey ? i18n.global.t(rawKeywordsKey) : "";
    const rawDescription = rawDescriptionKey ? i18n.global.t(rawDescriptionKey) : "";

    const title = isMissingI18nValue(rawTitle, rawTitleKey) ? settings?.title : rawTitle;
    const keywords = isMissingI18nValue(rawKeywords, rawKeywordsKey) ? settings?.keywords : rawKeywords;
    const description = isMissingI18nValue(rawDescription, rawDescriptionKey) ? settings?.description : rawDescription;

    const meta = [];
    if (keywords) meta.push({ name: "keywords", content: String(keywords) });
    if (description) meta.push({ name: "description", content: String(description) });

    return {
        title: withSuffix(title) || undefined,
        htmlAttrs: { lang: htmlLang },
        meta,
    };
}

export function initRouterI18nHead(router, i18n, head) {
    if (!router || !i18n || !head || typeof head.addHeadObjs !== "function") return;

    const headObjRef = ref({
        title: undefined,
        htmlAttrs: undefined,
        meta: [],
    });
    head.addHeadObjs(headObjRef);

    router.afterEach((to) => {
        headObjRef.value = buildHeadObjFromRoute(to, i18n) || headObjRef.value;
        head.updateDOM();
    });

    // 语言切换不会触发路由变化，额外监听 locale 变化后重刷当前路由 head
    const localeRef = i18n.global && i18n.global.locale;
    if (localeRef && typeof localeRef === "object" && "value" in localeRef) {
        watch(
            () => localeRef.value,
            () => {
                headObjRef.value = buildHeadObjFromRoute(router.currentRoute.value, i18n) || headObjRef.value;
                head.updateDOM();
            }
        );
    }

    // 首次进入时也补一遍（避免首屏 title 没被覆盖）
    headObjRef.value = buildHeadObjFromRoute(router.currentRoute.value, i18n) || headObjRef.value;
    head.updateDOM();
}
