<template>
    <div id="app">
        <Header></Header>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true">
            <div class="m-main m-pvg-main">
                <router-view></router-view>
            </div>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
export default {
    name: "Index",
    components: {
        Nav,
    },
    data: function () {
        return {
            navStatusClass: "is-regular",
        };
    },
    computed: {
        slug: function () {
            return this.$route.name;
        },
        name: function () {
            return this.$route.meta.name;
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
