<template>
    <header
        class="c-pvx-section-header flex min-w-0 items-center justify-between gap-4"
        :class="{ 'items-start': description }"
    >
        <div class="c-pvx-section-header__main flex min-w-0 items-center gap-4">
            <div
                v-if="$slots.icon"
                class="c-pvx-section-header__icon flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl text-amber-500 max-md:size-10 max-md:rounded-xl"
            >
                <slot name="icon" />
            </div>
            <div class="c-pvx-section-header__content min-w-0">
                <component
                    :is="level"
                    class="c-pvx-section-header__title m-0 text-2xl font-semibold tracking-tight text-slate-800 max-md:text-lg"
                >
                    {{ title }}
                </component>
                <p
                    v-if="description"
                    class="c-pvx-section-header__description mt-1 mb-0 text-xs font-semibold leading-5 text-slate-400"
                >
                    {{ description }}
                </p>
            </div>
        </div>
        <div v-if="$slots.action" class="c-pvx-section-header__action shrink-0">
            <slot name="action" />
        </div>
    </header>
</template>

<script>
export default {
    name: "PvxSectionHeader",
    props: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        level: {
            type: String,
            default: "h2",
            validator: (value) => ["h1", "h2", "h3", "h4"].includes(value),
        },
    },
};
</script>
