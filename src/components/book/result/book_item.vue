<template>
    <div class="m-pvx-book-item" @click="go(item.idKey)">
        <div class="u-name u-field" :data-label="$t('pages.book.ui.columns.name')">
            <div class="u-book-name-value">
                <item-icon
                    :item_id="String(item.ItemID)"
                    :size="36"
                    :vertical="!mobile"
                    @loaded="showFallbackName = false"
                    @error="showFallbackName = true"
                ></item-icon>
                <span v-if="showFallbackName" class="u-book-name-text">{{ item.Name }}</span>
            </div>
        </div>
        <div class="u-name u-field" :data-label="$t('pages.book.ui.columns.type')">
            {{ getProfessionLabel(item.ExtendProfessionID1) }}
        </div>
        <div class="u-name u-field" :data-label="$t('pages.book.ui.columns.collection')">
            <span>{{ item.BookName }}</span>
        </div>
        <div class="u-name u-field" :data-label="$t('pages.book.ui.columns.description')">
            <span>{{ item.Desc }}</span>
        </div>
        <div
            class="u-path u-field"
            :class="getOrigin(item) !== '其它' && 'special'"
            :data-label="$t('pages.book.ui.columns.origin')"
        >
            <span>{{ getOrigin(item) }}</span>
        </div>
    </div>
</template>

<script>
import ItemIcon from "@/components/common/item_icon.vue";
import { getOrigin as _getOrigin, getProfessionType as _getProfessionType, getBookMapInfo } from "@/utils/book";

export default {
    name: "BookCard",
    data() {
        return {
            showFallbackName: false,
        };
    },
    components: {
        ItemIcon,
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
        mobile: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        getProfessionLabel(id) {
            const keyMap = {
                9: "buddhism",
                10: "taoism",
                11: "misc",
            };
            const key = keyMap[id];
            return key ? this.$t(`pages.book.ui.types.${key}`) : _getProfessionType(id);
        },
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
    watch: {
        "item.ItemID"() {
            this.showFallbackName = false;
        },
    },
};
</script>
<style lang="less" scoped>
@import "~@/assets/css/book/result/item_card.less";
</style>
