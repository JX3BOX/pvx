<template>
    <div class="v-homeland-parse"></div>
</template>

<script>
import Nav from "@/components/Nav.vue";
import { getAppIcon } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "App",
    props: [],
    data: function () {
        return {
        };
    },
    computed: {},
    methods: { getAppIcon },
    components: {
        Nav,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
</style>
