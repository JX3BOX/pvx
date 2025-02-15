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
    .m-mygoods {
        .flex;
        flex-direction: column;
        gap: 20px;

        .m-mygoods-plan {
            .pl(30px);
            .m-mygoods-plan-label {
                .bold;
                .fz(24px,1.2);
                margin: 20px 0 20px 0;
                color: #24292e;
            }
            .m-mygoods-list {
                .flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 20px;

                .m-mygoods-list-item {
                    .flex;
                    .pointer;
                    .r(10px);
                    .size(286px,68px);
                    box-sizing: border-box;
                    align-items: center;
                    padding: 10px;
                    background-color: #fff;
                    gap: 10px;

                    .u-icon {
                        .size(48px);
                    }
                    .m-mygoods-list-item-info {
                        flex: 1;
                        .flex;
                        .full;
                        .fz(14px,1.5);
                        flex-direction: column;
                        justify-content: space-between;
                        font-weight: 700;
                        .m-mygoods-list-item-money {
                            .is-null {
                                color: #999;
                                font-size: 14px;
                                font-weight: normal;
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
