<template>
    <div class="v-single-card" :class="fromQuestion && 'from-question'" v-if="item">
        <div class="m-single-question">
            <div class="u-number">
                <div class="u-left" v-if="!fromQuestion">
                    <span class="u-num" v-if="index">{{ index }}</span>
                    <template v-if="index && item_tags.length">
                        <a
                            :href="tagsLink(item)"
                            target="_blank"
                            class="u-tag"
                            v-for="(item, i) in item_tags"
                            :key="i"
                            >{{ item }}</a
                        >
                    </template>
                </div>
                <div v-else class="u-left">
                    <span class="u-tag u-no">No.{{ item.id }}</span>
                    <span class="u-tag u-client" :class="`u-${item.client}`">{{ clients[item.client || "std"] }}</span>
                    <template v-if="index && item_tags.length">
                        <a
                            :href="tagsLink(item)"
                            target="_blank"
                            class="u-tag"
                            v-for="(item, i) in item_tags"
                            :key="i"
                            >{{ item }}</a
                        >
                    </template>
                </div>

                <div class="u-right">
                    <a class="u-exam" v-if="!fromQuestion" :href="`${exam_link}${item.id}`" target="_blank"
                        ><span class="u-label">试题编号</span>{{ item.id }}</a
                    >
                    <a class="u-user" :href="authorLink(item.createUserId)" target="_blank"
                        ><span class="u-label">出题人</span>{{ item.createUser }}</a
                    >
                    <div v-if="fromQuestion" class="u-star">
                        <span>难度：</span>
                        <el-rate v-model="item.hardStar" disabled text-color="#ff9900"></el-rate>
                    </div>
                </div>
            </div>
            <div class="u-cont">
                <div class="u-title">
                    <span class="u-hint"> [{{ item.type == "checkbox" ? "多选题" : "单选题" }}] </span>
                    <span v-html="resolveImagePath(item.title)" class="m-html-title"> </span>
                </div>
                <div class="u-option">
                    <template v-if="item.type === 'checkbox'">
                        <el-checkbox-group v-model="checkbox" @change="checkAnswers(item.id, checkbox)">
                            <el-checkbox
                                v-for="(option, i) of options"
                                :key="i"
                                :label="i"
                                border
                                :disabled="isSubmitted"
                                :class="myWrongClass(i)"
                            >
                                <div class="u-radio">
                                    <span class="u-num">{{ String.fromCharCode(65 + i) }}.</span>
                                    <span class="m-option-content" v-html="resolveImagePath(option)"></span>
                                </div>
                            </el-checkbox>
                        </el-checkbox-group>
                    </template>
                    <template v-else>
                        <el-radio-group v-model="radio" @change="checkAnswers(item.id, radio)">
                            <el-radio
                                v-for="(option, i) of options"
                                :key="i"
                                :label="i"
                                border
                                :disabled="isSubmitted"
                                :class="myWrongClass(i)"
                            >
                                <div class="u-radio">
                                    <span class="u-num">{{ String.fromCharCode(65 + i) }}.</span>
                                    <span class="m-option-content" v-html="resolveImagePath(option)"></span>
                                </div>
                            </el-radio>
                        </el-radio-group>
                    </template>
                </div>
            </div>
        </div>
        <template v-if="fromQuestion">
            <div class="m-question-answer" v-if="answer">
                <div class="u-answer-title">正确答案</div>
                <div class="u-answer-content">
                    <div class="u-content-title">
                        <div class="u-content-title-item" v-for="key in answer.answerList" :key="key">
                            <b>{{ letter(key) }}</b>
                            <span>{{ item.options[key] }}</span>
                        </div>
                    </div>
                    <div class="u-content-desc">
                        <span v-if="answer.whyami" v-html="answer.whyami"></span>
                        <div v-else>暂无解析</div>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="m-single-answer" v-if="answer">
                <div class="u-status" :class="myAnswersClass(answer)">
                    {{ status }}
                </div>
                <div class="u-answer">
                    你的答案：
                    <span v-if="answer.myAnswer">
                        <b v-for="key in answer.myAnswer" :key="key">{{ letter(key) }}</b>
                    </span>
                    <b v-else>-</b>
                </div>
                <div class="u-answer">
                    正确答案：
                    <b v-for="key in answer.answerList" :key="key">{{ letter(key) }}</b>
                </div>
                <hr />
                <div class="m-analysis">
                    <span class="u-label">解析：</span>
                    <!-- <Article :content="answer.whyami" v-if="answer.whyami"></Article> -->
                    <span v-if="answer.whyami" v-html="answer.whyami"></span>
                    <div v-else>暂无解析</div>
                </div>
            </div>
        </template>
    </div>
</template>
<script>
// import Article from "@jx3box/jx3box-editor/src/Article.vue";
import { authorLink, showAvatar, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { __Root } from "@jx3box/jx3box-common/data/jx3box.json";
import tags from "@/assets/data/exam_tags.json";
import { __clients } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    name: "Card",
    props: ["item", "answer", "index", "isSubmitted", "fromQuestion"],
    // components: { Article },
    data: function () {
        return {
            checkbox: [],
            radio: {},
            clients: __clients,
        };
    },
    computed: {
        options: function () {
            return this.item.options;
        },
        status: function () {
            if (!this.answer.myAnswer) return "未作答";
            return this.answer.myAnswerIsRight ? "回答正确" : "回答错误";
        },
        exam_link() {
            return `/exam/question/`;
        },
        item_tags() {
            let arr = this.item.tags
                .map((item) => {
                    if (this.tags.indexOf(item) !== -1) return item;
                })
                .filter(Boolean);
            if (!arr.length) arr[0] = this.item.tags[0];
            return arr.slice(0, 1);
        },
        tags() {
            return tags.slice(5, tags.length);
        },
    },
    watch: {
        item: {
            deep: true,
            immediate: true,
            handler: function () {
                this.$nextTick(() => {
                    this.initImgViewer();
                });
            },
        },
    },
    methods: {
        authorLink,
        resolveImagePath,
        checkAnswers(key, val) {
            let value = Array.isArray(val) ? val : [val];
            this.$emit("changeVal", { [key]: value });
        },
        myAnswersClass({ myAnswer, myAnswerIsRight }) {
            if (!myAnswer) return "noAnswer";
            return myAnswerIsRight ? "isCorrect" : "isWrong";
        },
        myWrongClass(index) {
            if (!this.answer) return "";
            if (this.answer.myAnswerIsRight) return "";

            let list = this.answer.answerList;
            let my = this.answer.myAnswer || [];

            if (list.includes(index)) return "isCorrect";
            if (my.includes(index)) return "isWrong";
        },
        letter: function (val) {
            return String.fromCharCode(65 + val);
        },
        tagsLink(tag) {
            const type = this.$route.name === "paper" ? 3 : 2;
            return `/exam/${type}?tag=${tag}`;
        },
        initImgViewer() {
            const images = document.querySelectorAll(".m-html-title img");
            images.forEach((img) => {
                img.onclick = () => {
                    this.$hevueImgPreview({
                        url: img.src,
                        controlBar: false,
                        clickMaskCLose: true,
                    });
                };
            });
        },
    },
};
</script>
