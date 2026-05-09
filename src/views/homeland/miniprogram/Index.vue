<template>
<div class="p-homeland-index">
    <div class="m-homeland_list">
        <div class="u-item" v-for="item in tabs" :key="item.value" @click="onTabClick(item.value)">
            <div class="u-title">{{item.label}}</div>
            <div class="u-img">
                <img src="@/assets/img/homeland/jyinfo.svg" v-if="item.value==0" svg-inline style="width: 100%;"/>
                <img src="@/assets/img/homeland/jymap.svg" v-if="item.value==1" svg-inline  style="width: 100%;"/>
            </div>
        </div>
    </div>
</div>
</template>

<script>
/**
 * @description 小程序端家园首页
 * @description 小程序 webview 适配的家园模块入口页面
 * @author ymg
 * @version 1.0.0
 * 
 * @notes
 * - 使用路由跳转到子页面
 * - 支持跳转到家园信息和家园地图页面
 */
export default {
    name: "Index",
    data() {
        return {
            tabs: [
                {
                    label: "家园信息",
                    value: 0,
                },
                {
                    label: "家园地图",
                    value: 1,
                },
            ],
        };
    },
    methods: {
        onTabClick(val) {
            if (val == 0) {
                this.$router.push("/tutorial");
            }
            if (val == 1) {
                this.$router.push("/maps");
            }
        }
    }
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/miniprogram/index.less";
</style>
