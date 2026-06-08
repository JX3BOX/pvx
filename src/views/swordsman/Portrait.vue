<!--
 * Swordsman Portrait - 侠客行中间立绘组件
 *
 * @description 侠客行模块的中间侠客立绘区域
 * 图片字段对齐 docx：szUnlockAvatarPath（解锁立绘）+ szBgPath（背景）
 * 浏览器缩窄时：整列左移，右侧详情不被裁切
 -->
<template>
    <div class="m-pvx-swordsman-portrait">
        <!-- 背景图 -->
        <img v-if="partner?.bgPath" :src="partner.bgPath" class="u-swordsman-portrait-bg" />
        <!-- 立绘图（优先 unlockAvatar，其次 meetAvatar） -->
        <img v-if="portraitUrl" :src="portraitUrl" :alt="partner?.name" class="u-swordsman-portrait-img" />
        <div v-else class="u-swordsman-portrait-empty">暂无立绘</div>
    </div>
</template>

<script>
export default {
    name: "SwordsmanPortrait",
    props: {
        // 当前选中的侠客（已映射字段）
        partner: {
            type: Object,
            default: () => null,
        },
    },
    computed: {
        // 优先解锁立绘，其次水墨圈
        portraitUrl() {
            return this.partner?.unlockAvatar || this.partner?.meetAvatar || "";
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/swordsman/swordsman-portrait.less";
</style>
