<!--
 * Partner AttributeTable - 侠客属性表
 *
 * @description 列表行展示属性 + 数值
 * 鼠标移入行：整行加淡紫底 rgba(107,82,255,0.05)
 -->
<template>
    <div class="m-partner-attrs">
        <h3 class="u-partner-section-title">属性</h3>
        <table class="m-partner-attr-table">
            <tbody>
                <tr v-for="row in attrs" :key="row.key">
                    <td class="u-partner-attr-label">{{ row.label }}</td>
                    <td class="u-partner-attr-value">{{ row.value }}</td>
                </tr>
                <tr v-if="attrs.length === 0">
                    <td colspan="2" style="text-align: center; color: rgba(0, 0, 0, 0.4);">暂无属性</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: "PartnerAttributeTable",
    props: {
        // 属性行：[{ key, label, value }]
        attrs: {
            type: Array,
            default: () => [],
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/partner/partner-info.less";
</style>
