<template>
    <a class="m-horse-card" :class="`u-quality-bg--` + item.Quality" :href="getLink(item)" target="_blank">
        <div class="u-image-wrapper">
            <img :src="getPlaceholderImage()" class="u-placeholder" alt="" aria-hidden="true" />
            <img v-if="item.SubType === 15" :src="getImgSrc(item)" class="u-image" :alt="`${item.Name} - 剑网3马匹`"
                loading="lazy" @error="handleImageError" />
            <item-icon v-else :item_id="String(item.ItemID)" :isLink="false" :size="160" :onlyIcon="true"></item-icon>
        </div>

        <div class="u-name">{{ item.Name }}</div>
        <div class="u-desc">ID: {{ item.ID }}</div>
        <div class="u-img">
            <el-tooltip trigger="hover" placement="top" v-for="(data, index) in displayAttributes" :key="index">
                <template #content>
                    <div class="u-attr-pop">
                        <div class="u-attr-name" v-if="data.name">
                            {{ (data.name || "") + (Number(data.level) ? data.level + "级" : "") }}
                        </div>
                        <div class="u-attr-desc">{{ data.desc }}</div>
                    </div>
                </template>
                <img class="u-attr-icon" :src="data.iconUrl" :alt="data.name" />
            </el-tooltip>
            <span class="u-more" v-if="hiddenAttributesCount">+{{ hiddenAttributesCount }}</span>
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
@import "~@/assets/css/horse/card.less";
</style>
