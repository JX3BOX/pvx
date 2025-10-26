<template>
<div class="p-homeland-maps">
    <SuspendCommon :btnOptions="{showHome:true,showMore:false}"
                   :drawerOptions="{hideType:['collect','rss','laterOn','pin','user','report']}" >
        <template #default>
            <!--                切换按钮区域-->
            <div class="m-suspend-btn">
                <div class="u-btn-item" @click="showForm=true">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                    {{data[active_bak]}}
                </div>
            </div>

        </template>
    </SuspendCommon>

    <el-drawer :visible.sync="showForm" direction="btt" :with-header="false" custom-class="u-drawer"
               :modal-append-to-body="false" append-to-body class="p-drawer-suspend">
            <div class="m-cut" >
                <div class="u-cut-box">
                    <div class="u-cut-item" v-for="(item, index) in data" :key="index"
                         :class="{ 'is-active': active == index }" @click="changeBtn(index)">
                        <span>{{ item }} </span>
                    </div>
                </div>
                <div class="u-cut-btn">
                    <div class="u-report-btn" @click="report">重置</div>
                    <div class="u-confirm-btn" :class="{active:active!=active_bak}" @click="confirmBtn">确定</div>
                </div>
            </div>

    </el-drawer>

    <div class="m-map">
        <el-image
            class="u-map-bg"
            :src="getMapImage(active_bak)"
            :preview-src-list="[getMapImage(active_bak)]">
        </el-image>
<!--        <img class="u-map-bg" :src="getMapImage(active_bak)" />-->
        <div class="u-tips">点击查看大图</div>
    </div>

    <!--    地图信息-->
    <div class="m-homeland-map">
        <div class="u-title"> {{data[active_bak]}} 地图信息</div>
        <div class="u-box">
            <div class="u-item">
                <div class="u-title-1">房屋号</div>
                <div class="u-title-2">面积</div>
                <div class="u-title-3">价格</div>
            </div>
            <div class="u-item" v-for="(item,index) in active_coords" :key="index">
                <div class="u-number-1">{{ item.name }}</div>
                <div class="u-number-2">{{ item.area }}</div>
                <div class="u-number-3"><GamePrice :price="~~item.price * 10000" /></div>
            </div>
        </div>
    </div>
</div>
</template>
<script>
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
import homeland_maps from "@/assets/data/homeland_maps.json";
import { __imgPath, __ossRoot } from "@/utils/config";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getHomelandCoord } from "@/service/homeland.js";
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";
import {cloneDeep} from "lodash";

