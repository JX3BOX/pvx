<!-- 同系列与关联外观展示：默认提供玩家易懂的分组外观卡片，支持一键切换为交互式关系图谱并点击跳转。 -->
<template>
    <PvxSurface
        v-if="hasContent || loading"
        v-loading="loading"
        tag="section"
        padding="medium"
        class="m-ext-related-panel"
    >
        <PvxSectionHeader
            :title="$t('exterior.relatedTitle')"
            :description="$t('exterior.relatedDesc') + (relatedCount ? $t('exteriorPreview.itemCount', { count: relatedCount }) : '')"
        >
            <template #icon><Connection /></template>
            <template v-if="nodes.length > 1" #action>
                <div class="m-view-switch" role="group" :aria-label="$t('exteriorPreview.viewSwitch')">
                    <button
                        type="button"
                        class="u-switch-btn"
                        :class="{ 'is-active': mode === 'cards' }"
                        @click="mode = 'cards'"
                    >
                        {{ $t("exterior.relatedCardsView") }}
                    </button>
                    <button
                        type="button"
                        class="u-switch-btn"
                        :class="{ 'is-active': mode === 'graph' }"
                        @click="mode = 'graph'"
                    >
                        {{ $t("exterior.relatedGraphView") }}
                    </button>
                </div>
            </template>
        </PvxSectionHeader>

        <div v-if="mode === 'cards'" class="m-ext-related__groups">
            <div v-for="group in primaryGroups" :key="group.domain" class="m-rel-group">
                <div class="u-rel-group-head">
                    <span class="u-dot" :style="{ backgroundColor: group.color }" />
                    <h3>{{ group.label }}</h3>
                    <span class="u-group-count">{{ group.items.length }}</span>
                </div>

                <div class="m-rel-cards">
                    <router-link
                        v-for="node in group.items"
                        :key="node.key"
                        :to="{ name: 'exterior-list', query: { id: node.key, view: $route.query.view } }"
                        class="u-rel-card"
                        :class="{ 'is-current': node.key === exteriorKey }"
                    >
                        <div class="u-rel-thumb">
                            <img
                                v-if="nodeThumb(node)"
                                :src="nodeThumb(node)"
                                :alt="node.name"
                                loading="lazy"
                                class="u-rel-img"
                            />
                            <span v-else class="u-rel-empty" :style="{ color: group.color }">
                                {{ group.label }}
                            </span>
                        </div>
                        <div class="u-rel-info">
                            <span class="u-rel-name">{{ node.name || node.game_name || node.key }}</span>
                            <span class="u-rel-meta">
                                <span v-if="node.key === exteriorKey" class="u-current-pill">{{ $t('exteriorPreview.current') }}</span>
                                <span v-else-if="node.slot && slotLabels[node.slot]">{{ localizedExteriorLabel($t, slotLabels[node.slot]) }}</span>
                                <span v-else>{{ group.label }}</span>
                            </span>
                        </div>
                    </router-link>
                </div>
            </div>

            <div v-if="partItems.length" class="m-rel-parts-wrap">
                <button type="button" class="u-parts-toggle" @click="showParts = !showParts">
                    <span>{{ $t('exteriorPreview.setParts', { count: partItems.length }) }}</span>
                    <span class="u-toggle-action">{{ showParts ? $t('exteriorPreview.collapse') : $t('exteriorPreview.expand') }}</span>
                </button>
                <div v-if="showParts" class="m-rel-cards m-rel-cards--compact">
                    <router-link
                        v-for="node in partItems"
                        :key="node.key"
                        :to="{ name: 'exterior-list', query: { id: node.key, view: $route.query.view } }"
                        class="u-rel-card"
                        :class="{ 'is-current': node.key === exteriorKey }"
                    >
                        <div class="u-rel-thumb">
                            <img
                                v-if="nodeThumb(node)"
                                :src="nodeThumb(node)"
                                :alt="node.name"
                                loading="lazy"
                                class="u-rel-img"
                            />
                            <span v-else class="u-rel-empty">{{ $t('exterior.domains.part') }}</span>
                        </div>
                        <div class="u-rel-info">
                            <span class="u-rel-name">{{ node.name || node.game_name || node.key }}</span>
                            <span class="u-rel-meta">
                                <span v-if="node.key === exteriorKey" class="u-current-pill">{{ $t('exteriorPreview.current') }}</span>
                                <span v-else>{{ slotLabels[node.slot] ? localizedExteriorLabel($t, slotLabels[node.slot]) : $t('exterior.domains.part') }}</span>
                            </span>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>

        <div v-else class="m-ext-graph-box">
            <div class="m-graph-canvas-wrap">
                <div ref="canvas" class="m-graph-canvas" />
                <div class="m-domain-legend">
                    <button
                        v-for="item in domainLegend"
                        :key="item.domain"
                        type="button"
                        class="u-legend-chip"
                        :class="{ 'is-off': item.hidden }"
                        @click="toggleDomain(item.domain)"
                    >
                        <i class="u-dot" :style="{ backgroundColor: item.color }" />
                        <span>{{ item.label }}</span>
                        <span class="u-count">{{ item.count }}</span>
                    </button>
                    <button
                        v-if="hiddenDomains.length"
                        type="button"
                        class="u-legend-reset"
                        @click="hiddenDomains = []"
                    >
                        {{ $t('exteriorPreview.showAll') }}
                    </button>
                </div>
                <div class="m-graph-tools">
                    <button
                        type="button"
                        class="u-tool-btn"
                        :class="{ 'is-active': layoutMode === 'layered' }"
                        @click="layoutMode = 'layered'"
                    >
                        {{ $t('exteriorPreview.layered') }}
                    </button>
                    <button
                        type="button"
                        class="u-tool-btn"
                        :class="{ 'is-active': layoutMode === 'force' }"
                        @click="layoutMode = 'force'"
                    >
                        {{ $t('exteriorPreview.force') }}
                    </button>
                    <button type="button" class="u-tool-btn" @click="renderChart">{{ $t('exteriorPreview.reset') }}</button>
                </div>
                <div class="m-edge-legend">
                    <span v-for="item in usedEdgeKinds" :key="item.kind" class="u-edge-item">
                        <i class="u-edge-line" :style="{ backgroundColor: item.color }" />
                        <span>{{ item.label }}</span>
                    </span>
                </div>
            </div>
        </div>
    </PvxSurface>
