<!--
 * Swordsman InfoTabs - 侠客信息头部 TAB 切换
 *
 * @description 对齐 Figma Frame 292 + Frame 307
 * 结构：左侧名字+ID + 右侧 3 个 Tab（基础信息、武学境界、传记）
 * Tab 样式：16px Bold, Microsoft YaHei, #000000, gap 20px
 * 选中态：opacity 1.0，未选中态：opacity 0.2，Hover：opacity 0.5
 * 无下划线、无底色，仅用 opacity 区分
 -->
<template>
    <div class="m-swordsman-info-header">
        <!-- 左侧：名字 + ID -->
        <div class="m-swordsman-info__name-group">
            <h2 class="u-swordsman-name">{{ name }}</h2>
            <div v-if="id" class="u-swordsman-id">ID {{ id }}</div>
        </div>

        <!-- 右侧：Tab 切换 -->
        <div class="m-swordsman-info__tabs">
            <div
                v-for="tab in tabs"
                :key="tab.key"
                class="u-swordsman-tab"
                :class="{ 'is-active': active === tab.key }"
                @click="$emit('change', tab.key)"
            >
                {{ tab.label }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "SwordsmanInfoTabs",
    props: {
        // 当前激活的 TAB key
        active: {
            type: String,
            default: "info",
        },
        // TAB 列表
        tabs: {
            type: Array,
            default: () => [],
        },
        // 侠客名字
        name: {
            type: String,
            default: "—",
        },
        // 侠客 ID
        id: {
            type: [String, Number],
            default: null,
        },
    },
    emits: ["change"],
};
</script>

<style lang="less">
@import "~@/assets/css/swordsman/swordsman-tabs.less";
</style>