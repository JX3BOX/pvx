<template>
    <a class="same-item" :href="getLink(item)" target="_blank">
        <div class="info-wrap">
            <div class="img-wrap" :class="`u-quality-bg--` + item.Quality">
                <el-image v-if="item.SubType === 15" :src="getImgSrc(item)" class="u-image">
                    <div slot="error" class="image-slot">
                        <img :src="getImgSrc(item, true)" @error="replaceByDefault" />
                    </div>
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
            <el-tooltip trigger="hover" placement="top" v-for="(data, index) in MagicAttributes" :key="index">
                <div class="u-attr-pop" slot="content">
                    <div class="u-attr-name" v-if="data.name">
                        {{ (data.name || "") + (Number(data.level) ? data.level + "级" : "") }}
                    </div>
                    <div class="u-attr-desc">{{ data.desc }}</div>
                </div>
                <img class="u-attr-icon" :src="data.iconUrl" :alt="data.name" />
            </el-tooltip>
            <span class="u-more" v-if="count">+{{ count }}</span>
        </div>
    </a>
</template>

<script>
import { isPhone } from "@/utils/index";
import ItemIcon from "../common/item_icon.vue";
export default {
    name: "SameItem",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    components: { ItemIcon },
    computed: {
        isPhone() {
            return isPhone();
        },
        MagicAttributes() {
            if (this.isPhone) this.item.MagicAttributes;
            return this.item.MagicAttributes.length <= 4
                ? this.item.MagicAttributes
                : this.item.MagicAttributes.slice(0, 3) || [];
        },
        count() {
            if (this.isPhone) return 0;
            return this.item.MagicAttributes.length <= 4 ? 0 : this.item.MagicAttributes.slice(3).length;
        },
    },
    methods: {
        getLink(item) {
            const id = item.ItemID;
            // 2 马具 1 坐骑
            const type = item.SubType === 15 ? 1 : 2;
            return `/horse/${id}?type=${type}`;
        },
        replaceByDefault(e) {
            e.target.src = require("../../assets/img/horse_item_bg_sm.jpg");
        },
        getImgSrc(item, isAuto = false) {
            // const client = this.client;
            const client = isAuto ? this.client : "std"; // 怀旧服的坐骑图片取正式服的, 没有再根据client获取
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
