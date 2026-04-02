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
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import { __imgPath, __dataPath } from "@/utils/config";
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
        };
    },
    mounted() { },
    computed: {},
    methods: {
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
