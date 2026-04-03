<template>
    <router-view />
</template>

<script>
export default {
    name: "Root",
    // 兼容老版本链接，后续可以删除
    mounted() {
        const path = this.$route.path;
        if (path == "/pvx/codex/adventure/treasure/landscape") {
            window.open("/codex/adventure/landscape", "_self");
        }
        if (path == "/pvx/codex/adventure/treasure/portrait") {
            window.open("/codex/adventure/portrait", "_self");
        }

    }
};
</script>
