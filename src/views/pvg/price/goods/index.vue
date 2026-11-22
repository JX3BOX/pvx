<template>
    <div class="p-price-goods m-goods-market" v-loading="loading">
        <PvxSurface class="m-pvx-price__section" padding="medium">
            <h2 class="m-market-section-title">近7日趋势</h2>
            <div class="m-market-highlights">
                <div v-for="item in highlights" :key="item.item_id" class="m-market-highlight">
                    <div class="m-market-highlight__name">
                        <img v-if="item.icon" :src="iconLink(item.icon)" alt="" /><el-icon v-else><Goods /></el-icon
                        >{{ item.label }}
                    </div>
                    <small>{{ server }} · 最新报价</small>
                    <GamePrice v-if="priceMap[item.item_id] != null" :price="priceMap[item.item_id]" />
                    <span v-else class="u-market-muted">暂无报价</span>
                    <PriceTrend
                        :key="`${client}:${item.item_id}`"
                        :item-id="item.item_id"
                        :label="item.label"
                        :servers="comparisonServers"
                    />
                </div>
            </div>
            <p v-if="!highlights.length && !loading" class="u-market-muted">本页暂无物品</p>
        </PvxSurface>
        <PvxSurface class="m-pvx-price__section" padding="medium">
            <div class="m-market-toolbar">
                <h2 class="m-market-section-title">
                    {{ $t("pages.pvg.price.ui.sections.goods.title") }}
                    <el-tooltip placement="top">
                        <template #content>
                            共 {{ comparisonServers.length }} 个服务器 · 已加载 {{ completedServers }} /
                            {{ comparisonServers.length }}<br />
                            均价统计所有有报价的服务器，左右滚动可查看已选服务器的报价<br />
                            趋势为近7个完整自然日有报价服务器的算术均值
                        </template>
                        <button type="button" class="m-market-section-info" aria-label="物价说明">
                            <el-icon><InfoFilled /></el-icon>
                        </button>
                    </el-tooltip>
                </h2>
                <draggable
                    v-if="serverOptions.length"
                    :model-value="serverOptions"
                    item-key="name"
                    class="m-market-server-options"
                    role="group"
                    aria-label="选择和排序报价服务器"
                    handle=".u-market-server-handle"
                    ghost-class="is-dragging"
                    @update:model-value="saveServerOptions"
                >
                    <template #item="{ element, index }">
                        <div class="m-market-server-option" :class="{ 'is-selected': element.visible }">
                            <button
                                type="button"
                                class="u-market-server-handle"
                                :aria-label="`调整${element.name}顺序，使用左右方向键`"
                                title="拖拽排序，也可使用左右方向键"
                                @keydown.left.prevent="moveServer(index, -1)"
                                @keydown.right.prevent="moveServer(index, 1)"
                            >
                                <el-icon><Rank /></el-icon>
                            </button>
                            <label>
                                <input type="checkbox" :checked="element.visible" @change="toggleServer(element.name)" />
                                {{ element.name }}
                            </label>
                        </div>
                    </template>
                </draggable>
            </div>
            <p v-if="keywords.trim()" class="u-market-muted">全库名称搜索 · 仅展示已确认可交易物品</p>
            <el-alert
                v-if="missingDetails"
                :title="`${missingDetails} 件物品信息暂未补齐，显示物品 ID；仍可查询报价`"
                type="info"
                :closable="false"
            />
            <el-alert v-if="listError" :title="listError" type="error" :closable="false" show-icon>
                <el-button @click="loadGroups">重新加载</el-button>
            </el-alert>
            <el-alert v-if="error" :title="error" type="warning" :closable="false" show-icon />
            <systemGoodList
                v-if="filteredGroups.length"
                :key="client"
                :data="filteredGroups"
                :server="server"
                :servers="comparisonServers"
                :visible-servers="visibleServers"
                :quotes="quotes"
                :failed-servers="failedServers"
                :pending-servers="pendingServers"
            />
            <PvxEmptyState
                v-else-if="!loading && !listError"
                illustrated
                :title="$t('pages.pvg.price.ui.empty.goodsTitle')"
                :description="$t('pages.pvg.price.ui.empty.goodsDescription')"
            />
            <div v-if="total && filteredGroups.length" class="m-market-pagination">
                <el-pagination
                    :current-page="page"
                    :page-size="pageSize"
                    :total="total"
                    :pager-count="5"
                    :disabled="loading"
                    layout="prev, pager, next"
                    background
                    @current-change="changePage"
                />
                <span v-if="keywords.trim()" class="u-market-muted"
                    >名称匹配 {{ total }} 件 · 本页可交易 {{ searchItemCount }} 件</span
                >
                <span v-else class="u-market-muted">共 {{ total }} 件 · 每页 {{ pageSize }} 件</span>
            </div>
        </PvxSurface>
    </div>
