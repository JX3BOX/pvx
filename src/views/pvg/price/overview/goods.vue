<template>
    <div class="p-price-goods overview">
        <div class="m-price-goods-body">
            <div class="m-my-follow-goods">
                <div class="u-title">
                    我的关注
                    <i
                        v-if="myFollowData.length"
                        class="u-btn el-icon-setting"
                        v-popover:myPlans
                        title="设置清单"
                        @click="openAddDialog"
                    ></i>
                </div>
                <div class="m-empty-follow" v-if="myFollowData.length == 0">
                    <div class="m-empty-follow-title" v-loading="loading">
                        {{ isLogin ? "暂无关注" : "暂未登录" }}
                        <span class="m-empty-follow-add" @click="openAddDialog" v-if="isLogin"> 去添加 </span>
                        <span class="m-empty-follow-login" @click="openAddDialog" v-else> 去登陆 </span>
                    </div>
                </div>
                <myGoodList v-else :data="myFollowPlan" :priceMap="priceMap"></myGoodList>
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
import server_std from "@jx3box/jx3box-data/data/server/server_std.json";
import {
    getSystemGoodsData,
    getServerPriceData,
    getMyFollowList,
    setMyFollowList,
    getMyGoodsDetail,
} from "@/service/pvg/price.js"; // 系统关注物品类型
import myGoodList from "../goods/myGoodList.vue";
import myGoodsDialog from "../goods/myGoodsDialog.vue";
import User from "@jx3box/jx3box-common/js/user";
import { getBreadcrumb } from "@jx3box/jx3box-common/js/api_misc";
export default {
    props: {
        server: {},
    },
    components: { myGoodsDialog, myGoodList },
    data() {
        return {
            server_std,
            systemGoodsData: [], // 系统关注物品
            priceMap: {}, // 物品id和价格的映射
            myFollowData: [], // 我的关注清单id
            myFollowPlan: [], // 我的关注清单
            showMyGoods: false,
            loading: false,
            isLogin: User.isLogin(),
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
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
        openAddDialog() {
            if (!this.isLogin) {
                User.toLogin();
            } else {
                this.showMyGoods = true;
            }
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
            this.priceMap = {};
            this.getServerPriceData();
            this.getMyFollowGoodsPrice();
        },
    },
    mounted() {
        if (User.isLogin()) {
            this.getSystemGoodsData();
            this.getMyFollowList();
        } else {
            this.getSystemGoodsData();
        }
    },
};
</script>
<style lang="less">
.p-price-goods {
    position: relative;
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
            margin: 20px 0 20px 0;
            color: #24292e;
            font-size: 32px;
            font-weight: bold;
            line-height: 42px;
        }
        .m-my-follow-goods {
            .u-btn {
                cursor: pointer;
            }
            .m-empty-follow {
                display: flex;
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
                    .m-empty-follow-login {
                        color: #ff9a00;
                        font-weight: bold;
                        text-decoration: underline;
                        cursor: pointer;

                        text-underline-offset: 4px;
                    }
                }
            }
        }
    }
}
</style>
