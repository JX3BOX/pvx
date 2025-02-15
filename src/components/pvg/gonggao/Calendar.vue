<template>
    <div class="v-calendar m-calendar">
        <main class="m-calendar-main" :class="getSloganMeta('style')" :style="topStyle">
            <div class="m-calendar-header">
                <div class="u-time">
                    <!-- 年份切换 -->
                    <section class="m-calendar-year">
                        <el-button
                            icon="el-icon-arrow-left"
                            size="medium"
                            :disabled="prevDisabled"
                            @click="toggleYear('prev')"
                            class="u-btn"
                            title="上一年"
                        ></el-button>
                        <span class="u-year" :style="{ color: getSloganMeta('color') }">{{ current.year }}</span>
                        <el-button
                            icon="el-icon-arrow-right"
                            size="medium"
                            :disabled="nextDisabled"
                            @click="toggleYear('next')"
                            class="u-btn"
                            title="下一年"
                        ></el-button>
                        <!-- 月份切换 -->
                        <el-button
                            icon="el-icon-arrow-left"
                            size="medium"
                            :disabled="prevDisabled"
                            @click="toggleMonth('prev')"
                            class="u-btn"
                            title="上一月"
                        ></el-button>
                        <span class="u-year u-month-text" :style="{ color: getSloganMeta('color') }">{{
                            current.month
                        }}</span>
                        <el-button
                            icon="el-icon-arrow-right"
                            size="medium"
                            :disabled="nextDisabled"
                            @click="toggleMonth('next')"
                            class="u-btn"
                            title="下一月"
                        ></el-button>
                    </section>
                    <!-- <span class="u-contribute" @click="rank_show = true"><i class="el-icon-s-data"></i>剑三日历贡献排行榜</span> -->
                </div>
                <!-- 中央海报 -->
                <div class="u-slogan m-calendar-slogan">
                    <a :href="getSloganMeta('url')" target="_blank" :title="getSloganMeta('title')"
                        ><img :src="resolveImagePath(getSloganMeta('banner'))"
                    /></a>
                </div>
            </div>
            <section class="m-calendar-content">
                <!-- <section class="m-calendar-week">
                    <div class="u-week" v-for="week in weeks" :key="week">
                        <span>{{ week }}</span>
                    </div>
                </section> -->
                <section class="m-calendar-date">
                    <div
                        v-for="(item, index) in dataArr"
                        class="u-date"
                        @click.prevent="dateClick(item)"
                        :class="[
                            { 'u-other': ['pre', 'next'].includes(item.type) },
                            { 'u-today': isToday(item) },
                            { 'u-current': isCurrent(item) },
                        ]"
                        :key="index"
                    >
                        <calendar-item
                            :data="item"
                            :counts="counts"
                            :slogans="slogans"
                            :pageSlogan="pageSlogan"
                            :isToday="isToday(item)"
                        ></calendar-item>
                    </div>
                </section>
            </section>
        </main>
        <aside class="m-calendar-aside" :class="{ expanded: !isExpand }">
            <i class="u-expand-icon el-icon-upload2" @click="setExpand(false)"></i>
            <calendar-detail :date-obj="current"></calendar-detail>
        </aside>
        <!-- <calendar-rank v-if="rank_show" @calendarRank="rank_show = false" /> -->
    </div>
</template>

