<template>
    <div id="app">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
            <div
                class="m-main m-pvg-main"
                :class="{
                    'is-modern-gonggao-main': isModernGonggao,
                    'is-modern-price-main': isModernPrice,
                }"
            >
                <router-view></router-view>
            </div>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import { isApp, isMiniProgram } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "Index",
    components: {
        Nav,
    },
    data: function () {
        return {
            navStatusClass: "is-regular",
            isPriceMiniApp: isMiniProgram() || isApp(),
        };
    },
    computed: {
        slug: function () {
            return this.$route.name;
        },
        name: function () {
            return this.$route.meta.name;
        },
        isModernGonggao() {
            return ["daily", "calendar", "server"].includes(this.$route.name);
        },
        isModernPrice() {
            return this.$route.name === "price" && !this.isPriceMiniApp;
        },
    },
    methods: {
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
</style>
