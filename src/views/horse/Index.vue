<template>
    <PvxPageShell class="p-pvx-horse-list" v-loading="loading">
        <div class="m-pvx-horse-layout" ref="listRef">
            <PvxSearch
                v-if="searchReady"
                class="m-pvx-horse-tabs"
                popperClass="u-pvx-horse-filter"
                :items="searchItems"
                :initValue="searchInitValue"
                variant="modern"
                inline-search-icon
                i18n-scope="pages.horse.ui.search"
                @search="handleSearch"
            />
            <!-- 全部模式 -->
            <template v-if="active === ''">
                <!-- 抓马播报 -->
                <HorseBroadcastV2 v-if="client === 'std'"></HorseBroadcastV2>
                <!-- 普通坐骑、奇趣坐骑、马具 -->
                <PvxSurface
                    v-for="item in overviewList"
                    :key="item.type"
                    class="m-pvx-horse-section"
                    padding="medium"
                >
                    <PvxSectionHeader
                        class="m-pvx-horse-section-header m-pvx-horse-section-header--overview"
                        :title="item.name"
                        level="h2"
                    >
                        <template #action>
                            <button type="button" class="u-pvx-horse-view-all" @click="clickTabs(item.type)">
                                {{ $t("pages.horse.ui.actions.viewAll") }}
                            </button>
                        </template>
                    </PvxSectionHeader>
                    <div class="m-pvx-horse-card-grid">
                        <template v-if="item.type !== 2">
                            <HorseCard v-for="_item in item.list" :key="_item.ID" :item="_item" />
                        </template>
                        <template v-else>
                            <SameItem v-for="_item in item.list" :key="_item.ID" :item="_item" />
                        </template>
                    </div>
                </PvxSurface>
            </template>
            <!-- 列表模式 -->
            <PvxSurface v-else-if="subList.length" class="m-pvx-horse-section" padding="medium">
                <PvxSectionHeader class="m-pvx-horse-section-header" :title="typeName" level="h2">
                    <template #action>
                        <span class="u-pvx-horse-result-count">
                            {{ $t("pages.horse.ui.resultCount", { count: total }) }}
                        </span>
                        <div class="m-pvx-horse-operate" :aria-label="$t('pages.horse.ui.viewMode')">
                            <button
                            v-for="item in localizedShowTypes"
                                :key="item.value"
                                type="button"
                                class="m-pvx-horse-operate__item"
                                :class="{ active: showType === item.value }"
                                :aria-pressed="showType === item.value"
                                @click="showType = item.value"
                            >
                            {{ item.label }}
                            </button>
                        </div>
                    </template>
                </PvxSectionHeader>
                <div class="m-pvx-horse-card-grid" v-if="showType === 'card'">
                    <template v-if="active !== 2">
                        <HorseCard v-for="item in subList" :key="item.ID" :item="item"
                            :reporter="{ aggregate: listId(subList) }" />
                    </template>
                    <template v-else>
                        <SameItem v-for="item in subList" :key="item.ID" :item="item"
                            :reporter="{ aggregate: listId(item.list) }" />
                    </template>
                </div>
                <div class="m-pvx-horse-list__list" v-if="showType === 'list'">
                    <ListHead></ListHead>
                    <HorseItem v-for="item in subList" :key="item.ID" :item="item"
                        :reporter="{ aggregate: listId(subList) }" />
                </div>
                <el-button class="m-archive-more" v-show="hasNextPage" type="primary"
                    @click="appendPage" :loading="loading">
                    <el-icon v-if="!loading" class="el-icon--left"><ArrowDown /></el-icon>
                    {{ $t("pages.horse.ui.actions.loadMore") }}
                </el-button>
                <el-pagination class="m-archive-pages" background layout="total, prev, pager, next, jumper"
                    :hide-on-single-page="true" :page-size="per" :total="total" :current-page="page"
                    @current-change="changePage"></el-pagination>
            </PvxSurface>
            <PvxSurface v-if="showEmpty" class="m-pvx-horse-empty-surface" padding="medium">
                <PvxEmptyState
                    illustrated
                    :title="$t('pages.horse.ui.empty.title')"
                    :description="$t('pages.horse.ui.empty.description')"
                />
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
import { getHorses, getFeeds, getAttrs } from "@/service/horse";
import horseData from "@/assets/data/horse.json";
import PvxSearch from "@/components/PvxSearch.vue";
import HorseBroadcastV2 from "@/components/horse/HorseBroadcastV2";
import HorseCard from "@/components/horse/HorseCard";
import SameItem from "@/components/horse/SameItem.vue";
import ListHead from "@/components/horse/ListHead";
import HorseItem from "@/components/horse/HorseItem";
import { omit, cloneDeep, concat, isEqual, debounce } from "lodash";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import { getHorseType, getHorseModeName, getHorseSpeed } from "@/utils/horse";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { ArrowDown } from "@element-plus/icons-vue";
const { list, searchType, showTypes } = horseData;

