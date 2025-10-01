<template>
    <div class="m-fetters">
        <!-- 羁绊信息 -->
        <div class="m-fetters-title">
            <div class="u-title"><i class="el-icon-star-on"></i>{{ info.Name }}</div>
            <div class="u-desc">{{ showPetterDesc(info.Des) }}</div>
        </div>

        <div class="m-fetters-list">
            <el-popover
                placement="top"
                popper-class="m-pet-pop"
                width="auto"
                :visible-arrow="false"
                trigger="hover"
                transition="none"
                :close-delay="0"
                v-for="pet in info.petList"
                :key="pet.Index"
            >
                <router-link slot="reference" class="u-fetter" :to="'/' + pet.Index">
                    <i class="u-fetter-icon" :class="['u-quality-' + pet.Quality]">
                        <img :src="iconLink(pet.IconID)" />
                    </i>
                    <span class="u-fetter-name">{{ pet.Name }}</span>
                    <i class="u-mark" v-if="pet.Index == id">当前</i>
                </router-link>

                <jx3-item :item_id="`${pet.ItemTabType}_${pet.ItemTabIndex}`"></jx3-item>
            </el-popover>
        </div>
    </div>
</template>
<script>
import { __iconPath } from "@/utils/config";
import { iconLink, extractTextContent } from "@jx3box/jx3box-common/js/utils";
import Item from "@jx3box/jx3box-editor/src/Item";
export default {
    name: "Fetters",
    props: ["info"],
    components: {
        'jx3-item': Item
    },
    data: function () {
        return {};
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        }
    },
    methods: {
        // 获取宠物图片路径
        getImgSrc: function (path) {
            if (path) {
                let img_name = path.match(/.*[\/,\\](.*?).tga/);
                return __iconPath + "pvx/pet/images/" + img_name[1] + ".png";
            }
        },
        // 宠物链接跳转
        getLink(pet_id) {
            if (pet_id == this.$route.params.id) return;
            this.$router.push({ name: "single", params: { id: pet_id } });
        },
        iconLink,
        // 显示羁绊介绍
        showPetterDesc: function (str) {
            let result = extractTextContent(str);
            return result[0]["text"];
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/pet/fetter.less";
</style>
