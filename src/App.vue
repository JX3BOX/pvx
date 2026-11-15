<template>
    <CommonHeader></CommonHeader>
    <Nav @statusChange="statusChange"></Nav>
    <Main :class="navStatusClass" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
        <div class="m-main m-index-main">
            <div class="p-index p-index--pvx">
                <div class="m-index-category" v-for="(menu, index) in menus" :key="index" :class="'index' + index">
                    <div class="u-index-category-title">
                        {{ getCategoryLabel(menu) }}
                    </div>
                    <div class="m-child-category-list">
                        <component :is="submenu.disabled ? 'div' : 'a'" :href="submenu.disabled ? undefined : submenu.path"
                            class="m-child-category" :class="['child-' + index, { 'is-disabled': submenu.disabled }]"
                            v-for="(submenu, i) in menu.submenus" :target="submenu.disabled ? undefined : submenu.target || '_self'"
                            :aria-disabled="submenu.disabled || undefined" :key="i">
                            <img :src="getNavIcon(submenu)" class="u-img"
                                :alt="getMenuLabel(submenu)" />
                            <span class="u-text">{{ getMenuLabel(submenu) }}</span>
                        </component>
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

const homeRareOrder = [
    "exterior", "adventure", "pet", "horse", "furniture", "partner",
    "reputation", "questsection", "book", "keju", "treasure", "seniority",
];

export default {
    name: "Index",
    components: { Nav, PvxBacktop },

    data() {
        return {
            navStatusClass: "is-regular",
        };
    },
    computed: {
        menus() {
            return menus.map((menu) => {
                if (menu.key !== "rare") return menu;
                const submenusByKey = new Map(menu.submenus.map((item) => [item.key, item]));
                const submenus = [];
                for (const key of homeRareOrder) {
                    if (submenusByKey.has(key)) {
                        submenus.push(submenusByKey.get(key));
                        submenusByKey.delete(key);
                    }
                }
                return { ...menu, submenus: [...submenus, ...submenusByKey.values()] };
            });
        },
    },
    methods: {
        getNavIcon(item) {
            const slug = item.menuKey || item.key;
            return require(`@/assets/img/index/${slug}2.svg`);
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
