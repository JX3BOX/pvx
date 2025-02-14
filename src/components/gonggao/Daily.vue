<template>
    <div class="m-daily">
        <div class="m-daily-item">
            <div class="u-title">公告</div>
            <SimpleNotice class="m-daily-content"></SimpleNotice>
        </div>
        <div class="m-daily-item">
            <div class="u-title">服务器状态</div>
            <SimpleServer class="m-daily-content"></SimpleServer>
        </div>
        <template v-if="!isOrigin">
            <div class="m-daily-item">
                <div class="u-title">家园声望&福缘</div>
                <SimpleDaily class="m-daily-content" :activities="activities"></SimpleDaily>
            </div>
            <div class="m-daily-item">
                <div class="u-title">
                    <div>{{ celebrityMap[currentCelebrity] }}</div>
                    <el-dropdown>
                        <span class="el-dropdown-link"> 切换<i class="el-icon-arrow-down el-icon--right"></i> </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="changeCelebrity(2)">披风会</el-dropdown-item>
                            <el-dropdown-item @click.native="changeCelebrity(1)">云从社</el-dropdown-item>
                            <el-dropdown-item @click.native="changeCelebrity(0)">楚天社</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
                <SimpleCelebrity :type="currentCelebrity" class="m-daily-content"></SimpleCelebrity>
            </div>
            <!-- <div class="m-daily-item">
                <div class="u-title">武林通鉴</div>
                <SimpleWeek class="m-daily-content" :activities="activities"></SimpleWeek>
            </div> -->
            <!-- <div class="m-daily-item">
                <div class="u-title">家园</div>
                <SimpleReputation :activities="activities"></SimpleReputation>
                <SimpleFurniture :furniture="currentFurniture" :nextFurniture="nextFurniture"></SimpleFurniture>
            </div> -->
            <div class="m-daily-item">
                <div class="u-title">抓马播报</div>
                <SimpleHorse class="m-daily-content"></SimpleHorse>
            </div>
            <div class="m-daily-item">
                <div class="u-title">
                    <div class="u-mrt-title">
                        美人图 ·
                        <el-select class="u-select" placeholder="区服" v-model="currentServer" size="small">
                            <el-option v-for="(item, i) in servers" :key="i" :label="item" :value="item"></el-option>
                        </el-select>
                    </div>
                    <el-button class="u-btn" type="text" @click="visible = true">查询</el-button>
                </div>
                <SimpleMrt class="m-daily-content" :server="currentServer"></SimpleMrt>
            </div>
        </template>
        <MrtDialog :visible="visible" :currentServer="currentServer" @close="visible = false"></MrtDialog>
    </div>
</template>

<script>
import dayjs from "@/utils/day";
import { getFurniture, getDailyFromOs } from "@/service/gonggao/gonggao";
import SimpleNotice from "./daily/SimpleNotice.vue";
import SimpleServer from "./daily/SimpleServer.vue";
import SimpleDaily from "./daily/SimpleDaily.vue";
// import SimpleWeek from "./daily/SimpleWeek.vue";
import SimpleCelebrity from "./daily/SimpleCelebrity.vue";
// import SimpleReputation from "./daily/SimpleReputation.vue";
// import SimpleFurniture from "./daily/SimpleFurniture.vue";
import SimpleHorse from "./daily/SimpleHorse.vue";
import SimpleMrt from "./daily/SimpleMrt.vue";
import MrtDialog from "./daily/MrtDialog.vue";

import dailyKeys from "@/assets/data/daily_keys.json";
import servers_std from "@jx3box/jx3box-data/data/server/server_std.json";
import servers_origin from "@jx3box/jx3box-data/data/server/server_origin.json";

export default {
    name: "Daily",
    components: {
        SimpleNotice,
        SimpleServer,
        SimpleDaily,
        // SimpleReputation,
        SimpleCelebrity,
        // SimpleWeek,
        // SimpleFurniture,
        SimpleHorse,
        SimpleMrt,
        MrtDialog,
    },
    data() {
        return {
            currentCelebrity: 2, // 楚天社0 云从社1 披风会 2
            celebrityMap: {
                0: "楚天社",
                1: "云从社",
                2: "披风会",
            },
            currentFurniture: {},
            nextFurniture: {},
            activities: [], // 日常配置列表
            visible: false,
            currentServer: "",
        };
    },
    computed: {
        client() {
            return this.$store.state.client || "std";
        },
        server() {
            return this.$store.state.server || "梦江南";
        },
        servers: function () {
            if (this.client == "std") {
                return servers_std;
            } else {
                return servers_origin;
            }
        },
        isOrigin() {
            return location.href.includes("origin");
        },
        dailyKeyMap() {
            return dailyKeys.reduce((acc, cur) => {
                return { ...acc, [cur["key"]]: cur.name };
            }, {});
        },
        date() {
            // 当7点以前，请求前面一天的日常 当7~24点，请求当天的日常
            const hour = dayjs.tz().get("hours");
            return 0 <= hour && hour < 7
                ? dayjs.tz().subtract(1, "day").format("YYYY-MM-DD")
                : dayjs.tz().format("YYYY-MM-DD");
        },
        isCurrentWeek() {
            let week = dayjs.tz(this.date).isoWeek();
            let currentWeek = dayjs.tz().isoWeek();
            return week === currentWeek;
        },
    },
    watch: {
        server: {
            immediate: true,
            handler(server) {
                if (server) {
                    this.currentServer = server;
                }
            },
        },
    },
    methods: {
        changeCelebrity(i) {
            this.currentCelebrity = i;
        },
        loadDailyNew() {
            const params = {
                client: this.client,
            };
            getDailyFromOs(params).then((res) => {
                let list = res.data.data || [];
                const activities = list.filter((item) => {
                    return item.client === this.client;
                });
                this.activities = activities.map((item) => {
                    return {
                        ...item,
                        name: this.dailyKeyMap[item.key],
                    };
                });
            });
        },
        getFurniture() {
            if (!this.isOrigin) {
                const start = this.isCurrentWeek
                    ? dayjs.tz().startOf("isoWeek").format("YYYY-MM-DD")
                    : dayjs.tz().add(-1, "week").startOf("isoWeek").format("YYYY-MM-DD");
                const end = this.isCurrentWeek
                    ? dayjs.tz().endOf("isoWeek").format("YYYY-MM-DD")
                    : dayjs.tz().add(-1, "week").endOf("isoWeek").format("YYYY-MM-DD");
                const params = {
                    subtypes: "category,property,next_match",
                    start,
                    end,
                };
                getFurniture(params).then((res) => {
                    const list = res.data?.data || [];
                    if (list.some((item) => !item)) return;
                    this.currentFurniture = {
                        property: list.find((item) => item.subtype === "property")?.content || "",
                        category: list.find((item) => item.subtype === "category")?.content || "",
                    };
                    const nextContent = list.find((item) => item.subtype === "next_match")?.content || "";
                    const reg = nextContent.indexOf("：") > -1 ? /.*：/g : /.*:/g;
                    const nextArr = nextContent ? nextContent.replace(reg, "").split("\n") : [];
                    this.nextFurniture = {
                        property: nextArr[0] || "",
                        category: nextArr[1] || "",
                    };
                });
            }
        },
    },
    created() {
        this.loadDailyNew();
    },
    mounted() {
        this.getFurniture();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/gonggao/daily.less";
</style>
