<template>
    <PvxSurface class="p-price-goods overview m-pvx-price__section" padding="medium">
        <PvxSectionHeader
            class="m-pvx-price__section-header"
            :title="$t('pages.pvg.price.ui.sections.follow.title')"
            :description="$t('pages.pvg.price.ui.sections.follow.description')"
        >
            <template #icon><Star /></template>
            <template v-if="myFollowData.length" #action>
                <el-button
                    class="u-manage-follow"
                    plain
                    :title="$t('pages.pvg.price.ui.actions.manageFollow')"
                    :aria-label="$t('pages.pvg.price.ui.actions.manageFollow')"
                    @click="openAddDialog"
                >
                    <el-icon><Setting /></el-icon>
                    <span class="u-manage-follow__label">{{ $t("pages.pvg.price.ui.actions.manageFollow") }}</span>
                </el-button>
            </template>
        </PvxSectionHeader>
        <div class="m-my-follow-goods" v-loading="loading">
            <PvxEmptyState
                v-if="!myFollowData.length"
                :title="isLogin ? $t('pages.pvg.price.ui.empty.followTitle') : $t('pages.pvg.price.ui.empty.loginTitle')"
                :description="isLogin ? $t('pages.pvg.price.ui.empty.followDescription') : $t('pages.pvg.price.ui.empty.loginDescription')"
            >
                <template #icon><Star /></template>
                <template #action>
                    <el-button type="primary" plain @click="openAddDialog">
                        {{ isLogin ? $t("pages.pvg.price.ui.actions.addFollow") : $t("pages.pvg.price.ui.actions.login") }}
                    </el-button>
                </template>
            </PvxEmptyState>
            <myGoodList v-else :data="myFollowPlan" :priceMap="priceMap" :server="server" />
        </div>
        <myGoodsDialog
            v-if="showMyGoods"
            @close="showMyGoods = false"
            :myFollowData="myFollowData"
            @setMyFollowList="setMyFollowList"
        ></myGoodsDialog>
    </PvxSurface>
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
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { Setting, Star } from "@element-plus/icons-vue";
export default {
    props: {
        server: {},
    },
    name: "PriceOverviewGoods",
    components: { myGoodsDialog, myGoodList, PvxEmptyState, PvxSectionHeader, PvxSurface, Setting, Star },
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
            if (!this.server || !this.systemGoodsData.length) return;
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
                this.$message.success(this.$t("pages.pvg.price.ui.messages.followSaved"));
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
    watch: {
        server() {
            this.updatePrice();
        },
    },
};
</script>
