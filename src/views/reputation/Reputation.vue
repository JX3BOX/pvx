<template>
    <div id="app">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange"></Nav>
        <Main
            :class="[
                navStatusClass,
                {
                    'c-pvx-modern-reputation-list-main': isModernWeb && $route.name === 'reputation',
                    'c-pvx-modern-reputation-single-main': isModernWeb && $route.name === 'single',
                },
            ]"
            :withoutRight="true"
            :withoutLeft="true"
            :withoutBread="true"
        >
            <div class="m-main">
                <router-view></router-view>
            </div>
            <PvxBacktop color="#fff" :bgColor="isModernWeb ? '#5b5cf5' : '#d16400'"></PvxBacktop>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "Reputation",
    data: () => ({
        navStatusClass: "is-regular",
    }),
    components: { Nav, PvxBacktop },
    computed: {
        isModernWeb() {
            return !isMiniProgram() && !isApp();
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
@import "~@/assets/css/reputation/reputation.less";
</style>
