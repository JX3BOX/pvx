<!--
 * Swordsman Info - 侠客信息 TAB 内容组件
 *
 * @description 结识方式 + 武学招式 + 武学境界 + 属性
 * TAB 和头部（名字+ID）已移到 Index.vue 统一管理
 -->
<template>
    <div class="m-swordsman-info-content">
        <!-- 结识方式 -->
        <div class="m-swordsman-intro">
            <span class="u-swordsman-intro-title">结识方式</span>
            <div v-if="partner?.introduce" class="u-swordsman-intro-map">
                {{ partner.introduce }}
            </div>
            <div v-if="partner?.limitTip" class="u-swordsman-intro-desc" v-html="formatDesc(partner.limitTip)"></div>
            <div v-if="partner?.drawItems && partner.drawItems.length" class="m-swordsman-intro-items">
                <a v-for="it in partner.drawItems" :key="it.itemId" :href="getItemWikiUrl(it.itemId)" target="_blank"
                    rel="noopener" class="u-swordsman-intro-item">
                    道具 {{ it.itemId }}
                </a>
            </div>
            <div v-if="!hasIntro" class="u-swordsman-intro-desc">暂无结识信息</div>
        </div>

        <!-- 武学招式（被动默认圆；其它方） -->
        <SkillList v-if="partner?.skills && partner.skills.length" :skills="partner.skills" type="skill" />

        <!-- 武学境界 + 属性（同一行两列） -->
        <div class="m-swordsman-info__row">
            <div class="m-swordsman-info__col">
                <SkillList v-if="partner?.stages && partner.stages.length" :skills="partner.stages" type="realm" />
            </div>
            <div class="m-swordsman-info__col">
                <AttributeTable :attrs="partner?.attrs || []" />
            </div>
        </div>
    </div>
</template>

<script>
import SkillList from "./SkillList.vue";
import AttributeTable from "./AttributeTable.vue";
import { getItemWikiUrl } from "@/utils/swordsman";

export default {
    name: "SwordsmanInfo",
    components: {
        SkillList,
        AttributeTable,
    },
    props: {
        // 当前选中的侠客
        partner: {
            type: Object,
            default: () => null,
        },
    },
    computed: {
        hasIntro() {
            const p = this.partner;
            if (!p) return false;
            return !!(p.introduce || p.limitTip || (p.drawItems && p.drawItems.length));
        },
    },
    methods: {
        formatDesc(desc) {
            if (!desc) return "";
            return String(desc).replace(/\n/g, "<br>");
        },
        getItemWikiUrl,
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/swordsman/swordsman-info.less";
</style>
