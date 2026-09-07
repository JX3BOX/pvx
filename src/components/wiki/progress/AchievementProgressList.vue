<script>
import { Loading, Location, Medal, Present } from "@element-plus/icons-vue";
import Item from "@jx3box/jx3box-editor/src/Item";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";
import responsivePagination from "@/mixins/responsive-pagination";
import { fetchAchievementWorkbenchRewardItems } from "@/service/achievementWorkbench";
import {
    formatAchievementWorkbenchValue,
    getAchievementWorkbenchDimensionValue,
} from "@/utils/achievementWorkbench";

export default {
    name: "AchievementProgressList",
    mixins: [responsivePagination],
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
                        :aria-label="formatValue(record.name)"
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
                            <slot name="actions" :record="record">
                                <span
                                    class="u-progress-status"
                                    :class="{
                                        'is-completed': record.completed === true,
                                        'is-incomplete': record.completed === false,
                                    }"
                                >
                                    {{ getStatusLabel(record) }}
                                </span>
                            </slot>
                        </div>

                        <p v-if="record.shortDescription" class="u-progress-description">{{ record.shortDescription }}</p>

                        <div class="m-progress-achievement-card__meta">
                            <slot name="metadata" :record="record" />
                            <span
                                v-for="tag in getDisplayTags(record)"
                                :key="tag.id || tag.label"
                                class="u-progress-achievement-tag"
                            >
                                {{ tag.label }}
                            </span>
                            <span v-if="record.map?.name" class="u-progress-map">
                                <Location aria-hidden="true" />{{ record.map.name }}
                            </span>
                            <div v-if="dimensions.length" class="m-progress-achievement-dimensions">
                                <span
                                    v-for="dimension in dimensions"
                                    :key="dimension.key"
                                    class="u-progress-dimension"
                                >
                                    <span class="u-progress-dimension-label">{{ getDimensionLabel(dimension) }}</span>
                                    <AchievementDifficultyStars
                                        class="u-progress-rating"
                                        :value="getDimensionValue(record, dimension)"
                                        :dimension-key="dimension.key"
                                        :score-labels="dimension.scoreLabels"
                                        :label="getDimensionLabel(dimension)"
                                    />
                                </span>
                            </div>
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
                :layout="isPaginationPhoneViewport ? 'prev, slot, next' : 'prev, pager, next'"
                :current-page="page"
                :page-size="pageSize"
                :pager-count="responsivePagerCount"
                :total="total"
                @current-change="$emit('page-change', $event)"
            >
                <span class="u-achievement-pagination-status" aria-live="polite">
                    {{ page }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}
                </span>
            </el-pagination>
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
    white-space: pre-line;
    overflow-wrap: anywhere;
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

.m-progress-achievement-dimensions {
    display: contents;
}

.u-progress-rating {
    color: #a8773c !important;
    letter-spacing: 0.04em;
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

@media (max-width: @phone) {
    .m-progress-list__header {
        min-height: 0;
        align-items: flex-start;
        flex-direction: column;
        gap: 5px;
        padding: 12px;
        overflow-wrap: anywhere;
    }

    .m-progress-list__body {
        min-width: 0;
        padding: 8px;
    }

    .m-progress-achievement-card {
        grid-template-columns: 44px minmax(0, 1fr);
        align-items: start;
        gap: 10px;
        padding: 10px;
    }

    .u-progress-achievement-icon {
        width: 44px;
        height: 44px;
        box-sizing: border-box;
    }

    .m-progress-achievement-card__content {
        display: contents;
    }

    .m-progress-achievement-card__title {
        grid-column: 2;
        align-items: stretch;
        flex-direction: column;
        gap: 6px;

        a {
            line-height: 1.5;
            overflow-wrap: anywhere;
        }
    }

    .u-progress-status {
        width: fit-content;
        max-width: 100%;
        box-sizing: border-box;
        overflow-wrap: anywhere;
    }

    .u-progress-description {
        grid-column: 1 / -1;
        margin: 0;
        line-height: 1.7;
    }

    .m-progress-achievement-card__meta {
        grid-column: 1 / -1;
        gap: 8px;
        font-size: 12px;

        > span {
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
            overflow-wrap: anywhere;
        }

        svg {
            flex: none;
        }
    }

    .u-progress-map {
        flex-basis: 100%;
    }

    .m-progress-achievement-dimensions {
        display: grid;
        width: 100%;
        min-width: 0;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        padding: 10px 0;
        border-top: 1px solid rgba(70, 74, 66, 0.09);

        .u-progress-dimension {
            min-width: 0;
            align-items: flex-start;
            flex-direction: column;
            gap: 4px;
        }

        .u-progress-dimension-label,
        .u-progress-rating {
            max-width: 100%;
            overflow-wrap: anywhere;
        }
    }

    .m-progress-achievement-reward {
        width: 100%;
        padding-left: 0;
        border-left: 0;
    }

    .u-progress-reward-trigger {
        width: 36px;
        height: 36px;
        box-sizing: border-box;
    }

    .m-progress-list-state {
        min-height: 240px;
        padding: 16px 8px;
        overflow-wrap: anywhere;

        button {
            min-height: 44px;
        }
    }

    .m-progress-pagination {
        min-width: 0;
        padding: 12px 0;

        :deep(.el-pagination) {
            --el-pagination-button-width: 36px;
            --el-pagination-button-height: 36px;
            max-width: 100%;
            flex-wrap: nowrap;
            justify-content: center;
            gap: 12px;
        }

        .u-achievement-pagination-status {
            min-width: 72px;
            color: #687274;
            font-size: 13px;
            font-variant-numeric: tabular-nums;
            text-align: center;
        }

        :deep(.el-pagination.is-background .btn-prev),
        :deep(.el-pagination.is-background .btn-next) {
            box-sizing: border-box;
            min-width: 36px;
            height: 36px;
            flex: none;
            margin: 0;
            padding: 0;
        }
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
