<template>
    <div class="m-price-overview-body">
        <goldCharts :server="server" :active="active" v-if="server" />
        <myGoodList :data="myFollowPlan" :priceMap="priceMap" v-if="active == ''" />
    </div>
</template>
<script>
import goldCharts from "./goldCharts.vue";
import myGoodList from "./myGoodList.vue";
import User from "@jx3box/jx3box-common/js/user";
import { getSystemGoodsData, getServerPriceData, getMyFollowList, getMyGoodsDetail } from "@/service/pvg/price.js"; // 系统关注物品类型
export default {
    components: { goldCharts, myGoodList },
    props: {
        server: {
            type: String,
            default: "",
        },
        active: {},
    },
    data() {
        return {
            myFollowPlan: [], // 我的关注清单
            priceMap: {}, // 价格map
            systemGoodsData: [], // 系统关注物品
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        server() {
            this.priceMap = {};
            this.getServerPriceData();
            this.getMyFollowGoodsPrice();
        },
    },
    created() {
        if (User.isLogin()) {
            this.getSystemGoodsData();
            this.getMyFollowList();
        } else {
            this.getSystemGoodsData();
        }
    },
    methods: {
        getSystemGoodsData() {
            getSystemGoodsData({ client: this.client }).then((res) => {
                this.systemGoodsData = res.data.data;
                this.getServerPriceData();
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
        getServerPriceData() {
            const flatList = [];
            this.systemGoodsData.forEach((group) => {
                group.items.forEach((item) => {
                    flatList.push(item.item_id);
                });
            });
            getServerPriceData({
                item_ids: flatList,
                server: this.server,
                aggregate_type: "hourly",
            }).then((res) => {
                const data = res.data;
                this.priceMap = {};
                data.forEach((item) => {
                    this.priceMap[item.item_id] = item.price;
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
            this.myFollowPlan?.length &&
                this.myFollowPlan.forEach((plan) => {
                    plan?.relation.forEach((item) => {
                        item?.data.forEach((good) => {
                            const id = good.id;
                            if (this.priceMap[id] == undefined && idsMap[id] == undefined) {
                                ids.push(id);
                                idsMap[id] = true;
                            }
                        });
                    });
                });
        },
    },
};
</script>
<style lang="less"></style>
