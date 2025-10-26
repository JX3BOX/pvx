<!---
 * @Author: ymg
 * @Date: 2025-10-25 14:06:54
 * @LastEditors: ymg
 * @LastEditTime: 2025-10-25 14:06:54
 * @Description: 家园信息
 -->

<template>
<div class="p-homeland-info">
<!--    九宫格区域-->
    <div class="m-homeland-games">
        <div class="u-game-box" v-for="(game, i) in game_data" :key="'game-' + i">
            <div class="u-game" :class="{'noactive': item.Bit !== select_game && select_game }"  v-for="(item, i2) in game" :key="'game2-' + i2" @click="showGameContent(item,i)">
                <!--            showGameTip(item.szTip)"-->
                <div class="u-box" slot="reference" >
                    <i class="u-pic"><img :src="showGamePic(item.nUnLockFrame)" /></i> <span class="u-name">{{ item.szName }}</span>
                </div>
            </div>
            <div class="u-info-tips" v-show="showTips['game' + i]">
                {{ tip_data }}
            </div>
        </div>

    </div>
<!--    家园升级需求-->
    <div class="m-homeland-levels">
        <div class="u-title">家园升级需求</div>
        <div class="u-box">
            <div class="u-item">
                <div class="u-title-1">等级</div>
                <div class="u-title-2">收藏分</div>
                <div class="u-title-3">园宅币</div>
            </div>
            <div class="u-item" v-for="(item,index) in level_data" :key="index">
                <div class="u-number-1">{{ item.Level }}</div>
                <div class="u-number-2">{{ item.Record }}</div>
                <div class="u-number-3">{{ item.Currency }}</div>
            </div>
        </div>
    </div>
</div>
</template>
<script>
import { getHomelandLevelUp, getHomelandGame } from "@/service/homeland.js";
import {cloneDeep} from "lodash";
import { __imgPath } from "@/utils/config";
export default {
    name: "Tutorial",
    data: function () {
        return {
            game_data:[],
            level_data: [],
            showTips:{},
            select_game: null,
            tip_data:""
        }
    },
    mounted: function () {
        this.loadInfo();
    },
    methods: {

        // 将数组按指定大小分割成二维数组
        chunkArray(array, size) {
            const result = [];
            for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
            }
            return result;
        },
        // 加载基本信息
        loadInfo: function () {
            getHomelandLevelUp().then((res) => {
                this.level_data = res?.data;
            });
            getHomelandGame().then((res) => {
                this.game_data =  this.chunkArray(res?.data, 3);
            });
        },
        showGameContent: function (item,index) {
            this.tip_data = this.showGameTip(item.szTip);
            this.select_game = item.Bit
            this.game_data.map((item,i)=>{
                this.showTips['game' + i] = index === i;
            })

            this.$forceUpdate()
        },
        // 显示日常图标
        showGamePic: function (index) {
            return __imgPath + "/image/game/homeland/seasonfurniture_" + index + ".png";
        },

        // 显示活动介绍
        showGameTip: function (str) {
            let output = str?.split("\\n");
            return output?.length > 1 ? output[1] : '暂无介绍';
        },
    }
};
</script>
<style scoped lang="less">
.p-homeland-info {
    padding: 1.25rem;
    box-sizing: border-box;
    height: 100vh;
    overflow: auto;
    .m-homeland-games {
        .u-game-box{
            .flex;
            flex-wrap: wrap;
            justify-content: space-between;
        }
        .u-game{
            .w(calc(calc(calc(100vw - 2.5rem) / 3) - 0.5rem));
            background: rgba(28, 28, 28, 0.05);
            padding: 0.75rem;
            box-sizing: border-box;
            .mb(0.5rem);
            .r(0.25rem);
            &.noactive{
                opacity: 0.5;
            }
            .u-name{
                .mt(0.5rem);
                .fz(1rem,1.5rem);
                .bold(700);
            }
        }
        .u-info-tips{
            .w(100%);
            flex-shrink: 0;
            .mb(0.5rem);
            background: rgba(28, 28, 28, 0.05);
            padding: 0.5rem 0.75rem;
            box-sizing: border-box;
            .r(0.25rem);
            color:rgba(28, 28, 28, 0.8);
            .fz(0.875rem,1.25rem);
        }
        .u-box {
            .flex;
            flex-direction: column;
            align-items: center;
        }
    }
    .m-homeland-levels{
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
                    .x;
                }
                .u-title-1,.u-number-1{
                    .w(3.75rem);
                    flex-shrink: 0;
                }
                .u-title-2,.u-number-2,.u-title-3,.u-number-3{
                    flex: 1;
                }
            }
        }
    }
}
//@media screen and (width: 414.4px)
@media (prefers-color-scheme: dark){
    .p-homeland-info{
        background: #000000;
        .m-homeland-games{
            .u-game{
                background: rgba(255, 255, 255, 0.1);
                .u-name{
                    color: rgba(255, 255, 255, 0.8);
                }
                &.noactive{
                    opacity: 0.6;
                }
            }
            .u-info-tips{
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
            }
        }
        .m-homeland-levels{
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
