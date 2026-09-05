<script>
export default {
    name: "AchievementCompareRoleDialog",
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        ownRoles: {
            type: Array,
            default: () => [],
        },
        friends: {
            type: Array,
            default: () => [],
        },
        friendRoles: {
            type: Array,
            default: () => [],
        },
        loadingFriendRoles: {
            type: Boolean,
            default: false,
        },
        adding: {
            type: Boolean,
            default: false,
        },
        remainingSlots: {
            type: Number,
            default: 1,
        },
    },
    emits: ["update:modelValue", "request-friend-roles", "confirm"],
    data() {
        return {
            form: {
                roleType: "self",
                friendId: "",
                roleIds: [],
            },
        };
    },
    computed: {
        availableRoles() {
            return this.form.roleType === "self" ? this.ownRoles : this.friendRoles;
        },
        rules() {
            return {
                friendId: {
                    required: this.form.roleType === "friend",
                    message: this.$t("pages.wiki.compare.ui.validation.selectFriend"),
                    trigger: "change",
                },
                roleIds: {
                    type: "array",
                    required: true,
                    min: 1,
                    message: this.$t("pages.wiki.compare.ui.validation.selectRole"),
                    trigger: "change",
                },
            };
        },
    },
    watch: {
        modelValue(value) {
            if (value) this.resetForm();
        },
    },
    methods: {
        close() {
            this.$emit("update:modelValue", false);
        },
        resetForm() {
            this.form = {
                roleType: "self",
                friendId: "",
                roleIds: [],
            };
            this.$nextTick(() => this.$refs.formRef?.clearValidate());
        },
        changeRoleType() {
            this.form.friendId = "";
            this.form.roleIds = [];
            this.$nextTick(() => this.$refs.formRef?.clearValidate());
        },
        selectFriend(friendId) {
            this.form.roleIds = [];
            this.$emit("request-friend-roles", String(friendId || ""));
        },
        async submit() {
            try {
                await this.$refs.formRef?.validate();
            } catch {
                return;
            }
            this.$emit("confirm", {
                roleType: this.form.roleType,
                friendId: this.form.friendId,
                roleIds: this.form.roleIds.slice(0, this.remainingSlots).map(String),
            });
        },
    },
};
</script>

<template>
    <el-dialog
        :model-value="modelValue"
        class="m-achievement-compare-role-dialog"
        :title="$t('pages.wiki.compare.ui.actions.addRole')"
        width="560px"
        append-to-body
        :close-on-click-modal="false"
        @update:model-value="$emit('update:modelValue', $event)"
        @closed="resetForm"
    >
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
            <el-form-item :label="$t('pages.wiki.compare.ui.role.selectType')">
                <el-radio-group v-model="form.roleType" @change="changeRoleType">
                    <el-radio value="self">{{ $t("pages.wiki.compare.ui.role.self") }}</el-radio>
                    <el-radio value="friend">{{ $t("pages.wiki.compare.ui.role.friend") }}</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item
                v-if="form.roleType === 'friend'"
                prop="friendId"
                :label="$t('pages.wiki.compare.ui.role.selectFriend')"
            >
                <el-select
                    v-model="form.friendId"
                    filterable
                    :placeholder="$t('pages.wiki.compare.ui.role.selectFriend')"
                    @change="selectFriend"
                >
                    <el-option
                        v-for="friend in friends"
                        :key="friend.id"
                        :value="friend.id"
                        :label="friend.name || $t('pages.wiki.compare.ui.common.unknown')"
                    />
                </el-select>
            </el-form-item>

            <el-form-item prop="roleIds" :label="$t('pages.wiki.compare.ui.role.selectRole')">
                <el-select
                    v-model="form.roleIds"
                    multiple
                    filterable
                    :multiple-limit="remainingSlots"
                    :loading="loadingFriendRoles"
                    :disabled="form.roleType === 'friend' && !form.friendId"
                    :placeholder="$t('pages.wiki.compare.ui.role.selectRole')"
                >
                    <el-option
                        v-for="role in availableRoles"
                        :key="role.id || role.jx3id"
                        :value="String(role.id || role.jx3id)"
                        :label="`${role.name || '—'} · ${role.server || '—'}`"
                    />
                </el-select>
            </el-form-item>

            <p class="m-compare-dialog-hint">
                {{ $t("pages.wiki.compare.ui.workbench.remainingRoleSlots", { count: remainingSlots }) }}
            </p>
        </el-form>

        <template #footer>
            <button type="button" class="u-compare-dialog-button" :disabled="adding" @click="close">
                {{ $t("pages.wiki.compare.ui.actions.cancel") }}
            </button>
            <button type="button" class="u-compare-dialog-button is-primary" :disabled="adding" @click="submit">
                {{ $t("pages.wiki.compare.ui.actions.confirm") }}
            </button>
        </template>
    </el-dialog>
</template>

<style lang="less">
.m-achievement-compare-role-dialog {
    max-width: calc(100vw - 32px);
    border-radius: 12px;

    .el-dialog__footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 12px;
    }

    .el-select {
        width: 100%;
    }
}

.m-compare-dialog-hint {
    margin: 0;
    color: #939b97;
    font-size: 11px;
}

.u-compare-dialog-button {
    display: inline-flex;
    height: 32px;
    min-height: 32px;
    min-width: 84px;
    flex: none;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    border: 1px solid rgba(70, 74, 66, 0.16);
    border-radius: 7px;
    color: #687270;
    background: #fffefa;
    font: inherit;
    font-size: 12px;
    white-space: nowrap;
    cursor: pointer;

    &.is-primary {
        border-color: #47777d;
        color: #fff;
        background: #47777d;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
</style>
