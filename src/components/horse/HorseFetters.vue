<template>
    <div class="m-pvx-horse-fetters-content">
        <div class="m-pvx-horse-fetters-title">
            <div class="u-pvx-horse-title"><i class="el-icon-star-on"></i>{{ info.Name }}</div>
            <div class="u-pvx-horse-desc">{{ showPetterDesc(info.Des) }}</div>
        </div>

        <div class="m-pvx-horse-fetters-list">
            <el-popover
                placement="top"
                popper-class="m-pvx-horse-attr-pop"
                width="auto"
                :visible-arrow="false"
                trigger="hover"
                transition="none"
                :close-delay="0"
                v-for="pet in info.petList"
                :key="pet.Index"
            >
                <template #reference>
                    <router-link class="u-pvx-horse-fetter" :to="'/' + pet.Index">
                        <i class="u-pvx-horse-fetter-icon" :class="['u-pvx-horse-quality--' + pet.Quality]">
                            <img :src="iconLink(pet.IconID)" />
                        </i>
                        <span class="u-pvx-horse-fetter-name">{{ pet.Name }}</span>
                        <i class="u-pvx-horse-fetter__mark" v-if="pet.Index == id">当前</i>
                    </router-link>
                </template>

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
    name: "HorseFetters",
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
        getImgSrc: function (path) {
            if (path) {
                let img_name = path.match(/.*[\/,\\](.*?).tga/);
                return __iconPath + "pvx/pet/images/" + img_name[1] + ".png";
            }
        },
        getLink(pet_id) {
            if (pet_id == this.$route.params.id) return;
            this.$router.push({ name: "single", params: { id: pet_id } });
        },
        iconLink,
        showPetterDesc: function (str) {
            let result = extractTextContent(str);
            return result[0]["text"];
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/horse/pc/fetter.less";
</style>
