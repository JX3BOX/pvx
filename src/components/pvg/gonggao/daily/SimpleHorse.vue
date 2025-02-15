<template>
    <div class="m-simple-horse">
        <div class="u-switch" v-if="list.length > remainNum" @click="switchList">切换</div>
        <template v-if="list.length <= 2 || listIndex === 0">
            <template v-if="defaultList.length">
                <div class="u-item" v-for="(item, d) in defaultList" :key="item.id + d">
                    <div class="u-name">马场</div>
                    <div class="u-info">
                        <div class="u-map-name">{{ item.map_name }}</div>
                        <div
                            v-if="item.horses && item.horses.length"
                            class="u-times"
                            :class="item.subtype === 'foreshow' && 'u-times-lately'"
                        >
                            <span>{{ item.fromTime }}</span>
                            <span> ~ </span>
                            <span>{{ item.toTime }}</span>
                        </div>
                        <div v-else class="u-no">暂无信息</div>
                        <div class="u-img-list">
                            <a
                                v-for="horse in item.horses"
                                :key="horse"
                                class="u-horse-name"
                                :href="getLink(horse)"
                                target="_blank"
                            >
                                <el-tooltip class="item" effect="dark" :content="horse" placement="top">
                                    <el-image :src="getImgSrc(horse)" class="u-image">
                                        <div slot="error" class="image-slot">
                                            <img :src="getImgSrc(horse, true)" @error="replaceByDefault" />
                                        </div>
                                    </el-image>
                                </el-tooltip>
                            </a>
                        </div>
                    </div>
                </div>
            </template>
            <div class="u-item" key="chitu">
                <div class="u-name">赤兔</div>
                <div class="u-info u-chitu-info">
                    <template v-if="hasExist">
                        <div class="u-map-name">
                            {{ existData.map }}
                            <i
                                class="u-times-lately"
                                :class="chituLoading ? 'el-icon-loading' : 'el-icon-refresh'"
                                @click="loadChituData"
                            ></i>
                        </div>
                        <div class="u-times-chitu">
                            {{ existData.time }}
                        </div>
                    </template>
                    <span v-else class="u-times-chitu"
                        >本CD尚未刷新
                        <i
                            class="u-times-lately"
                            :class="chituLoading ? 'el-icon-loading' : 'el-icon-refresh'"
                            @click="loadChituData"
                        ></i
                    ></span>
                    <div class="u-horse-name-wrap">
                        <a class="u-horse-name" :href="getLink('赤兔·飞虹')" target="_blank">
                            <el-image :src="getImgSrc('赤兔·飞虹')" class="u-image" fit="cover"></el-image>
                        </a>
                    </div>
                </div>
            </div>
            <template v-if="list.length">
                <div class="u-item" v-for="(item, l) in list.slice(0, remainNum)" :key="item.id + l">
                    <div class="u-name">播报</div>
                    <div class="u-info">
                        <div class="u-map-name">{{ item.map_name }}</div>
                        <div class="u-times" :class="item.subtype === 'foreshow' && 'u-times-lately'">
                            <span>{{ item.fromTime }}</span>
                            <span> ~ </span>
                            <span>{{ item.toTime }}</span>
                        </div>
                        <div class="u-img-list">
                            <a
                                v-for="horse in item.horses"
                                :key="horse"
                                class="u-horse-name"
                                :href="getLink(horse)"
                                target="_blank"
                            >
                                <el-tooltip class="item" effect="dark" :content="horse" placement="top">
                                    <el-image :src="getImgSrc(horse)" class="u-image">
                                        <div slot="error" class="image-slot">
                                            <img :src="getImgSrc(horse, true)" @error="replaceByDefault" />
                                        </div>
                                    </el-image>
                                </el-tooltip>
                            </a>
                        </div>
                    </div>
                </div>
            </template>
        </template>
        <template v-else>
            <div class="u-item" v-for="(item, index) in list.slice(remainNum, list.length)" :key="item.id + index">
                <div class="u-name">播报</div>
                <div class="u-info">
                    <div class="u-map-name">{{ item.map_name }}</div>
                    <div class="u-times" :class="item.subtype === 'foreshow' && 'u-times-lately'">
                        <span>{{ item.fromTime }}</span>
                        <span> ~ </span>
                        <span>{{ item.toTime }}</span>
                    </div>
                    <div class="u-img-list">
                        <a
                            v-for="horse in item.horses"
                            :key="horse"
                            class="u-horse-name"
                            :href="getLink(horse)"
                            target="_blank"
                        >
                            <el-tooltip class="item" effect="dark" :content="horse" placement="top">
                                <el-image :src="getImgSrc(horse)" class="u-image">
                                    <div slot="error" class="image-slot">
                                        <img :src="getImgSrc(horse, true)" @error="replaceByDefault" />
                                    </div>
                                </el-image>
                            </el-tooltip>
                        </a>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import servers_std from "@jx3box/jx3box-data/data/server/server_std.json";
