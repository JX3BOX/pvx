<template>
    <div class="p-price-goods" v-loading="loading">
        <div class="m-price-goods-header">
            <div class="u-title">物价总览</div>
            <div class="u-servers">
                <el-select v-model="server" placeholder="请选择" :default-first-option="true" @change="updatePrice">
                    <div slot="prefix">区服价格</div>
                    <el-option v-for="server in serverList" :key="server" :label="server" :value="server"> </el-option>
                </el-select>
            </div>
        </div>
        <div class="m-price-goods-body">
            <div class="m-system-goods">
                <systemGoodList :data="systemGoodsDataFilter" :priceMap="priceMap"></systemGoodList>
            </div>
        </div>
        <myGoodsDialog
            v-if="showMyGoods"
            @close="showMyGoods = false"
            :myFollowData="myFollowData"
            @setMyFollowList="setMyFollowList"
        ></myGoodsDialog>
    </div>
</template>
<script>
import server_cn from "@jx3box/jx3box-data/data/server/server_cn.json";
import server_origin from "@jx3box/jx3box-data/data/server/server_origin.json";

import {
    getSystemGoodsData,
    getServerPriceData,
    getUserInfo,
    getMyFollowList,
    setMyFollowList,
    getMyGoodsDetail,
} from "@/service/pvg/price.js"; // 系统关注物品类型
import systemGoodList from "./systemGoodList.vue";
import myGoodsDialog from "./myGoodsDialog.vue";
import User from "@jx3box/jx3box-common/js/user";

export default {
    props: { keywords: {} },
    components: { systemGoodList, myGoodsDialog },
    data() {
        return {
            server: "",
            systemGoodsData: [], // 系统关注物品
            priceMap: {}, // 物品id和价格的映射
            myFollowData: [], // 我的关注清单id
            myFollowPlan: [], // 我的关注清单
            showMyGoods: false,
            loading: false,
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        serverList() {
            return this.client == "std" ? server_cn : server_origin;
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
        openAddDialog() {
            this.showMyGoods = true;
        },
        setMyFollowList(val) {
            // 此处接口不支持不传，传空后前端过滤id为0的数据
            setMyFollowList({ val }).then((res) => {
                this.showMyGoods = false;
                this.$message.success("设置成功");
                this.getMyFollowList();
            });
        },
        updatePrice() {
            this.getServerPriceData();
            this.getMyFollowGoodsPrice();
        },
    },
    mounted() {
        if (User.isLogin() && this.client === "std") {
            getUserInfo().then((res) => {
                this.server = res.data?.data?.jx3_server || "梦江南";
                this.getSystemGoodsData();
                this.getMyFollowList();
            });
        } else {
            this.server = this.client == "std" ? "梦江南" : "缘起稻香";
            this.getSystemGoodsData();
            if (User.isLogin()) {
                this.getMyFollowList();
            }
        }
    },
};
</script>
<style lang="less">
.p-price-goods {
    .pr;
    .pt(20px);
    .m-price-goods-header {
        display: flex;
        align-items: center;

        gap: 20px;
        .u-title {
            margin: 20px 0 20px 0;
            color: #24292e;
            font-size: 32px;
            font-weight: bold;
            line-height: 42px;
        }
        .u-servers {
            position: relative;
            width: 200px;
            background-color: #fff;
            border-radius: 40px;
            .el-input__prefix {
                display: flex;
                align-items: center;
                padding-left: 15px;
                color: #949494;
                font-size: 16px;
                font-weight: bold;
                line-height: 40px;
            }

            .el-input__inner {
                height: 40px;
                padding-left: 100px;
                color: #24292e;
                font-size: 16px;
                font-weight: bold;
                line-height: 40px;
                border: none;
                border-radius: 40px;
            }
        }
    }
    .m-price-goods-body {
        .u-title {
            .bold;
            .fz(28px,1.2);
            margin: 20px 0 20px 0;
            color: #24292e;
        }
        .m-my-follow-goods {
            .u-btn {
                .pointer;
            }
            .m-empty-follow {
                .flex;
                justify-content: center;
                align-items: center;
                width: 384px;
                height: 100px;
                padding: 0 10px;
                color: #999;
                border: 1px dashed #999;
                border-radius: 10px;
                .m-empty-follow-title {
                    font-size: 20px;
                    .m-empty-follow-add {
                        color: #ff9a00;
                        font-weight: bold;
                        cursor: pointer;
                    }
                }
            }
        }
    }
}

@media screen and (max-width: @ipad) {
    .p-price-goods:not(.overview) {
        .u-title {
            margin: 0;
            font-size: 24px;
        }
    }
    .m-price-goods-header {
        flex-wrap: wrap;
        margin-bottom: 20px;
    }
}
@media screen and (max-width: @phone) {
    .p-price-goods {
        .pt(64px);
    }
}
</style>
