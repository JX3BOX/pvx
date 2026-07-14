<template>
    <CommonHeader></CommonHeader>
    <Nav @statusChange="statusChange"></Nav>
    <Main :class="navStatusClass" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
        <div class="m-main">
            <div class="p-index p-index--pvx">
                <div class="m-index-category" v-for="(menu, index) in menus" :key="index" :class="'index' + index">
                    <div class="u-index-category-title">
                        {{ getCategoryLabel(menu) }}
                    </div>
                    <div class="m-child-category-list">
                        <a :href="submenu.path" class="m-child-category" :class="'child-' + index"
                            v-for="(submenu, i) in menu.submenus" :target="submenu.target || '_self'" :key="i">
                            <img :src="getNavIcon(submenu.menuKey || submenu.key)" class="u-img"
                                :alt="getMenuLabel(submenu)" />
                            <span class="u-text">{{ getMenuLabel(submenu) }}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <PvxBacktop color="#fff" bgColor="#324148"></PvxBacktop>
    </Main>
    <CommonFooter></CommonFooter>
</template>

<script>
import menus from "@/assets/data/menus.json";
import Nav from "@/components/Nav_v5.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";
export default {
    name: "Index",
    components: { Nav, PvxBacktop },

    data() {
        return {
            menus,
            navStatusClass: "is-regular",
        };
    },
    computed: {},
    methods: {
        getNavIcon(key) {
            return require(`@/assets/img/nav/${key}2.svg`);
        },
        getLocalLabel(key, fallback) {
            return this.$te(key) ? this.$t(key) : fallback;
        },
        getCategoryLabel(menu) {
            return this.getLocalLabel(`pages.index.ui.categories.${menu.key}`, menu.label);
        },
        getMenuLabel(submenu) {
            return this.getLocalLabel(`pages.index.ui.menus.${submenu.key}`, submenu.label);
        },
        statusChange(navStatusClass) {
            // this.navStatusClass = navStatusClass;
        },
    },
    mounted() {
        const { type, id } = this.$route.query;
        if (type && id) {
            window.open(`/${type}/${id}`, "_self");
        }
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/index.less";
</style>
