<template>
    <div class="p-compare-main">
        <pc />
    </div>
</template>

<script>
import pc from "./compare/pc.vue";

export default {
    components: { pc },
};
</script>

<style lang="less">
.p-compare-main {
    width: 100%;
    min-width: 0;
    min-height: 100%;
}
</style>
