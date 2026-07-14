<template>
    <div class="p-homeland-map">
        <SuspendCommon :btnOptions="{ showHome: true, showMore: false }"
            :drawerOptions="{ hideType: ['collect', 'rss', 'laterOn', 'pin', 'user', 'report'] }">
            <template #default>
                <div class="m-suspend-btn">
                    <div class="u-btn-item" @click="showForm = true">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                        {{ data[active_bak] }}
                    </div>
                </div>
            </template>
        </SuspendCommon>

        <el-drawer v-model="showForm" direction="btt" :with-header="false" custom-class="u-drawer"
            :modal-append-to-body="false" append-to-body class="c-drawer">
            <div class="m-cut">
                <div class="u-cut-box">
                    <div class="u-cut-item" v-for="(item, index) in data" :key="index"
                        :class="{ 'is-active': active == index }" @click="changeBtn(index)">
                        <span>{{ item }} </span>
                    </div>
                </div>
                <div class="u-cut-btn">
                    <div class="u-report-btn" @click="report">重置</div>
                    <div class="u-confirm-btn" :class="{ active: active != active_bak }" @click="confirmBtn">确定</div>
                </div>
            </div>
        </el-drawer>

        <div class="m-map">
            <el-image class="u-map-bg" :src="getMapImage(active_bak)" :preview-src-list="[getMapImage(active_bak)]">
            </el-image>
            <div class="u-tips">点击查看大图</div>
        </div>

        <div class="m-homeland-map">
            <div class="u-title">{{ data[active_bak] }} 地图信息</div>
            <div class="u-box">
                <div class="u-item">
                    <div class="u-title-1">房屋号</div>
                    <div class="u-title-2">面积</div>
                    <div class="u-title-3">价格</div>
                </div>
                <div class="u-item" v-for="(item, index) in active_coords" :key="index">
                    <div class="u-number-1">{{ item.name }}</div>
                    <div class="u-number-2">{{ item.area }}</div>
                    <div class="u-number-3">
                        <GamePrice :price="~~item.price * 10000" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * @description 小程序端家园地图页面
 * @description 小程序 webview 适配的家园地图展示页面
 * @author ymg
 * @version 1.0.0
 * 
 * @notes
 * - 使用 SuspendCommon 组件提供悬浮操作
 * - 使用 el-drawer 底部抽屉切换地图
 * - 地图支持预览大图
 * - 显示房屋信息表格（房屋号、面积、价格）
 */
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import homeland_maps from "@/assets/data/homeland_maps.json";
import { __imgPath } from "@/utils/config";
import { getHomelandCoord } from "@/service/homeland.js";
import GamePrice from "@jx3box/jx3box-ui/src/wiki/GamePrice.vue";

export default {
    name: "Map",
    components: { SuspendCommon, GamePrice },
    data: function () {
        return {
            active: "455",
            active_bak: "455",
            data: homeland_maps,
            coords: {},
            active_coords: [],
            showForm: false,
        };
    },
    methods: {
        getMapImage: function (map_id) {
            return __imgPath + "image/house/map/" + map_id + ".png";
        },
        buildStyle: function (house) {
            let x = (house.x / 1024) * 100 + "%";
            let y = (house.y / 896) * 100 + "%";
            return {
                left: x,
                top: y,
            };
        },
        loadCoords: function () {
            let map_id = this.active_bak;
            if (this.coords[map_id]?.length) {
                this.active_coords = this.coords[map_id];
            } else {
                getHomelandCoord(map_id).then((res) => {
                    this.coords[map_id] = res.data;
                    if (this.active_bak === map_id) {
                        this.active_coords = res.data;
                    }
                });
            }
        },
        init: function () {
            Object.keys(homeland_maps).forEach((map_id) => {
                this.coords[map_id] = [];
            });
        },
        changeBtn: function (index) {
            this.active = index;
        },
        report: function () {
            this.active = this.active_bak;
        },
        confirmBtn: function () {
            this.active_bak = this.active;
            this.loadCoords();
            this.showForm = false;
        },
    },
    mounted: function () {
        this.init();
        this.loadCoords();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/miniprogram/map.less";
@import "~@/assets/css/common/drawer.less";
</style>
