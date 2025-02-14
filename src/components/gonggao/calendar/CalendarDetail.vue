<template>
    <div class="m-calendar-detail" v-loading="loading">
        <!-- 头部 -->
        <el-button class="m-calendar-detail-add" icon="el-icon-plus" circle @click="add"></el-button>
        <div class="m-calendar-detail-header">
            <div class="m-calendar-detail-title">{{ currentDate }}</div>
            <div class="m-calendar-detail-title-sub">{{ currentDay }}</div>
        </div>

        <main class="m-calendar-detail-content">
            <!-- 日常+周常活动 -->
            <section class="m-content-part" v-if="client == 'std'">
                <div class="u-daily-header">特殊</div>
                <daily-special :date="date"></daily-special>
                <div class="u-daily-header">
                    <!-- <el-divider content-position="left"><i class="el-icon-date"></i> 日常</el-divider> -->
                    日常
                </div>
                <daily-activity :date="date"></daily-activity>
            </section>

            <!-- 活动 -->
            <section class="m-content-part">
                <div class="u-part-header">
                    <el-divider content-position="left"
                        ><i class="el-icon-s-flag"></i> 活动<span class="u-count"
                            >({{ activities_count }})</span
                        ></el-divider
                    >
                </div>
                <div class="m-part-content">
                    <template v-if="activities && activities.length">
                        <calendar-detail-item
                            class="u-item"
                            v-for="item in activities"
                            :key="item.id"
                            :data="item"
                            @edit="edit"
                        />
                    </template>
                    <template v-else>
                        <div class="u-null"><i class="el-icon-warning-outline"></i>暂时没有任何活动记录</div>
                    </template>
                </div>
            </section>

            <!-- 事件 -->
            <section class="m-content-part">
                <div class="u-part-header">
                    <el-divider content-position="left"
                        ><i class="el-icon-collection-tag"></i> 事件<span class="u-count"
                            >({{ events_count }})</span
                        ></el-divider
                    >
                </div>
                <div class="m-part-content">
                    <template v-if="events && events.length">
                        <calendar-detail-item
                            class="u-item"
                            v-for="item in events"
                            :key="item.id"
                            :data="item"
                            @edit="edit"
                        />
                    </template>
                    <template v-else>
                        <div class="u-null"><i class="el-icon-warning-outline"></i>暂时没有任何事件记录</div>
                    </template>
                </div>
            </section>
        </main>

        <calendar-dialog
            v-model="visible"
            :date-obj="dateObj"
            :selected="selected"
            @update="update"
            @del="del"
            :mode="mode"
            :isSuper="true"
        ></calendar-dialog>
    </div>
</template>

<script>
import { getDayCalendar, delCalendar } from "@/service/gonggao/calendar.js";
import User from "@jx3box/jx3box-common/js/user.js";

import CalendarDialog from "./CalendarDialog";
import CalendarDetailItem from "./CalendarDetailItem.vue";
import DailyActivity from "./DailyActivity.vue";
import DailySpecial from "./DailySpecial.vue";
import dayjs from "@/utils/day";

export default {
    name: "CalendarDetail",
    props: {
        dateObj: {
            type: Object,
            default: () => {},
        },
    },
    components: {
        CalendarDialog,
        CalendarDetailItem,
        DailyActivity,
        DailySpecial,
    },
    data: () => ({
        // 数据列表
        loading: false,
        list: [],

        // 数据设置
        visible: false,
        selected: "",
        mode: "",
    }),
    computed: {
        currentDay() {
            const { year, month, date } = this.dateObj;
            const currentDate = `${year}-${month}-${date}`;
            const datas = dayjs.tz(currentDate).day();
            const week = ["日", "一", "二", "三", "四", "五", "六"];
            return "周" + week[datas];
        },
        currentDate() {
            const { year, month, date } = this.dateObj;
            return `${year} / ${month} / ${date}`;
        },
        client() {
            return this.$store.state.client;
        },

        // 活动(还需要匹配相同客户端)
        activities() {
            return (
                (this.list &&
                    this.list?.filter((item) => {
                        return item.client == this.client && item.type === 2;
                    })) ||
                []
            );
        },
        activities_count: function () {
            return this.activities?.length || 0;
        },
        // 事件
        events() {
            return (
                (this.list &&
                    this.list?.filter((item) => {
                        return item.type === 1;
                    })) ||
                []
            );
        },
        events_count: function () {
            return this.events?.length || 0;
        },
        date: function () {
            const { year, month, date } = this.dateObj;
            return `${year}-${month}-${date}`;
        },
    },
    watch: {
        dateObj: {
            deep: true,
            immediate: true,
            handler() {
                this.loadData();
            },
        },
        visible(val) {
            !val && (this.selected = "");
        },
    },
    methods: {
        // 数据
        // ======================
        loadData() {
            this.loading = true;
            return getDayCalendar(this.dateObj)
                .then((res) => {
                    this.list = res.data?.data || [];
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        // 操作
        // ======================
        // 添加
        add() {
            this.visible = true;
            this.mode = "create";
            this.selected = "";
        },
        // 编辑
        edit(item) {
            this.visible = true;
            this.mode = "update";
            this.selected = item;
        },
        // 提交
        update(res) {
            let { data } = res?.data || {};
            if (data) {
                if (this.isSameDate(data, this.dateObj)) {
                    data.desc = `(待审核) ${data.desc}`;
                    data.user_info = {
                        display_name: User.getInfo().name,
                        user_avatar: User.getInfo().avatar_origin,
                    };
                    this.list.unshift(data);
                }
            }
            this.visible = false;
        },
        // 删除
        del(id) {
            delCalendar(id).then(() => {
                this.list = this.list?.filter((record) => record.id !== id) || [];
                this.visible = false;
            });
        },

        isSameDate(source, target) {
            return source.year == target.year && source.month == target.month && source.date == target.date;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/calendar/calendar_detail.less";
</style>
