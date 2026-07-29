<template>
    <div id="app">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange"></Nav>
        <Main
            :class="[
                navStatusClass,
                {
                    'c-pvx-modern-horse-list-main': $route.name === 'index',
                    'c-pvx-modern-horse-single-main': $route.name === 'single',
                },
            ]"
            :withoutRight="true"
            :withoutLeft="true"
            :withoutBread="true"
        >
            <div class="m-main">
                <router-view></router-view>
            </div>
            <PvxBacktop color="#fff" bgColor="#5b5cf5"></PvxBacktop>
        </Main>
        <CommonFooter></CommonFooter>

    </div>

</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";
import { __imgPath, __dataPath } from "@/utils/config";
export default {
    name: "Horse",
    provide: {
        __imgRoot: __imgPath + "homeland/",
        __imgRoot2: __imgPath + "horse/",
        __dataRoot: __dataPath + "pvx/",
    },
    data: function () {
        return {
            navStatusClass: "is-regular",
        };
    },
    methods: {
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },
    },
    components: { Nav, PvxBacktop },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/horse/pc/index.less";
</style>
