<template>
    <PvxPageShell class="p-pvx-exam-index">
        <div ref="listRef" class="m-pvx-exam__layout" v-loading="loading">
            <PvxSurface class="m-pvx-exam__hero" padding="medium">
                <PvxSectionHeader
                    class="m-pvx-exam__header"
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
                defer-filter-submit
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
                    <template v-if="total" #action>
                        <span class="u-result-count">{{ $t("pages.exam.ui.resultCount", { count: total }) }}</span>
                    </template>
                </PvxSectionHeader>

                <template v-if="data.length">
                    <QuestionList v-if="search.type === 2" :data="data" />
                    <PaperList v-if="search.type === 3" :data="data" />
                </template>
                <PvxEmptyState
                    v-else-if="!loading"
                    class="m-pvx-exam__empty"
                    illustrated
                    :title="$t('pages.exam.ui.empty.title')"
                    :description="$t('pages.exam.ui.empty.description')"
                />

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
import PaperList from "@/components/exam/paper_list.vue";
import QuestionList from "@/components/exam/question_list.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import tags from "@/assets/data/exam_tags.json";
import { cloneDeep, isEqual } from "lodash";
import { deleteNull } from "@/utils/index";
import { EditPen, Reading } from "@element-plus/icons-vue";

const EXAM_TAB_TYPES = {
    question: 2,
    paper: 3,
};
const EXAM_TYPE_TABS = Object.fromEntries(Object.entries(EXAM_TAB_TYPES).map(([tab, type]) => [type, tab]));

function getRouteExamType(route) {
    return EXAM_TAB_TYPES[route.query.tab] || ([2, 3].includes(~~route.params.type) ? ~~route.params.type : 2);
}

export default {
    name: "ExamList",
    components: {
        PvxSearch,
        PaperList,
        QuestionList,
        PvxActionButton,
        PvxEmptyState,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        EditPen,
        Reading,
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
                type: getRouteExamType(this.$route),
            },
            data: [],
            syncingRouteTab: false,
            keywordSearchTimer: null,
            loadToken: 0,
        };
    },
    computed: {
        publishLink() {
            let type = "question";
            if (this.search.type === 3) {
                type = "paper";
            }
            return "/publish/#/" + type;
        },
        tags() {
            return tags.map((item) => {
                return {
                    key: item === "全部" ? "" : item,
                    value: item,
                };
            });
        },
        params() {
            return {
                ...this.query,
                ...this.search,
                client: this.$store.state.client,
            };
        },
        sectionTitle() {
            const key = { 2: "question", 3: "paper" }[this.search.type] || "question";
            return this.$t(`pages.exam.ui.sections.${key}.title`);
        },
        sectionDescription() {
            const key = { 2: "question", 3: "paper" }[this.search.type] || "question";
            return this.$t(`pages.exam.ui.sections.${key}.description`);
        },
    },
    watch: {
        "$route.query.tab"() {
            this.syncingRouteTab = true;
            this.initValue.type = getRouteExamType(this.$route);
            this.$nextTick(() => {
                this.syncingRouteTab = false;
            });
        },
        "search.type"(type) {
            this.query.pageSize = type === 3 ? 20 : 16;
            this.searchProps[2] = {
                key: "title",
                name: this.$t("pages.exam.ui.filters.keyword"),
            };
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
            const nonKeywordData = cloneDeep(data);
            delete nonKeywordData.title;
            const onlyKeywordChanged =
                data.title !== undefined &&
                data.title !== search.title &&
                Object.entries(nonKeywordData).every(([key, value]) => isEqual(value, search[key]));

            clearTimeout(this.keywordSearchTimer);
            if (onlyKeywordChanged) {
                this.keywordSearchTimer = setTimeout(() => {
                    this.applySearch(data);
                }, 350);
                return;
            }

            this.applySearch(data);
        },
        applySearch(data) {
            const search = cloneDeep(this.search);
            const previousType = search.type;
            const nextSearch = {
                ...search,
                ...data,
            };
            if (isEqual(nextSearch, search)) return;
            this.search = nextSearch;

            const tab = EXAM_TYPE_TABS[data.type];
            if (!this.syncingRouteTab && previousType && previousType !== data.type && tab && this.$route.query.tab !== tab) {
                this.$router.replace({
                    query: {
                        ...this.$route.query,
                        tab,
                    },
                });
            }
        },
        loadMethod(fun) {
            const token = ++this.loadToken;
            const params = deleteNull(cloneDeep(this.params));
            if (this.data.length && this.data[0]?.paramsType !== params.type) {
                this.data = [];
            }
            this.loading = true;
            fun(params)
                .then((res) => {
                    if (token !== this.loadToken) return;
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
                    if (token !== this.loadToken) return;
                    this.data = [];
                    this.total = 0;
                    this.$message.error(this.$t("pages.exam.ui.loadFailed"));
                })
                .finally(() => {
                    if (token === this.loadToken) this.loading = false;
                });
        },
        pageChange() {
            this.load();
        },
        openLink() {
            window.open(this.publishLink, "_blank", "noopener,noreferrer");
        },
    },
    mounted() {
        const { tag } = this.$route.query;
        if (tag) {
            this.initValue.tag = tag;
        }
    },
    beforeUnmount() {
        clearTimeout(this.keywordSearchTimer);
    },
};
</script>
<style lang="less">
@import "~@/assets/css/modules/exam-index-theme.less";
</style>
