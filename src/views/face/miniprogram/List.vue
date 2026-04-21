<!--
 * @Author: zhusha
 * @Date: 2025-02-17 23:22:35
 * @LastEditors: zhusha
 * @LastEditTime: 2025-04-20 00:00:00
 * @Description: 小程序捏脸列表 - 重构版
 * 使用 MiniappFilterDrawer 组件替换内嵌筛选逻辑
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <div class="m-face-list_mobile">
        <!-- 悬浮操作栏 -->
        <SuspendCommon
            :btnOptions="{ showHome: true }"
            :drawerOptions="{ hideType: ['collect', 'rss', 'laterOn', 'pin', 'user', 'report'] }"
            @search="search"
        >
            <template #default>
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="handleOpenDrawer('cut')">
                        <img class="u-icon" :src="getActiveIcon" svg-inline />
                        {{ habitusName }}
                    </div>
                    <div class="u-btn-item" @click="handleOpenDrawer('filter')">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/filter_disabled_touchbar.svg" svg-inline />
                        筛选
                    </div>
                </div>
            </template>
        </SuspendCommon>

        <!-- 筛选抽屉 -->
        <MiniappFilterDrawer
            v-model="showDrawer"
            :showCut="showCut"
            :showFiltrate="showFiltrate"
            :noBody="noBody"
            :typeList="tabsData"
            :active="active"
            :filterParams="filterParams"
            type="face"
            @confirm="handleCutConfirm"
            @filtrate-confirm="handleFilterConfirm"
            @select-body="handleSelectBody"
        />

        <!-- 全部体型视图 -->
        <div class="u-content-all" v-if="active === -1">
            <div v-for="(item, index) in allList" :key="index" class="u-content-item">
                <div class="u-card-title">{{ item.label }}</div>
                <div class="u-list">
                    <routine :list="item.list" />
                </div>
            </div>

            <div class="u-card-title">体型特辑</div>
            <div class="u-list body">
                <habitus :list="bodyList" @toTab="handleToTab" />
            </div>
        </div>

        <!-- 单个体型视图 -->
        <div class="u-content" v-else>
            <div class="u-list" id="oneList" v-loading="loadingList">
                <routine
                    gap="0.667rem"
                    size="5.778rem"
                    :isOne="true"
                    :list="list"
                    :total="total"
                    :loadingList="loadingList"
                    :isFinish="isFinish"
                    v-if="listShow"
                    @getMore="handleLoadMore"
                />
            </div>
        </div>
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import MiniappFilterDrawer from "@/components/common/face-body/miniprogram/MiniappFilterDrawer";
import habitus from "@/components/common/face-body/miniprogram/habitus.vue";
import routine from "@/components/common/face-body/miniprogram/routine.vue";
import { concat } from "lodash";
import { getFaceList } from "@/service/face";
import wx from "weixin-js-sdk";

