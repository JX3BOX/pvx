<template>
    <div class="v-paper-single m-single-wrapper" v-loading="loading">
        <div class="back-wrap">
            <el-button @click="goBack">返回列表</el-button>
            <a v-if="data.id && canManage" class="u-edit" :href="editLink('paper', data.id)">
                <i class="el-icon-edit-outline"></i><span>编辑</span>
            </a>
        </div>

        <PaperTitle :item="data" :score="score" type="paper" />

        <template v-if="isIframe">
            <div class="m-paper-iframe">当前试卷为外链，<a :href="data.iframe" target="_blank">点击前往</a></div>
        </template>
        <template v-else>
            <div class="m-paper-list">
                <SingleCard
                    v-for="(item, index) in list"
                    :key="item.id"
                    :item="item.list"
                    :index="index + 1"
                    :answer="item.answer"
                    :isSubmitted="isSubmitted"
                    @changeVal="finalAnswer"
                />
            </div>
            <div class="m-exam-submit" @click="submit" :class="{ isSubmitted }">
                <el-button class="u-btn" :disabled="isSubmitted">提交</el-button>
            </div>

            <Thx
                class="m-thx"
                :postId="id"
                postType="paper"
                :postTitle="title"
                :userId="user_id"
                :adminBoxcoinEnable="true"
                :userBoxcoinEnable="true"
                :client="client"
            />
            <div class="m-single-comment">
                <el-divider content-position="left">评论</el-divider>
                <Comment :id="id" category="paper" />
            </div>
        </template>
    </div>
</template>
<script>
import SingleCard from "@/components/exam/single_card.vue";
import PaperTitle from "@/components/exam/paper_title.vue";
import Comment from "@jx3box/jx3box-comment-ui/src/Comment.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { getPaper, submitAnswer } from "@/service/exam.js";
import User from "@jx3box/jx3box-common/js/user";

export default {
    name: "PaperSingle",
    props: [],
    components: { SingleCard, PaperTitle, Comment },
    data: function () {
        return {
            data: {},
            list: [],
            answer: "",
            score: "",
            userAnswers: {},
            isSubmitted: false,
            loading: false,
        };
    },
    computed: {
        id() {
            return ~~this.$route.params.id;
        },
        user_id() {
            return this.data.createUserId;
        },
        isIframe: function () {
            return this.data.iframe;
        },
        title: function () {
            return this.data.title || "无标题";
        },
        client() {
            return this.data.client || "all";
        },
        canManage: function () {
            return User.isEditor() || User.getInfo().uid == this.data.createUserId;
        },
    },
    methods: {
        editLink(type, id) {
            // return `/exam/${type}Publish/${id}`;
            return `/publish/#/${type}/${id}`;
        },
        loadData() {
            this.loading = true;
            getPaper(this.id)
                .then((res) => {
                    let data = res.data;

                    // 发送统计
                    postStat("paper", this.id);

                    data.tags = JSON.parse(data.tags);
                    data.questionDetailList =
                        data?.questionDetailList?.map((item) => {
                            item.options = JSON.parse(item.options);
                            item.tags = JSON.parse(item.tags);

                            return item;
                        }) || [];
                    this.data = data;

                    this.list =
                        data?.questionDetailList?.map((item) => {
                            return {
                                list: item,
                            };
                        }) || [];
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        finalAnswer(val) {
            this.userAnswers = {
                ...this.userAnswers,
                ...val,
            };
        },
        submit() {
            if (!User.isLogin()) return this.$message.error("请先登录");
            if (!Object.keys(this.userAnswers).length) {
                this.$alert("不能交白卷哦~", "提交失败", {
                    type: "error",
                });
            } else {
                let list = this.data.questionDetailList;
                let obj = this.userAnswers;
                let submitList = {};
                for (const key in obj) {
                    const item = list.find((l) => l.id === ~~key);
                    submitList[key] = obj[key].map((o) => item.options[o]);
                }
                let userAnswers = [];
                for (let i in this.userAnswers) {
                    userAnswers.push({
                        id: [i],
                        myAnswer: this.userAnswers[i].sort(),
                    });
                }
                submitAnswer(this.id, submitList, true).then((res) => {
                    if (res.data.score) {
                        document.documentElement.scrollTop = 0;
                        const paper = res.data.paper;
                        this.list = this.list.map((item) => {
                            let answer = paper.questionDetailList.find((q) => q.id === item.list.id);
                            answer.answerList = answer.answerList.sort();
                            const myAnswer = userAnswers.find((q) => q.id == answer.id);
                            item.answer = { ...answer, ...myAnswer };
                            return item;
                        });
                        this.score = String(res.data.score.score);
                        this.isSubmitted = true;
                    }
                });
            }
        },
        goBack: function () {
            this.$router.push({ name: "index", params: { type: 3 } });
        },
    },
    created: function () {
        this.loadData();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/back.less";
@import "~@/assets/css/exam/exam.less";
@import "~@/assets/css/exam/single_title.less";
@import "~@/assets/css/exam/single_card.less";
.m-paper-iframe {
    .x;
    padding: 200px;
    background-color: @bg-gray;
    a {
        text-decoration: underline;
    }
}
</style>
