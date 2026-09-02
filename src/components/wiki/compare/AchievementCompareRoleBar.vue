<script>
import { ArrowUp, Close, Lock, Plus } from "@element-plus/icons-vue";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "AchievementCompareRoleBar",
    components: {
        ArrowUp,
        Close,
        Lock,
        Plus,
    },
    props: {
        roles: {
            type: Array,
            default: () => [],
        },
        maxRoles: {
            type: Number,
            default: 4,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        collapsed: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["add-role", "remove-role", "update:collapsed"],
    computed: {
        remainingSlots() {
            return Math.max(0, this.maxRoles - this.roles.length);
        },
    },
    methods: {
        showSchoolIcon,
        formatNumber(value) {
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale).format(Number(value) || 0);
        },
        formatPercent(value) {
            return value === null || value === undefined ? "—" : `${Number(value).toFixed(1)}%`;
        },
    },
};
</script>

<template>
    <section
        class="m-compare-role-overview"
        :class="{ 'is-collapsed': collapsed }"
        :aria-label="$t('pages.wiki.compare.ui.workbench.comparisonRoles')"
        v-loading="loading"
    >
        <header class="m-compare-role-overview__header">
            <div class="m-compare-role-overview__title">
                <strong>{{ $t("pages.wiki.compare.ui.workbench.comparisonRoles") }}</strong>
                <span v-if="remainingSlots">
                    {{ $t("pages.wiki.compare.ui.workbench.remainingRoleSlots", { count: remainingSlots }) }}
                </span>
                <span v-else>{{ $t("pages.wiki.compare.ui.workbench.roleLimit", { count: maxRoles }) }}</span>
            </div>

            <div class="m-compare-role-overview__actions">
                <button
                    v-if="remainingSlots"
                    type="button"
                    class="u-compare-role-add"
                    :disabled="loading"
                    @click="$emit('add-role')"
                >
                    <Plus aria-hidden="true" />
                    <span>{{ $t("pages.wiki.compare.ui.actions.addRole") }}</span>
                </button>
                <button
                    type="button"
                    class="u-compare-role-toggle"
                    :aria-expanded="!collapsed"
                    aria-controls="achievement-compare-role-details"
                    @click="$emit('update:collapsed', !collapsed)"
                >
                    <span>
                        {{
                            collapsed
                                ? $t("pages.wiki.compare.ui.workbench.summaryExpand")
                                : $t("pages.wiki.compare.ui.workbench.summaryCollapse")
                        }}
                    </span>
                    <ArrowUp :class="{ 'is-collapsed': collapsed }" aria-hidden="true" />
                </button>
            </div>
        </header>

        <div id="achievement-compare-role-details" v-show="!collapsed" class="m-compare-role-bar">
            <article
                v-for="role in roles"
                :key="role.id || role.jx3id"
                class="m-compare-role-card"
                :class="{ 'is-primary': role.isCurrent }"
            >
                <div class="u-compare-role-avatar">
                    <img
                        v-if="role.school"
                        :src="showSchoolIcon(role.school)"
                        :alt="$t('pages.wiki.overview.ui.schoolIcon')"
                    />
                    <span v-else>{{ (role.name || "—").slice(0, 1) }}</span>
                </div>

                <div class="m-compare-role-card__main">
                    <div class="m-compare-role-card__name">
                        <strong :title="role.name">{{ role.name || "—" }}</strong>
                        <span v-if="role.isCurrent" class="is-current-role">
                            {{ $t("pages.wiki.compare.ui.role.currentRole") }}
                        </span>
                        <span v-else-if="role.isSelf">{{ $t("pages.wiki.compare.ui.workbench.selfBadge") }}</span>
                    </div>
                    <p>{{ role.server || "—" }}</p>
                    <div class="m-compare-role-card__stats">
                        <span>{{ formatNumber(role.completedPoints) }} / {{ formatNumber(role.totalPoints) }}</span>
                        <b>{{ formatPercent(role.pointProgress) }}</b>
                    </div>
                    <div class="m-compare-role-card__track" aria-hidden="true">
                        <span :style="{ width: `${role.pointProgress || 0}%` }"></span>
                    </div>
                </div>

                <span
                    v-if="role.isCurrent"
                    class="u-compare-current-role-lock"
                    role="img"
                    :aria-label="$t('pages.wiki.compare.ui.role.currentRole')"
                    :title="$t('pages.wiki.compare.ui.role.currentRole')"
                >
                    <Lock aria-hidden="true" />
                </span>
                <button
                    v-else
                    type="button"
                    class="u-compare-remove-role"
                    :aria-label="$t('pages.wiki.compare.ui.actions.removeRole')"
                    :title="$t('pages.wiki.compare.ui.actions.removeRole')"
                    :disabled="loading"
                    @click="$emit('remove-role', role)"
                >
                    <Close aria-hidden="true" />
                </button>
            </article>
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-compare-role-overview {
    overflow: hidden;
    border: 1px solid rgba(70, 74, 66, 0.14);
    border-radius: 14px;
    background: rgba(255, 254, 250, 0.86);

    :deep(.el-loading-mask) {
        background: rgba(255, 254, 250, 0.52);
    }
}

