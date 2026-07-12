<!--
 * Partner SkillList - 武学招式 / 境界 通用组件
 *
 * @description 招式与境界共用一个组件，通过 type 区分
 *   - type='skill'：招式（被动圆 / 其它方；只展示介绍面板）
 *   - type='realm'：境界（方；底部展示解锁道具）
 -->
<template>
    <div class="m-partner-skills" :class="{ 'is-realm': isRealm }">
        <h3 class="u-partner-section-title">{{ sectionTitle }}</h3>

        <!-- 招式 / 境界 图标网格 -->
        <div class="m-partner-skill-grid">
            <div v-for="(item, index) in skills" :key="item.id || index" class="u-partner-skill-icon"
                :class="[shapeClass(item), { 'is-active': currentIndex === index }]" :title="item.name"
                @click="handleSelect(index)">
                <img v-if="item.icon && !failedIcons[getIconKey(item, index)]" :src="item.icon" :alt="item.name"
                    @error="handleIconError(item, index)" />
                <span v-else class="u-partner-skill-fallback">{{ (item.name || "?").slice(0, 1) }}</span>
            </div>
        </div>

        <!-- 介绍面板 -->
        <div v-if="currentSkill" class="m-partner-skill-detail">
            <div class="m-partner-skill-detail__header">
                <div class="u-partner-skill-detail-title">
                    <span class="u-partner-skill-name">{{ currentSkill.name }}</span>
                    <span class="u-partner-skill-id">{{ getSkillTypeLabel(currentSkill) }}</span>
                </div>
                <!-- 数据库跳转（右上角）暂时隐藏 -->
                <a v-if="currentSkill.id" :href="getSkillDbUrl(currentSkill.id)" target="_blank" rel="noopener"
                    class="u-partner-skill-db" :title="$t('pages.partner.ui.openSkillDatabase')" style="display: none;">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                </a>
            </div>

            <div class="u-partner-skill-desc" v-html="formatDesc(currentSkill.desc)"></div>

            <!-- 技能元信息（ID / Level / IconID）- 对齐 Figma Frame 298 底部 -->
            <div v-if="currentSkill.id || currentSkill.level" class="m-partner-skill-meta">
                <span v-if="currentSkill.id" class="u-partner-skill-meta-item">ID: {{ currentSkill.id }}</span>
                <span v-if="currentSkill.level" class="u-partner-skill-meta-item">Level: {{ currentSkill.level }}</span>
                <span v-if="currentSkill.iconId" class="u-partner-skill-meta-item">iconID:
                    {{ currentSkill.iconId }}</span>
            </div>

            <!-- 境界：底部展示解锁道具 -->
            <div v-if="isRealm && currentSkill.unlockItems && currentSkill.unlockItems.length"
                class="m-partner-skill-items">
                <span class="u-partner-skill-items-label">{{ $t("pages.partner.ui.unlockItems") }}：</span>
                <a v-for="it in currentSkill.unlockItems" :key="it.id" :href="getItemWikiUrl(it.id)" target="_blank"
                    rel="noopener" class="u-partner-intro-item">
                    {{ it.name }}
                </a>
            </div>
        </div>

        <div v-else class="u-partner-skill-empty">{{ $t("pages.partner.ui.emptySkills") }}</div>
    </div>
</template>

<script>
import { DataAnalysis } from "@element-plus/icons-vue";
import { SKILL_SHAPE } from "./const";
import { getItemWikiUrl, getSkillDbUrl } from "@/utils/partner";
import { sanitizeSkillHtml } from "@/utils/sanitize-html";

export default {
    name: "PartnerSkillList",
    components: {
        DataAnalysis,
    },
    props: {
        // 武学列表
        skills: {
            type: Array,
            default: () => [],
        },
        // 类型：'skill' | 'realm'
        type: {
            type: String,
            default: "skill",
            validator: (v) => ["skill", "realm"].includes(v),
        },
        // 默认选中索引
        defaultIndex: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            currentIndex: this.defaultIndex,
            failedIcons: {},
        };
    },
    computed: {
        isRealm() {
            return this.type === "realm";
        },
        sectionTitle() {
            return this.isRealm
                ? this.$t("pages.partner.ui.sections.realms")
                : this.$t("pages.partner.ui.sections.skills");
        },
        // 当前展示的招式 / 境界
        currentSkill() {
            const item = this.skills[this.currentIndex] || null;
            if (!item) return null;

            // 境界数据：使用 title 作为显示名称，不显示 typeLabel
            if (this.isRealm) {
                return {
                    ...item,
                    name: item.title || item.skillName || this.$t("pages.partner.ui.realmFallback", { stage: item.stage }),
                    desc: item.skillDesc || this.$t("pages.partner.ui.realmSkillFallback", { title: item.title }),
                    typeLabel: null,
                };
            }

            // 招式数据
            return {
                ...item,
                name: item.name || this.$t("pages.partner.ui.skillFallback", { id: item.id }),
                desc: item.desc || this.$t("pages.partner.ui.skillDescFallback"),
            };
        },
    },
    watch: {
        // 切换侠客时重置选中索引
        skills: {
            handler() {
                this.currentIndex = this.defaultIndex;
                this.failedIcons = {};
            },
            deep: true,
        },
    },
    methods: {
        formatDesc(desc) {
            return sanitizeSkillHtml(desc);
        },
        getIconKey(item, index) {
            return item.id || item.skillId || index;
        },
        handleIconError(item, index) {
            this.failedIcons[this.getIconKey(item, index)] = true;
        },
        /**
         * 计算图标形状（被动：圆；其它：方）
         */
        shapeClass(item) {
            if (item.shape === SKILL_SHAPE.CIRCLE) {
                return "is-circle";
            }
            return "is-square";
        },
        /**
         * 选中招式 / 境界
         */
        handleSelect(index) {
            if (this.currentIndex === index) return;
            this.currentIndex = index;
        },
        getSkillTypeLabel(skill) {
            if (this.isRealm) return this.$t("pages.partner.ui.skillTypes.martialArt");
            if (skill.type === 1) return this.$t("pages.partner.ui.skillTypes.passive");
            if (skill.type === 2) return this.$t("pages.partner.ui.skillTypes.active");
            return this.$t("pages.partner.ui.skillTypes.martialArt");
        },
        getItemWikiUrl,
        getSkillDbUrl,
    },
};
</script>

