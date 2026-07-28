<template>
    <div class="m-pvx-horse-list-head list-sticky-head">
        <div>{{ $t("pages.horse.ui.columns.name") }}</div>
        <div>{{ $t("pages.horse.ui.columns.type") }}</div>
        <div>{{ $t("pages.horse.ui.columns.rideMode") }}</div>
        <div>{{ $t("pages.horse.ui.columns.quality") }}</div>
        <div>{{ $t("pages.horse.ui.columns.speed") }}</div>
        <div>{{ $t("pages.horse.ui.columns.feed") }}</div>
        <div>{{ $t("pages.horse.ui.columns.source") }}</div>
        <div>{{ $t("pages.horse.ui.columns.attributes") }}</div>
    </div>
</template>

<script>
export default {
    name: "ListHead",
};
</script>

<style lang="less">
@import "~@/assets/css/horse/pc/list.less";
</style>
