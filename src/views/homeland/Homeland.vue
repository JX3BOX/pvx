<template>
    <div id="app">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
            <div class="m-main">
                <router-view></router-view>
            </div>
            <PvxBacktop color="#fff" bgColor="#6b52ff"></PvxBacktop>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
/**
 * @description 家园模块主入口组件
 * @description 作为家园模块的根容器，负责布局框架和全局依赖注入
 * @author ymg
 * @version 1.0.0
 * 
 * @notes
 * - 通过 provide 向子组件注入图片和数据根路径
 * - __imgRoot: 家园模块图片资源路径前缀
 * - __dataRoot: PVX 数据接口路径前缀
 * - 监听导航状态变化，动态调整布局样式
 */
import Nav from "@/components/Nav_v5.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";
import { __imgPath, __dataPath } from "@/utils/config";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "Homeland",
    components: { Nav, PvxBacktop },
    props: [],
    provide: {
        __imgRoot: __imgPath + "homeland/",
        __dataRoot: __dataPath + "pvx/",
    },
    data: function () {
        return {
            navStatusClass: "is-regular",
        };
    },
    computed: {},
    methods: {
        isMiniProgram,
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/app.less";
</style>
