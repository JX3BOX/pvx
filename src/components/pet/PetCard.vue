<template>
    <div class="m-pet-card">
        <!--宠物卡片图-->
        <img :src="getImgSrc(petObject.BgPath)" class="u-image" @error="replaceByDefault" />
        <!--宠物边框图-->
        <img :src="getFrameSrc(petObject.Quality)" class="u-frame" />
        <!-- 宠物星级 -->
        <div class="u-stars">
            <i class="u-star" :class="'u-star-' + petObject.Star"></i>
        </div>
        <!--福缘-->
        <i class="u-lucky" v-if="getLucky(petObject.Index)"></i>
        <!--分数-->
        <div class="u-score flex">
            {{ petObject.Score || "？" }}
        </div>
        <div class="u-name">{{ petObject.Name }}</div>
    </div>
</template>

<script>
import { __iconPath } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    props: {
        petObject: {},
        lucky: {},
    },
    inject: ["__imgRoot"],
    data: function () {
        return {};
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
    },
    methods: {
        replaceByDefault(e) {
            e.target.src = this.__imgRoot + "pets/" + this.client + "/3d_bg.png";
        },
        // 获取宠物图片路径
        getImgSrc: function (path) {
            if (path) {
                let img_name = path.match(/.*[\/,\\](.*?).tga/);
                return this.__imgRoot + `pets/${this.client}/` + img_name[1] + ".png";
            }
        },
        // 获取宠物边框图片路径
        getFrameSrc: function (quality) {
            let frameName = "";
            if (quality) {
                switch (quality) {
                    case 2:
                        frameName = "/greenborder.png";
                        break;
                    case 3:
                        frameName = "/blueborder.png";
                        break;
                    case 4:
                        frameName = "/purpleborder.png";
                        break;
                    case 5:
                        frameName = "/purpleborder.png";
                        break;
                }
                return this.__imgRoot + "frame" + frameName;
            }
        },
        // 判断福缘
        getLucky: function (index) {
            if (this.client !== "std") return false;
            if (index) {
                return this.lucky?.indexOf(index.toString()) != -1;
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pet/card.less";
</style>
