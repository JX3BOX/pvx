<template>
    <div class="p-leap-main">
        <pc />
    </div>
</template>

<script>
import pc from "./leap/pc.vue";

export default {
    components: { pc },
};
</script>

<style lang="less" scoped>
.p-leap-main {
    height: 100%;
}
</style>
