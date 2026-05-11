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
    <div class="m-pvx-face-list-mobile">
        <SuspendCommon
            :btnOptions="{ showHome: true }"
            :drawerOptions="{ hideType: ['collect', 'rss', 'laterOn', 'pin', 'user', 'report'] }"
            @search="search"
        >
            <template #default>
                <div class="m-pvx-fb-list-base__suspend">
                    <div class="u-btn-item line" @click="handleOpenDrawer('cut')">
                        <img class="u-icon" v-if="active === -1" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                        <img class="u-icon" v-else-if="active === 1" src="@/assets/img/pvxsuspension/man.svg" svg-inline />
                        <img class="u-icon" v-else-if="active === 2" src="@/assets/img/pvxsuspension/woman.svg" svg-inline />
                        <img class="u-icon" v-else-if="active === 5" src="@/assets/img/pvxsuspension/boy.svg" svg-inline />
                        <img class="u-icon" v-else-if="active === 6" src="@/assets/img/pvxsuspension/girl.svg" svg-inline />
                        <img class="u-icon" v-else src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                        {{ habitusName }}
                    </div>
                    <div class="u-btn-item" @click="handleOpenDrawer('filter')">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/filter_disabled_touchbar.svg" svg-inline />
                        筛选
                    </div>
                </div>
            </template>
        </SuspendCommon>

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

        <div class="u-pvx-fb-content-all" v-if="active === -1">
            <div v-for="(item, index) in allList" :key="index" class="u-pvx-fb-content-item">
                <div class="u-pvx-fb-card-title">{{ item.label }}</div>
                <div class="u-pvx-fb-list">
                    <routine-list :list="item.list" />
                </div>
            </div>

            <div class="u-pvx-fb-card-title">体型特辑</div>
            <div class="u-pvx-fb-list body">
                <habitus :list="bodyList" @toTab="handleToTab" />
            </div>
        </div>

        <div class="u-pvx-fb-content" v-else>
            <div class="u-pvx-fb-list" id="oneList" v-loading="loadingList">
                <routine-list
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
import habitus from "@/components/common/face-body/miniprogram/Habitus.vue";
import routineList from "@/components/common/face-body/miniprogram/RoutineList.vue";
import { getFaceList } from "@/service/face";
import miniappListMixin from "@/components/common/face-body/mixins/miniapp-list-mixin";

export default {
    name: "FaceListMiniprogram",
    components: { SuspendCommon, MiniappFilterDrawer, routineList, habitus },
    mixins: [miniappListMixin],
    data() {
        return {
            type: "face",
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
        searchUrl() {
            return `/pages/search/search-detail/search-detail?app=捏脸&filter_name=pvxface`;
        },
        bodySpecialParams() {
            return { star: 1, pageIndex: 1, pageSize: 1, filter_empty_images: true };
        },
    },
    methods: {
        fetchList: getFaceList,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/miniprogram/face-list.less";
</style>
