<template>
    <a v-if="!useWxNav" class="m-pvx-adventure-item" :href="`/adventure/${item.dwID}`"
        :target="isPhone ? '_self' : '_blank'">
        <div class="u-bg" :style="{ backgroundImage: `url(${defaultImg})` }">
            <img class="u-pic" :src="getImgUrl" />
        </div>
        <img class="u-title" :src="titleImg" :style="titleStyle" />
        <span class="u-icon"></span>
        <div v-if="item.szRewardType === 'camp'" class="u-camp-switch" @click.prevent="switchCamp">
            <img v-if="camp === 1" class="u-camp-icon" src="@/assets/img/camp/camp_1.png" />
            <img v-if="camp === 2" class="u-camp-icon" src="@/assets/img/camp/camp_2.png" />
        </div>
        <div v-if="item.szRewardType === 'school'" class="u-school-switch" @click.prevent="switchCamp">
            <el-popover ref="schoolPopover" placement="bottom" width="180" trigger="click"
                popper-class="m-pvx-school-choose">
                <template #reference>
                    <img class="u-school-icon" :src="forceIconUrl(force)" />
                </template>
                <div class="u-school-list">
                    <img v-for="(name, id) in forceid" :key="id" class="u-school-item" :src="forceIconUrl(id)"
                        @click="switchSchool(id)" />
                </div>
            </el-popover>
        </div>
        <div class="u-name">{{ item.szName }}</div>
    </a>
    <div v-else class="m-pvx-adventure-item" @click="openDetail">
        <div class="u-bg" :style="{ backgroundImage: `url(${defaultImg})` }">
            <img class="u-pic" :src="getImgUrl" />
        </div>
        <img class="u-title" :src="titleImg" :style="titleStyle" />
        <span class="u-icon"></span>
        <div v-if="item.szRewardType === 'camp'" class="u-camp-switch" @click.stop="switchCamp">
            <img v-if="camp === 1" class="u-camp-icon" src="@/assets/img/camp/camp_1.png" />
            <img v-if="camp === 2" class="u-camp-icon" src="@/assets/img/camp/camp_2.png" />
        </div>
        <div v-if="item.szRewardType === 'school'" class="u-school-switch" @click.stop="switchCamp">
            <el-popover ref="schoolPopover" placement="bottom" width="180" trigger="click"
                popper-class="m-pvx-school-choose">
                <template #reference>
                    <img class="u-school-icon" :src="forceIconUrl(force)" />
                </template>
                <div class="u-school-list">
                    <img v-for="(name, id) in forceid" :key="id" class="u-school-item" :src="forceIconUrl(id)"
                        @click="switchSchool(id)" />
                </div>
            </el-popover>
        </div>
        <div class="u-name">{{ item.szName }}</div>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { isPhone } from "@/utils/index";
import { wxNewPage } from "@/utils/minprogram";
import forceid from "@jx3box/jx3box-data/data/xf/forceid.json";
export default {
    name: "item",
    props: {
        item: { type: Object, required: true },
        useWxNav: { type: Boolean, default: false },
    },
    inject: ["__imgRoot"],
    data: () => ({
        forceid,
        camp: 1,
        force: 2,
    }),
    computed: {
        isPhone() {
            return isPhone();
        },
        client: function () {
            return this.$store.state.client;
        },
        defaultImg: function () {
            return __imgPath + "image/pvx/bg.png";
        },
        titleImg: function () {
            const client = this.client;
            const [, tga] = this.item.szOpenPath?.toLowerCase().match(/\\([^\\]+?)\.uitex/i);
            const filename = `${tga}_${this.item.nOpenFrame}`;
            return this.__imgRoot + `image_ui/${client}/${filename}.png`;
        },
        titleStyle: function () {
            return {};
        },
        getImgUrl() {
            const client = this.client;
            let tgaPath = this.item.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!this.item.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${this.__imgRoot}adventure/${client}/${pngPath}`;
            }
            tgaPath = tgaPath.replace(/\/[^\/]+?\.tga$/, "");
            if (this.item.szRewardType === "camp")
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/camp_${this.camp}_open.png`;
            if (this.item.szRewardType === "school")
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/school_${this.force}_open.png`;

            return this.defaultImg;
        },
    },
    methods: {
        openDetail() {
            wxNewPage(`/adventure/${this.item.dwID}`);
        },
        forceIconUrl(force) {
            const forceName = forceid[force];
            return `${__imgPath}image/school/${forceName}.png`;
        },
        switchCamp() {
            this.camp = this.camp === 1 ? 2 : 1;
        },
        switchSchool(force) {
            this.force = force;
            this.$refs.schoolPopover.doClose();
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/adventure/item.less";
</style>
