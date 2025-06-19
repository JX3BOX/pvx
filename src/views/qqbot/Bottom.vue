<template>
    <div class="m-pvx-robot__bottom">
        <div class="m-pvx-bottom__top">
            <div class="m-notice">
                <div class="u-title">公告</div>
                <div class="u-content">
                    <div>如发现攻略不全，请直接在游戏内或魔盒官方网站百科栏目修订提交或评论。</div>
                    <div>基于玩家共建的魔盒百科平台，人人都可参与。</div>
                    <div class="u-link">本篇原文-{{ qrcodeUrl }}</div>
                </div>
            </div>
            <div class="m-pvx-bottom__right">
                <div class="m-qq">
                    <img class="u-bottom-img" src="@/assets/img/jx3box_qqbot_bottom.svg" />
                </div>
                <div class="m-qrcode">
                    <qrcode-vue class="u-qrcode" :value="qrcodeUrl" :size="42" level="H"></qrcode-vue>
                    <div>扫码看原文</div>
                </div>
            </div>
        </div>
        <div class="m-pvx-bottom__bottom">
            <img class="u-bottom-logo" src="@/assets/img/jx3box_qqbot_logo.svg" />
            <span>JX3BOX</span>
            <img class="u-bottom-logo" src="@/assets/img/jx3box_qqbot_logo.svg" />
        </div>
    </div>
</template>

<script>
import { __Root, __OriginRoot } from "@jx3box/jx3box-common/data/jx3box.json";
import QrcodeVue from "qrcode.vue";
export default {
    name: "PvxRobotBottom",
    props: ["type", "id"],
    components: {
        QrcodeVue,
    },
    data() {
        return {};
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
        rootPath: function () {
            return this.client == "origin" ? __OriginRoot : __Root;
        },
        qrcodeUrl() {
            return `${this.rootPath}${this.type}/${this.id}`;
        },
    },
    mounted() {},
    methods: {},
};
</script>

<style lang="less">
.m-pvx-robot__bottom {
    margin: 12px 0 0;
    width: 100%;
    height: 126px;
    border-radius: 8px;
    background: linear-gradient(to top, #383838 0%, #000000 100%);
    border: 1px solid #6e6e6e;
    padding: 10px 8px;
    box-sizing: border-box;

    .m-pvx-bottom__top {
        .flex;
        justify-content: space-between;
    }
    .m-notice {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.75);
        width: 380px;
        .flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .u-title {
        background: #b82525;
        .r(4px);
        width: 30px;
        height: 14px;
        line-height: 6px;
        text-align: center;
        padding: 4px;
        box-sizing: border-box;
        font-size: 10px;
        .bold;
        letter-spacing: 1px;
        color: #fff;
        margin-bottom: 4px;
    }
    .u-content {
        .fz(10px);
        .normal;
        letter-spacing: 1px;
        line-height: 16px;
    }
    .u-link {
        .dbi;
        border-radius: 4px;
        background: #c4c4c4;
        padding: 0px 6px 0px 6px;
        color: #000000;
        margin-top: 5px;
    }
    .m-pvx-bottom__right {
        .flex;
        justify-content: flex-end;
        gap: 4px;
    }
    .m-qq {
        position: relative;
        font-size: 10px;
        color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }
    .m-qq-info {
        width: 78px;
        height: 28px;
        margin-top: -20px;
        border-radius: 6px;
        background: linear-gradient(to top, #383838 0%, #000000 100%);

        border: 0.5px solid #6e6e6e;

        box-shadow: inset 0px 10px 5px #000000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 4px 4px 4px 4px;
        box-sizing: border-box;
        .u-label {
            color: rgba(255, 255, 255, 0.75);
        }
    }
    .u-qq-img {
        .size(63px, 62px);
    }
    .u-bottom-img {
        margin-top: 3px;
        .size(78px, auto);
    }
    .m-qrcode {
        .flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 4px;
        .size(58px, 75px);
        padding: 4px;
        box-sizing: border-box;
        border-radius: 6px;
        background: linear-gradient(to top, #000000 0%, #383838 100%);
        border: 0.5px solid #6e6e6e;
        box-shadow: inset 0px 10px 5px #000000;
        font-size: 9px;
        color: rgba(255, 255, 255, 0.75);
    }
    .u-qrcode {
        .size(50px);
        .r(2px);
        padding: 4px;
        box-sizing: border-box;
        background-color: #fff;
    }
    .m-pvx-bottom__bottom {
        .flex;
        align-items: center;
        justify-content: center;
        gap: 11px;
        margin-top: 12px;
        span {
            .dbi;
            color: #fff;
            letter-spacing: 10px;
            text-align: center;
            font-size: 12px;
            font-weight: 700;
            margin-right: -10px;
        }
    }
    .u-bottom-logo {
        .size(12px, 13px);
    }
}
</style>
