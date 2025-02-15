<template>
    <div class="m-calendar-single">
        <section class="m-actions">
            <el-button icon="el-icon-arrow-left" @click="goBack" size="small">返回</el-button>
            <el-button icon="el-icon-setting" type="primary" size="small" @click="manage(true)" v-if="isEditor">
                管理
            </el-button>
            <el-button icon="el-icon-edit" type="primary" size="small" @click="manage(false)" v-else-if="isCreator">
                编辑
            </el-button>
        </section>
        <section class="m-single-block m-today" v-loading="todayLoading">
            <header class="m-single-title m-history-header">
                <i :class="today.type == 1 ? 'el-icon-collection-tag' : 'el-icon-s-flag'"></i
                >{{ today.type == 1 ? "事件" : "活动" }}记录
            </header>
            <div class="m-today-content">
                <i class="u-client" :class="today.client">{{ today.client == "std" ? "正式服" : "怀旧服" }}</i
                >{{ today.desc }}
            </div>
            <div class="m-today-meta" v-if="today && today.user_info">
                <span class="u-user">
                    <img :src="showAvatar(today.user_info.user_avatar)" width="24" height="24" alt="" />
                    <a :href="authorLink(today.user_id)" target="_blank">{{ today.user_info.display_name }}</a>
                </span>
                <span class="u-create-time" title="创建时间">
                    <i class="el-icon-date"></i>
                    <time>{{ showTime(today.created_at) }}</time>
                </span>
            </div>
        </section>

        <div class="m-single-block m-reference">
            <header class="m-single-title m-history-header"><i class="el-icon-connection"></i>参考资料</header>
            <template v-if="references && references.length">
                <div class="m-reference-item" v-for="(reference, index) in references" :key="index">
                    <a class="u-item u-link" :href="reference.url" target="_blank" v-if="reference.url">
                        <label class="u-index">{{ index + 1 }}.</label>
                        <span class="u-label">{{ reference.label }} <i class="el-icon-link"></i></span>
                    </a>
                    <span class="u-item" v-else>
                        <label class="u-index">{{ index + 1 }}.</label>
                        <span class="u-label">{{ reference.label }}</span>
                    </span>
                </div>
            </template>
            <div v-else class="u-null"><i class="el-icon-warning-outline"></i>暂时没有任何参考资料</div>
        </div>

        <section class="m-single-block m-history" v-loading="historyLoading">
            <header class="m-single-title m-history-header"><i class="el-icon-date"></i>那年今日</header>
            <div class="m-history-content">
                <el-timeline>
                    <el-timeline-item v-for="key in timelineKeys" :key="key" :timestamp="String(key)" placement="top">
                        <div class="m-history-item" v-for="item in timelineData[key]" :key="item.id">
                            <calendar-detail-item :type="item.type" :data="item"></calendar-detail-item>
                        </div>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </section>

        <Thx
            :postId="id"
            postType="calendar"
            :postTitle="favTitle"
            :userId="author"
            :adminBoxcoinEnable="true"
            :userBoxcoinEnable="true"
        />

        <Comment class="m-comment" :id="id" category="calendar" />

        <calendar-dialog
            v-model="visible"
            :date-obj="dateObj"
            :selected="today"
            mode="update"
            :isSuper="isSuper"
        ></calendar-dialog>
    </div>
</template>

<script>
import { getDetail, getHistory } from "@/service/pvg/calendar.js";
import { postStat } from "@jx3box/jx3box-common/js/stat";
import { showAvatar, authorLink } from "@jx3box/jx3box-common/js/utils";
import { showTime } from "@jx3box/jx3box-common/js/moment";
import cloneDeep from "lodash/cloneDeep";
import User from "@jx3box/jx3box-common/js/user.js";

import Comment from "@jx3box/jx3box-comment-ui/src/Comment.vue";
import CalendarDialog from "@/components/pvg/gonggao/calendar/CalendarDialog";
import CalendarDetailItem from "@/components/pvg/gonggao/calendar/CalendarDetailItem.vue";
export default {
    name: "SingleCalendar",
    components: {
        Comment,
        CalendarDialog,
        CalendarDetailItem,
    },
    data() {
        return {
            today: "",
            history: [],
            todayLoading: false,
            historyLoading: false,

            // 弹窗
            visible: false,
            isSuper: false,
        };
    },
    computed: {
        id() {
            return ~~this.$route.params.id;
        },
        author() {
            return this.today.user_id;
        },
        params({ today }) {
            return today
                ? {
                      month: today.month,
                      date: today.date,
                  }
                : "";
        },
        dateObj() {
            return {
                year: this.today.year,
                month: this.today.month,
                date: this.today.date,
            };
        },
        references() {
            let arr = [];
            const { link, link_temp } = this.today;

            link && link.length && (arr = cloneDeep(link));

            if (link_temp && !arr.some((item) => item.url === link_temp)) {
                arr.push({
                    label: "官方新闻",
                    url: link_temp,
                });
            }
            return arr;
        },
        timelineData() {
            let history;
            // 将同一年份的记录归档至同一数组内
            history = this.history?.reduce((acc, obj) => {
                const key = obj.year;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);

                return acc;
            }, {});

            return history;
        },
        timelineKeys() {
            // 倒序历史记录年份 大 -> 小
            return Object.keys(this.timelineData || {})
                .map((year) => parseInt(year, 10))
                .sort((a, b) => b - a);
        },
        isEditor() {
            return User.isEditor();
        },
        isCreator() {
            return this.today.user_id == User.getInfo().uid;
        },
        favTitle() {
            return this.today.desc?.slice(0, 20) + "...";
        },
    },
    watch: {
        id: {
            immediate: true,
            handler(val) {
                if (val) {
                    this.loadData();
                }
            },
        },
        params: {
            deep: true,
            handler(val) {
                if (val) {
                    this.loadHistory(val);
                }
            },
        },
    },
    methods: {
        // ====== 数据获取 ==========
        loadData() {
            this.todayLoading = true;
            getDetail(this.id)
                .then((res) => {
                    this.today = res.data.data;
                })
                .finally(() => {
                    postStat("calendar", this.id);
                    this.todayLoading = false;
                });
        },
        loadHistory(params) {
            this.historyLoading = true;
            getHistory(params)
                .then((res) => {
                    this.history = (res.data.data || []).reverse();
                })
                .finally(() => {
                    this.historyLoading = false;
                });
        },

        // ========= other ==========
        goBack() {
            // 如果存在历史则返回上一个记录，否则返回月历页面
            history.length > 1
                ? history.back()
                : this.$router.push(`/archive/${this.dateObj.year}/${this.dateObj.month}`);
        },
        manage(isSuper) {
            this.visible = true;
            this.isSuper = isSuper;
        },

        // ========= filters =========
        formatDate({ year, month, date }) {
            return `${month}月${date}日`;
        },
        showAvatar(val) {
            return showAvatar(val, 24);
        },
        authorLink,
        showTime,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pvg/calendar/single.less";
</style>
