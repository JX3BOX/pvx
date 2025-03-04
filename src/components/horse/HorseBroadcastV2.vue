<template>
    <div class="m-horse-broadcast">
        <div class="m-horse-broadcast__header">
            <div class="u-title">抓马播报</div>
            <el-select class="u-select" v-model="server" placeholder="请选择服务器" size="mini">
                <el-option v-for="serve in servers" :key="serve" :label="serve" :value="serve"></el-option>
            </el-select>
        </div>
        <div class="m-horse-broadcast__list" v-if="listData.length && listData[active].map_id">
            <jx3box-map
                v-if="listData[active].map_id"
                class="u-horse-map"
                :mapId="Number(listData[active].map_id)"
                :key="listData[active].map_id"
                :overview="false"
                :datas="(listData[active].mapDatas && listData[active].mapDatas[listData[active].map_id]) || []"
            ></jx3box-map>
            <div class="m-list">
                <div class="m-item" v-for="(item, index) in listData" :key="index">
                    <div
                        class="m-horse"
                        @click="changeHorse(item, index)"
                        v-if="!item.is_chitu"
                        :class="{ active: active === index }"
                    >
                        <div
                            class="u-col u-times"
                            :class="item.subtype === 'foreshow' && 'u-times-lately'"
                            v-if="item.fromTime"
                        >
                            <span>{{ item.fromTime }}</span>
                            <span> ~ </span>
                            <span>{{ item.toTime }}</span>
                        </div>
                        <span class="u-col u-name">{{ item.map_name }}</span>
                        <div class="u-col" v-if="item.horses && item.horses.length">
                            <div class="u-horse" v-for="horse in horseList(item)" :key="horse" @click="go(horse)">
                                <el-tooltip class="item" effect="dark" :content="horse" placement="top">
                                    <el-image :src="getImgSrc(horse)" class="u-image">
                                        <div slot="error" class="image-slot">
                                            <img :src="getImgSrc(horse, true)" @error="replaceByDefault" />
                                        </div>
                                    </el-image>
                                </el-tooltip>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="diluHasExist" class="m-horse is-dilu">
                    <div class="u-col u-times">
                        <div>本周的卢已刷新</div>
                        <div>{{ diluExistData.time }}</div>
                    </div>
                    <span class="u-col u-name">{{ diluExistData.map_name }}</span>
                    <div class="u-col u-horse">
                        <el-image :src="getImgSrc('的卢')" class="item"></el-image>
                    </div>
                </div>
                <span v-else class="m-horse no-horse">本周的卢尚未刷新</span>
                <div v-if="hasExist" class="m-horse is-chitu">
                    <div class="u-col u-times">
                        <div>本CD赤兔已刷新</div>
                        <div>{{ existData.time }}</div>
                    </div>
                    <span class="u-col u-name">{{ existData.map_name }}</span>
                    <div class="u-col u-horse">
                        <el-image :src="getImgSrc('赤兔')" class="item"></el-image>
                    </div>
                </div>
                <span v-else class="m-horse no-horse">本CD赤兔尚未刷新</span>
            </div>
        </div>

        <div v-else class="w-no-data">{{ server }} 暂无播报</div>
    </div>
</template>

