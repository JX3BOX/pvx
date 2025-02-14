<template>
    <div class="m-simple-daily">
        <!-- <div class="m-daily-wrap">
            <div class="m-simple-daily-item" :class="item.isDone && 'is-done'" v-for="item in daily" :key="item.name">
                <div class="u-name">
                    <span>{{ item.name }}</span>
                </div>
                <div class="u-desc">{{ item.val }}</div>
            </div>
            <el-tooltip effect="dark" :content="(meirentu && meirentu.desc) || '无'" placement="top">
                <div class="m-simple-daily-item">
                    <div class="u-name">
                        <span>美人图</span>
                        <span class="u-week">{{ week }}</span>
                    </div>
                    <span class="u-desc">{{ (meirentu && meirentu.name) || "今日暂无画像" }}</span>
                </div>
            </el-tooltip>
        </div> -->
        <Reputation></Reputation>
        <SimplePet></SimplePet>
    </div>
</template>

<script>
// import { getMeirentu } from "@/service/gonggao/gonggao";
import dayjs from "@/utils/day";
// import dailyKeys from "@/assets/data/daily_keys.json";
import SimplePet from "./SimplePet";
import Reputation from "./Reputation";
export default {
    name: "SimpleDaily",
    components: {
        SimplePet,
        Reputation,
    },
    props: {
        activities: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            // meirentu: {},
        };
    },
    computed: {
        date() {
            // 当7点以前，请求前面一天的日常 当7~24点，请求当天的日常
            const hour = dayjs.tz().get("hours");
            return 0 <= hour && hour < 7
                ? dayjs.tz().subtract(1, "day").format("YYYY-MM-DD")
                : dayjs.tz().format("YYYY-MM-DD");
        },
        client() {
            return this.$store.state.client;
        },
        isCurrentWeek() {
            let week = dayjs.tz(this.date).isoWeek();
            let currentWeek = dayjs.tz().isoWeek();
            return week === currentWeek;
        },
        server() {
            return this.$store.state.server;
        },
        week() {
            var datas = dayjs.tz(this.meirentu?.date || new Date()).day();
            var week = ["日", "一", "二", "三", "四", "五", "六"];
            return "周" + week[datas];
        },
        daily() {
            const keys = dailyKeys.filter((item) => item.type === 1).map((item) => item.key);
            return this.activities.filter((item) => keys.includes(item.key) && item.val && item.key !== "swrc");
        },
    },
    watch: {
        // server: {
        //     handler(val) {
        //         val && this.loadMeirentu();
        //     },
        // },
    },
    methods: {
        // // 获取美人图
        // loadMeirentu() {
        //     getMeirentu(this.server).then((res) => {
        //         this.meirentu = res.data?.data || {};
        //     });
        // },
    },
    mounted() {
        // this.loadMeirentu();
    },
};
</script>
