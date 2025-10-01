<template>
    <div ref="listRef" class="p-exam" v-loading="loading">
        <PvxSearch class="m-exam-search" :items="searchProps" :initValue="initValue" @search="searchEvent($event)">
            <el-button
                type="primary"
                size="medium"
                class="u-analysis"
                slot="extra"
                v-if="search.type == 2 || search.type == 3"
                @click="openLink(search.type)"
            >
                {{ search.type === 2 ? "我要出题" : "我要出卷" }}
            </el-button>
        </PvxSearch>
        <div class="m-exam-content">
            <ImperialExamList v-if="search.type === 1" :search="search.title" :data="data"></ImperialExamList>
            <template v-else>
                <!-- 列表 -->
                <template v-if="data && data.length">
                    <QuestionList v-if="search.type === 2" :data="data"></QuestionList>
                    <PaperList v-if="search.type === 3" :data="data"></PaperList>
                </template>
                <!-- 空 -->
                <el-empty v-else description="没有找到相关条目" :image-size="100"></el-empty>
            </template>
            <!-- 分页 -->
            <el-pagination
                v-if="[2, 3].includes(search.type) && data.length"
                class="m-exam-pagination"
                background
                :page-size="query.pageSize"
                :hide-on-single-page="true"
                :current-page.sync="query.pageIndex"
                layout="total, prev, pager, next, jumper"
                :total="totalPages"
                @current-change="pageChange"
            ></el-pagination>
        </div>
    </div>
</template>
<script>
import { getExamPaperList, getExamQuestionList, getExamRandom, getExamByKey } from "@/service/exam.js";
import PvxSearch from "@/components/PvxSearch.vue";
import ImperialExamList from "@/components/exam/imperial_exam_list.vue";
import PaperList from "@/components/exam/paper_list.vue";
import QuestionList from "@/components/exam/question_list.vue";
import tags from "@/assets/data/exam_tags.json";
import { __clients, __Root } from "@/utils/config";
import { cloneDeep } from "lodash";
import { deleteNull } from "@/utils/index";
import User from "@jx3box/jx3box-common/js/user";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "ExamList",
    components: {
        PvxSearch,
        ImperialExamList,
        PaperList,
        QuestionList,
    },
    data() {
        return {
            loading: false,
            query: {
                pageIndex: 1,
                pageSize: 16,
            },
            total: 0,
            totalPages: 0,
            search: {
                title: "",
            },
            searchProps: [
                {
                    key: "type",
                    name: "类型",
                    type: "radio",
                    options: [
                        // {
                        //     type: 0,
                        //     name: "全部",
                        // },
                        {
                            type: 1,
                            name: "科举题库",
                            key: "keju",
                        },
                        {
                            type: 2,
                            name: "创作题库",
                            key: "question",
                        },
                        {
                            type: 3,
                            name: "模拟考试",
                            key: "paper",
                        },
                        {
                            type: 4,
                            name: "剑三高考",
                            link: "/event/gaokao",
                        },
                    ],
                },
                {
                    type: "filter",
                    key: "filter",
                    name: "过滤",
                    options: [],
                },
                // {
                //     key: "title",
                //     name: "关键词",
                // },
            ],
            initValue: {
                tag: "",
                client: "",
                type: ~~this.$route.params.type || 1,
            },
            data: [],
            isMiniProgram: isMiniProgram(),
        };
    },
    computed: {
        publishLink() {
            let type = "question";
            if (this.search.type === 3) {
                type = "paper";
            }
            return "publish/#/" + type;
        },
        tags() {
            return tags.map((item) => {
                return {
                    key: item === "全部" ? "" : item,
                    value: item,
                };
            });
        },
        clients() {
            let arr = [];
            for (const key in __clients) {
                arr.unshift({ key, value: __clients[key] });
            }
            arr.unshift({ key: "", value: "全部" });
            return arr;
        },
        params() {
            return { ...this.query, ...this.search };
        },
    },
    watch: {
        "search.title": {
            handler(key) {
                if (this.search.type === 1) {
                    if (key && key.length >= 2) {
                        getExamByKey({ key }).then((res) => {
                            this.data = res.data?.data || [];
                        });
                    }
                    if (!key) {
                        this.loadImperialExam();
                    }
                }
            },
        },
        "search.type"(type) {
            if (type === 1) {
                // this.searchProps[2].name = `关键词(长度不少于2个字符)`;
                this.searchProps.splice(2, 1);
                this.data = [];
                // this.loadImperialExam();
            } else {
                // this.searchProps[2].name = `关键词`;
                this.searchProps[2] = {
                    key: "title",
                    name: "关键词",
                };
            }
            if (type === 2 || type === 3) {
                const tags = this.tags;
                const hasTag = this.searchProps[1].options.find((item) => item.key === "tag");
                if (hasTag) {
                    this.searchProps[1].options.map((item) => {
                        if (item.key === "tag") {
                            item.options = tags;
                        }
                        return item;
                    });
                } else {
                    this.searchProps[1].options.push({
                        key: "tag",
                        type: "radio",
                        name: "标签",
                        options: tags,
                    });
                }
                const clients = this.clients;
                const hasClient = this.searchProps[1].options.find((item) => item.key === "client");
                if (hasClient) {
                    this.searchProps[1].options.map((item) => {
                        if (item.key === "client") {
                            item.options = clients;
                        }
                        return item;
                    });
                } else {
                    this.searchProps[1].options.push({
                        key: "client",
                        type: "radio",
                        name: "平台",
                        options: clients,
                    });
                }
            } else {
                this.searchProps.map((item) => {
                    if (item.type === "filter") {
                        item.options = [];
                    }
                    return item;
                });
            }
        },
        search: {
            immediate: true,
            deep: true,
            handler() {
                this.query.pageIndex = 1;
                this.load();
            },
        },
    },
    methods: {
        load() {
            const type = ~~this.search.type;
            if (type === 2) {
                this.loadMethod(getExamQuestionList);
            }
            if (type === 3) {
                this.loadMethod(getExamPaperList);
            }
        },
        searchEvent(data) {
            const search = cloneDeep(this.search);
            this.search = {
                ...search,
                ...data,
            };
        },
        loadMethod(fun) {
            const params = deleteNull(cloneDeep(this.params));
            if (this.data.length && this.data[0]?.paramsType !== params.type) {
                this.data = [];
            }
            this.loading = true;
            fun(params)
                .then((res) => {
                    const data = res.data?.data || [];
                    this.data = data.map((item) => {
                        return {
                            ...item,
                            paramsType: params.type,
                        };
                    });
                    this.totalPages = res.data?.page?.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadImperialExam() {
            this.loading = true;
            getExamRandom()
                .then((res) => {
                    this.data = res.data?.data || [];
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        pageChange() {
            this.load();
        },
        openLink() {
            window.open(__Root + this.publishLink, "_blank");
        },
    },
    mounted() {
        const { tag } = this.$route.query;
        if (tag) {
            this.initValue.tag = tag;
        }
    },
};
</script>
<style lang="less">
@import "~@/assets/css/exam/index.less";
@import "~@/assets/css/exam/exam_miniprogram.less";
</style>
