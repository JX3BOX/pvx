<template>
    <div class="m-daily">
        <PvxSurface class="m-daily-item is-notice" padding="medium" radius="medium">
            <header class="m-daily-item__header">
                <div class="m-daily-item__heading">
                    <span class="u-index">01</span>
                    <h2>{{ $t("pages.pvg.gonggao.ui.sections.notice") }}</h2>
                </div>
            </header>
            <SimpleNotice class="m-daily-content"></SimpleNotice>
        </PvxSurface>
        <PvxSurface class="m-daily-item is-server" padding="medium" radius="medium">
            <header class="m-daily-item__header">
                <div class="m-daily-item__heading">
                    <span class="u-index">02</span>
                    <h2>{{ $t("pages.pvg.gonggao.ui.sections.server") }}</h2>
                </div>
            </header>
            <SimpleServer class="m-daily-content"></SimpleServer>
        </PvxSurface>
        <template v-if="!isOrigin">
            <PvxSurface class="m-daily-item is-daily" padding="medium" radius="medium">
                <header class="m-daily-item__header">
                    <div class="m-daily-item__heading">
                        <span class="u-index">03</span>
                        <h2>{{ $t("pages.pvg.gonggao.ui.sections.homeland") }}</h2>
                    </div>
                </header>
                <SimpleDaily class="m-daily-content" :activities="activities"></SimpleDaily>
            </PvxSurface>
            <PvxSurface class="m-daily-item is-celebrity" padding="medium" radius="medium">
                <header class="m-daily-item__header">
                    <div class="m-daily-item__heading">
                        <span class="u-index">04</span>
                        <h2>{{ celebrityMap[currentCelebrity] }}</h2>
                    </div>
                    <el-dropdown trigger="click">
                        <button type="button" class="u-section-switch">
                            {{ $t("pages.pvg.gonggao.ui.switch") }}
                            <i class="el-icon-arrow-down el-icon--right"></i>
                        </button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="changeCelebrity(3)">{{ celebrityMap[3] }}</el-dropdown-item>
                                <el-dropdown-item @click="changeCelebrity(2)">{{ celebrityMap[2] }}</el-dropdown-item>
                                <el-dropdown-item @click="changeCelebrity(1)">{{ celebrityMap[1] }}</el-dropdown-item>
                                <el-dropdown-item @click="changeCelebrity(0)">{{ celebrityMap[0] }}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </header>
                <SimpleCelebrity :type="currentCelebrity" class="m-daily-content"></SimpleCelebrity>
            </PvxSurface>
            <!-- <div class="m-daily-item">
                <div class="u-title">武林通鉴</div>
                <SimpleWeek class="m-daily-content" :activities="activities"></SimpleWeek>
            </div> -->
            <!-- <div class="m-daily-item">
                <div class="u-title">家园</div>
                <SimpleReputation :activities="activities"></SimpleReputation>
                <SimpleFurniture :furniture="currentFurniture" :nextFurniture="nextFurniture"></SimpleFurniture>
            </div> -->
            <PvxSurface class="m-daily-item is-horse" padding="medium" radius="medium">
                <header class="m-daily-item__header">
                    <div class="m-daily-item__heading">
                        <span class="u-index">05</span>
                        <h2>{{ $t("pages.pvg.gonggao.ui.sections.horse") }}</h2>
                    </div>
                </header>
                <SimpleHorse class="m-daily-content"></SimpleHorse>
            </PvxSurface>
            <!-- 美人图模块暂不露出
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
            -->
        </template>
        <!-- <MrtDialog :visible="visible" :currentServer="currentServer" @close="visible = false"></MrtDialog> -->
    </div>
</template>

<script>
import dayjs from "@/utils/day";
import { getFurniture, getDailyFromOs } from "@/service/pvg/gonggao";
import SimpleNotice from "./daily/SimpleNotice.vue";
import SimpleServer from "./daily/SimpleServer.vue";
import SimpleDaily from "./daily/SimpleDaily.vue";
// import SimpleWeek from "./daily/SimpleWeek.vue";
import SimpleCelebrity from "./daily/SimpleCelebrity.vue";
// import SimpleReputation from "./daily/SimpleReputation.vue";
// import SimpleFurniture from "./daily/SimpleFurniture.vue";
import SimpleHorse from "./daily/SimpleHorse.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
// import SimpleMrt from "./daily/SimpleMrt.vue";
// import MrtDialog from "./daily/MrtDialog.vue";

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
        PvxSurface,
        // SimpleMrt,
        // MrtDialog,
    },
    data() {
        return {
            currentCelebrity: 3, // 楚天社0 云从社1 披风会 2
            currentFurniture: {},
            nextFurniture: {},
            activities: [], // 日常配置列表
            visible: false,
            currentServer: "",
        };
    },
    computed: {
        celebrityMap() {
            return {
                0: this.$t("pages.pvg.gonggao.ui.celebrities.chutian"),
                1: this.$t("pages.pvg.gonggao.ui.celebrities.yuncong"),
                2: this.$t("pages.pvg.gonggao.ui.celebrities.pifeng"),
                3: this.$t("pages.pvg.gonggao.ui.celebrities.qiongye"),
            };
        },
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
@import "~@/assets/css/pvg/gonggao/daily.less";
</style>
