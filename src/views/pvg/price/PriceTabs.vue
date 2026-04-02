<template>
    <div class="m-price-tabs m-common-tabs">
        <template v-for="(tab, index) in tabs" :key="index">
            <div class="u-tab" @click="changeTab(tab)" :class="{ active: params.currentTab == tab.value }">
                {{ tab.label }}
            </div>
        </template>

        <div class="u-search">
            <el-input
                v-if="params.currentTab != 'gold'"
                :model-value="params.keywords"
                @update:modelValue="updateKeywords"
                placeholder="请输入"
                class="u-search-input"
            >
                <template #suffix>
                    <el-icon class="el-input__icon">
                        <Search />
                    </el-icon>
                </template>
            </el-input>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        params: { type: Object, required: true },
    },
    emits: ["update:params", "changeTab"],
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
    methods: {
        changeTab(tab) {
            this.$emit("update:params", { ...this.params, currentTab: tab.value });
            this.$emit("changeTab", tab.value);
        },
        updateKeywords(val) {
            if (val === this.params.keywords) return;
            const next = { ...this.params, keywords: val };
            if (this.params.currentTab === "" && val) {
                next.currentTab = "goods";
            }
            this.$emit("update:params", next);
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
    .u-search {
        .u-search-input {
            .el-input__wrapper {
                box-shadow: none;
                .r(30px);
            }
            input {
                background-color: #fff;
            }
        }
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