import servers_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import horseSites from "@/assets/data/horse_sites.json";
import horseBroadcast from "@/assets/data/horse_broadcast.json";
import { getGameReporter, getChituHorse } from "@/service/pvg/gonggao";
import dayjs from "@/utils/day";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    name: "WorldHorse",
    data() {
        return {
            noList: [],
            list: [],
            // 固定三大马场
            defaultList: [],
            params: {
                pageIndex: 1,
                pageSize: 50,
                server: "",
                type: "horse",
            },
            timer: null,
            chituMap: {
                方问: "鲲鹏岛",
                小赤: "阴山大草原",
                杨新: "黑戈壁",
            },
            // 本cd是否刷新
            hasExist: false,
            existData: {
                map: "",
                time: "",
            },
            chituLoading: false,
            listIndex: 0,
            remainNum: 2, // 第一页还能展示几个播报
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
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
        defaultKeys() {
            return Object.values(this.chituMap);
        },
    },
    watch: {
        server: {
            immediate: true,
            handler(server) {
                if (server) {
                    this.params.server = server;
                    this.getGameReporter();
                    this.loadChituData();
                }
            },
        },
    },
    methods: {
        switchList() {
            this.listIndex = ~~!this.listIndex;
        },
        loadChituData() {
            const server = this.server;
            // 周二7点到下周一7点为一个CD， 7天内随机刷一只，地图为黑戈壁、阴山大草原、鲲鹏岛
            this.chituLoading = true;
            getChituHorse(server)
                .then((res) => {
                    const list = res.data?.data?.list || [];
                    if (!list.length) {
                        return;
                    }

                    // 最近刷新时间
                    const created_at = dayjs.tz(list?.[0].created_at || dayjs.tz());
                    const now = dayjs.tz();
                    const now_day = now.day();
                    const now_hour = now.hour();
                    let cd_from_time = now.day(2).hour(7).minute(0).second(0).millisecond(0);
                    let cd_to_time = cd_from_time.add(1, "week").add(-1, "millisecond");
                    if (now_day <= 1 || (now_day === 2 && now_hour < 7)) {
                        // 周日为0、周一到周二7点之前的CD为上一个CD
                        cd_from_time = dayjs.tz(cd_from_time).add(-1, "week");
                        cd_to_time = dayjs.tz(cd_to_time).add(-1, "week");
                    }
                    // 最近刷新时间是否在当前CD中
                    const isBetween = dayjs.tz(created_at).isBetween(cd_from_time, cd_to_time);

                    this.hasExist = isBetween;
                    if (isBetween) {
                        const content = list?.[0]?.content || "";
                        const npc = /\]\[(.*)\]大声喊/.exec(content)[1].trim();
                        this.existData = {
                            map: this.chituMap[npc] || "",
                            time: dayjs.tz(created_at).format("YYYY-MM-DD HH:mm:ss"),
                        };
                    }
                })
                .finally(() => {
                    this.chituLoading = false;
                });
        },
        replaceByDefault(e) {
            e.target.src = require("@/assets/img/horse_item_bg_sm.jpg");
        },
        getLink(horseName) {
            const itemId = horseBroadcast[horseName]?.itemId || 0;
            // 2 马具 1 坐骑
            const type = 1;
            return `/horse/${itemId}?type=${type}`;
        },
        getImgSrc(horseName, isAuto = false) {
            const client = isAuto ? this.client : "std"; // 怀旧服的坐骑图片取正式服的, 没有再根据client获取
            const id = horseBroadcast[horseName]?.id || 0;
            return __imgPath + `horse/${client}/` + id + ".png";
        },
        getOriginDatas(item) {
            let mapId = "";
            let mapName = "";
            let coordinates = [];
            let result = {};
            let horses = [];
            if (item.subtype === "npc_chat") {
                // 预测
                mapId = String(item.map_id);
                mapName = item.map_name;
                coordinates = item.horseIndex !== -1 ? horseSites[mapId].coordinates : [];
                horses = item.horseIndex !== -1 ? horseSites[mapId].horses[item.horseIndex] : [];
            } else {
                // 播报
                mapName = item.content.match(/在(\S*)出没/) ? item.content.match(/在(\S*)出没/)[1] : "";
                for (let key in horseSites) {
                    if (horseSites[key].mapName === mapName) {
                        mapId = key;
                        coordinates = horseSites[key].coordinates;
                        horses = horseSites[mapId].horses.flat();
                    }
                }
            }
            const coor = coordinates?.[0];
            result[mapId] = coor
                ? [
                      {
                          content: `${horses.join()}
                    <br />坐标：(${coor.x},${coor.y},${coor.z})`,
                          ...coor,
                      },
                  ]
                : [];
            const obj = {
                mapDatas: result,
                map_id: mapId,
                map_name: mapName,
                horses: horses,
            };
            return obj;
        },
        getGameReporter() {
            const params = this.params;
            getGameReporter(params).then((res) => {
                const data = res?.data?.data;
                const list = data?.list || [];
                // 三大马场只各取一条
                const myMap = new Map();
                const threeList = list.filter(
                    (item) => item.map_id && !myMap.has(item.map_id) && myMap.set(item.map_id, 1)
                );
                // 播报列表, 且取上报时间距离现在在15分钟之内的
                const bList = list.filter(
                    (item) =>
                        !item.map_id && (new Date().valueOf() - new Date(item.created_at).valueOf()) / 1000 / 60 <= 15
                );
                const newThreeList = [];
                threeList.forEach((item) => {
                    // 三大马场拆分成四条
                    item.content.split("\n\n").forEach((content, index) => {
                        if (content && (content.match(/还有(\S*)分钟/) || content.match("即将出世"))) {
                            // 还有多少分钟
                            const minute = content.match(/还有(\S*)分钟/)
                                ? Number(content.match(/还有(\S*)分钟/)[1])
                                : 0;
                            // 如果上报时间+出现时间+15分钟在当前时间之前则过滤掉
                            const bol =
                                new Date(item.created_at).valueOf() + (minute + 15) * 60 * 1000 >= new Date().valueOf();
                            if (bol) {
                                newThreeList.push({
                                    ...item,
                                    id: index ? Number(index + item.id.toString()) : item.id,
                                    content: content,
                                    minute: minute,
                                    horseIndex: index,
                                });
                            } else {
                                newThreeList.push({
                                    map_name: item.map_name,
                                    id: index ? Number(index + item.id.toString()) : item.id,
                                    subtype: item.subtype,
                                    map_id: item.map_id,
                                    horseIndex: -1, // 没有马驹
                                });
                            }
                        }
                    });
                });
                const newList = newThreeList.concat(bList);
                const allList = newList
                    .map((item) => {
                        let fromTime = "";
                        let toTime = "";
                        if (!!("minute" in item)) {
                            fromTime = dayjs
                                .tz(new Date(item.created_at).valueOf() + (item.minute + 5) * 60 * 1000)
                                .format("HH:mm");
                            toTime = dayjs
                                .tz(new Date(item.created_at).valueOf() + (item.minute + 10) * 60 * 1000)
                                .format("HH:mm");
                        } else {
                            fromTime = dayjs.tz(new Date(item.created_at).valueOf() + 5 * 60 * 1000).format("HH:mm");
                            toTime = dayjs.tz(new Date(item.created_at).valueOf() + 10 * 60 * 1000).format("HH:mm");
                        }
                        return {
                            ...item,
                            ...this.getOriginDatas(item),
                            fromTime: fromTime,
                            toTime: toTime,
                        };
                    })
                    .sort(function (a, b) {
                        return dayjs.tz(b.created_at).valueOf() - dayjs.tz(a.created_at).valueOf();
                    });
                this.list = allList.filter(
                    (item) => item.subtype !== "npc_chat" && !this.defaultKeys.includes(item.map_name)
                );
                this.defaultList = this.defaultKeys.map((name) => {
                    const item = allList.find((item) => item.map_name === name) || {
                        map_name: name,
                        id: name,
                        horses: [],
                    };
                    return item;
                });
            });
        },
    },
    mounted() {
        this.timer = setInterval(() => {
            this.getGameReporter();
        }, 30 * 1000);
    },
    beforeDestroy() {
        clearInterval(this.timer);
        this.timer = null;
    },
};
</script>
