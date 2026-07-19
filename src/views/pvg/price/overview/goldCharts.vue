<template>
  <div class="m-price-overview-gold-charts">
    <list-cross :list="currentDataList" :radius="0" v-if="currentDataList.length">
      <template v-slot="data">
        <dataPlane :item="data.item" />
      </template>
    </list-cross>
  </div>
</template>
<script>
import dataPlane from "./dataPlane.vue";
import ListCross from "@/components/ListCross.vue";
import { getGoldPriceData } from "@/service/pvg/price.js";

export default {
    props: { server: {} },
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
            const server = this.server;
            const channelMap = this.goldPriceData[server];
            if (!channelMap) return [];
            let list = [];
            for (const key in channelMap) {
                const data = channelMap[key];
                if (!Array.isArray(data) || data.length < 3) continue;
                const lastDay = data[data.length - 1]?.average?.toFixed(2) || 0;
                const yesterday = data[data.length - 2]?.average?.toFixed(2) || 0;
                const beforeYesterday = data[data.length - 3]?.average?.toFixed(2) || 0;
                const sum = data.reduce((total, item) => total + (item?.average || 0), 0);
                let recommend;
                if (key === "DD373") {
                    recommend = ((+lastDay + +yesterday + +beforeYesterday) / 0.9405 / 3).toFixed(2);
                } else {
                    recommend = ((+lastDay + +yesterday + +beforeYesterday) / 3).toFixed(2);
                }
                const newItem = {
                    name: key === "WBL" ? this.$t("pages.pvg.price.ui.chart.channels.wbl") : key,
                    key,
                    recommend,
                    sum,
                    lastDay,
                    yesterday,
                    beforeYesterday,
                    data,
                };
                list.push(newItem);
            }
            list = list.sort((a, b) => b.sum - a.sum);
            return list;
        },
    },
    methods: {
        getData() {
            this.loading = true;
            getGoldPriceData()
                .then((res) => {
                    if (res.data && typeof res.data === 'object') {
                        this.goldPriceData = res.data;
                    } else {
                        this.goldPriceData = {};
                    }
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