</template>

<script>
import * as echarts from "echarts/core";
import { GraphChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import { Connection } from "@element-plus/icons-vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { getExteriorGraph } from "@/service/exterior";
import {
    localizedExteriorLabel,
    DOMAIN_META,
    EDGE_COLORS,
    RELATION_LABELS,
    SLOT_LABELS,
    pickExteriorCover,
    resolveExteriorAssetUrl,
} from "./meta";

echarts.use([GraphChart, TooltipComponent, CanvasRenderer]);

function escapeHtml(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function truncate(text, max = 9) {
    const str = String(text);
    return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

export default {
    name: "ExteriorRelatedGraph",
    components: { Connection, PvxSectionHeader, PvxSurface },
    props: {
        exteriorKey: { type: String, required: true },
        fallbackRelations: { type: Array, default: () => [] },
        currentItem: { type: Object, default: null },
    },
    emits: ["graph-loaded"],
    data() {
        return {
            slotLabels: SLOT_LABELS,
            mode: "cards",
            layoutMode: "layered",
            showParts: false,
            hiddenDomains: [],
            loading: false,
            graphData: null,
            controller: null,
            chart: null,
            resizeObserver: null,
        };
    },
    computed: {
        relatedCount() {
            return this.mode === "cards" && this.visibleCardCount ? this.visibleCardCount : this.nodes.length;
        },
        client() {
            return this.$store.state.client;
        },
        preferredRole() {
            return this.$store.state.preferredRole || 2;
        },
        nodes() {
            if (this.graphData?.synced && this.graphData.nodes?.length) {
                return this.graphData.nodes.filter((node) => node.visible !== false || node.key === this.exteriorKey);
            }
            // 图谱表尚未同步时，优雅回退到详情里的直接外观关系，保证玩家端始终可见可跳。
            return this.fallbackNodes;
        },
        edges() {
            if (this.graphData?.synced && this.graphData.nodes?.length) {
                const valid = new Set(this.nodes.map((node) => node.key));
                return (this.graphData.edges || []).filter(
                    (edge) => valid.has(edge.from_key) && valid.has(edge.to_key)
                );
            }
            return this.fallbackEdges;
        },
        fallbackNodes() {
            const map = new Map();
            const rels = this.fallbackRelations || [];
            for (const rel of rels) {
                if (!["variant", "contains", "match_hair", "wrapped_outfit", "package_link"].includes(rel.kind)) {
                    continue;
                }
                for (const side of ["from", "to"]) {
                    const ep = rel[side];
                    const key = rel[`${side}_key`];
                    if (!ep || ep.type !== "exterior" || !key || map.has(key)) continue;
                    const domain = key.split("_")[0];
                    map.set(key, {
                        key,
                        domain,
                        slot: null,
                        name: ep.name || key,
                        game_name: ep.name || key,
                        icon_id: ep.icon_id || 0,
                        visible: true,
                        cover: null,
                    });
                }
            }
            return map.size > 1 ? [...map.values()] : [];
        },
        fallbackEdges() {
            const valid = new Set(this.fallbackNodes.map((n) => n.key));
            return (this.fallbackRelations || [])
                .filter(
                    (rel) =>
                        ["variant", "contains", "match_hair", "wrapped_outfit", "package_link"].includes(rel.kind) &&
                        valid.has(rel.from_key) &&
                        valid.has(rel.to_key)
                )
                .map(({ from_key, to_key, kind }) => ({ from_key, to_key, kind }));
        },
        hasContent() {
            return this.visibleCardCount > 1;
        },
        primaryGroups() {
            const groups = new Map();
            for (const node of this.nodes) {
                if (node.domain === "part" && this.currentItem?.domain !== "part") continue;
                const domain = node.domain || "other";
                if (!groups.has(domain)) {
                    const meta = DOMAIN_META[domain] || { label: domain, color: "#64748b", tier: 9 };
                    groups.set(domain, {
                        domain,
                        label: localizedExteriorLabel(this.$t, meta.label),
                        color: meta.color,
                        tier: meta.tier,
                        items: [],
                    });
                }
                groups.get(domain).items.push(node);
            }
            return [...groups.values()].sort((a, b) => a.tier - b.tier || a.domain.localeCompare(b.domain));
        },
        // 当成衣仅包含唯一 1 件散件时，该散件本质上是该成衣的 1:1 底层件；面向玩家卡片默认隐藏，避免与成衣重复困惑。
        trivialPartKeys() {
            const nodeDomain = new Map(this.nodes.map((node) => [node.key, node.domain]));
            const outfitParts = new Map();
            for (const edge of this.edges) {
                if (edge.kind !== "contains") continue;
                const fromDomain = nodeDomain.get(edge.from_key) || String(edge.from_key).split("_")[0];
                const toDomain = nodeDomain.get(edge.to_key) || String(edge.to_key).split("_")[0];
                if (fromDomain !== "outfit" || toDomain !== "part") continue;
                if (!outfitParts.has(edge.from_key)) outfitParts.set(edge.from_key, new Set());
                outfitParts.get(edge.from_key).add(edge.to_key);
            }
            const trivial = new Set();
            for (const parts of outfitParts.values()) {
                if (parts.size === 1) {
                    const [onlyPart] = parts;
                    if (onlyPart !== this.exteriorKey) trivial.add(onlyPart);
                }
            }
            return trivial;
        },
        visibleCardCount() {
            return this.primaryGroups.reduce((sum, group) => sum + group.items.length, 0) + this.partItems.length;
        },
        partItems() {
            if (this.currentItem?.domain === "part") return [];
            return this.nodes.filter((node) => node.domain === "part" && !this.trivialPartKeys.has(node.key));
        },
        domainLegend() {
            const counts = new Map();
            for (const node of this.nodes) {
                counts.set(node.domain, (counts.get(node.domain) || 0) + 1);
            }
            return [...counts.entries()]
                .map(([domain, count]) => {
                    const meta = DOMAIN_META[domain] || { label: domain, color: "#64748b", tier: 9 };
                    return {
                        domain,
                        label: localizedExteriorLabel(this.$t, meta.label),
                        color: meta.color,
                        tier: meta.tier,
                        count,
                        hidden: this.hiddenDomains.includes(domain),
                    };
                })
                .sort((a, b) => a.tier - b.tier || a.domain.localeCompare(b.domain));
        },
        visibleGraphNodes() {
            const hiddenSet = new Set(this.hiddenDomains);
            return this.nodes.filter((node) => node.key === this.exteriorKey || !hiddenSet.has(node.domain));
        },
        visibleGraphEdges() {
            const valid = new Set(this.visibleGraphNodes.map((node) => node.key));
            return this.edges.filter((edge) => valid.has(edge.from_key) && valid.has(edge.to_key));
        },
        usedEdgeKinds() {
            return [...new Set(this.visibleGraphEdges.map((edge) => edge.kind))].map((kind) => ({
                kind,
                label: localizedExteriorLabel(this.$t, RELATION_LABELS[kind] || kind),
                color: EDGE_COLORS[kind] || "#94a3b8",
            }));
        },
    },
    watch: {
        exteriorKey: {
            immediate: true,
            handler(key) {
                if (key) this.loadGraph(key);
            },
        },
        mode(val) {
            if (val === "graph") {
                this.$nextTick(() => this.renderChart());
            } else {
                this.disposeChart();
            }
        },
        "$i18n.locale"() {
            if (this.mode === "graph") this.$nextTick(() => this.renderChart());
        },
        layoutMode() {
            if (this.mode === "graph") this.$nextTick(() => this.renderChart());
        },
        hiddenDomains: {
            deep: true,
            handler() {
                if (this.mode === "graph") this.$nextTick(() => this.renderChart());
            },
        },
    },
    beforeUnmount() {
        this.controller?.abort();
        this.disposeChart();
    },
    methods: {
        localizedExteriorLabel,
        nodeThumb(node) {
            if (node.covers && typeof node.covers === "object") {
                const picked = pickExteriorCover({ cover: node.covers }, this.preferredRole);
                if (picked) return picked;
            }
            if (node.cover) return resolveExteriorAssetUrl(node.cover);
            if (Number(node.icon_id) > 0) return iconLink(node.icon_id, this.client);
            return "";
        },
        toggleDomain(domain) {
            if (this.hiddenDomains.includes(domain)) {
                this.hiddenDomains = this.hiddenDomains.filter((item) => item !== domain);
            } else {
                this.hiddenDomains = [...this.hiddenDomains, domain];
            }
        },
        async loadGraph(key) {
            this.controller?.abort();
            const controller = (this.controller = new AbortController());
            this.loading = true;
            this.hiddenDomains = [];
            try {
                const data = await getExteriorGraph(key, controller.signal);
                if (!controller.signal.aborted) {
                    this.graphData = data;
                    this.$emit("graph-loaded", { nodes: this.nodes, edges: this.edges });
                    if (this.mode === "graph") this.$nextTick(() => this.renderChart());
                }
            } catch {
                if (!controller.signal.aborted) {
                    this.graphData = null;
                    this.$emit("graph-loaded", { nodes: this.nodes, edges: this.edges });
                }
            } finally {
                if (!controller.signal.aborted) this.loading = false;
            }
        },
        ensureChart() {
            const el = this.$refs.canvas;
            if (!el) return null;
            if (this.chart && this.chart.getDom() === el) return this.chart;
            this.disposeChart();
            this.chart = echarts.init(el);
            this.chart.on("click", (params) => {
                if (params.dataType === "node" && params.data?.id && params.data.id !== this.exteriorKey) {
                    this.$router.push({
                        name: "exterior-list",
                        query: { id: params.data.id, view: this.$route.query.view },
                    });
                }
            });
            this.chart.on("rendered", () => this.enableFullCanvasRoam());
            if (typeof ResizeObserver !== "undefined") {
                this.resizeObserver = new ResizeObserver(() => {
                    this.chart?.resize();
                    this.enableFullCanvasRoam();
                });
                this.resizeObserver.observe(el);
            }
            return this.chart;
        },
        enableFullCanvasRoam() {
            const chart = this.chart;
            if (!chart) return;
            const seriesModel = chart.getModel?.()?.getSeriesByIndex(0);
            const view = seriesModel && chart.getViewOfSeriesModel?.(seriesModel);
            const controller = view?._controller;
            if (!controller) return;
            controller.setPointerChecker(
                (_e, x, y) => x >= 0 && y >= 0 && x <= chart.getWidth() && y <= chart.getHeight()
            );
        },
        disposeChart() {
            this.resizeObserver?.disconnect();
            this.resizeObserver = null;
            if (this.chart) {
                this.chart.dispose();
                this.chart = null;
            }
        },
        computeLayeredPositions(nodes, edges) {
            const buckets = new Map();
            for (const node of nodes) {
                const tier = DOMAIN_META[node.domain]?.tier ?? 3;
                if (!buckets.has(tier)) buckets.set(tier, []);
                buckets.get(tier).push(node);
            }
            const tiers = [...buckets.keys()].sort((a, b) => a - b);
            const parents = new Map();
            for (const edge of edges) {
                if (!parents.has(edge.to_key)) parents.set(edge.to_key, []);
                parents.get(edge.to_key).push(edge.from_key);
                if (edge.kind === "wrapped_outfit") {
                    if (!parents.has(edge.from_key)) parents.set(edge.from_key, []);
                    parents.get(edge.from_key).push(edge.to_key);
                }
            }
            const pos = new Map();
            const gapX = 185;
            const gapY = 185;
            const subRowGap = 150;
            const maxPerRow = Math.max(7, Math.ceil(Math.sqrt(nodes.length * 2.2)));
            let cursorY = 0;

            for (const tier of tiers) {
                const list = buckets.get(tier);
                list.sort((a, b) => {
                    const avgX = (node) => {
                        const xs = (parents.get(node.key) || [])
                            .map((k) => pos.get(k)?.x)
                            .filter((x) => typeof x === "number");
                        return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : Number.POSITIVE_INFINITY;
                    };
                    const diff = avgX(a) - avgX(b);
                    return diff !== 0 ? diff : a.key.localeCompare(b.key, "en");
                });
                const rowCount = Math.ceil(list.length / maxPerRow);
                const perRow = Math.ceil(list.length / rowCount);
                for (let r = 0; r < rowCount; r++) {
                    const slice = list.slice(r * perRow, (r + 1) * perRow);
                    const startX = -((slice.length - 1) * gapX) / 2;
                    slice.forEach((node, idx) => {
                        pos.set(node.key, { x: startX + idx * gapX, y: cursorY + r * subRowGap });
                    });
                }
                cursorY += (rowCount - 1) * subRowGap + gapY;
            }
            return { pos, gapY };
        },
        renderChart() {
            if (!this.visibleGraphNodes.length) {
                this.disposeChart();
                return;
            }
            const chart = this.ensureChart();
            if (!chart) return;

            const nodes = this.visibleGraphNodes;
            const edges = this.visibleGraphEdges;
            const layered = this.layoutMode === "layered" ? this.computeLayeredPositions(nodes, edges) : null;
            const positions = layered?.pos || null;
            const gapY = layered?.gapY || 185;
            const nodeMap = new Map(nodes.map((node) => [node.key, node]));
            const compact = nodes.length > 22;

            const seriesData = nodes.map((node) => {
                const isCurrent = node.key === this.exteriorKey;
                const meta = DOMAIN_META[node.domain] || { color: "#64748b" };
                const coord = positions?.get(node.key);
                const name = node.name || this.$t("exteriorPreview.unnamed");
                const symbolSize = isCurrent
                    ? compact
                        ? 38
                        : 42
                    : node.domain === "part"
                    ? compact
                        ? 22
                        : 26
                    : compact
                    ? 28
                    : 34;
                return {
                    id: node.key,
                    name,
                    ...(coord ? { x: coord.x, y: coord.y } : {}),
                    symbolSize,
                    itemStyle: {
                        color: meta.color,
                        borderColor: isCurrent ? "#4f46e5" : "#ffffff",
                        borderWidth: isCurrent ? 4 : 2,
                        shadowBlur: isCurrent ? 16 : 5,
                        shadowColor: isCurrent ? "rgba(79, 70, 229, 0.45)" : "rgba(15, 23, 42, 0.14)",
                    },
                    label: {
                        show: true,
                        position: "bottom",
                        distance: 6,
                        formatter: () => (isCurrent ? `★ ${truncate(name, 11)}` : truncate(name, 9)),
                        color: isCurrent ? "#4338ca" : "#334155",
                        fontWeight: isCurrent ? 700 : 500,
                        fontSize: isCurrent ? 12 : 11,
                        backgroundColor: isCurrent ? "rgba(238, 242, 255, 0.94)" : "rgba(255, 255, 255, 0.84)",
                        padding: isCurrent ? [2, 6] : [1, 4],
                        borderRadius: 4,
                    },
                    rawNode: node,
                };
            });

            const showEdgeLabels = edges.length <= 24;
            const seriesLinks = edges.map((edge) => {
                const color = EDGE_COLORS[edge.kind] || "#94a3b8";
                const labelText = localizedExteriorLabel(this.$t, RELATION_LABELS[edge.kind] || edge.kind);
                let curveness = 0.1;
                if (positions) {
                    const p1 = positions.get(edge.from_key);
                    const p2 = positions.get(edge.to_key);
                    if (p1 && p2) {
                        const dy = Math.abs(p1.y - p2.y);
                        if (dy < 1) curveness = 0.28;
                        else if (dy > gapY * 1.2) curveness = 0.22;
                        else curveness = 0.06;
                    }
                }
                return {
                    source: edge.from_key,
                    target: edge.to_key,
                    relationLabel: labelText,
                    lineStyle: {
                        color,
                        width: edge.kind === "contains" ? 1.4 : 2,
                        opacity: edge.kind === "contains" ? 0.55 : 0.82,
                        curveness,
                    },
                    label: {
                        show: showEdgeLabels,
                        formatter: labelText,
                        fontSize: 10,
                        color: "#475569",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        padding: [2, 5],
                        borderRadius: 3,
                    },
                    emphasis: {
                        label: { show: true, color: "#0f172a", fontWeight: 600 },
                    },
                };
            });

            const option = {
                animationDuration: 300,
                tooltip: {
                    trigger: "item",
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderWidth: 1,
                    padding: 10,
                    extraCssText: "box-shadow: 0 10px 26px rgba(15, 23, 42, 0.12); border-radius: 12px;",
                    formatter: (params) => {
                        if (params.dataType === "node") {
                            const node = params.data?.rawNode || nodeMap.get(params.data?.id);
                            if (!node) return "";
                            const thumb = this.nodeThumb(node);
                            const meta = DOMAIN_META[node.domain] || {
                                label: node.domain,
                                color: "#64748b",
                                bg: "#f1f5f9",
                            };
                            const isCurrent = node.key === this.exteriorKey;
                            return `
                                <div style="display:flex;gap:10px;align-items:center;min-width:170px;max-width:260px;">
                                    ${
                                        thumb
                                            ? `<img src="${escapeHtml(
                                                  thumb
                                              )}" style="width:44px;height:54px;object-fit:contain;border-radius:6px;background:#f1f5f9;flex-shrink:0;" />`
                                            : ""
                                    }
                                    <div style="min-width:0;">
                                        <div style="font-weight:600;font-size:13px;color:#0f172a;word-break:break-word;">${escapeHtml(
                                            node.name || this.$t("exteriorPreview.unnamed")
                                        )}</div>
                                        <span style="display:inline-block;margin-top:4px;padding:1px 7px;border-radius:999px;background:${
                                            meta.bg
                                        };color:${meta.color};font-size:11px;font-weight:600;">${escapeHtml(
                                localizedExteriorLabel(this.$t, meta.label)
                            )}</span>
                                        <div style="margin-top:5px;font-size:11px;color:${
                                            isCurrent ? "#4f46e5" : "#64748b"
                                        };">${isCurrent ? this.$t('exteriorPreview.current') : this.$t('exteriorPreview.viewNode')}</div>
                                    </div>
                                </div>
                            `;
                        }
                        if (params.dataType === "edge") {
                            const from = nodeMap.get(params.data.source);
                            const to = nodeMap.get(params.data.target);
                            return `<div style="font-size:12px;color:#334155;"><b>${escapeHtml(
                                from?.name
                            )}</b> — ${escapeHtml(params.data.relationLabel)} → <b>${escapeHtml(to?.name)}</b></div>`;
                        }
                        return "";
                    },
                },
                series: [
                    {
                        type: "graph",
                        layout: this.layoutMode === "force" ? "force" : "none",
                        roam: true,
                        draggable: this.layoutMode === "force",
                        left: "center",
                        top: "center",
                        zoom: 0.88,
                        nodeScaleRatio: 0.5,
                        scaleLimit: { min: 0.25, max: 4 },
                        edgeSymbol: ["none", "arrow"],
                        edgeSymbolSize: [4, 8],
                        data: seriesData,
                        links: seriesLinks,
                        force: {
                            repulsion: Math.max(520, nodes.length * 26),
                            edgeLength: [115, 195],
                            gravity: 0.06,
                            friction: 0.25,
                            layoutAnimation: true,
                        },
                        emphasis: {
                            focus: "adjacency",
                            lineStyle: { width: 3, opacity: 1 },
                        },
                        blur: {
                            itemStyle: { opacity: 0.22 },
                            lineStyle: { opacity: 0.12 },
                            label: { opacity: 0.28 },
                        },
                    },
                ],
            };

            chart.clear();
            chart.setOption(option, true);
            this.enableFullCanvasRoam();
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-view-switch {
    display: inline-flex;
    padding: 3px;
    border-radius: @pvx-radius-pill;
    background: @pvx-surface-muted;
    border: 1px solid @pvx-border;

    .u-switch-btn {
        padding: 5px 14px;
        border: none;
        border-radius: @pvx-radius-pill;
        background: transparent;
        color: @pvx-text-secondary;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.18s;

        &.is-active {
            background: @pvx-primary;
            color: @pvx-text-inverse;
            font-weight: 600;
        }
    }
}

.m-ext-related__groups {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.m-rel-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.u-rel-group-head {
    display: flex;
    align-items: center;
    gap: 7px;

    .u-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: @pvx-text-regular;
    }

    .u-group-count {
        font-size: 12px;
        color: @pvx-text-muted;
    }
}

.m-rel-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 12px;

    @media (max-width: @phone) {
        grid-template-columns: repeat(auto-fill, minmax(min(156px, 100%), 1fr));
        gap: 8px;
    }
}

.m-rel-cards--compact {
    margin-top: 10px;
}

.u-rel-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 14px;
    border: 1px solid @pvx-border;
    background: @pvx-surface;
    color: @pvx-text-primary;
    text-decoration: none;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;

    &:hover {
        border-color: @pvx-border-focus;
        box-shadow: 0 6px 16px rgba(79, 70, 229, 0.1);
        transform: translateY(-1px);
    }

    &.is-current {
        border-color: @pvx-primary;
        background: @pvx-primary-soft;
    }
}

.u-rel-thumb {
    width: 48px;
    height: 60px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: url("~@/assets/img/exterior/card-bg.webp") center / cover no-repeat, #edf1fa;
    display: flex;
    align-items: center;
    justify-content: center;

    .u-rel-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 3px;
        box-sizing: border-box;
    }

    .u-rel-empty {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 3px 6px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.82);
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        letter-spacing: 0.02em;
    }
}

.u-rel-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .u-rel-name {
        font-size: 13px;
        font-weight: 600;
        color: @pvx-text-primary;
        line-height: 1.35;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .u-rel-meta {
        font-size: 11px;
        color: @pvx-text-secondary;
    }

    .u-current-pill {
        display: inline-block;
        padding: 1px 7px;
        border-radius: @pvx-radius-pill;
        background: @pvx-primary;
        color: @pvx-text-inverse;
        font-weight: 600;
    }
}

.m-rel-parts-wrap {
    padding-top: 12px;
    border-top: 1px solid @pvx-border-light;
}

.u-parts-toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 7px 14px;
    border-radius: @pvx-radius-pill;
    border: 1px solid @pvx-border;
    background: @pvx-surface-muted;
    color: @pvx-text-regular;
    font-size: 13px;
    cursor: pointer;

    .u-toggle-action {
        color: @pvx-primary-hover;
        font-weight: 600;
    }
}

.m-graph-canvas-wrap {
    position: relative;
    border-radius: 16px;
    border: 1px solid @pvx-border;
    background: radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.2) 1px, transparent 0) 0 0 / 20px 20px, #fafcff;
    overflow: hidden;
    user-select: none;
}

.m-graph-canvas {
    width: 100%;
    height: 430px;
    cursor: grab;

    &:active {
        cursor: grabbing;
    }
}

.m-domain-legend {
    position: absolute;
    top: 10px;
    left: 12px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    max-width: calc(100% - 210px);
    pointer-events: none;
}

.u-legend-chip,
.u-legend-reset,
.u-tool-btn {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: @pvx-radius-pill;
    border: 1px solid @pvx-border;
    background: rgba(255, 255, 255, 0.92);
    color: @pvx-text-regular;
    font-size: 12px;
    cursor: pointer;

    &.is-off {
        opacity: 0.45;
        text-decoration: line-through;
    }

    &.is-active {
        border-color: @pvx-primary;
        background: @pvx-primary;
        color: @pvx-text-inverse;
    }

    .u-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .u-count {
        color: @pvx-text-muted;
        font-size: 11px;
    }
}

.u-legend-reset {
    color: @pvx-primary-hover;
    border-color: @pvx-border-focus;
}

.m-graph-tools {
    position: absolute;
    top: 10px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.m-edge-legend {
    position: absolute;
    right: 12px;
    bottom: 10px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 4px 10px;
    border-radius: @pvx-radius-pill;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid @pvx-border-light;
    font-size: 11px;
    color: @pvx-text-secondary;
    pointer-events: none;

    .u-edge-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }

    .u-edge-line {
        width: 12px;
        height: 2px;
        border-radius: 2px;
        display: inline-block;
    }
}
@media (max-width: @phone) {
    .m-graph-canvas-wrap {
        display: flex;
        flex-direction: column;
    }
    .m-domain-legend, .m-graph-tools, .m-edge-legend {
        position: static;
        max-width: 100%;
        padding: 6px 8px;
    }
    .m-domain-legend, .m-graph-tools { order: -1; }
    .m-graph-canvas { height: clamp(280px, 55vh, 400px); }
}
</style>
