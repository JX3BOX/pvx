<template>
    <div class="m-daily-activity">
        <div class="m-daily-content">
            <div class="m-daily-item" v-for="(item, i) in daily" :key="i">
                <div class="u-label">{{ item.type }}</div>
                <div class="u-value">{{ item.name }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { getDaily } from "@/service/pvg/gonggao";
import dayjs from "@/utils/day";
export default {
    name: "daily-activity",
    props: {
        date: {
            type: String,
            default: dayjs.tz().format("YYYY-MM-DD"),
        },
    },
    data() {
        return {
            daily: [],
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
        today: function () {
            return dayjs.tz(this.date).isToday();
        },
        isCurrentWeek() {
            let week = dayjs.tz(this.date).isoWeek();
            let currentWeek = dayjs.tz().isoWeek();

            return week === currentWeek;
        },
    },
    watch: {
        date: {
            immediate: true,
            handler() {
                this.client === "std" && this.loadDaily();
            },
        },
    },
    methods: {
        // =========== 数据获取==========
        // 获取每日活动
        loadDaily() {
            let date = dayjs.tz(this.date).format("YYYY-MM-DD");
            if (this.today) {
                const hour = dayjs.tz().hour();
                if (0 <= hour && hour < 7) {
                    date = dayjs.tz(date).subtract(1, "day").format("YYYY-MM-DD");
                }
            }
            getDaily({ date }).then((res) => {
                let list = res.data.data || [];
                this.daily = list.map((item) => {
                    return {
                        type: item.task_type,
                        zone: "全服",
                        name: item.activity_name,
                    };
                });
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pvg/calendar/daily.less";
</style>
