<template>
    <div class="m-book-card">
        <a
            class="u-book-info"
            :class="`u-profession-bg--` + item.ExtendProfessionID1"
            :href="getLink(item.idKey)"
            target="_blank"
        >
            <div class="title">{{ item.Name }}</div>
        </a>
        <div class="u-desc-info">
            <div class="desc" v-html="item.Desc"></div>
            <div class="desc-title" v-html="item.Name"></div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        item: {
            type: Object,
            required: true,
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
