<template>
    <div id="app" class="p-pvx-pet">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange"></Nav>
        <Main
            :class="[
                navStatusClass,
                {
                    'c-pvx-modern-pet-list-main': $route.name === 'list',
                    'c-pvx-modern-pet-single-main': $route.name === 'single',
                },
            ]"
            :withoutRight="true"
            :withoutLeft="true"
            :withoutBread="true"
        >
            <div class="m-main">
                <router-view v-slot="{ Component }">
                    <keep-alive include="PetList">
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </div>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import { __imgPath, __dataPath } from "@/utils/config";
export default {
    name: "Pet",
    provide: {
        __imgRoot: __imgPath + "pet/",
        __dataRoot: __dataPath + "pvx/",
    },
    data: function () {
        return {
            navStatusClass: "is-regular",
        };
    },
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
</style>
