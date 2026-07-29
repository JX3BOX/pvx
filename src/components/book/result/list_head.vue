<template>
    <div class="m-pvx-book-list-head list-sticky-head">
        <div>{{ $t("pages.book.ui.columns.name") }}</div>
        <div>{{ $t("pages.book.ui.columns.type") }}</div>
        <div>{{ $t("pages.book.ui.columns.collection") }}</div>
        <div>{{ $t("pages.book.ui.columns.description") }}</div>
        <div class="u-source-column">{{ $t("pages.book.ui.columns.origin") }}</div>
    </div>
</template>

<script>
export default {
    name: "ListHead",
};
</script>

<style lang="less" scoped>
@import "~@/assets/css/book/result/list_head.less";
</style>
