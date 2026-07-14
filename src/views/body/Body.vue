<!--
 * Body - 体型模块主入口组件
 * 
 * @description 体型模块的根组件，包含导航栏、主内容区和页脚
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 响应式导航栏状态管理
 * - 支持小程序和APP端判断
 * - 支持正式服和怀旧服切换
 * 
 * @components
 * - CommonHeader: 公共头部组件
 * - Nav: 导航栏组件
 * - Main: 主内容区组件
 * - CommonFooter: 公共页脚组件
 * 
 * @routes
 * - /body: 体型列表页
 * - /body/:id: 体型详情页
 * - /body/parse: 体型解析页
 -->
<template>
    <div id="app">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="[navStatusClass, { 'c-pvx-modern-list-main': $route.name === 'list' }]" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
            <div class="m-main"><router-view></router-view></div>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
import { __OriginRoot } from "@/utils/config";
export default {
    name: "Body",
    components: { Nav },
    data: function () {
        return { navStatusClass: "is-regular" };
    },
    computed: {
        client() {
            return location.href.includes("origin") ? "origin" : "std";
        },
    },
    methods: {
        isMiniProgram,
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },
    },
    created() {
        if (this.client !== "std") window.open(`${__OriginRoot}pvx`, "_self");
    },
};
</script>
<style lang="less">
    @import "~@/assets/css/app.less";

    .v-miniprogram {
        .m-main {
            padding: 0;
        }
    }
</style>