<style lang="less">
    @import (reference) "~@/assets/css/partner/index.less";

    .m-partner-skills {
        margin-bottom: 20px;

        .u-partner-section-title {
            display: block;
            width: 100%;
            padding: 8px 10px;
            background: @partner-color-primary;
            color: @partner-color-text-white;
            font-size: 14px;
            font-weight: 400;
            line-height: 18.48px;
            font-family: "Microsoft YaHei", sans-serif;
            border-radius: @partner-radius;
            margin: 0 0 12px;
        }
    }

    // Figma: Frame 293 (招式), gap 20px; Frame 311 (境界)
    .m-partner-skill-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 16px;
        padding-left: 10px; // 避免左侧遮挡
    }

    // Figma: 图标 40x40 (招式), 28x28 (境界)
    .u-partner-skill-icon {
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: @partner-color-default-bg;
        cursor: pointer;
        overflow: hidden;
        transition: all @partner-transition-duration ease-out;
        box-sizing: border-box;
        border: 2px solid transparent;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .u-partner-skill-fallback {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.4);
        }

        &.is-circle {
            border-radius: 50%;
        }

        &.is-square {
            border-radius: 0;
        }

        &.is-active {
            border-color: @partner-color-primary;
            box-shadow: 0 0 0 1px @partner-color-primary;
        }

        &:hover {
            transform: translateY(-1px);
        }
    }

    // Figma: Frame 298, rgba(0,0,0,0.05), 圆角8px, padding 20px
    .m-partner-skill-detail {
        background: @partner-color-skill-card-bg;
        border-radius: @partner-radius;
        padding: 20px;
        box-sizing: border-box;
    }

    .m-partner-skill-detail__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 10px;
        gap: 12px;
    }

    .u-partner-skill-detail-title {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .u-partner-skill-type {
        display: inline-block;
        width: fit-content;
        padding: 2px 8px;
        background: @partner-color-primary;
        color: @partner-color-text-white;
        font-size: 12px;
        line-height: 18px;
        border-radius: 4px;
    }

    .u-partner-skill-name {
        font-size: 14px;
        font-weight: 700;
        color: @partner-color-text-black;
        line-height: normal;
    }

    .u-partner-skill-id {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
        line-height: 18px;
    }

    .u-partner-skill-db {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        color: @partner-color-primary;
        font-size: 16px;
        text-decoration: none;
        transition: background @partner-transition-duration ease-out;

        &:hover {
            background: @partner-color-primary-hover;
        }
    }

    .u-partner-skill-desc {
        font-size: 14px;
        line-height: normal;
        color: @partner-color-text-black;
        white-space: normal;
        overflow-wrap: anywhere;
    }

    // Figma Frame 298 底部：ID / Level / iconID 元信息
    .m-partner-skill-meta {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .u-partner-skill-meta-item {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.4);
            line-height: 18px;
        }
    }

    .m-partner-skill-items {
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px dashed @partner-color-border-soft;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;

        .u-partner-skill-items-label {
            font-size: 13px;
            color: rgba(0, 0, 0, 0.4);
        }
    }

    .u-partner-skill-empty {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.4);
        text-align: center;
        padding: 20px 0;
    }

    // 武学境界图标：28x28 圆形（Figma Frame 311）
    .m-partner-skills.is-realm {
        .u-partner-skill-icon {
            width: 28px;
            height: 28px;
        }
    }

    // 移动端境界图标与武学招式保持一致，提升触控和识别体验。
    @media screen and (max-width: 768px) {
        .m-partner-skills.is-realm {
            .u-partner-skill-icon {
                width: 40px;
                height: 40px;
            }
        }
    }
</style>
