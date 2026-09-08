<script>
import { Delete, Rank } from "@element-plus/icons-vue";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import Draggable from "vuedraggable";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";
import { getAchievementWorkbenchDimensionValue } from "@/utils/achievementWorkbench";

export default {
    name: "AchievementRecommendationItems",
    components: { Delete, Rank, Draggable, AchievementDifficultyStars },
    props: {
        dimensions: { type: Array, default: () => [] },
        items: { type: Array, required: true },
        selectedIds: { type: Set, required: true },
        removable: { type: Boolean, default: true },
        orderOffset: { type: Number, default: 0 },
        candidateMode: { type: Boolean, default: false },
        unavailableIds: { type: Set, default: () => new Set() },
        disabled: { type: Boolean, default: false },
        editable: { type: Boolean, default: true },
        tableLayout: { type: Boolean, default: false },
    },
    emits: ["move", "remove", "add"],
    computed: {
        tableStyle() {
            return {
                "--recommendation-columns": [
                    this.editable ? "24px" : null,
                    "30px",
                    "minmax(240px, 3fr)",
                    "68px",
                    ...this.dimensions.map(() => "minmax(110px, 1fr)"),
                    this.candidateMode ? "132px" : this.editable ? "36px" : null,
                ].filter(Boolean).join(" "),
                "--recommendation-min-width": `${386 + (this.editable ? 36 : 0) + (this.candidateMode ? 144 : this.editable ? 48 : 0) + this.dimensions.length * 122}px`,
                "--recommendation-points-column": this.editable ? 4 : 3,
            };
        },
        displayTagsById() {
            return Object.fromEntries(this.items.map((item) => [item.id, this.getDisplayTags(item)]));
        },
    },
    methods: {
        getLink, iconLink, getAchievementWorkbenchDimensionValue,
        syncHeaderScroll(event) {
            if (this.$refs.headerViewport) this.$refs.headerViewport.scrollLeft = event.target.scrollLeft;
        },
        getDisplayTags(item) {
            const tags = Array.isArray(item?.tags) ? item.tags : [];
            return tags
                .filter((tag) => typeof tag?.label === "string" && tag.label.trim() && !["普通成就", "常规成就"].includes(tag.label.trim()))
                .sort((left, right) => Number(right.type === "school") - Number(left.type === "school"));
        },
        change(event) {
            const change = event.added || event.moved;
            if (!change || !this.editable || this.disabled) return;
            const remaining = this.items.filter((item) => item.id !== change.element.id);
            const next = remaining[change.newIndex];
            const previous = remaining[change.newIndex - 1];
            const group = next?.recommendationGroup || previous?.recommendationGroup;
            if (group) this.$emit("move", { id: change.element.id, group, beforeId: next?.id || null });
        },
    },
};
</script>

