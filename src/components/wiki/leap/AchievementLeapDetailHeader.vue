<script>
import { ArrowDown, ArrowLeft, ChatDotRound, CopyDocument, Delete, Edit } from "@element-plus/icons-vue";
import PvxSurface from "@/components/design/PvxSurface.vue";

export default {
    name: "AchievementLeapDetailHeader",
    components: {
        ArrowDown,
        ArrowLeft,
        ChatDotRound,
        CopyDocument,
        Delete,
        Edit,
        PvxSurface,
    },
    props: {
        plan: {
            type: Object,
            default: null,
        },
        guidanceAllowed: {
            type: Boolean,
            default: false,
        },
        actionsDisabled: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["back", "request-guidance", "edit", "copy", "delete"],
    methods: {
        emitPlanAction(action) {
            if (this.actionsDisabled || !this.plan) return;
            this.$emit(action, this.plan);
        },
    },
};
</script>

<template>
    <PvxSurface class="m-leap-detail-header" padding="small" radius="medium">
        <div class="m-leap-detail-header__identity">
            <button type="button" class="u-leap-detail-button is-back" @click="$emit('back')">
                <ArrowLeft />
                {{ $t("pages.wiki.leap.ui.title") }}
            </button>
            <i aria-hidden="true"></i>
            <h1 :title="plan?.title">{{ plan?.title || $t("pages.wiki.leap.ui.unnamedPlan") }}</h1>
        </div>

        <div v-if="plan" class="m-leap-detail-header__actions">
            <button
                v-if="guidanceAllowed"
                type="button"
                class="u-leap-detail-button is-primary"
                :disabled="actionsDisabled"
                @click="emitPlanAction('request-guidance')"
            >
                <ChatDotRound />
                {{ $t('achievementConsultation.title') }}
            </button>

            <el-dropdown trigger="click" :disabled="actionsDisabled">
                <button type="button" class="u-leap-detail-button" :disabled="actionsDisabled">
                    {{ $t("pages.wiki.leap.ui.workbench.moreActions") }}
                    <ArrowDown />
                </button>
                <template #dropdown>
                    <el-dropdown-menu class="m-leap-detail-more-menu">
                        <el-dropdown-item v-if="plan.official">
                            <el-button class="u-leap-detail-menu-button" type="primary" @click="emitPlanAction('copy')">
                                <CopyDocument />
                                {{ $t("pages.wiki.leap.ui.workbench.copyAsMine") }}
                            </el-button>
                        </el-dropdown-item>
                        <template v-else>
                            <el-dropdown-item>
                                <el-button class="u-leap-detail-menu-button" type="primary" @click="emitPlanAction('edit')">
                                    <Edit />
                                    {{ $t("pages.wiki.leap.ui.workbench.editPlan") }}
                                </el-button>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-button class="u-leap-detail-menu-button" type="danger" @click="emitPlanAction('delete')">
                                    <Delete />
                                    {{ $t("pages.wiki.leap.ui.workbench.deletePlanShort") }}
                                </el-button>
                            </el-dropdown-item>
                        </template>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </PvxSurface>
</template>

<style lang="less" scoped>
.m-leap-detail-header {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    color: #324346;
}

.m-leap-detail-header__identity,
.m-leap-detail-header__actions {
    display: flex;
    min-width: 0;
    align-items: center;
}

.m-leap-detail-header__identity {
    flex: 1;
    gap: 12px;
}

.m-leap-detail-header__identity > i {
    width: 1px;
    height: 22px;
    flex: none;
    background: rgba(62, 82, 82, 0.15);
}

.m-leap-detail-header__identity h1 {
    min-width: 0;
    overflow: hidden;
    margin: 0;
    color: #324346;
    font-size: 20px;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.m-leap-detail-header__actions {
    flex: none;
    gap: 8px;
}

.u-leap-detail-button {
    display: inline-flex;
    min-height: 36px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 11px;
    border: 1px solid rgba(71, 119, 125, 0.5);
    border-radius: 8px;
    color: #47777d;
    background: rgba(255, 255, 255, 0.68);
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
}

.u-leap-detail-button:hover {
    border-color: #47777d;
    background: rgba(71, 119, 125, 0.08);
}

.u-leap-detail-button.is-primary {
    border-color: #47777d;
    color: #fff;
    background: #47777d;
}

.u-leap-detail-button.is-primary:hover {
    background: #3d6b70;
}

.u-leap-detail-button:disabled {
    border-color: #aab6b6;
    color: #fff;
    background: #aab6b6;
    cursor: default;
}

.u-leap-detail-button svg {
    width: 15px;
    height: 15px;
    flex: none;
}

.m-leap-detail-more-menu {
    min-width: 0;
    padding: 6px;
}

.m-leap-detail-more-menu :deep(.el-dropdown-menu__item) {
    padding: 3px;
    background: transparent;
}

.u-leap-detail-menu-button {
    min-width: 88px;
    min-height: 34px;
    justify-content: center;
    margin: 0;
}

.u-leap-detail-menu-button svg {
    width: 14px;
    height: 14px;
    margin-right: 6px;
}

@media (max-width: 760px) {
    .m-leap-detail-header {
        flex-wrap: wrap;
        gap: 12px;
    }

    .m-leap-detail-header__identity {
        flex-basis: 100%;
    }

    .m-leap-detail-header__actions {
        width: 100%;
        justify-content: flex-end;
    }
}

@media (max-width: 460px) {
    .m-leap-detail-header__identity {
        display: grid;
        grid-template-columns: auto 1fr;
    }

    .m-leap-detail-header__identity > i {
        display: none;
    }

    .m-leap-detail-header__actions {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
    }

    .m-leap-detail-header__actions .is-primary {
        width: 100%;
    }
}
</style>
