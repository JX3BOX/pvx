<template>
    <div class="p-homeland">
        <div class="m-homeland-tabs m-common-tabs">
            <a
                href="javascript:;"
                class="u-tab"
                :class="active === item.value && 'active'"
                v-for="item in tabs"
                :key="item.value"
                @click="onTabClick(item.value)"
                >{{ item.label }}
            </a>
            <a href="https://gdca.xoyo.com/jx3/blueprint/index.html" class="u-tab" target="_blank">免费蓝图</a>
            <a href="https://gdca.xoyo.com/jx3/blueprint/index.html?" class="u-tab" target="_blank">付费蓝图</a>
            <a href="https://jx3.seasunwbl.com/buyer?t=blueprint" class="u-tab" target="_blank">藏品蓝图</a>
        </div>
        <div class="m-homeland-content">
            <!-- 家园信息 -->
            <Tutorial v-if="active === 0"></Tutorial>
            <!-- 家园地图 -->
            <Maps v-if="active === 1"></Maps>
            <!-- 家园花价 -->
            <Flower v-if="active === 2"></Flower>
            <!-- 家园攻略 -->
            <Bbs v-if="active === 3"></Bbs>
        </div>
    </div>
</template>

<script>
import Tutorial from "./Tutorial.vue";
import Maps from "./Maps.vue";
import Flower from "./Flower.vue";
import Bbs from "./Bbs.vue";
export default {
    name: "Index",
    components: {
        Tutorial,
        Maps,
        Flower,
        Bbs,
    },
    data() {
        return {
            active: 0,
            tabs: [
                {
                    label: "家园信息",
                    value: 0,
                },
                {
                    label: "家园地图",
                    value: 1,
                },
                // {
                //     label: "家园花价",
                //     value: 2,
                // },
                {
                    label: "家园攻略",
                    value: 3,
                },
            ],
        };
    },
    methods: {
        toTip() {
            return this.$message({
                type: "warning",
                message: "即将上线，敬请期待！",
            });
        },
        onTabClick(val) {
            if (val == 3) {
                window.open("/community?category=心得&page=1", "_self");
                return;
            }
            this.active = val;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/tabs.less";
@import "~@/assets/css/homeland/index.less";
.m-homeland-tabs {
    .u-tab {
        &.active,
        &:hover {
            background-color: @homelandColor;
        }
    }
}
@media screen and (max-width: @phone) {
    .p-homeland .m-common-tabs.m-homeland-tabs {
        justify-content: flex-start;
        .u-tab {
            .fz(14px);
            width: calc(33% - 6px);
        }
    }
}
</style>
