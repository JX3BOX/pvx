<template>
    <div class="m-simple-mrt-new">
        <div class="m-mrt-item" v-for="(item, i) in list" :key="i">
            <div class="u-name" :class="!i && 'active'">
                <span>{{ item.title }}</span>
                <!-- eslint-disable-next-line vue/no-parsing-error -->
                <span class="u-desc" v-if="item.body">{{ `< ${item.body} >` }}</span>
            </div>
            <span class="u-week">{{ item.week }}</span>
            <span class="u-date">{{ item.date }}</span>
        </div>
    </div>
</template>

<script>
import { getMeirentuNew } from "@/service/gonggao/gonggao";
import { bodyMap } from "@jx3box/jx3box-data/data/role/body.json";
import schoolMap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import servers_std from "@jx3box/jx3box-data/data/server/server_std.json";
import servers_origin from "@jx3box/jx3box-data/data/server/server_origin.json";

import dayjs from "@/utils/day";
export default {
    name: "SimpleMrt",
    props: {
        server: {
            type: String,
            default: "梦江南",
        },
    },
    data() {
        return {
            list: [],
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
    },
    watch: {
        server: {
            immediate: true,
            handler(val) {
                val && this.load();
            },
        },
    },
    methods: {
        getWeek(date) {
            var data = dayjs.tz(date).day();
            var week = ["日", "一", "二", "三", "四", "五", "六"];
            return "周" + week[data];
        },
        // 获取美人图
        load() {
            const params = {
                server: this.server,
                client: this.client,
                // date: "2025-01-09",
                // _no_cache: 1,
            };
            getMeirentuNew(params).then((res) => {
                const list = (res.data?.data || []).map((item) => {
                    const data = item.item || {};
                    return {
                        date: item.date,
                        ...data,
                        week: this.getWeek(item.date || 0),
                        title: `${schoolMap[data.school_id]}${data.desc}画像`,
                        body: bodyMap[data.body_id],
                    };
                });
                const today = dayjs(new Date()).format("YYYY-MM-DD");
                if (today !== list?.[0]?.date) {
                    this.list = [
                        {
                            date: today,
                            week: this.getWeek(today),
                            title: "今日暂无画像",
                            body: "",
                        },
                        ...list.slice(0, 2),
                    ];
                } else {
                    this.list = list.slice(0, 3);
                }
            });
        },
    },
};
</script>
