<!-- 试衣间商品悬停图谱浮卡：右侧浮层展示当前外观的配套发型与同款配色，支持一键换穿或新窗查看详情。 -->
<template>
    <Teleport :to="teleportTarget">
        <div
            v-if="visible && !loading && hasAnyGroup"
            ref="popoverRef"
            class="m-studio-hover-popover"
            :style="popoverStyle"
            role="dialog"
            :aria-label="$t('exteriorStudio.related')"
            @mouseenter="$emit('mouse-enter')"
            @mouseleave="$emit('mouse-leave')"
        >
            <div class="m-popover-head">
                <div class="m-popover-title">
                    <span class="u-name" :title="item.name || item.key">{{ item.name || item.key }}</span>
                    <span v-if="domainLabel" class="u-tag">{{ domainLabel }}</span>
                </div>
                <router-link
                    :to="{ name: 'exterior-list', query: { id: item.key } }"
                    target="_blank"
                    class="u-detail-link"
                >
                    <span>{{ $t('exteriorStudio.details') }}</span>
                    <el-icon><TopRight /></el-icon>
                </router-link>
            </div>

            <div v-if="loading" class="m-popover-status">{{ $t('exteriorStudio.loadingRelated') }}</div>

            <template v-else-if="hasAnyGroup">
                <div v-if="pairedHairs.length" class="m-popover-group">
                    <div class="m-group-label">{{ $t('exteriorStudio.matchingHair') }}</div>
                    <div class="m-chip-grid">
                        <button
                            v-for="node in pairedHairs"
                            :key="node.key"
                            type="button"
                            class="u-rel-chip"
                            :class="{ 'is-worn': wornKeys.has(node.key), 'is-busy': busyKey === node.key }"
                            :title="wornKeys.has(node.key) ? $t('exteriorStudio.clickRemove') : $t('exteriorStudio.clickWear', { name: node.name })"
                            @click="onPickNode(node)"
                        >
                            <img v-if="nodeThumb(node)" :src="nodeThumb(node)" :alt="node.name" class="u-chip-thumb" />
                            <span v-else class="u-chip-dot" />
                            <span class="u-chip-name">{{ node.name }}</span>
                            <span v-if="wornKeys.has(node.key)" class="u-chip-state">{{ $t('exteriorStudio.worn') }}</span>
                        </button>
                    </div>
                </div>

                <div v-if="colorVariants.length" class="m-popover-group">
                    <div class="m-group-label">{{ $t('exteriorStudio.colors') }}</div>
                    <div class="m-chip-grid">
                        <button
                            v-for="node in colorVariants"
                            :key="node.key"
                            type="button"
                            class="u-rel-chip"
                            :class="{ 'is-worn': wornKeys.has(node.key), 'is-busy': busyKey === node.key }"
                            :title="wornKeys.has(node.key) ? $t('exteriorStudio.isWorn') : $t('exteriorStudio.switchNamed', { name: node.name })"
                            @click="onPickNode(node)"
                        >
                            <img v-if="nodeThumb(node)" :src="nodeThumb(node)" :alt="node.name" class="u-chip-thumb" />
                            <span v-else class="u-chip-dot" />
                            <span class="u-chip-name">{{ node.name }}</span>
                            <span v-if="wornKeys.has(node.key)" class="u-chip-state">{{ $t('exteriorStudio.worn') }}</span>
                        </button>
                    </div>
                </div>
            </template>

            <div v-else class="m-popover-status">{{ $t('exteriorStudio.noRelated') }}</div>
        </div>
    </Teleport>
</template>

<script>
import { TopRight } from "@element-plus/icons-vue";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import { localizedExteriorLabel, DOMAIN_META, SLOT_LABELS, pickExteriorCover } from "@/components/exterior/meta";
import { getExteriorGraphCached } from "@/service/exterior";

const SUPPORTED_DOMAINS = new Set(["outfit", "hair", "part", "pendant", "weapon"]);
const POPOVER_WIDTH = 292;
const POPOVER_GAP = 10;