<script>
import { months, weeks } from "@/assets/data/calendar.json";
import { getCalendar, getCalendarCount, getCalendarSlogans, getMyTeamRaid } from "@/service/pvg/calendar.js";
import dayjs from "@/utils/day";
import calendarDetail from "./calendar/CalendarDetail.vue";
import calendarItem from "./calendar/CalendarItem.vue";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
export default {
    name: "Archive",
    components: {
        calendarDetail,
        calendarItem,
    },
    data: () => ({
        current: {
            year: "",
            month: "",
            date: "",
        },
        months,
        weeks,

        dataArr: [],
        counts: [],
        slogans: [],

        rank_show: false,
    }),
    computed: {
        // 禁止下一年
        nextDisabled() {
            const this_year = new Date().getFullYear();
            return this_year + 1 <= this.current.year;
        },
        // 禁止上一年
        prevDisabled() {
            // jx3 公测 2009
            return this.current.year <= 2009;
        },
        params() {
            const { year, month, date } = this.current;
            return {
                year,
                month,
                date,
            };
        },
        today() {
            return new Date().getDate();
        },
        client() {
            return this.$store.state.client;
        },
        // 页面slogan
        pageSlogan() {
            const { current } = this;
            return this.slogans.find(
                (slogan) => slogan.year === current.year && slogan.month === current.month && !slogan.date
            );
        },
        topStyle() {
            return {
                backgroundColor: this.pageSlogan?.bgcolor,
                backgroundImage: `url(${resolveImagePath(this.pageSlogan?.img)})`,
            };
        },
        isExpand() {
            return this.$store.state.isExpand;
        },
    },
    watch: {
        "$route.params": {
            immediate: true,
            handler: function ({ year, month, date }, oVal) {
                this.current = { year: ~~year, month: ~~month, date: ~~date || 1 };

                if (oVal?.year !== year || oVal?.month !== month || !oVal) {
                    this.getMonthData();
                    this.loadCalendar();
                    this.loadCalendarCount();
                }

                this.loadCalendarSlogans();
            },
        },
    },
    methods: {
        /**
         * 切换年份
         * @param {String}} action next 下一年 prev 上一年
         */
        toggleYear(action) {
            action === "prev" ? (this.current.year -= 1) : (this.current.year += 1);

            this.current.date = 1;

            this.$router.push(`/gonggao/calendar/${this.current.year}/${this.current.month}/${this.current.date}`);
        },
        /**
         * 切换月份
         * @param {String}} action next 下一月 prev 上一月
         */
        toggleMonth(action) {
            if (action === "prev") {
                // 如果当前月份为1月
                if (this.current.month === 1) {
                    this.current.year -= 1;
                    this.current.month = 12;
                } else {
                    this.current.month -= 1;
                }
            } else {
                // 如果当前月份为12月
                if (this.current.month === 12) {
                    this.current.year += 1;
                    this.current.month = 1;
                } else {
                    this.current.month += 1;
                }
            }

            this.current.date = 1;

            this.$router.push(`/gonggao/calendar/${this.current.year}/${this.current.month}/${this.current.date}`);
        },
        // 获取指定月份数据
        getMonthData() {
            const { year, month } = this.current;
            let dataArr = [];
            let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            // 闰年
            if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
                daysInMonth[1] = 29;
            }

            const monthStartWeekday = new Date(year, month - 1, 1).getDay() || 7;
            const monthEndWeekday = new Date(year, month, 1).getDay() || 7;

            const preInfo = this.getPreMonth(this.current);
            const nextInfo = this.getNextMonth();

            for (let i = 0; i < monthStartWeekday - 1; i++) {
                let preObj = {
                    type: "pre",
                    date: daysInMonth[preInfo.month - 1] - (monthStartWeekday - i - 2),
                    month: preInfo.month,
                    year: preInfo.year,
                    children: [],
                    raids: [],
                };
                dataArr.push(preObj);
            }

            for (let i = 0; i < daysInMonth[month - 1]; i++) {
                let itemObj = {
                    type: "normal",
                    date: i + 1,
                    month,
                    year,
                    children: [],
                    raids: [],
                };
                dataArr.push(itemObj);
            }

            for (let i = 0; i < 8 - monthEndWeekday; i++) {
                let nextObj = {
                    type: "next",
                    date: i + 1,
                    month: nextInfo.month,
                    year: nextInfo.year,
                    children: [],
                    raids: [],
                };
                dataArr.push(nextObj);
            }

            this.dataArr = dataArr;
        },
        // 获取前一个月的年月日信息
        getPreMonth(date, defaultDate = 1) {
            let { year, month } = date || this.current;

            if (month === 1) {
                year -= 1;
                month = 12;
            } else {
                month -= 1;
            }

            return { year, month, date: defaultDate };
        },
        // 获取后一个月的年月日信息
        getNextMonth(defaultDate = 1) {
            let { year, month } = this.current;
            if (month === 12) {
                year += 1;
                month = 1;
            } else {
                month += 1;
            }

            return { year, month, date: defaultDate };
        },
        dateClick({ date, month, year }) {
            this.current.year = year;
            this.current.month = month;
            this.current.date = date;

            this.$router.push(`/gonggao/calendar/${this.current.year}/${this.current.month}/${this.current.date}`);

            this.setExpand(true);
        },
        // 判断是否为今日
        isToday({ year, month, date }) {
            const dateObj = new Date();

            return dateObj.getFullYear() === year && dateObj.getMonth() + 1 === month && dateObj.getDate() === date;
        },
        // 当前选定的日期
        isCurrent({ year, month, date }) {
            const { current } = this;

            return current.year === year && current.month === month && current.date === date;
        },

        // 数据加载
        loadCalendar() {
            const { year, month } = this.current;
            getCalendar({ year, month }, this.client).then((res) => {
                const data = res.data.data || [];
                data?.forEach((item) => {
                    let { year, month, date } = item;
                    let index = this.dataArr.findIndex((d) => d.year === year && d.month === month && d.date === date);

                    if (index > -1) {
                        this.dataArr[index].children.push(item);
                    }
                });
                // 需要用户登录才请求
                if (User.isLogin()) this.loadMyTeamRaid();
            });
        },
        // 获取当前年月的统计数据
        loadCalendarCount() {
            const { year, month } = this.current;
            getCalendarCount({ year, month }).then((res) => {
                this.counts = res.data.map((item) => {
                    return {
                        ...item,
                        month,
                        year,
                    };
                });
            });
        },
        // 获取当前年月的海报信息
        loadCalendarSlogans() {
            const { year, month } = this.current;
            getCalendarSlogans({ year, month }).then((res) => {
                this.slogans = res.data;
            });
        },
        // 获取当前年月的团队活动信息
        loadMyTeamRaid() {
            const { year, month } = this.current;

            const params = {
                start_time: dayjs.tz(`${year}-${month}-01`).startOf("month").format("YYYY-MM-DD"),
                end_time: dayjs.tz(`${year}-${month}-01`).endOf("month").format("YYYY-MM-DD"),
            };

            getMyTeamRaid(params).then((res) => {
                const data = res.data?.data || [];
                data.map((item) => {
                    return {
                        ...item,
                        month: dayjs.tz(item?.raid_info?.start_time).month() + 1,
                        year: dayjs.tz(item?.raid_info?.start_time).year(),
                        date: dayjs.tz(item?.raid_info?.start_time).date(),
                    };
                }).forEach((item) => {
                    let { year, month, date } = item;
                    let index = this.dataArr.findIndex((d) => d.year === year && d.month === month && d.date === date);

                    if (index > -1) {
                        this.dataArr[index].raids.push(item);
                    }
                });
            });
        },
        // 过滤
        getSloganMeta(key) {
            return this.pageSlogan?.[key];
        },
        resolveImagePath,
        setExpand(val) {
            this.$store.commit("SET_STATE", {
                key: "isExpand",
                value: val,
            });
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/pvg/calendar/index.less";
</style>
