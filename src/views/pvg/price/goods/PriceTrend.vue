<template>
    <div ref="container" class="m-market-trend" :aria-label="`${label}近七日价格趋势`">
        <template v-if="state === 'loaded' && available.length">
            <el-tooltip
                :visible="activePoint !== null"
                placement="top"
                effect="light"
                :show-arrow="true"
                :enterable="false"
            >
                <template #content>
                    <div v-if="activePoint" class="m-market-trend-tooltip">
                        <div>{{ formatDate(activePoint.timestamp) }} · {{ scopeLabel }}</div>
                        <GamePrice v-if="activePoint.price != null" :price="Math.round(activePoint.price)" />
                        <span v-else>暂无数据</span>
                        <small v-if="activePoint.count">{{ activePoint.count }} 个服务器有报价</small>
                    </div>
                </template>
                <div
                    class="m-market-trend-plot"
                    tabindex="0"
                    :aria-label="`${label}趋势，左右方向键查看每日价格`"
                    @pointermove="showPoint"
                    @pointerdown="showPoint"
                    @pointerleave="hoverIndex = null"
                    @focus="hoverIndex = 6"
                    @blur="hoverIndex = null"
                    @keydown.left.prevent="movePoint(-1)"
                    @keydown.right.prevent="movePoint(1)"
                    @keydown.esc="hoverIndex = null"
                >
                    <svg viewBox="0 0 160 56" preserveAspectRatio="none" role="img" :aria-label="summary">
                        <desc>{{ summary }}</desc>
                        <defs>
                            <linearGradient :id="gradientId" gradientUnits="userSpaceOnUse" x2="0" y2="54">
                                <stop stop-color="currentColor" stop-opacity=".38" />
                                <stop offset="100%" stop-color="currentColor" stop-opacity=".04" />
                            </linearGradient>
                        </defs>
                        <path :d="geometry.area" :fill="'url(#' + gradientId + ')'" />
                        <path
                            :d="geometry.path"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            vector-effect="non-scaling-stroke"
                        />
                        <line
                            v-for="(dot, index) in geometry.dots"
                            :key="index"
                            :x1="dot.x"
                            :x2="dot.x"
                            :y1="dot.y"
                            :y2="dot.y + 0.01"
                            stroke="currentColor"
                            :stroke-width="dot.index === hoverIndex ? 6 : 3"
                            stroke-linecap="round"
                            vector-effect="non-scaling-stroke"
                        />
                        <line
                            v-if="activePoint"
                            :x1="5 + hoverIndex * 25"
                            :x2="5 + hoverIndex * 25"
                            y1="4"
                            y2="52"
                            stroke="currentColor"
                            stroke-width="1"
                            stroke-opacity=".55"
                            stroke-dasharray="3 3"
                            vector-effect="non-scaling-stroke"
                        />
                    </svg>
                </div>
            </el-tooltip>
            <span class="u-market-trend-caption">近7日 · {{ scopeLabel }}</span>
        </template>
        <button v-else-if="state === 'error'" type="button" class="u-market-trend-retry" @click="load">
            趋势加载失败，重试
        </button>
        <span v-else class="u-market-muted">{{
            state === "idle" ? "进入可视区域加载趋势" : state === "loading" ? "趋势加载中…" : "近7日暂无数据"
        }}</span>
    </div>
</template>
<script>
import { aggregateDailyTrend, trendGeometry } from "@/utils/price-trend";
import GamePrice from "@jx3box/jx3box-ui/src/wiki/GamePrice.vue";
let nextGradientId = 0;

export default {
    name: "PriceTrend",
    components: { GamePrice },
    inject: ["priceTrendLoader"],
    props: {
        itemId: { type: String, required: true },
        label: { type: String, default: "物品" },
        servers: { type: Array, required: true },
        scopeLabel: { type: String, default: "跨服参考均价" },
    },
    data() {
        return { state: "idle", rows: [], hoverIndex: null, gradientId: `market-trend-${++nextGradientId}` };
    },
    computed: {
        activePoint() {
            return this.hoverIndex == null ? null : this.points[this.hoverIndex];
        },
        points() {
            return aggregateDailyTrend(this.rows, this.servers);
        },
        available() {
            return this.points.filter((point) => point.price != null);
        },
        geometry() {
            return trendGeometry(this.points);
        },
        summary() {
            return `${this.label}，近七个完整自然日，${this.scopeLabel}，${this.available.length}天有数据，缺失日期不连线`;
        },
    },
    mounted() {
        this.cancelLoad = null;
        if (typeof IntersectionObserver === "undefined") {
            this.load();
            return;
        }
        this.observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                this.observer.disconnect();
                this.load();
            }
        });
        this.observer.observe(this.$refs.container);
    },
    methods: {
        showPoint(event) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (!bounds.width) return;
            const x = ((event.clientX - bounds.left) / bounds.width) * 160;
            this.hoverIndex = Math.max(0, Math.min(6, Math.round((x - 5) / 25)));
        },
        movePoint(delta) {
            this.hoverIndex = Math.max(0, Math.min(6, (this.hoverIndex ?? 6) + delta));
        },
        formatDate(timestamp) {
            return new Date(timestamp + 8 * 3600000).toISOString().slice(5, 10);
        },
        load() {
            this.cancelLoad?.();
            this.state = "loading";
            this.cancelLoad = this.priceTrendLoader.load(
                this.itemId,
                (rows) => {
                    this.rows = rows;
                    this.state = "loaded";
                },
                () => {
                    this.state = "error";
                }
            );
        },
    },
    beforeUnmount() {
        this.observer?.disconnect();
        this.cancelLoad?.();
    },
};
</script>
