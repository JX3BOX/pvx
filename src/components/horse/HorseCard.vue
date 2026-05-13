<template>
    <a class="m-pvx-horse-card" :class="`u-pvx-horse-quality--` + item.Quality" :href="getLink(item)" target="_blank">
        <div class="u-pvx-horse-image">

            <img v-if="item.SubType === 15" :src="getImgSrc(item)" class="u-pvx-horse-image-item" :alt="`${item.Name} - 剑网3马匹`"
                loading="lazy" @error="handleImageError" />
            <item-icon v-else :item_id="String(item.ItemID)" :isLink="false" :size="160" :onlyIcon="true"></item-icon>
        </div>

        <div class="u-pvx-horse-name">{{ item.Name }}</div>
        <div class="u-pvx-horse-desc">ID: {{ item.ID }}</div>
        <div class="u-pvx-horse-img">
            <el-tooltip trigger="hover" placement="top" v-for="(data, index) in displayAttributes" :key="index">
                <template #content>
                    <div class="u-pvx-horse-attr-pop">
                        <div class="u-pvx-horse-attr-name" v-if="data.name">
                            {{ (data.name || "") + (Number(data.level) ? data.level + "级" : "") }}
                        </div>
                        <div class="u-pvx-horse-attr-desc">{{ data.desc }}</div>
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

export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    components: {
        ItemIcon,
    },
    mixins: [HorseCardBase],
};
</script>

<style lang="less">
@import "~@/assets/css/horse/pc/card.less";
</style>
