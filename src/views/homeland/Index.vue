<template>
    <PvxPageShell class="p-homeland p-pvx-homeland-root">
        <div class="m-pvx-homeland-layout">
            <PvxSurface class="m-pvx-homeland-hero" padding="large">
                <PvxSectionHeader
                    title="家园蓝图"
                    description="家园信息、地图工具与蓝图资源的一站式入口"
                    level="h1"
                >
                    <template #icon><House /></template>
                    <template #action><span class="u-homeland-badge">家园工具箱</span></template>
                </PvxSectionHeader>

                <nav class="m-pvx-homeland-nav" aria-label="家园功能导航">
                    <button
                        type="button"
                        class="u-homeland-nav-item"
                        :class="{ 'is-active': active === 'info' }"
                        @click="selectSection('info')"
                    >
                        <span class="u-icon"><InfoFilled /></span>
                        <span><b>家园信息</b><small>日常活动与升级数据</small></span>
                    </button>
                    <button
                        type="button"
                        class="u-homeland-nav-item"
                        :class="{ 'is-active': active === 'map' }"
                        @click="selectSection('map')"
                    >
                        <span class="u-icon"><MapLocation /></span>
                        <span><b>家园地图</b><small>查看地图与房屋信息</small></span>
                    </button>
                    <a class="u-homeland-nav-item" href="/community?category=心得&page=1">
                        <span class="u-icon"><Reading /></span>
                        <span><b>家园攻略</b><small>前往社区浏览心得</small></span>
                        <TopRight class="u-external-icon" />
                    </a>
                </nav>
            </PvxSurface>

            <PvxSurface class="m-pvx-homeland-blueprints" padding="large">
                <PvxSectionHeader title="蓝图广场" description="按资源类型快速前往对应的蓝图平台">
                    <template #icon><Grid /></template>
                </PvxSectionHeader>
                <div class="m-pvx-blueprint-grid">
                    <a
                        v-for="item in blueprintEntries"
                        :key="item.key"
                        class="u-pvx-blueprint-card"
                        :class="`is-${item.key}`"
                        :href="item.link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span class="u-icon"><component :is="item.icon" /></span>
                        <span class="u-content">
                            <b>{{ item.title }}</b>
                            <small>{{ item.description }}</small>
                        </span>
                        <span class="u-external">外部站点 <TopRight /></span>
                    </a>
                </div>
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
    Grid,
    House,
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

export default {
    name: "Index",
    components: {
        Tutorial,
        Maps,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        CollectionTag,
        Grid,
        House,
        InfoFilled,
        MapLocation,
        Present,
        Reading,
        TopRight,
        Wallet,
    },
    data() {
        return {
            active: "info",
        };
    },
    computed: {
        blueprintEntries() {
            return [
                {
                    key: "free",
                    title: "免费蓝图",
                    description: "浏览官方平台公开分享的家园蓝图",
                    link: EXTERNAL_LINKS.free_blueprint,
                    icon: "Present",
                },
                {
                    key: "paid",
                    title: "付费蓝图",
                    description: "查看官方平台的付费精品蓝图",
                    link: EXTERNAL_LINKS.paid_blueprint,
                    icon: "Wallet",
                },
                {
                    key: "collection",
                    title: "藏品蓝图",
                    description: "前往万宝楼查找家园藏品蓝图",
                    link: EXTERNAL_LINKS.collection_blueprint,
                    icon: "CollectionTag",
                },
            ];
        },
    },
    methods: {
        selectSection(section) {
            this.active = section;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/index.less";
@import "~@/assets/css/modules/homeland-theme.less";
</style>
