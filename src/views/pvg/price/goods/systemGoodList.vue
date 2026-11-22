<template>
    <div class="m-market-list">
        <div class="m-market-row m-market-row--header" aria-hidden="true">
            <span>物品 / 有报价服务器均价</span><span>各服近期报价 · 左右滚动查看全部</span><span>近期综合趋势</span
            ><span></span>
        </div>
        <section v-for="group in displayGroups" :key="group.id" class="m-market-group">
            <h3 v-if="group.label" class="m-market-group__title">{{ group.label }}</h3>
            <div v-for="item in group.items" :key="item.item_id" class="m-market-row">
                <div class="m-market-item">
                    <img v-if="item.icon" class="u-icon" :src="iconLink(item.icon)" alt="" loading="lazy" />
                    <span v-else class="u-icon u-market-icon-missing" aria-label="暂无图标"
                        ><el-icon><Goods /></el-icon
                    ></span>
                    <div>
                        <div class="m-market-item__name">{{ item.label }}</div>
                        <div class="m-market-average">
                            <span>均价</span
                            ><GamePrice v-if="averages[item.item_id] != null" :price="averages[item.item_id]" /><span
                                v-else
                                >暂无报价</span
                            >
                        </div>
                    </div>
                </div>
                <div
                    class="m-market-servers"
                    tabindex="0"
                    role="region"
                    :aria-label="`${item.label}全部服务器报价，可左右滚动`"
                >
                    <ServerQuote
                        v-for="name in servers"
                        :key="name"
                        :name="name"
                        :quote="quotes[name]?.[item.item_id]"
                        :current="name === server"
                        :status="
                            pendingServers.includes(name)
                                ? 'pending'
                                : failedServers.includes(name)
                                ? 'failed'
                                : 'ready'
                        "
                    />
                </div>
                <PriceTrend :item-id="item.item_id" :label="item.label" :servers="servers" />
                <a
                    class="m-market-detail"
                    :href="`/item/view/${item.item_id}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`查看${item.label}详情`"
                    @click="rememberServer"
                    ><el-icon><ArrowRight /></el-icon
                ></a>
            </div>
        </section>
    </div>
</template>
<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import GamePrice from "@jx3box/jx3box-ui/src/wiki/GamePrice.vue";
import { ArrowRight, Goods } from "@element-plus/icons-vue";
import ServerQuote from "./ServerQuote.vue";
import PriceTrend from "./PriceTrend.vue";
export default {
    components: { PriceTrend, GamePrice, ArrowRight, Goods, ServerQuote },
    props: {
        data: { type: Array, default: () => [] },
        server: { type: String, default: "" },
        servers: { type: Array, default: () => [] },
        quotes: { type: Object, default: () => ({}) },
        failedServers: { type: Array, default: () => [] },
        pendingServers: { type: Array, default: () => [] },
    },
    computed: {
        displayGroups() {
            return this.data.map((group) => {
                const seen = new Set();
                return {
                    ...group,
                    items: group.items.filter((item) => {
                        if (seen.has(item.item_id)) return false;
                        seen.add(item.item_id);
                        return true;
                    }),
                };
            });
        },
        averages() {
            const values = {};
            this.servers.forEach((server) => {
                Object.entries(this.quotes[server] || {}).forEach(([id, quote]) => {
                    const entry = values[id] || (values[id] = { sum: 0, count: 0 });
                    entry.sum += quote.price;
                    entry.count++;
                });
            });
            return Object.fromEntries(
                Object.entries(values).map(([id, value]) => [id, Math.round(value.sum / value.count)])
            );
        },
    },
    methods: {
        iconLink,
        rememberServer() {
            sessionStorage.setItem("server_name", this.server);
        },
    },
};
</script>
