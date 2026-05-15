<template>
    <router-link
        class="m-pvx-pet-item"
        :to="'/' + petObject.Index"
        :class="getFrameClass(petObject.Quality)"
        :target="isPhone ? '_self' : '_blank'"
    >
        <div class="m-info">
            <el-image class="u-icon" :src="iconLink(petObject.IconID, client)" fit="fit"></el-image>
            <div class="u-text">
                <div class="u-name">{{ petObject.Name }}</div>
                <div class="u-rate">
                    <img
                        v-for="o in petObject.Star"
                        :key="o"
                        class="u-star"
                        src="../../assets/img/common/star.svg"
                        svg-inline
                    />
                </div>
            </div>
        </div>

        <div class="u-desc" v-if="petObject.Desc" v-html="renderTextHtml(petObject.Desc)"></div>
    </router-link>
</template>

<script>
import { extractTextContent, iconLink } from "@jx3box/jx3box-common/js/utils";
import { getPetFrameClass, parsePetDesc } from "@/utils/pet";
export default {
    props: {
        petObject: {},
    },

    data: function () {
        return {
            isPhone: window.innerWidth <= 768,
        };
    },

    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        iconLink,
        renderTextHtml(Text) {
            let result = Text;
            const matches = Text.match(/<Text>(.*?)<\/text>/gims);
            if (!matches) return Text;
            for (let match of matches) {
                let text = extractTextContent(match);
                const html = text[0].text.replace(/\\n/g, "").replace(/\\/g, "");
                result = result.replace(match, html);
            }
            return result;
        },
        getFrameClass(quality) {
            return getPetFrameClass(quality);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pet/pc/item.less";
</style>
