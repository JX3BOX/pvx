<template>
    <PvxPageShell class="p-pvx-book-list" v-loading="loading">
        <div ref="listRef" class="m-pvx-book-layout">
            <PvxToolbar class="m-pvx-book-toolbar">
                <nav class="m-pvx-book-tabs" :aria-label="$t('pages.book.ui.navigation')">
                    <button
                        v-for="item in professions"
                        :key="item.value"
                        type="button"
                        class="u-pvx-book-tab"
                        :class="{ 'is-active': active === item.value }"
                        :aria-pressed="active === item.value"
                        @click="clickTabs(item.value)"
                    >
                        {{ item.label }}
                    </button>
                </nav>
                <el-input
                    v-model="keyword"
                    class="u-pvx-book-search"
                    clearable
                    :placeholder="$t('pages.book.ui.searchPlaceholder')"
                    @input="onKeywordInput"
                >
                    <template #prefix>
                        <el-icon class="u-pvx-book-search-icon"><Search /></el-icon>
                    </template>
                </el-input>
            </PvxToolbar>

            <template v-if="active === 0 && hasOverviewList">
                <PvxSurface
                    v-for="section in visibleOverviewSections"
                    :key="section.id"
                    class="m-pvx-book-section"
                    padding="medium"
                >
                    <PvxSectionHeader
                        class="m-pvx-book-section-header"
                        :title="section.label"
                        level="h2"
                    >
                        <template #action>
                            <button
                                v-if="section.id !== RECENT_TYPE"
                                type="button"
                                class="u-pvx-book-view-all"
                                @click="clickTabs(section.id)"
                            >
                                {{ $t('pages.book.ui.actions.viewAll') }}
                            </button>
                            <button
                                v-else
                                type="button"
                                class="u-pvx-book-clear-history"
                                @click="clearRecentRead"
                            >
                                {{ $t('pages.book.ui.actions.clearHistory') }}
                            </button>
                        </template>
                    </PvxSectionHeader>
                    <div class="m-pvx-book-grid">
                        <BookCard
                            v-for="item in section.list.slice(0, count)"
                            :key="item.idKey"
                            :item="item"
                            variant="modern"
                        />
                    </div>
                </PvxSurface>
            </template>

            <PvxSurface v-else-if="active !== 0 && subList.length" class="m-pvx-book-section" padding="medium">
                <PvxSectionHeader class="m-pvx-book-section-header" :title="typeName" level="h2">
                    <template #action>
                        <span class="u-pvx-book-result-count">
                            {{ $t('pages.book.ui.resultCount', { count: total }) }}
                        </span>
                        <div class="m-pvx-book-view-mode" :aria-label="$t('pages.book.ui.viewMode')">
                            <button
                                v-for="item in localizedShowTypes"
                                :key="item.value"
                                type="button"
                                class="u-pvx-book-view-mode"
                                :class="{ 'is-active': showType === item.value }"
                                :aria-pressed="showType === item.value"
                                @click="showType = item.value"
                            >
                                {{ item.label }}
                            </button>
                        </div>
                    </template>
                </PvxSectionHeader>
                <div v-if="showType === 'card'" class="m-pvx-book-grid">
                    <BookCard
                        v-for="item in subList"
                        :key="item.idKey"
                        :item="item"
                        variant="modern"
                    />
                </div>
                <div v-else class="m-pvx-book-table">
                    <ListHead />
                    <BookItem v-for="item in subList" :key="item.idKey" :item="item" />
                </div>
                <el-button
                    v-show="hasNextPage"
                    class="m-pvx-book-more"
                    type="primary"
                    :loading="loading"
                    @click="appendPage"
                >
                    <el-icon v-if="!loading" class="el-icon--left"><ArrowDown /></el-icon>
                    {{ $t('pages.book.ui.actions.loadMore') }}
                </el-button>
                <el-pagination
                    class="m-pvx-book-pages"
                    background
                    layout="total, prev, pager, next, jumper"
                    :hide-on-single-page="true"
                    :page-size="per"
                    :total="total"
                    :current-page="page"
                    @current-change="changePage"
                />
            </PvxSurface>

            <PvxSurface
                v-if="showEmpty"
                class="m-pvx-book-empty-surface"
                padding="medium"
            >
                <PvxEmptyState
                    illustrated
                    :title="$t('pages.book.ui.empty.title')"
                    :description="$t('pages.book.ui.empty.description')"
                />
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
import BookItem from "@/components/book/result/book_item.vue";
import BookCard from "@/components/book/BookCard.vue";
import ListHead from "@/components/book/result/list_head.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxToolbar from "@/components/design/PvxToolbar.vue";
import professions from "@/assets/data/book_profession.json";
import { getList } from "@/service/book";
import { ArrowDown, Search } from "@element-plus/icons-vue";
import { concat, debounce } from "lodash";
import { mapState } from "vuex";

const RECENT_TYPE = 8;

