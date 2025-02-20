<template>
    <div id="app">
        <Header></Header>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true">
            <div class="m-main"><router-view></router-view></div>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import { __OriginRoot } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    name: "Body",
    components: { Nav },
    data: function () {
        return { navStatusClass: "is-regular" };
    },
    computed: {
        client() {
            return location.href.includes("origin") ? "origin" : "std";
        },
    },
    methods: {
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },
    },
    created() {
        if (this.client !== "std") window.open(`${__OriginRoot}pvx`, "_self");
    },
};
</script>
<style lang="less">
@import "~@/assets/css/app.less";
</style>
