<template>
    <div class="reputation-item" @click="go(item.dwForceID)" v-if="!item.bHide">
        <div class="reputation-icon">
            <img v-if="getIcon(item.szIconPath)" :src="getIcon(item.szIconPath)" />
            <div v-else class="no-img"></div>
        </div>
        <div class="reputation-name-wrap">
            <div class="reputation-name">{{ item.szName }}</div>
            <div class="progress-wrap">
                <div class="progress-value"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";

export default {
    name: "ReputationItem",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    methods: {
        go(id) {
            // this.$router.push({ path: `/${id}` });
            window.open(`/reputation/${id}`, "_self");
        },
        getIcon(iconPath) {
            const rPath = iconPath ? iconPath.replace(/\//g, "\\") : "";
            const iconName = rPath
                ? rPath.split("\\")[rPath.split("\\").length - 1].toLowerCase().split(".tga")[0]
                : "";
            if (iconName) {
                return __imgPath + "reputation/reputation/std/icon/" + iconName + ".png";
            } else {
                return "";
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/reputation_item.less";
</style>
