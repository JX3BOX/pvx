<template>
    <div class="m-pvx-reputation-item" @click="go(item.dwForceID)" v-if="!item.bHide">
        <template v-if="!isMiniProgram">
            <div class="u-pvx-reputation-icon">
                <img v-if="getReputationIcon(item.szIconPath)" :src="getReputationIcon(item.szIconPath)" />
                <div v-else class="u-pvx-reputation-no-img"></div>
            </div>
        </template>
        <template v-else>
            <div class="u-pvx-reputation-icon--miniprogram">
                {{ item.szName.slice(0, 1) }}
            </div>
        </template>
        <div class="m-pvx-reputation-name">
            <div class="u-pvx-reputation-name">{{ item.szName }}</div>
            <div v-if="!isMiniProgram" class="u-pvx-reputation-progress">
                <div class="u-pvx-reputation-progress-value"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
import { wxNewPage } from "@/utils/minprogram";
import { getReputationIcon } from "@/utils/reputation";

export default {
    name: "ReputationItem",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            isMiniProgram: isMiniProgram() || isApp(),
        };
    },
    methods: {
        getReputationIcon,
        go(id) {
            if (this.isMiniProgram) {
                wxNewPage(`/reputation/${id}`);
            } else {
                window.open(`/reputation/${id}`, "_self");
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/reputation_item.less";
</style>
