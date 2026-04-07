<template>
    <div class="p-homeland">
        <PvxSearch :items="searchItems" :initValue="initSearchValue" @search="handleSearch" />
        <div class="m-homeland-content">
            <!-- 家园信息 -->
            <Tutorial v-if="active === 0"></Tutorial>
            <!-- 家园地图 -->
            <Maps v-if="active === 1"></Maps>
            <!-- 家园花价 -->
            <Flower v-if="active === 2"></Flower>
            <!-- 家园攻略 -->
            <Bbs v-if="active === 3"></Bbs>
        </div>
    </div>
</template>

<script>
import Tutorial from "./Tutorial.vue";
import Maps from "./Maps.vue";
import Flower from "./Flower.vue";
import Bbs from "./Bbs.vue";
import PvxSearch from "@/components/PvxSearch.vue";

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
            active: 0,
            tabs: [
                {
                    label: "家园信息",
                    value: 0,
                },
                {
                    label: "家园地图",
                    value: 1,
                },
                {
                    label: "家园攻略",
                    value: 3,
                },
            ],
            externalLinks: [
                {
                    label: "免费蓝图",
                    link: "https://gdca.xoyo.com/jx3/blueprint/index.html",
                },
                {
                    label: "付费蓝图",
                    link: "https://gdca.xoyo.com/jx3/blueprint/index.html?",
                },
                {
                    label: "藏品蓝图",
                    link: "https://jx3.seasunwbl.com/buyer?t=blueprint",
                },
            ],
        };
    },
    computed: {
        searchItems() {
            const options = this.tabs.map((item) => ({
                type: item.value,
                name: item.label,
            }));
            this.externalLinks.forEach((item) => {
                options.push({
                    type: item.label,
                    name: item.label,
                    link: item.link,
                });
            });
            return [
                {
                    type: "radio",
                    key: "active",
                    options: options,
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
        toTip() {
            return this.$message({
                type: "warning",
                message: "即将上线，敬请期待！",
            });
        },
        handleSearch(data) {
            const val = data.active;
            if (val === 3) {
                window.open("/community?category=心得&page=1", "_self");
                return;
            }
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
            .type-item {

                &.is-active,
                &:hover {
                    background-color: @homelandColor !important;

                    .el-radio-button__inner {
                        background-color: @homelandColor !important;
                    }
                }
            }

            a.type-item {
                &:hover {
                    background-color: @homelandColor !important;
                    color: #fff;
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
                gap: 10px;

                .search-item.type-list {
                    width: 100%;
                    flex-wrap: wrap;
                    gap: 10px;

                    .el-radio-group {
                        flex-wrap: wrap;
                        gap: 10px;
                    }

                    .type-item {
                        width: calc(33% - 6px);
                        .fz(14px);
                    }
                }
            }
        }
    }
}
</style>
