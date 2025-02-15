<template>
    <div class="m-price-tabs m-common-tabs">
        <template v-for="(tab, index) in tabs">
            <div :key="index" class="u-tab" @click="changeTab(tab)" :class="{ active: params.currentTab == tab.value }">
                {{ tab.label }}
            </div>
        </template>

        <div class="u-search">
            <el-input
                v-if="params.currentTab != 'gold'"
                v-model="params.keywords"
                placeholder="请输入"
                suffix-icon="el-icon-search"
                class="u-search-input"
            />
        </div>
    </div>
</template>
<script>
export default {
    props: {
        params: {},
    },
    data() {
        return {
            tabs: [
                {
                    label: "总览",
                    value: "",
                },
                {
                    label: "金价",
                    value: "gold",
                },
                {
                    label: "物价",
                    value: "goods",
                },
            ],
        };
    },
    watch: {
        // 监听搜索条件变化
        "params.keywords": {
            handler: function (val, oldVal) {
                if (this.params.currentTab === "") {
                    this.params.currentTab = "goods";
                }
            },
            deep: true,
        },
    },
    methods: {
        changeTab(tab) {
            this.params.currentTab = tab.value;
            this.$emit("changeTab", tab.value);
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/common/tabs.less";
.m-price-tabs {
    .u-tab {
        &.active,
        &:hover {
            background-color: @activeColor;
        }
    }
    .u-search .u-search-input input {
        background-color: #fff;
    }
}
@media screen and(max-width:@phone) {
    .m-price-tabs {
        flex-direction: row;
        gap: 10px;
        box-sizing: border-box;
        flex-wrap: wrap;
        padding: 10px 15px;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
    }
}
</style>
