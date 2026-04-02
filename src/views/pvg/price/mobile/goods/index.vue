<template>
    <div class="m-price-goods" v-loading="loading">
        <div class="m-search-box">
            <img class="m-search-icon" svg-inline src="@/assets/img/pvg/price/material-symbols_search.svg" />
            <input class="m-search-field" v-model="keywords" type="text" placeholder="你想要搜索什么？" />
        </div>
        <systemGoodList :data="systemGoodsDataFilter" :priceMap="priceMap"></systemGoodList>
    </div>
</template>
<script>
import { getSystemGoodsData, getServerPriceData, getMyFollowList, getMyGoodsDetail } from "@/service/pvg/price.js"; // 系统关注物品类型
import systemGoodList from "./systemGoodList.vue";
import User from "@jx3box/jx3box-common/js/user";

export default {
    props: { server: {} },
    components: { systemGoodList },
    data() {
        return {
            systemGoodsData: [], // 系统关注物品
            priceMap: {}, // 物品id和价格的映射
            myFollowData: [], // 我的关注清单id
            myFollowPlan: [], // 我的关注清单
            loading: false,
            keywords: "",
        };
    },
    watch: {
        server() {
            this.getServerPriceData();
            this.getMyFollowGoodsPrice();
        },
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        myFollowPlanFilter() {
            let data = JSON.parse(JSON.stringify(this.myFollowPlan));
            if (this.keywords) {
                data.forEach((item) => {
                    item.relation.forEach((item2) => {
                        item2.data = item2.data.filter((item3) => {
                            return item3.Name && item3.Name.indexOf(this.keywords) > -1;
                        });
                    });
                });
            }
            data = data.filter((item) => {
                return item.relation.some((item2) => {
                    return item2.data.length > 0;
                });
            });

            return data;
        },
        systemGoodsDataFilter() {
            let data = JSON.parse(JSON.stringify(this.systemGoodsData));
            if (this.keywords) {
                data.forEach((item) => {
                    item.items = item.items.filter((item2) => {
                        return item2.label && item2.label.indexOf(this.keywords) > -1;
                    });
                });
            }
            data = data.filter((item) => {
                return item.items.length > 0;
            });
            return data;
        },
    },
    methods: {
        getSystemGoodsData() {
            getSystemGoodsData({ client: this.client }).then((res) => {
                this.systemGoodsData = res.data.data;
                this.getServerPriceData();
            });
        },
        getServerPriceData() {
            const flatList = [];
            this.systemGoodsData.forEach((group) => {
                group.items.forEach((item) => {
                    flatList.push(item.item_id);
                });
            });
            this.loading = true;
            getServerPriceData({
                item_ids: flatList,
                server: this.server,
                aggregate_type: "hourly",
            })
                .then((res) => {
                    const data = res.data;
                    this.priceMap = {};
                    data.forEach((item) => {
                        this.priceMap[item.item_id] = item.price;
                    });
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        getMyFollowList() {
            this.loading = true;
            getMyFollowList().then((res) => {
                if (res.data.data) {
                    this.myFollowData = res.data.data
                        .split(",")
                        .map((item) => +item)
                        .filter((item) => !!item);
                } else {
                    this.myFollowData = [];
                }
                const allPromises = [];
                this.myFollowData.forEach((id) => {
                    const p = this.getPlan(id);
                    allPromises.push(p);
                });
                Promise.allSettled(allPromises).then((res) => {
                    this.loading = false;
                    this.myFollowPlan = (res || [])
                        .filter((item) => item.status === "fulfilled")
                        .map((item) => item.value);
                    this.getMyFollowGoodsPrice();
                });
            });
        },
        getPlan(id) {
            return new Promise((resolve, reject) => {
                getMyGoodsDetail(id)
                    .then((res) => {
                        resolve(res.data.data);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        },
        getMyFollowGoodsPrice() {
            const ids = [];
            const idsMap = {};
            this.myFollowPlan.forEach((plan) => {
                plan.relation.forEach((item) => {
                    item.data.forEach((good) => {
                        const id = good.id;
                        if (this.priceMap[id] == undefined && idsMap[id] == undefined) {
                            ids.push(id);
                            idsMap[id] = true;
                        }
                    });
                });
            });
        },
        updatePrice() {
            this.getServerPriceData();
            this.getMyFollowGoodsPrice();
        },
    },
    mounted() {
        this.getSystemGoodsData();
        if (User.isLogin()) {
            this.getMyFollowList();
        }
    },
};
</script>
<style lang="less">
@brand4: #fff;
@brand4-dark: #282828;

.m-search-box {
    position: relative;
    .m-search-icon {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 12px;
        width: 24px;
        fill: #1c1c1c;
    }
    .m-search-field {
        padding: 10px 12px;
        padding-left: 48px;
        width: 100%;
        display: block;
        box-sizing: border-box;
        border: none;
        .fz(14px, 20px);
        border-radius: 8px;
        background-color: @brand4;
        border: 1px solid rgba(40, 40, 40, 0.05);
        color: #1c1c1c;
    }
}
@media (prefers-color-scheme: dark) {
    .m-search-box {
        .m-search-icon {
            fill: #ffffff;
        }
        .m-search-field {
            background-color: @brand4-dark;
            color: #ffffff;
        }
    }
}
</style>
