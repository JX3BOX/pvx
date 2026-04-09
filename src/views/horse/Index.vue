<template>
    <div class="horse-home-wrapper">
        <PvxSearch class="m-horse-tabs" :items="searchItems" :initValue="searchInitValue" @search="handleSearch">
        </PvxSearch>
        <div class="m-horse-content" ref="listRef" v-loading="loading">
            <!-- 全部模式 -->
            <template v-if="active === ''">
                <!-- 抓马播报 -->
                <HorseBroadcastV2 v-if="client === 'std'"></HorseBroadcastV2>
                <!-- 普通坐骑、奇趣坐骑、马具 -->
                <div v-for="(item, i) in typeList" :key="i" class="m-list-wrapper">
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
            <div class="m-horse-list" v-else>
                <div class="u-type u-all-type">
                    <div class="u-title">{{ typeName }}</div>
                    <div v-if="active !== ''" class="m-operate">
                        <div class="m-item" :class="showType === item.value && 'active'" :key="item.value"
                            v-for="item in showTypes" @click="showType = item.value">
                            {{ item.label }}
                        </div>
                    </div>
                </div>
                <template v-if="subList.length">
                    <div class="m-horse-list--card" v-if="showType === 'card'">
                        <template v-if="active !== 2">
                            <HorseCard v-for="item in subList" :key="item.ID" :item="item"
                                :reporter="{ aggregate: listId(subList) }" />
                        </template>
                        <template v-else>
                            <SameItem v-for="item in subList" :key="item.ID" :item="item"
                                :reporter="{ aggregate: listId(item.list) }" />
                        </template>
                    </div>
                    <div class="m-horse-list--list" v-if="showType === 'list'">
                        <ListHead></ListHead>
                        <HorseItem v-for="item in subList" :key="item.ID" :item="item"
                            :reporter="{ aggregate: listId(subList) }" />
                    </div>
                </template>
                <el-button class="m-archive-more" v-show="hasNextPage" type="primary" plain @click="appendPage"
                    :loading="loading" icon="el-icon-arrow-down">加载更多</el-button>
                <el-pagination class="m-archive-pages" background layout="total, prev, pager, next, jumper"
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
import { omit, cloneDeep, concat } from "lodash";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import CardBannerList from "@/components/common/card_banner_list.vue";
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

            typeList: [],
            list,
            searchType,
            showTypes,
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
        searchInitValue() {
            return {
                type: this.active,
                keyword: this.keyword,
            };
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
                return;
            }
            this.active = current.type;
            this.typeList = this.typeList.map((e) => {
                e.page = 1;
                return e;
            });
            this.page = 1;
        },
        loadInfoData() {
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
                        value: item.id,
                    };
                });
                this.searchType[0].list = this.feeds;
            });
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
            });
        },
        getFeed(item) {
            let feed = "";
            if (item.SubType === 15) {
                feed = this.feeds.find((fitem) => fitem.id === item.DetailType)
                    ? this.feeds.find((fitem) => fitem.id === item.DetailType).feed
                    : "";
            }
            return feed;
        },
        // 可否双骑
        canDouble(item) {
            let name = "";
            if (item.SubType === 15) {
                if (item.MagicAttributes && item.MagicAttributes.length) {
                    name = item.MagicAttributes.find((attr) => attr.id === "15650")
                        ? item.MagicAttributes.find((attr) => attr.id === "15650").name
                        : "单骑";
                }
            }
            return name;
        },
        getType(item) {
            // SubType 15为坐骑 23 为马具
            // DetailType 0普通坐骑，非0奇趣坐骑, 非0决定feed
            // DetailType 0头饰，1鞍饰，2足饰，3马饰
            let type = "";
            if (item.SubType === 15) {
                if (item.DetailType === 0) {
                    type = "普通坐骑";
                } else {
                    type = "奇趣坐骑";
                }
            } else if (item.SubType === 23) {
                if (item.DetailType === 0) {
                    type = "头饰";
                } else if (item.DetailType === 1) {
                    type = "鞍饰";
                } else if (item.DetailType === 2) {
                    type = "足饰";
                } else if (item.DetailType === 3) {
                    type = "马饰";
                } else {
                    type = "马具";
                }
            }
            return type;
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
                this.per = 8;
                return;
            }
            if (listWidth <= 1024) {
                this.count = 2;
                this.per = 16;
                return;
            }

            this.count = Math.floor((listWidth - 120) / cardWidth);
            this.per = this.count;
        },
        appendPage() {
            this.appendMode = true;
            this.handleLoad(this.active, true);
        },
        handleLoad(type, append) {
            const page = this.typeList.filter((e) => e.type === type)[0].page;
            let params = cloneDeep(this.params);
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
            const index = this.typeList.findIndex((e) => e.type === key);
            if (this.typeList[index].pages < params.page && this.active === "") params.page = 1;
            getHorses(params)
                .then((res) => {
                    const { list, total, pages, page, per } = res.data;
                    const _list = this.appendMode ? concat(this.typeList[index].list, list) : list;
                    const newList = _list.map((item) => {
                        item.typeName = this.getType(item);
                        item.modeName = this.canDouble(item);
                        item.feedName = this.getFeed(item);
                        if (item.MoveSpeed) {
                            item.speed = item.MoveSpeedDesc.split("移动速度提高")[1];
                        }
                        if (item.MagicAttributes && item.MagicAttributes.length) {
                            item.MagicAttributes.map((mItem) => {
                                mItem.iconUrl = this.iconLink(mItem.icon);
                                return mItem;
                            });
                        }
                        return item;
                    });
                    this.typeList[index].list = newList || [];
                    this.typeList[index].page = page || 1;
                    this.typeList[index].pages = pages || 1;
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
            const { type, keyword, feed, attr } = data;
            this.keyword = keyword || "";

            // 处理类型切换（使用严格相等避免 0 == "" 的问题）
            const current = this.typeList.find((item) => item.type === type);
            if (!current) {
                this.active = "";
                this.page = 1;
                this.loadData(this.params);
                return;
            }

            // 如果 type 没有变化且已有数据，直接返回
            if (this.active === type && this.typeList.some(e => e.list && e.list.length > 0)) {
                return;
            }


            this.active = current.type;
            this.typeList = this.typeList.map((e) => {
                e.page = 1;
                return e;
            });
            this.page = 1;

            // 构建请求参数
            const params = {
                client: this.client,
                per: this.per,
                page: this.page,
                type: this.active,
            };
            if (this.keyword) params.keyword = this.keyword;
            if (feed) params.feed = feed;
            if (attr) params.attr = attr;

            // 调用 loadData
            this.loadData(params);
        },
        debounce(fn, delay = 300) {
            let timer = null;
            return (...args) => {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    fn.apply(this, args);
                }, delay);
            };
        },
    },
    mounted() {
        this.showCount();
        this.loadInfoData();

        this.handleResize = this.debounce(this.showCount, 300);
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
@import "~@/assets/css/horse/index.less";
</style>
