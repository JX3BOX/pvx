<template>
    <div class="p-price-gold">
        <div class="m-price-gold-header">
            <div class="u-title">金价走势</div>
            <div class="u-servers">
                <el-select v-model="server" placeholder="请选择" :default-first-option="true" @change="serverChange">
                    <div slot="prefix">区服价格</div>
                    <el-option v-for="server in serverList" :key="server" :label="server" :value="server"> </el-option>
                </el-select>
            </div>
        </div>
        <div class="m-price-gold-body">
            <goldChart ref="chart" :server="server" v-if="server"></goldChart>
        </div>
    </div>
</template>
<script>
import server_cn from "@jx3box/jx3box-data/data/server/server_cn.json";
import server_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import goldChart from "./goldChart.vue";
import User from "@jx3box/jx3box-common/js/user";
import { getUserInfo } from "@/service/pvg/price.js"; // 系统关注物品类型
export default {
    components: { goldChart },
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
    },
    methods: {
        serverChange() {
            this.$refs.chart.setOption();
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
.p-price-gold {
    .pr;
    .pt(20px);
    * {
        box-sizing: border-box;
    }
    .m-price-gold-header {
        display: flex;
        align-items: center;
        gap: 20px;
        .u-title {
            margin: 20px 0 20px 0;
            color: #24292e;
            font-size: 32px;
            font-weight: bold;
            line-height: 42px;
        }
        .u-servers {
            position: relative;
            width: 200px;
            background-color: #fff;
            border-radius: 40px;
            .el-input__prefix {
                display: flex;
                align-items: center;
                padding-left: 15px;
                color: #949494;
                font-size: 16px;
                font-weight: bold;
                line-height: 40px;
            }

            .el-input__inner {
                height: 40px;
                padding-left: 100px;
                color: #24292e;
                font-size: 16px;
                font-weight: bold;
                line-height: 40px;
                border: none;
                border-radius: 40px;
            }
        }
    }
    .m-price-gold-body {
        width: 100%;
    }
}
@media screen and (max-width: @ipad) {
    .p-price-gold {
        .m-price-gold-header {
            flex-wrap: wrap;
            margin-bottom: 20px;
            .u-title {
                margin: 0;
                font-size: 24px;
            }
        }
    }
}
@media screen and (max-width: @phone) {
    .p-price-gold {
        .pt(64px);
    }
}
</style>
