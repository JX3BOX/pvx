<template>
    <div class="m-calendar-item" :class="slogan ? slogan.style : ''" :style="sloganStyle" :key="uiKey">
        <div class="u-day-text">{{ dataWeek.week }}</div>
        <span
            class="u-date-text"
            :style="{ backgroundColor: isToday && themeColor, color: isToday && themeColor && '#3d454d' }"
            >{{ data.date }}</span
        >
        <div v-if="data.type === 'normal'" class="u-links">
            <div
                class="u-link"
                :class="linkClassName(item)"
                :style="{
                    color: item.bgcolor && '#fff',
                    //fontWeight: !item.bgcolor && item.color && 'bold',
                    backgroundImage: `url(${resolveImagePath(item.img)})`,
                    backgroundColor: item.bgcolor || 'rgba(255,255,255,0.6)',
                }"
                v-for="item in links"
                :key="item.id"
            >
                {{ item.title || item.desc }}
            </div>

            <div
                class="u-link u-raid-item"
                :style="{
                    color: item.bgcolor && '#fff',
                    backgroundImage: `url(${resolveImagePath(item.img)})`,
                    backgroundColor: item.bgcolor || '#e6f0fb',
                }"
                v-for="item in raids"
                :key="item.id"
                @click.stop="handleRaidClick(item)"
                :title="formatRaidInfo(item)"
            >
                <div class="u-raid-info">
                    <img
                        v-if="item.raid_team_info"
                        class="u-team-logo"
                        :src="showTeamLogo(item.raid_team_info.logo) || defaultTeamLogo"
                        width="22"
                        alt="团队"
                    />
                    <span class="u-raid-time">{{ formatTime(item.raid_info) }} -</span>
                    {{ formatRaidInfo(item) }}
                </div>
            </div>
        </div>
        <div class="u-nothing" v-else>...</div>
        <div class="u-date-count" v-if="countData">
            <b>{{ countData.count }}</b>
            <span>条纪事</span>
        </div>
    </div>
</template>

<script>
import { resolveImagePath, getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import dayjs from "@/utils/day";
export default {
    name: "calendar-item",
    props: {
        data: {
            type: Object,
            default: null,
        },
        counts: {
            type: Array,
            default: () => [],
        },
        slogans: {
            type: Array,
            default: () => [],
        },
        pageSlogan: {
            type: Object,
            default: () => {},
        },
        isToday: {
            type: Boolean,
        },
    },
    computed: {
        dataWeek() {
            const data = this.data;
            const date = data.year + "-" + data.month + "-" + data.date;
            const day = dayjs.tz(date).day();
            const weeks = ["日", "一", "二", "三", "四", "五", "六"];
            data.week = "周" + weeks[day];
            return data;
        },
        links() {
            const events = this.data?.children.filter((child) => child.type == 1) || [];
            const activities = this.data?.children.filter((child) => child.type == 2) || [];

            return [...events, ...activities].slice(0, 3);
        },
        countData() {
            const { data } = this;
            return this.counts.find((d) => d.year === data.year && d.month === data.month && d.date === data.date);
        },
        slogan() {
            const { data } = this;
            return this.slogans.find((d) => d.year == data.year && d.month == data.month && d.date == data.date);
        },
        sloganStyle() {
            return {
                backgroundColor: this.slogan?.bgcolor,
                backgroundImage: `url(${resolveImagePath(this.slogan?.img)})`,
            };
        },
        themeColor() {
            return this.pageSlogan?.color;
        },
        uiKey: function () {
            return this.data?.year + this.data?.month + this.data?.date;
        },
        raids() {
            return this.data?.raids || [];
        },
        defaultTeamLogo() {
            return require("@/assets/img/team_logo_null.svg");
        },
    },
    methods: {
        linkClassName({ type }) {
            if (type === 1) {
                return "is-event";
            }
            return "is-activity";
        },
        resolveImagePath,
        /**
         * @description 格式化时间
         * @param {Object} item
         * @returns {String}
         */
        formatTime({ start_time: time }) {
            return (time && dayjs.tz(time).format("HH:mm")) || "";
        },
        /**
         * @description 处理活动点击事件
         * @param {Object} item
         */
        handleRaidClick(item) {
            const url = location.origin + "/team/raid/" + item.raid_info.id;
            window.open(url, "_blank");
        },
        /**
         * @description 格式化raid
         * @param {Object} item
         */
        formatRaidInfo(item) {
            const { raid_info } = item;
            return `${raid_info && raid_info.name}@${raid_info && raid_info.team_name}`;
        },
        showTeamLogo(url) {
            return (url && getThumbnail(url, 44)) || "";
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pvg/calendar/calendar_item.less";
</style>
