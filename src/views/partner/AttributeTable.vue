<!--
 * Partner AttributeTable - 侠客属性表
 *
 * @description 列表行展示属性 + 数值
 * 鼠标移入行：整行加淡紫底 rgba(107,82,255,0.05)
 -->
<template>
    <div class="m-partner-attrs">
        <h3 class="u-partner-section-title">{{ $t("pages.partner.ui.sections.attributes") }}</h3>
        <table class="m-partner-attr-table">
            <tbody>
                <tr v-for="row in attrs" :key="row.key">
                    <td class="u-partner-attr-label">{{ getLabel(row) }}</td>
                    <td class="u-partner-attr-value">{{ getValue(row) }}</td>
                </tr>
                <tr v-if="attrs.length === 0">
                    <td colspan="2" style="text-align: center; color: rgba(0, 0, 0, 0.4);">{{ $t("pages.partner.ui.emptyAttributes") }}</td>
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
    methods: {
        getLabel(row) {
            return this.$t(`pages.partner.ui.attributes.${row.key}`);
        },
        getValue(row) {
            if (row.key === "quality" || row.key === "rarity") {
                return this.$t(`pages.partner.ui.${row.key}.${row.rawValue}`);
            }
            if (row.key === "kungfu") {
                return this.$t(`pages.partner.ui.kungfu.${row.rawValue}`);
            }
            return row.value;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/partner/partner-info.less";
</style>