function buildGraphIndex(graph) {
    const rawNodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
    const visibleNodes = rawNodes.filter((n) => n && n.visible !== false);
    const nodeMap = new Map(visibleNodes.map((n) => [n.key, n]));
    const parents = new Map();
    const children = new Map();

    for (const edge of graph?.edges || []) {
        if (!nodeMap.has(edge.from_key) || !nodeMap.has(edge.to_key)) continue;
        if (!children.has(edge.from_key)) children.set(edge.from_key, []);
        children.get(edge.from_key).push({ key: edge.to_key, kind: edge.kind });
        if (!parents.has(edge.to_key)) parents.set(edge.to_key, []);
        parents.get(edge.to_key).push({ key: edge.from_key, kind: edge.kind });
    }
    return { nodeMap, parents, children };
}

export function extractStudioGraphRelations(graph, currentKey) {
    if (!graph || !currentKey) return { pairedHairs: [], colorVariants: [] };
    const { nodeMap, parents, children } = buildGraphIndex(graph);
    const current = nodeMap.get(currentKey) || (graph.nodes || []).find((n) => n?.key === currentKey);
    if (!current) return { pairedHairs: [], colorVariants: [] };

    const hairMap = new Map();
    const addHair = (node) => {
        if (node && node.domain === "hair" && node.key !== currentKey && !hairMap.has(node.key)) {
            hairMap.set(node.key, node);
        }
    };

    // 1) 配套发型：仅针对成衣或散件，通过直连或共享礼盒/套装节点查找同款发型。
    if (["outfit", "part"].includes(current.domain)) {
        const directOwners = new Set([currentKey]);
        for (const e of parents.get(currentKey) || []) {
            const p = nodeMap.get(e.key);
            if (!p) continue;
            if (p.domain === "bundle") directOwners.add(p.key);
            if (current.domain === "part" && p.domain === "outfit") {
                directOwners.add(p.key);
                for (const gp of parents.get(p.key) || []) {
                    if (nodeMap.get(gp.key)?.domain === "bundle") directOwners.add(gp.key);
                }
            }
        }
        for (const e of children.get(currentKey) || []) {
            const c = nodeMap.get(e.key);
            addHair(c);
            if (current.domain === "outfit" && c?.domain === "part") {
                for (const gp of parents.get(c.key) || []) {
                    if (nodeMap.get(gp.key)?.domain === "bundle") directOwners.add(gp.key);
                }
            }
        }
        for (const ownerKey of directOwners) {
            for (const e of children.get(ownerKey) || []) {
                const child = nodeMap.get(e.key);
                addHair(child);
                if (child?.domain === "bundle") {
                    for (const gc of children.get(child.key) || []) addHair(nodeMap.get(gc.key));
                }
            }
            for (const e of [...(parents.get(ownerKey) || []), ...(children.get(ownerKey) || [])]) {
                const peer = nodeMap.get(e.key);
                if (e.kind === "wrapped_outfit" && peer) {
                    addHair(peer);
                    for (const gp of parents.get(peer.key) || []) {
                        if (nodeMap.get(gp.key)?.domain === "bundle") {
                            for (const gc of children.get(gp.key) || []) addHair(nodeMap.get(gc.key));
                        }
                    }
                    for (const gc of children.get(peer.key) || []) addHair(nodeMap.get(gc.key));
                }
            }
        }
    }

    // 2) 同款配色：共享同一系列（family）或共享变体关系，保持同 domain（散件保持同 slot）。
    const variantMap = new Map();
    const matchesSameType = (node) => {
        if (!node || node.key === currentKey) return false;
        if (node.domain !== current.domain) return false;
        if (current.domain === "part" && current.slot && node.slot !== current.slot) return false;
        return true;
    };

    const familyRoots = new Set();
    const visitedUp = new Set([currentKey]);
    const queue = [{ key: currentKey, depth: 0 }];
    while (queue.length) {
        const { key, depth } = queue.shift();
        if (depth >= 3) continue;
        for (const e of parents.get(key) || []) {
            const p = nodeMap.get(e.key);
            if (!p) continue;
            if (p.domain === "family") {
                familyRoots.add(p.key);
            } else if (!visitedUp.has(p.key) && ["bundle", "outfit"].includes(p.domain)) {
                visitedUp.add(p.key);
                queue.push({ key: p.key, depth: depth + 1 });
            }
        }
        for (const e of children.get(key) || []) {
            const c = nodeMap.get(e.key);
            if (e.kind === "variant" && matchesSameType(c)) variantMap.set(c.key, c);
        }
    }

    // 从 family 向下最多 3 层采集同款配色；同时检查共享直属礼盒下的同槽位切换款（如黑白金发）。
    for (const rootKey of familyRoots) {
        const seen = new Set([rootKey]);
        const down = [{ key: rootKey, depth: 0 }];
        while (down.length) {
            const { key, depth } = down.shift();
            if (depth >= 3) continue;
            for (const e of children.get(key) || []) {
                const c = nodeMap.get(e.key);
                if (!c) continue;
                if (matchesSameType(c)) variantMap.set(c.key, c);
                if (!seen.has(c.key)) {
                    seen.add(c.key);
                    down.push({ key: c.key, depth: depth + 1 });
                }
            }
        }
    }

    if (current.domain === "hair") {
        for (const e of parents.get(currentKey) || []) {
            const p = nodeMap.get(e.key);
            if (p?.domain === "bundle") {
                for (const c of children.get(p.key) || []) {
                    const sibling = nodeMap.get(c.key);
                    if (matchesSameType(sibling)) variantMap.set(sibling.key, sibling);
                }
            }
        }
    }

    const sortHairs = (a, b) => {
        const score = (n) => (String(n.name || "").includes("黑") ? 0 : 1);
        return score(a) - score(b) || a.key.localeCompare(b.key, "en");
    };

    return {
        pairedHairs: [...hairMap.values()].sort(sortHairs).slice(0, 6),
        colorVariants: [...variantMap.values()].slice(0, 10),
    };
}

