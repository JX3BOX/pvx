<template>
    <div id="app">
        <Header></Header>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true">
            <div class="m-main">
                <router-view></router-view>
            </div>
            <PvxBacktop color="#fff" bgColor="#07AD36"></PvxBacktop>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";

export default {
    name: "Exam",
    components: { Nav, PvxBacktop },
    data() {
        return {
            navStatusClass: "is-regular",
        };
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
@import "~@/assets/css/exam/exam.less";
</style>
