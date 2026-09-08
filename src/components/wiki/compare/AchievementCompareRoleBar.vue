<script>
import { ArrowUp, Close, Lock, Location, Plus } from "@element-plus/icons-vue";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "AchievementCompareRoleBar",
    components: {
        ArrowUp,
        Close,
        Lock,
        Location,
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
                    :title="collapsed ? $t('pages.wiki.compare.ui.workbench.summaryExpand') : $t('pages.wiki.compare.ui.workbench.summaryCollapse')"
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
                <div class="m-compare-role-card__name">
                    <strong :title="role.name">{{ role.name || "—" }}</strong>
                    <img
                        v-if="role.school"
                        :src="showSchoolIcon(role.school)"
                        :alt="$t('pages.wiki.overview.ui.schoolIcon')"
                    />
                </div>
                <p class="m-compare-role-card__server"><Location aria-hidden="true" />{{ role.server || "—" }}</p>
                <div
                    class="m-compare-role-card__stats"
                    :title="
                        formatNumber(role.completedPoints) +
                        ' / ' +
                        formatNumber(role.totalPoints) +
                        ' · ' +
                        formatPercent(role.pointProgress)
                    "
                >
                    <img src="@/assets/img/wiki/figma/points.png" alt="" />
                    {{ formatNumber(role.completedPoints) }}
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
            <button
                v-if="remainingSlots"
                class="m-compare-role-placeholder"
                type="button"
                :disabled="loading"
                @click="$emit('add-role')"
            >
                {{ $t("pages.wiki.compare.ui.actions.addRole") }}
            </button>
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-compare-role-overview {
    min-width: 0;
    padding: 12px;
    border-radius: 16px;
    background: #fff;
}
.m-compare-role-overview__header {
    display: none;
}
.m-compare-role-overview.is-collapsed .m-compare-role-overview__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}
.m-compare-role-overview__title {
    display: flex;
    align-items: center;
    gap: 8px;
    span {
        color: #999;
        font-size: 13px;
    }
}
.m-compare-role-overview__actions {
    display: flex;
    gap: 8px;
}
.u-compare-role-add,
.u-compare-role-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 32px;
    padding: 6px 12px;
    border: 1px solid #e5e5e5;
    border-radius: 20px;
    background: #fff;
    color: #967944;
    font: inherit;
    cursor: pointer;
    svg {
        width: 14px;
        height: 14px;
        flex: none;
        &.is-collapsed {
            transform: rotate(180deg);
        }
    }
}

.m-compare-role-bar {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}
.m-compare-role-card {
    position: relative;
    min-width: 0;
    min-height: 92px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    padding: 12px;
    border: 1px solid #5a7e84;
    border-left: 4px solid #5a7e84;
    border-radius: 8px;
    background: #fff;
}
.m-compare-role-card__name {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-right: 28px;
    grid-column: 1/-1;
    min-width: 0;
    strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 18px;
        color: #333;
    }
    img {
        width: 24px;
        height: 24px;
        object-fit: contain;
        flex: none;
    }
}
.m-compare-role-card__server {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    margin: 0;
    color: #999;
    font-size: 16px;
    overflow-wrap: anywhere;
    svg {
        width: 20px;
        height: 20px;
        flex: none;
    }
}
.m-compare-role-card__stats {
    display: flex;
    align-items: center;
    gap: 3px;
    align-self: end;
    color: #967944;
    font-size: 18px;
    font-variant-numeric: tabular-nums;
    img {
        width: 22px;
        height: 24px;
        object-fit: contain;
    }
}
.u-compare-remove-role,
.u-compare-current-role-lock {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    box-sizing: border-box;
    border: 1px solid #eee;
    border-radius: 50%;
    color: #aaa;
    background: #fff;
    svg {
        width: 14px;
        height: 14px;
    }
}
.u-compare-remove-role {
    cursor: pointer;
    &:hover {
        color: #ad5149;
        border-color: currentColor;
    }
}
.m-compare-role-placeholder {
    min-width: 0;
    min-height: 92px;
    border: 1px dashed #967944;
    border-radius: 8px;
    color: #6e572c;
    background: #fff;
    font: inherit;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    &:hover {
        background: #f8f7f3;
    }
}
@media (min-width: 721px) {
    .m-compare-role-overview:not(.is-collapsed) {
        position: relative;
        padding-right: 44px;
        .m-compare-role-overview__header { display:flex; position:absolute; right:8px; top:12px; bottom:12px; width:24px; }
        .m-compare-role-overview__title,.u-compare-role-add { display:none; }
        .m-compare-role-overview__actions { width:100%; }
        .u-compare-role-toggle { width:100%; min-height:44px; padding:4px; border:0; border-radius:6px; background:#f8f7f3; span { display:none; } }
    }
}
@media (max-width: 1200px) {
    .m-compare-role-card__name strong {
        font-size: 16px;
    }
    .m-compare-role-card__server {
        font-size: 14px;
    }
    .m-compare-role-card__stats {
        font-size: 16px;
    }
}
@media (max-width: @ipad) {
    .m-compare-role-bar {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: @phone) {
    .m-compare-role-overview__header {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
    }
    .m-compare-role-overview__title {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        strong {
            font-size: 14px;
        }
        span {
            font-size: 13px;
            color: #999;
        }
    }
    .m-compare-role-overview__actions {
        display: flex;
        gap: 8px;
    }
    .u-compare-role-add,
    .u-compare-role-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        min-height: 44px;
        gap: 6px;
        border: 1px solid #ddd;
        border-radius: 24px;
        padding: 8px 12px;
        color: #6e572c;
        background: #fff;
        font: inherit;
        font-size: 14px;
        svg {
            width: 14px;
            height: 14px;
            flex: none;
            &.is-collapsed {
                transform: rotate(180deg);
            }
        }
    }
    .m-compare-role-bar {
        grid-template-columns: minmax(0, 1fr);
    }
    .m-compare-role-card {
        min-height: 104px;
    }
    .m-compare-role-card__name {
        padding-right: 36px;
        strong {
            white-space: normal;
            overflow-wrap: anywhere;
        }
    }
    .u-compare-remove-role {
        width: 40px;
        height: 40px;
        top: 5px;
        right: 5px;
    }
}
</style>