export default {
    name: "HorseHome",
    components: {
        SameItem,
        HorseCard,
        HorseBroadcastV2,
        PvxSearch,
        ListHead,
        HorseItem,
        PvxEmptyState,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        ArrowDown,
    },
    data() {
        return {
            loading: false,
            showType: "card",
            keyword: "",
            active: "",
            page: 1, //当前页数
            total: 0, //总条目数
            per: 0, //每页条目
            count: 0, // 自动判断最多显示几个
            itemData: {
                color: "#E86F00",
                width: "220",
            },
            appendMode: false,
            feeds: [],
            attrs: [],
            filter: false,
            feed: "",
            attr: "",
            searchReady: false, // 标记 filter 选项是否加载完成
            searchInitValue: {}, // 初始搜索值，只在初始化时设置一次

            typeList: [],
            list,
            searchType,
            showTypes,
            queryParams: {},
            isFirstSearch: true,
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        params() {
            const _params = { client: this.client, per: this.per };
            if (this.keyword) _params.keyword = this.keyword;
            if (this.active !== "") _params.type = this.active;
            if (this.feed) _params.feed = this.feed;
            if (this.attr) _params.attr = this.attr;
            return _params;
        },
        hasNextPage: function () {
            const current = this.typeList.find((e) => e.type === this.active);
            const pages = current?.pages || 1;
            return pages > 1 && this.page < pages;
        },
        typeName() {
            return this.typeLabel(this.active);
        },
        subList() {
            if (this.active === "") return [];
            return this.typeList.find((e) => e.type === this.active)?.list || [];
        },
        overviewList() {
            return this.typeList
                .filter((item) => item.type !== "" && item.list?.length)
                .map((item) => ({ ...item, name: this.typeLabel(item.type) }));
        },
        localizedShowTypes() {
            return this.showTypes.map((item) => ({
                ...item,
                label: this.$t(`pages.horse.ui.views.${item.value}`),
            }));
        },
        showEmpty() {
            if (this.loading) return false;
            return this.active === "" ? !this.overviewList.length : !this.subList.length;
        },
        searchItems() {
            return [
                {
                    key: "type",
                    type: "radio",
                    options: this.list.map((item) => ({
                        type: item.type,
                        name: this.typeLabel(item.type),
                    })),
                },
                {
                    type: "filter",
                    options: this.searchType.map((item) => ({
                        key: item.key,
                        type: item.type,
                        name: this.$t(`pages.horse.ui.filters.${item.key}`),
                        options: item.list,
                    })),
                },
                {
                    key: "keyword",
                    name: this.$t("pages.horse.ui.filters.keyword"),
                },
            ];
        },
    },
    watch: {
        list: {
            immediate: true,
            handler: function (_list) {
                this.typeList = cloneDeep(_list);
            },
        },
    },
    methods: {
        iconLink,
        typeLabel(type) {
            const keyMap = {
                "": "all",
                0: "normal",
                1: "fun",
                2: "gear",
            };
            return this.$t(`pages.horse.ui.types.${keyMap[type] || "all"}`);
        },
        clickTabs(type) {
            const current = this.typeList.find((item) => item.type == type);
            if (!current) {
                this.active = "";
                this.page = 1;
                this.loadData();
                return;
            }
            this.active = current.type;
            this.typeList = this.typeList.map((e) => {
                e.page = 1;
                return e;
            });
            this.page = 1;
            // 触发数据加载
            this.loadData();
        },
        loadInfoData() {
            Promise.all([
                getFeeds({ client: this.client }).then((res) => {
                    const arr = res.data.map((item) => {
                        const start = item.tip.indexOf("【");
                        const end = item.tip.indexOf("】");
                        item.feed = item.tip.slice(start + 1, end);
                        return item;
                    });
                    let newArr = [];
                    arr.forEach((item) => {
                        const index = newArr.findIndex((nItem) => nItem.feed === item.feed);
                        if (index > -1) {
                            newArr[index].id += "," + item.id;
                        } else {
                            newArr.push(item);
                        }
                    });
                    this.feeds = newArr.map((item) => {
                        return {
                            label: item.feed,
                            value: item.feed, // 使用饲料名称作为 value
                            id: item.id, // 保留 id 供其他地方使用
                        };
                    });
                    this.searchType[0].list = this.feeds;
                }),
                getAttrs({ client: this.client }).then((res) => {
                    const data = res.data;
                    const options = data.map((item) => {
                        return {
                            label: item.name,
                            value: item.name,
                        };
                    });
                    this.attrs = options;
                    this.searchType[1].list = this.attrs;
                })
            ]).then(() => {
                // 所有 filter 选项加载完成，设置初始值
                this.searchInitValue = {
                    type: this.active,
                    keyword: this.keyword,
                    feed: this.feed,
                    attr: this.attr,
                };
                this.searchReady = true;
            });
        },
        getFeed(item) {
            if (item.SubType !== 15) return "";
            const feedItem = this.feeds.find((f) => f.id === item.DetailType);
            return feedItem ? feedItem.label : "";
        },
        listId(list) {
            if (!list?.length) return [];
            return list.map((e) => e.ID);
        },
        changePage(i) {
            this.page = i;
            this.loadData();
        },
        showCount() {
            const listWidth = this.$refs.listRef?.clientWidth || 1200;
            const cardWidth = 220;
            const cardGap = 20;
            const sectionInlinePadding = 48;
            const availableWidth = Math.max(listWidth - sectionInlinePadding, cardWidth);
            const fittedCount = Math.max(1, Math.floor((availableWidth + cardGap) / (cardWidth + cardGap)));

            // 与 face 列表保持一致：总览至少准备 6 条，分类列表准备两行数据。
            this.count = Math.max(6, fittedCount);
            this.per = this.active === "" ? this.count : this.count * 2;
        },
        appendPage() {
            this.appendMode = true;
            this.handleLoad(this.active, true);
        },
        handleLoad(type, append) {
            const page = this.typeList.filter((e) => e.type === type)[0].page;
            let params = { ...this.params };
            params.page = page + 1;
            params.per = append ? this.per : this.count;
            params.type = type;
            this.loadList(params, type);
        },
        loadData(params = this.params) {
            this.loading = true;
            params = omit(params, ["type", "value", "label"]);
            if (this.active === "") {
                const list = this.typeList.filter((e) => e.type !== "");
                list.forEach((e) => {
                    params.page = e.page;
                    params.type = e.type;
                    params.per = this.count;
                    this.loadList(params, e.type);
                });
            } else {
                params.page = this.page;
                params.per = this.per;
                this.loadList({ ...params, type: this.active }, this.active);
            }
        },
        loadList(params, key) {
            const typeEntry = this.typeList.find((e) => e.type === key);
            if (!typeEntry) return;
            if (typeEntry.pages < params.page && this.active === "") params.page = 1;
            getHorses(params)
                .then((res) => {
                    const { list, total, pages, page, per } = res.data;
                    const _list = this.appendMode ? concat(typeEntry.list, list) : list;
                    const newList = _list.map((item) => ({
                        ...item,
                        typeName: getHorseType(item),
                        modeName: getHorseModeName(item),
                        feedName: this.getFeed(item),
                        speed: getHorseSpeed(item),
                        MagicAttributes: item.MagicAttributes?.map((mItem) => ({
                            ...mItem,
                            iconUrl: this.iconLink(mItem.icon),
                        })),
                    }));
                    typeEntry.list = newList || [];
                    typeEntry.page = page || 1;
                    typeEntry.pages = pages || 1;
                    if (this.active !== "") this.page = page || 1;
                    this.total = total;
                    this.per = per;
                })
                .finally(() => {
                    this.loading = false;
                    this.appendMode = false;
                });
        },
        checkboxChange(key) {
            const value = this.checkboxData[key];
            this[key] = value.join(",");
        },
        reset() {
            this.searchType = this.searchType.map((item) => {
                item.checked = [];
                return item;
            });
            this.feed = [];
            this.attr = [];
        },
        handleSearch(data) {
            if (!data || typeof data !== "object" || data instanceof Event) return;

            // 检查参数是否变化
            if (isEqual(data, this.queryParams)) return;
            this.queryParams = { ...data };

            const { type, keyword, feed, attr } = data;
            this.keyword = keyword || "";
            // 更新 feed 和 attr，供 params 计算属性使用
            this.feed = feed || "";
            this.attr = attr || "";

            // 处理类型切换（使用严格相等避免 0 == "" 的问题）
            const current = this.typeList.find((item) => item.type === type);
            if (!current) {
                this.active = "";
                this.page = 1;
                this.loadData(this.params);
                return;
            }

            this.active = current.type;
            this.typeList = this.typeList.map((e) => {
                e.page = 1;
                return e;
            });
            this.page = 1;

            // 首次搜索不触发数据加载
            if (this.isFirstSearch) {
                this.isFirstSearch = false;
                return;
            }

            // 构建请求参数，直接使用 data 中的值
            const params = {
                client: this.client,
                per: this.per,
                page: this.page,
                type: this.active,
            };
            if (keyword) params.keyword = keyword;
            if (feed) params.feed = feed;
            if (attr) params.attr = attr;

            // 调用 loadData
            this.loadData(params);
        },
    },
    mounted() {
        this.showCount();
        this.loadInfoData();

        // 加载初始数据
        this.$nextTick(() => {
            this.loadData();
        });

        this.handleResize = debounce(this.showCount, 300);
        window.addEventListener("resize", this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
};
</script>

<style lang="less">
@import "~@/assets/css/horse/pc/index.less";
@import "~@/assets/css/modules/horse-list-theme.less";
</style>
