<template>
    <div class="p-price-goods" v-loading="loading">
        <PvxSurface class="m-pvx-price__section" padding="medium">
            <PvxSectionHeader
                class="m-pvx-price__section-header"
                :title="$t('pages.pvg.price.ui.sections.goods.title')"
                :description="$t('pages.pvg.price.ui.sections.goods.description')"
            >
                <template #icon><Goods /></template>
            </PvxSectionHeader>
            <systemGoodList
                v-if="systemGoodsDataFilter.length"
                :data="systemGoodsDataFilter"
                :priceMap="priceMap"
                :server="server"
            />
            <PvxEmptyState
                v-else-if="!loading"
                :title="$t('pages.pvg.price.ui.empty.goodsTitle')"
                :description="$t('pages.pvg.price.ui.empty.goodsDescription')"
            >
                <template #icon><Search /></template>
            </PvxEmptyState>
        </PvxSurface>
        <myGoodsDialog
            v-if="showMyGoods"
            @close="showMyGoods = false"
            :myFollowData="myFollowData"
            @setMyFollowList="setMyFollowList"
        ></myGoodsDialog>
    </div>
</template>
<script>
import {
    getSystemGoodsData,
    getServerPriceData,
    getMyFollowList,
    setMyFollowList,
    getMyGoodsDetail,
} from "@/service/pvg/price.js"; // 系统关注物品类型
import systemGoodList from "./systemGoodList.vue";
import myGoodsDialog from "./myGoodsDialog.vue";
import User from "@jx3box/jx3box-common/js/user";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { Goods, Search } from "@element-plus/icons-vue";

export default {
    props: {
        keywords: { type: String, default: "" },
        server: { type: String, default: "" },
    },
    name: "PriceGoods",
    components: {
        systemGoodList,
        myGoodsDialog,
        PvxEmptyState,
        PvxSectionHeader,
        PvxSurface,
        Goods,
        Search,
    },
    data() {
        return {
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
            if (!this.server || !this.systemGoodsData.length) return;
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
                this.$message.success(this.$t("pages.pvg.price.ui.messages.followSaved"));
                this.getMyFollowList();
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
    watch: {
        server() {
            this.updatePrice();
        },
    },
};
</script>