export default {
    name: "BookIndex",
    components: {
        ArrowDown,
        BookCard,
        BookItem,
        ListHead,
        PvxEmptyState,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        PvxToolbar,
        Search,
    },
    data() {
        return {
            RECENT_TYPE,
            loading: false,
            keyword: "",
            active: 0,
            list: [
                { id: RECENT_TYPE, labelKey: "recent", page: 1, pages: 1, total: 0, list: [] },
                { id: 11, labelKey: "misc", page: 1, pages: 1, total: 0, list: [] },
                { id: 10, labelKey: "taoism", page: 1, pages: 1, total: 0, list: [] },
                { id: 9, labelKey: "buddhism", page: 1, pages: 1, total: 0, list: [] },
            ],
            page: 1,
            total: 0,
            per: 24,
            count: 6,
            showType: "card",
            appendMode: false,
            requestSerial: 0,
        };
    },
    computed: {
        ...mapState(["recentReadList"]),
        client() {
            return this.$store.state.client;
        },
        professions() {
            const labels = {
                11: this.$t("pages.book.ui.types.misc"),
                10: this.$t("pages.book.ui.types.taoism"),
                9: this.$t("pages.book.ui.types.buddhism"),
            };
            return [
                { value: 0, label: this.$t("pages.book.ui.types.all") },
                ...professions
                    .filter((item) => item.id !== RECENT_TYPE)
                    .map((item) => ({ value: item.id, label: labels[item.id] || item.name })),
            ];
        },
        localizedShowTypes() {
            return [
                { value: "list", label: this.$t("pages.book.ui.viewTypes.list") },
                { value: "card", label: this.$t("pages.book.ui.viewTypes.card") },
            ];
        },
        visibleOverviewSections() {
            return this.list
                .filter((item) => item.list.length)
                .map((item) => ({
                    ...item,
                    label: this.$t(`pages.book.ui.sections.${item.labelKey}`),
                }));
        },
        hasOverviewList() {
            return this.visibleOverviewSections.length > 0;
        },
        currentSection() {
            return this.list.find((item) => item.id === this.active);
        },
        typeName() {
            return this.currentSection
                ? this.$t(`pages.book.ui.sections.${this.currentSection.labelKey}`)
                : "";
        },
        subList() {
            return this.active === 0 ? [] : this.currentSection?.list || [];
        },
        hasNextPage() {
            return Boolean(this.currentSection && this.page < this.currentSection.pages);
        },
        showEmpty() {
            return !this.loading && (this.active === 0 ? !this.hasOverviewList : !this.subList.length);
        },
    },
    watch: {
        client() {
            this.resetAndLoad();
        },
    },
    methods: {
        clickTabs(id) {
            if (this.active === id) return;
            this.active = id;
            this.page = 1;
            this.appendMode = false;
            this.loadData();
        },
        onKeywordInput() {
            this.debouncedKeywordInput();
        },
        changePage(page) {
            this.page = page;
            this.appendMode = false;
            this.loadData();
        },
        appendPage() {
            this.page += 1;
            this.appendMode = true;
            this.loadData();
        },
        clearRecentRead() {
            this.$store.dispatch("clearRecentReadList");
            const recent = this.list.find((item) => item.id === RECENT_TYPE);
            recent.list = [];
            recent.total = 0;
        },
        resetAndLoad() {
            this.page = 1;
            this.appendMode = false;
            this.loadData();
        },
        updateResponsiveCount() {
            const width = this.$refs.listRef?.clientWidth || 1200;
            this.count = Math.max(2, Math.floor((width + 16) / 236));
            if (width <= 520) this.count = 2;
            this.per = Math.max(12, this.count * 4);
        },
        async loadData() {
            const serial = ++this.requestSerial;
            this.loading = true;
            const baseParams = {
                client: this.client,
                per: this.active === 0 ? this.count : this.per,
            };
            if (this.keyword) baseParams.keyword = this.keyword;

            try {
                if (this.active === 0) {
                    const sections = this.list.filter((item) => item.id !== RECENT_TYPE);
                    const responses = await Promise.all(
                        sections.map((item) =>
                            getList({ ...baseParams, page: 1, profession: item.id })
                        )
                    );
                    if (serial !== this.requestSerial) return;
                    responses.forEach((res, index) => {
                        this.applyResponse(sections[index], res.data, false);
                    });
                } else {
                    const response = await getList({
                        ...baseParams,
                        page: this.page,
                        profession: this.active,
                    });
                    if (serial !== this.requestSerial) return;
                    this.applyResponse(this.currentSection, response.data, this.appendMode);
                }
            } finally {
                if (serial === this.requestSerial) {
                    this.loading = false;
                    this.appendMode = false;
                }
            }
        },
        applyResponse(section, data, append) {
            if (!section) return;
            const nextList = data.list || [];
            section.list = append ? concat(section.list, nextList) : nextList;
            section.page = data.page || 1;
            section.pages = data.pages || 1;
            section.total = data.total || 0;
            if (section.id === this.active) {
                this.page = section.page;
                this.total = section.total;
                this.per = data.per || this.per;
            }
        },
    },
    mounted() {
        this.debouncedKeywordInput = debounce(() => {
            this.page = 1;
            this.appendMode = false;
            this.loadData();
        }, 300);
        const recent = this.list.find((item) => item.id === RECENT_TYPE);
        recent.list = this.recentReadList.slice(0, this.count);
        recent.total = this.recentReadList.length;
        this.updateResponsiveCount();
        this.loadData();
        this.handleResize = debounce(() => {
            const previousCount = this.count;
            this.updateResponsiveCount();
            if (this.active === 0 && previousCount !== this.count) this.loadData();
        }, 300);
        window.addEventListener("resize", this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize);
        this.debouncedKeywordInput?.cancel();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/modules/book-list-theme.less";
</style>
