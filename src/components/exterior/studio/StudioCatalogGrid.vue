<!-- 试衣间中间栏商品格子列表：支持子分类切换、模糊拼音/俗称检索、游标懒加载与一键穿脱状态标记。 -->
<template>
    <div class="m-studio-catalog">
        <div class="m-studio-catalog__head">
            <div class="m-catalog-title-row">
                <h3>{{ menuItem.label }}</h3>
                <span v-if="menuItem.desc" class="u-catalog-desc">{{ menuItem.desc }}</span>
            </div>

            <el-input
                v-model="keywordInput"
                clearable
                size="default"
                :placeholder="`搜索${menuItem.label}名称、俗称或拼音…`"
                @input="onKeywordInput"
                @clear="reload"
                @keyup.enter="reload"
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>

            <div v-if="menuItem.subs?.length" class="m-sub-pills">
                <button
                    v-for="sub in menuItem.subs"
                    :key="sub.id"
                    type="button"
                    class="u-sub-pill"
                    :class="{ 'is-active': activeSubId === sub.id }"
                    @click="selectSub(sub.id)"
                >
                    {{ sub.label }}
                </button>
            </div>
        </div>

        <div ref="scrollBoxRef" class="m-studio-catalog__scroll" @scroll.passive="onScroll">
            <div v-if="errorMessage && !items.length" class="m-catalog-empty">
                <p>{{ errorMessage }}</p>
                <el-button size="small" type="primary" round @click="reload">重试</el-button>
            </div>

            <div v-else-if="!loading && !items.length" class="m-catalog-empty">
                <p>该分类下暂无当前体型可用的 3D 模型外观</p>
                <el-button v-if="keywordInput" size="small" round @click="resetSearch">清空关键词</el-button>
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
                >
                    <div class="u-card-media">
                        <img
                            v-if="cardThumb(item)"
                            :src="cardThumb(item)"
                            :alt="item.name"
                            loading="lazy"
                            class="u-card-img"
                        />
                        <div v-else class="u-card-placeholder">暂无图</div>

                        <span v-if="wornKeys.has(item.key)" class="u-worn-badge">
                            <el-icon><Check /></el-icon>
                            穿戴中
                        </span>
                        <span v-else-if="item.domain" class="u-type-badge">
                            {{ domainLabel(item.domain, item.slot) }}
                        </span>

                        <div v-if="busyKey === item.key" class="u-card-loading">装配中…</div>
                    </div>
                    <div class="u-card-name" :title="item.name || item.key">
                        {{ item.name || item.key }}
                    </div>
                </button>
            </div>

            <div v-if="loading" class="m-catalog-more">正在加载外观…</div>
            <div v-else-if="nextCursor !== null" class="m-catalog-more">
                <el-button size="small" round @click="loadNextPage">加载更多外观</el-button>
            </div>
            <div v-else-if="items.length" class="m-catalog-more is-end">已展示全部 {{ items.length }} 件可用外观</div>
        </div>
    </div>
</template>

<script>
import { Check, Search } from "@element-plus/icons-vue";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import { DOMAIN_META, SLOT_LABELS, pickExteriorCover } from "@/components/exterior/meta";
import { getExteriorsList } from "@/service/exterior";

const PAGE_LIMIT = 30;

export default {
    name: "StudioCatalogGrid",
    components: { Check, Search },
    props: {
        menuItem: { type: Object, required: true },
        role: { type: Number, required: true },
        wornKeys: { type: Object, required: true },
        busyKey: { type: String, default: "" },
    },
    emits: ["select"],
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
        };
    },
    computed: {
        activeQuery() {
            const sub = this.menuItem.subs?.find((s) => s.id === this.activeSubId) || this.menuItem;
            return {
                domain: sub.domain,
                slot: sub.slot || undefined,
                category: sub.category || undefined,
                role: this.role,
                has_model: 1,
                keyword: this.keywordInput.trim() || undefined,
                limit: PAGE_LIMIT,
                include_total: false,
                sort: "desc",
            };
        },
    },
    watch: {
        menuItem(nextItem) {
            this.activeSubId = nextItem.defaultSub || "";
            this.reload();
        },
        role() {
            this.reload();
        },
    },
    created() {
        this.reload();
    },
    beforeUnmount() {
        clearTimeout(this.searchTimer);
        this.abortController?.abort();
    },
    methods: {
        domainLabel(domain, slot) {
            if (slot && SLOT_LABELS[slot]) return SLOT_LABELS[slot];
            return DOMAIN_META[domain]?.label || domain;
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
            const el = e.target;
            if (!el || this.loading || this.nextCursor === null) return;
            if (el.scrollHeight - el.scrollTop - el.clientHeight < 180) {
                this.loadNextPage();
            }
        },
        async fetchPage(cursor, append) {
            const seq = ++this.requestSeq;
            this.abortController?.abort();
            const controller = new AbortController();
            this.abortController = controller;
            this.loading = true;
            this.errorMessage = "";
            try {
                const params = { ...this.activeQuery };
                if (cursor) params.cursor = cursor;
                const data = await getExteriorsList(params, controller.signal);
                if (seq !== this.requestSeq) return;
                const rows = Array.isArray(data?.list) ? data.list : [];
                this.items = append ? [...this.items, ...rows] : rows;
                this.nextCursor = data?.nextCursor ?? null;
            } catch (err) {
                if (err?.name === "AbortError" || seq !== this.requestSeq) return;
                this.errorMessage = err?.message || "外观列表加载失败";
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
    gap: 10px;
    padding: 14px 14px 12px;
    border-bottom: 1px solid @pvx-border-light;
    flex-shrink: 0;
}

.m-catalog-title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: @pvx-text-primary;
    }

    .u-catalog-desc {
        font-size: 11px;
        color: @pvx-text-secondary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.m-sub-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.u-sub-pill {
    padding: 4px 10px;
    border: 1px solid @pvx-border;
    border-radius: @pvx-radius-pill;
    background: #fff;
    color: @pvx-text-secondary;
    font-size: 12px;
    font-weight: 500;
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
    padding: 12px 14px 18px;
}

.m-catalog-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
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
    background: rgba(15, 23, 42, 0.56);
    color: #f8fafc;
    backdrop-filter: blur(4px);
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
