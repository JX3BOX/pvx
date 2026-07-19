<template>
    <PvxPageShell class="p-pvx-exam-paper">
        <div class="m-pvx-exam-paper__layout" v-loading="loading">
            <PvxSurface tag="nav" padding="small" radius="medium" class="m-pvx-exam-paper__navigation">
                <button type="button" class="u-back" @click="goBack">
                    <ArrowLeft />
                    <span>{{ $t("pages.exam.ui.paper.detail.backToList") }}</span>
                </button>
                <a v-if="data.id && canManage" class="u-edit" :href="editLink('paper', data.id)">
                    <EditPen />
                    <span>{{ $t("pages.exam.ui.paper.detail.edit") }}</span>
                </a>
            </PvxSurface>

            <PaperTitle v-if="data.id" :item="data" :score="score" type="paper" />

            <PvxSurface v-if="data.id && isIframe" class="m-paper-iframe" padding="large">
                <div class="u-icon"><LinkIcon /></div>
                <div class="u-content">
                    <h2>{{ $t("pages.exam.ui.paper.detail.externalTitle") }}</h2>
                    <p>{{ $t("pages.exam.ui.paper.detail.externalDescription") }}</p>
                </div>
                <a :href="data.iframe" target="_blank" rel="noopener noreferrer">
                    {{ $t("pages.exam.ui.paper.detail.openExternal") }}
                </a>
            </PvxSurface>

            <template v-else-if="data.id">
                <section class="m-pvx-exam-paper__questions">
                    <div class="m-paper-list">
                        <SingleCard
                            v-for="(item, index) in list"
                            :key="item.list.id"
                            :item="item.list"
                            :index="index + 1"
                            :answer="item.answer"
                            :isSubmitted="isSubmitted"
                            @changeVal="finalAnswer"
                        />
                    </div>
                </section>

                <div class="m-exam-submit" :class="{ isSubmitted }">
                    <el-button
                        class="u-btn"
                        type="primary"
                        :loading="submitting"
                        :disabled="isSubmitted || submitting"
                        @click="submit"
                    >
                        {{
                            isSubmitted
                                ? $t("pages.exam.ui.paper.detail.submitted")
                                : $t("pages.exam.ui.paper.detail.submit")
                        }}
                    </el-button>
                </div>

                <PvxSurface class="m-thx" padding="medium">
                    <Thx
                        :postId="id"
                        postType="paper"
                        :postTitle="title"
                        :userId="user_id"
                        :adminBoxcoinEnable="false"
                        :userBoxcoinEnable="true"
                        :client="client"
                    />
                </PvxSurface>
                <PvxSurface class="m-single-comment" padding="medium">
                    <el-divider content-position="left">{{ $t("pages.exam.ui.paper.detail.comments") }}</el-divider>
                    <Comment :id="id" category="paper" />
                </PvxSurface>
            </template>
        </div>
    </PvxPageShell>
</template>
<script>
import SingleCard from "@/components/exam/single_card.vue";
import PaperTitle from "@/components/exam/paper_title.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import Comment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { getPaper, submitAnswer, submitAnswerTrial } from "@/service/exam.js";
import User from "@jx3box/jx3box-common/js/user";
import { ArrowLeft, EditPen, Link as LinkIcon } from "@element-plus/icons-vue";

export default {
    name: "PaperSingle",
    props: [],
    components: {
        SingleCard,
        PaperTitle,
        PvxPageShell,
        PvxSurface,
        Comment,
        ArrowLeft,
        EditPen,
        LinkIcon,
    },
    data: function () {
        return {
            data: {},
            list: [],
            answer: "",
            score: "",
            userAnswers: {},
            isSubmitted: false,
            submitting: false,
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
            return this.data.title || this.$t("pages.exam.ui.paper.detail.untitled");
        },
        client() {
            return this.data.client || "all";
        },
        canManage: function () {
            return User.isEditor() || User.getInfo().uid == this.data.createUserId;
        },
        isPractice() {
            return this.$route?.query?.mode == "practice";
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
                    const data = res.data || {};

                    // 发送统计
                    postStat("paper", this.id);

                    data.tags = this.parseArray(data.tags);
                    data.questionDetailList =
                        data?.questionDetailList?.map((item) => {
                            return {
                                ...item,
                                options: this.parseArray(item.options),
                                tags: this.parseArray(item.tags),
                            };
                        }) || [];
                    this.data = data;

                    document.title = this.data.title + this.$t("pages.common.appendTitle");

                    this.list =
                        data?.questionDetailList?.map((item) => {
                            return {
                                list: item,
                            };
                        }) || [];
                })
                .catch(() => {
                    this.$message.error(this.$t("pages.exam.ui.paper.detail.loadFailed"));
                })
                .finally(() => {
                    this.loading = false;
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
        finalAnswer(val) {
            this.userAnswers = {
                ...this.userAnswers,
                ...val,
            };
        },
        submit() {
            if (this.isSubmitted || this.submitting) return;
            if (!this.isPractice && !User.isLogin()) {
                return this.$message.error(this.$t("pages.exam.ui.paper.detail.loginRequired"));
            }
            if (!Object.keys(this.userAnswers).length) {
                this.$alert(
                    this.$t("pages.exam.ui.paper.detail.blankMessage"),
                    this.$t("pages.exam.ui.paper.detail.blankTitle"),
                    {
                        type: "error",
                    }
                );
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
                const fn = this.isPractice ? submitAnswerTrial : submitAnswer;
                this.submitting = true;
                fn(this.id, submitList, true)
                    .then((res) => {
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
                    })
                    .finally(() => {
                        this.submitting = false;
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
@import "~@/assets/css/exam/single_card.less";
@import "~@/assets/css/modules/exam-paper-detail-theme.less";
</style>
