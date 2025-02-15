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
                            <div v-else class="is-null">暂无价目</div>
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
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
export default {
    props: {
        data: {},
        priceMap: {},
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
            window.open(`${host}/item/view/${id}`, "_blank");
            sessionStorage.setItem("server_name", this.server);
        },
    },
};
</script>
<style lang="less">
.p-price-goods {
    * {
        box-sizing: border-box;
    }
    .m-systemgoods {
        display: flex;
        flex-direction: column;

        gap: 20px;
        .m-systemgoods-group {
            padding-left: 30px;
            .m-systemgoods-group-label {
                margin: 20px 0 20px 0;
                color: #24292e;
                font-size: 26px;
                font-weight: bold;
                line-height: 42px;
            }
            .m-systemgoods-list {
                .flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 20px;

                .m-systemgoods-list-item {
                    .flex;
                    .pointer;
                    .size(286px,68px);
                    .r(10px);
                    align-items: center;
                    padding: 10px;
                    background-color: #fff;
                    gap: 10px;

                    .u-icon {
                        .size(48px);
                    }
                    .m-systemgoods-list-item-info {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        width: 100%;
                        height: 100%;
                        .m-systemgoods-list-item-label {
                            .flex;
                            .full;
                            .fz(14px,1.5);
                            flex-direction: column;
                            justify-content: space-between;
                            font-weight: 700;
                        }
                        .m-systemgoods-list-item-money {
                            .is-null {
                                color: #999;
                                font-weight: normal;
                                .fz(14px);
                            }
                            .c-game-price {
                                .flex;
                                align-items: center;
                                gap: 10px;

                                & > span {
                                    .flex;
                                    justify-content: flex-end;
                                    align-items: center;
                                    gap: 4px;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
