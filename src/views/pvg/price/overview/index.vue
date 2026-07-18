<template>
    <div class="p-price-overview">
        <PvxSurface class="m-pvx-price__section" padding="medium">
            <PvxSectionHeader
                class="m-pvx-price__section-header"
                :title="$t('pages.pvg.price.ui.sections.overview.title')"
                :description="$t('pages.pvg.price.ui.sections.overview.description')"
            >
                <template #icon><Coin /></template>
            </PvxSectionHeader>
            <goldCharts :server="server" v-if="server" />
        </PvxSurface>
        <goods ref="goods" :server="server" v-if="isZl && server" />
    </div>
</template>
<script>
import goods from "./goods.vue";
import goldCharts from "./goldCharts.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { Coin } from "@element-plus/icons-vue";
export default {
    name: "PriceOverview",
    props: {
        server: { type: String, default: "" },
    },
    components: { goods, goldCharts, PvxSectionHeader, PvxSurface, Coin },
    computed: {
        // 总览界面
        isZl() {
            return !this.$route.query?.tab;
        },
    },
};
</script>
