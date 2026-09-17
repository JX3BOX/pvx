<script>
import AchievementProgressList from "@/components/wiki/progress/AchievementProgressList.vue";

export default {
    name: "AchievementHiddenList",
    components: { AchievementProgressList },
    props: {
        title: { type: String, default: "" },
        records: { type: Array, default: () => [] },
        dimensions: { type: Array, default: () => [] },
        currentRole: { type: Object, default: null },
        roles: { type: Array, default: () => [] },
        total: { type: Number, default: 0 },
        page: { type: Number, default: 1 },
        pageSize: { type: Number, default: 20 },
        roleLoading: Boolean,
        loading: Boolean,
        error: Boolean,
    },
    emits: ["page-change", "retry", "select-role"],
};
</script>

<template>
    <AchievementProgressList
        class="m-hidden-list"
        compact
        show-total
        :title="title"
        :records="records"
        :total="total"
        :page="page"
        :page-size="pageSize"
        :loading="loading || roleLoading"
        :error="error"
        @page-change="$emit('page-change', $event)"
        @retry="$emit('retry')"
    >
        <template #header-actions>
            <el-select
                class="u-hidden-role-select"
                popper-class="m-achievement-theme-popper"
                :model-value="currentRole?.id"
                :loading="roleLoading"
                :disabled="roleLoading"
                :aria-label="$t('pages.wiki.overview.ui.switchRole')"
                @change="$emit('select-role', $event)"
            >
                <el-option v-for="role in roles" :key="role.id" :value="role.id" :label="role.server ? `${role.name} · ${role.server}` : role.name" />
            </el-select>
        </template>
        <template #filters>
            <slot name="filters" />
        </template>
    </AchievementProgressList>
</template>

<style lang="less" scoped>
.u-hidden-role-select { width: 220px; max-width: 100%; }
@media (max-width: @phone) {
    .u-hidden-role-select { width: 100%; }
}
</style>
