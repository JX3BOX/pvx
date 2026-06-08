<!--
 * Swordsman SkillList - 武学招式 / 境界 通用组件
 *
 * @description 招式与境界共用一个组件，通过 type 区分
 *   - type='skill'：招式（被动圆 / 其它方；只展示介绍面板）
 *   - type='realm'：境界（方；底部展示解锁道具）
 -->
<template>
    <div class="m-swordsman-skills" :class="{ 'is-realm': isRealm }">
        <h3 class="u-swordsman-section-title">{{ sectionTitle }}</h3>

        <!-- 招式 / 境界 图标网格 -->
        <div class="m-swordsman-skill-grid">
            <div
                v-for="(item, index) in skills"
                :key="item.id || index"
                class="u-swordsman-skill-icon"
                :class="[shapeClass(item), { 'is-active': currentIndex === index }]"
                :title="item.name"
                @click="handleSelect(index)"
            >
                <img v-if="item.icon" :src="item.icon" :alt="item.name" />
                <span v-else class="u-swordsman-skill-fallback">{{ (item.name || "?").slice(0, 1) }}</span>
            </div>
        </div>

        <!-- 介绍面板 -->
        <div v-if="currentSkill" class="m-swordsman-skill-detail">
            <div class="m-swordsman-skill-detail__header">
                <div class="u-swordsman-skill-detail-title">
                    <span class="u-swordsman-skill-name">{{ currentSkill.name }}</span>
                    <span class="u-swordsman-skill-id">{{ currentSkill.typeLabel || "武学" }}</span>
                </div>
                <!-- 数据库跳转（右上角） -->
                <a
                    v-if="currentSkill.id"
                    :href="getSkillDbUrl(currentSkill.id)"
                    target="_blank"
                    rel="noopener"
                    class="u-swordsman-skill-db"
                    title="跳转数据库"
                >
                    <el-icon><DataAnalysis /></el-icon>
                </a>
            </div>

            <div class="u-swordsman-skill-desc" v-html="formatDesc(currentSkill.desc)"></div>

            <!-- 技能元信息（ID / Level / IconID）- 对齐 Figma Frame 298 底部 -->
            <div v-if="currentSkill.id || currentSkill.level" class="m-swordsman-skill-meta">
                <span v-if="currentSkill.id" class="u-swordsman-skill-meta-item">ID: {{ currentSkill.id }}</span>
                <span v-if="currentSkill.level" class="u-swordsman-skill-meta-item">Level: {{ currentSkill.level }}</span>
                <span v-if="currentSkill.iconId" class="u-swordsman-skill-meta-item">iconID: {{ currentSkill.iconId }}</span>
            </div>

            <!-- 境界：底部展示解锁道具 -->
            <div v-if="isRealm && currentSkill.unlockItems && currentSkill.unlockItems.length" class="m-swordsman-skill-items">
                <span class="u-swordsman-skill-items-label">解锁道具：</span>
                <a
                    v-for="it in currentSkill.unlockItems"
                    :key="it.id"
                    :href="getItemWikiUrl(it.id)"
                    target="_blank"
                    rel="noopener"
                    class="u-swordsman-intro-item"
                >
                    {{ it.name }}
                </a>
            </div>
        </div>

        <div v-else class="u-swordsman-skill-empty">暂无武学数据</div>
    </div>
</template>

<script>
import { DataAnalysis } from "@element-plus/icons-vue";
import { SKILL_SHAPE } from "./const";
import { getItemWikiUrl, getSkillDbUrl } from "@/utils/swordsman";

