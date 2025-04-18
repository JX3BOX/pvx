<template>
    <div class="m-price">
        <div class="m-type-list">
            <div
                class="u-type-item"
                :class="{
                    'is-active': active === item.value,
                }"
                v-for="(item, index) in list"
                :key="'l' + index"
                @click="setActive(item.value)"
            >
                {{ item.label }}
            </div>
        </div>
        <div class="m-body">
            <overview ref="overviewRef" :server="server" :active="active" v-if="active != 'goods'" />
            <goods ref="goodsRef" :server="server" v-if="active == 'goods'" />
        </div>

        <!-- 服务器切换 -->
        <div
            class="m-server"
            :class="{
                'is-expanded': isServerSwitchExpanded,
            }"
            @click="isServerSwitchExpanded = false"
        >
            <div class="m-server-content" @click.stop="isServerSwitchExpanded = true">
                <div class="u-server-label">服务器</div>
                <div class="u-server-name">{{ server }}</div>
            </div>
            <div class="m-server-switch">
                <div class="u-switch-title">切换服务器</div>
                <div class="u-server-list">
                    <div class="u-server-item" v-for="item in serverList" :key="item" @click="serverChange(item)">
                        {{ item }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import server_cn from "@jx3box/jx3box-data/data/server/server_cn.json";
import server_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import User from "@jx3box/jx3box-common/js/user";
import { getUserInfo } from "@/service/pvg/price.js"; // 系统关注物品类型

import overview from "./overview/index.vue";
import goods from "./goods/index.vue";
export default {
    components: { overview, goods },
    data() {
        return {
            list: [
                {
                    label: "总览",
                    value: "",
                },
                {
                    label: "金价",
                    value: "gold",
                },
                {
                    label: "物价",
                    value: "goods",
                },
            ],
            active: "",

            server: "",
            isServerSwitchExpanded: false,
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        serverList() {
            return this.client == "std" ? server_cn : server_origin;
        },
    },
    created() {
        if (User.isLogin() && this.client == "std") {
            getUserInfo().then((res) => {
                this.server = res.data?.data?.jx3_server || "梦江南";
            });
        } else {
            this.server = this.client == "std" ? "梦江南" : "缘起稻香";
        }
    },
    methods: {
        serverChange(itemData) {
            this.server = itemData;
        },
        setActive(val) {
            this.active = val;
            document.documentElement.scrollTop = 0;
        },
    },
};
</script>
<style lang="less">
@brand2: #24292e;
@brand2-dark: #fedaa3;
@brand3: #fedaa3;
@brand3-dark: rgba(36, 41, 46, 1);
@brand4: #282828;
@brand4-dark: rgba(40, 40, 40, 1);
@white-40: rgba(255, 255, 255, 0.4);
@white-40-dark: rgba(28, 28, 28, 0.4);
@black-5: rgba(255, 255, 255, 0.1);
@black-40: rgba(28, 28, 28, 0.4);
@black-80: rgba(255, 255, 255, 0.8);
@black-100: #1c1c1c;
@black-40-dark: rgba(255, 255, 255, 0.4);
@black-100-dark: #ffffff;
.m-price {
    position: relative;
    z-index: 1;
    &::after {
        content: "";
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fafafa;
        z-index: -1;
    }

    .m-type-list {
        display: flex;
        justify-content: space-around;
        position: static;
        top: 0;
        padding-top: 12px;
        padding-bottom: 4px;
        .u-type-item {
            .fz(18px, 28px);
            color: @black-40;
            .bold();
            &.is-active {
                color: @black-100;
                position: relative;
                &::after {
                    content: "";
                    display: block;
                    position: absolute;
                    height: 2px;
                    background-color: @black-100;
                    bottom: -4px;
                    left: 50%;
                    width: 20px;
                    border-radius: 2px;
                    transform: translate(-50%, 50%);
                }
            }
        }
    }
    .m-body {
        margin-top: 20px;
        padding-bottom: 60px;
    }

    .m-server {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        &.is-expanded {
            top: 0;
            .m-server-content {
                transform: translateY(100%);
            }
            .m-server-switch {
                transform: translateY(0);
            }
        }
        .m-server-content {
            position: absolute;
            bottom: 0;
            left: 20px;
            right: 20px;
            background-color: @brand2;
            border-radius: 300px 300px 0px 0px;
            padding: 8px 0;
            transition: 0.3s all;
            .u-server-label {
                color: @white-40;
                .fz(10px, 15px);
            }
            .u-server-name {
                color: @brand3;
                .fz(14px, 20px);
                .bold();
            }
        }
        .m-server-switch {
            position: absolute;
            bottom: 0;
            left: 0px;
            right: 0px;
            transform: translateY(100%);
            transition: 0.3s all;
            background-color: @brand4;
            border-radius: 20px 20px 0px 0px;
            padding: 20px 20px 30px;
            .u-switch-title {
                color: @black-80;
                .fz(12px, 18px);
                .bold();
                .mb(20px);
            }
            .u-server-list {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                .u-server-item {
                    padding: 8px 0;
                    background-color: @black-5;
                    border-radius: 12px;
                    .fz(12px, 18px);
                    color: @black-80;
                }
            }
        }
    }
}
@media (prefers-color-scheme: dark) {
    .m-price {
        &::after {
            background: #000;
        }

        .m-type-list {
            .u-type-item {
                color: @black-40-dark;
                &.is-active {
                    color: @black-100-dark;
                    &::after {
                        background-color: @black-100-dark;
                    }
                }
            }
        }
        .m-server {
            .m-server-content {
                background-color: @brand2-dark;
                .u-server-label {
                    color: @white-40-dark;
                }
                .u-server-name {
                    color: @brand3-dark;
                }
            }
        }
    }
}
</style>