<template>
    <div class="m-recommendation-items-container" :class="{ 'is-table': tableLayout }" :style="tableLayout ? tableStyle : null">
        <div v-if="tableLayout && items.length" ref="headerViewport" class="m-recommendation-items-header-viewport" aria-hidden="true">
            <div class="m-recommendation-items-header">
                <span v-if="editable"></span>
                <span>#</span>
                <span>{{ $t('pages.wiki.leap.ui.achievementName') }}</span>
                <span class="u-recommendation-points-heading">{{ $t('achievementRecommendation.achievementPoints') }}</span>
                <span v-for="dimension in dimensions" :key="dimension.key">{{ dimension.label }}</span>
                <span v-if="editable || candidateMode" class="u-recommendation-action-heading">{{ $t('pages.wiki.leap.ui.workbench.action') }}</span>
            </div>
        </div>
        <div class="m-recommendation-items-scroll" :tabindex="tableLayout ? 0 : null" @scroll.passive="syncHeaderScroll">
            <Draggable :model-value="items" item-key="id" group="achievement-recommendation-items" :animation="150"
                handle=".m-recommendation-item-handle" :disabled="disabled || !editable"
                class="m-recommendation-items" @change="change">
                <template #item="{ element: item, index }">
                    <div class="m-server-recommendation__item" :data-id="item.id" :class="{ 'is-selected': editable && selectedIds.has(item.id) }">
                        <span v-if="editable" class="m-recommendation-item-handle" :title="$t('achievementRecommendation.dragItem')"><Rank /></span>
                        <span class="u-recommendation-order">{{ orderOffset + index + 1 }}</span>
                        <div class="m-server-recommendation__item-content">
                            <a :href="getLink('achievement', item.id)" target="_blank" rel="noopener noreferrer" :title="item.name">
                                <img v-if="item.iconId" :src="iconLink(item.iconId)" alt="" /><span>{{ item.name }}</span>
                            </a>
                            <p v-if="item.shortDescription" class="m-recommendation-item-description">{{ item.shortDescription }}</p>
                            <p v-if="item.eventLabel" class="m-recommendation-item-description">{{ item.eventLabel }}</p>
                            <small :title="[item.category.name, item.category.subName, item.map.name].filter(Boolean).join(' · ')">
                                {{ [item.category.name, item.category.subName, item.map.name].filter(Boolean).join(' · ') }}
                            </small>
                            <div v-if="displayTagsById[item.id].length" class="m-recommendation-item-tags">
                                <span v-for="tag in displayTagsById[item.id]" :key="tag.id || tag.label"
                                    class="u-recommendation-achievement-tag" :title="tag.description || tag.label">{{ tag.label }}</span>
                            </div>
                        </div>
                        <div v-if="dimensions.length" class="m-recommendation-item-dimensions">
                            <span v-for="dimension in dimensions" :key="dimension.key" class="m-recommendation-dimension-badge">
                                <small>{{ dimension.label }}</small>
                                <AchievementDifficultyStars :value="getAchievementWorkbenchDimensionValue(item, dimension.key)"
                                    :dimension-key="dimension.key" :label="dimension.label" :score-labels="dimension.scoreLabels" />
                            </span>
                        </div>
                        <div class="m-recommendation-item-footer">
                            <div class="m-server-recommendation__item-status">
                                <strong>{{ item.points }}</strong>
                                <small>{{ $t('achievementRecommendation.achievementPoints') }}</small>
                                <el-tooltip v-if="item.campRestricted" :content="$t('achievementRecommendation.campRestricted')">
                                    <small class="u-recommendation-warning">{{ $t('achievementRecommendation.camp') }}</small>
                                </el-tooltip>
                            </div>
                            <div v-if="editable || candidateMode" class="m-recommendation-item-actions">
                                <el-button v-if="candidateMode" class="m-recommendation-add-candidate" type="primary" plain
                                    :disabled="disabled || selectedIds.has(item.id) || unavailableIds.has(item.id)" :title="unavailableIds.has(item.id) ? $t('achievementRecommendation.pointsMissing', { id: item.id }) : ''"
                                    @click="$emit('add', item)">{{ $t(selectedIds.has(item.id) ? 'achievementRecommendation.alreadySelected' : 'achievementRecommendation.addCandidate') }}</el-button>
                                <el-tooltip v-if="editable || (candidateMode && removable)" :content="$t(candidateMode ? 'achievementRecommendation.removeCandidate' : 'achievementRecommendation.remove')">
                                    <el-button text :disabled="disabled" :aria-label="$t(candidateMode ? 'achievementRecommendation.removeCandidate' : 'achievementRecommendation.remove')" @click="$emit('remove', item)">
                                        <template #icon><Delete /></template>
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <p v-if="!items.length" role="status">{{ $t('achievementRecommendation.noFilterResults') }}</p>
                </template>
            </Draggable>
        </div>
    </div>
</template>

