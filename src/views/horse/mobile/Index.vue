<template>
    <div class="p-pvx-horse-mobile" @scroll="handleScroll">
        <SuspendCommon :btnOptions="{ showHome: true }"
            :drawerOptions="{ hideType: ['collect', 'rss', 'laterOn', 'pin', 'user', 'report'] }" @search="search">
            <template #default>
                <!--                切换按钮区域-->
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="switchType('cutShow')">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                        切换
                    </div>
                    <div class="u-btn-item" @click="switchType('filtrateShow')">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/filter_disabled_touchbar.svg" svg-inline />
                        筛选
                    </div>
                </div>
            </template>
        </SuspendCommon>
        <el-drawer v-model="showForm" direction="btt" :with-header="false" :modal-append-to-body="false" append-to-body
            class="c-drawer">
            <!--类型区域-->
            <transition :name="cutShowTra ? 'slide-up' : ''">
                <div class="m-cut" v-show="cutShow">
                    <div class="u-cut-box">
                        <div class="u-cut-item" :class="{ 'is-active': listQueryParams.type === '' }"
                            @click="cutChange('')">
                            <img class="u-icon" src="@/assets/img/pvxsuspension/all.svg" svg-inline />
                            全部
                        </div>
                        <div class="u-cut-item" v-for="(item, index) in typeList.slice(1)" :key="index"
                            :class="{ 'is-active': listQueryParams.type === item.type }" @click="cutChange(item.type)">
                            <img src="@/assets/img/house/mj.svg" svg-inline v-show="item.type == 2" />
                            <img src="@/assets/img/house/mp.svg" svg-inline v-show="item.type == 0" />
                            <img src="@/assets/img/house/qq.svg" svg-inline v-show="item.type == 1" />
                            {{ item.mobile_label }}
                        </div>
                    </div>
                    <div class="u-cut-btn">
                        <div class="u-report-btn" @click="filtrateReport(1)">重置</div>
                        <div class="u-confirm-btn" :class="{ active: paramsIsChange }" @click="cutConfirm()">确定</div>
                    </div>
                </div>
            </transition>
            <!--            请先选择类型区域-->
            <div class="m-no-body" v-show="noActive">
                <div class="u-icon">
                    <img src="@/assets/img/pvxsuspension/report.svg" svg-inline />
                    <div class="u-tips">请先选择类型</div>
                </div>
                <div class="u-btn" @click="switchType('selectBody')">选择类型</div>
            </div>

            <!--                筛选区域-->
            <div class="m-filtrate" v-if="filtrateShow">
                <div v-for="(searchItem, index) in searchType" :key="searchItem.key">
                    <div class="u-filtrate-title">{{ searchItem.name }}</div>
                    <div class="u-box" :class="searchItem.key">
                        <div class="u-item" :class="{ active: searchItem.checked.indexOf(item.label) !== -1 }"
                            @click="filtrateParams(index, item.label)" v-for="item in searchItem.list" :key="item.id">
                            {{ item.label }}
                        </div>
                    </div>
                </div>

                <div class="u-btn">
                    <div class="u-report-btn" @click="filtrateReport()">重置</div>
                    <div class="u-confirm-btn" :class="{ active: paramsIsChange }" @click="filtrateConfirm()">确定</div>
                </div>
            </div>
        </el-drawer>
        <!--        整体首页部分-->
        <div v-if="!showAll">
            <!--        普通坐骑-->
            <div class="m-title">普通坐骑</div>
            <div class="m-pvx-horse-card">
                <div class="u-item" v-for="item in typeList?.[1]?.list" :key="item?.ID" @click="openOther(item, 0)">
                    <img :src="getImgSrc(item, true)" @error="replaceByDefault" class="u-pvx-horse-img" />
                    <div class="u-pvx-horse-name">
                        <scrollingText :showText="item.Name" />
                    </div>
                    <div class="u-id">ID：{{ item.ID }}</div>
                </div>
            </div>
            <!--        马具-->
            <div class="m-title">马具</div>
            <div class="m-harness-card">
                <div class="u-harness-item" v-for="item in typeList?.[3]?.list" :key="item?.ID"
                    @click="openOther(item, 2)">
                    <!--                    <img :src="getImgSrc(item, true)"  @error="replaceByDefault" class="u-img" />-->
                    <item-icon :item_id="String(item.ItemID)" :isLink="false" :size="38" :onlyIcon="true"></item-icon>
                    <div class="u-info">
                        <div class="u-pvx-horse-name">
                            <scrollingText :showText="item.Name" />
                            <!--                            {{ item.Name }}-->
                        </div>
                        <div class="u-id">ID：{{ item.ID }}</div>
                    </div>
                </div>
            </div>
            <!--        奇趣坐骑-->
            <div class="m-title">奇趣坐骑</div>
            <div class="m-pvx-horse-card">
                <div class="u-item" v-for="item in typeList?.[2]?.list" :key="item?.ID" @click="openOther(item, 1)">
                    <img :src="getImgSrc(item, true)" @error="replaceByDefault" class="u-pvx-horse-img" />
                    <div class="u-pvx-horse-name">
                        <scrollingText :showText="item.Name" />
                    </div>
                    <div class="u-id">ID：{{ item.ID }}</div>
                </div>
            </div>
        </div>
        <div class="m-list" v-else>
            <!--        坐骑类列表-->
            <div class="m-pvx-horse-card" v-if="showHorse">
                <div class="u-item" v-for="item in listData" :key="'list' + item.ID"
                    @click="openOther(item, listQueryParams.type)">
                    <img :src="getImgSrc(item, true)" @error="replaceByDefault" class="u-pvx-horse-img" />
                    <div class="u-pvx-horse-name">
                        <scrollingText :showText="item.Name" />
                    </div>
                    <div class="u-id">ID：{{ item.ID }}</div>
                </div>
                <img src="@/assets/img/common/empty.png" v-show="!listData.length" />
            </div>
            <!--        马具列表-->
            <div class="m-harness-card" v-else>
                <div class="u-harness-item" v-for="item in listData" :key="'list' + item.ID"
                    @click="openOther(item, 1)">
                    <item-icon :item_id="String(item.ItemID)" :isLink="false" :size="38" :onlyIcon="true"></item-icon>
                    <div class="u-info">
                        <div class="u-pvx-horse-name">
                            <scrollingText :showText="item.Name" />
                        </div>
                        <div class="u-id">ID：{{ item.ID }}</div>
                    </div>
                </div>
                <img src="@/assets/img/common/empty.png" v-show="!listData.length" />
            </div>
        </div>
    </div>
