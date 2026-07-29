<template>
    <div class="p-pvx-achievement">
        <CommonNav :forceShow="true"></CommonNav>
        <CommonHeader></CommonHeader>
        <div
            class="m-achievement-main"
            :class="{
                is_mobile: mobile,
                'c-pvx-modern-achievement-overview': $route.name === 'overview',
                'c-pvx-modern-achievement-compare': $route.name === 'compare',
                'c-pvx-modern-achievement-leap': $route.name === 'leap',
            }"
        >
            <SideBar v-if="!is_fold" />
            <div class="m-achievement-content" :class="{ is_mobile: mobile }">
                <router-view></router-view>
            </div>
        </div>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import CommonHeader from "@jx3box/jx3box-ui/src/CommonHeader.vue";
import SideBar from "@/components/wiki/sidebar.vue";
import CommonNav from "@/components/Nav_v5.vue";
export default {
    name: "WikiAchievementIndex",
    components: { SideBar, CommonHeader, CommonNav },
    data() {
        return {
            is_fold: false,
        };
    },
    computed: {
        mobile() {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = ["android", "iphone", "ipad", "ipod", "windows phone"];
            return mobileKeywords.some((keyword) => userAgent.includes(keyword));
        },
    },
    watch: {
        "$store.state.is_fold": {
            deep: true,
            immediate: true,
            handler(val) {
                this.is_fold = val;
            },
        },
    },
    methods: {},
    mounted() {},
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/wiki/index.less";
@import "~@/assets/css/modules/achievement-overview-theme.less";
@import "~@/assets/css/modules/achievement-compare-theme.less";
@import "~@/assets/css/modules/achievement-leap-theme.less";
</style>
