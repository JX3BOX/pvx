<template>
    <CommonToolbar search color="#d16400" :active="active" :types="body_types" @update="updateToolbar">
        <a class="u-jump" href="/adventure/treasure" slot="append">奇遇珍卷</a>
    </CommonToolbar>
</template>

<script>
import CommonToolbar from "@/components/common/toolbar.vue";
export default {
    name: "tabs",
    components: { CommonToolbar },
    props: ["body_types", "active"],
    data: function () {
        return {
            name: "",
            type: "",
        };
    },
    computed: {
        params() {
            const _params = {};
            if (this.name) {
                _params.name = this.name;
            }
            if (this.type) {
                _params.type = this.type;
            }
            return _params;
        },
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        //切换数据
        clickTabs(value) {
            this.$emit("setActive", value);
        },
        updateToolbar(data) {
            const { type, search } = data;
            this.name = search;
            this.type = type;
            this.clickTabs(type);
        },
    },
    watch: {
        params: {
            deep: true,
            immediate: true,
            handler: function (obj) {
                this.$emit("change", obj);
            },
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/tabs.less";
</style>
