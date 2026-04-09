<template>
    <a class="same-item" :href="getLink(item)" target="_blank">
        <div class="info-wrap">
            <div class="img-wrap" :class="`u-quality-bg--` + item.Quality">
                <el-image v-if="item.SubType === 15" :src="getImgSrc(item)" class="u-image">
                    <template #error>
                        <div class="image-slot">
                            <img :src="getImgSrc(item, true)" @error="replaceByDefault" />
                        </div>
                    </template>
                </el-image>
                <item-icon
                    v-else
                    :item_id="String(item.ItemID)"
                    :isLink="false"
                    :size="48"
                    :onlyIcon="true"
                ></item-icon>
            </div>
            <div class="m-info">
                <div class="info-item name">{{ item.Name }}</div>
                <div class="info-item id">ID: {{ item.ID }}</div>
            </div>
        </div>
        <div class="info-item">
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
            e.target.src = require("../../assets/img/horse/horse_item_bg_sm.jpg");
        },
        getImgSrc(item, isAuto = false) {
            const client = isAuto ? this.client : "std";
            const path = item.ImgPath;
            if (path) {
                let img = path.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
                let name = img?.[1].replace(/\\/g, "/");
                if (img?.[1] == "default") return this.__imgRoot + `homeland/${client}` + "/default/default.png";
                return this.__imgRoot + `homeland/${client}` + name + ".png";
            } else {
                return this.__imgRoot2 + `${client}/` + item.ID + ".png";
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/horse/same_item.less";
</style>
