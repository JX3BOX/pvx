<!--
 * Partner Portrait - 侠客行中间立绘组件
 *
 * @description 侠客行模块的中间侠客立绘区域
 * 图片字段对齐 docx：szUnlockAvatarPath（解锁立绘）+ szBgPath（背景）
 * 浏览器缩窄时：整列左移，右侧详情不被裁切
 * 切换侠客时：立绘图片淡入淡出动画效果
 -->
<template>
    <div class="m-pvx-partner-portrait" :style="portraitStyle">
        <div class="m-partner-portrait__header">
            <div class="m-partner-portrait__header-left">
                <slot name="top-left" />
            </div>
            <div class="m-partner-portrait__header-right">
                <slot name="top-right" />
            </div>
        </div>
        <img v-if="partner?.bgPath && !bgFailed" :key="partner.id + '-bg'" :src="partner.bgPath"
            class="u-partner-portrait-bg" :class="{ 'is-loaded': backgroundLoaded }"
            @load="handleBackgroundLoad" @error="bgFailed = true" />
        <!-- 图片完成尺寸计算后再淡入，避免加载阶段按 100% 兜底尺寸短暂放大。 -->
        <img v-if="portraitUrl && !portraitFailed" :key="partner?.id" :src="portraitUrl" :alt="partner?.name"
            class="u-partner-portrait-img" :class="{ 'is-loaded': portraitLoaded }"
            @load="handlePortraitLoad" @error="portraitFailed = true" />
        <div v-else class="u-partner-portrait-empty">{{ $t("pages.partner.ui.emptyPortrait") }}</div>
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
            backgroundLoaded: false,
            portraitLoaded: false,
            backgroundAspectRatio: null,
            backgroundNaturalWidth: 0,
            backgroundNaturalHeight: 0,
            portraitNaturalWidth: 0,
            portraitNaturalHeight: 0,
            availableViewportHeight: 0,
        };
    },
    computed: {
        // 优先解锁立绘，其次水墨圈
        portraitUrl() {
            return this.partner?.unlockAvatar || this.partner?.meetAvatar || "";
        },
        portraitStyle() {
            if (!this.backgroundAspectRatio) return null;
            const style = {
                "--partner-bg-aspect-ratio": this.backgroundAspectRatio,
                "--partner-bg-natural-width": `${this.backgroundNaturalWidth}px`,
                "--partner-bg-natural-height": `${this.backgroundNaturalHeight}px`,
            };
            if (this.availableViewportHeight) {
                style["--partner-portrait-available-height"] = `${this.availableViewportHeight}px`;
                style["--partner-portrait-max-width"] = `${Math.min(
                    this.backgroundNaturalWidth,
                    this.availableViewportHeight * this.backgroundAspectRatio
                )}px`;
            }
            if (this.portraitNaturalWidth && this.portraitNaturalHeight) {
                style["--partner-img-natural-width"] = `${this.portraitNaturalWidth}px`;
                style["--partner-img-natural-height"] = `${this.portraitNaturalHeight}px`;
            }
            return {
                ...style,
            };
        },
    },
    watch: {
        "partner.id"() {
            this.bgFailed = false;
            this.portraitFailed = false;
            this.backgroundLoaded = false;
            this.portraitLoaded = false;
        },
    },
    methods: {
        handleBackgroundLoad(event) {
            const { naturalWidth, naturalHeight } = event.target;
            if (naturalWidth && naturalHeight) {
                this.backgroundAspectRatio = naturalWidth / naturalHeight;
                this.backgroundNaturalWidth = naturalWidth;
                this.backgroundNaturalHeight = naturalHeight;
                this.$nextTick(() => {
                    this.updateAvailableViewportHeight();
                    this.backgroundLoaded = true;
                });
            }
        },
        handlePortraitLoad(event) {
            const { naturalWidth, naturalHeight } = event.target;
            if (naturalWidth && naturalHeight) {
                this.portraitNaturalWidth = naturalWidth;
                this.portraitNaturalHeight = naturalHeight;
                this.$nextTick(() => {
                    this.portraitLoaded = true;
                });
            }
        },
        updateAvailableViewportHeight() {
            if (!this.$el || typeof window === "undefined") return;
            const top = this.$el.getBoundingClientRect().top;
            this.availableViewportHeight = Math.max(0, window.innerHeight - top - 30);
        },
    },
    mounted() {
        this.updateAvailableViewportHeight();
        window.addEventListener("resize", this.updateAvailableViewportHeight);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.updateAvailableViewportHeight);
    },
};
</script>

<style lang="less">
@import "~@/assets/css/partner/partner-portrait.less";
</style>
