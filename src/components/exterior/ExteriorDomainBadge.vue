<template>
    <span v-if="label" class="m-ext-domain-badge" :style="{ color: domainMeta.color }">{{ label }}</span>
</template>

<script>
import { DOMAIN_META, SLOT_LABELS, localizedExteriorLabel } from "./meta";

export default {
    name: "ExteriorDomainBadge",
    props: {
        item: { type: Object, required: true },
    },
    computed: {
        domainMeta() {
            return DOMAIN_META[this.item.domain];
        },
        label() {
            if (this.item.domain === "pendant" && SLOT_LABELS[this.item.slot]) {
                return localizedExteriorLabel(this.$t, SLOT_LABELS[this.item.slot]);
            }
            return localizedExteriorLabel(this.$t, this.domainMeta?.label) || "";
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-domain-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 2;
    padding: 3px 9px;
    border-radius: @pvx-radius-pill;
    background: rgba(255, 255, 255, 0.88);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.3;
    backdrop-filter: blur(6px);
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
}
</style>
