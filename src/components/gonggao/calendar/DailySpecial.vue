<template>
    <div class="m-daily-activity">
        <div class="m-daily-content">
            <lucky-pet :date="date" :client="client"></lucky-pet>
            <furniture v-if="isCurrentWeek" :date="date" :client="client"></furniture>
            <meirentu :client="client" :today="today"></meirentu>
        </div>
    </div>
</template>

<script>
import dayjs from "@/utils/day";
import luckyPet from "./lucky_pet";
import furniture from "./furniture";
import meirentu from "./meirentu.vue";

export default {
    name: "daily-special",
    components: {
        luckyPet,
        furniture,
        meirentu,
    },
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
};
</script>

<style lang="less">
@import "~@/assets/css/calendar/daily.less";
</style>
