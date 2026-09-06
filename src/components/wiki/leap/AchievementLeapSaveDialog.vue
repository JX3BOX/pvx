<script>
export default {
    name: "AchievementLeapSaveDialog",
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: "",
        },
        editing: {
            type: Boolean,
            default: false,
        },
        saving: {
            type: Boolean,
            default: false,
        },
        routeCount: {
            type: Number,
            default: 0,
        },
        routePoints: {
            type: Number,
            default: 0,
        },
    },
    emits: ["update:modelValue", "save"],
    data() {
        return {
            localTitle: this.title,
        };
    },
    watch: {
        modelValue(value) {
            if (value) this.localTitle = this.title;
        },
        title(value) {
            if (!this.modelValue) this.localTitle = value;
        },
    },
    methods: {
        close() {
            this.$emit("update:modelValue", false);
        },
        submit() {
            const title = this.localTitle.trim();
            if (!title || this.saving) return;
            this.$emit("save", title);
        },
    },
};
</script>

<template>
    <el-dialog
        :model-value="modelValue"
        class="c-leap-save-dialog"
        width="480px"
        append-to-body
        destroy-on-close
        :title="editing ? $t('pages.wiki.leap.ui.workbench.updatePlan') : $t('pages.wiki.leap.ui.workbench.savePlan')"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <div class="m-leap-save-dialog">
            <p>{{ $t("pages.wiki.leap.ui.workbench.saveDescription", { count: routeCount, points: routePoints }) }}</p>
            <label>
                <span>{{ $t("pages.wiki.leap.ui.planName") }}</span>
                <el-input v-model="localTitle" maxlength="40" show-word-limit @keyup.enter="submit" />
            </label>
        </div>
        <template #footer>
            <button type="button" class="u-leap-dialog-cancel" @click="close">{{ $t("pages.wiki.leap.ui.cancel") }}</button>
            <button type="button" class="u-leap-dialog-save" :disabled="!localTitle.trim() || saving" @click="submit">
                {{ saving ? $t("pages.wiki.leap.ui.workbench.saving") : $t("pages.wiki.leap.ui.confirm") }}
            </button>
        </template>
    </el-dialog>
</template>

<style lang="less">
.c-leap-save-dialog {
    max-width: calc(100vw - 32px);
    box-sizing: border-box;
}

.c-leap-save-dialog .m-leap-save-dialog {
    display: grid;
    gap: 16px;
    color: #4d5b5d;
}

.c-leap-save-dialog .m-leap-save-dialog p {
    margin: 0;
    color: #7c8586;
    line-height: 1.7;
    overflow-wrap: anywhere;
}

.c-leap-save-dialog .m-leap-save-dialog label {
    display: grid;
    min-width: 0;
    gap: 7px;
    font-size: 13px;
}

.c-leap-save-dialog .u-leap-dialog-cancel,
.c-leap-save-dialog .u-leap-dialog-save {
    min-height: 38px;
    padding: 8px 16px;
    border: 1px solid #47777d;
    border-radius: 8px;
    cursor: pointer;
}

.c-leap-save-dialog .u-leap-dialog-cancel {
    color: #47777d;
    background: transparent;
}

.c-leap-save-dialog .u-leap-dialog-save {
    color: #fff;
    background: #47777d;
}

.c-leap-save-dialog .u-leap-dialog-save:disabled {
    border-color: #aeb8b8;
    background: #aeb8b8;
    cursor: not-allowed;
}

@media (max-width: @phone) {
    .c-leap-save-dialog {
        margin-block: 16px;
        padding: 16px;
        max-height: calc(100vh - 32px);
        max-height: calc(100dvh - 32px);
        overflow-y: auto;
        overscroll-behavior: contain;

        .el-dialog__title {
            overflow-wrap: anywhere;
        }

        .el-dialog__header {
            padding-right: 32px;
        }

        .el-dialog__footer {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
        }

        .el-input__wrapper {
            min-height: 42px;
            box-sizing: border-box;
        }

        .u-leap-dialog-cancel,
        .u-leap-dialog-save {
            min-width: 0;
            min-height: 44px;
            padding-inline: 8px;
            overflow-wrap: anywhere;
        }
    }
}
</style>
