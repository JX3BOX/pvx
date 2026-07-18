<template>
    <PvxPageShell class="p-pvx-exam-index">
        <div ref="listRef" class="m-pvx-exam__layout" v-loading="loading">
            <PvxSurface class="m-pvx-exam__hero" padding="medium">
                <PvxSectionHeader
                    :title="$t('pages.exam.ui.title')"
                    :description="$t('pages.exam.ui.description')"
                    level="h1"
                >
                    <template #icon><Reading /></template>
                </PvxSectionHeader>
            </PvxSurface>

            <PvxSearch
                class="m-pvx-exam__toolbar"
                variant="modern"
                popper-class="m-pvx-exam-filter"
                i18n-scope="pages.exam.ui.search"
                :items="searchProps"
                :initValue="initValue"
                @search="searchEvent"
            >
                <template #extra>
                    <PvxActionButton
                        v-if="search.type === 2 || search.type === 3"
                        class="u-publish"
                        @click="openLink"
                    >
                        <EditPen />
                        {{ search.type === 2 ? $t("pages.exam.ui.actions.publishQuestion") : $t("pages.exam.ui.actions.publishPaper") }}
                    </PvxActionButton>
                </template>
            </PvxSearch>

            <PvxSurface class="m-pvx-exam__content" padding="medium">
                <PvxSectionHeader
                    class="m-pvx-exam__section-header"
                    :title="sectionTitle"
                    :description="sectionDescription"
                    level="h2"
                >
                    <template v-if="search.type !== 1 && total" #action>
                        <span class="u-result-count">{{ $t("pages.exam.ui.resultCount", { count: total }) }}</span>
                    </template>
                </PvxSectionHeader>

                <ImperialExamList v-if="search.type === 1" />

                <template v-else>
                    <template v-if="data.length">
                        <QuestionList v-if="search.type === 2" :data="data" />
                        <PaperList v-if="search.type === 3" :data="data" />
                    </template>
                    <PvxEmptyState
                        v-else-if="!loading"
                        class="m-pvx-exam__empty"
                        :title="$t('pages.exam.ui.empty.title')"
                        :description="$t('pages.exam.ui.empty.description')"
                    >
                        <template #icon><Search /></template>
                    </PvxEmptyState>
                </template>

                <div v-if="[2, 3].includes(search.type) && data.length" class="m-pvx-exam__pagination">
                    <el-pagination
                        background
                        :page-size="query.pageSize"
                        :hide-on-single-page="true"
                        v-model:current-page="query.pageIndex"
                        layout="total, prev, pager, next, jumper"
                        :total="total"
                        @current-change="pageChange"
                    />
                </div>
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>
<script>
import { getExamPaperList, getExamQuestionList } from "@/service/exam.js";
import PvxSearch from "@/components/PvxSearch.vue";
import ImperialExamList from "@/components/exam/imperial_exam_list.vue";
import PaperList from "@/components/exam/paper_list.vue";
import QuestionList from "@/components/exam/question_list.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import tags from "@/assets/data/exam_tags.json";
import { __clients, __Root } from "@/utils/config";
import { cloneDeep } from "lodash";
import { deleteNull } from "@/utils/index";
import { EditPen, Reading, Search } from "@element-plus/icons-vue";
export default {
    name: "ExamList",
    components: {
        PvxSearch,
        ImperialExamList,
        PaperList,
        QuestionList,
        PvxActionButton,
        PvxEmptyState,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        EditPen,
        Reading,
        Search,
    },
    data() {
        return {
            loading: false,
            query: {
                pageIndex: 1,
                pageSize: 16,
            },
            total: 0,
            search: {
                title: "",
            },
            searchProps: [
                {
                    key: "type",
                    name: this.$t("pages.exam.ui.filters.type"),
                    type: "radio",
                    options: [
                        // {
                        //     type: 0,
                        //     name: "全部",
                        // },
                        {
                            type: 1,
                            name: this.$t("pages.exam.ui.types.imperial"),
                            key: "keju",
                        },
                        {
                            type: 2,
                            name: this.$t("pages.exam.ui.types.question"),
                            key: "question",
                        },
                        {
                            type: 3,
                            name: this.$t("pages.exam.ui.types.paper"),
                            key: "paper",
                        },
                        {
                            type: 4,
                            name: this.$t("pages.exam.ui.types.gaokao"),
                            link: "/event/gaokao",
                        },
                    ],
                },
                {
                    type: "filter",
                    key: "filter",
                    name: this.$t("pages.exam.ui.filters.filter"),
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
                type: [1, 2, 3].includes(~~this.$route.params.type) ? ~~this.$route.params.type : 1,
            },
            data: [],
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
        sectionTitle() {
            const key = { 1: "imperial", 2: "question", 3: "paper" }[this.search.type] || "imperial";
            return this.$t(`pages.exam.ui.sections.${key}.title`);
        },
        sectionDescription() {
            const key = { 1: "imperial", 2: "question", 3: "paper" }[this.search.type] || "imperial";
            return this.$t(`pages.exam.ui.sections.${key}.description`);
        },
    },
    watch: {
        "search.type"(type) {
            if (type === 1) {
                this.searchProps.splice(2, 1);
                this.data = [];
                this.total = 0;
            } else {
                this.searchProps[2] = {
                    key: "title",
                    name: this.$t("pages.exam.ui.filters.keyword"),
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
                        name: this.$t("pages.exam.ui.filters.tag"),
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
                        name: this.$t("pages.exam.ui.filters.client"),
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
                    this.total = res.data?.page?.total || 0;
                })
                .catch(() => {
                    this.data = [];
                    this.total = 0;
                    this.$message.error(this.$t("pages.exam.ui.loadFailed"));
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        pageChange() {
            this.load();
        },
        openLink() {
            window.open(__Root + this.publishLink, "_blank", "noopener,noreferrer");
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
@import "~@/assets/css/modules/exam-index-theme.less";
</style>
