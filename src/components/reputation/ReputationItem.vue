<template>
    <div class="m-pvx-reputation-item" @click="go(item.dwForceID)" v-if="!item.bHide">
        <div class="u-pvx-reputation-icon">
            <img v-if="getReputationIcon(item.szIconPath)" :src="getReputationIcon(item.szIconPath)" />
            <div v-else class="u-pvx-reputation-no-img"></div>
        </div>
        <div class="m-pvx-reputation-name">
            <div class="u-pvx-reputation-name">{{ item.szName }}</div>
            <div class="u-pvx-reputation-progress">
                <div class="u-pvx-reputation-progress-value"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { getReputationIcon } from "@/utils/reputation";

export default {
    name: "ReputationItem",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    methods: {
        getReputationIcon,
        go(id) {
            window.open(`/reputation/${id}`, "_self");
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/reputation_item.less";
</style>
