<template>
    <div class="m-pvx-book-item" @click="go(item.idKey)">
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
import ItemIcon from "@/components/common/item_icon.vue";
import { getOrigin as _getOrigin, getProfessionType as _getProfessionType, getBookMapInfo } from "@/utils/book";

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
        getProfessionType: _getProfessionType,
        go(id) {
            this.$router.push(`/${id}`);
        },
        getOrigin(item) {
            return _getOrigin(item, this.bookMapInfo);
        },
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        bookMapInfo() {
            return getBookMapInfo(this.client);
        },
    },
};
</script>
<style lang="less" scoped>
@import "~@/assets/css/book/result/item_card.less";
</style>
