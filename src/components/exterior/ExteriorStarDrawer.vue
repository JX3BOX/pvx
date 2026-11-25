<template>
    <el-drawer
        :model-value="modelValue"
        :title="$t(`exterior.star.${view}`)"
        header-class="m-exterior-drawer-header"
        body-class="m-exterior-drawer-body"
        size="min(100%, 460px)"
        append-to-body
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <template #header="{ titleId }">
            <div class="flex min-w-0 items-center gap-2.5">
                <span class="grid size-8 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Star v-if="view === 'favorites'" class="size-4" aria-hidden="true" />
                    <Trophy v-else class="size-4" aria-hidden="true" />
                </span>
                <h2 :id="titleId" class="m-0 text-base font-semibold text-slate-800">
                    {{ $t(`exterior.star.${view}`) }}
                </h2>
            </div>
        </template>
        <ExteriorStarList
            :view="view"
            :visible="modelValue"
            @select="$emit('select')"
            @ranking-loaded="$emit('ranking-loaded', $event)"
        />
    </el-drawer>
</template>

<script>
import { Star, Trophy } from "@element-plus/icons-vue";
import ExteriorStarList from "./ExteriorStarList.vue";

export default {
    components: { Star, Trophy, ExteriorStarList },
    props: {
        view: { type: String, required: true },
        modelValue: Boolean,
    },
    emits: ["update:modelValue", "ranking-loaded", "select"],
};
</script>
