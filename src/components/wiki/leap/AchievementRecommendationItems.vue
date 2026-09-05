<script>
import { Delete, Rank, Top } from "@element-plus/icons-vue";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import Draggable from "vuedraggable";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";
import { getAchievementWorkbenchDimensionValue } from "@/utils/achievementWorkbench";

export default {
    name: "AchievementRecommendationItems",
    components: { Delete, Rank, Top, Draggable, AchievementDifficultyStars },
    props: {
        dimensions: { type: Array, default: () => [] },
        items: { type: Array, required: true },
        group: { type: String, required: true },
        selectedIds: { type: Set, required: true },
        disabled: { type: Boolean, default: false },
        editable: { type: Boolean, default: true },
        promoteTo: { type: String, default: "" },
    },
    emits: ["move", "remove"],
    computed: {
        displayTagsById() {
            return Object.fromEntries(this.items.map((item) => [item.id, this.getDisplayTags(item)]));
        },
    },
    methods: {
        getLink, iconLink, getAchievementWorkbenchDimensionValue,
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
            this.$emit("move", { id: change.element.id, group: this.group, beforeId: remaining[change.newIndex]?.id || null });
        },
    },
};
</script>

<template>
    <Draggable :model-value="items" item-key="id" group="achievement-recommendation-items" :animation="150"
        handle=".m-recommendation-item-handle" :disabled="disabled || !editable" :data-group="group"
        class="m-recommendation-items" @change="change">
        <template #item="{ element: item, index }">
            <div class="m-server-recommendation__item" :data-id="item.id" :class="{ 'is-selected': editable && selectedIds.has(item.id) }">
                <span v-if="editable" class="m-recommendation-item-handle" :title="$t('achievementRecommendation.dragItem')"><Rank /></span>
                <span class="u-recommendation-order">{{ index + 1 }}</span>
                <div class="m-server-recommendation__item-content">
                    <a :href="getLink('achievement', item.id)" target="_blank" rel="noopener noreferrer" :title="item.name">
                        <img v-if="item.iconId" :src="iconLink(item.iconId)" alt="" /><span>{{ item.name }}</span>
                    </a>
                    <p v-if="item.shortDescription" class="m-recommendation-item-description">{{ item.shortDescription }}</p>
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
                <div class="m-server-recommendation__item-status">
                    <strong>{{ item.points }}</strong>
                    <small>{{ $t('achievementRecommendation.achievementPoints') }}</small>
                    <el-tooltip v-if="item.campRestricted" :content="$t('achievementRecommendation.campRestricted')">
                        <small class="u-recommendation-warning">{{ $t('achievementRecommendation.camp') }}</small>
                    </el-tooltip>
                </div>
                <el-tooltip v-if="editable && promoteTo" :content="$t('achievementRecommendation.moveToCurrent')">
                    <el-button text :disabled="disabled" :aria-label="$t('achievementRecommendation.moveToCurrent')"
                        @click="$emit('move', { id: item.id, group: promoteTo, beforeId: null })"><template #icon><Top /></template></el-button>
                </el-tooltip>
                <el-tooltip v-if="editable" :content="$t('achievementRecommendation.remove')">
                    <el-button text :disabled="disabled" :aria-label="$t('achievementRecommendation.remove')" @click="$emit('remove', item)">
                        <template #icon><Delete /></template>
                    </el-button>
                </el-tooltip>
            </div>
        </template>
        <template #footer>
            <p v-if="!items.length" role="status">{{ $t('achievementRecommendation.noFilterResults') }}</p>
        </template>
    </Draggable>
</template>

<style lang="less" scoped>
.m-recommendation-items { min-height: 48px; }
.m-server-recommendation__item { min-height: 76px; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 6px 10px;
    border-bottom: 1px solid #edf0ee; font-size: 13px;
    &.is-selected { background: #f3f8f6; }
    :deep(.el-button) { padding: 6px; width: 28px; margin: 0; flex: none; }
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
@media (max-width: 760px) {
    .m-recommendation-item-dimensions { width: 106px; max-width: 34%; gap: 3px;
        .m-recommendation-dimension-badge { > small, > :last-child { padding-inline: 3px; } }
    }
    .m-server-recommendation__item { gap: 4px; padding-inline: 4px; }
    .u-recommendation-order, .m-server-recommendation__item-content img { display: none; }
    .m-server-recommendation__item-status { width: 36px; }
}
</style>
