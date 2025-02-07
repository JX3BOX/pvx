<template>
    <div class="m-publish-box">
        <!-- 头部 -->
        <div class="m-back">
            <el-button @click="goBack">返回列表</el-button>
        </div>
        <el-form label-position="left" label-width="80px" class="m-publish-exam">
            <publish-client v-model="primary.client"></publish-client>
            <el-form-item label="题目" class="m-publish-exam-title">
                <el-input
                    v-model="primary.title"
                    :maxlength="500"
                    :minlength="2"
                    show-word-limit
                    required
                    :rows="3"
                    type="textarea"
                    placeholder="请填写题目内容 (支持html)"
                ></el-input>
            </el-form-item>
            <el-form-item label="题型" class="m-publish-exam-type">
                <el-radio-group v-model="primary.type">
                    <el-radio label="radio" border>单选题</el-radio>
                    <el-radio label="checkbox" border>多选题</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="选项" class="m-publish-exam-options">
                <el-input placeholder="选项1 (支持html)" v-model="primary.options[0]">
                    <template slot="prepend">A</template>
                </el-input>
                <el-input placeholder="选项2 (支持html)" v-model="primary.options[1]">
                    <template slot="prepend">B</template>
                </el-input>
                <el-input placeholder="选项3 (支持html)" v-model="primary.options[2]">
                    <template slot="prepend">C</template>
                </el-input>
                <el-input placeholder="选项4 (支持html)" v-model="primary.options[3]">
                    <template slot="prepend">D</template>
                </el-input>
            </el-form-item>
            <el-form-item label="答案" class="m-publish-exam-answer">
                <el-radio-group v-model="answer_radio" v-if="primary.type == 'radio'">
                    <el-radio :label="0">A</el-radio>
                    <el-radio :label="1">B</el-radio>
                    <el-radio :label="2">C</el-radio>
                    <el-radio :label="3">D</el-radio>
                </el-radio-group>
                <el-checkbox-group v-model="answer_checkbox" v-else>
                    <el-checkbox :label="0">A</el-checkbox>
                    <el-checkbox :label="1">B</el-checkbox>
                    <el-checkbox :label="2">C</el-checkbox>
                    <el-checkbox :label="3">D</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item label="难度" class="m-publish-exam-level">
                <el-rate
                    v-model="primary.hardStar"
                    show-score
                    text-color="#ff9900"
                    score-template="{value} 星"
                ></el-rate>
            </el-form-item>

            <exam_tags class="m-publish-exam-tags" v-model="primary.tags" />

            <el-form-item label="答案解析" class="m-publish-exam-content">
                <Tinymce v-model="primary.whyami" :attachmentEnable="true" :resourceEnable="true" :height="400" />
                <el-button
                    class="u-publish"
                    icon="el-icon-s-promotion"
                    type="primary"
                    @click="publish"
                    :disabled="processing"
                    >提交题目</el-button
                >
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import publish_client from "@/components/exam/publish_client.vue";
import exam_tags from "@/components/exam/exam_tags.vue";
import Tinymce from "@jx3box/jx3box-editor/src/Tinymce";
import { getPublishQuestion, createQuestion, updateQuestion } from "@/service/exam";
import { getLink } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "exam_question",
    components: {
        Tinymce,
        exam_tags,
        "publish-client": publish_client,
    },
    props: [],
    data: function () {
        return {
            primary: {
                client: "std",
                title: "",
                type: "radio",
                options: ["", "", "", ""],
                answer: [],
                hardStar: 0,
                tags: [],
                whyami: "",
                pool: "common",
            },
            processing: false,
            loading: false,

            // 缓存答案
            answer_radio: "",
            answer_checkbox: [],
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
    },
    watch: {
        answer_radio: function (val) {
            this.primary.answer = [val];
        },
        answer_checkbox: function (val) {
            this.primary.answer = val;
        },
        "primary.answer": function (val) {
            if (this.primary.type == "radio") {
                this.answer_radio = val[0];
            } else {
                this.answer_checkbox = val;
            }
        },
    },
    methods: {
        goBack() {
            this.$router.push({
                name: "index",
                params: {
                    type: 2,
                },
            });
        },
        publish: function () {
            this.processing = true;
            if (this.id) {
                updateQuestion(this.id, this.primary)
                    .then((res) => {
                        this.success(res);
                    })
                    .finally(() => {
                        this.processing = false;
                    });
            } else {
                createQuestion(this.primary)
                    .then((res) => {
                        this.success(res);
                    })
                    .finally(() => {
                        this.processing = false;
                    });
            }
        },
        success: function (res) {
            this.$message({
                message: res.data.msg || "提交成功",
                type: "success",
            });
            setTimeout(() => {
                location.href = getLink("question", this.id || res.data.data.id);
            }, 500);
        },
        loadData: function () {
            this.loading = true;
            getPublishQuestion(this.id)
                .then((res) => {
                    let data = res.data;
                    this.primary = data;
                    this.primary.options = JSON.parse(data.options);
                    this.primary.tags = JSON.parse(data.tags);
                    this.primary.answer = data.answerList || [];
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    created: function () {
        if (this.id) {
            this.loadData();
        }
    },
};
</script>

<style lang="less">
@import "~@/assets/css/exam/publish.less";
</style>
