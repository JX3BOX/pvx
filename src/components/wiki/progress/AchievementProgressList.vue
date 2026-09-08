<script>
import { CircleCheckFilled, CircleCloseFilled, Loading, Location, Medal, Present } from "@element-plus/icons-vue";
import Item from "@jx3box/jx3box-editor/src/Item";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import AchievementDifficultyStars from "@/components/wiki/AchievementDifficultyStars.vue";
import responsivePagination from "@/mixins/responsive-pagination";
import { fetchAchievementWorkbenchRewardItems } from "@/service/achievementWorkbench";
import { formatAchievementWorkbenchValue, getAchievementWorkbenchDimensionValue } from "@/utils/achievementWorkbench";

export default {
    name: "AchievementProgressList",
    mixins: [responsivePagination],
    components: {
        AchievementDifficultyStars,
        CircleCheckFilled,
        CircleCloseFilled,
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
            <h2>
                <span>{{ $t("achievementAppearance.details") }} - </span>{{ resolvedTitle }}
            </h2>
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
                                <span
                                    v-if="record.tier === 'wujia'"
                                    :class="['u-progress-tier', `is-${record.tier}`]"
                                    >{{ getTierLabel(record) }}</span
                                >
                            </div>
                            <slot name="actions" :record="record">
                                <span
                                    class="u-progress-status"
                                    :class="{
                                        'is-completed': record.completed === true,
                                        'is-incomplete': record.completed === false,
                                    }"
                                >
                                    <CircleCheckFilled
                                        v-if="record.completed === true"
                                        aria-hidden="true"
                                    /><CircleCloseFilled v-else-if="record.completed === false" aria-hidden="true" />
                                    {{ getStatusLabel(record) }}
                                </span>
                            </slot>
                        </div>

                        <p v-if="record.shortDescription" class="u-progress-description">
                            {{ record.shortDescription }}
                        </p>

                        <div class="m-progress-achievement-card__meta">
                            <span class="u-progress-points"
                                ><img src="@/assets/img/wiki/figma/points.png" alt="" />{{
                                    formatNumber(record.points)
                                }}</span
                            >
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
                                <span v-for="dimension in dimensions" :key="dimension.key" class="u-progress-dimension">
                                    <span class="u-progress-dimension-label">{{ getDimensionLabel(dimension) }}</span>
                                    <AchievementDifficultyStars
                                        appearance="diamond"
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
    position: relative;
    display: flex;
    min-width: 0;
    flex-direction: column;
    padding: 12px;
    border-radius: 16px;
    background: #f8f7f3;
}
.m-progress-list__header {
    order: -1;
    display: flex;
    align-items: center;
    min-height: 28px;
    gap: 12px;
    padding-right: 152px;
    margin-bottom: 12px;
    h2 {
        display: block;
        position: relative;
        margin: 0;
        padding-left: 14px;
        color: #6e572c;
        font-size: 16px;
        font-weight: 400;
        overflow-wrap: anywhere;
    }
    h2::before {
        position: absolute;
        top: 3px;
        left: 0;
        content: "";
        width: 6px;
        height: 18px;
        border-radius: 99px;
        background: #5a7e84;
    }
    h2 span {
        color: #333;
    }
    > span {
        display: none;
    }
}
.m-progress-list__filters {
    margin-bottom: 12px;
}
.m-progress-list__body {
    position: relative;
    min-width: 0;
}
.m-progress-achievement-list {
    display: grid;
    gap: 6px;
}
.m-progress-achievement-card {
    display: grid;
    min-width: 0;
    min-height: 80px;
    grid-template-columns: 36px minmax(0, 1fr);
    grid-template-rows: auto auto 1fr;
    line-height: 1.4;
    align-items: start;
    gap: 2px 8px;
    padding: 8px;
    border-radius: 4px;
    background: #fff;
    &:hover {
        box-shadow: 0 0 0 1px #5a7e8444 inset;
    }
}
.u-progress-achievement-icon {
    grid-row: 1 / 3;
    display: flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 3px;
    color: #967944;
    background: #f8f7f3;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    svg {
        width: 24px;
        height: 24px;
    }
}
.m-progress-achievement-card__content {
    display: contents;
}
.m-progress-achievement-card__title {
    grid-column: 2;
    display: flex;
    min-width: 0;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    > div {
        display: flex;
        min-width: 0;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
    }
    a {
        color: #333;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        overflow-wrap: anywhere;
        &:hover {
            color: #5a7e84;
        }
    }
}
.u-progress-description {
    grid-column: 2;
    margin: 0;
    color: #967944;
    font-size: 13px;
    white-space: pre-line;
    overflow-wrap: anywhere;
}
.u-progress-tier,
.u-progress-status {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 20px;
    padding: 0 6px;
    border-radius: 99px;
    font-size: 13px;
    color: #967944;
    background: #f8f7f3;
}
.u-progress-status {
    &.is-incomplete {
        color: #ad5149;
        background: #f6ece8;
    }
    &.is-completed {
        color: #4e816c;
        background: #e9eee9;
    }
    svg {
        width: 12px;
        height: 12px;
    }
}
.m-progress-achievement-card__meta {
    grid-column: 1 / -1;
    display: flex;
    min-width: 0;
    align-self: end;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin-top: 4px;
    color: #999;
    font-size: 13px;
    span {
        display: inline-flex;
        align-items: center;
        gap: 3px;
    }
    svg {
        width: 12px;
        height: 12px;
    }
}
.u-progress-points {
    color: #967944;
    background: #f8f7f3;
    padding: 0 3px;
    img {
        width: 14px;
        height: 14px;
        object-fit: contain;
    }
}
.m-progress-achievement-dimensions {
    display: contents;
}
.u-progress-achievement-tag {
    min-height: 20px;
    padding: 0 5px;
    border: 1px solid #df69a6;
    border-radius: 3px;
    color: #df69a6;
    background: #fff;
}
.m-progress-achievement-reward {
    margin-left: auto;
    color: #5a7e84;
}
.u-progress-reward-trigger {
    display: inline-flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 3px;
    color: #5a7e84;
    background: #f8f7f3;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    svg {
        width: 14px;
        height: 14px;
    }
    &.is-loading svg {
        animation: progress-reward-spin 900ms linear infinite;
    }
}
@keyframes progress-reward-spin {
    to {
        transform: rotate(360deg);
    }
}
.m-progress-list-state {
    display: flex;
    min-height: 380px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
    color: #999;
    text-align: center;
    > svg {
        width: 38px;
        height: 38px;
        color: #5a7e84;
    }
    strong {
        font-size: 16px;
        color: #333;
    }
    p {
        margin: 0;
        font-size: 14px;
    }
    button {
        padding: 8px 24px;
        border: 0;
        border-radius: 99px;
        background: #5a7e84;
        color: #fff;
        cursor: pointer;
        font: inherit;
    }
}
.m-progress-pagination {
    display: flex;
    justify-content: center;
    padding-top: 16px;
}
@media (max-width: @phone) {
    .m-progress-list {
        padding: 10px;
    }
    .m-progress-list__header {
        padding-right: 0;
    }
    .m-progress-achievement-card {
        min-height: 92px;
    }
    .m-progress-achievement-card__meta {
        gap: 6px 8px;
    }
    .m-progress-achievement-reward {
        margin-left: 0;
    }
    .u-progress-status {
        max-width: 90px;
        white-space: normal;
    }
    .m-progress-list-state {
        min-height: 240px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .u-progress-reward-trigger.is-loading svg {
        animation: none;
    }
}
</style>
