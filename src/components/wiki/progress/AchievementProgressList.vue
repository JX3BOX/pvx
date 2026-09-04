<script>
import { Loading, Location, Medal, Present } from "@element-plus/icons-vue";
import Item from "@jx3box/jx3box-editor/src/Item";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";
import { fetchAchievementWorkbenchRewardItems } from "@/service/achievementWorkbench";
import {
    formatAchievementWorkbenchValue,
    getAchievementWorkbenchDimensionValue,
} from "@/utils/achievementWorkbench";

export default {
    name: "AchievementProgressList",
    components: {
        AchievementDifficultyStars,
        Loading,
        Location,
        Medal,
        Present,
        "jx3-item": Item,
    },
    data() {
        return {
            rewardRequestId: 0,
            rewardItems: {},
        };
    },
    props: {
        title: {
            type: String,
            default: "",
        },
        records: {
            type: Array,
            default: () => [],
        },
        dimensions: {
            type: Array,
            default: () => [],
        },
        total: {
            type: Number,
            default: 0,
        },
        page: {
            type: Number,
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 20,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        error: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        resolvedTitle() {
            return this.title || this.$t("pages.wiki.overview.ui.workbench.allCategories");
        },
    },
    watch: {
        records: {
            handler(records) {
                this.loadRewardItems(records);
            },
            immediate: true,
        },
    },
    beforeUnmount() {
        this.rewardRequestId += 1;
    },
    emits: ["page-change", "retry"],
    methods: {
        iconLink,
        getLink,
        formatValue(value) {
            return formatAchievementWorkbenchValue(value);
        },
        formatNumber(value) {
            if (value === null || value === undefined) return "—";
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale).format(Number(value) || 0);
        },
        formatCompletionRate(value) {
            if (value === null || value === undefined) return "—";
            const normalized = Number(value);
            if (!Number.isFinite(normalized)) return "—";
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale, {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(normalized);
        },
        getStatusLabel(record) {
            if (record.completed === true) return this.$t("pages.wiki.overview.ui.completed");
            if (record.completed === false) return this.$t("pages.wiki.overview.ui.incomplete");
            return "—";
        },
        getTierLabel(record) {
            const keys = {
                normal: "statistics.regular",
                wujia: "statistics.wujia",
                hidden: "workbench.hiddenTier",
                retired: "statistics.retired",
            };
            return this.$t(`pages.wiki.overview.ui.${keys[record.tier] || keys.normal}`);
        },
        getDisplayTags(record) {
            const tags = Array.isArray(record?.tags) ? record.tags : [];
            return [...tags].sort((left, right) => Number(right?.type === "school") - Number(left?.type === "school"));
        },
        getDimensionLabel(dimension) {
            if (dimension?.i18nKey) return this.$t(dimension.i18nKey);
            return dimension?.label || dimension?.key || "—";
        },
        getDimensionValue(record, dimension) {
            return getAchievementWorkbenchDimensionValue(record, dimension?.key);
        },
        hasRewardReference(record) {
            return Boolean(this.getRewardKey(record));
        },
        getRewardKey(record) {
            const type = String(record?.reward?.itemType ?? "").trim();
            const id = String(record?.reward?.itemId ?? "").trim();
            if (!/^\d+$/.test(type) || !/^\d+$/.test(id)) return "";
            if (Number(type) <= 0 || Number(id) <= 0) return "";
            return `${Number(type)}_${Number(id)}`;
        },
        getRewardEntry(record) {
            return this.rewardItems[this.getRewardKey(record)] || null;
        },
        getRewardItem(record) {
            return this.getRewardEntry(record)?.item || null;
        },
        getRewardIcon(record) {
            const entry = this.getRewardEntry(record);
            if (!entry?.item?.IconID || entry.iconError) return "";
            return this.iconLink(entry.item.IconID, this.$store.state.client || "std");
        },
        getRewardLink(record) {
            const key = this.getRewardKey(record);
            return this.isItemReward(record) && key ? this.getLink("item", key) : "";
        },
        getRewardAriaLabel(record) {
            return this.$t("pages.wiki.overview.ui.viewRewardItem", {
                name: this.getRewardItem(record)?.Name || this.$t("pages.wiki.overview.ui.reward"),
            });
        },
        getRewardFallbackText(record) {
            const entry = this.getRewardEntry(record);
            return this.$t(
                entry?.status === "error"
                    ? "pages.wiki.overview.ui.rewardUnavailable"
                    : "pages.wiki.overview.ui.otherReward"
            );
        },
        isItemReward(record) {
            const entry = this.getRewardEntry(record);
            return entry?.status === "ready" && entry.kind === "item";
        },
        isRewardLoading(record) {
            if (!this.hasRewardReference(record)) return false;
            const entry = this.getRewardEntry(record);
            return !entry || entry.status === "loading";
        },
        setRewardEntry(key, entry) {
            this.rewardItems = {
                ...this.rewardItems,
                [key]: entry,
            };
        },
        isValidRewardItem(item, key) {
            return Boolean(
                item &&
                    typeof item === "object" &&
                    Object.keys(item).length &&
                    String(item.id || item.idKey || "") === key &&
                    item.Name
            );
        },
        getCachedRewardItem(key, client) {
            try {
                const item = JSON.parse(sessionStorage.getItem(`item-${client}-${key}`));
                return this.isValidRewardItem(item, key) ? item : null;
            } catch {
                return null;
            }
        },
        loadRewardItems(records = []) {
            const requestId = ++this.rewardRequestId;
            const client = this.$store.state.client || "std";
            const rewardKeys = [...new Set(records.map((record) => this.getRewardKey(record)).filter(Boolean))];
            const uncachedKeys = [];

            this.rewardItems = {};
            rewardKeys.forEach((key) => {
                const cachedItem = this.getCachedRewardItem(key, client);
                if (cachedItem) {
                    this.setRewardEntry(key, {
                        status: "ready",
                        kind: "item",
                        item: cachedItem,
                        iconError: false,
                    });
                    return;
                }

                uncachedKeys.push(key);
                this.setRewardEntry(key, {
                    status: "loading",
                    kind: "unknown",
                    item: null,
                    iconError: false,
                });
            });

            for (let index = 0; index < uncachedKeys.length; index += 40) {
                const keys = uncachedKeys.slice(index, index + 40);
                fetchAchievementWorkbenchRewardItems(keys, client)
                    .then((items) => {
                        if (requestId !== this.rewardRequestId) return;
                        const itemMap = new Map(items.map((item) => [String(item?.id || item?.idKey || ""), item]));

                        keys.forEach((key) => {
                            const item = itemMap.get(key);
                            if (this.isValidRewardItem(item, key)) {
                                try {
                                    sessionStorage.setItem(`item-${client}-${key}`, JSON.stringify(item));
                                } catch {
                                    // 缓存不可用不应影响奖励展示。
                                }
                                this.setRewardEntry(key, {
                                    status: "ready",
                                    kind: "item",
                                    item,
                                    iconError: false,
                                });
                                return;
                            }

                            this.setRewardEntry(key, {
                                status: "ready",
                                kind: "other",
                                item: null,
                                iconError: false,
                            });
                        });
                    })
                    .catch(() => {
                        if (requestId !== this.rewardRequestId) return;
                        keys.forEach((key) => {
                            this.setRewardEntry(key, {
                                status: "error",
                                kind: "unknown",
                                item: null,
                                iconError: false,
                            });
                        });
                    });
            }
        },
        onRewardIconError(record) {
            const key = this.getRewardKey(record);
            const entry = this.getRewardEntry(record);
            if (!key || !entry) return;
            this.setRewardEntry(key, {
                ...entry,
                iconError: true,
            });
        },
    },
};
</script>

<template>
    <section class="m-progress-list" :aria-label="resolvedTitle">
        <div v-if="$slots.filters" class="m-progress-list__filters">
            <slot name="filters" />
        </div>

        <div class="m-progress-list__header">
            <h2>{{ resolvedTitle }}</h2>
            <span>{{ $t("pages.wiki.overview.ui.workbench.resultSummary", { count: formatNumber(total) }) }}</span>
        </div>

        <div class="m-progress-list__body" v-loading="loading">
            <div v-if="error" class="m-progress-list-state">
                <strong>{{ $t("pages.wiki.overview.ui.loadFailed") }}</strong>
                <p>{{ $t("pages.wiki.overview.ui.loadFailedDescription") }}</p>
                <button type="button" @click="$emit('retry')">{{ $t("pages.wiki.overview.ui.retry") }}</button>
            </div>

            <div v-else-if="!loading && !records.length" class="m-progress-list-state">
                <Medal aria-hidden="true" />
                <strong>{{ $t("pages.wiki.overview.ui.workbench.emptyTitle") }}</strong>
                <p>{{ $t("pages.wiki.overview.ui.workbench.emptyDescription") }}</p>
            </div>

            <div v-else class="m-progress-achievement-list">
                <article v-for="record in records" :key="record.id" class="m-progress-achievement-card">
                    <a
                        class="u-progress-achievement-icon"
                        :href="getLink('achievement', record.id)"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img v-if="record.iconId" :src="iconLink(record.iconId)" alt="" />
                        <Medal v-else aria-hidden="true" />
                    </a>

                    <div class="m-progress-achievement-card__content">
                        <div class="m-progress-achievement-card__title">
                            <div>
                                <a :href="getLink('achievement', record.id)" target="_blank" rel="noopener noreferrer">
                                    {{ formatValue(record.name) }}
                                </a>
                                <span class="u-progress-points">+{{ formatNumber(record.points) }}</span>
                                <span
                                    v-if="record.tier === 'wujia'"
                                    :class="['u-progress-tier', `is-${record.tier}`]"
                                >{{
                                    getTierLabel(record)
                                }}</span>
                            </div>
                            <span
                                class="u-progress-status"
                                :class="{
                                    'is-completed': record.completed === true,
                                    'is-incomplete': record.completed === false,
                                }"
                            >
                                {{ getStatusLabel(record) }}
                            </span>
                        </div>

                        <p class="u-progress-description">{{ formatValue(record.shortDescription) }}</p>

                        <div class="m-progress-achievement-card__meta">
                            <span
                                v-for="tag in getDisplayTags(record)"
                                :key="tag.id || tag.label"
                                class="u-progress-achievement-tag"
                            >
                                {{ tag.label }}
                            </span>
                            <span v-if="record.map?.name"><Location aria-hidden="true" />{{ record.map.name }}</span>
                            <span
                                v-for="dimension in dimensions"
                                :key="dimension.key"
                                class="u-progress-dimension"
                            >
                                {{ getDimensionLabel(dimension) }}
                                <AchievementDifficultyStars
                                    class="u-progress-rating"
                                    :value="getDimensionValue(record, dimension)"
                                    :label="getDimensionLabel(dimension)"
                                />
                            </span>
                            <span
                                v-if="
                                    record.completionStatistics?.rate !== null &&
                                    record.completionStatistics?.rate !== undefined
                                "
                                class="u-progress-completion-statistics"
                            >
                                <span>
                                    {{ $t("pages.wiki.overview.ui.workbench.completionRate") }}
                                    <strong>{{ formatCompletionRate(record.completionStatistics.rate) }}</strong>
                                </span>
                            </span>
                            <span v-if="hasRewardReference(record)" class="m-progress-achievement-reward">
                                <span class="u-progress-reward-label">{{ $t("pages.wiki.overview.ui.reward") }}</span>
                                <el-tooltip v-if="isItemReward(record)" placement="top">
                                    <template #content><jx3-item :item="getRewardItem(record)" /></template>
                                    <a
                                        class="u-progress-reward-trigger"
                                        :href="getRewardLink(record)"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        :aria-label="getRewardAriaLabel(record)"
                                    >
                                        <img
                                            v-if="getRewardIcon(record)"
                                            :src="getRewardIcon(record)"
                                            :alt="getRewardItem(record)?.Name || ''"
                                            @error="onRewardIconError(record)"
                                        />
                                        <Present v-else aria-hidden="true" />
                                    </a>
                                </el-tooltip>
                                <span
                                    v-else-if="isRewardLoading(record)"
                                    class="u-progress-reward-trigger is-loading"
                                    :aria-label="$t('pages.wiki.overview.ui.rewardLoading')"
                                >
                                    <Loading aria-hidden="true" />
                                </span>
                                <span
                                    v-else-if="hasRewardReference(record)"
                                    class="u-progress-reward-trigger is-other"
                                    :title="getRewardFallbackText(record)"
                                    :aria-label="getRewardFallbackText(record)"
                                >
                                    <Present aria-hidden="true" />
                                </span>
                                <span v-else class="u-progress-reward-empty">
                                    {{ $t("pages.wiki.overview.ui.emptyValue") }}
                                </span>
                            </span>
                        </div>
                    </div>
                </article>
            </div>
        </div>

        <div v-if="total > pageSize" class="m-progress-pagination">
            <el-pagination
                background
                layout="prev, pager, next"
                :current-page="page"
                :page-size="pageSize"
                :total="total"
                @current-change="$emit('page-change', $event)"
            />
        </div>
    </section>
