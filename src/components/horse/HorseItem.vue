<template>
    <div class="m-pvx-horse-item" @click="go(item)">
        <div class="u-pvx-horse-name">
            <item-icon :item_id="String(item.ItemID)" :size="36" :vertical="true"></item-icon>
        </div>
        <div class="u-desc">{{ typeLabel(item) }}</div>
        <div class="u-desc">{{ modeLabel(item.modeName) }}</div>
        <div class="u-desc">{{ item.Level }}</div>
        <div class="u-desc">{{ item.speed }}</div>
        <div class="u-desc">{{ item.feedName }}</div>
        <div class="u-desc">{{ item.GetType }}</div>
        <div class="u-pvx-horse-attr-wrap">
            <div class="u-pvx-horse-attr" v-for="(attr, index) in item.MagicAttributes || []" :key="index">
                <el-tooltip trigger="hover" placement="top">
                    <template #content>
                        <div class="u-attr-pop">
                            <div class="u-attr-name" v-if="attr.name">
                                {{ attributeName(attr) }}
                            </div>
                            <div class="u-attr-desc">{{ attr.desc }}</div>
                        </div>
                    </template>
                    <img class="u-pvx-horse-attr-icon" :src="attr.iconUrl" :alt="attr.name" />
                </el-tooltip>
            </div>
        </div>
    </div>
</template>

<script>
import ItemIcon from "../common/item_icon.vue";

export default {
    name: "HorseItem",
    components: {
        ItemIcon,
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    methods: {
        typeLabel(item) {
            let key = "gear";
            if (item.SubType === 15) {
                key = item.DetailType === 0 ? "normal" : "fun";
            } else if (item.SubType === 23) {
                key = ["headgear", "saddle", "feet", "ornament"][item.DetailType] || "gear";
            }
            return this.$t(`pages.horse.ui.types.${key}`);
        },
        modeLabel(mode) {
            return mode === "单骑" ? this.$t("pages.horse.ui.rideModes.solo") : mode;
        },
        attributeName(attr) {
            const level = Number(attr.level)
                ? this.$t("pages.horse.ui.attributeLevel", { level: attr.level })
                : "";
            return `${attr.name || ""}${level}`;
        },
        go(item) {
            const id = item.ItemID;
            // 2 马具 1 坐骑
            const type = item.SubType === 15 ? 1 : 2;
            this.$router.push({ path: `${id}`, query: { type } });
        },
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/horse/pc/list.less";
</style>
