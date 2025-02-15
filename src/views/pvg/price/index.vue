<template>
    <div class="p-price">
        <PriceTabs :params="params" @changeTab="changeTab"></PriceTabs>
        <overview v-if="params.currentTab == ''" />
        <gold v-if="params.currentTab == 'gold'" />
        <goods v-if="params.currentTab == 'goods'" :keywords="params.keywords" />
    </div>
</template>
<script>
import PriceTabs from "./PriceTabs.vue";
import overview from "./overview/index.vue";
import gold from "./gold/index.vue";
import goods from "./goods/index.vue";
export default {
    components: { PriceTabs, overview, gold, goods },
    data() {
        return {
            params: {
                currentTab: "", // 当前tab
                keywords: "", // 搜索关键词
            },
        };
    },

    methods: {
        changeTab(value) {
            const query = {};
            if (value) {
                query.tab = value;
            }
            this.$router.push({ query });
        },
    },
    mounted() {
        this.params.currentTab = this.$route.query.tab || "";
    }
};
</script>
<style lang="less">
@import "~@/assets/css/app.less";
.p-price {
    padding-top: 40px;
}
</style>