</template>

<style lang="less" scoped>
.m-progress-list {
    display: flex;
    min-width: 0;
    flex-direction: column;
    border: 1px solid rgba(70, 74, 66, 0.14);
    border-radius: 14px;
    background: rgba(255, 254, 250, 0.86);
}

.m-progress-list__filters {
    flex: none;
}

.m-progress-list__header {
    display: flex;
    min-height: 72px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(70, 74, 66, 0.1);

    h2 {
        margin: 0;
        color: #384246;
        font-size: 16px;
    }

    span {
        color: #a0a7a4;
        font-size: 11px;
    }
}

.m-progress-list__body {
    position: relative;
    padding: 10px;
}

.m-progress-achievement-list {
    display: grid;
    gap: 8px;
}

.m-progress-achievement-card {
    display: grid;
    min-width: 0;
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid rgba(70, 74, 66, 0.11);
    border-radius: 10px;
    background: rgba(249, 247, 241, 0.68);
    transition: border-color 150ms ease, background-color 150ms ease, transform 150ms ease;

    &:hover {
        border-color: rgba(71, 119, 125, 0.25);
        background: #fffef9;
        transform: translateY(-1px);
    }
}

.u-progress-achievement-icon {
    display: flex;
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(71, 119, 125, 0.16);
    border-radius: 10px;
    color: #47777d;
    background: rgba(71, 119, 125, 0.08);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    svg {
        width: 22px;
        height: 22px;
    }
}

