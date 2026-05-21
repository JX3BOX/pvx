<template>
    <div class="m-pvx-reputation-item" @click="go(item.dwForceID)" v-if="!item.bHide">
        <div class="u-pvx-reputation-icon--miniprogram">
            {{ item.szName.slice(0, 1) }}
        </div>
        <div class="m-pvx-reputation-name">
            <div class="u-pvx-reputation-name">{{ item.szName }}</div>
            <div class="u-pvx-reputation-desc--miniprogram">{{ descText }}</div>
        </div>
    </div>
</template>

<script>
import { wxNewPage } from "@/utils/minprogram";

export default {
    name: "ReputationItemMiniprogram",
    props: {
        item: { type: Object, required: true },
    },
    computed: {
        descText() {
            return (this.item.szDesc || "").replace(/\\n/g, "");
        },
    },
    methods: {
        go(id) {
            wxNewPage(`/reputation/${id}`);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/miniprogram/reputation-item.less";
</style>
