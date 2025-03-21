<template>
    <div class="m-question-list">
        <!-- 表格 -->
        <el-table class="m-list" :data="list" style="width: 100%" @row-click="takeQuestion">
            <el-table-column prop="id" label="编号" width="56"></el-table-column>
            <el-table-column prop="title" label="标题" min-width="200">
                <div class="u-title" slot-scope="scope">
                    <span :class="`u-client i-client-${scope.row.client}`">{{ clients[scope.row.client] }}</span>
                    {{ scope.row.title }}
                </div>
            </el-table-column>
            <el-table-column prop="tags" label="标签" width="180">
                <template slot-scope="scope">
                    <div class="u-tags">
                        <el-tag
                            class="u-tag"
                            effect="plain"
                            type="info"
                            v-for="tag of scope.row.tags"
                            :key="scope.row.id + '_' + tag"
                            size="small"
                            >{{ tag }}</el-tag
                        >
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="hardStar" label="难度" width="120">
                <template slot-scope="scope">
                    <el-rate v-model="scope.row.hardStar" disabled text-color="#ff9900"></el-rate>
                </template>
            </el-table-column>
            <el-table-column prop="author" label="出题人" width="180">
                <template slot-scope="scope">
                    {{ scope.row.createUser }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="100" v-if="!isMiniProgram">
                <template>
                    <el-button size="small" plain type="primary" icon="el-icon-edit">去答题</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
import { __clients } from "@jx3box/jx3box-common/data/jx3box.json";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "QuestionList",
    props: ["data"],
    components: {},
    data: function () {
        return { clients: __clients, isMiniProgram: isMiniProgram() };
    },
    computed: {
        client: function () {
            return location.href.includes("origin") ? "origin" : "std";
        },
        list: function () {
            return this.data?.map((item, i) => {
                try {
                    item.tags = JSON.parse(item.tags).slice(0, 3);
                } catch (e) {
                    console.log("解析题目列表tag异常", e);
                    item.tags = [];
                }
                return item;
            });
        },
    },
    watch: {},
    methods: {
        takeQuestion(row, column, event) {
            let id = row.id;
            this.$router.push({
                name: "question",
                params: { id: id },
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/exam/question_list.less";
</style>
