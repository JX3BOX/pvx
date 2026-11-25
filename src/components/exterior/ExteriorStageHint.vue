<template>
    <div class="m-ext-stage-hint" :class="{ 'is-overlay': overlay }">
        <slot />
    </div>
</template>

<script>
export default {
    name: "ExteriorStageHint",
    props: {
        overlay: Boolean,
    },
};
</script>

<style scoped lang="less">
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-stage-hint {
    padding: 4px 8px;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.52);
    color: #e2e8f0;
    font-size: 10px;
    line-height: 1.4;
    pointer-events: none;

    &.is-overlay {
        position: absolute;
        bottom: 14px;
        left: 14px;
        z-index: 2;
        max-width: calc(100% - 28px);
    }
}
</style>
