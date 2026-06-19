<template>
    <div class="p-adventure">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
            <div class="m-main">
                <router-view v-slot="{ Component }">
                    <keep-alive include="adventureList">
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </div>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import { getSerendipityAchievementId } from "@/service/adventure/adventure";
import { __imgPath, __dataPath } from "@/utils/config";


// ⚠️ 请不要删除
// 以下处理奇遇详情页对游戏内嵌的适配
// PC：在低版本 Chrome 中跳转到经典页面（用于PC游戏插件拉起）
// 无界：在游戏内嵌 WebView 中跳转到无界专属页面（用于游戏内嵌拉起）
const LEGACY_CHROME_MAX_VERSION = 76;
const LEGACY_PAGE_URL = "https://page.j3cx.com/";
const MOBILE_GAME_PAGE_URL = "https://www.jx3box.com/wujie/cj/view/";

export default {
    name: "App",
    provide: {
        __imgRoot: __imgPath + "adventure/",
        __dataRoot: __dataPath + "pvx/",
        __imgPath,
    },
    data: function () {
        return {
            navStatusClass: "is-regular",
            isRedirectingLegacyPage: false,
        };
    },
    watch: {
        $route: {
            immediate: true,
            handler() {
                this.redirectLegacyChromeAdventure();
            },
        },
    },
    mounted() { },
    computed: {},
    methods: {
        getChromeVersion() {
            if (typeof window === "undefined" || !window.navigator) return null;
            const ua = window.navigator.userAgent || "";
            const matched = ua.match(/Chrome\/(\d+)/i);
            if (!matched) return null;
            return Number(matched[1]);
        },
        isLegacyChrome() {
            const chromeVersion = this.getChromeVersion();
            return Number.isFinite(chromeVersion) && chromeVersion <= LEGACY_CHROME_MAX_VERSION;
        },
        isMobileGameWebView() {
            if (typeof window === "undefined" || !window.navigator) return false;

            const ua = window.navigator.userAgent || "";
            const isAndroidWebView = /Android/i.test(ua) && /;\s*wv\)/i.test(ua);
            const isIPhoneWebView = /iPhone/i.test(ua) && !/Safari\//i.test(ua);

            return isAndroidWebView || isIPhoneWebView;
        },
        isAdventureDetailRoute() {
            return this.$route?.name === "single" && !!this.$route?.params?.id;
        },
        shouldUseClassicPage() {
            if (typeof window === "undefined") return false;

            const hostname = window.location.hostname || "";
            const searchParams = new URLSearchParams(window.location.search || "");
            const client = String(searchParams.get("client") || "").toLowerCase();

            return hostname.includes("origin") || client.includes("origin");
        },
        buildLegacyPageUrl(achievementId) {
            // 构建经典页面 URL，携带必要的查询参数
            const target = new URL(LEGACY_PAGE_URL);
            target.searchParams.set("type", "achievement");
            target.searchParams.set("id", achievementId);

            if (this.shouldUseClassicPage()) {
                target.searchParams.set("L", "classic_yq");
            }

            return target.toString();
        },
        buildMobileGamePageUrl(achievementId) {
            return `${MOBILE_GAME_PAGE_URL}${achievementId}`;
        },
        async redirectLegacyChromeAdventure() {
            if (this.isRedirectingLegacyPage) return;
            if (!this.isAdventureDetailRoute()) return;

            const shouldRedirectToMobileGamePage = this.isMobileGameWebView();
            const shouldRedirectToLegacyPage = this.isLegacyChrome();
            if (!shouldRedirectToMobileGamePage && !shouldRedirectToLegacyPage) return;

            const adventureId = this.$route.params.id;
            if (!adventureId) return;

            this.isRedirectingLegacyPage = true;

            try {
                const res = await getSerendipityAchievementId(adventureId, {
                    client: this.$store.state.client,
                });
                const achievementId = res.data?.achievement_id;
                if (!achievementId) return;

                const targetUrl = shouldRedirectToMobileGamePage
                    ? this.buildMobileGamePageUrl(achievementId)
                    : this.buildLegacyPageUrl(achievementId);
                window.location.replace(targetUrl);
            } catch (error) {
                console.error("低版本 Chrome 奇遇页跳转失败", error);
            } finally {
                this.isRedirectingLegacyPage = false;
            }
        },
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },
    },
    components: { Nav },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/miniprogram.less";
</style>
