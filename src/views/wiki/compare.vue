<template>
    <div class="p-compare-main">
        <pc v-if="!mobile"></pc>
        <mobile v-else></mobile>
    </div>
</template>

<script>
import pc from "./compare/pc.vue";
import mobile from "./compare/mobile.vue";

export default {
    components: { pc, mobile },
    data() {
        return {};
    },
    computed: {
        mobile() {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = ["android", "iphone", "ipad", "ipod", "windows phone"];
console.log(userAgent,mobileKeywords)
            console.log(mobileKeywords.some((keyword) => userAgent.includes(keyword)));
            return mobileKeywords.some((keyword) => userAgent.includes(keyword));
        },
    },
    created() { },
    mounted() { },
    methods: {},
};
</script>

<style lang="less">
.p-compare-main {
    height: calc(100vh - 60px);
    overflow: hidden;
}
</style>
