<template>
    <div class="m-mygoods">
        <div class="m-mygoods-plan" v-for="plan in data" :key="plan.id">
            <div class="m-mygoods-list" v-if="mergeData(plan.relation)?.length">
                <div
                    class="m-mygoods-list-item"
                    v-for="item in mergeData(plan.relation)"
                    :key="item.id"
                    @click="goItemPage(item.id)"
                >
                    <img class="u-icon" :src="iconLink(item.IconID)" alt="" />
                    <div class="m-mygoods-list-item-label">{{ item.Name || "" }}</div>
                    <div class="m-mygoods-list-item-money">
                        <GamePrice v-if="priceMap[item.id]" :price="priceMap[item.id] || 0" />
                        <div v-else class="is-null">暂无价目</div>
                    </div>
                </div>
            </div>
        </div>
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
            // window.open(`${host}/item/view/${id}`, "_blank");
            sessionStorage.setItem("server_name", this.server);
            window.location.href = `${host}/item/view/${id}`;
        },
    },
};
</script>
<style lang="less" scoped>
@brand2: #24292e;
@brand3: #fedaa3;
@black4: #fff;
@black4-dark: #282828;
@black5: rgba(28, 28, 28, 0.05);
@black-40: rgba(28, 28, 28, 0.4);
@black-40-dark: rgba(255, 255, 255, 0.4);
@black-80: rgba(28, 28, 28, 0.8);
@black-80-dark: rgba(255, 255, 255, 0.8);
.m-mygoods {
    .m-mygoods-plan {
        .m-mygoods-list {
            .flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 12px;
            padding-top: 20px;
            .m-mygoods-list-item {
                box-sizing: border-box;
                width: 100%;
                .flex;
                align-items: center;
                .r(12px);
                background-color: @black4;
                padding: 8px 12px;
                border: 1px solid rgba(36, 41, 46, 0.05);
                position: relative;

                .u-icon {
                    .size(20px);
                    border-radius: 4px;
                }
                .m-mygoods-list-item-label {
                    margin-left: 10px;
                    .fz(12px,18px);
                    .bold();
                    color: @black-80;
                }
                .m-mygoods-list-item-money {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: @black-40;
                    .fz(12px,18px);
                }
            }
        }
    }
}
@media (prefers-color-scheme: dark) {
    .m-mygoods {
        .m-mygoods-plan {
            .m-mygoods-list {
                .m-mygoods-list-item {
                    background-color: @black4-dark;
                    .m-mygoods-list-item-label {
                        color: @black-80-dark;
                    }
                    .m-mygoods-list-item-money {
                        color: @black-40-dark;
                    }
                }
            }
        }
    }
}
</style>
