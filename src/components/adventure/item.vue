<template>
    <a class="m-adventure-item" :href="`/adventure/${item.dwID}`" target="_blank">
        <!-- @click="getLink(item.dwID)" -->
        <img class="u-default" :src="defaultImg" />
        <img class="u-title" :src="titleImg" :style="titleStyle" />
        <span class="u-img" :style="`backgroundImage: url(${getImgUrl()})`"></span>
        <span class="u-icon"></span>
        <div v-if="item.szRewardType === 'camp'" class="u-camp-switch" @click.prevent="switchCamp">
            <img v-if="camp === 1" class="u-camp-icon" src="@/assets/img/camp/camp_1.png" />
            <img v-if="camp === 2" class="u-camp-icon" src="@/assets/img/camp/camp_2.png" />
        </div>
        <div v-if="item.szRewardType === 'school'" class="u-school-switch" @click.prevent="switchCamp">
            <el-popover
                ref="schoolPopover"
                placement="bottom"
                width="180"
                trigger="click"
                popper-class="m-school-choose"
            >
                <img slot="reference" class="u-school-icon" :src="forceIconUrl(force)" />
                <div class="u-school-list">
                    <img
                        v-for="(name, id) in forceid"
                        :key="id"
                        class="u-school-item"
                        :src="forceIconUrl(id)"
                        @click="switchSchool(id)"
                    />
                </div>
            </el-popover>
        </div>
        <div class="u-name">{{ item.szName }}</div>
    </a>
</template>

<script>
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import forceid from "@jx3box/jx3box-data/data/xf/forceid.json";
export default {
    name: "item",
    props: ["item"],
    inject: ["__imgRoot"],
    components: {},
    data: () => ({
        forceid,
        camp: 1,
        force: 2,
    }),
    computed: {
        link: function () {
            return "/adventure/" + this.item.dwID;
        },
        client: function () {
            return this.$store.state.client;
        },
        imgName: function () {
            const client = "std"; // 图片使用正式服
            let img = this.item.szOpenRewardPath?.toLowerCase().match(/.*[\/,\\]adventure(.*?).tga/) || "";
            let name = "";
            if (img?.[1]) name = img?.[1].replace(/\\/g, "/");
            return this.__imgRoot + `adventure/${client}` + name + ".png";
        },
        defaultImg: function () {
            return __imgPath + "image/pvx/bg.png";
        },
        titleImg: function () {
            const client = this.client; // 图片使用正式服
            const [, tga] = this.item.szOpenPath?.toLowerCase().match(/\\([^\\]+?)\.uitex/i);
            const filename = `${tga}_${this.item.nOpenFrame}`;
            // console.log("tga", this.item.szOpenPath?.toLowerCase(), tga, filename);
            return this.__imgRoot + `image_ui/${client}/${filename}.png`;
        },
        titleStyle: function () {
            return {};
        },
    },
    methods: {
        forceIconUrl(force) {
            const forceName = forceid[force];
            return `${__imgPath}image/school/${forceName}.png`;
        },
        getImgUrl() {
            const client = this.client;
            // const client = "std"; // 怀旧服的奇遇图片先取正式服的
            let tgaPath = this.item.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!this.item.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${this.__imgRoot}adventure/${client}/${pngPath}`;
            }
            // 传给组件的数据是修改过的
            tgaPath = tgaPath.replace(/\/[^\/]+?\.tga$/, "");
            if (this.item.szRewardType === "camp")
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/camp_${this.camp}_open.png`;
            if (this.item.szRewardType === "school")
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/school_${this.force}_open.png`;
            return defaultImg;
        },
        getLink(adventure_id) {
            this.$router.push({ name: "single", params: { id: adventure_id } });
        },
        switchCamp() {
            this.camp = this.camp === 1 ? 2 : 1;
        },
        switchSchool(force) {
            this.force = force;
            this.$refs.schoolPopover.doClose();
        },
    },
    filters: {},
    mounted: function () {},
};
</script>
<style lang="less">
@import "~@/assets/css/adventure/item.less";
</style>
