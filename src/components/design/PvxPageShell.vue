<template>
    <div class="w-full bg-[#f6f8fa] text-slate-900" :class="shellClass">
        <div class="mx-auto w-full max-w-[1440px] px-8 py-8 max-lg:px-6 max-md:px-4 max-md:py-5">
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    name: "PvxPageShell",
    props: {
        fullHeight: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        shellClass() {
            return {
                "min-h-screen": this.fullHeight,
            };
        },
    },
};
</script>

