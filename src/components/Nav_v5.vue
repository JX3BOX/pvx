<template>
    <aside class="m-pvx-aside" :class="navStatusClass" v-show="active !== 'pvx'">
        <div :class="`m-pvx-box ${navStatus ? 'open' : 'close'}`" @mouseleave="toLeft">
            <template v-if="navStatus">
                <div class="u-home-wrap" :class="active === 'pvx' && 'is-active'">
                    <a class="u-home" :class="active" href="/pvx">
                        <img src="@/assets/img/nav/home.svg" svg-inline class="u-icon" />
                    </a>
                </div>
                <div class="m-pvx-nav" v-if="clientMenus.length">
                    <div class="m-nav-group" :class="group.key" v-for="group in clientMenus" :key="group.key">
                        <div class="u-menu-title" v-if="group.menuTitle">
                            {{ group.menuTitle }}
                        </div>
                        <div class="m-nav-item-box">
                            <div
                                class="m-nav-item"
                                v-for="item in group.submenus"
                                :key="item.key"
                                :class="[{ 'is-active': active == item.key }, item.key]"
                                v-show="item.status"
                            >
                                <a :href="item.path" :target="item.target || '_self'">
                                    <div class="u-nav-icon">
                                        <img
                                            svg-inline
                                            :src="require(`../assets/img/nav/${item.key}.svg`)"
                                            class="u-icon"
                                        />
                                        <img
                                            svg-inline
                                            :src="require(`../assets/img/nav/${item.key}2.svg`)"
                                            class="u-icon-hover"
                                        />
                                    </div>

                                    <span class="u-nav-label">{{ item.label }}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <div class="u-btn" v-else @mouseenter="toRight">
                <div class="u-btn-item">
                    <img class="u-icon" src="@/assets/img/nav/op.svg" svg-inline />
                    <div>菜<br />单</div>
                </div>
            </div>
        </div>
    </aside>
</template>

<script>
import { compact } from "lodash";
import menus from "@/assets/data/menus.json";
export default {
    name: "Nav_V4",
    props: [],
    components: {},
    data: function () {
        return {
            menus: menus,
            navStatus: true,
        };
    },
    computed: {
        isPhone() {
            return document.documentElement.clientWidth <= 768;
        },
        navStatusClass() {
            let text = "";
            const navStatus = this.navStatus;
            if (navStatus) {
                text = "is-opened";
            } else {
                text = "is-closed";
            }
            return text;
        },
        active: function () {
            let arr = compact(location.pathname?.split("/"));
            let str = arr[0];
            if (str === "pvg") str = arr[1];
            if (str === "homeland") str = "blueprint";
            // if (str === "body") str = "exterior";
            return str;
        },
        client() {
            return this.$store.state.client;
        },
        clientMenus() {
            let menus = this.menus;
            if (this.client !== "std") {
                menus = menus
                    .map((item) => {
                        // if (item.index == "4") return false;
                        item.submenus = item.submenus
                            .map((el) => {
                                // if (el.key == "adventure") return false;
                                // if (el.key == "furniture") return false;
                                // if (el.key == "blueprint") return false;
                                // if (el.key == "exterior") return false;
                                if (el.isStd) return false;
                                return el;
                            })
                            .filter(Boolean);
                        return item;
                    })
                    .filter(Boolean);
            }
            return menus;
        },
        storeNavStatus() {
            return ~~sessionStorage.getItem("navStatus") || false;
        },
    },
    watch: {
        navStatusClass: {
            immediate: true,
            handler(navStatusClass) {
                // this.$emit("statusChange", navStatusClass);
            },
        },
        navStatus: {
            handler(navStatus) {
                sessionStorage.setItem("navStatus", navStatus);
            },
        },
        storeNavStatus: {
            immediate: true,
            handler(val) {
                this.navStatus = val;
            },
        },
    },
    methods: {
        toLeft() {
            this.navStatus = false;
        },
        toRight() {
            this.navStatus = true;
        },
    },
    mounted() {
        if (this.isPhone) {
            this.navStatus = 0;
        }
    },
};
</script>

<style lang="less">
@import "~@/assets/css/nav_v5.less";
</style>