.m-progress-achievement-card__content {
    min-width: 0;
}

.m-progress-achievement-card__title {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;

    > div {
        display: flex;
        min-width: 0;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
    }

    a {
        min-width: 0;
        color: #344044;
        font-size: 14px;
        font-weight: 650;
        text-decoration: none;

        &:hover {
            color: #356873;
        }
    }
}

.u-progress-points {
    color: #b65a50;
    font-size: 11px;
    font-weight: 700;
}

.u-progress-tier,
.u-progress-status {
    display: inline-flex;
    min-height: 22px;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
}

.u-progress-tier {
    color: #47777d;
    background: rgba(71, 119, 125, 0.09);

    &.is-wujia {
        color: #a07828;
        background: rgba(179, 140, 61, 0.11);
    }

    &.is-hidden {
        color: #765f92;
        background: rgba(118, 95, 146, 0.11);
    }

    &.is-retired {
        color: #b05f57;
        background: rgba(176, 95, 87, 0.1);
    }
}

.u-progress-status {
    flex: none;
    color: #a65a52;
    background: rgba(176, 95, 87, 0.09);

    &.is-completed {
        color: #47775f;
        background: rgba(71, 119, 95, 0.1);
    }
}

.u-progress-description {
    margin: 6px 0;
    overflow: hidden;
    color: #7f8887;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.m-progress-achievement-card__meta {
    display: flex;
    min-width: 0;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 14px;
    color: #9aa29f;
    font-size: 10px;

    span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    svg {
        width: 12px;
        height: 12px;
    }
}

