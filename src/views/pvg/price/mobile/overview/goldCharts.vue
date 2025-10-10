<template>
    <div class="m-price-overview-gold-charts">
        <list-cross :list="currentDataList" :radius="0" v-if="currentDataList.length">
            <template v-slot="data">
                <dataPlane :item="data.item" v-if="!active ? data.item.key === 'WBL' : true" />
            </template>
        </list-cross>
    </div>
</template>
<script>
import dataPlane from "./dataPlane.vue";
import ListCross from "@/components/ListCross.vue";
import { getGoldPriceData } from "@/service/pvg/price.js";

export default {
    props: {
        server: {
            type: String,
            default: "",
        },
        active: {
            type: String,
            default: "",
        },
    },
    components: {
        ListCross,
        dataPlane,
    },
    data() {
        return {
            goldPriceData: {},
            loading: false,
        };
    },
    computed: {
        // 当前渠道列表
        currentDataList() {
            const server = this.server; // 当前服务器
            const channelMap = this.goldPriceData[server];
            let list = [];
            for (const key in channelMap) {
                const data = channelMap[key];
                const lastDay = data[data.length - 1].average.toFixed(2);
                const yesterday = data[data.length - 2]?.average?.toFixed(2) || 0;
                const beforeYesterday = data[data.length - 3]?.average?.toFixed(2) || 0;
                const sum = data.reduce((total, item) => total + item.average, 0);
                let recommend;
                if (key === "DD373") {
                    recommend = ((+lastDay + +yesterday + +beforeYesterday) / 0.9405 / 3).toFixed(2);
                } else {
                    recommend = ((+lastDay + +yesterday + +beforeYesterday) / 3).toFixed(2);
                }
                const newItem = {
                    name: key === "WBL" ? "万宝楼" : key,
                    key,
                    recommend,
                    sum,
                    lastDay,
                    yesterday,
                    beforeYesterday,
                    data,
                    isActive: this.active === key,
                };
                list.push(newItem);
            }
            list = list.sort((a, b) => b.sum - a.sum);
            return list;
        },
    },
    watch: {
        active: {
            handler(newVal) {
                // 当active值变化时，重新计算currentDataList
                this.$forceUpdate();
            },
            immediate: true,
        },
    },
    methods: {
        getData() {
            this.loading = true;
            getGoldPriceData()
                .then((res) => {
                    this.goldPriceData = res.data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    mounted() {
        this.getData();
    },
};
</script>
<style lang="less" scoped>
.m-price-overview-gold-charts {
    /deep/.list {
        display: block;
        .item {
            margin-right: 0 !important;
            margin-top: 0 !important;
            &:not(:first-child) {
                .mt(20px);
                .u-data-plane{
                    margin-top: 20px;
                }
            }
        }
    }

    :deep(.active) {
        border: 2px solid #409eff;
        box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
    }
}
</style>
