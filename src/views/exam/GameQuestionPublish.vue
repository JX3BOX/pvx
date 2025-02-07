<template>
    <div class="m-publish-box m-single-wrapper ">
        <!-- 头部 -->
        <div class="back-wrap">
            <el-button @click="goBack">返回列表</el-button>
        </div>
        <el-form label-position="left" label-width="80px" class="m-publish-exam">
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
                    <el-radio :label="0" border>单选题</el-radio>
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
                <el-radio-group v-model="answer_radio" v-if="!primary.type">
                    <el-radio :label="0">A</el-radio>
                    <el-radio :label="1">B</el-radio>
                    <el-radio :label="2">C</el-radio>
                    <el-radio :label="3">D</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label class="m-publish-exam-content">
                <el-button
                    class="u-publish"
                    icon="el-icon-s-promotion"
                    type="primary"
                    @click="publish"
                    :disabled="processing"
                    >提交</el-button
                >
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { createGameQuestion } from "@/service/exam";
import cloneDeep from "lodash/cloneDeep";
export default {
    name: "game_exam_question",
    props: [],
    data: function () {
        return {
            primary: {
                title: "",
                type: 0,
                options: ["", "", "", ""],
                answer: [],
            },
            processing: false,

            // 缓存答案
            answer_radio: "",
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
    },
    methods: {
        goBack() {
            this.$router.push({
                name: "index",
                params: {
                    type: 1,
                },
            });
        },
        publish: function () {
            this.processing = true;
            const primary = cloneDeep(this.primary);
            primary.options = JSON.stringify(primary.options);
            primary.answer = JSON.stringify(primary.answer);
            createGameQuestion(primary)
                .then((res) => {
                    this.success(res);
                })
                .finally(() => {
                    this.processing = false;
                });
        },
        success: function (res) {
            this.$message({
                message: res.data.msg || "提交成功",
                type: "success",
            });
            this.goBack();
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/exam/publish.less";
</style>