<style lang="less" scoped>
.m-recommendation-items { min-height: 48px; }
.m-recommendation-items-container { min-width: 0; }
.m-recommendation-items-header-viewport { display: none; }
.m-recommendation-item-footer,
.m-recommendation-item-actions { display: contents; }
.m-server-recommendation__item { min-height: 76px; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 6px 10px;
    border-bottom: 1px solid #edf0ee; font-size: 13px;
    &.is-selected { background: #f3f8f6; }
    :deep(.el-button) { padding: 6px; width: 28px; margin: 0; flex: none; }
}
.m-server-recommendation__item :deep(.m-recommendation-add-candidate) { width: auto; min-width: 56px; height: 28px; min-height: 28px; padding: 4px 12px; font-size: 12px; font-weight: 400; border-radius: 6px;
    > span { white-space: normal; line-height: 1.4; }
}
.m-recommendation-item-handle { display: flex; flex: none; padding: 4px; color: #87918a; cursor: grab; touch-action: none;
    svg { width: 16px; height: 16px; }
}
.m-recommendation-item-dimensions { width: 280px; max-width: 38%; flex: none; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px;
    .m-recommendation-dimension-badge { display: inline-flex; align-items: stretch; max-width: 100%; min-width: 0; font-size: 11px; line-height: 18px; border-radius: 3px; overflow: hidden;
        > small { flex: none; padding: 1px 5px; background: #e8eceb; color: #697374; font-size: inherit; }
        > :last-child { min-width: 0; padding: 1px 5px; background: #eaf3f1; color: #47777d; }
    }
}
.m-server-recommendation__item-content { min-width: 0; flex: 1;
    a { display: flex; align-items: center; gap: 7px; color: #365f64; text-decoration: none; height: 28px; }
    img { width: 24px; height: 24px; flex: none; border-radius: 4px; }
    a > span, > small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    small { color: #7a8586; font-size: 11px; }
}
.m-recommendation-item-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.m-recommendation-item-description { margin: 4px 0; color: #7a8586; font-size: 12px; line-height: 1.5; white-space: pre-line; overflow-wrap: anywhere; }
.u-recommendation-achievement-tag { box-sizing: border-box; max-width: 100%; min-height: 20px; padding: 1px 7px;
    border: 1px solid rgba(64, 158, 255, 0.52); border-radius: 4px; color: #409eff; background: #ecf5ff;
    font-size: 11px; line-height: 1.4; white-space: normal; overflow-wrap: anywhere; word-break: break-word;
}
.u-recommendation-order { width: 30px; flex: none; color: #87918a; font-size: 11px; }
.m-server-recommendation__item-status { flex: none; width: 40px; text-align: center; font-variant-numeric: tabular-nums;
    strong { font-weight: 500; } small { display: block; font-size: 10px; color: #47777d; }
}
.u-recommendation-warning { color: #ae3b40 !important; }
@media (min-width: (@phone + 1px)) {
    .m-recommendation-items-container.is-table {
        border: 1px solid rgba(68, 86, 84, 0.13);
        border-radius: 10px;
        background: #fffdf8;

        .m-recommendation-items-header-viewport {
            display: block;
            position: sticky;
            top: var(--recommendation-table-sticky-top, calc(var(--achievement-sticky-top, 60px) + var(--recommendation-toolbar-height, 53px)));
            z-index: 4;
            overflow: hidden;
            border-radius: 9px 9px 0 0;
            background: #f0ece3;
            box-shadow: 0 1px 0 rgba(68, 86, 84, 0.1);
        }

        .m-recommendation-items-scroll {
            overflow-x: auto;
            border-radius: 0 0 9px 9px;
            &:focus-visible { outline: 2px solid #47777d; outline-offset: 2px; }
        }

        .m-recommendation-items,
        .m-recommendation-items-header { min-width: var(--recommendation-min-width); }

        .m-recommendation-items-header,
        .m-server-recommendation__item {
            display: grid;
            grid-template-columns: var(--recommendation-columns);
            gap: 12px;
            padding: 11px 12px;
            align-items: center;
        }

        .m-recommendation-items-header {
            background: #f0ece3;
            color: #405659;
            font-size: 12px;
            font-weight: 700;
        }

        .m-server-recommendation__item {
            border-color: rgba(68, 86, 84, 0.1);
            :deep(.el-button) { justify-self: center; }
            &.is-selected { background: transparent; }
            &:hover { background: #f3f8f6; }
            &:last-of-type { border-bottom: 0; }
        }

        .m-server-recommendation__item-content {
            a { height: auto; min-height: 24px; align-items: center; }
            a > span { white-space: normal; overflow-wrap: anywhere; line-height: 1.5; }
            .m-recommendation-item-description { margin: 0; }
        }

        .m-recommendation-item-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            min-width: 0;
            :deep(.m-recommendation-add-candidate) { min-width: 0; max-width: 100%; height: auto; }
        }

        .m-recommendation-item-dimensions { display: contents; }
        .m-recommendation-dimension-badge {
            display: flex;
            overflow: visible;
            font-size: 12px;

            > small { display: none; }
            > :last-child { padding: 0; background: transparent; }
        }

        .m-server-recommendation__item-status {
            grid-column: var(--recommendation-points-column);
            grid-row: 1;
            width: auto;
            color: #a77836;
            > small:not(.u-recommendation-warning) { display: none; }
        }

        .u-recommendation-points-heading,
        .u-recommendation-action-heading { text-align: center; }
    }
}
@media (max-width: @phone) {
    .m-server-recommendation__item {
        display: grid;
        grid-template-columns: 36px minmax(0, 1fr) auto;
        align-items: start;
        gap: 10px 6px;
        padding: 12px 8px;
    }

    .m-server-recommendation__item-content {
        grid-column: 1 / -1;
        grid-row: 1;

        a {
            height: auto;
            min-height: 28px;
            align-items: flex-start;
        }

        a > span,
        > small {
            min-width: 0;
            white-space: normal;
            overflow-wrap: anywhere;
            line-height: 1.5;
        }
    }

    .m-recommendation-item-dimensions {
        grid-column: 1 / -1;
        grid-row: 2;
        width: auto;
        max-width: 100%;
        justify-content: flex-start;
        gap: 6px;

        .m-recommendation-dimension-badge {
            flex-wrap: wrap;

            > small {
                min-width: 0;
                max-width: 100%;
                box-sizing: border-box;
                overflow-wrap: anywhere;
            }
        }
    }

    .m-recommendation-item-handle {
        grid-column: 1;
        grid-row: 3;
        min-height: 36px;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
    }

    .u-recommendation-order {
        grid-column: 2;
        grid-row: 3;
        width: auto;
        align-self: center;
    }

    .m-recommendation-item-footer {
        display: flex;
        grid-column: 3;
        grid-row: 3;
        align-items: center;
        gap: 6px;
        min-width: 0;

        :deep(.el-button) {
            width: 36px;
            height: 36px;
        }

        :deep(.el-button.m-recommendation-add-candidate) {
            width: auto;
            max-width: 140px;
            height: auto;
            min-height: 40px;
        }
    }

    .m-server-recommendation__item-status {
        width: auto;
        max-width: 84px;
        min-width: 0;
        padding-inline: 4px;
        overflow-wrap: anywhere;
    }
}
</style>
