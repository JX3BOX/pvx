<template>
    <el-dialog custom-class="m-calendar-rank-dialog" :visible.sync="show" center :before-close="handleClose">
        <span slot="title" class="u-rank-title"><i class="el-icon-s-data"></i> 剑三日历贡献排行榜 </span>
        <div v-loading="loading">
            <el-divider>【 {{date.start}} ~ {{date.end}} 】</el-divider>
            <ul class="m-list">
                <li v-for="(item,index) in list" :key="index">
                    <span class="u-number"> <img :src="rankImg(index+1)" alt="" srcset="" v-if="index <3"><span v-else>{{index+1}}</span> </span>
                    <img class="u-avatar" :src="item.user.user_avatar || avatar" :alt="item.user.display_name">
                    <a :href="`${author}${item.user_id}`" target="_blank" class="u-name">{{item.user.display_name}}</a>
                    <span class="u-num"><b>{{item.count}} </b>条</span>
                </li>
            </ul>
        </div>
    </el-dialog>

</template>
<script>
import { __imgPath, __Root } from "@/utils/config";
import { getCalendarRank, getRankDate } from "@/service/pvg/calendar.js";
export default {
    name: "calendarRank",
    data: function () {
        return {
            list: [],
            date: "",
            show: true,
            loading: false,
        };
    },
    computed: {
        avatar() {
            return `${__imgPath}image/other/avatar.png`;
        },
        author() {
            return `${__Root}author/`;
        },
    },
    methods: {
        handleClose() {
            this.$emit("calendarRank", false);
        },
        rankImg(id) {
            return `${__imgPath}image/other/rank_${id}.png`;
        },
        // 排行榜数据
        getRankData() {
            this.loading = true;
            getRankDate()
                .then((res) => {
                    if (!res.data.data) return;
                    let data = {};
                    res.data.data.forEach((item) => {
                        if (item.key == "calendar_rank_start") data.start = item.val;
                        if (item.key == "calendar_rank_end") data.end = item.val;
                    });
                    this.date = data;
                    if (data.start && data.end)
                        getCalendarRank(this.date).then((res) => {
                            if (!res.data.data) return;
                            this.list = res.data.data.list;
                        });
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    created() {
        this.getRankData();
    },
};
</script>
<style lang='less'>
    @import "~@/assets/css/pvg/calendar/calendar_rank_dialog.less";
</style>
