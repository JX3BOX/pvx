<template>
    <router-link
        class="m-pet-item"
        :to="'/' + petObject.Index"
        :class="getFrameClass(petObject.Quality)"
        target="_blank"
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
                        src="../../assets/img/star.svg"
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
import { __iconPath } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    props: {
        petObject: {},
    },

    data: function () {
        return {};
    },

    computed: {
        client() { 
            return this.$store.state.client;
        },
    },
    methods: {
        iconLink,
        renderTextHtml: function (Text) {
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
        // 获取宠物边框样式
        getFrameClass: function (quality) {
            let className = "";
            if (quality) {
                switch (quality) {
                    case 2:
                        className = "pet-level-2";
                        break;
                    case 3:
                        className = "pet-level-3";
                        break;
                    case 4:
                        className = "pet-level-4";
                        break;
                    case 5:
                        className = "pet-level-5";
                        break;
                }
                return className;
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pet/item.less";
</style>
