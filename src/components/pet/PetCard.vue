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
import { getPetImgSrc, getPetFrameSrc, isPetLucky, replacePetImgDefault } from "@/utils/pet";
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
            replacePetImgDefault(e, this.client);
        },
        getImgSrc(path) {
            return getPetImgSrc(path, this.client);
        },
        getFrameSrc(quality) {
            return getPetFrameSrc(quality, this.__imgRoot);
        },
        getLucky(index) {
            return isPetLucky(index, this.lucky, this.client);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pet/pc/card.less";
</style>