export default {
    name: "FaceListMiniprogram",
    components: { SuspendCommon, MiniappFilterDrawer, routine, habitus },
    data() {
        return {
            type: "face",
            loading: false,
            loadingList: false,
            listShow: false,
            isFinish: false,

            // 体型相关
            active: -1,
            tabsData: [
                { label: "成男", value: 1, client: ["std", "origin"] },
                { label: "成女", value: 2, client: ["std", "origin"] },
                { label: "正太", value: 5, client: ["std"] },
                { label: "萝莉", value: 6, client: ["std", "origin"] },
            ],

            // 抽屉状态
            showDrawer: false,
            showCut: false,
            showFiltrate: false,
            noBody: false,

            // 列表数据
            list: [],
            total: 0,
            queryParams: {
                pageIndex: 1,
                pageSize: 15,
            },

            // 全部体型数据
            allList: [
                {
                    label: "最新推荐",
                    list: [],
                    params: {
                        star: 1,
                        pageIndex: 1,
                        pageSize: 12,
                        filter_empty_images: true,
                        code_mode: 1,
                        is_personal_newest: 1,
                    },
                },
                {
                    label: "写实派与写意派",
                    list: [],
                    params: {
                        pageIndex: 1,
                        pageSize: 12,
                        filter_empty_images: true,
                        star: 0,
                        is_unlimited: 0,
                        is_personal_newest: 1,
                    },
                },
                {
                    label: "新建角色时推荐",
                    list: [],
                    params: {
                        is_unlimited: 1,
                        pageIndex: 1,
                        pageSize: 12,
                        filter_empty_images: true,
                        star: 0,
                        is_personal_newest: 1,
                    },
                },
            ],
            bodyList: [],

            // 筛选参数
            filterParams: {
                filter_empty_images: "1",
                star: "",
                price_type: "",
                is_unlimited: "",
                is_new_face: "",
                code_mode: "",
            },
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        habitusName() {
            if (this.active === -1) return "体型";
            const item = this.tabsData.find((t) => t.value === this.active);
            return item ? item.label : "体型";
        },
        getActiveIcon() {
            const iconMap = {
                "-1": require("@/assets/img/pvxsuspension/switch_touchbar.svg"),
                1: require("@/assets/img/pvxsuspension/man.svg"),
                2: require("@/assets/img/pvxsuspension/woman.svg"),
                5: require("@/assets/img/pvxsuspension/boy.svg"),
                6: require("@/assets/img/pvxsuspension/girl.svg"),
            };
            return iconMap[this.active] || iconMap["-1"];
        },
    },
    mounted() {
        this.loadData();
    },
    methods: {
        // 搜索
        search() {
            wx.miniProgram.navigateTo({
                url: `/pages/search/search-detail/search-detail?app=捏脸&filter_name=pvxface`,
            });
        },

        // 打开抽屉
        handleOpenDrawer(type) {
            if (type === "cut") {
                this.showCut = true;
                this.showFiltrate = false;
                this.noBody = false;
            } else if (type === "filter") {
                if (this.active === -1) {
                    this.showCut = false;
                    this.showFiltrate = false;
                    this.noBody = true;
                } else {
                    this.showCut = false;
                    this.showFiltrate = true;
                    this.noBody = false;
                }
            }
            this.showDrawer = true;
        },

        // 选择体型（从提示区域点击）
        handleSelectBody() {
            this.showCut = true;
            this.showFiltrate = false;
            this.noBody = false;
        },

        // 确认体型选择
        handleCutConfirm(val) {
            this.active = val;
            this.isFinish = false;
            this.queryParams.body_type = val !== -1 ? val : "";
            this.queryParams.pageIndex = 1;
            this.list = [];
            this.listShow = false;
            if (val !== -1) {
                this.loadData();
            }
        },

        // 确认筛选
        handleFilterConfirm(params) {
            this.filterParams = { ...params };
            this.queryParams.pageIndex = 1;
            this.list = [];
            this.isFinish = false;
            this.listShow = false;
            this.loadData();
        },

        // 跳转到体型标签
        handleToTab(val) {
            this.active = val.body_type;
            this.queryParams.body_type = val.body_type;
            this.queryParams.pageIndex = 1;
            this.list = [];
            this.listShow = false;
            this.isFinish = false;
            if (val.body_type !== -1) {
                this.loadData();
            }
        },

        // 加载更多
        handleLoadMore() {
            this.queryParams.pageIndex++;
            this.loadData();
        },

        // 加载数据
        loadData() {
            this.loading = true;
            if (this.active === -1) {
                this.allList.forEach((item, index) => {
                    this.loadList({ client: this.client, ...item.params }, index);
                });
                // 加载体型特辑
                [1, 2, 5, 6].forEach((bodyType, index) => {
                    this.loadList(
                        {
                            client: this.client,
                            body_type: bodyType,
                            star: 1,
                            pageIndex: 1,
                            pageSize: 1,
                            filter_empty_images: true,
                        },
                        index,
                        true
                    );
                });
            } else {
                this.loadList({
                    client: this.client,
                    ...this.queryParams,
                    ...this.filterParams,
                    body_type: this.active,
                });
            }
        },

        // 加载列表
        loadList(params, index, isBody = false) {
            this.loadingList = true;
            if (this.isFinish && !isBody) return;

            getFaceList(params)
                .then((res) => {
                    const { list, page } = res.data.data;
                    const _list = this.active !== -1 ? concat(this.list, list || []) : list;

                    if (isBody) {
                        this.bodyList.push(_list[0]);
                        return;
                    }

                    if (this.active !== -1) {
                        if (!list || list.length < params.pageSize) this.isFinish = true;
                        this.list = _list || [];
                        this.queryParams.pageIndex = page.index || 1;
                        this.total = page.total;
                    } else {
                        this.allList[index].list = _list || [];
                    }
                })
                .finally(() => {
                    this.loadingList = false;
                    this.loading = false;
                    this.listShow = true;
                });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/miniprogram/face-list.less";
</style>
