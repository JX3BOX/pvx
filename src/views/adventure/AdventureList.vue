<template>
    <PvxPageShell class="p-adventure-List p-pvx-adventure-list" v-loading="loading">
        <div ref="listRef" class="m-pvx-adventure-layout">
            <PvxToolbar class="m-pvx-adventure-toolbar">
                <nav class="m-pvx-adventure-tabs" :aria-label="$t('pages.adventure.ui.navigation')">
                    <button
                        v-for="item in list"
                        :key="item.value"
                        type="button"
                        class="u-adventure-tab"
                        :class="{ 'is-active': active === item.value }"
                        :aria-pressed="active === item.value"
                        @click="setActive(item.value)"
                    >
                        {{ typeLabel(item.value) }}
                    </button>
                </nav>
                <el-input
                    v-model="searchName"
                    class="u-adventure-search"
                    clearable
                    :placeholder="$t('pages.adventure.ui.searchPlaceholder')"
                    @input="onKeywordInput"
                >
                    <template #prefix><Search /></template>
                </el-input>
                <template #action>
                    <div class="m-pvx-adventure-toolbar-action">
                        <PvxActionButton
                            class="u-adventure-treasure"
                            href="/pvx/codex/adventure"
                            variant="light"
                        >
                            <CollectionTag />
                            {{ $t("pages.adventure.ui.actions.treasure") }}
                        </PvxActionButton>
                    </div>
                </template>
            </PvxToolbar>

            <template v-if="active === 'all' && hasOverviewList">
                <PvxSurface
                    v-for="section in overviewList"
                    :key="section.value"
                    class="m-pvx-adventure-section"
                    padding="medium"
                >
                    <PvxSectionHeader
                        class="m-pvx-adventure-section-header"
                        :title="$t('pages.adventure.ui.sectionTitle', { type: typeLabel(section.value) })"
                        level="h2"
                    >
                        <template #action>
                            <div class="m-pvx-adventure-section-actions">
                                <button
                                    type="button"
                                    class="u-section-action"
                                    :title="$t('pages.adventure.ui.actions.viewAll')"
                                    :aria-label="$t('pages.adventure.ui.actions.viewAll')"
                                    @click="setActive(section.value)"
                                >
                                    <span>{{ $t("pages.adventure.ui.actions.viewAll") }}</span>
                                </button>
                            </div>
                        </template>
                    </PvxSectionHeader>
                    <div class="m-pvx-adventure-grid">
                        <AdventureItem
                            v-for="item in section.list.slice(0, count)"
                            :key="item.dwID"
                            :item="item"
                            variant="modern"
                        />
                    </div>
                </PvxSurface>
            </template>

            <PvxSurface v-else-if="active !== 'all' && subList.length" class="m-pvx-adventure-section" padding="medium">
                <PvxSectionHeader
                    class="m-pvx-adventure-section-header"
                    :title="$t('pages.adventure.ui.sectionTitle', { type: typeName })"
                    level="h2"
                >
                    <template #action>
                        <span class="u-adventure-count">
                            {{ $t("pages.adventure.ui.resultCount", { count: total }) }}
                        </span>
                    </template>
                </PvxSectionHeader>
                <div class="m-pvx-adventure-grid">
                    <AdventureItem
                        v-for="item in subList"
                        :key="item.dwID"
                        :item="item"
                        variant="modern"
                    />
                </div>
                <el-button
                    v-show="hasNextPage"
                    class="m-pvx-adventure-more"
                    type="primary"
                    :loading="loading"
                    @click="appendPage"
                >
                    {{ $t("pages.adventure.ui.actions.loadMore") }}
                </el-button>
                <el-pagination
                    class="m-pvx-adventure-pages"
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
                v-if="(!loading && active === 'all' && !hasOverviewList) || (!loading && active !== 'all' && !subList.length)"
                class="m-pvx-adventure-empty-surface"
                padding="medium"
            >
                <PvxEmptyState
                    :title="$t('pages.adventure.ui.empty.title')"
                    :description="$t('pages.adventure.ui.empty.description')"
                >
                    <template #icon><Search /></template>
                </PvxEmptyState>
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
import AdventureItem from "@/components/adventure/item.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxToolbar from "@/components/design/PvxToolbar.vue";
import { getAdventures } from "@/service/adventure/adventure";
import { CollectionTag, Search } from "@element-plus/icons-vue";

