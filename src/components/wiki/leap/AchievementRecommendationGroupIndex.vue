<script>
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Rank, List } from "@element-plus/icons-vue";
import Draggable from "vuedraggable";

export default {
    name: "AchievementRecommendationGroupIndex",
    components: { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Rank, List, Draggable },
    props: {
        groups: { type: Array, required: true },
        active: { type: String, default: "" },
        disabled: { type: Boolean, default: false },
        editable: { type: Boolean, default: true },
    },
    emits: ["jump", "reorder"],
    data() { return { indexVisible: false }; },
    computed: {
        activeIndex() { return this.groups.findIndex((group) => group.group === this.active); },
        previous() { return this.groups[this.activeIndex - 1]; },
        next() { return this.groups[this.activeIndex + 1]; },
    },
    methods: {
        jump(group) { this.$emit("jump", group); this.indexVisible = false; },
        reorder(groups) { if (this.editable && !this.disabled) this.$emit("reorder", groups); },
        move(index, offset) {
            const groups = [...this.groups];
            groups.splice(index + offset, 0, groups.splice(index, 1)[0]);
            this.reorder(groups);
        },
    },
};
</script>

<template>
    <nav class="m-recommendation-group-pager" :aria-label="$t('achievementRecommendation.groupIndex')">
        <button type="button" class="m-recommendation-page-link" :disabled="!previous || disabled"
            :title="previous?.label" :aria-label="`${$t('achievementRecommendation.previousGroup')} ${previous?.label || ''}`" @click="jump(previous.group)">
            <ArrowLeft /><span>{{ previous?.label || $t('achievementRecommendation.previousGroup') }}</span>
        </button>
        <el-popover v-model:visible="indexVisible" placement="bottom" trigger="click" :width="320"
            popper-class="m-recommendation-index-popover">
            <template #reference>
                <el-button text class="m-recommendation-index-trigger">
                    <template #icon><List /></template>
                    {{ $t('achievementRecommendation.viewIndex') }} {{ activeIndex + 1 }}/{{ groups.length }}
                </el-button>
            </template>
            <Draggable :model-value="groups" item-key="group" handle=".m-recommendation-drag-handle" :animation="150"
                :disabled="disabled || !editable" class="m-recommendation-index-list" @update:model-value="reorder">
                <template #item="{ element: group, index }">
                    <div class="m-recommendation-index-entry" :class="{ 'is-active': active === group.group }">
                        <span v-if="editable" class="m-recommendation-drag-handle" :title="$t('achievementRecommendation.dragGroup')"><Rank /></span>
                        <button type="button" class="m-recommendation-index-link" :title="group.label" :disabled="disabled"
                            :aria-current="active === group.group ? 'location' : undefined" @click="jump(group.group)">
                            <span>{{ group.label }}</span><small>{{ group.count }}</small>
                        </button>
                        <div v-if="editable" class="m-recommendation-index-actions">
                            <el-button text :disabled="disabled || index === 0" :title="$t('achievementRecommendation.moveGroupUp')"
                                :aria-label="$t('achievementRecommendation.moveGroupUp')" @click="move(index, -1)"><template #icon><ArrowUp /></template></el-button>
                            <el-button text :disabled="disabled || index === groups.length - 1" :title="$t('achievementRecommendation.moveGroupDown')"
                                :aria-label="$t('achievementRecommendation.moveGroupDown')" @click="move(index, 1)"><template #icon><ArrowDown /></template></el-button>
                        </div>
                    </div>
                </template>
            </Draggable>
        </el-popover>
        <button type="button" class="m-recommendation-page-link is-next" :disabled="!next || disabled"
            :title="next?.label" :aria-label="`${$t('achievementRecommendation.nextGroup')} ${next?.label || ''}`" @click="jump(next.group)">
            <span>{{ next?.label || $t('achievementRecommendation.nextGroup') }}</span><ArrowRight />
        </button>
    </nav>
</template>

<style lang="less" scoped>
.m-recommendation-group-pager { flex: none; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 8px; align-items: center; min-height: 52px; border-top: 1px solid #e2e8e6; }
.m-recommendation-page-link { display: flex; align-items: center; gap: 6px; min-width: 0; padding: 8px 0;
    border: 0; background: none; color: #365f64; cursor: pointer; font: inherit; font-size: 12px;
    svg { width: 14px; height: 14px; flex: none; }
    span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    &:disabled { color: #a3acab; cursor: default; }
    &.is-next { justify-content: flex-end; }
}
.m-recommendation-index-trigger { margin: 0; padding: 8px 4px; color: #365f64; font-size: 12px; }
.m-recommendation-index-list { max-height: min(360px, 50dvh); overflow-y: auto; overscroll-behavior: contain; }
.m-recommendation-index-entry { display: flex; align-items: center; padding: 4px; border-bottom: 1px solid #eef1ef; }
.m-recommendation-index-entry.is-active { background: #edf3f2; box-shadow: inset 3px 0 #47777d; }
.m-recommendation-drag-handle { display: flex; padding: 6px; cursor: grab; color: #7a8586; touch-action: none;
    svg { width: 16px; height: 16px; }
}
.m-recommendation-index-link { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; border: 0; background: none;
    padding: 6px; text-align: left; cursor: pointer; color: #365f64; font-size: 12px;
    span { min-width: 0; flex: 1; overflow-wrap: anywhere; } small { flex: none; color: #7a8586; }
    &:disabled { color: #919999; cursor: default; }
}
.m-recommendation-index-actions { display: flex;
    :deep(.el-button) { padding: 4px; margin: 0; width: 24px; height: 26px; }
}
</style>

<style lang="less">
.m-recommendation-index-popover.el-popover { max-width: calc(100vw - 24px); padding: 6px; box-sizing: border-box; }
</style>
