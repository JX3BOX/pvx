<script>
import { Lock, MagicStick, Medal, Trophy } from "@element-plus/icons-vue";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import PvxSurface from "@/components/design/PvxSurface.vue";
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";

const CATEGORY_ICONS = {
    regular: Medal,
    regularHidden: Lock,
    wujia: Trophy,
    wujiaHidden: Lock,
    fireworks: MagicStick,
    retired: Lock,
};

export default {
    name: "AchievementOverviewPanel",
    components: {
        PvxSurface,
        RoleAvatar,
    },
    props: {
        currentRole: {
            type: Object,
            required: true,
        },
        roleList: {
            type: Array,
            default: () => [],
        },
        avatarFrame: {
            type: String,
            default: "",
        },
        categoryName: {
            type: String,
            default: "",
        },
        categoryImage: {
            type: String,
            default: "",
        },
        displayRoleAvatar: {
            type: Boolean,
            default: true,
        },
        overview: {
            type: Object,
            default: () => ({
                overall: {},
                retiredSeniority: {},
                specialAchievements: {},
                categories: [],
                diagnostics: {},
            }),
        },
        categorySummary: {
            type: Object,
            default: () => ({}),
        },
        loading: {
            type: Boolean,
            default: false,
        },
        showHidden: {
            type: Boolean,
            default: true,
        },
    },
    emits: ["change-role", "update:showHidden"],
    computed: {
        isOverview() {
            return !this.categoryName;
        },
        showAvatarFrame() {
            return Boolean(this.avatarFrame && this.displayRoleAvatar);
        },
        overallSummary() {
            return this.overview?.overall || {};
        },
        currentSeniorityPoints() {
            return this.overallSummary.completedPoints;
        },
        categoryStatistics() {
            return this.overview?.categories || [];
        },
        visibleCategoryStatistics() {
            return this.categoryStatistics.filter((item) => this.showHidden || !item.hiddenGroup);
        },
        statisticScopeLabel() {
            const key = this.showHidden ? "includesHidden" : "visibleOnly";
            return this.$t(`pages.wiki.overview.ui.statistics.${key}`);
        },
    },
    methods: {
        showSchoolIcon,
        getCategoryIcon(key) {
            return CATEGORY_ICONS[key] || Medal;
        },
        formatRoleLabel(role) {
            if (!role?.server) return role?.name || "";
            return this.$t("pages.wiki.overview.ui.roleWithServer", {
                name: role.name,
                server: role.server,
            });
        },
        formatNumber(value) {
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale).format(Number(value) || 0);
        },
        formatProgress(value) {
            return value === null || value === undefined ? "—" : Number(value).toFixed(2);
        },
        getRemainingPointsKey(item) {
            if (item?.retiredGroup) return "retiredUnavailable";
            return ["wujia", "wujiaHidden"].includes(item?.key) ? "unearnedPoints" : "remainingPoints";
        },
        changeRole(role) {
            this.$emit("change-role", role);
        },
        changeShowHidden(value) {
            this.$emit("update:showHidden", Boolean(value));
        },
    },
};
</script>

