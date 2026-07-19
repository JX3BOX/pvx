<template>
    <PvxPageShell class="p-pvx-exam-question">
        <div class="m-pvx-exam-question__layout" v-loading="loading">
            <PvxSurface class="m-pvx-exam-question__navigation" tag="nav" padding="small" radius="medium">
                <PvxActionButton class="u-back" variant="light" @click="goBack">
                    <ArrowLeft />
                    {{ $t("pages.exam.ui.detail.back") }}
                </PvxActionButton>
                <PvxActionButton
                    v-if="data.id && canManage"
                    class="u-edit"
                    variant="light"
                    :href="editLink('question', data.id)"
                >
                    <EditPen />
                    {{ $t("pages.exam.ui.detail.edit") }}
                </PvxActionButton>
            </PvxSurface>

            <SingleCard
                :fromQuestion="true"
                :item="data"
                :answer="answer"
                :isSubmitted="isSubmitted"
                @changeVal="finalAnswer"
            />

            <div class="m-pvx-exam-question__submit">
                <PvxActionButton class="u-submit" :disabled="isSubmitted" @click="submit">
                    {{ isSubmitted ? $t("pages.exam.ui.detail.submitted") : $t("pages.exam.ui.detail.submit") }}
                </PvxActionButton>
            </div>

            <PvxSurface class="m-pvx-exam-question__community" padding="medium">
                <Thx
                    class="m-pvx-exam-question__thx"
                    :postId="id"
                    postType="question"
                    :postTitle="title"
                    :userId="user_id"
                    :adminBoxcoinEnable="false"
                    :userBoxcoinEnable="true"
                    :client="client"
                />
                <div class="m-pvx-exam-question__comment">
                    <h2 class="u-comment-title">
                        <el-icon><ChatDotRound /></el-icon>
                        {{ $t("pages.exam.ui.detail.comments") }}
                    </h2>
                    <Comment :id="id" category="question" />
                </div>
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
import SingleCard from "@/components/exam/single_card";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import Comment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { getQuestion, submitQuestionAnswer } from "@/service/exam.js";
import User from "@jx3box/jx3box-common/js/user";
import { ArrowLeft, ChatDotRound, EditPen } from "@element-plus/icons-vue";

export default {
    name: "QuestionSingle",
    components: {
        SingleCard,
        PvxActionButton,
        PvxPageShell,
        PvxSurface,
        Comment,
        ArrowLeft,
        ChatDotRound,
        EditPen,
    },
    data() {
        return {
            data: {},
            answer: "",
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
        title() {
            return this.data.title;
        },
        client() {
            return this.data.client || "all";
        },
        canManage() {
            return User.isEditor() || User.getInfo().uid == this.data.createUserId;
        },
    },
    methods: {
        editLink(type, id) {
            return `/publish/#/${type}/${id}`;
        },
        loadData() {
            this.loading = true;
            getQuestion(this.id)
                .then((res) => {
                    const data = res.data;
                    data.tags = JSON.parse(data.tags);
                    data.options = JSON.parse(data.options);
                    this.data = data;
                    postStat("question", this.id);
                })
                .catch(() => {
                    this.$message.error(this.$t("pages.exam.ui.loadFailed"));
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
            if (this.isSubmitted) return;
            if (!User.isLogin()) return this.$message.error(this.$t("pages.exam.ui.detail.loginRequired"));
            if (!Object.keys(this.userAnswers).length) {
                return this.$alert(
                    this.$t("pages.exam.ui.detail.selectAnswer"),
                    this.$t("pages.exam.ui.detail.submitFailed"),
                    { type: "error" }
                );
            }

            let submitList = {};
            for (const key in this.userAnswers) {
                submitList = this.userAnswers[key].map((optionIndex) => this.data.options[optionIndex]);
            }
            submitQuestionAnswer(this.id, submitList).then((res) => {
                if (res.data) {
                    document.documentElement.scrollTop = 0;
                    res.data.question.answerList = res.data.question.answerList.sort();
                    this.answer = {
                        ...res.data.question,
                        myAnswer: this.userAnswers[this.id].sort(),
                    };
                    this.isSubmitted = true;
                }
            });
        },
        goBack() {
            this.$router.push({ name: "index", query: { tab: "question" } });
        },
    },
    created() {
        this.loadData();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/exam/single_card.less";
@import "~@/assets/css/modules/exam-question-theme.less";
</style>