.u-progress-dimension {
    color: #8b9391;

    strong {
        color: #626a68;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
    }
}

.u-progress-rating {
    color: #a8773c !important;
    letter-spacing: 0.04em;
}

.u-progress-completion-statistics {
    strong {
        color: #626a68;
        font-weight: 650;
        font-variant-numeric: tabular-nums;
    }
}

.u-progress-achievement-tag {
    min-height: 20px;
    padding: 1px 7px;
    border: 1px solid rgba(64, 158, 255, 0.52);
    border-radius: 4px;
    color: #409eff;
    background: #ecf5ff;
    line-height: 1.4;
}

.m-progress-achievement-reward {
    min-height: 24px;
    padding-left: 10px;
    border-left: 1px solid rgba(70, 74, 66, 0.12);
}

.u-progress-reward-label {
    color: #8a9290;
}

.u-progress-reward-trigger {
    display: inline-flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(140, 116, 76, 0.2);
    border-radius: 6px;
    color: #8c744c;
    background: rgba(140, 116, 76, 0.08);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    svg {
        width: 13px;
        height: 13px;
    }

    &.is-loading svg {
        animation: progress-reward-spin 900ms linear infinite;
    }
}

.u-progress-reward-empty {
    color: #a4aaa7;
}

@keyframes progress-reward-spin {
    to {
        transform: rotate(360deg);
    }
}