export default {
    name: "Map",
    components: {  SuspendCommon,GamePrice},
    data: function () {
        return {
            active: '455',
            active_bak:'455',
            data: homeland_maps,
            coords: {},
            active_coords: [],
            showForm:false,
        };
    },
    methods: {
        // 显示家园地图图片
        getMapImage: function (map_id) {
            // return resolveImagePath(__ossRoot + "image/house/map/" + map_id + ".png")
            return __imgPath + "image/house/map/" + map_id + ".png";
        },
        // 坐标计算
        buildStyle: function (house) {
            let x = (house.x / 1024) * 100 + "%";
            let y = (house.y / 896) * 100 + "%";
            return {
                left: x,
                top: y,
            };
        },
        // 获取坐标数据
        loadCoords: function () {
            let map_id =this.active_bak;
            if (this.coords[map_id]?.length) {
                this.active_coords = this.coords[map_id];
            } else {
                getHomelandCoord(map_id).then((res) => {
                    this.coords[map_id] = res.data;
                    this.active_coords = res.data;
                });
            }
        },
        // 初始化坐标仓库
        init: function () {
            Object.keys(homeland_maps).forEach((map_id) => {
                this.coords[map_id] = [];
            });

        },
        changeBtn: function ( index) {
          this.active = index;
        },
        report: function () {
            this.active = cloneDeep(this.active_bak);
        },
        confirmBtn: function () {
            this.active_bak = cloneDeep(this.active);
            this.loadCoords()
            this.showForm = false;

        }
    },
    mounted: function () {
        this.init();
        this.loadCoords();
    },
};
</script>
<style scoped lang="less">
@fontcolor: #1c1c1c;
@fontcolor2: rgba(28, 28, 28, 0.8);
@fontcolor3: rgba(28, 28, 28, 0.4);
@fontColor-dark: #fff;
@fontColor-dark2: rgba(255, 255, 255, 0.8);
@fontColor-dark3: rgba(255, 255, 255, 0.4);
.m-cut {
    .w(calc(100% - 1.5rem));

    margin: 0 auto;

    .u-cut-all {
        background: rgba(255, 255, 255, 0.05);
        color: @fontColor-dark2;
        .fz(1rem, 1.5rem);
        .bold(700);
        padding: 0.75rem 1rem;
        box-sizing: border-box;
        .r(0.75rem);
        .flex;
        .flex(o);
        .mb(1rem);
        .u-icon{
            .w(1.25rem);
            .mr(0.25rem);
            svg, path {
                fill: @fontColor-dark2;
                stroke: @fontColor-dark2;
            }
        }
        &.is-active {
            background: #FEDAA3;
            color: #24292E;
            svg, path {
                fill: #24292E;
                stroke: #24292E;
            }
        }
    }

    .u-cut-box {
        .flex;
        align-content: center;
        justify-content: space-between;
        .mb(1rem);
        gap: 0.75rem;
        flex-wrap: wrap;
        .u-cut-item {
            .w(calc(calc(100% - 0.75rem) / 2));
            .flex;
            .flex(o);
            flex-direction: column;
            background: rgba(255, 255, 255, 0.05);
            color: @fontColor-dark2;
            padding: 0.75rem;
            box-sizing: border-box;
            .r(0.75rem);
            .u-icon{
                svg, path {
                    fill: @fontColor-dark2;
                    stroke: @fontColor-dark2;
                }
            }
            &.is-active {
                color: #24292E;
                background: #FEDAA3;
                svg, path {
                    fill: #24292E;
                    stroke: #24292E;
                }
            }
        }
    }

    .u-cut-btn {
        .flex;
        .fz(1rem, 1.5rem);
        .bold(700);
        gap: 1.25rem;

        .u-report-btn {
            padding: 0.75rem 1rem;
            box-sizing: border-box;
            flex-shrink: 0;
            .r(0.75rem);
            background: rgba(255, 255, 255, 0.05);
            color: @fontColor-dark2;
        }

        .u-confirm-btn {
            flex: 1;
            padding: 0.75rem 1rem;
            box-sizing: border-box;
            .r(0.75rem);
            background: rgba(255, 255, 255, 0.05);
            color: @fontColor-dark3;
            .x;
            &.active{
                background: #FEDAA3;
                color: #24292E;
            }
        }
    }
}
.p-homeland-maps{
    padding: 1.25rem 1.25rem 4.25rem 1.25rem;
    box-sizing: border-box;
    height: 100vh;
    overflow: auto;

    .m-suspend-btn {
        .flex;
        align-items: center;

        .u-btn-item {
            .flex;
            .flex(o);
            gap: 0.5rem;
            //.w(7.5rem);
            flex:1;
            &.line {
                border-right: 0.5px solid rgba(254, 218, 163, 0.2);
            }
            .u-icon{
                .size(1.25rem, 1.25rem);
                svg, path {
                    fill: #FEDAA3;
                    stroke: #FEDAA3;
                }
            }
        }
    }
    .m-map{
        .u-tips{
            .mt(0.75rem);
            color:rgba(28, 28, 28, 0.4);
            .fz(0.875rem,1.25rem);
            .x;
        }
    }
    .m-homeland-map{
        .mt(1.25rem);
        .u-title{
            .fz(1rem,1.5rem);
            .bold(700);
            .mb(0.75rem);
        }
        .u-box{
            .u-item{
                .flex;
                justify-content: space-between;
                gap:0.625rem;
                .mb(0.75rem);
                .u-title-1,.u-title-2,.u-title-3{
                    color:rgba(28, 28, 28, 0.4);
                    .fz(0.875rem,1.25rem);
                    .x;
                }
                .u-number-1,.u-number-2,.u-number-3{
                    color:rgba(28, 28, 28, 0.8);
                    .fz(0.875rem,1.25rem);
                    background: rgba(28, 28, 28, 0.05);
                    padding: 0.25rem;
                    .flex;
                    .flex(o)
                }
                .u-title-1,.u-number-1{
                    .w(7rem);
                    flex-shrink: 0;
                }
                .u-title-2,.u-number-2,.u-title-3,.u-number-3{
                    flex: 1;
                }
            }
        }
    }
}
@media (prefers-color-scheme: dark)
{
    .p-homeland-maps{
        background: #000000;
        .m-map{
            .u-tips{
                color: rgba(255, 255, 255, 0.8);
            }
        }
        .m-homeland-map{
            .u-title{
                color: #fff;
            }
            .u-box{
                .u-item{
                    .u-title-1,.u-title-2,.u-title-3{
                        color: rgba(255, 255, 255, 0.4);
                    }
                    .u-number-1,.u-number-2,.u-number-3{
                        background: rgba(255, 255, 255, 0.1);
                        color: rgba(255, 255, 255, 0.8);
                    }
                }
            }

        }
    }
}
</style>
