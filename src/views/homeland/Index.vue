<template>
    <div class="p-homeland">
        <PvxSearch :items="searchItems" :initValue="initSearchValue" @search="handleSearch" />
        <div class="m-homeland-content">
            <!-- 家园信息 -->
            <Tutorial v-if="active === 'info'"></Tutorial>
            <!-- 家园地图 -->
            <Maps v-if="active === 'map'"></Maps>
            <!-- 家园花价 -->
            <Flower v-if="active === 'flower'"></Flower>
            <!-- 家园攻略 -->
            <Bbs v-if="active === 'bbs'"></Bbs>
        </div>
    </div>
</template>

<script>
/**
 * @description 家园模块首页
 * @description 展示家园信息、地图、花价、攻略等内容的入口页面
 * @author ymg
 * @version 1.1.0
 * 
 * @example
 * <Index />
 * 
 * @notes
 * - 使用 PvxSearch 组件实现标签切换和外部链接跳转
 * - 所有选项统一使用 radio 按钮样式，保证小屏幕换行一致
 * - 内部功能模块：家园信息、家园地图、家园花价、家园攻略
 * - 外部链接模块：免费蓝图、付费蓝图、藏品蓝图（通过 handleSearch 处理跳转）
 */
import Tutorial from "./Tutorial.vue";
import Maps from "./Maps.vue";
import Flower from "./Flower.vue";
import Bbs from "./Bbs.vue";
import PvxSearch from "@/components/PvxSearch.vue";

// 外部链接配置
const EXTERNAL_LINKS = {
    free_blueprint: "https://gdca.xoyo.com/jx3/blueprint/index.html",
    paid_blueprint: "https://gdca.xoyo.com/jx3/blueprint/index.html?",
    collection_blueprint: "https://jx3.seasunwbl.com/buyer?t=blueprint",
};

export default {
    name: "Index",
    components: {
        Tutorial,
        Maps,
        Flower,
        Bbs,
        PvxSearch,
    },
    data() {
        return {
            active: "info",
        };
    },
    computed: {
        searchItems() {
            return [
                {
                    type: "radio",
                    key: "active",
                    options: [
                        { type: "info", name: "家园信息" },
                        { type: "map", name: "家园地图" },
                        // { type: "flower", name: "家园花价" },
                        { type: "bbs", name: "家园攻略" },
                        { type: "free_blueprint", name: "免费蓝图" },
                        { type: "paid_blueprint", name: "付费蓝图" },
                        { type: "collection_blueprint", name: "藏品蓝图" },
                    ],
                },
            ];
        },
        initSearchValue() {
            return {
                active: this.active,
            };
        },
    },
    methods: {
        handleSearch(data) {
            const val = data.active;

            // 处理外部链接跳转
            if (EXTERNAL_LINKS[val]) {
                window.open(EXTERNAL_LINKS[val], "_blank");
                return;
            }

            // 处理家园攻略跳转到社区
            if (val === "bbs") {
                window.open("/community?category=心得&page=1", "_self");
                return;
            }

            // 内部模块切换
            this.active = val;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/index.less";

.p-homeland {
    .pvx-search-wrapper {
        .type-list {
            .el-radio-group {
                .flex;
                flex-wrap: wrap;
            }

            .type-item {

                &.is-active,
                &:hover {
                    background-color: @pvx-color-homeland !important;

                    .el-radio-button__inner {
                        background-color: @pvx-color-homeland !important;
                    }
                }
            }
        }
    }
}

@media screen and (max-width: @phone) {
    .p-homeland {
        .pvx-search-wrapper {
            height: auto;

            .search-group {
                flex-wrap: wrap;

                >*+* {
                    margin-top: 10px;
                }

                .search-item.type-list {
                    width: 100%;

                    .el-radio-group {
                        .flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .type-item {
                        flex: 0 0 calc(25% - 6px);
                        .fz(14px);
                        min-width: 80px;
                    }
                }
            }
        }
    }
}

@media screen and (max-width: @ipad) {
    .p-homeland {
        .pvx-search-wrapper {
            .search-item.type-list {
                .el-radio-group {
                    gap: 8px;
                }

                .type-item {
                    .fz(14px);
                }
            }
        }
    }
}
</style>
