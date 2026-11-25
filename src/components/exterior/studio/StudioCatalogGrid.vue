<!-- 试衣间中间栏商品格子列表：支持子分类切换、模糊拼音/俗称检索、游标懒加载与一键穿脱状态标记。 -->
<template>
    <div class="m-studio-catalog">
        <div class="m-studio-catalog__head">
            <div class="m-catalog-title-row">
                <h3>{{ $t(menuItem.labelKey) }}</h3>
                <el-tooltip
                    v-if="menuItem.descKey"
                    :content="$t(menuItem.descKey)"
                    :trigger="['hover', 'focus']"
                    :append-to="teleportTarget"
                    placement="top"
                >
                    <button
                        type="button"
                        class="u-catalog-hint"
                        :aria-label="$t(menuItem.descKey)"
                        @click="$event.currentTarget.focus()"
                    >
                        <el-icon aria-hidden="true"><InfoFilled /></el-icon>
                    </button>
                </el-tooltip>
            </div>

            <el-input
                v-model="keywordInput"
                class="u-catalog-search"
                clearable
                size="default"
                :placeholder="$t('exteriorStudio.searchItems', { category: $t(menuItem.labelKey) })"
                @input="onKeywordInput"
                @clear="reload"
                @keyup.enter="reload"
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>

            <div
                v-if="menuItem.subs?.length"
                ref="subPillsRef"
                class="m-sub-pills"
                role="group"
                :aria-label="$t('exteriorStudio.subcategories')"
                @wheel="scrollHorizontally"
            >
                <button
                    v-for="sub in menuItem.subs"
                    :key="sub.id"
                    type="button"
                    class="u-sub-pill"
                    :class="{ 'is-active': activeSubId === sub.id }"
                    :aria-pressed="activeSubId === sub.id"
                    @click="selectSub(sub.id)"
                >
                    {{ sub.labelKey ? $t(sub.labelKey) : localizedExteriorLabel($t, sub.label) }}
                </button>
            </div>
        </div>

        <div ref="scrollBoxRef" class="m-studio-catalog__scroll" @scroll.passive="onScroll">
            <div v-if="errorMessage && !items.length" class="m-catalog-empty">
                <p>{{ errorMessage }}</p>
                <el-button size="small" type="primary" round @click="reload">{{ $t('exterior.retry') }}</el-button>
            </div>

            <div v-else-if="!loading && !items.length" class="m-catalog-empty">
                <p>{{ emptyText }}</p>
                <el-button v-if="keywordInput" size="small" round @click="resetSearch">{{ $t('exteriorStudio.clearKeyword') }}</el-button>
            </div>

            <div v-else class="m-catalog-grid">
                <button
                    v-for="item in items"
                    :key="item.key"
                    type="button"
                    class="u-studio-card"
                    :class="{
                        'is-worn': wornKeys.has(item.key),
                        'is-busy': busyKey === item.key,
                    }"
                    @click="$emit('select', item)"
                    @mouseenter="onCardEnter(item, $event)"
                    @mouseleave="onCardLeave"
                >
                    <div class="u-card-media">
                        <img
                            v-if="cardThumb(item)"
                            :src="cardThumb(item)"
                            :alt="item.name"
                            loading="lazy"
                            class="u-card-img"
                        />
                        <div v-else-if="item.domain === 'expression'" class="u-card-expr">
                            <span class="u-expr-badge">{{ $t('exteriorStudio.expression') }}</span>
                            <strong class="u-expr-label">{{ itemLabel(item) }}</strong>
                        </div>
                        <div v-else class="u-card-placeholder">{{ $t('exteriorStudio.noImage') }}</div>

                        <span v-if="wornKeys.has(item.key)" class="u-worn-badge">
                            <el-icon><Check /></el-icon>
                            {{ item.domain === "expression" ? $t('exteriorStudio.inUse') : $t('exteriorStudio.wearing') }}
                        </span>
                        <span v-else-if="item.domain && item.domain !== 'expression'" class="u-type-badge">
                            {{ domainLabel(item.domain, item.slot) }}
                        </span>

                        <span v-if="!wornKeys.has(item.key) && cachedKeys.has(item.key)" class="u-cached-badge">
                            {{ $t('exteriorStudio.cached') }}
                        </span>

                        <div v-if="busyKey === item.key" class="u-card-loading">
                            {{ busyPercent > 0 ? $t('exteriorStudio.equippingPct', { percent: busyPercent }) : $t('exteriorStudio.equipping') }}
                        </div>
                    </div>
                    <div class="u-card-name" :title="itemLabel(item)">
                        {{ itemLabel(item) }}
                    </div>
                </button>
            </div>

            <div v-if="loading" class="m-catalog-more">{{ $t('exteriorStudio.loadingItems') }}</div>
            <div v-else-if="nextCursor !== null" class="m-catalog-more">
                <el-button size="small" round @click="loadNextPage">{{ $t('exteriorStudio.moreItems') }}</el-button>
            </div>
            <div v-else-if="items.length" class="m-catalog-more is-end">{{ $t('exteriorStudio.allShown', { count: items.length }) }}</div>
        </div>

        <StudioItemHoverPopover
            :item="hoveredItem"
            :anchor-rect="hoverRect"
            :role="role"
            :worn-keys="wornKeys"
            :busy-key="busyKey"
            :teleport-target="teleportTarget"
            @wear-item="$emit('wear-related', $event)"
            @mouse-enter="onPopoverEnter"
            @mouse-leave="onPopoverLeave"
        />
    </div>
