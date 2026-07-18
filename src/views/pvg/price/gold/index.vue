<template>
    <div class="p-price-gold">
        <PvxSurface class="m-pvx-price__section" padding="medium">
            <PvxSectionHeader
                class="m-pvx-price__section-header"
                :title="$t('pages.pvg.price.ui.sections.gold.title')"
                :description="$t('pages.pvg.price.ui.sections.gold.description')"
            >
                <template #icon><TrendCharts /></template>
            </PvxSectionHeader>
            <goldChart ref="chart" :server="server" v-if="server"></goldChart>
        </PvxSurface>
    </div>
</template>
<script>
import goldChart from "./goldChart.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { TrendCharts } from "@element-plus/icons-vue";
export default {
    name: "PriceGold",
    props: {
        server: { type: String, default: "" },
    },
    components: { goldChart, PvxSectionHeader, PvxSurface, TrendCharts },
    watch: {
        server() {
            this.$nextTick(() => this.$refs.chart?.setOption());
        },
    },
};
</script>
