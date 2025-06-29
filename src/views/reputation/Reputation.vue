<template>
    <div id="app">
        <Header></Header>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true">
            <div class="m-main">
                <router-view></router-view>
            </div>
            <PvxBacktop color="#fff" bgColor="#d16400"></PvxBacktop>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";
export default {
    name: "Reputation",
    data: () => ({
        navStatusClass: "is-regular",
    }),
    components: { Nav, PvxBacktop },
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
@import "~@/assets/css/reputation/reputation_miniprogram.less";
@import "~@/assets/css/miniprogram.less";
</style>
<style lang="less">
.c-header-inner {
    height: 100%;
    .c-header-search {
        .u-text {
            position: absolute;
            left: 0;
            top: 0;
        }
        .u-btn {
            top: -7px;
        }
    }
}
</style>
