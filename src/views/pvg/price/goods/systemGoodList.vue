<template>
    <div class="m-systemgoods">
        <div class="m-systemgoods-group" v-for="group in data" :key="group.id">
            <div class="m-systemgoods-group-label">
                {{ group.label }}
            </div>
            <div class="m-systemgoods-list">
                <div
                    class="m-systemgoods-list-item"
                    v-for="item in filterSameItem(group.items)"
                    :key="item.item_id"
                    @click="goItemPage(item.item_id)"
                >
                    <img class="u-icon" :src="iconLink(item.icon)" alt="" />
                    <div class="m-systemgoods-list-item-info">
                        <div class="m-systemgoods-list-item-label">{{ item.label || "" }}</div>
                        <div class="m-systemgoods-list-item-money">
                            <GamePrice v-if="priceMap[item.item_id]" :price="priceMap[item.item_id]" />
                            <div v-else class="is-null">{{ $t("pages.pvg.price.ui.noPrice") }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <el-backtop />
    </div>
</template>
<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import GamePrice from "@jx3box/jx3box-ui/src/wiki/GamePrice.vue";
export default {
    props: {
        data: {},
        priceMap: {},
        server: { type: String, default: "" },
    },
    components: { GamePrice },
    methods: {
        iconLink,
        // 去重item
        filterSameItem(list) {
            let arr = [];
            let obj = {};
            list.forEach((item) => {
                if (!obj[item.item_id]) {
                    arr.push(item);
                    obj[item.item_id] = true;
                }
            });
            return arr;
        },
        // 物品详情页
        goItemPage(id) {
            let host = location.origin;
            sessionStorage.setItem("server_name", this.server);
            window.open(`${host}/item/view/${id}`, "_blank", "noopener,noreferrer");
        },
    },
};
</script>
