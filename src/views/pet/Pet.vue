<template>
    <div id="app" class="p-pet">
        <Header></Header>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true">
            <div class="m-main">
                <keep-alive include="PetList">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import { __imgPath, __dataPath } from "@/utils/config";
export default {
    name: "Pet",
    provide: {
        __imgRoot: __imgPath + "pet/",
        __dataRoot: __dataPath + "pvx/",
    },
    data: function () {
        return {
            navStatusClass: "is-regular",
        };
    },
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