<template>
    <PvxSurface
        class="m-achievement-overview-panel"
        :class="{ 'is-category-mode': !isOverview }"
        tag="section"
        padding="none"
        aria-labelledby="achievement-overview-title"
        v-loading="loading"
    >
        <div class="m-achievement-overview-panel__header">
            <div class="m-achievement-hero__main">
                <div class="m-achievement-hero__copy">
                    <span class="u-achievement-eyebrow">{{ $t("pages.wiki.overview.ui.eyebrow") }}</span>
                    <h1 id="achievement-overview-title">
                        {{ categoryName || $t("pages.wiki.overview.ui.overview") }}
                    </h1>
                    <p>{{ $t("pages.wiki.overview.ui.description") }}</p>

                    <div class="m-achievement-role">
                        <img
                            class="u-achievement-school"
                            :src="showSchoolIcon(currentRole.mount)"
                            :alt="$t('pages.wiki.overview.ui.schoolIcon')"
                        />
                        <div class="m-achievement-role__info">
                            <strong>{{ formatRoleLabel(currentRole) }}</strong>
                        </div>
                        <el-dropdown trigger="click">
                            <button
                                type="button"
                                class="u-achievement-role-switch"
                                :aria-label="$t('pages.wiki.overview.ui.switchRole')"
                            >
                                <span>{{ $t("pages.wiki.overview.ui.switchRole") }}</span>
                                <img src="@/assets/img/wiki/overview/toggle-user-icon.svg" alt="" />
                            </button>
                            <template #dropdown>
                                <el-dropdown-menu class="m-role-dropdown m-role-dropdown--achievement">
                                    <el-dropdown-item v-for="role in roleList" :key="role.ID">
                                        <button
                                            type="button"
                                            class="m-role-item"
                                            :class="{ active: role.jx3id === currentRole.jx3id }"
                                            @click="changeRole(role)"
                                        >
                                            <span class="m-role-item__name">
                                                <img class="u-role-school" :src="showSchoolIcon(role.mount)" alt="" />
                                                <span>{{ role.name }}</span>
                                            </span>
                                            <span>{{ role.server }}</span>
                                        </button>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>

                <div
                    class="m-achievement-avatar"
                    :class="{
                        'has-avatar-frame': showAvatarFrame,
                        'is-category-art': !displayRoleAvatar,
                    }"
                >
                    <img v-if="showAvatarFrame" class="u-avatar-border" :src="avatarFrame" alt="" />
                    <img v-if="!displayRoleAvatar" class="u-achievement-category-art" :src="categoryImage" alt="" />
                    <RoleAvatar
                        v-else
                        class="u-avatar-img"
                        :mount="currentRole.mount"
                        :body_type="currentRole.body_type"
                    />
                </div>
            </div>

            <div v-if="!isOverview" class="m-achievement-summary">
                <div class="m-achievement-summary__item">
                    <span>{{ $t("pages.wiki.overview.ui.categorySeniority", { category: categoryName }) }}</span>
                    <strong>{{ formatNumber(categorySummary.completedPoints) }}</strong>
                </div>
                <div class="m-achievement-summary__item">
                    <span>{{ $t("pages.wiki.overview.ui.totalSeniority") }}</span>
                    <strong>{{ formatNumber(categorySummary.totalPoints) }}</strong>
                </div>
                <div class="m-achievement-summary__item is-progress">
                    <span>{{ $t("pages.wiki.overview.ui.completion") }}</span>
                    <strong>{{ formatProgress(categorySummary.pointProgress) }}%</strong>
                </div>
                <div class="m-achievement-progress" aria-hidden="true">
                    <span :style="{ width: `${categorySummary.pointProgress || 0}%` }"></span>
                </div>
            </div>
        </div>

        <div v-if="isOverview" class="m-achievement-overview-panel__dashboard">
            <div class="m-achievement-dashboard-toolbar">
                <div class="m-achievement-dashboard-scope">
                    <span>{{ $t("pages.wiki.overview.ui.statistics.statisticsScope") }}</span>
                    <strong aria-live="polite">{{ statisticScopeLabel }}</strong>
                </div>
                <el-checkbox class="u-achievement-hidden-toggle" :model-value="showHidden" @change="changeShowHidden">
                    {{ $t("pages.wiki.overview.ui.statistics.showHidden") }}
                </el-checkbox>
            </div>

            <div class="m-achievement-overall-grid">
                <div class="m-achievement-overall-item is-current">
                    <span>{{ $t("pages.wiki.overview.ui.currentSeniority") }}</span>
                    <div class="m-achievement-overall-value">
                        <strong>{{ formatNumber(currentSeniorityPoints) }}</strong>
                        <small>{{ $t("pages.wiki.overview.ui.statistics.seniorityUnit") }}</small>
                        <small class="u-achievement-overall-count">
                            {{
                                $t("pages.wiki.overview.ui.statistics.completedResultCount", {
                                    count: formatNumber(overallSummary.completedCount),
                                })
                            }}
                        </small>
                    </div>
                </div>
                <div class="m-achievement-overall-item">
                    <span>{{ $t("pages.wiki.overview.ui.statistics.collectedSeniority") }}</span>
                    <div class="m-achievement-overall-value">
                        <strong>{{ formatNumber(overallSummary.totalPoints) }}</strong>
                        <small>{{ $t("pages.wiki.overview.ui.statistics.seniorityUnit") }}</small>
                        <small class="u-achievement-overall-count">
                            {{
                                $t("pages.wiki.overview.ui.resultCount", {
                                    count: formatNumber(overallSummary.totalCount),
                                })
                            }}
                        </small>
                    </div>
                </div>
                <div class="m-achievement-overall-item is-remaining">
                    <span>{{ $t("pages.wiki.overview.ui.statistics.remainingSeniority") }}</span>
                    <div class="m-achievement-overall-value">
                        <strong>
                            {{
                                formatNumber(
                                    overallSummary.obtainableRemainingPoints ?? overallSummary.remainingPoints
                                )
                            }}
                        </strong>
                        <small>{{ $t("pages.wiki.overview.ui.statistics.seniorityUnit") }}</small>
                    </div>
                </div>
            </div>

            <div class="m-achievement-overall-progress">
                <div class="m-achievement-overall-progress__label">
                    <span>{{ $t("pages.wiki.overview.ui.statistics.pointProgress") }}</span>
                    <strong>{{ formatProgress(overallSummary.pointProgress) }}%</strong>
                </div>
                <div
                    class="m-achievement-overall-progress__bar"
                    role="progressbar"
                    :aria-label="
                        $t('pages.wiki.overview.ui.statistics.overallProgressLabel', {
                            scope: statisticScopeLabel,
                        })
                    "
                    aria-valuemin="0"
                    aria-valuemax="100"
                    :aria-valuenow="overallSummary.pointProgress || 0"
                >
                    <span :style="{ width: `${overallSummary.pointProgress || 0}%` }"></span>
                </div>
            </div>

            <div class="m-achievement-group-heading">
                <h2>{{ $t("pages.wiki.overview.ui.statistics.categoryProgress") }}</h2>
            </div>

            <div class="m-achievement-group-grid">
                <article
                    v-for="item in visibleCategoryStatistics"
                    :key="item.key"
                    class="m-achievement-group-card"
                    :class="`is-${item.key}`"
                >
                    <div class="m-achievement-group-card__header">
                        <span class="u-achievement-group-icon" aria-hidden="true">
                            <component :is="getCategoryIcon(item.key)" />
                        </span>
                        <h3>{{ $t(`pages.wiki.overview.ui.statistics.${item.key}`) }}</h3>
                        <span v-if="item.includedIn" class="u-achievement-scope-badge is-subset">
                            {{ $t("pages.wiki.overview.ui.statistics.includedInRegular") }}
                        </span>
                        <span v-else-if="item.retiredGroup" class="u-achievement-scope-badge is-retired">
                            {{ $t("pages.wiki.overview.ui.statistics.retiredAchievement") }}
                        </span>
                        <span v-else-if="item.hiddenGroup" class="u-achievement-scope-badge is-hidden">
                            {{ $t("pages.wiki.overview.ui.statistics.hiddenAchievement") }}
                        </span>
                        <span v-else class="u-achievement-scope-badge">
                            {{ $t("pages.wiki.overview.ui.statistics.visibleAchievement") }}
                        </span>
                    </div>

                    <dl class="m-achievement-group-card__metrics">
                        <div>
                            <dt>{{ $t("pages.wiki.overview.ui.statistics.earnedSeniority") }}</dt>
                            <dd>
                                <strong>{{ formatNumber(item.completedPoints) }}</strong>
                                <span>
                                    / {{ formatNumber(item.totalPoints) }}
                                    {{ $t("pages.wiki.overview.ui.statistics.seniorityUnit") }}
                                </span>
                                <small class="u-achievement-group-count">
                                    {{
                                        $t("pages.wiki.overview.ui.achievementCount", {
                                            own: formatNumber(item.completedCount),
                                            all: formatNumber(item.totalCount),
                                        })
                                    }}
                                </small>
                            </dd>
                        </div>
                    </dl>

                    <strong class="u-achievement-group-remaining">
                        {{
                            $t(`pages.wiki.overview.ui.statistics.${getRemainingPointsKey(item)}`, {
                                points: formatNumber(item.remainingPoints),
                            })
                        }}
                    </strong>
                </article>
            </div>

        </div>
    </PvxSurface>
</template>