.m-compare-role-overview__header {
    display: flex;
    min-height: 56px;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 10px 14px;
    background: rgba(247, 244, 236, 0.72);
}

.m-compare-role-overview__title {
    display: flex;
    min-width: 0;
    align-items: baseline;
    gap: 10px;

    strong {
        color: #384246;
        font-size: 15px;
    }

    span {
        overflow: hidden;
        color: #98a09d;
        font-size: 11px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.m-compare-role-overview__actions {
    display: flex;
    flex: none;
    align-items: center;
    gap: 8px;
}

.u-compare-role-add,
.u-compare-role-toggle {
    display: inline-flex;
    height: 34px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 11px;
    border: 1px solid rgba(71, 119, 125, 0.24);
    border-radius: 7px;
    color: #47777d;
    background: rgba(255, 255, 252, 0.72);
    font: inherit;
    font-size: 12px;
    cursor: pointer;

    svg {
        width: 14px;
        height: 14px;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.u-compare-role-toggle svg {
    transition: transform 160ms ease;

    &.is-collapsed {
        transform: rotate(180deg);
    }
}

.m-compare-role-bar {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    padding: 10px;
    border-top: 1px solid rgba(70, 74, 66, 0.09);
}

.m-compare-role-card {
    position: relative;
    display: grid;
    min-width: 0;
    min-height: 82px;
    grid-template-columns: 40px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    padding: 10px 34px 10px 11px;
    border: 1px solid rgba(70, 74, 66, 0.13);
    border-radius: 10px;
    background: rgba(249, 247, 241, 0.66);

    &.is-primary {
        border-color: rgba(71, 119, 125, 0.42);
        box-shadow: inset 3px 0 0 rgba(71, 119, 125, 0.66);
    }
}

.u-compare-role-avatar {
    display: flex;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 50%;
    color: #fff;
    background: linear-gradient(140deg, #47777d, #294b52);
    box-shadow: 0 3px 10px rgba(42, 67, 71, 0.18);
    font-size: 15px;
    font-weight: 700;

    img {
        width: 27px;
        height: 27px;
        object-fit: contain;
    }
}

.m-compare-role-card__main {
    min-width: 0;

    > p {
        overflow: hidden;
        margin: 1px 0 4px;
        color: #9a9f9c;
        font-size: 10px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.m-compare-role-card__name {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 5px;

    strong {
        overflow: hidden;
        color: #354044;
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    span {
        flex: none;
        padding: 1px 5px;
        border-radius: 999px;
        color: #47777d;
        background: rgba(71, 119, 125, 0.11);
        font-size: 9px;

        &.is-current-role {
            color: #fff;
            background: #47777d;
        }
    }
}

.m-compare-role-card__stats {
    display: flex;
    align-items: baseline;
    gap: 5px;
    color: #7f8885;
    font-size: 10px;
    font-variant-numeric: tabular-nums;

    b {
        margin-left: auto;
        color: #ad8b42;
        font-size: 10px;
    }
}

.m-compare-role-card__track {
    height: 3px;
    overflow: hidden;
    margin-top: 4px;
    border-radius: 999px;
    background: rgba(71, 119, 125, 0.1);

    span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #47777d, #ad8b42);
    }
}

.u-compare-remove-role,
.u-compare-current-role-lock {
    position: absolute;
    top: 7px;
    right: 7px;
    display: inline-flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
}

.u-compare-current-role-lock {
    color: #47777d;
    background: rgba(71, 119, 125, 0.1);

    svg {
        width: 12px;
        height: 12px;
    }
}

.u-compare-remove-role {
    color: #a3a8a5;
    background: transparent;
    cursor: pointer;

    svg {
        width: 13px;
    }

    &:hover:not(:disabled) {
        color: #fff;
        background: #ad5149;
    }
}

@media (max-width: 1180px) {
    .m-compare-role-bar {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 620px) {
    .m-compare-role-overview__header {
        align-items: flex-start;
        flex-direction: column;
    }

    .m-compare-role-overview__actions {
        width: 100%;

        button {
            flex: 1;
        }
    }

    .m-compare-role-bar {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