</template>
<script>
import { getHorses, getFeeds, getAttrs } from "@/service/horse";
import horseData from "@/assets/data/horse.json";
import { omit, cloneDeep, concat } from "lodash";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import ItemIcon from "@/components/common/item_icon.vue";
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import { __cdn } from "@/utils/config";
import { getHorseImgSrc, handleHorseImgError } from "@/utils/horse";
import scrollingText from "@/components/horse/mobile/scrollingText.vue";
import { wxNewPage } from "@/utils/minprogram";
import wx from "weixin-js-sdk";
const { list, searchType, showTypes } = horseData;
export default {
    name: "HorseHome",
    components: { ItemIcon, SuspendCommon, scrollingText },
    inject: ["__imgRoot", "__imgRoot2"],
    data() {
        return {
            loading: false,
            isFinish: false,
            feeds: [],
            attrs: [],
            typeList: [],
            list,
            searchType,
            showTypes,

            showForm: false, // 是否显示筛选表单
            cutShowTra: false,
            cutShow: false,
            filtrateShow: false,
            noActive: false,
            paramsIsChange: false,
            listQueryParams: {
                per: 21,
                page: 1,
                type: "",
            },
            showAll: false,
            showHorse: false, //显示坐骑类
            total: 0, //总条目数
            listData: [],
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        list: {
            immediate: true,
            handler: function (_list) {
                let list = cloneDeep(_list);
                this.typeList = list;
            },
        },
    },
    created() {
        this.loadInfoData();
        this.loadData();
        this.listQueryParams.client = this.client;
    },

    methods: {
        handleScroll(event) {
            if (!this.showAll) return;
            const { target } = event;
            if (this.loading || this.isFinish) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.listQueryParams.page++;
                let params = cloneDeep(this.listQueryParams);
                params.feed = this.searchType[0].checked.join(",");
                params.attr = this.searchType[1].checked.join(",");
                this.showForm = false;
                this.filtrateShow = false;
                this.loadList(params, "all");
            }
        },
        iconLink,
        replaceByDefault(e) {
            handleHorseImgError(e);
        },
        getImgSrc(item, isAuto = false) {
            return getHorseImgSrc(item, this.client, this.__imgRoot, this.__imgRoot2, isAuto);
        },
        openOther(item, type) {
            wxNewPage(`/horse/${item.ItemID}?type=${type}`);
        },
        search() {
            wx.miniProgram.navigateTo({
                url: `/pages/search/search-detail/search-detail?app=坐骑&filter_name=pvxhorse`,
            });
        },
        switchType(type) {
            if (!type) return;
            this.cutShowTra = false;
            if (type == "cutShow") {
                this.filtrateShow = false;
                this.noActive = false;
                this.cutShow = true;
            } else if (type == "filtrateShow") {
                if (this.listQueryParams.type === "") {
                    this.cutShow = false;
                    this.filtrateShow = false;
                    this.noActive = true;
                } else {
                    this.cutShow = false;
                    this.noActive = false;
                    this.filtrateShow = true;
                }
            } else if (type == "selectBody") {
                this.cutShowTra = true;
                this.cutShow = true;
                this.filtrateShow = false;
                this.noActive = false;
            }
            this.showForm = true;
        },
        cutChange(type) {
            this.paramsIsChange = true;
            this.listQueryParams.type = type;
        },
        filtrateParams(index, value) {
            this.paramsIsChange = true;
            // 如果包含，则执行移除操作，不包含则push进入数组this.searchType[index].checked
            if (this.searchType[index].checked.includes(value)) {
                this.searchType[index].checked = this.searchType[index].checked.filter((item) => item !== value);
            } else {
                this.searchType[index].checked.push(value);
            }
        },
        cutConfirm() {
            this.listQueryParams.page = 1;
            this.listData = [];
            this.paramsIsChange = false;
            // 将searchTypne内的选中全部置空
            this.searchType.forEach((item) => {
                item.checked = [];
            });
            let params = cloneDeep(this.listQueryParams);
            params.type !== "" ? (this.showAll = true) : (this.showAll = false);
            if (params.type !== "") {
                this.showAll = true;
                params.type == 2 ? (this.showHorse = false) : (this.showHorse = true);
            } else {
                this.showAll = false;
            }
            this.loadList(params, "all");
        },
        filtrateConfirm() {
            this.listQueryParams.page = 1;
            this.listData = [];
            let params = cloneDeep(this.listQueryParams);
            params.feed = this.searchType[0].checked.join(",");
            params.attr = this.searchType[1].checked.join(",");
            this.showForm = false;
            this.filtrateShow = false;
            this.loadList(params, "all");
        },
        filtrateReport(type) {
            if (type) {
                this.showAll = false;
                this.listQueryParams.type = "";
            }
            (this.isFinish = false), (this.paramsIsChange = true);
            // 将searchTypne内的选中全部置空
            this.searchType.forEach((item) => {
                item.checked = [];
            });
            this.filtrateConfirm();
        },
        loadInfoData() {
            getFeeds({ client: this.client }).then((res) => {
                const arr = res.data.map((item) => {
                    const start = item.tip.indexOf("【");
                    const end = item.tip.indexOf("】");
                    item.feed = item.tip.slice(start + 1, end);
                    return item;
                });
                let newArr = [];
                arr.forEach((item) => {
                    const index = newArr.findIndex((nItem) => nItem.feed === item.feed);
                    if (index > -1) {
                        newArr[index].id += "," + item.id;
                    } else {
                        newArr.push(item);
                    }
                });
                this.feeds = newArr.map((item) => {
                    return {
                        label: item.feed,
                        value: item.id,
                    };
                });

                this.searchType[0].list = this.feeds;
            });
            getAttrs({ client: this.client }).then((res) => {
                const data = res.data;
                const options = data.map((item) => {
                    return {
                        label: item.name,
                        value: item.name,
                    };
                });
                this.attrs = options;
                this.searchType[1].list = this.attrs;
            });
        },

        loadData() {
            if (this.listQueryParams.type === "") {
                this.typeList.forEach((item) => {
                    if (item.value != -1) {
                        let params = {
                            page: 1,
                            type: item.type,
                            per: item.type == 2 ? 6 : 9,
                        };
                        this.loadList(params, item.type);
                    }
                });
            }
        },
        loadList(params, key) {
            this.loading = true;
            const index = this.typeList.findIndex((e) => e.type === key);
            getHorses(params)
                .then((res) => {
                    const { list, total, pages, page, per } = res.data;

                    if (key != "all") {
                        this.typeList[index].list = list || [];
                        this.typeList[index].page = page || 1;
                        this.typeList[index].pages = pages || 1;
                    } else {
                        this.listData = this.listData.concat(list) || [];
                        this.total = total;
                        if (this.listQueryParams.page == pages) this.isFinish = true;
                    }
                })
                .finally(() => {
                    this.loading = false;
                    this.showForm = false;
                });
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/horse/miniprogram/index.less";
</style>
