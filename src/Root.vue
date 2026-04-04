<template>
    <router-view />
</template>

<script>
import { __imgPath, __dataPath } from "@/utils/config";
export default {
    name: "Root",
    provide: {
        __imgRoot: __imgPath + "adventure/",
        __dataRoot: __dataPath + "pvx/",
        __imgPath,
    },
    // 兼容老版本链接，后续可以删除
    mounted() {
        const pathname = window.location.pathname;

        if (pathname == "/pvx/codex/adventure/treasure") {
            window.open("/codex/adventure/landscape", "_self");
        }

    }
};
</script>
