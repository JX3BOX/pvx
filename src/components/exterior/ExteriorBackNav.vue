<template>
    <PvxSurface tag="nav" padding="small" radius="medium" class="m-ext-single-nav">
        <router-link v-slot="{ href, navigate }" :to="to" custom>
            <PvxActionButton variant="light" :href="href" @click="navigate">
                <ArrowLeft class="size-4" />{{ $t("exterior.back") }}
            </PvxActionButton>
        </router-link>
        <PvxActionButton v-if="showFavorites" variant="light" aria-haspopup="dialog" @click="$emit('open-favorites')">
            <Star class="size-4" aria-hidden="true" />{{ $t("exterior.star.favorites") }}
        </PvxActionButton>
    </PvxSurface>
</template>

<script>
import { ArrowLeft, Star } from "@element-plus/icons-vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";

export default {
    components: { ArrowLeft, Star, PvxActionButton, PvxSurface },
    emits: ["open-favorites"],
    props: {
        to: { type: Object, required: true },
        showFavorites: Boolean,
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-single-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: @pvx-space-2;
    min-height: 64px;
    padding: @pvx-space-3 @pvx-space-4;
    border-color: fade(@pvx-border, 80%);
    box-shadow: @pvx-shadow-xs;

    > a, > button {
        min-width: 96px;
        padding-inline: @pvx-space-3;
        border-radius: @pvx-radius-control;
    }
}
</style>
