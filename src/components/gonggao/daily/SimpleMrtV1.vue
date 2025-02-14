<template>
    <div class="m-simple-mrt">
        <div class="m-mrt-item">
            <div class="u-mrt-title">
                <span>{{ meirentu.name || "今日暂无画像" }}</span>
                <span>{{ week }}</span>
            </div>
            <div class="u-mrt-desc">
                {{ meirentu.desc || "" }}
            </div>
        </div>
    </div>
</template>

<script>
import servers_std from "@jx3box/jx3box-data/data/server/server_std.json";
import servers_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import { getMeirentu } from "@/service/gonggao/gonggao";

import dayjs from "@/utils/day";
export default {
    name: "SimpleMrt",
    data() {
        return {
            meirentu: {},
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client || "std";
        },
        servers: function () {
            if (this.client == "std") {
                return servers_std;
            } else {
                return servers_origin;
            }
        },
        server() {
            return this.$store.state.server;
        },
        week() {
            var datas = dayjs.tz(this.meirentu?.date || new Date()).day();
            var week = ["日", "一", "二", "三", "四", "五", "六"];
            return "周" + week[datas];
        },
    },
    watch: {
        server: {
            immediate: true,
            handler(val) {
                val && this.loadMeirentu();
            },
        },
    },
    methods: {
        // 获取美人图
        loadMeirentu() {
            getMeirentu(this.server).then((res) => {
                this.meirentu = res.data?.data || {};
            });
        },
    },
};
</script>
