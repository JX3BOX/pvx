<template>
    <a class="m-horse-card" :class="`u-quality-bg--` + item.Quality" :href="getLink(item)" target="_blank">
        <el-image v-if="item.SubType === 15" :src="getImgSrc(item)" class="u-image">
            <div slot="error" class="image-slot">
                <img :src="getImgSrc(item, true)" @error="replaceByDefault" />
            </div>
        </el-image>
        <item-icon v-else :item_id="String(item.ItemID)" :isLink="false" :size="160" :onlyIcon="true"></item-icon>

        <div class="u-name">{{ item.Name }}</div>
        <div class="u-desc">ID: {{ item.ID }}</div>
        <div class="u-img">
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
import { __cdn } from "@/utils/config";
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
    inject: ["__imgRoot", "__imgRoot2"],
    data: function () {
        return {};
    },
    computed: {
        isPhone() {
            return isPhone();
        },
        client() {
            return this.$store.state.client;
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
        replaceByDefault(e) {
            e.target.src = require("../../assets/img/horse_item_bg_sm.jpg");
        },
        getLink(item) {
            const id = item.ItemID;
            // 2 马具 1 坐骑
            const type = item.SubType === 15 ? 1 : 2;
            return `/horse/${id}?type=${type}`;
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
                return `${__cdn}/design/horse/${client}/${item.ID}.png`
            }
        },
        getType(item) {
            // SubType 15为坐骑 23 为马具
            // DetailType 0普通坐骑，非0奇趣坐骑
            // DetailType 0头饰，1鞍饰，2足饰，3马饰
            let type = "";
            if (item.SubType === 15) {
                if (item.DetailType === 0) {
                    type = "普通坐骑";
                } else {
                    type = "奇趣坐骑";
                }
            } else if (item.SubType === 23) {
                if (item.DetailType === 0) {
                    type = "头饰";
                } else if (item.DetailType === 1) {
                    type = "鞍饰";
                } else if (item.DetailType === 2) {
                    type = "足饰";
                } else if (item.DetailType === 3) {
                    type = "马饰";
                } else {
                    type = "马具";
                }
            }
            return type;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/horse/card.less";
</style>
