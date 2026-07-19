<template>
    <div class="m-mygoods">
        <div class="m-mygoods-plan" v-for="plan in data" :key="plan.id">
            <div class="m-mygoods-plan-label">
                {{ plan.title }}
            </div>
            <div class="m-mygoods-list" v-if="mergeData(plan.relation)?.length">
                <div
                    class="m-mygoods-list-item"
                    v-for="item in mergeData(plan.relation)"
                    :key="item.id"
                    @click="goItemPage(item.id)"
                >
                    <img class="u-icon" :src="iconLink(item.IconID)" alt="" />
                    <div class="m-mygoods-list-item-info">
                        <div class="m-mygoods-list-item-label">{{ item.Name || "" }}</div>
                        <div class="m-mygoods-list-item-money">
                            <GamePrice v-if="priceMap[item.id]" :price="priceMap[item.id] || 0" />
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
                if (!obj[item.id]) {
                    arr.push(item);
                    obj[item.id] = true;
                }
            });
            return arr;
        },
        // 合并数据
        mergeData(list) {
            let arr = [];
            list?.length &&
                list.forEach((item) => {
                    item.data.forEach((item2) => {
                        arr.push(item2);
                    });
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
