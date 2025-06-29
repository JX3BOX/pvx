<template>
    <div id="app" class="p-adventure">
        <Header></Header>
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true">
            <div class="m-main">
                <keep-alive include="adventureList">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import { __imgPath, __dataPath } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    name: "App",
    provide: {
        __imgRoot: __imgPath + "adventure/",
        __dataRoot: __dataPath + "pvx/",
        __imgPath,
    },
    data: function () {
        return {
            navStatusClass: "is-regular",
        };
    },
    mounted() {},
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

<style lang="less">
.c-header-inner {
    height: 100%;
    .c-header-search {
        height: 100%;
        margin: 0;
        .c-search {
            height: 100%;
        }
        .u-form {
            .flex;
            align-items: center;
            height: 100%;
        }
        .u-btn {
            top: calc(50% - 10px);
            .flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>
