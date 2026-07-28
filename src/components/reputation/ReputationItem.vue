<template>
    <article
        v-if="!item.bHide"
        class="m-pvx-reputation-item"
        :class="{ 'm-pvx-reputation-item--modern': variant === 'modern' }"
        role="link"
        tabindex="0"
        @click="go(item.dwForceID)"
        @keydown.enter="go(item.dwForceID)"
        @keydown.space.prevent="go(item.dwForceID)"
    >
        <div class="u-pvx-reputation-icon">
            <img :src="getReputationIcon(item.szIconPath)" @error="replaceByDefault" />
        </div>
        <div class="m-pvx-reputation-name">
            <div class="u-pvx-reputation-name">{{ item.szName }}</div>
            <div v-if="variant === 'modern'" class="u-pvx-reputation-id">ID: {{ item.dwForceID }}</div>
            <div v-else class="u-pvx-reputation-progress">
                <div class="u-pvx-reputation-progress-value"></div>
            </div>
        </div>
    </article>
</template>

<script>
import { DEFAULT_REPUTATION_ICON, getReputationIcon } from "@/utils/reputation";

export default {
    name: "ReputationItem",
    props: {
        item: {
            type: Object,
            required: true,
        },
        variant: {
            type: String,
            default: "legacy",
            validator: (value) => ["legacy", "modern"].includes(value),
        },
    },
    methods: {
        getReputationIcon,
        replaceByDefault(e) {
            e.target.src = DEFAULT_REPUTATION_ICON;
        },
        go(id) {
            window.open(`/reputation/${id}`, "_self");
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/reputation_item.less";
</style>
