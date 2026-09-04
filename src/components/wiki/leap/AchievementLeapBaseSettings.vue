<script>
import PvxSurface from "@/components/design/PvxSurface.vue";

export default {
    name: "AchievementLeapBaseSettings",
    components: {
        PvxSurface,
    },
    props: {
        modelValue: {
            type: Object,
            required: true,
        },
        roles: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue", "role-change"],
    methods: {
        updateField(field, value) {
            if (field === "roleId") {
                this.$emit("role-change", value);
                return;
            }
            this.$emit("update:modelValue", { ...this.modelValue, [field]: value });
        },
        roleLabel(role) {
            return [role.name, role.server].filter(Boolean).join(" · ");
        },
    },
};
</script>

<template>
    <PvxSurface class="m-leap-base-settings" padding="medium" v-loading="loading">
        <header class="m-leap-base-settings__header">
            <strong>{{ $t("pages.wiki.leap.ui.workbench.baseSettings") }}</strong>
            <span>{{ $t("pages.wiki.leap.ui.workbench.baseSettingsDescription") }}</span>
        </header>

        <div class="m-leap-base-settings__grid">
            <label class="m-leap-base-field is-name">
                <span>{{ $t("pages.wiki.leap.ui.planName") }}</span>
                <el-input
                    :model-value="modelValue.title"
                    :placeholder="$t('pages.wiki.leap.ui.enterPlanName')"
                    maxlength="40"
                    show-word-limit
                    @update:model-value="updateField('title', $event)"
                />
            </label>

            <label class="m-leap-base-field">
                <span>{{ $t("pages.wiki.leap.ui.workbench.planRole") }}</span>
                <el-select
                    :model-value="modelValue.roleId"
                    :placeholder="$t('pages.wiki.leap.ui.selectPlaceholder')"
                    @update:model-value="updateField('roleId', $event)"
                >
                    <el-option
                        v-for="role in roles"
                        :key="role.id"
                        :label="roleLabel(role)"
                        :value="role.id"
                    />
                </el-select>
            </label>

            <label class="m-leap-base-field">
                <span>{{ $t("pages.wiki.leap.ui.targetSeniority") }}</span>
                <el-input-number
                    :model-value="modelValue.targetPoints"
                    :min="0"
                    :step="1000"
                    :controls="false"
                    @update:model-value="updateField('targetPoints', $event)"
                />
            </label>
        </div>
    </PvxSurface>
</template>

<style lang="less" scoped>
.m-leap-base-settings {
    color: #2e3738;
}

.m-leap-base-settings__header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 14px;
}

.m-leap-base-settings__header strong {
    color: #344547;
    font-size: 15px;
}

.m-leap-base-settings__header span {
    color: #879091;
    font-size: 12px;
}

.m-leap-base-settings__grid {
    display: grid;
    grid-template-columns: minmax(280px, 2fr) repeat(2, minmax(200px, 1fr));
    gap: 14px;
}

.m-leap-base-field {
    display: grid;
    min-width: 0;
    gap: 7px;
    color: #697374;
    font-size: 13px;
}

.m-leap-base-field :deep(.el-select),
.m-leap-base-field :deep(.el-input-number) {
    width: 100%;
}

@media (max-width: 960px) {
    .m-leap-base-settings__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .m-leap-base-field.is-name {
        grid-column: 1 / -1;
    }
}

@media (max-width: 640px) {
    .m-leap-base-settings__header {
        display: grid;
        gap: 4px;
    }

    .m-leap-base-settings__grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .m-leap-base-field.is-name {
        grid-column: auto;
    }
}
</style>