</template>

<script>
import { expressionLabel } from "./studio-labels";
import { Check, InfoFilled, Search } from "@element-plus/icons-vue";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { localizedExteriorLabel, DOMAIN_META, SLOT_LABELS, pickExteriorCover } from "@/components/exterior/meta";
import {
    getExteriorStars,
    getExteriorsList,
    getFaceExpressionUrl,
    getFaceExpressionsManifest,
} from "@/service/exterior";
import StudioItemHoverPopover from "@/components/exterior/studio/StudioItemHoverPopover.vue";
import { scrollHorizontally } from "@/utils/horizontal-wheel";

const PAGE_LIMIT = 30;
const SKIPPED_FAVORITE_DOMAINS = new Set(["family", "face", "realistic_face", "body"]);

export default {
    name: "StudioCatalogGrid",
    components: { Check, InfoFilled, Search, StudioItemHoverPopover },
    props: {
        menuItem: { type: Object, required: true },
        role: { type: Number, required: true },
        wornKeys: { type: Object, required: true },
        cachedKeys: { type: Object, required: true },
        historyItems: { type: Array, default: () => [] },
        busyKey: { type: String, default: "" },
        busyPercent: { type: Number, default: 0 },
        teleportTarget: { type: [String, Object], default: "body" },
    },
    emits: ["select", "wear-related"],
    data() {
        return {
            activeSubId: this.menuItem.defaultSub || "",
            keywordInput: "",
            searchTimer: null,
            items: [],
            nextCursor: null,
            loading: false,
            errorMessage: "",
            requestSeq: 0,
            abortController: null,
            hoveredItem: null,
            hoverRect: null,
        };
    },
    computed: {
        activeQuery() {
            const sub = this.menuItem.subs?.find((s) => s.id === this.activeSubId) || this.menuItem;
            return {
                domain: sub.domain,
                slot: sub.slot || undefined,
                category: sub.category || undefined,
                school: sub.school || undefined,
                exclude_full_outfit: sub.exclude_full_outfit || undefined,
                role: this.role,
                has_model: 1,
                keyword: this.keywordInput.trim() || undefined,
                limit: PAGE_LIMIT,
                include_total: false,
                sort: "desc",
            };
        },
        emptyText() {
            if (this.menuItem.source === "favorites") {
                return User.isLogin()
                    ? this.$t('exteriorStudio.noFavorites')
                    : this.$t('exteriorStudio.signInFavorites');
            }
            if (this.menuItem.source === "history") {
                return this.$t('exteriorStudio.noHistory');
            }
            return this.$t('exteriorStudio.noModels');
        },
    },
    watch: {
        menuItem(nextItem) {
            this.clearHoverPopover();
            clearTimeout(this.searchTimer);
            this.keywordInput = "";
            this.activeSubId = nextItem.defaultSub || "";
            if (this.$refs.subPillsRef) this.$refs.subPillsRef.scrollLeft = 0;
            this.reload();
        },
        role() {
            this.clearHoverPopover();
            this.reload();
        },
        historyItems() {
            if (this.menuItem.source === "history") {
                this.reload();
            }
        },
    },
    created() {
        this._hoverOpenTimer = null;
        this._hoverCloseTimer = null;
        this.reload();
    },
    beforeUnmount() {
        clearTimeout(this.searchTimer);
        this.clearHoverPopover();
        this.abortController?.abort();
    },
    methods: {
        scrollHorizontally,
        localizedExteriorLabel,
        itemLabel(item) {
            return item.domain === "expression"
                ? expressionLabel(this.$t, item.exprKey, item.name)
                : item.name || item.key;
        },
        clearHoverPopover() {
            clearTimeout(this._hoverOpenTimer);
            clearTimeout(this._hoverCloseTimer);
            this._hoverOpenTimer = null;
            this._hoverCloseTimer = null;
            this.hoveredItem = null;
            this.hoverRect = null;
        },
        onCardEnter(item, event) {
            clearTimeout(this._hoverOpenTimer);
            clearTimeout(this._hoverCloseTimer);
            if (!item || item.domain === "expression") return;
            const target = event?.currentTarget;
            if (!target) return;
            this._hoverOpenTimer = setTimeout(() => {
                if (!target.isConnected) return;
                const rect = target.getBoundingClientRect();
                this.hoveredItem = item;
                this.hoverRect = {
                    top: rect.top,
                    left: rect.left,
                    right: rect.right,
                    bottom: rect.bottom,
                    width: rect.width,
                    height: rect.height,
                };
            }, 220);
        },
        onCardLeave() {
            clearTimeout(this._hoverOpenTimer);
            clearTimeout(this._hoverCloseTimer);
            this._hoverCloseTimer = setTimeout(() => {
                this.hoveredItem = null;
                this.hoverRect = null;
            }, 180);
        },
        onPopoverEnter() {
            clearTimeout(this._hoverCloseTimer);
        },
        onPopoverLeave() {
            clearTimeout(this._hoverCloseTimer);
            this._hoverCloseTimer = setTimeout(() => {
                this.hoveredItem = null;
                this.hoverRect = null;
            }, 160);
        },
        domainLabel(domain, slot) {
            if (slot && SLOT_LABELS[slot]) return localizedExteriorLabel(this.$t, SLOT_LABELS[slot]);
            return localizedExteriorLabel(this.$t, DOMAIN_META[domain]?.label || domain);
        },
        cardThumb(item) {
            const cover = pickExteriorCover(item?.images, this.role);
            if (cover) return cover;
            if (Number(item?.icon_id) > 0) {
                return iconLink(item.icon_id, this.$store.state.client);
            }
            return "";
        },
        selectSub(subId) {
            if (this.activeSubId === subId) return;
            this.clearHoverPopover();
            this.activeSubId = subId;
            this.reload();
        },
        onKeywordInput() {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.reload(), 240);
        },
        resetSearch() {
            this.keywordInput = "";
            this.reload();
        },
        reload() {
            this.clearHoverPopover();
            this.items = [];
            this.nextCursor = null;
            if (this.$refs.scrollBoxRef) this.$refs.scrollBoxRef.scrollTop = 0;
            this.fetchPage(0, false);
        },
        loadNextPage() {
            if (this.loading || this.nextCursor === null) return;
            this.fetchPage(this.nextCursor, true);
        },
        onScroll(e) {
            this.clearHoverPopover();
            const el = e.target;
            if (!el || this.loading || this.nextCursor === null) return;
            if (el.scrollHeight - el.scrollTop - el.clientHeight < 180) {
                this.loadNextPage();
            }
        },
        filterLocalItems(rawList) {
            const kw = this.keywordInput.trim().toLowerCase();
            return rawList.filter((ext) => {
                if (!ext?.key) return false;
                const domain = ext.domain || String(ext.key).split("_")[0];
                if (SKIPPED_FAVORITE_DOMAINS.has(domain)) return false;
                if (domain !== "bundle" && ext.has_model === false) return false;
                if (Array.isArray(ext.roles) && ext.roles.length && !ext.roles.includes(this.role)) return false;
                if (!kw) return true;
                const hay = `${ext.name || ""} ${ext.game_name || ""} ${ext.alias || ""} ${ext.pinyin || ""}`.toLowerCase();
                return hay.includes(kw);
            });
        },
        async fetchPage(cursor, append) {
            const seq = ++this.requestSeq;
            this.abortController?.abort();
            const controller = new AbortController();
            this.abortController = controller;
            this.loading = true;
            this.errorMessage = "";
            try {
                if (this.menuItem.source === "history") {
                    this.items = this.filterLocalItems(this.historyItems);
                    this.nextCursor = null;
                    return;
                }
                if (this.menuItem.source === "favorites") {
                    if (!User.isLogin()) {
                        this.items = [];
                        this.nextCursor = null;
                        return;
                    }
                    const rows = await getExteriorStars();
                    if (seq !== this.requestSeq) return;
                    const unwrapped = rows.map((row) => row?.exterior || row).filter(Boolean);
                    this.items = this.filterLocalItems(unwrapped);
                    this.nextCursor = null;
                    return;
                }
                if (this.activeQuery.domain === "expression") {
                    const manifest = await getFaceExpressionsManifest();
                    if (seq !== this.requestSeq) return;
                    const kw = this.keywordInput.trim().toLowerCase();
                    const list = (manifest?.expressions || [])
                        .filter((expr) => Array.isArray(expr.roles) && expr.roles.includes(this.role))
                        .filter((expr) => !kw || [expr.name, expressionLabel(this.$t, expr.key, expr.name)]
                            .some((name) => String(name || expr.key).toLowerCase().includes(kw)))
                        .map((expr) => ({
                            key: `expr:${expr.key}`,
                            exprKey: expr.key,
                            name: expr.name,
                            domain: "expression",
                            roles: expr.roles,
                            url: getFaceExpressionUrl(this.role, expr.key),
                            has_model: true,
                        }));
                    this.items = list;
                    this.nextCursor = null;
                    return;
                }
                const params = { ...this.activeQuery };
                if (cursor) params.cursor = cursor;
                const data = await getExteriorsList(params, controller.signal);
                if (seq !== this.requestSeq) return;
                const rows = Array.isArray(data?.list) ? data.list : [];
                this.items = append ? [...this.items, ...rows] : rows;
                this.nextCursor = data?.nextCursor ?? null;
            } catch (err) {
                if (err?.name === "AbortError" || seq !== this.requestSeq) return;
                this.errorMessage = err?.message || this.$t('exteriorStudio.catalogFailed');
            } finally {
                if (seq === this.requestSeq) this.loading = false;
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-studio-catalog {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

.m-studio-catalog__head {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: @pvx-space-1;
    padding: 12px;
    border-bottom: 1px solid @pvx-border-light;
    flex-shrink: 0;
}

.m-catalog-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    h3 {
        flex-shrink: 0;
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: @pvx-text-primary;
    }

    .u-catalog-hint {
        display: inline-grid;
        flex: 0 0 auto;
        width: 24px;
        height: 24px;
        place-items: center;
        padding: 0;
        border: 0;
        border-radius: @pvx-radius-pill;
        color: @pvx-text-secondary;
        background: transparent;
        font-size: 14px;
        cursor: help;

        &:focus-visible {
            color: @pvx-primary;
        }

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                color: @pvx-primary;
            }
        }
    }
}

.u-catalog-search :deep(.el-input__wrapper) {
    min-height: 36px;
    padding: 0 12px;
    border-radius: 12px;
    background: @pvx-surface-muted;
    box-shadow: 0 0 0 1px @pvx-border-light inset;

    &.is-focus {
        box-shadow: 0 0 0 1px @pvx-border-focus inset;
    }
}

.m-sub-pills {
    display: flex;
    flex-wrap: nowrap;
    gap: @pvx-space-1;
    overflow-x: auto;
    padding: 2px;
    scrollbar-width: thin;
}

.u-sub-pill {
    flex: none;
    padding: 4px 10px;
    border: 1px solid @pvx-border;
    border-radius: @pvx-radius-pill;
    background: #fff;
    color: @pvx-text-secondary;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.14s;

    &:hover {
        border-color: @pvx-border-focus;
        color: @pvx-primary-hover;
    }

    &.is-active {
        border-color: @pvx-primary;
        background: @pvx-primary-soft;
        color: @pvx-primary-hover;
        font-weight: 600;
    }
}

.m-studio-catalog__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 12px 16px;
}

