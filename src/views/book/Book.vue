<template>
    <div id="app">
        <Header></Header>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true">
            <div class="m-main">
                <router-view></router-view>
            </div>
            <PvxBacktop color="#fff" :bgColor="bgColor"></PvxBacktop>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";

import { mapState } from "vuex";

export default {
    name: "Book",
    components: { Nav, PvxBacktop },
    data() {
        return {
            navStatusClass: "is-regular",
        };
    },
    computed: {
        ...mapState(["currentBookType"]),
        bgColor() {
            let bgColor = "#d16400";
            const profession = this.currentBookType;
            switch (profession) {
                // 佛学
                case 9:
                    bgColor = "#947d2e";
                    break;
                //道学
                case 10:
                    bgColor = "#194372";
                    break;
                // 杂集
                case 11:
                    bgColor = "#324148";
                    break;
                default:
                    bgColor = "#d16400";
            }
            return bgColor;
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
@import "~@/assets/css/book/book.less";
@import "~@/assets/css/miniprogram.less";
</style>
