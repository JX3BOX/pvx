<template>
    <div class="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
        <div v-if="$slots.icon" class="mb-4 text-3xl text-slate-300">
            <slot name="icon" />
        </div>
        <h3 class="m-0 text-base font-semibold text-slate-700">{{ title }}</h3>
        <p v-if="description" class="mt-2 mb-0 max-w-lg text-sm leading-6 text-slate-400">{{ description }}</p>
        <div v-if="$slots.action" class="mt-5">
            <slot name="action" />
        </div>
    </div>
</template>

<script>
export default {
    name: "PvxEmptyState",
    props: {
        title: {
            type: String,
            default: "暂无内容",
        },
        description: {
            type: String,
            default: "",
        },
    },
};
</script>

