<template>
    <div class="m-question-list">
        <!-- 表格 -->
        <el-table class="m-list m-question-table" :data="list" style="width: 100%" @row-click="takeQuestion">
            <el-table-column prop="id" :label="$t('pages.exam.ui.question.columns.id')" width="72"></el-table-column>
            <el-table-column prop="title" :label="$t('pages.exam.ui.question.columns.title')" min-width="240">
                <template #default="scope">
                    <div class="u-title">
                        <span :class="`u-client i-client-${scope.row.client}`">{{ clients[scope.row.client] }}</span>
                        {{ scope.row.title }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="tags" :label="$t('pages.exam.ui.question.columns.tags')" width="180">
                <template v-slot="scope">
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
            <el-table-column prop="hardStar" :label="$t('pages.exam.ui.question.columns.difficulty')" width="120">
                <template v-slot="scope">
                    <el-rate v-model="scope.row.hardStar" disabled text-color="#ff9900"></el-rate>
                </template>
            </el-table-column>
            <el-table-column
                v-if="hasAuthor"
                prop="author"
                :label="$t('pages.exam.ui.question.columns.author')"
                width="180"
            >
                <template v-slot="scope">
                    {{ scope.row.createUser }}
                </template>
            </el-table-column>
            <el-table-column
                fixed="right"
                align="center"
                header-align="center"
                :label="$t('pages.exam.ui.question.columns.action')"
                width="124"
                v-if="!isMiniProgram"
            >
                <template #default="scope">
                    <el-button class="u-answer-action" type="primary" plain @click.stop="takeQuestion(scope.row)">
                        <el-icon><EditPen /></el-icon>
                        {{ $t("pages.exam.ui.question.answer") }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="m-question-cards">
            <button class="u-question-card" type="button" v-for="item in list" :key="`mobile-${item.id}`" @click="takeQuestion(item)">
                <div class="u-card-topline">
                    <span class="u-number">No.{{ item.id }}</span>
                    <span :class="`u-client i-client-${item.client}`">{{ clients[item.client] }}</span>
                </div>
                <h3 class="u-card-title">{{ item.title }}</h3>
                <div class="u-tags">
                    <el-tag v-for="tag in item.tags" :key="`${item.id}-${tag}`" size="small" effect="plain" type="info">{{ tag }}</el-tag>
                </div>
                <div class="u-card-meta">
                    <span>{{ item.createUser || $t("pages.exam.ui.common.anonymous") }}</span>
                    <el-rate :model-value="item.hardStar" disabled text-color="#ff9900" />
                </div>
            </button>
        </div>
    </div>
</template>
<script>
import { __clients } from "@/utils/config";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
import { EditPen } from "@element-plus/icons-vue";
export default {
    name: "QuestionList",
    props: ["data"],
    components: { EditPen },
    data: function () {
        return { clients: __clients, isMiniProgram: isMiniProgram() || isApp() };
    },
    computed: {
        client: function () {
            return location.href.includes("origin") ? "origin" : "std";
        },
        list: function () {
            return this.data?.map((item) => {
                let parsedTags = [];
                try {
                    parsedTags = Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || "[]");
                } catch (e) {
                    parsedTags = [];
                }
                return { ...item, tags: Array.isArray(parsedTags) ? parsedTags.slice(0, 3) : [] };
            });
        },
        hasAuthor() {
            return this.list?.some((item) => String(item.createUser || "").trim()) || false;
        },
    },
    watch: {},
    methods: {
        takeQuestion(row) {
            const id = row.id;
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
