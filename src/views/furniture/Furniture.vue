<template>
    <div id="app">
        <CommonHeader></CommonHeader>
        <!-- <Breadcrumb name="家具大全" slug="furniture" root="/furniture" :feedbackEnable="true" :crumbEnable="false">
            <img slot="logo" svg-inline :src="getAppIcon('furniture')" />
        </Breadcrumb> -->
        <Nav @statusChange="statusChange"></Nav>
        <Main :class="navStatusClass" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
            <div class="m-main">
                <router-view v-slot="{ Component }">
                    <keep-alive include="FurnitureList">
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </div>
            <!-- <Footer></Footer> -->
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
// import { getAppIcon } from "@jx3box/jx3box-common/js/utils";
import { __imgPath, __dataPath } from "@/utils/config";
export default {
    name: "Furniture",
    props: [],
    data: function () {
        return {
            navStatusClass: "is-regular",
        };
    },
    provide: {
        __imgRoot: __imgPath + "homeland/",
        __dataRoot: __dataPath + "pvx/",
    },
    computed: {},
    methods: {
        // getAppIcon,
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },
    },
    components: { Nav },
};
</script>

<style lang="less">
    @import "~@/assets/css/app.less";
</style>
