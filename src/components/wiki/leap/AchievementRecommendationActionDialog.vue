<script>
export default {
    name: "AchievementRecommendationActionDialog",
    props: {
        action: { type: String, required: true },
        source: { type: String, required: true },
        scope: { type: String, required: true },
        items: { type: Array, required: true },
        relatedCount: { type: Number, required: true },
        missingPointId: { type: String, default: null },
        disabled: { type: Boolean, default: false },
    },
    emits: ["update:scope", "cancel", "confirm"],
};
</script>

<template>
    <el-dialog draggable :model-value="true" width="560px" class="m-recommendation-action-dialog" append-to-body
        :close-on-click-modal="false" :title="$t(action === 'add' ? 'achievementRecommendation.confirmAddTitle' : 'achievementRecommendation.confirmRemoveTitle')"
        @update:model-value="!$event && $emit('cancel')">
        <p>{{ $t(action === 'add' ? 'achievementRecommendation.confirmAddHint' : source === 'selected'
            ? 'achievementRecommendation.confirmRemoveSelectedHint' : 'achievementRecommendation.confirmRemoveHint') }}</p>
        <el-radio-group v-if="relatedCount > 1" :model-value="scope" :disabled="disabled" :aria-label="$t('achievementRecommendation.actionScope')"
            @update:model-value="$emit('update:scope', $event)">
            <el-radio value="single" border>{{ $t('achievementRecommendation.singleAchievement') }}</el-radio>
            <el-radio value="related" border>
                {{ $t('achievementRecommendation.relatedAchievements', { count: relatedCount }) }}
            </el-radio>
        </el-radio-group>
        <ul class="m-recommendation-action-preview">
            <li v-for="item in items" :key="item.id">
                <span>{{ item.name }}</span>
                <small>{{ $t(item.selected ? 'achievementRecommendation.selected' : 'achievementRecommendation.candidateStatus') }}</small>
            </li>
        </ul>
        <el-alert v-if="missingPointId" type="error" :closable="false"
            :title="$t('achievementRecommendation.pointsMissing', { id: missingPointId })" />
        <template #footer>
            <el-button @click="$emit('cancel')">{{ $t('achievementRecommendation.cancelAction') }}</el-button>
            <el-button :type="action === 'add' ? 'primary' : 'danger'" :disabled="disabled || !items.length || Boolean(missingPointId)" @click="$emit('confirm')">
                {{ $t(action === 'add' ? 'achievementRecommendation.confirmAddCount' : 'achievementRecommendation.confirmRemoveCount', { count: items.length }) }}
            </el-button>
        </template>
    </el-dialog>
</template>

<style lang="less">
.m-recommendation-action-dialog {
    max-width: calc(100vw - 32px); box-sizing: border-box; color: #314043;
    p { margin: 0; line-height: 1.6; }
    .el-radio-group { display: flex; gap: 8px; margin-top: 16px; }
    .el-radio { margin: 0; height: auto; min-height: 40px; padding: 10px; }
    .el-radio__label { white-space: normal; line-height: 1.4; }
    .m-recommendation-action-preview { padding: 0 10px; margin: 14px 0 0; max-height: 240px; overflow-y: auto; list-style: none;
        border: 1px solid #e2e8e6; border-radius: 6px;
        li { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 8px 0; border-bottom: 1px solid #edf0ee;
            > span { overflow-wrap: anywhere; } small { flex: none; color: #47777d; }
        }
        li:last-child { border: 0; }
    }
    @media (max-width: @phone) {
        margin-top: 24px; max-height: calc(100dvh - 48px); display: flex; flex-direction: column;
        .el-dialog__body { min-height: 0; overflow-y: auto; }
        .el-radio-group { align-items: stretch; flex-direction: column; }
        .el-button { min-height: 40px; }
    }
}
</style>
