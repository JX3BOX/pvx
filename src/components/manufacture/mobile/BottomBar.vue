<template>
    <div class="m-manufacture-bottom-bar">
        <div class="m-button m-server-button" @click="onChangeServer">
            <span>{{ server }}</span>
            <img svg-inline src="@/assets/img/manufacture/switch.svg" alt="" />
        </div>
        <div class="m-button m-cart-button" @click="$emit('go-cart')">
            <span> 成本计算器 </span>
            <div v-if="cartCount" class="u-cart-count" ref="cart-count">{{ cartCount }}</div>
        </div>
        <div class="m-button m-cart-button" @click="$refs['plan-list'].open()">我的清单</div>

        <PlanListVue ref="plan-list" @go-plan="$emit('go-plan', $event)"></PlanListVue>
        <el-drawer
            :with-header="false"
            :visible.sync="serverVisible"
            direction="btt"
            wrapper-closable
            append-to-body
            modal-append-to-body
            custom-class="m-server-select-drawer"
        >
            <div class="m-server-list">
                <div
                    class="m-server-item"
                    v-for="(item, index) in servers"
                    :key="index"
                    :class="{ 'is-active': server == item }"
                    @click="$store.dispatch('set_server', item)"
                >
                    {{ item }}
                </div>
            </div>
            <div class="m-actions">
                <div class="u-confirm" @click="onChangeServer">确定</div>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import servers_std from "@jx3box/jx3box-data/data/server/server_std.json";
import servers_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import { uniq } from "lodash";
import PlanListVue from "./PlanList.vue";

export default {
    name: "ManufactureBottomBar",
    components: { PlanListVue },
    props: {},
    data: () => ({
        serverVisible: false,
    }),
    computed: {
        cartCount() {
            return this.$store.state.cart_list?.length || 0;
        },
        client: function () {
            return this.$store.state.client;
        },
        servers: function () {
            if (this.client == "std") {
                return uniq(servers_std);
            } else {
                return uniq(servers_origin);
            }
        },
        server() {
            return this.$store.state.server;
        },
    },
    methods: {
        onChangeServer() {
            this.serverVisible = !this.serverVisible;
        },
    },
    watch: {
        cartCount: {
            handler(newVal) {
                this.$nextTick(() => {
                    if (newVal > 0) {
                        this.$refs["cart-count"].classList.add("u-cart-count--active");
                        setTimeout(() => {
                            this.$refs["cart-count"].classList.remove("u-cart-count--active");
                        }, 600);
                    }
                });
            },
            immediate: true,
        },
    },
};
</script>

<style lang="less">
.m-server-select-drawer {
    height: fit-content !important;
    background-color: transparent;

    .m-server-list {
        .scrollbar;
        .fz(12px, 24px);

        max-height: 240px;
        overflow-y: auto;

        color: var(--Primary-Brand-2, #24292e);
        font-weight: 400;
    }

    .m-server-item {
        .x();
        &.is-active {
            color: var(--Primary-Brand-3, #24292e);
            background: linear-gradient(to right, transparent, var(--Primary-Brand-2, #fedaa3), transparent);
        }
    }

    .m-actions {
        display: flex;
        justify-content: space-between;
        gap: 16px;

        .u-confirm {
            .pointer;
            flex-grow: 1;
            border-radius: 8px;
            padding: 8px 20px;
            .fz(12px, 18px);
            font-weight: 700;
            .x();
            background: var(--Primary-Brand-2, #fedaa3);
            color: var(--Primary-Brand-3, #24292e);
        }
    }
}

.m-manufacture-bottom-bar {
    position: fixed;
    bottom: 50px;
    padding: 12px 20px;

    left:50%;
    transform: translateX(-50%);
    .w(310px);
    .r(30px);
    display: flex;
    justify-content: space-between;
    flex-shrink: 0;
    text-align: center;
    background-color: var(--Primary-Brand-2);
    color: var(--Primary-Brand-3);

    .fz(12px, 18px);
    font-weight: 700;

    .m-button {
        display: flex;
        flex-grow: 1;
        gap: 4px;
        width: 66px;

        justify-content: center;
        align-items: center;

        .u-cart-count {
            line-height: 1.7;
            .size(20px);
            .r(100%);
            color: white;
            background-color: var(--Secondary-Red);
        }

        .u-cart-count--active {
            animation: cart-count 300ms ease-in-out;
            // 无限循环
            animation-iteration-count: 99;
            @keyframes cart-count {
                0% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-3px);
                }
                100% {
                    transform: translateY(0);
                }
            }
        }

        &:nth-of-type(2) {
            .pr;
            &::before {
                .pa;
                left: 0;
                content: "";
                width: 1px;
                height: 18px;
                background-color: var(--white-5);
            }
            &::after {
                .pa;
                right: 0;
                content: "";
                width: 1px;
                height: 18px;
                background-color: var(--white-5);
            }
        }
    }
}
</style>
