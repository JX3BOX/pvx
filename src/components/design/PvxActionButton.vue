<template>
    <component
        :is="componentTag"
        :href="href || undefined"
        :type="componentTag === 'button' ? nativeType : undefined"
        class="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold no-underline transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-indigo-200 disabled:pointer-events-none disabled:opacity-50"
        :class="variantClass"
    >
        <slot />
    </component>
</template>

<script>
const VARIANT_CLASS = {
    primary: "border-indigo-600 bg-indigo-600 text-white hover:border-indigo-700 hover:bg-indigo-700",
    dark: "border-slate-900 bg-slate-900 text-white hover:opacity-90",
    light: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
    ghost: "border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100",
};

export default {
    name: "PvxActionButton",
    props: {
        href: {
            type: String,
            default: "",
        },
        variant: {
            type: String,
            default: "primary",
            validator: (value) => Object.keys(VARIANT_CLASS).includes(value),
        },
        nativeType: {
            type: String,
            default: "button",
            validator: (value) => ["button", "submit", "reset"].includes(value),
        },
    },
    computed: {
        componentTag() {
            return this.href ? "a" : "button";
        },
        variantClass() {
            return VARIANT_CLASS[this.variant];
        },
    },
};
</script>

