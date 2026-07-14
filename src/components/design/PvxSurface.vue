<template>
    <component
        :is="tag"
        class="box-border border border-slate-200/60 bg-white shadow-sm"
        :class="surfaceClass"
    >
        <slot />
    </component>
</template>

<script>
const RADIUS_CLASS = {
    small: "rounded-xl",
    medium: "rounded-2xl",
    large: "rounded-3xl",
};

const PADDING_CLASS = {
    none: "",
    small: "p-4 max-md:p-3",
    medium: "p-6 max-md:p-4",
    large: "p-8 max-md:p-5",
};

export default {
    name: "PvxSurface",
    props: {
        tag: {
            type: String,
            default: "section",
        },
        radius: {
            type: String,
            default: "large",
            validator: (value) => Object.keys(RADIUS_CLASS).includes(value),
        },
        padding: {
            type: String,
            default: "large",
            validator: (value) => Object.keys(PADDING_CLASS).includes(value),
        },
        interactive: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        surfaceClass() {
            return [
                RADIUS_CLASS[this.radius],
                PADDING_CLASS[this.padding],
                this.interactive
                    ? "transition duration-200 ease-out hover:-translate-y-px hover:border-indigo-300 hover:shadow-xl"
                    : "",
            ];
        },
    },
};
</script>

