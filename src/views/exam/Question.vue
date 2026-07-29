<template>
    <PvxPageShell class="p-pvx-exam-question">
        <div class="m-pvx-exam-question__layout" v-loading="loading">
            <PvxSurface class="m-pvx-exam-question__navigation" tag="nav" padding="small" radius="medium">
                <PvxActionButton class="u-back" variant="light" @click="goBack">
                    <ArrowLeft />
                    {{ $t("pages.exam.ui.detail.back") }}
                </PvxActionButton>
                <div class="m-pvx-exam-question__adjacent">
                    <PvxActionButton
                        class="u-adjacent"
                        variant="light"
                        disabled
                    >
                        <ArrowLeft />
                        {{ $t("pages.exam.ui.detail.previous") }}
                    </PvxActionButton>
                    <PvxActionButton
                        class="u-adjacent"
                        variant="light"
                        disabled
                    >
                        {{ $t("pages.exam.ui.detail.next") }}
                        <ArrowRight />
                    </PvxActionButton>
                </div>
                <PvxActionButton
                    v-if="data.id && canManage"
                    class="u-edit"
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
import { ArrowLeft, ArrowRight, ChatDotRound, EditPen } from "@element-plus/icons-vue";

export default {
    name: "QuestionSingle",
    components: {
        SingleCard,
        PvxActionButton,
        PvxPageShell,
        PvxSurface,
        Comment,
        ArrowLeft,
        ArrowRight,
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
            detailLoadToken: 0,
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
            const uid = User.getInfo()?.uid;
            const authorId = this.data.createUserId;

            return User.isAdmin() || (!!uid && !!authorId && String(uid) === String(authorId));
        },
    },
    watch: {
        id(id, previousId) {
            if (!id || id === previousId) return;
            this.resetAnswerState();
            this.data = {};
            this.loadData();
        },
    },
    methods: {
        editLink(type, id) {
            return `/publish/#/${type}/${id}`;
        },
        loadData() {
            const token = ++this.detailLoadToken;
            this.loading = true;
            getQuestion(this.id)
                .then((res) => {
                    if (token !== this.detailLoadToken) return;
                    this.applyQuestionData(res.data);
                })
                .catch(() => {
                    if (token !== this.detailLoadToken) return;
                    this.$message.error(this.$t("pages.exam.ui.loadFailed"));
                })
                .finally(() => {
                    if (token === this.detailLoadToken) this.loading = false;
                });
        },
        parseArray(value) {
            if (Array.isArray(value)) return value;
            try {
                const result = JSON.parse(value || "[]");
                return Array.isArray(result) ? result : [];
            } catch (_) {
                return [];
            }
        },
        applyQuestionData(rawData) {
            const data = {
                ...rawData,
                tags: this.parseArray(rawData?.tags),
                options: this.parseArray(rawData?.options),
            };
            this.data = data;
            postStat("question", data.id);
        },
        resetAnswerState() {
            this.answer = "";
            this.userAnswers = {};
            this.isSubmitted = false;
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
    beforeUnmount() {
        this.detailLoadToken += 1;
    },
};
</script>

<style lang="less">
@import "~@/assets/css/exam/single_card.less";
@import "~@/assets/css/modules/exam-question-theme.less";
</style>