export default {
    name: "StudioItemHoverPopover",
    components: { TopRight },
    props: {
        item: { type: Object, default: null },
        anchorRect: { type: Object, default: null },
        role: { type: Number, required: true },
        wornKeys: { type: Object, required: true },
        busyKey: { type: String, default: "" },
        teleportTarget: { type: [String, Object], default: "body" },
    },
    emits: ["wear-item", "mouse-enter", "mouse-leave"],
    data() {
        return {
            graph: null,
            loading: false,
            popoverHeight: 220,
        };
    },
    computed: {
        visible() {
            return Boolean(
                this.item?.key &&
                    this.anchorRect &&
                    SUPPORTED_DOMAINS.has(this.item.domain || String(this.item.key).split("_")[0])
            );
        },
        domainLabel() {
            if (!this.item) return "";
            if (this.item.slot && SLOT_LABELS[this.item.slot]) return localizedExteriorLabel(this.$t, SLOT_LABELS[this.item.slot]);
            return localizedExteriorLabel(this.$t, DOMAIN_META[this.item.domain]?.label || "");
        },
        relations() {
            if (!this.item?.key || !this.graph) return { pairedHairs: [], colorVariants: [] };
            return extractStudioGraphRelations(this.graph, this.item.key);
        },
        pairedHairs() {
            return this.relations.pairedHairs;
        },
        colorVariants() {
            return this.relations.colorVariants;
        },
        hasAnyGroup() {
            return this.pairedHairs.length > 0 || this.colorVariants.length > 0;
        },
        popoverStyle() {
            if (!this.anchorRect || typeof window === "undefined") return {};
            const vw = window.innerWidth || 1280;
            const vh = window.innerHeight || 800;
            let left = Math.round(this.anchorRect.right + POPOVER_GAP);
            if (left + POPOVER_WIDTH > vw - 12) {
                left = Math.max(12, Math.round(this.anchorRect.left - POPOVER_WIDTH - POPOVER_GAP));
            }
            const maxTop = Math.max(12, vh - this.popoverHeight - 12);
            const top = Math.min(Math.max(12, Math.round(this.anchorRect.top)), maxTop);
            return {
                left: `${left}px`,
                top: `${top}px`,
                width: `${POPOVER_WIDTH}px`,
            };
        },
    },
    watch: {
        "item.key": {
            immediate: true,
            handler(nextKey) {
                this.loadGraph(nextKey);
            },
        },
    },
    created() {
        this._abortController = null;
        this._reqSeq = 0;
    },
    beforeUnmount() {
        this._abortController?.abort();
    },
    methods: {
        nodeToItem(node) {
            const images = node.images || (node.covers ? { cover: node.covers } : node.cover ? { cover: { all: node.cover } } : null);
            return {
                ...node,
                images,
            };
        },
        nodeThumb(node) {
            const images = node.covers ? { cover: node.covers } : node.cover ? { cover: { all: node.cover } } : null;
            const cover = pickExteriorCover(images, this.role);
            if (cover) return cover;
            if (Number(node?.icon_id) > 0) {
                return iconLink(node.icon_id, this.$store.state.client);
            }
            return "";
        },
        onPickNode(node) {
            this.$emit("wear-item", this.nodeToItem(node));
        },
        async loadGraph(key) {
            this._abortController?.abort();
            this.graph = null;
            if (!key || !SUPPORTED_DOMAINS.has(this.item?.domain || String(key).split("_")[0])) {
                this.loading = false;
                return;
            }
            const seq = ++this._reqSeq;
            const controller = new AbortController();
            this._abortController = controller;
            this.loading = true;
            try {
                const graph = await getExteriorGraphCached(key, controller.signal);
                if (seq !== this._reqSeq) return;
                this.graph = graph || null;
                await this.$nextTick();
                if (this.$refs.popoverRef) {
                    this.popoverHeight = this.$refs.popoverRef.offsetHeight || 220;
                }
            } catch (err) {
                if (err?.name !== "AbortError" && seq === this._reqSeq) {
                    this.graph = null;
                }
            } finally {
                if (seq === this._reqSeq) this.loading = false;
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-studio-hover-popover {
    position: fixed;
    z-index: 2000;
    padding: 12px 13px;
    border: 1px solid #dbeafe;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(12px);
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(99, 102, 241, 0.08);
    display: grid;
    gap: 10px;
}

.m-popover-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid @pvx-border-light;
}

.m-popover-title {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;

    .u-name {
        font-size: 13px;
        font-weight: 700;
        color: @pvx-text-primary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .u-tag {
        flex-shrink: 0;
        padding: 1px 6px;
        border-radius: @pvx-radius-pill;
        background: @pvx-primary-soft;
        color: @pvx-primary-hover;
        font-size: 10px;
        font-weight: 600;
    }
}

.u-detail-link {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    color: @pvx-primary;
    text-decoration: none;

    &:hover {
        color: @pvx-primary-hover;
        text-decoration: underline;
    }
}

.m-popover-status {
    padding: 8px 0;
    text-align: center;
    font-size: 12px;
    color: @pvx-text-secondary;
}

.m-popover-group {
    display: grid;
    gap: 6px;
}

.m-group-label {
    font-size: 11px;
    font-weight: 700;
    color: @pvx-text-secondary;
}

.m-chip-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 156px;
    overflow-y: auto;
}

.u-rel-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    padding: 4px 8px 4px 4px;
    border: 1px solid @pvx-border;
    border-radius: @pvx-radius-pill;
    background: #f8fafc;
    color: @pvx-text-primary;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.14s;

    &:hover {
        border-color: @pvx-primary;
        background: @pvx-primary-soft;
        color: @pvx-primary-hover;
    }

    &.is-worn {
        border-color: #f59e0b;
        background: #fffbeb;
        color: #b45309;
    }

    &.is-busy {
        opacity: 0.65;
        cursor: wait;
    }
}

.u-chip-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    object-fit: cover;
    object-position: top center;
    flex-shrink: 0;
}

.u-chip-dot {
    width: 8px;
    height: 8px;
    margin-left: 4px;
    border-radius: 50%;
    background: #cbd5e1;
    flex-shrink: 0;
}

.u-chip-name {
    max-width: 164px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.u-chip-state {
    font-size: 10px;
    font-weight: 700;
    color: #d97706;
    flex-shrink: 0;
}
</style>
