<template>
    <PvxPageShell class="p-price p-pvx-price">
        <div class="m-pvx-price__layout">
            <PvxSurface class="m-pvx-price__hero" padding="medium">
                <PvxSectionHeader
                    class="m-pvx-price__header"
                    :title="$t('pages.pvg.price.ui.title')"
                    :description="$t('pages.pvg.price.ui.description')"
                    level="h1"
                >
                    <template #icon><TrendCharts /></template>
                    <template #action>
                        <el-select
                            v-model="server"
                            class="u-price-server-select"
                            :placeholder="$t('pages.pvg.price.ui.serverPlaceholder')"
                            :default-first-option="true"
                        >
                            <el-option
                                v-for="item in serverList"
                                :key="item"
                                :label="item"
                                :value="item"
                            />
                        </el-select>
                    </template>
                </PvxSectionHeader>
            </PvxSurface>

            <PriceTabs v-model:params="params" @changeTab="changeTab" />

            <overview v-if="params.currentTab === ''" :server="server" />
            <gold v-else-if="params.currentTab === 'gold'" :server="server" />
            <goods v-else-if="params.currentTab === 'goods'" :keywords="params.keywords" :server="server" />
        </div>
    </PvxPageShell>
</template>
<script>
import PriceTabs from "./PriceTabs.vue";
import overview from "./overview/index.vue";
import gold from "./gold/index.vue";
import goods from "./goods/index.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { TrendCharts } from "@element-plus/icons-vue";
import server_cn from "@jx3box/jx3box-data/data/server/server_cn.json";
import server_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import User from "@jx3box/jx3box-common/js/user";
import { getUserInfo } from "@/service/pvg/price.js";
export default {
    name: "PriceIndex",
    components: {
        PriceTabs,
        overview,
        gold,
        goods,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        TrendCharts,
    },
    data() {
        return {
            params: {
                currentTab: "", // 当前tab
                keywords: "", // 搜索关键词
            },
            server: "",
        };
    },

    computed: {
        client() {
            return this.$store.state.client;
        },
        serverList() {
            return this.client === "std" ? server_cn : server_origin;
        },
    },

    methods: {
        changeTab(value) {
            const query = {};
            if (value) {
                query.tab = value;
            }
            this.$router.push({ query });
        },
        async initializeServer() {
            const defaultServer = this.client === "std" ? "梦江南" : "缘起稻香";
            if (!User.isLogin() || this.client !== "std") {
                this.server = defaultServer;
                return;
            }
            try {
                const res = await getUserInfo();
                this.server = res.data?.data?.jx3_server || defaultServer;
            } catch (error) {
                this.server = defaultServer;
            }
        },
    },
    watch: {
        "$route.query.tab"(value) {
            this.params.currentTab = value || "";
        },
        client() {
            this.initializeServer();
        },
    },
    created() {
        this.params.currentTab = this.$route.query.tab || "";
        this.initializeServer();
    },
};
</script>
<style lang="less">
@import "~@/assets/css/modules/price-theme.less";
</style>
