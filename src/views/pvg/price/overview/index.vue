<template>
    <div class="p-price-overview">
        <div class="m-price-overview-header">
            <div class="u-title">走势速览</div>
            <div class="u-servers">
                <el-select v-model="server" placeholder="请选择" :default-first-option="true" @change="serverChange">
                    <div slot="prefix">区服价格</div>
                    <el-option v-for="server in serverList" :key="server" :label="server" :value="server"> </el-option>
                </el-select>
            </div>
        </div>
        <div class="m-price-overview-body">
            <goldCharts :server="server" v-if="server" />
            <goods ref="goods" :server="server" v-if="isZl && server" />
        </div>
    </div>
</template>
<script>
import server_cn from "@jx3box/jx3box-data/data/server/server_cn.json";
import server_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import { getUserInfo } from "@/service/pvg/price.js"; // 系统关注物品类型
import goods from "./goods.vue";
import goldCharts from "./goldCharts.vue";
import User from "@jx3box/jx3box-common/js/user";
export default {
    components: { goods, goldCharts },
    data() {
        return {
            server: "",
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        serverList() {
            return this.client == "std" ? server_cn : server_origin;
        },
        // 总览界面
        isZl() {
            return !this.$route.query?.tab;
        },
    },
    methods: {
        serverChange() {
            this.$nextTick(() => {
                this.$refs.goods.updatePrice();
            });
        },
    },
    created() {
        if (User.isLogin() && this.client == "std") {
            getUserInfo().then((res) => {
                this.server = res.data?.data?.jx3_server || "梦江南";
            });
        } else {
            this.server = this.client == "std" ? "梦江南" : "缘起稻香";
        }
    },
};
</script>
<style lang="less">
@import "~@/assets/css/pvg/price/overview.less";
</style>