export default {
    name: "SwordsmanSkillList",
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
        };
    },
    computed: {
        isRealm() {
            return this.type === "realm";
        },
        sectionTitle() {
            return this.isRealm ? "武学境界" : "武学招式";
        },
        // 当前展示的招式 / 境界
        currentSkill() {
            const item = this.skills[this.currentIndex] || null;
            if (!item) return null;

            // 境界数据：使用 title 作为显示名称，不显示 typeLabel
            if (this.isRealm) {
                return {
                    ...item,
                    name: item.title || item.skillName || `境界${item.stage}`,
                    desc: item.skillDesc || `境界 ${item.title} 对应的武学技能`,
                    typeLabel: null,
                };
            }

            // 招式数据
            return item;
        },
    },
    watch: {
        // 切换侠客时重置选中索引
        skills: {
            handler() {
                this.currentIndex = this.defaultIndex;
            },
            deep: true,
        },
    },
    methods: {
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
        /**
         * 简单富文本处理：换行转 <br>
         */
        formatDesc(desc) {
            if (!desc) return "";
            return String(desc).replace(/\\n/g, "\n").replace(/\n/g, "<br>");
        },
        getItemWikiUrl,
        getSkillDbUrl,
    },
};
</script>

<style lang="less">
@import (reference) "~@/assets/css/swordsman/index.less";

.m-swordsman-skills {
    margin-bottom: 20px;

    .u-swordsman-section-title {
        display: block;
        width: 100%;
        padding: 8px 10px;
        background: @swordsman-color-primary;
        color: @swordsman-color-text-white;
        font-size: 14px;
        font-weight: 400;
        line-height: 18.48px;
        font-family: "Microsoft YaHei", sans-serif;
        border-radius: @swordsman-radius;
        margin: 0 0 12px;
    }
}

// Figma: Frame 293 (招式), gap 20px; Frame 311 (境界)
.m-swordsman-skill-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 16px;
}

// Figma: 图标 40x40 (招式), 28x28 (境界)
.u-swordsman-skill-icon {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: @swordsman-color-default-bg;
    cursor: pointer;
    overflow: hidden;
    transition: all @swordsman-transition-duration ease-out;
    box-sizing: border-box;
    border: 2px solid transparent;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .u-swordsman-skill-fallback {
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
        border-color: @swordsman-color-primary;
        box-shadow: 0 0 0 1px @swordsman-color-primary;
    }

    &:hover {
        transform: translateY(-1px);
    }
}

// Figma: Frame 298, rgba(0,0,0,0.05), 圆角8px, padding 20px
.m-swordsman-skill-detail {
    background: @swordsman-color-skill-card-bg;
    border-radius: @swordsman-radius;
    padding: 20px;
    box-sizing: border-box;
}

.m-swordsman-skill-detail__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 12px;
}

.u-swordsman-skill-detail-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.u-swordsman-skill-type {
    display: inline-block;
    width: fit-content;
    padding: 2px 8px;
    background: @swordsman-color-primary;
    color: @swordsman-color-text-white;
    font-size: 12px;
    line-height: 18px;
    border-radius: 4px;
}

.u-swordsman-skill-name {
    font-size: 16px;
    font-weight: 600;
    color: @swordsman-color-text-black;
    line-height: 24px;
}

.u-swordsman-skill-id {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.4);
    line-height: 18px;
}

.u-swordsman-skill-db {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    color: @swordsman-color-primary;
    font-size: 16px;
    text-decoration: none;
    transition: background @swordsman-transition-duration ease-out;

    &:hover {
        background: @swordsman-color-primary-hover;
    }
}

.u-swordsman-skill-desc {
    font-size: 14px;
    line-height: 1.7;
    color: @swordsman-color-text-muted;
}

// Figma Frame 298 底部：ID / Level / iconID 元信息
.m-swordsman-skill-meta {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid @swordsman-color-border-soft;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .u-swordsman-skill-meta-item {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
        line-height: 18px;
    }
}

.m-swordsman-skill-items {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px dashed @swordsman-color-border-soft;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .u-swordsman-skill-items-label {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.4);
    }
}

.u-swordsman-skill-empty {
    font-size: 13px;
    color: rgba(0, 0, 0, 0.4);
    text-align: center;
    padding: 20px 0;
}

// 武学境界图标：28x28 圆形（Figma Frame 311）
.m-swordsman-skills.is-realm {
    .u-swordsman-skill-icon {
        width: 28px;
        height: 28px;
    }
}
</style>
