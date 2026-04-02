<template>
    <div class="p-leap-main">
        <pc v-if="!mobile"></pc>
        <mobile v-else></mobile>
    </div>
</template>

<script>
import pc from "./leap/pc.vue";
import mobile from "./leap/mobile.vue";

export default {
    components: { pc, mobile },
    data() {
        return {};
    },
    computed: {
        mobile() {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = ["android", "iphone", "ipad", "ipod", "windows phone"];
            return mobileKeywords.some((keyword) => userAgent.includes(keyword));
        },
    },
    created() {},
    mounted() {},
    methods: {},
};
</script>

<style lang="less" scoped>
.p-leap-main {
    height: 100%;
}
</style>
