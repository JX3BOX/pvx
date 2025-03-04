<template>
    <div class="horse-home-wrapper">
        <CommonToolbar
            ref="toolbar"
            class="m-horse-tabs"
            :active="active"
            color="#d16400"
            search
            :types="list"
            @update="updateToolbar"
        >
            <template v-slot:filter>
                <div class="u-filter">
                    <el-popover
                        ref="popover"
                        :placement="isPhone ? 'right' : 'bottom'"
                        :width="!isPhone && 420"
                        trigger="click"
                    >
                        <div class="filter-content">
                            <div class="filter-item" v-for="(sItem, i) in searchType" :key="i">
                                <div class="check-box-wrapper">
                                    <div class="name">{{ sItem.name }}</div>
                                    <el-checkbox-group v-model="searchType[i].checked">
                                        <el-checkbox-button
                                            v-for="option in sItem.list"
                                            :label="option.label"
                                            :key="option.value"
                                        ></el-checkbox-button>
                                    </el-checkbox-group>
                                </div>
                            </div>
                            <el-row>
                                <el-col :offset="20" :span="4">
                                    <el-button size="mini" type="info" plain @click="reset">重置</el-button>
                                </el-col>
                            </el-row>
                        </div>
                        <template slot="reference">
                            <img svg-inline src="@/assets/img/filter.svg" @click="filter = true" />
                        </template>
                    </el-popover>
                </div>
            </template>
        </CommonToolbar>
        <div class="m-horse-content" ref="listRef" v-loading="loading">
            <!-- 全部模式 -->
            <template v-if="active === ''">
                <!-- 抓马播报 -->
                <HorseBroadcastV2 v-if="client === 'std'"></HorseBroadcastV2>
                <!-- 普通坐骑、奇趣坐骑、马具 -->
                <div v-for="(item, i) in typeList" :key="i" class="m-list-wrapper">
                    <template v-if="item.list && item.list.length">
                        <CardBannerList
                            :count="count"
                            :data="{ ...itemData, type: item.type }"
                            @update:load="handleLoad"
                            :items="item.list"
                        >
                            <template v-slot:title>
                                <div>{{ item.name }}</div>
                            </template>
                            <template v-slot:action>
                                <div @click="clickTabs(item.value)" :v="item.value">查看全部</div>
                            </template>
                            <template v-slot="{ item: _item }">
                                <template v-if="item.type !== 2">
                                    <HorseCard :key="_item.ID" :item="_item" :reporter="{ aggregate: listId(list) }" />
                                </template>
                                <template v-else>
                                    <SameItem :key="_item.ID" :item="_item" :reporter="{ aggregate: listId(list) }" />
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
                        <div
                            class="m-item"
                            :class="showType === item.value && 'active'"
                            :key="item.value"
                            v-for="item in showTypes"
                            @click="showType = item.value"
                        >
                            {{ item.label }}
                        </div>
                    </div>
                </div>
                <template v-if="subList.length">
                    <div class="m-horse-list--card" v-if="showType === 'card'">
                        <template v-if="active !== 2">
                            <HorseCard
                                :style="!isPhone ? `width: calc(100% / ${count} - 20px)` : ''"
                                v-for="item in subList"
                                :key="item.ID"
                                :item="item"
                                :reporter="{ aggregate: listId(subList) }"
                            />
                        </template>
                        <template v-else>
                            <SameItem
                                :style="!isPhone ? `width: calc(100% / ${count} - 20px)` : ''"
                                v-for="item in subList"
                                :key="item.ID"
                                :item="item"
                                :reporter="{ aggregate: listId(item.list) }"
                            />
                        </template>
                    </div>
                    <div class="m-horse-list--list" v-if="showType === 'list'">
                        <ListHead></ListHead>
                        <HorseItem
                            v-for="item in subList"
                            :key="item.ID"
                            :item="item"
                            :reporter="{ aggregate: listId(subList) }"
                        />
                    </div>
                </template>
                <el-button
                    class="m-archive-more"
                    v-show="hasNextPage"
                    type="primary"
                    plain
                    @click="appendPage"
                    :loading="loading"
                    icon="el-icon-arrow-down"
                    >加载更多</el-button
                >
                <el-pagination
                    class="m-archive-pages"
                    background
                    layout="total, prev, pager, next, jumper"
                    :hide-on-single-page="true"
                    :page-size="per"
                    :total="total"
                    :current-page="page"
                    @current-change="changePage"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { getHorses, getFeeds, getAttrs } from "@/service/horse";
import { list, searchType, showTypes } from "@/assets/data/horse.json";
import CommonToolbar from "@/components/common/toolbar.vue";
import HorseBroadcastV2 from "@/components/horse/HorseBroadcastV2";
import HorseCard from "@/components/horse/HorseCard";
import SameItem from "@/components/horse/SameItem.vue";
import ListHead from "@/components/horse/ListHead";
import HorseItem from "@/components/horse/HorseItem";
import { omit, cloneDeep, concat } from "lodash";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import { isPhone } from "@/utils/index";
import CardBannerList from "@/components/common/card_banner_list.vue";

export default {
    name: "HorseHome",
    components: { SameItem, HorseCard, HorseBroadcastV2, CardBannerList, CommonToolbar, ListHead, HorseItem },
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
            const pages = this.typeList.filter((e) => e.type === this.active)[0].pages;
            return pages > 1 && this.page < pages;
        },
        typeName() {
            return this.typeList.filter((e) => e.type == this.active)[0].name;
        },
        subList() {
            if (this.active === "") return null;
            return this.typeList.filter((e) => e.type === this.active)[0].list;
        },
        isPhone() {
            return isPhone();
        },
    },
    watch: {
        list: {
            immediate: true,
            handler: function (_list) {
                this.typeList = cloneDeep(_list);
            },
        },
        params: {
            deep: true,
            handler() {
                this.loadData();
            },
        },
        searchType: {
            deep: true,
            handler() {
                const feed = this.searchType[0].checked.join(",");
                const attr = this.searchType[1].checked.join(",");
                this.page = 1;
                if (this.filter) {
                    this.loadData({ ...this.params, feed, attr });
                }
            },
        },
    },
    methods: {
        iconLink,
        clickTabs(type) {
            const active = this.typeList.filter((item) => item.value == type)[0].type;
            this.active = active;
            this.typeList = this.typeList.map((e) => {
                e.page = 1;
                return e;
            });
            console.log();
            this.$refs.toolbar.changeType(type);
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
        // 按宽度显示个数
        showCount() {
            if (this.isPhone) {
                this.per = 8;
                this.count = 8;
                return;
            }
            const listWidth = this.$refs.listRef?.clientWidth - 120;
            this.count = Math.floor(listWidth / this.itemData.width);
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
        updateToolbar(data) {
            const { type, search } = data;
            this.keyword = search;
            this.clickTabs(type);
        },
    },
    mounted() {
        this.showCount();
        this.loadInfoData();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/search.less";
@import "~@/assets/css/common/tabs.less";
@import "~@/assets/css/horse/index.less";
</style>
