<template>
    <div class="reputation-item" @click="go(item.dwForceID)" v-if="!item.bHide">
        <div class="reputation-icon">
            <img v-if="getIcon(item.szIconPath)" :src="getIcon(item.szIconPath)" />
            <div v-else class="no-img"></div>
        </div>
        <div class="m-reputation-icon__miniprogram">
            {{ item.szName.slice(0, 1) }}
        </div>
        <div class="reputation-name-wrap">
            <div class="reputation-name">{{ item.szName }}</div>
            <div class="progress-wrap">
                <div class="progress-value"></div>
            </div>
<!--            <div class="m-reputation-desc__miniprogram" v-html="item.szDesc.replace(/\\n/g, '')"></div>-->
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
import  { wxNewPage } from "@/utils/minprogram";
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
            if(isMiniProgram() || isApp()){
                wxNewPage(`/reputation/${id}`);
            }else{
                window.open(`/reputation/${id}`, "_self");
            }
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
@import "~@/assets/css/reputation/reputation_miniprogram.less";
</style>
