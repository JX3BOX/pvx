<template>
    <div
        class="c-pvx-empty-state flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center"
    >
        <img
            v-if="illustrated"
            class="c-pvx-empty-state__image mb-4 h-auto w-44 max-w-full"
            :src="image"
            alt=""
            loading="lazy"
            decoding="async"
        />
        <div v-else-if="$slots.icon" class="c-pvx-empty-state__icon mb-4 text-3xl text-slate-300">
            <slot name="icon" />
        </div>
        <p
            v-if="illustrated && illustratedMessage"
            class="c-pvx-empty-state__message m-0 max-w-lg text-sm leading-6 text-slate-500"
        >
            {{ illustratedMessage }}
        </p>
        <template v-else>
            <h3 v-if="title" class="c-pvx-empty-state__title m-0 text-base font-semibold text-slate-500">
                {{ title }}
            </h3>
            <p
                v-if="description"
                class="c-pvx-empty-state__description mt-2 mb-0 max-w-lg text-sm leading-6 text-slate-400"
            >
                {{ description }}
            </p>
        </template>
        <div v-if="$slots.action" class="c-pvx-empty-state__action mt-5">
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
        illustrated: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
            default: "https://cdn.jx3box.com/static/pvx/img/leap_empty.5f8393d3.png",
        },
    },
    computed: {
        illustratedMessage() {
            return [this.title, this.description].filter(Boolean).join(" ");
        },
    },
};
</script>
