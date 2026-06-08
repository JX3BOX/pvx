<!--
 * QuestSection - 剑侠录模块主入口组件
 *
 * @description 剑侠录模块的根组件，整合左侧导航栏和右侧内容区
 * @version 1.0.0
 *
 * @components
 * - CommonHeader: 公共头部组件（全局注册）
 * - Nav: 导航栏组件
 * - Sidebar: 左侧导航栏组件（资料片和大章节列表）
 * - Content: 右侧内容区组件（章节详情展示）
 * - Main: 主内容区组件（全局注册）
 * - CommonFooter: 公共页脚组件（全局注册）
 *
 * @data-flow
 * - Sidebar 选择大章节后，触发 select 事件
 * - Index 接收事件，更新 selectedSeason 和 selectedChapter
 * - Content 接收数据，展示对应的章节详情
 * - 默认加载"风起稻香"第一个大章节的第一个小节
 *
 * @routes
 * - /questsection: 剑侠录列表页
 -->
<template>
    <div id="app" class="p-pvx-questsection">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange" class="p-nav"></Nav>
        <Main :class="navStatusClass" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
            <div class="m-main">
                <!-- 左侧导航栏：固定定位，展示资料片和大章节列表 -->
                <Sidebar @select="handleSelect" />

                <!-- 右侧内容区：自适应布局，展示章节详情 -->
                <Content
                    :seasonData="selectedSeason"
                    :chapterData="selectedChapter"
                    @section-change="handleSectionChange"
                />
            </div>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import Sidebar from "./Sidebar.vue";
import Content from "./Content.vue";

export default {
    name: "QuestsectionIndex",
    components: {
        Nav,
        Sidebar,
        Content,
    },
    data() {
        return {
            // 导航栏状态类名，用于控制布局
            navStatusClass: "is-regular",
            // 当前选中的资料片数据
            selectedSeason: null,
            // 当前选中的大章节数据（包含 sections 小节列表）
            selectedChapter: null,
        };
    },
    methods: {
        /**
         * 导航栏状态变化回调
         * @param {string} navStatusClass - 导航栏状态类名
         */
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },

        /**
         * 处理 Sidebar 选择大章节事件
         * @param {Object} data - 选择数据 { season, chapter }
         */
        handleSelect(data) {
            this.selectedSeason = data.season;
            this.selectedChapter = data.chapter;
        },

        /**
         * 处理 Content 小节切换事件
         * @param {Object} section - 小节数据
         */
        handleSectionChange(section) {
            // 小节切换时，可以在此处理额外逻辑（如记录浏览历史等）
            console.log("小节切换:", section?.szSectionName);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/miniprogram.less";
@import "~@/assets/css/questsection/index.less";

// 小程序端适配
.v-miniprogram {
    .m-main {
        padding: 0;
    }
}
</style>