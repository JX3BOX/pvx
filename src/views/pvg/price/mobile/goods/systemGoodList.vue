<template>
    <div class="m-systemgoods">
        <el-collapse class="m-systemgoods-group">
            <el-collapse-item
                v-for="group in data"
                :key="group.id"
                :title="group.label"
                :name="group.id"
                class="m-systemgoods-list"
            >
                <div
                    class="m-systemgoods-list-item"
                    v-for="item in filterSameItem(group.items)"
                    :key="item.item_id"
                    @click="goItemPage(item.item_id)"
                >
                    <img class="u-icon" :src="iconLink(item.icon)" alt="" />
                    <div class="m-systemgoods-list-item-label">{{ item.label || "" }}</div>
                    <div class="m-systemgoods-list-item-money">
                        <GamePrice v-if="priceMap[item.item_id]" :price="priceMap[item.item_id]" />
                        <div v-else class="is-null">暂无价目</div>
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>
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
            // window.open(`${host}/item/view/${id}`, "_blank");
            sessionStorage.setItem("server_name", this.server);
            window.location.href = `${host}/item/view/${id}`;
        },
    },
};
</script>
<style lang="less" scoped>
@brand2: #24292e;
@brand2-dark: #fedaa3;
@brand3: #fedaa3;
@brand3-dark: #24292e;
@black4: #fff;
@black4-dark: #282828;
@black5: rgba(28, 28, 28, 0.05);
@black5-dark: rgba(255, 255, 255, 0.1);
@black-40: rgba(28, 28, 28, 0.4);
@black-40-dark: rgba(255, 255, 255, 0.4);
@black-80: rgba(28, 28, 28, 0.8);
@black-80-dark: rgba(255, 255, 255, 0.8);
* {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}
.m-systemgoods {
    .m-systemgoods-group {
        border: none;
        .m-systemgoods-list {
            margin-top: 12px;
            /deep/.el-collapse-item__header {
                border-radius: 4px;
                background-color: @black5;
                padding: 8px 12px;
                color: @black-80;
                .fz(12px, 18px);
                .bold();
                height: auto;
                transition: 0.2s all;
                border: none;
                .el-collapse-item__arrow {
                    display: none;
                }

                &.is-active {
                    background-color: @brand2;
                    color: @brand3;
                }
            }
            /deep/.el-collapse-item__wrap {
                background-color: transparent;
                border: none;
                .el-collapse-item__content {
                    .flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 12px;
                    padding-top: 12px;
                    padding-bottom: 0;
                    .m-systemgoods-list-item {
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
                        .m-systemgoods-list-item-label {
                            margin-left: 10px;
                            .fz(12px,18px);
                            .bold();
                            color: @black-80;
                        }
                        .m-systemgoods-list-item-money {
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
    }
}
@media (prefers-color-scheme: dark) {
    .m-systemgoods {
        .m-systemgoods-group {
            .m-systemgoods-list {
                /deep/.el-collapse-item__header {
                    background-color: @black5-dark;
                    color: @black-80-dark;

                    &.is-active {
                        background-color: @brand2-dark;
                        color: @brand3-dark;
                    }
                }
                /deep/.el-collapse-item__wrap {
                    .el-collapse-item__content {
                        .m-systemgoods-list-item {
                            background-color: @black4-dark;
                            .m-systemgoods-list-item-label {
                                color: @black-80-dark;
                            }
                            .m-systemgoods-list-item-money {
                                color: @black-40-dark;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
