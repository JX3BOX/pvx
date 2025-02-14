<template>
    <div class="m-simple-celebrity" v-loading="loading">
        <div class="m-celebrity-item" v-for="(item, i) in list" :key="i" :class="!i && 'current-item'">
            <div class="u-celebrity-title">
                <div>{{ i ? item.timeFormat : "当前" }}</div>
                <div class="u-celebrity-staged">
                    <img :src="`${iconPath}/minimap_${item.icon}.png`" />
                    <span>{{ item.stage }}</span>
                </div>
            </div>
            <div class="u-celebrity-desc">
                <div class="u-map">
                    <b>{{ item.map + " · " }}</b>
                    <span>
                        <template v-if="type === 1 && item.oldKey === 'y8'"> 特殊事件 · </template>{{ item.site }}
                    </span>
                </div>
                <div class="u-desc">
                    {{ getDesc(item.desc) }}
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { getCelebrities } from "@/service/gonggao/gonggao";
import dayjs from "@/utils/day";
import { sortBy } from "@/utils/index";
const JX3BOX = require("@jx3box/jx3box-common/data/jx3box.json");
export default {
    name: "SimpleCelebrity",
    props: {
        type: {
            type: Number,
            default: 1,
        },
    },
    data: function () {
        return {
            loading: false,
            list: [],
            showNum: 3,
            celebrityList: [],
            currentDate: {
                h: dayjs.tz().hour(),
                m: dayjs.tz().minute(),
            },
            iconPath: JX3BOX.__imgPath + "pve/minimap",
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        getDesc(desc) {
            if (!desc) return "";
            if (desc.indexOf("公共任务：") > -1) {
                return desc.split("公共任务：")[1];
            }
            return desc;
        },
        loadData: function () {
            this.loading = true;
            return getCelebrities({ type: this.type })
                .then((res) => {
                    const data = res.data?.data || [];
                    this.celebrityList = data.map((item) => {
                        item.icon = Number(item.icon);
                        item.time = Number(item.time);
                        return item;
                    });
                })
                .finally(() => {
                    this.getList(this.currentDate);
                    this.loading = false;
                })
                .catch(() => {
                    this.loading = false;
                });
        },
        toFormatTime(h, m) {
            if (h >= 24) {
                const day = Math.floor(h / 24);
                h = h - 24 * day;
            }
            const formatM = m.toString().padStart(2, "00");
            return `${h}:${formatM}`.padStart(5, "00:00");
        },
        // 处理楚天社
        getChu(date) {
            const currentKey = "c" + (date.h % 2 === 0 ? "0" : "1") + (date.m < 30 ? "0" : "1");
            const isEqualMinute = this.celebrityList.findIndex((item) => {
                return item.key === currentKey && item.time === date.m;
            });
            let index = 0;
            if (isEqualMinute !== -1) {
                // 包含当前时间
                index = isEqualMinute;
            } else {
                // 不包含
                const nIndex = this.celebrityList.findIndex((item) => {
                    return item.key === currentKey && item.time > date.m;
                });
                if (nIndex === -1) {
                    // 当前key中最后一个
                    index = this.celebrityList.findLastIndex((item) => {
                        return item.key === currentKey;
                    });
                } else {
                    index = nIndex - 1;
                }
            }
            // 13: 57
            let list = this.celebrityList.slice(index, index + this.showNum);
            let newList = [];
            if (list.length < this.showNum) {
                newList = list.concat(this.celebrityList.slice(0, this.showNum - list.length));
            } else {
                newList = [].concat(list);
            }
            this.list = newList.map((item) => {
                // 当前时间
                let h = this.currentDate.h;
                // "双数整点 c00 双数半点 c01 单数整点 c10 单数半点 c11" "烂柯山 晟江 百溪 楚州"
                // 烂柯山 晟江/烂柯山 晟江 不变
                // 晟江 百溪/晟江 百溪 加1
                // 百溪 楚州/百溪 楚州 不变
                // 楚州 烂柯山/楚州 烂柯山 加1
                if (currentKey === "c01" && item.key === "c10") {
                    h = h + 1;
                }
                if (currentKey === "c11" && item.key === "c00") {
                    h = h + 1;
                }
                item.h = h;
                item.timeFormat = this.toFormatTime(h, item.time);
                return item;
            });
        },
        // 处理云从社
        getYun(date) {
            // console.log(date.h + ":" + date.m);
            // 循环事件
            const circleList = this.celebrityList.filter((item) => item.key !== "y8");
            const currentKey = "y" + (date.h % 2 === 0 ? "0" : "1");
            const isEqualMinute = circleList.findIndex((item) => {
                return item.key === currentKey && item.time === date.m;
            });
            let index = 0;
            if (isEqualMinute !== -1) {
                // 包含当前时间
                index = isEqualMinute;
            } else {
                // 不包含
                const nIndex = circleList.findIndex((item) => {
                    return item.key === currentKey && item.time > date.m;
                });
                if (nIndex === -1) {
                    // 当前key中最后一个
                    index = circleList.findLastIndex((item) => {
                        return item.key === currentKey;
                    });
                } else {
                    index = nIndex - 1;
                }
            }

            let list = circleList.slice(index, index + this.showNum);
            let newList = [];
            if (list.length < this.showNum) {
                newList = list.concat(circleList.slice(0, this.showNum - list.length));
            } else {
                newList = [].concat(list);
            }
            const circleNumList = newList.map((item) => {
                // 当前时间
                let h = this.currentDate.h;
                if (currentKey !== item.key) {
                    h = h + 1;
                }
                item.h = h;
                item.m = item.time;
                item.timeFormat = this.toFormatTime(h, item.time);
                return item;
            });

            // 8小时cd事件
            const y8List = this.celebrityList.filter((item) => item.key === "y8");
            const y8FormatList = [];
            for (let i = 0; i < 24; i += 8) {
                y8List.forEach((item) => {
                    const h = item.hour + i < 24 ? item.hour + i : item.hour + i - 24;
                    const timeFormat = `${h.toString().padStart(2, "00")}:${item.time}`;
                    y8FormatList.push({
                        ...item,
                        id: item.id + "" + item.hour + i,
                        timeFormat: timeFormat,
                        hour: h,
                        h: h,
                        m: item.time,
                        oldKey: item.key,
                        key: "y" + (h % 2 === 0 ? "0" : "1"),
                    });
                });
            }
            const y8FilterList = y8FormatList.filter((item) => {
                const num = item.h * 60 + item.m;
                const firstNum = circleNumList[0].h * 60 + circleNumList[0].m;
                const lastNum =
                    circleNumList[circleNumList.length - 1].h * 60 + circleNumList[circleNumList.length - 1].m;
                return num >= firstNum && num <= lastNum;
            });
            let combineList = [];
            if (y8FilterList.length) {
                combineList = circleNumList.concat(y8FilterList).sort(sortBy("h", "time"));
                if (combineList[0].h * 60 + combineList[0].m < date.h * 60 + date.m) {
                    combineList.splice(0, 1);
                }
            } else {
                combineList = circleNumList;
            }

            this.list = combineList.slice(0, this.showNum);
        },
        // 处理披风会
        getPi(date) {
            // 3小时循环事件
            // 当前时间
            const currentH = date.h % 3;
            const preH = currentH === 0 ? 2 : currentH - 1;
            const nextH = currentH === 2 ? 0 : currentH + 1;

            const circleList = this.celebrityList.filter((item) => item.key === "p3" && Number(item.hour) === currentH);
            const preList = this.celebrityList.filter((item) => item.key === "p3" && Number(item.hour) === preH);
            const nextList = this.celebrityList.filter((item) => item.key === "p3" && Number(item.hour) === nextH);

            let index = -1;
            index = circleList.findIndex((item) => {
                return item.time === date.m;
            });
            if (index === -1) {
                index = circleList.findIndex((item) => {
                    return item.time > date.m;
                });
                if (index > 0) {
                    index = index - 1;
                } else if (index === -1 && date.m > circleList[circleList.length - 1].time) {
                    index = circleList.length - 1;
                }
            }
            // 当前小时的第一项， 且当前时间大于当前项的时间时取上一小时的最后一项
            let list =
                index === 0 && circleList[0].time > date.m
                    ? [preList[preList.length - 1]].concat(circleList.slice(0, this.showNum - 1))
                    : circleList.slice(index, index + this.showNum);
            let newList = [];
            if (list.length < this.showNum) {
                newList = list.concat(nextList.slice(0, this.showNum - list.length));
            } else {
                newList = [].concat(list);
            }
            const circleNumList = newList.map((item) => {
                // 当前时间
                let h = this.currentDate.h;
                if (Number(item.hour) === preH) {
                    h = h - 1;
                }
                if (Number(item.hour) === nextH) {
                    h = h + 1;
                }
                item.m = item.time;
                item.timeFormat = this.toFormatTime(h, item.time);
                return item;
            });
            this.list = circleNumList;
        },
        getList(date) {
            if (this.type === 0) {
                this.getChu(date);
            } else if (this.type === 1) {
                this.getYun(date);
            } else {
                this.getPi(date);
            }
        },
    },
    watch: {
        currentDate: {
            immediate: true,
            deep: true,
            handler(date) {
                if (this.list.length) {
                    this.getList(date);
                }
            },
        },
        type() {
            this.loadData();
        },
    },
    created() {
        this.loadData();
    },
    mounted() {
        setInterval(() => {
            if (this.currentDate.h !== dayjs.tz().hour() || this.currentDate.m !== dayjs.tz().minute()) {
                this.currentDate = {
                    h: dayjs.tz().hour(),
                    m: dayjs.tz().minute(),
                };
            }
        }, 1000);
    },
};
</script>
