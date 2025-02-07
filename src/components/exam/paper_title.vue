<template>
    <div class="c-paper-title" v-if="item">
        <div class="m-title">
            <div class="u-star">
                <span class="u-label">难度：</span>
                <el-rate v-model="item.hardStar" disabled text-color="#ff9900"></el-rate>
            </div>
            <div class="u-block u-title" v-if="isPaper">{{ title }}</div>
            <div class="u-block u-line"></div>
            <div class="u-block u-tags">
                <span class="u-tag" :class="`u-${item.client || 'std'}`">{{ clients[item.client || "std"] }}</span>
                <template v-if="item.tags && item.tags.length">
                    <span class="u-tag" v-for="tag in item.tags" :key="tag"> {{ tag }}</span>
                </template>
            </div>
            <div class="u-info">
                <img class="u-icon" svg-inline src="../../assets/img/logo.svg" fill="#fff" />
                <span class="u-desc" v-if="item.desc">{{ desc || "无" }}</span>
            </div>
            <div class="u-block u-author">
                <span>出卷人：</span><a :href="authorLink(item.createUserId)" target="_blank">{{ item.createUser }}</a>
            </div>
        </div>

        <div class="m-score" :class="score && score !== -1 ? 'is-score' : ''">
            <div class="u-left">
                <div class="u-start-title">考试{{ score && score !== -1 ? "结束" : "开始" }}</div>
                <div class="u-start-desc" v-if="item.questionList">
                    本次考试共{{ item.questionDetailList.length }}题，每题{{ number }}分，满分100分。
                </div>
                <div class="u-start-tip">请各位考生严格遵守考生条约，如有违规行为则本次考试成绩作废</div>
            </div>
            <div v-if="score && score !== -1" class="u-score">
                <span class="u-start-title">得分</span>
                <span class="u-value">{{ score }}</span>
            </div>
        </div>
    </div>
</template>
<script>
import { authorLink } from "@jx3box/jx3box-common/js/utils";
import { __clients } from "@jx3box/jx3box-common/data/jx3box.json";
import { getStat, checkPaper } from "@/service/exam.js";
import User from "@jx3box/jx3box-common/js/user";
import { showTime } from "@jx3box/jx3box-common/js/moment";

export default {
    name: "Title",
    props: ["item", "score", "type"],
    components: {},
    data: function () {
        return {
            collected: false,
            views: -1,
            clients: __clients,
        };
    },
    computed: {
        client: function () {
            return location.href.includes("origin") ? "origin" : "std";
        },
        isPaper: function () {
            return this.type == "paper";
        },
        id: function () {
            return this.$route.params.id;
        },
        title: function () {
            if (this.type == "paper") return this.item.title ? this.item.title : "";
            return this.item.title;
        },
        desc: function () {
            return this.item.desc || "作者很懒，没有备注";
        },

        sharingTitle: function () {
            if (this.type == "paper") return "试卷";
            return "问题";
        },
        number: function () {
            return Math.floor(100 / this.item.questionIdList.length);
        },
        canManage: function () {
            return User.isEditor() || User.getInfo().uid == this.item.createUserId;
        },
    },
    watch: {},
    methods: {
        check: function (action) {
            if (action == "delete") {
                this.$alert("确定删除吗？", "消息", {
                    confirmButtonText: "确定",
                    callback: (pop) => {
                        if (pop == "confirm") {
                            checkPaper(this.id, action).then((res) => {
                                this.$message({
                                    message: res.data.msg || "操作成功",
                                    type: "success",
                                });
                                location.reload();
                            });
                        }
                    },
                });
            } else {
                checkPaper(this.id, action).then((res) => {
                    this.$message({
                        message: res.data.msg || "操作成功",
                        type: "success",
                    });
                    location.reload();
                });
            }
        },
        showTime: function (val) {
            return showTime(new Date(val * 1000));
        },
        authorLink,
        editLink(type, id) {
            return `/exam/${type}Publish/${id}`;
        },
        examinee(num) {
            return num < 1 ? "-" : num;
        },
    },
    created: function () {
        getStat(this.type, this.id).then((res) => {
            this.views = res.data?.views;
        });
    },
    mounted: function () {},
};
</script>

<style lang="less">
@import "~@/assets/css/exam/paper_title.less";
</style>