export default {
    name: "adventureList",
    props: [],
    components: {
        AdventureItem,
        PvxActionButton,
        PvxEmptyState,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        PvxToolbar,
        CollectionTag,
        Search,
    },
    data: function () {
        return {
            loading: false,
            tabsData: {},
            searchName: "",
            list: [
                { value: "all", client: ["std", "origin"], list: [] },
                { value: "perfect", client: ["std", "origin"], list: [], pages: 1, page: 1 },
                { value: "normal", client: ["std", "origin"], list: [], page: 1, pages: 1 },
                { value: "pet", client: ["std", "origin"], list: [], page: 1, pages: 1 },
            ],
            active: "all",
            page: 1,
            total: 0,
            per: 8,
            count: 0,
            appendMode: false,
            requestSerial: 0,
            pendingRequests: 0,
            keywordTimer: null,
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        params({ tabsData }) {
            return { ...tabsData, per: this.per, client: this.client };
        },
        typeName() {
            return this.typeLabel(this.active);
        },
        subList() {
            if (this.active === "all") return null;
            return this.list.filter((e) => e.value == this.active)[0].list;
        },
        overviewList() {
            return this.list.filter((item) => item.value !== "all" && item.list.length);
        },
        hasOverviewList() {
            return this.overviewList.length > 0;
        },
        hasNextPage() {
            const pages = this.list.filter((e) => e.value == this.active)[0].pages;
            return pages > 1 && this.page < pages;
        },
    },
    watch: {
        active: {
            immediate: true,
            handler: function () {
                this.page = 1;
            },
        },
    },
    methods: {
        setActive(val) {
            if (val === this.active) return;
            this.active = val;
            this.showCount();
            this.page = 1;
            document.documentElement.scrollTop = 0;
            this.loadData();
        },
        typeLabel(value) {
            return this.$t(`pages.adventure.ui.types.${value}`);
        },
        loadData() {
            const requestSerial = ++this.requestSerial;
            this.pendingRequests = 0;
            this.appendMode = false;
            this.loading = true;
            const params = { ...this.params };
            const { type, ...rest } = params;
            if (this.active === "all") {
                const list = this.list.filter((e) => e.value !== "all");
                list.forEach((e) => {
                    this.loadList(
                        {
                            ...rest,
                            page: e.page,
                            type: e.value,
                        },
                        e.value,
                        {
                            appendMode: false,
                            requestSerial,
                        }
                    );
                });
            } else {
                this.loadList(
                    { ...rest, type: this.active, page: this.page },
                    this.active,
                    {
                        appendMode: false,
                        requestSerial,
                    }
                );
            }
        },
        loadList(params, key, { appendMode = false, requestSerial = this.requestSerial } = {}) {
            const index = this.list.findIndex((e) => e.value == key);
            if (this.list[index].pages < params.page && this.active === "all") params.page = 1;
            this.pendingRequests += 1;
            return getAdventures(params)
                .then((res) => {
                    if (requestSerial !== this.requestSerial) return;
                    const { list, total, pages, page } = res.data;
                    const _list = appendMode ? [...this.list[index].list, ...list] : list;
                    this.list[index].list = _list || [];
                    this.list[index].page = page || 1;
                    this.list[index].pages = pages || 1;
                    if (this.active !== "all") this.page = page || 1;
                    this.total = total;
                })
                .finally(() => {
                    if (requestSerial !== this.requestSerial) return;
                    this.pendingRequests = Math.max(this.pendingRequests - 1, 0);
                    if (!this.pendingRequests) {
                        this.loading = false;
                        this.appendMode = false;
                    }
                });
        },
        changePage(i) {
            this.page = i;
            this.loadData();
        },
        appendPage() {
            this.appendMode = true;
            this.handleLoad(this.active);
        },
        onSearch(params) {
            const isEvent = params instanceof Event;
            if (isEvent) return;
            this.page = 1;
            this.tabsData = params;
            this.loadData();
        },
        onKeywordInput(value) {
            window.clearTimeout(this.keywordTimer);
            this.keywordTimer = window.setTimeout(() => {
                this.onSearch(value ? { name: value } : {});
                this.keywordTimer = null;
            }, 250);
        },
        handleResize() {
            this.showCount();
        },
        showCount() {
            const listWidth = this.$refs.listRef?.clientWidth || 1200;
            const cardWidth = 210;
            const gridGap = 16;
            const sectionPadding = 48;
            const isPhone = window.matchMedia("(max-width: 720px)").matches;

            if (isPhone) {
                this.count = 6;
                this.per = this.active === "all" ? 6 : 12;
                return;
            }

            const availableWidth = listWidth - sectionPadding;
            this.count = Math.max(Math.floor((availableWidth + gridGap) / (cardWidth + gridGap)), 1);
            this.per = this.active === "all" ? this.count : this.count * 3;
        },
        handleLoad(type) {
            const entry = this.list.filter((e) => e.value == type)[0];
            const page = entry.page;
            const requestSerial = ++this.requestSerial;
            const params = { ...this.params };
            this.pendingRequests = 0;
            this.loading = true;
            if (this.active === "all") {
                params.per = this.count;
                params.page = page + 1 > entry.pages ? 1 : page + 1;
            } else {
                params.per = this.count * 3;
                params.page = page + 1;
            }
            params.type = type;
            this.loadList(params, type, {
                appendMode: this.appendMode,
                requestSerial,
            });
        },
    },
    mounted: function () {
        this.showCount();
        this.loadData();
        window.addEventListener("resize", this.handleResize);
    },
    beforeUnmount() {
        window.clearTimeout(this.keywordTimer);
        this.requestSerial += 1;
        window.removeEventListener("resize", this.handleResize);
    },
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/pc/list.less";
@import "~@/assets/css/common/drawer.less";
@import "~@/assets/css/modules/adventure-list-theme.less";
</style>
