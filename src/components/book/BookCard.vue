<template>
    <article
        class="m-pvx-book-card"
        :class="{
            'm-pvx-book-card--modern': variant === 'modern',
            'is-current': isCurrent,
        }"
    >
        <a
            class="u-book-info"
            :class="`u-profession-bg--` + item.ExtendProfessionID1"
            :href="getLink(item.idKey)"
            :aria-current="isCurrent ? 'page' : undefined"
            target="_blank"
            rel="noopener noreferrer"
        >
            <div class="title">{{ item.Name }}</div>
        </a>
        <div class="u-desc-info">
            <div class="desc" v-html="item.Desc"></div>
            <div class="desc-title" v-html="item.Name"></div>
        </div>
        <i v-if="isCurrent" class="u-current-mark">
            {{ $t("pages.book.single.ui.current") }}
        </i>
    </article>
</template>

<script>
export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
        variant: {
            type: String,
            default: "legacy",
            validator: (value) => ["legacy", "modern"].includes(value),
        },
        isCurrent: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {};
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        getLink(id) {
            return `/book/${id}`;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/book/card.less";
</style>