</template>
<script>
import draggable from "vuedraggable";
import { markRaw } from "vue";
import { createPriceTrendLoader } from "@/utils/price-trend";
import PriceTrend from "./PriceTrend.vue";
import {
    getTradableGoodsPage,
    getServerPriceData,
    getDailyPriceTrend,
    searchTradableGoodsBatch,
} from "@/service/pvg/price.js";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import serverCn from "@jx3box/jx3box-data/data/server/server_cn.json";
import serverOrigin from "@jx3box/jx3box-data/data/server/server_origin.json";
import GamePrice from "@jx3box/jx3box-ui/src/wiki/GamePrice.vue";
import systemGoodList from "./systemGoodList.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { Goods, InfoFilled, Rank } from "@element-plus/icons-vue";
const SERVER_OPTIONS_KEY = "pvx-price-server-options";

export default {
    name: "PriceGoods",
    components: {
        PriceTrend,
        systemGoodList,
        GamePrice,
        PvxEmptyState,
        PvxSurface,
        Goods,
        InfoFilled,
        Rank,
        draggable,
    },
    props: { keywords: { type: String, default: "" }, server: { type: String, default: "" } },
    data() {
        return {
            trendLoader: markRaw(createPriceTrendLoader(getDailyPriceTrend)),
            serverPreferences: {},
            groups: [],
            page: 1,
            searchItemCount: 0,
            pageSize: 20,
            total: 0,
            missingDetails: 0,
            listError: "",
            quotes: {},
            failedServers: [],
            pendingServers: [],
            completedServers: 0,
            loading: false,
            error: "",
            requestVersion: 0,
            groupVersion: 0,
            requestedServers: [],
        };
    },
    provide() {
        return { priceTrendLoader: this.trendLoader };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        comparisonServers() {
            if (!this.server) return [];
            const list = this.client === "std" ? serverCn : serverOrigin;
            return [...new Set([this.server, ...list])];
        },
        serverOptions() {
            const saved = this.serverPreferences[this.client] || [];
            const current = new Set(this.comparisonServers);
            const options = saved.filter(({ name }) => current.delete(name));
            return [...options, ...Array.from(current, (name) => ({ name, visible: true }))];
        },
        visibleServers() {
            return this.serverOptions.filter(({ visible }) => visible).map(({ name }) => name);
        },
        highlights() {
            return this.groups
                .flatMap((group) => group.items || [])
                .filter((item, index, items) => items.findIndex((other) => other.item_id === item.item_id) === index)
                .slice(0, 3);
        },
        priceMap() {
            return Object.fromEntries(
                Object.entries(this.quotes[this.server] || {}).map(([id, quote]) => [id, quote.price])
            );
        },
        filteredGroups() {
            return this.groups.filter((group) => group.items?.length);
        },
    },
    methods: {
        iconLink,
        saveServerOptions(options) {
            this.serverPreferences[this.client] = options;
            try {
                localStorage.setItem(SERVER_OPTIONS_KEY, JSON.stringify(this.serverPreferences));
            } catch {
                // The controls also work when browser storage is unavailable.
            }
        },
        toggleServer(name) {
            this.saveServerOptions(
                this.serverOptions.map((option) =>
                    option.name === name ? { ...option, visible: !option.visible } : option
                )
            );
        },
        moveServer(index, offset) {
            const target = index + offset;
            const options = [...this.serverOptions];
            if (target < 0 || target >= options.length) return;
            [options[index], options[target]] = [options[target], options[index]];
            this.saveServerOptions(options);
        },
        changePage(page) {
            if (page === this.page) return;
            this.page = page;
            this.loadGroups();
        },
        resetSearch() {
            this.page = 1;
            this.total = 0;
            this.loadGroups();
        },
        async loadSearchBatch(version, signal) {
            const key = `${this.client}:search:${this.keywords.trim()}:${this.page}`;
            const cached = this.pageCache.get(key);
            const result =
                cached && Date.now() - cached.time < 60000
                    ? cached.result
                    : await searchTradableGoodsBatch({
                          keyword: this.keywords.trim(),
                          client: this.client,
                          index: this.page,
                          signal,
                          membershipCache: this.membershipCache,
                      });
            if (version !== this.groupVersion) return;
            this.pageCache.delete(key);
            this.pageCache.set(key, { result, time: cached && result === cached.result ? cached.time : Date.now() });
            if (this.pageCache.size > 5) this.pageCache.delete(this.pageCache.keys().next().value);
            this.total = result.total;
            this.searchItemCount = result.items.length;
            this.groups = [{ id: "search", items: result.items }];
            this.loadPrices();
        },
        async loadGroups() {
            const version = ++this.groupVersion;
            ++this.requestVersion;
            this.listAbort?.abort();
            this.quoteAbort?.abort();
            const controller = new AbortController();
            this.listAbort = controller;
            this.groups = [];
            this.requestedServers = [];
            this.quotes = {};
            this.failedServers = [];
            this.pendingServers = [];
            this.completedServers = 0;
            this.missingDetails = 0;
            this.listError = "";
            this.error = "";
            this.loading = true;
            try {
                if (this.keywords.trim()) {
                    await this.loadSearchBatch(version, controller.signal);
                    return;
                }
                const key = `${this.client}:${this.page}:${this.pageSize}`;
                const cached = this.pageCache.get(key);
                const result =
                    cached && Date.now() - cached.time < 60000
                        ? cached.result
                        : await getTradableGoodsPage({
                              index: this.page,
                              pageSize: this.pageSize,
                              client: this.client,
                              signal: controller.signal,
                          });
                if (version !== this.groupVersion) return;
                if (!result.missingDetails) {
                    this.pageCache.delete(key);
                    this.pageCache.set(key, {
                        result,
                        time: cached && result === cached.result ? cached.time : Date.now(),
                    });
                    if (this.pageCache.size > 5) this.pageCache.delete(this.pageCache.keys().next().value);
                }
                this.total = Number(result.page.total) || 0;
                this.missingDetails = result.missingDetails;
                this.groups = [{ id: "tradable", items: result.items }];
                this.loadPrices();
            } catch (error) {
                if (version === this.groupVersion) this.listError = "物品列表加载失败，请重新加载";
            } finally {
                if (version === this.groupVersion) this.loading = false;
            }
        },
        async loadPrices() {
            const version = ++this.requestVersion;
            this.quoteAbort?.abort();
            const controller = new AbortController();
            this.quoteAbort = controller;
            this.quotes = {};
            this.failedServers = [];
            this.pendingServers = [];
            this.completedServers = 0;
            const ids = [...new Set(this.groups.flatMap((group) => (group.items || []).map((item) => item.item_id)))];
            if (!ids.length || !this.comparisonServers.length) return;
            const servers = [...this.comparisonServers];
            this.requestedServers = servers;
            this.error = "";
            this.completedServers = 0;
            this.pendingServers = [...servers];
            let cursor = 0;
            const worker = async () => {
                while (cursor < servers.length && version === this.requestVersion) {
                    const server = servers[cursor++];
                    try {
                        const result = await getServerPriceData(
                            { item_ids: ids, server, aggregate_type: "hourly" },
                            { signal: controller.signal }
                        );
                        if (version !== this.requestVersion) return;
                        if (!Array.isArray(result.data)) throw new Error("Invalid quote response");
                        this.quotes[server] = Object.fromEntries(
                            result.data
                                .filter(
                                    (item) =>
                                        item.price != null &&
                                        Number.isFinite(Number(item.price)) &&
                                        Number(item.price) >= 0
                                )
                                .map((item) => [item.item_id, { ...item, price: Number(item.price) }])
                        );
                    } catch (error) {
                        if (version !== this.requestVersion) return;
                        this.failedServers.push(server);
                    } finally {
                        if (version === this.requestVersion) {
                            this.pendingServers = this.pendingServers.filter((name) => name !== server);
                            this.completedServers++;
                        }
                    }
                }
            };
            await Promise.all(Array.from({ length: Math.min(4, servers.length) }, worker));
            if (version !== this.requestVersion) return;
            this.error = this.failedServers.length
                ? `${this.failedServers.join("、")}报价加载失败，其余服务器仍可查看`
                : "";
        },
    },
    created() {
        try {
            const saved = JSON.parse(localStorage.getItem(SERVER_OPTIONS_KEY));
            for (const [client, options] of Object.entries(saved || {})) {
                if (Array.isArray(options)) {
                    this.serverPreferences[client] = options.filter(
                        (option) => typeof option?.name === "string" && typeof option.visible === "boolean"
                    );
                }
            }
        } catch {
            // Start with all servers selected when browser storage cannot be read.
        }
        this.pageCache = new Map();
        this.membershipCache = new Map();
        this.searchTimer = null;
        this.listAbort = null;
        this.quoteAbort = null;
    },
    mounted() {
        this.loadGroups();
    },
    beforeUnmount() {
        ++this.groupVersion;
        ++this.requestVersion;
        this.listAbort?.abort();
        this.quoteAbort?.abort();
        clearTimeout(this.searchTimer);
        this.membershipCache.clear();
        this.pageCache.clear();
        this.trendLoader.clear();
    },
    watch: {
        keywords() {
            clearTimeout(this.searchTimer);
            ++this.groupVersion;
            ++this.requestVersion;
            this.listAbort?.abort();
            this.quoteAbort?.abort();
            this.groups = [];
            this.loading = true;
            this.searchItemCount = 0;
            this.page = 1;
            this.searchTimer = setTimeout(() => this.resetSearch(), 350);
        },
        server(value) {
            // 已在请求全部区服，只有切换到未请求的服才需要重新加载。
            if (!this.requestedServers.includes(value)) this.loadPrices();
        },
        client() {
            clearTimeout(this.searchTimer);
            this.trendLoader.clear();
            this.page = 1;
            this.total = 0;
            this.loadGroups();
        },
    },
};
</script>
