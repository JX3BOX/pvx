<template>
    <div class="p-pvx-horse">
        <PvxSearch v-if="searchReady" class="m-pvx-horse-tabs" popperClass="u-pvx-horse-filter" :items="searchItems" :initValue="searchInitValue"
            @search="handleSearch">
        </PvxSearch>
        <div class="m-pvx-horse-content" ref="listRef" v-loading="loading">
            <!-- 全部模式 -->
            <template v-if="active === ''">
                <!-- 抓马播报 -->
                <HorseBroadcastV2 v-if="client === 'std'"></HorseBroadcastV2>
                <!-- 普通坐骑、奇趣坐骑、马具 -->
                <div v-for="(item, i) in typeList" :key="i" class="m-pvx-horse-list-wrapper">
                    <template v-if="item.list && item.list.length">
                        <CardBannerList :count="count" :data="{ ...itemData, type: item.type }"
                            @update:load="handleLoad" :items="item.list">
                            <template v-slot:title>
                                <div>{{ item.name }}</div>
                            </template>
                            <template v-slot:action>
                                <div @click="clickTabs(item.value)" :v="item.value">查看全部</div>
                            </template>
                            <template v-slot="{ item: _item }">
                                <template v-if="item.type !== 2">
                                    <HorseCard :key="_item.ID" :item="_item" />
                                </template>
                                <template v-else>
                                    <SameItem :key="_item.ID" :item="_item" />
                                </template>
                            </template>
                        </CardBannerList>
                    </template>
                </div>
            </template>
            <!-- 列表模式 -->
            <div class="m-pvx-horse-list" v-else>
                <div class="u-pvx-horse-type u-pvx-all-type">
                    <div class="u-pvx-horse-title">{{ typeName }}</div>
                    <div v-if="active !== ''" class="m-pvx-horse-operate">
                        <div class="m-pvx-horse-operate__item" :class="showType === item.value && 'active'"
                            :key="item.value" v-for="item in showTypes" @click="showType = item.value">
                            {{ item.label }}
                        </div>
                    </div>
                </div>
                <template v-if="subList.length">
                    <div class="m-pvx-horse-list__card" v-if="showType === 'card'"
                        :style="`grid-template-columns: repeat(${count}, 1fr)`">
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
                </template>
                <el-button class="m-pvx-horse-archive-more" v-show="hasNextPage" type="primary" plain
                    @click="appendPage" :loading="loading" icon="el-icon-arrow-down">加载更多</el-button>
                <el-pagination class="m-pvx-horse-archive-pages" background layout="total, prev, pager, next, jumper"
                    :hide-on-single-page="true" :page-size="per" :total="total" :current-page="page"
                    @current-change="changePage"></el-pagination>
            </div>
        </div>
    </div>
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
import CardBannerList from "@/components/common/card_banner_list.vue";
import { getHorseType, getHorseModeName, getHorseSpeed } from "@/utils/horse";
const { list, searchType, showTypes } = horseData;

export default {
    name: "HorseHome",
    components: { SameItem, HorseCard, HorseBroadcastV2, CardBannerList, PvxSearch, ListHead, HorseItem },
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
            return this.typeList.find((e) => e.type == this.active)?.name || "";
        },
        subList() {
            if (this.active === "") return [];
            return this.typeList.find((e) => e.type === this.active)?.list || [];
        },
        searchItems() {
            return [
                {
                    key: "type",
                    type: "radio",
                    options: this.list.map((item) => ({
                        type: item.type,
                        name: item.label,
                    })),
                },
                {
                    type: "filter",
                    options: this.searchType.map((item) => ({
                        key: item.key,
                        type: item.type,
                        name: item.name,
                        options: item.list,
                    })),
                },
                {
                    key: "keyword",
                    name: "关键词",
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

            if (listWidth <= 520) {
                this.count = 1;
                this.per = 16;
                return;
            }
            if (listWidth <= 1024) {
                this.count = 2;
                this.per = 32;
                return;
            }

            this.count = Math.floor((listWidth - 120) / cardWidth);
            // 加载足够填满 2 行的数据量
            this.per = this.count * 2;
        },
        appendPage() {
            this.appendMode = true;
            this.handleLoad(this.active, true);
        },
        handleLoad(type, append) {
            const page = this.typeList.filter((e) => e.type === type)[0].page;
            let params = { ...this.params };
            params.page = page + 1;
            params.per = append ? this.count * 3 : this.count;
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
                params.per = this.count * 3;
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
    @import "~@/assets/css/common/search.less";
    @import "~@/assets/css/common/tabs.less";
    @import "~@/assets/css/horse/pc/index.less";

    @media screen and (max-width: @ipad-y) {
        .p-pvx-horse {
            .type-list {
                width: 100%;

                .type-item {
                    &:first-child {
                        margin-right: 0 !important;
                        width: 100% !important;
                        flex-shrink: 0;
                    }

                    &:not(:first-child) {
                        width: calc(50% - 20px) !important;
                    }
                }
            }

            .pvx-search-wrapper {
                flex-direction: column;
                height: auto;

                .search-group {
                    flex-wrap: wrap;
                    flex-direction: row;

                    .filter-wrap {
                        width: 40px;
                        flex-shrink: 0;
                        margin-right: 0;
                    }

                    .input-wrap {
                        width: calc(100% - 40px);
                        flex-shrink: 0;
                    }

                }
            }
        }
    }
</style>
