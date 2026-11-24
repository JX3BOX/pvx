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
            <PvxPageShell class="m-exterior-shell" :class="shellModifierClass">
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
        shellModifierClass() {
            if (this.$route.name === "exterior-studio") return "m-exterior-shell--studio";
            return this.detailId ? "m-exterior-shell--detail" : "m-exterior-shell--list";
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

.c-pvx-exterior-main .m-main.p-exterior {
    padding: 0;
    background: #f6f8fa;
}

.p-exterior .m-exterior-shell > div {
    max-width: 1480px;
    margin: 0 auto;
    padding: 26px 30px 44px;

    @media (max-width: @ipad) {
        padding: 20px 18px 36px;
    }

    @media (max-width: @phone) {
        padding: 14px 12px 28px;
    }
}

.p-exterior .m-exterior-shell--detail > div {
    max-width: 1380px;
}

.p-exterior .m-exterior-shell--studio > div {
    max-width: 1720px;
    padding: 14px 20px 24px;

    @media (max-width: @phone) {
        padding: 10px 10px 18px;
    }
}
</style>