<script>
import Jx3boxMap from "@jx3box/jx3box-map/src/components/Map.vue";
import User from "@jx3box/jx3box-common/js/user";
import servers_std from "@jx3box/jx3box-data/data/server/server_std.json";
import servers_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import horseSites from "@/assets/data/horse_sites.json";
import horseBroadcast from "@/assets/data/horse_broadcast.json";
import { getGameReporter, getUserInfo, getHorseReporter } from "@/service/horse";
import dayjs from "@/plugins/day";
export default {
    name: "HorseBroadcast",
    components: { Jx3boxMap },
    inject: ["__imgRoot2"],
    data() {
        return {
            list: [],
            timer: null,
            server: "",

            chituMap: {
                方问: 411,
                小赤: 216,
                杨新: 411,
            },
            // 本cd是否刷新
            hasExist: false,
            existData: {},
            chituTip: `
                <p>CD: 周二7点 ~ 下周一7点。</p>
                <p>地图: 黑戈壁、阴山大草原、鲲鹏岛。</p>
                <p>必备: <卦文龟甲>交大战时有几率获得，赤兔刷新后再到信使处领取，有效期7天。</p>
            `,
            chituLoading: false,
            active: 0,

            diluHasExist: false,
            diluExistData: {},
        };
    },
    computed: {
        params() {
            return {
                pageIndex: 1,
                pageSize: 50,
                type: "horse",
                server: this.server,
                // subtype: "", // foreshow,npc_chat
                // start: dayjs.tz(new Date().valueOf() - 15 * 60 * 1000).format("YYYYMMDDHHmm"),
                // end: dayjs.tz(new Date()).format("YYYYMMDDHHmm"),
            };
        },
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
        listData() {
            let column = Math.floor((document.body.clientWidth - 460) / 350);
            column = column > 2 ? 2 : column;
            let list = this.list || [];
            const arr = this.isPhone ? [] : new Array(column * 4 - 2 - list.length).fill({});
            list = list.sort((a, b) => this.convertTime(a.fromTime) - this.convertTime(b.fromTime));
            return list.concat(arr) || [];
        },
        isPhone() {
            return document.documentElement.clientWidth <= 820;
        },
        isAsia() {
            // 是否是东八区
            const _timezone = this.$store.state.timezone;
            return _timezone === "Asia/Shanghai";
        },
    },
    watch: {
        server() {
            this.list = []; // 需要置空后重新计算cross的scrollWidth
            this.existData = {};
            this.getGameReporter();
            this.loadChituData();
            this.loadDiluData();
        },
    },
    methods: {
        loadDiluData() {
            // 每周一、三、五、六、日 10：00-24：00期间随机开启
            // 开启前60分钟及开启时均有系统公告提醒
            // 同服务器每周只开启一次
            // 【的卢】随机刷新于某一野外场景
            const server = this.server;
            const type = "dilu-horse";
            this.chituLoading = true;
            getHorseReporter(type, server)
                .then((res) => {
                    const list = res.data?.data?.list || [];
                    if (!list.length) {
                        return;
                    }
                    // 最近刷新时间 返回的时间已经是东八区时间，其余对比时间同样需要换算到东八区时间
                    let created_at = dayjs(list?.[0].created_at || dayjs.tz());
                    if (!this.isAsia) {
                        created_at = dayjs.tz(list?.[0].created_at || dayjs.tz());
                    }
                    const now = dayjs.tz();
                    const now_day = now.day();
                    let cd_from_time = now.day(1).hour(10).minute(0).second(0).millisecond(0);
                    let cd_to_time = cd_from_time.add(1, "week").add(-10, "hour").add(-1, "millisecond");
                    if (now_day < 1) {
                        // 周日为0 / 为上一个CD
                        cd_from_time = dayjs.tz(cd_from_time).add(-1, "week");
                        cd_to_time = dayjs.tz(cd_to_time).add(-1, "week");
                    }
                    // 最近刷新时间是否在当前CD中
                    const isBetween = created_at.isBetween(cd_from_time, cd_to_time);
                    this.diluHasExist = isBetween;
                    if (isBetween) {
                        const content = list?.[0]?.content || "";
                        const mapName = content.match(/的卢已经出现在(\S*)中/)
                            ? content.match(/的卢已经出现在(\S*)中/)[1]
                            : "";
                        this.diluExistData = {
                            map_name: mapName,
                            time: created_at.format("YYYY-MM-DD HH:mm:ss"),
                            is_dilu: true,
                        };
                    }
                })
                .finally(() => {
                    this.chituLoading = false;
                });
        },
        loadChituData() {
            const server = this.server;
            const type = "chitu-horse";
            // 周二7点到下周一7点为一个CD， 7天内随机刷一只，地图为黑戈壁、阴山大草原、鲲鹏岛
            this.chituLoading = true;
            getHorseReporter(type, server)
                .then((res) => {
                    const list = res.data?.data?.list || [];
                    const content = list?.[0]?.content || "";
                    const npc = /\]\[(.*)\]大声喊/.exec(content)[1].trim() || "";
                    const defaultMapId = 216;
                    const map_id = this.chituMap?.[npc] || defaultMapId;
                    const mapInfo = horseSites[map_id];
                    let result = {};
                    const coor = mapInfo.coordinates[0];
                    const horses = ["赤兔·飞虹"];
                    const map_name = mapInfo.mapName;
                    result[map_id] = [
                        {
                            content: `${horses.join()}
                    <br />坐标：(${coor.x},${coor.y},${coor.z})`,
                            ...coor,
                        },
                    ];
                    // 最近刷新时间 返回的时间已经是东八区时间，其余对比时间同样需要换算到东八区时间
                    let created_at = dayjs(list?.[0].created_at || dayjs.tz());
                    if (!this.isAsia) {
                        created_at = dayjs.tz(list?.[0].created_at || dayjs.tz());
                    }
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
                    const isBetween = created_at.isBetween(cd_from_time, cd_to_time);
                    this.hasExist = isBetween;
                    const data = {
                        horses: horses,
                        map_name: map_name,
                        map_id: map_id + "",
                        mapDatas: result,
                        is_chitu: true,
                        time: "",
                    };
                    if (isBetween) {
                        data.time = created_at.format("YYYY-MM-DD HH:mm:ss");
                    }
                    this.existData = data;
                })
                .finally(() => {
                    this.chituLoading = false;
                });
        },
        replaceByDefault(e) {
            e.target.src = require("../../assets/img/horse_item_bg_sm.jpg");
        },
        go(horseName) {
            const itemId = horseBroadcast[horseName]?.itemId || 0;
            // 2 马具 1 坐骑
            const type = 1;
            this.$router.push({ path: `${itemId}`, query: { type } });
        },
        getImgSrc(horseName, isAuto = false) {
            // const client = this.client
            const client = isAuto ? this.client : "std"; // 怀旧服的坐骑图片取正式服的, 没有再根据client获取
            const id = horseBroadcast[horseName]?.id || 0;
            return this.__imgRoot2 + `${client}/` + id + ".png";
        },
        getOriginDatas(item) {
            let mapId = "";
            let mapName = "";
            let coordinates = [];
            let result = {};
            let horses = [];
            if (item.type === "horse") {
                if (item.subtype === "npc_chat") {
                    // 预测
                    mapId = item.map_id;
                    mapName = item.map_name;
                    coordinates = horseSites[mapId].coordinates;
                    horses = horseSites[mapId].horses[item.horseIndex];
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
                const coor = coordinates[0];
                result[mapId] = [
                    {
                        content: `${horses.join()}
                    <br />坐标：(${coor.x},${coor.y},${coor.z})`,
                        ...coor,
                    },
                ];
            } else {
                // 特殊马
                const { type, content } = item;
                if (type === "chitu-horse") {
                    horses = ["赤兔·飞虹"];
                    const npc = /\]\[(.*)\]大声喊/.exec(content)[1].trim();
                    mapName = this.chituMap[npc] || "";
                    mapId = this.chituMap?.[npc] || defaultMapId;
                    const mapInfo = horseSites[mapId];
                    const coor = mapInfo.coordinates[0];
                    const horses = ["赤兔·飞虹"];
                    result[mapId] = [
                        {
                            content: `${horses.join()}
                    <br />坐标：(${coor.x},${coor.y},${coor.z})`,
                            ...coor,
                        },
                    ];
                } else {
                    horses = ["的卢"];
                    mapName = content.match(/的卢已经出现在(\S*)中/) ? content.match(/的卢已经出现在(\S*)中/)[1] : "";
                }
            }
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

                // 赤兔 的卢 播报 只取一条
                const chitulList = list
                    .filter((item) => {
                        return (
                            item.type === "chitu-horse" &&
                            (new Date().valueOf() - new Date(item.created_at).valueOf()) / 1000 / 60 <= 15
                        );
                    })
                    .slice(0, 1);
                const diluList = list
                    .filter((item) => {
                        return (
                            item.type === "dilu-horse" &&
                            (new Date().valueOf() - new Date(item.created_at).valueOf()) / 1000 / 60 <= 15
                        );
                    })
                    .slice(0, 1);

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
                            }
                        }
                    });
                });
                const newList = newThreeList.concat(chitulList, diluList, bList);
                this.list = newList.map((item) => {
                    let fromTime = "";
                    let toTime = "";
                    if (!!("minute" in item)) {
                        if (!this.isAsia) {
                            fromTime = dayjs
                                .tz(new Date(item.created_at).valueOf() + (item.minute + 5) * 60 * 1000)
                                .format("HH:mm");
                            toTime = dayjs
                                .tz(new Date(item.created_at).valueOf() + (item.minute + 10) * 60 * 1000)
                                .format("HH:mm");
                        } else {
                            fromTime = dayjs(
                                new Date(item.created_at).valueOf() + (item.minute + 5) * 60 * 1000
                            ).format("HH:mm");
                            toTime = dayjs(new Date(item.created_at).valueOf() + (item.minute + 10) * 60 * 1000).format(
                                "HH:mm"
                            );
                        }
                    } else {
                        if (!this.isAsia) {
                            fromTime = dayjs.tz(new Date(item.created_at).valueOf() + 5 * 60 * 1000).format("HH:mm");
                            toTime = dayjs.tz(new Date(item.created_at).valueOf() + 10 * 60 * 1000).format("HH:mm");
                        } else {
                            fromTime = dayjs(new Date(item.created_at).valueOf() + 5 * 60 * 1000).format("HH:mm");
                            toTime = dayjs(new Date(item.created_at).valueOf() + 10 * 60 * 1000).format("HH:mm");
                        }
                    }
                    return {
                        ...item,
                        ...this.getOriginDatas(item),
                        fromTime: fromTime,
                        toTime: toTime,
                    };
                });
            });
        },
        convertTime(time) {
            const [hour, minute] = time.split(":").map(Number);
            return hour * 60 + minute;
        },
        horseList(item) {
            return this.isPhone ? item.horses : item.horses.slice(0, 3);
        },
        changeHorse(item, index) {
            if (!item.map_id) return;
            this.active = index;
        },
    },
    mounted() {
        if (User.isLogin()) {
            getUserInfo().then((res) => {
                this.server = res.data?.data?.jx3_server || "梦江南";
            });
        } else {
            this.server = "梦江南";
        }

        // 不断获取播放
        this.timer = setInterval(() => {
            this.getGameReporter();
        }, 30 * 1000);
    },
    beforeDestroy() {
        // 清除定时器
        clearInterval(this.timer);
        this.timer = null;
    },
};
</script>

<style lang="less">
@import "~@/assets/css/horse/broadcast.less";
</style>
