<template>
    <div
        class="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white px-5 py-3 shadow-sm max-md:flex-col max-md:items-stretch max-md:px-4"
    >
        <div class="flex min-w-0 flex-1 items-center gap-3 max-md:flex-wrap">
            <slot />
        </div>
        <div v-if="$slots.action" class="flex shrink-0 items-center gap-2 max-md:justify-end">
            <slot name="action" />
        </div>
    </div>
</template>

<script>
export default {
    name: "PvxToolbar",
};
</script>

