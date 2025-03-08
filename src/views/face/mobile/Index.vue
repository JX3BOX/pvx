<template>
    <div id="app" class="p-face-mobile">
        <Main :withoutRight="true" class="m-main-mobile">
            <keep-alive>
                <router-view v-if="$route.meta.keepAlive" />
            </keep-alive>
            <router-view v-if="!$route.meta.keepAlive" />
        </Main>
    </div>
</template>

<script>
export default {
    name: "App",
    props: [],
    components: {},
    data: function () {
        return {};
    },
    computed: {},
    methods: {},
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
.p-face-mobile {
    .m-main-mobile {
        padding: 0;
        min-height: 100vh;
    }
}
</style>
