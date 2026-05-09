<template>
<div class="p-homeland-info">
    <div class="m-homeland-games">
        <div class="u-game-box" v-for="(game, i) in game_data" :key="'game-' + i">
            <div class="u-game" :class="{'noactive': item.Bit !== select_game && select_game }"  v-for="(item, i2) in game" :key="'game2-' + i2" @click="showGameContent(item,i)">
                <div class="u-box">
                    <i class="u-pic"><img :src="showGamePic(item.nUnLockFrame)" /></i> 
                    <span class="u-name">{{ item.szName }}</span>
                </div>
            </div>
            <div class="u-info-tips" v-show="showTips[i]">
                {{ tip_data }}
            </div>
        </div>
    </div>

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
/**
 * @description 小程序端家园教程页面
 * @description 小程序 webview 适配的家园信息展示页面
 * @author ymg
 * @version 1.0.0
 * 
 * @notes
 * - 显示九宫格日常活动图标
 * - 点击活动显示提示信息
 * - 显示家园升级需求表格
 * - 支持暗色模式
 */
import { getHomelandLevelUp, getHomelandGame } from "@/service/homeland.js";
import { __imgPath } from "@/utils/config";

export default {
    name: "Tutorial",
    data: function () {
        return {
            game_data:[],
            level_data: [],
            showTips:[],
            select_game: null,
            tip_data:""
        }
    },
    mounted: function () {
        this.loadInfo();
    },
    methods: {
        chunkArray(array, size) {
            const result = [];
            for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
            }
            return result;
        },
        loadInfo: function () {
            getHomelandLevelUp().then((res) => {
                this.level_data = res?.data;
            });
            getHomelandGame().then((res) => {
                this.game_data =  this.chunkArray(res?.data, 3);
            });
        },
        showGameContent: function (item, index) {
            this.tip_data = this.showGameTip(item.szTip);
            this.select_game = item.Bit;
            this.showTips = this.game_data.map((_, i) => index === i);
        },
        showGamePic: function (index) {
            return __imgPath + "/image/game/homeland/seasonfurniture_" + index + ".png";
        },
        showGameTip: function (str) {
            let output = str?.split("\\n");
            return output?.length > 1 ? output[1] : '暂无介绍';
        },
    }
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/miniprogram/tutorial.less";
</style>
