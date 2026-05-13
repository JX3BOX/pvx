<template>
    <a class="m-pvx-horse-same" :href="getLink(item)" target="_blank">
        <div class="m-pvx-horse-same__info">
            <div class="m-pvx-horse-same__img" :class="`u-pvx-horse-quality--` + item.Quality">
                <el-image v-if="item.SubType === 15" :src="getImgSrc(item)" class="u-image">
                    <template #error>
                        <div class="image-slot">
                            <img :src="getImgSrc(item, true)" @error="replaceByDefault" />
                        </div>
                    </template>
                </el-image>
                <item-icon v-else :item_id="String(item.ItemID)" :isLink="false" :size="48"
                    :onlyIcon="true"></item-icon>
            </div>
            <div class="m-pvx-horse-same__info-detail">
                <div class="u-pvx-horse-info-item name">{{ item.Name }}</div>
                <div class="u-pvx-horse-info-item id">ID: {{ item.ID }}</div>
            </div>
        </div>
        <div class="u-pvx-horse-info-item">
            <el-tooltip trigger="hover" placement="top" v-for="(data, index) in displayAttributes" :key="index">
                <template #content>
                    <div class="u-attr-pop">
                        <div class="u-attr-name" v-if="data.name">
                            {{ (data.name || "") + (Number(data.level) ? data.level + "级" : "") }}
                        </div>
                        <div class="u-attr-desc">{{ data.desc }}</div>
                    </div>
                </template>
                <img class="u-pvx-horse-attr-icon" :src="data.iconUrl" :alt="data.name" />
            </el-tooltip>
            <span class="u-pvx-horse-more" v-if="hiddenAttributesCount">+{{ hiddenAttributesCount }}</span>
        </div>
    </a>
</template>

<script>
import ItemIcon from "../common/item_icon.vue";
import HorseCardBase from "./HorseCardBase.vue";
import { handleHorseImgError } from "@/utils/horse";

export default {
    name: "SameItem",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    components: { ItemIcon },
    mixins: [HorseCardBase],
    methods: {
        replaceByDefault(e) {
            handleHorseImgError(e);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/horse/pc/card.less";
</style>
