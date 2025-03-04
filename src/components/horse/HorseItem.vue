<template>
    <div class="m-horse-item" @click="go(item)">
        <div class="u-name">
            <item-icon :item_id="String(item.ItemID)" :size="36" :vertical="true"></item-icon>
        </div>
        <div class="u-desc">{{ item.typeName }}</div>
        <div class="u-desc">{{ item.modeName }}</div>
        <div class="u-desc">{{ item.Level }}</div>
        <div class="u-desc">{{ item.speed }}</div>
        <div class="u-desc">{{ item.feedName }}</div>
        <div class="u-desc">{{ item.GetType }}</div>
        <div class="u-attr-wrap">
            <div class="u-attr" v-for="(attr, index) in item.MagicAttributes || []" :key="index">
                <el-tooltip trigger="hover" placement="top">
                    <div class="u-attr-pop" slot="content">
                        <div class="u-attr-name" v-if="attr.name">
                            {{ (attr.name || "") + (Number(attr.level) ? attr.level + "级" : "") }}
                        </div>
                        <div class="u-attr-desc">{{ attr.desc }}</div>
                    </div>
                    <img class="u-attr-icon" :src="attr.iconUrl" :alt="attr.name" />
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
@import "~@/assets/css/horse/item.less";
</style>
