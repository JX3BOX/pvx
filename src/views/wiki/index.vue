<script>
import CommonHeader from "@jx3box/jx3box-ui/src/CommonHeader.vue";
import CommonNav from "@/components/Nav_v5.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";
import AchievementWorkbenchNav from "@/components/wiki/AchievementWorkbenchNav.vue";

export default {
    name: "WikiAchievementIndex",
    components: {
        AchievementWorkbenchNav,
        CommonHeader,
        CommonNav,
        PvxBacktop,
    },
    computed: {
        showWorkbenchNav() {
            return this.$route.meta.workbenchPrimary === true;
        },
    },
};
</script>

<template>
    <div class="p-pvx-achievement p-achievement-workbench">
        <CommonNav :forceShow="true" />
        <CommonHeader />

        <main class="m-achievement-main c-achievement-workbench">
            <div class="m-achievement-workbench-shell" :class="{ 'is-subpage': !showWorkbenchNav }">
                <AchievementWorkbenchNav v-if="showWorkbenchNav" />
                <section class="m-achievement-content m-achievement-workbench-content">
                    <router-view />
                </section>
            </div>
        </main>

        <PvxBacktop color="#fff" bgColor="#47777d" />
        <CommonFooter />
    </div>
</template>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/modules/achievement-workbench.less";
</style>
