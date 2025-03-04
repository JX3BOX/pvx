<template>
    <div class="m-furniture-item" :class="quality(item.Quality)" @click="go(item.dwID)">
        <div class="u-image">
            <el-image :src="getImgSrc(item.Path)" class="u-icon"></el-image>
            <span class="u-use" v-if="item.bInteract"></span>
            <span class="u-dye" v-if="item.__canDye"></span>
        </div>
        <div class="m-furniture-detail">
            <div class="u-name">
                {{ item.szName }}
                <el-button
                    v-if="copy"
                    icon="el-icon-document-copy"
                    circle
                    size="mini"
                    @click.stop="copyName(item.szName)"
                ></el-button>
            </div>
            <div class="m-attribute">
                <div class="u-nature" v-if="item.Attribute1">
                    <span class="u-attribute u-blue">观赏</span> <span class="u-num">{{ data.Attribute1 }}</span>
                </div>
                <div class="u-nature" v-if="item.Attribute2">
                    <span class="u-attribute u-pink">实用</span> <span class="u-num">{{ data.Attribute2 }}</span>
                </div>
                <div class="u-nature" v-if="item.Attribute3">
                    <span class="u-attribute u-yellow">坚固</span> <span class="u-num">{{ data.Attribute3 }}</span>
                </div>
                <div class="u-nature" v-if="item.Attribute4">
                    <span class="u-attribute u-green">风水</span> <span class="u-num">{{ data.Attribute4 }}</span>
                </div>
                <div class="u-nature" v-if="item.Attribute5">
                    <span class="u-attribute u-purple">趣味</span> <span class="u-num">{{ data.Attribute5 }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "FurnitureItem",
    inject: ["__imgRoot"],
    props: {
        item: {
            type: Object,
            required: true,
        },
        copy: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
        data: function () {
            let item = this.item;
            if (item.nFurnitureType == 2) {
                if (!item.Attribute1 && !item.Attribute2 && !item.Attribute3 && !item.Attribute4 && !item.Attribute5) {
                    item.Attribute1 = 1;
                    item.Attribute2 = 1;
                    item.Attribute3 = 1;
                    item.Attribute4 = 1;
                    item.Attribute5 = 1;
                }
            }
            return item;
        },
    },
    methods: {
        go(id) {
            this.$router.push({ name: "single", params: { id } });
        },
        getImgSrc(link) {
            if (!link) return; 
            let img = link.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
            let name = img?.[1].replace(/\\/g, "/");
            if (img?.[1] == "default") return this.__imgRoot + `homeland/${this.client}` + "/default/default.png";
            return this.__imgRoot + `homeland/${this.client}` + name + ".png";
        },
        quality(id) {
            return `u-quality-bg--${id}`;
        },
        copyName(val) {
            navigator.clipboard.writeText(val).then(() => {
                this.$notify({
                    title: "复制成功",
                    message: "内容：" + val,
                    type: "success",
                });
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/furniture/furniture_item.less";
</style>
