<template>
    <PvxToolbar
        class="m-pvx-treasure-toolbar"
        :class="{
            'is-portrait': variant === 'portrait',
            'is-landscape': variant === 'landscape',
        }"
    >
        <div class="m-pvx-treasure-fields">
            <div class="m-pvx-treasure-field">
                <span v-if="!isIntegratedVariant" class="u-pvx-treasure-field-label">
                    {{ $t("pages.adventure.treasure.ui.role") }}
                </span>
                <div class="m-pvx-treasure-control-group">
                    <el-select
                        :model-value="role"
                        value-key="ID"
                        :placeholder="$t('pages.adventure.treasure.ui.rolePlaceholder')"
                        popper-class="m-related-roles-options"
                        @change="$emit('update:role', $event)"
                    >
                        <el-option v-for="item in roleList" :key="item.ID" :value="item" :label="item.name">
                            <span class="u-role">
                                <span class="u-role-name">
                                    <img class="u-role-icon" :src="showSchoolIcon(item.mount)" alt="" />
                                    {{ item.name }}
                                </span>
                                <span class="u-role-server">{{ item.server }}</span>
                            </span>
                        </el-option>
                    </el-select>
                    <el-tooltip
                        v-if="isIntegratedVariant"
                        :content="$t('pages.adventure.treasure.ui.roleManagement')"
                    >
                        <el-button
                            class="u-pvx-treasure-append-action"
                            :aria-label="$t('pages.adventure.treasure.ui.roleManagement')"
                            @click="$emit('role-setting')"
                        >
                            <el-icon><Setting /></el-icon>
                        </el-button>
                    </el-tooltip>
                </div>
            </div>

            <div class="m-pvx-treasure-field">
                <span v-if="!isIntegratedVariant" class="u-pvx-treasure-field-label">
                    {{ $t("pages.adventure.treasure.ui.camp") }}
                </span>
                <div class="m-pvx-treasure-control-group">
                    <el-select
                        :model-value="camp"
                        :placeholder="$t('pages.adventure.treasure.ui.campPlaceholder')"
                        popper-class="m-related-roles-options"
                        @change="$emit('update:camp', $event)"
                    >
                        <el-option value="hq" :label="$t('pages.adventure.treasure.ui.camps.hq')" />
                        <el-option value="er" :label="$t('pages.adventure.treasure.ui.camps.er')" />
                    </el-select>
                    <el-tooltip v-if="isIntegratedVariant" :content="$t('pages.adventure.treasure.ui.refreshTip')">
                        <el-button
                            class="u-pvx-treasure-append-action"
                            :loading="refreshing"
                            :disabled="!role"
                            :aria-label="$t('pages.adventure.treasure.ui.refresh')"
                            @click="$emit('refresh')"
                        >
                            <el-icon><RefreshRight /></el-icon>
                        </el-button>
                    </el-tooltip>
                </div>
            </div>
        </div>

        <p v-if="showSyncHint" class="u-pvx-treasure-sync-hint">
            <WarningFilled />
            {{ $t("pages.adventure.treasure.ui.syncHint") }}
        </p>

        <template #action>
            <div v-if="variant !== 'portrait'" class="m-pvx-treasure-actions">
                <el-tooltip v-if="!isIntegratedVariant" :content="$t('pages.adventure.treasure.ui.refreshTip')">
                    <el-button :loading="refreshing" :disabled="!role" @click="$emit('refresh')">
                        <el-icon><RefreshRight /></el-icon>
                        {{ $t("pages.adventure.treasure.ui.refresh") }}
                    </el-button>
                </el-tooltip>
                <el-button v-if="!isIntegratedVariant" @click="$emit('role-setting')">
                    <el-icon><Setting /></el-icon>
                    {{ $t("pages.adventure.treasure.ui.roleManagement") }}
                </el-button>
                <a
                    v-if="showSyncAction"
                    class="el-button"
                    href="/tool/74559"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <el-icon><Upload /></el-icon>
                    <span>{{ $t("pages.adventure.treasure.ui.sync") }}</span>
                </a>
                <el-button v-if="showSaveAction && canSave" type="primary" @click="$emit('save')">
                    <el-icon><Download /></el-icon>
                    {{ $t("pages.adventure.treasure.ui.save") }}
                </el-button>
            </div>
        </template>
    </PvxToolbar>
</template>

<script>
import PvxToolbar from "@/components/design/PvxToolbar.vue";
import { Download, RefreshRight, Setting, Upload, WarningFilled } from "@element-plus/icons-vue";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "TreasureControlBar",
    components: {
        Download,
        PvxToolbar,
        RefreshRight,
        Setting,
        Upload,
        WarningFilled,
    },
    props: {
        roleList: {
            type: Array,
            default: () => [],
        },
        role: {
            type: [Object, String],
            default: "",
        },
        camp: {
            type: String,
            default: "",
        },
        refreshing: {
            type: Boolean,
            default: false,
        },
        canSave: {
            type: Boolean,
            default: false,
        },
        showSyncHint: {
            type: Boolean,
            default: false,
        },
        showSyncAction: {
            type: Boolean,
            default: true,
        },
        showSaveAction: {
            type: Boolean,
            default: true,
        },
        variant: {
            type: String,
            default: "default",
            validator: (value) => ["default", "landscape", "portrait"].includes(value),
        },
    },
    emits: ["update:role", "update:camp", "refresh", "role-setting", "save"],
    computed: {
        isIntegratedVariant() {
            return ["landscape", "portrait"].includes(this.variant);
        },
    },
    methods: {
        showSchoolIcon,
    },
};
</script>
