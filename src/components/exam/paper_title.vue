<template>
    <section class="c-paper-title" v-if="item">
        <div class="m-title">
            <div class="u-heading">
                <span class="u-eyebrow">{{ $t("pages.exam.ui.paper.detail.paperLabel") }}</span>
                <h1 class="u-title" v-if="isPaper">{{ title || $t("pages.exam.ui.paper.detail.untitled") }}</h1>
            </div>

            <div class="u-star">
                <span class="u-label">{{ $t("pages.exam.ui.paper.detail.difficulty") }}</span>
                <el-rate :model-value="item.hardStar" disabled text-color="#f59e0b"></el-rate>
            </div>

            <div class="u-tags">
                <span class="u-tag u-client" :class="`u-${item.client || 'std'}`">
                    {{ clients[item.client || "std"] }}
                </span>
                <span class="u-tag" v-for="tag in normalizedTags" :key="tag">{{ tag }}</span>
            </div>

            <div class="u-info">
                <img class="u-icon" svg-inline src="../../assets/img/common/logo.svg" alt="" />
                <span class="u-desc">{{ desc }}</span>
            </div>

            <div class="u-author">
                <span>{{ $t("pages.exam.ui.paper.detail.author") }}</span>
                <a :href="authorLink(item.createUserId)" target="_blank" rel="noopener noreferrer">
                    {{ item?.userInfo?.display_name || $t("pages.exam.ui.common.anonymous") }}
                </a>
            </div>
        </div>

        <div class="m-score" :class="{ 'is-score': hasScore }">
            <div class="u-left">
                <span class="u-status">{{
                    hasScore
                        ? $t("pages.exam.ui.paper.detail.examEnd")
                        : $t("pages.exam.ui.paper.detail.examStart")
                }}</span>
                <h2 class="u-start-title">{{
                    $t("pages.exam.ui.paper.detail.summary", { count: questionCount, score: number })
                }}</h2>
                <p class="u-start-tip">{{ $t("pages.exam.ui.paper.detail.rule") }}</p>
            </div>
            <div v-if="hasScore" class="u-score">
                <span class="u-score-label">{{ $t("pages.exam.ui.paper.detail.score") }}</span>
                <span class="u-value">{{ score }}</span>
            </div>
        </div>
    </section>
</template>
<script>
import { authorLink } from "@jx3box/jx3box-common/js/utils";
import { __clients } from "@/utils/config";
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
            return this.item.desc || this.$t("pages.exam.ui.paper.detail.noDescription");
        },
        normalizedTags() {
            return Array.isArray(this.item?.tags) ? this.item.tags : [];
        },
        questionCount() {
            return this.item?.questionDetailList?.length || this.item?.questionIdList?.length || 0;
        },
        hasScore() {
            return this.score !== "" && this.score !== null && this.score !== undefined && Number(this.score) >= 0;
        },

        sharingTitle: function () {
            if (this.type == "paper") return "试卷";
            return "问题";
        },
        number: function () {
            return this.questionCount ? Math.floor(100 / this.questionCount) : 0;
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
