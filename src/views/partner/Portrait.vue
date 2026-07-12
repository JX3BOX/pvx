<!--
 * Partner Portrait - 侠客行中间立绘组件
 *
 * @description 侠客行模块的中间侠客立绘区域
 * 图片字段对齐 docx：szUnlockAvatarPath（解锁立绘）+ szBgPath（背景）
 * 浏览器缩窄时：整列左移，右侧详情不被裁切
 * 切换侠客时：立绘图片淡入淡出动画效果
 -->
<template>
    <div class="m-pvx-partner-portrait">
        <!-- 背景图（使用 key 触发过渡动画） -->
        <transition name="fade" mode="out-in">
            <img v-if="partner?.bgPath && !bgFailed" :key="partner.id + '-bg'" :src="partner.bgPath"
                class="u-partner-portrait-bg" @error="bgFailed = true" />
        </transition>
        <!-- 立绘图（优先 unlockAvatar，其次 meetAvatar，使用 key 触发过渡动画） -->
        <transition name="fade" mode="out-in">
            <img v-if="portraitUrl && !portraitFailed" :key="partner?.id" :src="portraitUrl" :alt="partner?.name"
                class="u-partner-portrait-img" @error="portraitFailed = true" />
            <div v-else class="u-partner-portrait-empty">{{ $t("pages.partner.ui.emptyPortrait") }}</div>
        </transition>
    </div>
</template>

<script>
export default {
    name: "PartnerPortrait",
    props: {
        // 当前选中的侠客（已映射字段）
        partner: {
            type: Object,
            default: () => null,
        },
    },
    data() {
        return {
            bgFailed: false,
            portraitFailed: false,
        };
    },
    computed: {
        // 优先解锁立绘，其次水墨圈
        portraitUrl() {
            return this.partner?.unlockAvatar || this.partner?.meetAvatar || "";
        },
    },
    watch: {
        "partner.id"() {
            this.bgFailed = false;
            this.portraitFailed = false;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/partner/partner-portrait.less";

// 淡入淡出过渡动画
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
