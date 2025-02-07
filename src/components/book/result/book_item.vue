<template>
    <div class="m-book-card" @click="go(item.idKey)">
        <div class="u-name">
            <item-icon :item_id="String(item.ItemID)" :size="36" :vertical="true"></item-icon>
        </div>
        <div class="u-name">
            {{ this.getProfessionType(item.ExtendProfessionID1) }}
        </div>
        <div class="u-name">
            <span>{{ item.BookName }}</span>
        </div>
        <div class="u-name">
            <span>{{ item.Desc }}</span>
        </div>
        <div class="u-path" :class="getOrigin(item) !== '其它' && 'special'">
            <span>{{ getOrigin(item) }}</span>
        </div>
    </div>
</template>

<script>
import ItemIcon from "../common/item_icon.vue";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import bookProfession from "@/assets/data/book_profession.json";
import bookMapInfoStd from "@/assets/data/stele_std_fwd.json";
import bookMapInfoOrigin from "@/assets/data/stele_origin_fwd.json";

export default {
    name: "BookCard",
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
        getProfessionType(type) {
            return bookProfession.find((item) => item.id === Number(type))
                ? bookProfession.find((item) => item.id === Number(type)).name
                : "";
        },
        go(id) {
            this.$router.push(`/${id}`);
        },
        getOrigin(item) {
            const tempId = item.DoodadTemplateID;
            const ShopNames = item.ShopNames;
            const drops = item.drops || [];
            const quests = item?.Quests;
            let orgin = "";
            if (tempId) {
                orgin = orgin + (orgin ? "/" : "") + (this.bookMapInfo[tempId] ? "碑铭" : "其它");
            }
            if (ShopNames) {
                orgin = orgin + (orgin ? "/" : "") + "商店";
            }
            if (drops.length) {
                orgin = orgin + (orgin ? "/" : "") + "秘境";
            }
            if (quests) {
                orgin = orgin + (orgin ? "/" : "") + "任务";
            }
            if (!orgin) {
                orgin = "其它";
            }
            return orgin;
        },
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        bookMapInfo() {
            return this.client === "std" ? bookMapInfoStd : bookMapInfoOrigin;
        },
    },
};
</script>
<style lang="less" scoped>
@import "~@/assets/css/book/result/item_card.less";
</style>