.m-progress-list-state {
    display: flex;
    min-height: 380px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: #8c9693;
    text-align: center;

    > svg {
        width: 38px;
        height: 38px;
        margin-bottom: 12px;
        color: #82989a;
    }

    strong {
        color: #4f595b;
        font-size: 15px;
    }

    p {
        max-width: 420px;
        margin: 7px 0 0;
        font-size: 12px;
        line-height: 1.6;
    }

    button {
        margin-top: 14px;
        padding: 7px 14px;
        border: 0;
        border-radius: 7px;
        color: #fff;
        background: #47777d;
        cursor: pointer;
    }
}

.m-progress-pagination {
    display: flex;
    flex: none;
    justify-content: center;
    padding: 14px;
    border-top: 1px solid rgba(70, 74, 66, 0.1);
}

@media (max-width: 560px) {
    .m-progress-list__header {
        align-items: flex-start;
        flex-direction: column;
        gap: 5px;
    }

    .m-progress-achievement-card {
        grid-template-columns: 40px minmax(0, 1fr);
        gap: 10px;
        padding: 10px;
    }

    .u-progress-achievement-icon {
        width: 40px;
        height: 40px;
    }

    .m-progress-achievement-card__title {
        align-items: stretch;
        flex-direction: column;
        gap: 6px;
    }

    .u-progress-status {
        width: fit-content;
    }

    .u-progress-description {
        white-space: normal;
    }
}

@media (prefers-reduced-motion: reduce) {
    .m-progress-achievement-card {
        transition: none;
    }

    .u-progress-reward-trigger.is-loading svg {
        animation: none;
    }
}
</style>
