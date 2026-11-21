<template>
    <CommonHeader />
    <Nav @statusChange="navStatusClass = $event" />
    <Main
        class="c-pvx-exterior-main"
        :class="navStatusClass"
        :without-right="true"
        :without-left="true"
        :without-bread="true"
    >
        <div class="m-main p-exterior">
            <PvxPageShell
                class="m-exterior-shell"
                :class="{ 'm-exterior-shell--list': !detailId && $route.name === 'exterior-list' }"
            >
                <router-view v-slot="{ Component }">
                    <keep-alive include="ExteriorList">
                        <ExteriorSingle v-if="detailId" :detail-id="detailId" />
                        <component :is="Component" v-else />
                    </keep-alive>
                </router-view>
            </PvxPageShell>
        </div>
        <PvxBacktop color="#fff" bgColor="#5b5cf5" />
    </Main>
    <CommonFooter />
</template>

<script>
import { defineAsyncComponent } from "vue";
import Nav from "@/components/Nav_v5.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";

export default {
    name: "Exterior",
    components: {
        Nav,
        PvxBacktop,
        PvxPageShell,
        ExteriorSingle: defineAsyncComponent(() => import("./Single.vue")),
    },
    data() {
        return { navStatusClass: "is-regular" };
    },
    computed: {
        detailId() {
            const { name, query } = this.$route;
            return name === "exterior-list" && typeof query.id === "string" ? query.id : "";
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import (reference) "~@/assets/css/design-system/_tokens.less";

// 下拉选项挂载在 body 上，需要与页面内控件使用同一套主题色。
:root:has(.p-exterior) {
    --el-color-primary: @pvx-primary;
    --el-color-primary-dark-2: @pvx-primary-hover;
    each(3 5 7 8 9, {
        --el-color-primary-light-@{value}: mix(white, @pvx-primary, (@value * 10%));
    });
}

.p-exterior .m-exterior-filters .pvx-search-wrapper .search-group .search-item.type-list .type-item {
    &:hover, &.is-active {
        &, .el-radio-button__inner {
            background-color: @pvx-primary;
            color: @pvx-text-inverse;
        }
    }
}


.c-pvx-exterior-main .m-main.p-exterior {
    padding: 0;
    background: #f6f8fa;
}

.p-exterior .m-exterior-shell > div {
    max-width: none;
}
.p-exterior .m-exterior-shell--list > div {
    padding: 30px;
    @media (max-width: @ipad) {
        padding: 20px;
    }
    @media (max-width: @phone) {
        padding: 16px;
    }
}
</style>