.m-catalog-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;

    @media (min-width: 1920px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 9px;
    }
}

.u-studio-card {
    display: flex;
    flex-direction: column;
    padding: 0;
    border: 1.5px solid @pvx-border;
    border-radius: 12px;
    background: #ffffff;
    overflow: hidden;
    text-align: left;
    cursor: pointer;
    transition: all 0.16s;

    &:hover {
        border-color: #a5b4fc;
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
    }

    &.is-worn {
        border-color: #f59e0b;
        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.18);
    }

    &.is-busy {
        opacity: 0.72;
    }
}

.u-card-media {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    background: linear-gradient(180deg, #f3f6fc 0%, #e7edf8 100%);
    overflow: hidden;
}

.u-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
}

.u-card-placeholder {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    font-size: 12px;
    color: #94a3b8;
}

.u-card-expr {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 100%;
    padding: 10px;
    background: linear-gradient(155deg, #eef2ff 0%, #f8fafc 100%);
    color: @pvx-text-primary;
    text-align: center;

    .u-expr-badge {
        padding: 2px 8px;
        border-radius: @pvx-radius-pill;
        background: rgba(99, 102, 241, 0.12);
        color: #4f46e5;
        font-size: 11px;
        font-weight: 600;
    }

    .u-expr-label {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.3;
    }
}

.u-worn-badge,
.u-type-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 7px;
    border-radius: @pvx-radius-pill;
    font-size: 11px;
    font-weight: 600;
}

.u-worn-badge {
    background: #f59e0b;
    color: #ffffff;
}

.u-type-badge {
    background: rgba(15, 23, 42, 0.72);
    color: #f8fafc;
}

.u-cached-badge {
    position: absolute;
    right: 6px;
    bottom: 6px;
    padding: 2px 6px;
    border-radius: @pvx-radius-pill;
    background: rgba(16, 185, 129, 0.92);
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
}

.u-card-loading {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(15, 23, 42, 0.45);
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
}

.u-card-name {
    padding: 7px 8px;
    font-size: 12px;
    font-weight: 600;
    color: @pvx-text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.m-catalog-empty {
    display: grid;
    place-items: center;
    gap: 10px;
    padding: 40px 12px;
    text-align: center;
    font-size: 13px;
    color: @pvx-text-secondary;
}

.m-catalog-more {
    padding: 14px 0 4px;
    text-align: center;
    font-size: 12px;
    color: @pvx-text-secondary;

    &.is-end {
        color: #94a3b8;
    }
}
</style>
