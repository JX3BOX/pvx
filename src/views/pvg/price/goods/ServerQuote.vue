<template>
    <div class="m-market-server">
        <span :class="{ 'is-current': current }">{{ name }}</span>
        <template v-if="quote">
            <GamePrice :price="quote.price" />
            <time class="u-market-time" :title="formattedTime">{{ formattedTime }}</time>
        </template>
        <span v-else class="u-market-muted">{{
            status === "pending" ? "加载中…" : status === "failed" ? "加载失败" : "暂无报价"
        }}</span>
    </div>
</template>
<script>
import GamePrice from "@jx3box/jx3box-ui/src/wiki/GamePrice.vue";
import dayjs from "dayjs";
// 每个区服单独更新，其他区服返回报价时不会重复渲染已完成的价格组件。
export default {
    name: "ServerQuote",
    components: { GamePrice },
    props: {
        name: { type: String, required: true },
        quote: { type: Object, default: null },
        current: { type: Boolean, default: false },
        status: { type: String, default: "ready" },
    },
    computed: {
        formattedTime() {
            return this.quote?.timestamp ? dayjs.unix(this.quote.timestamp).format("MM-DD HH:mm") : "";
        },
    },
};
</script>
