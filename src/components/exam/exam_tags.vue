<template>
    <el-form-item label="标签">
        <div class="m-publish-exam-tags-list">
            <el-checkbox-group v-model="list">
                <div class="u-group">
                    <label class="el-checkbox"><span class="el-checkbox__label u-group-label ">方向</span></label>
                    <el-checkbox :label="game" v-for="game in options.game" :key="game">{{game}}</el-checkbox>
                </div>
                <div class="u-group">
                    <label class="el-checkbox"><span class="el-checkbox__label u-group-label ">门派</span></label>
                    <el-checkbox :label="item" v-for="item in school" :key="item">{{item}}</el-checkbox>
                </div>
                <div class="u-group">
                    <label class="el-checkbox"><span class="el-checkbox__label u-group-label ">玩法</span></label>
                    <el-checkbox :label="play" v-for="play in options.play" :key="play">{{play}}</el-checkbox>
                </div>
                <div class="u-group">
                    <label class="el-checkbox"><span class="el-checkbox__label u-group-label ">学科</span></label>
                    <el-checkbox :label="subject" v-for="subject in options.subject" :key="subject">{{subject}}</el-checkbox>
                </div>
                <div class="u-group">
                    <label class="el-checkbox"><span class="el-checkbox__label u-group-label ">领域</span></label>
                    <el-checkbox :label="domain" v-for="domain in options.domain" :key="domain">{{domain}}</el-checkbox>
                </div>
            </el-checkbox-group>
        </div>

        <!-- <div class="m-publish-exam-tags-custom">
        <el-tag
            :key="tag"
            v-for="tag in custom"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
        >
            {{ tag }}
        </el-tag>
        <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
            placeholder="回车新增自定义标签"
        >
        </el-input>
        <el-button v-else class="button-new-tag" size="small" @click="showInput"
            >+ 添加自定义</el-button
        >
    </div> -->
    </el-form-item>
</template>


<script>
import { tags } from "@/assets/data/exam.json";
import school from "@jx3box/jx3box-data/data/xf/forceid.json";
export default {
    name: "exam_tags",
    props: ["tags"],
    data: function () {
        return {
            options: tags,
            school,
            inputVisible: false,
            inputValue: "",
            list: this.tags,
        };
    },
    model: {
        prop: "tags",
        event: "update",
    },
    watch: {
        tags: function (newval) {
            this.list = newval;
        },
        list: function (newval) {
            this.$emit("update", newval);
        },
    },
    methods: {
        // TAG
        handleClose(tag) {
            this.custom.splice(this.custom.indexOf(tag), 1);
        },
        showInput() {
            this.inputVisible = true;
            this.$nextTick((_) => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        handleInputConfirm() {
            let inputValue = this.inputValue;
            if (inputValue) {
                this.custom.push(inputValue);
            }
            this.inputVisible = false;
            this.inputValue = "";
        },
    },
    mounted: function () {
    },
    components: {},
};
</script>

<style scoped lang="less">
    .u-group-label {
        .bold;
        background-color: #ebeef5;
        padding: 2px 10px;
        .r(2px);
    }
</style>
