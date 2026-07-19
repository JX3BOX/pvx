<template>
    <div id="app">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange"></Nav>
        <Main
            :class="[navStatusClass, { 'c-pvx-modern-exam-main': isModernPage }]"
            :withoutRight="true"
            :withoutLeft="true"
            :withoutBread="true"
        >
            <div class="m-main">
                <router-view></router-view>
            </div>
            <PvxBacktop color="#fff" :bgColor="isModernPage ? '#5b5cf5' : '#07AD36'"></PvxBacktop>
        </Main>
        <CommonFooter></CommonFooter>
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
    computed: {
        isModernPage() {
            return ["index", "question", "paper"].includes(this.$route.name);
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
@import "~@/assets/css/exam/exam.less";
@import "~@/assets/css/modules/exam-shell-theme.less";
</style>
