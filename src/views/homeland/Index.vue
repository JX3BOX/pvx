<template>
    <PvxPageShell class="p-homeland p-pvx-homeland-root">
        <div class="m-pvx-homeland-layout">
            <PvxSurface class="m-pvx-homeland-hero" padding="large">
                <PvxSectionHeader
                    class="m-pvx-homeland-header"
                    :title="$t('pages.homeland.ui.title')"
                    :description="$t('pages.homeland.ui.description')"
                    level="h1"
                >
                    <template #icon><HomeFilled /></template>
                    <template #action><span class="u-homeland-badge">{{ $t("pages.homeland.ui.toolkit") }}</span></template>
                </PvxSectionHeader>

                <nav class="m-pvx-homeland-nav" :aria-label="$t('pages.homeland.ui.navigationLabel')">
                    <button
                        type="button"
                        class="u-homeland-nav-item"
                        :class="{ 'is-active': active === 'info' }"
                        :title="$t('pages.homeland.ui.tabs.info')"
                        @click="selectSection('info')"
                    >
                        <span class="u-icon"><InfoFilled /></span>
                        <b>{{ $t("pages.homeland.ui.tabs.info") }}</b>
                    </button>
                    <button
                        type="button"
                        class="u-homeland-nav-item"
                        :class="{ 'is-active': active === 'map' }"
                        :title="$t('pages.homeland.ui.tabs.map')"
                        @click="selectSection('map')"
                    >
                        <span class="u-icon"><MapLocation /></span>
                        <b>{{ $t("pages.homeland.ui.tabs.map") }}</b>
                    </button>
                    <a
                        class="u-homeland-nav-item"
                        href="/community?title=家园"
                        :title="$t('pages.homeland.ui.tabs.guide')"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span class="u-icon"><Reading /></span>
                        <b>{{ $t("pages.homeland.ui.tabs.guide") }}</b>
                        <TopRight class="u-external-icon" />
                    </a>
                    <a
                        v-for="item in blueprintEntries"
                        :key="item.key"
                        class="u-homeland-nav-item u-homeland-nav-item--blueprint"
                        :class="`is-${item.key}`"
                        :href="item.link"
                        :title="item.title"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span class="u-icon"><component :is="item.icon" /></span>
                        <b>{{ item.title }}</b>
                        <TopRight class="u-external-icon" />
                    </a>
                </nav>
            </PvxSurface>

            <PvxSurface class="m-homeland-content" padding="large">
                <!-- 家园信息 -->
                <Tutorial v-if="active === 'info'"></Tutorial>
                <!-- 家园地图 -->
                <Maps v-if="active === 'map'"></Maps>
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
/**
 * @description 家园模块首页
 * @description 展示家园信息、地图、攻略和蓝图资源的入口页面
 * @author ymg
 * @version 1.1.0
 * 
 * @example
 * <Index />
 * 
 * @notes
 * - 使用独立功能导航切换家园信息与地图
 * - 家园攻略保留社区入口
 * - 免费、付费和藏品蓝图使用带外链标识的入口卡
 */
import Tutorial from "./Tutorial.vue";
import Maps from "./Maps.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import {
    CollectionTag,
    HomeFilled,
    InfoFilled,
    MapLocation,
    Present,
    Reading,
    TopRight,
    Wallet,
} from "@element-plus/icons-vue";

// 外部链接配置
const EXTERNAL_LINKS = {
    free_blueprint: "https://gdca.xoyo.com/jx3/blueprint/index.html",
    paid_blueprint: "https://gdca.xoyo.com/jx3/blueprint/index.html?",
    collection_blueprint: "https://jx3.seasunwbl.com/buyer?t=blueprint",
};

const HOMELAND_TABS = ["info", "map"];

export default {
    name: "Index",
    components: {
        Tutorial,
        Maps,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        CollectionTag,
        HomeFilled,
        InfoFilled,
        MapLocation,
        Present,
        Reading,
        TopRight,
        Wallet,
    },
    computed: {
        active() {
            const tab = this.$route.query.tab;
            return HOMELAND_TABS.includes(tab) ? tab : "info";
        },
        blueprintEntries() {
            return [
                {
                    key: "free",
                    title: this.$t("pages.homeland.ui.tabs.freeBlueprint"),
                    link: EXTERNAL_LINKS.free_blueprint,
                    icon: "Present",
                },
                {
                    key: "paid",
                    title: this.$t("pages.homeland.ui.tabs.paidBlueprint"),
                    link: EXTERNAL_LINKS.paid_blueprint,
                    icon: "Wallet",
                },
                {
                    key: "collection",
                    title: this.$t("pages.homeland.ui.tabs.collectionBlueprint"),
                    link: EXTERNAL_LINKS.collection_blueprint,
                    icon: "CollectionTag",
                },
            ];
        },
    },
    methods: {
        selectSection(section) {
            if (!HOMELAND_TABS.includes(section) || this.$route.query.tab === section) return;

            this.$router.replace({
                query: {
                    ...this.$route.query,
                    tab: section,
                },
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/index.less";
@import "~@/assets/css/modules/homeland-theme.less";
</style>
