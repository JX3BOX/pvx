<template>
    <div class="p-book">
        <CommonToolbar class="m-reputation-tabs" color="#d16400" search :types="professions" @update="updateToolbar" />
        <div class="m-content" ref="listRef" v-loading="loading">
            <template v-if="active === 0">
                <div v-for="(item, i) in list" :key="item.label + i" class="m-book-list">
                    <template v-if="item.list.length">
                        <CardBannerList
                            v-if="item.id !== 8"
                            :count="count"
                            :minw="190"
                            :data="{ ...itemData, type: item.id }"
                            @update:load="handleLoad"
                            :items="item.list"
                        >
                            <template v-slot:title>
                                <div>
                                    【{{ item.label }}】
                                    <span class="u-tips">
                                        共<b>{{ item.total }} </b>本{{ item.label }}
                                    </span>
                                </div>
                            </template>
                            <template v-slot:action>
                                <div @click="clickTabs(item.id)" v-if="item.id !== 8">查看全部</div>
                            </template>
                            <template v-slot="{ item }">
                                <BookCard :item="item" :reporter="{ aggregate: listId(list) }" @click="setItem(item)" />
                            </template>
                        </CardBannerList>
                        <list-cross v-else key="recentRead" ref="recentRead" :list="item.list" :radius="10" :gap="20">
                            <template v-slot="data">
                                <BookCard :item="data.item"></BookCard>
                            </template>
                        </list-cross>
                    </template>
                </div>
            </template>
            <div v-else class="m-book-all">
                <div class="m-book-list">
                    <div class="u-type u-all-type">
                        <div class="u-title">{{ typeName }}</div>
                        <div v-if="active !== 0" class="m-operate">
                            <div
                                class="m-item"
                                :class="showType === item.value && 'active'"
                                :key="item.value + Math.random()"
                                v-for="item in showTypes"
                                @click="showType = item.value"
                            >
                                {{ item.label }}
                            </div>
                        </div>
                    </div>
                    <template v-if="subList.length">
                        <div class="m-book-list--card" v-if="showType === 'card'">
                            <BookCard
                                v-for="item in subList"
                                :key="item.ID + Math.random()"
                                :item="item"
                                :reporter="{ aggregate: listId(subList) }"
                            />
                        </div>
                        <div class="m-book-list--list" v-if="showType === 'list'">
                            <ListHead></ListHead>
                            <BookItem
                                v-for="item in subList"
                                :key="item.ID + Math.random()"
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
    </div>
</template>

<script>
import ListCross from "@/components/ListCross.vue";
import CardBannerList from "@/components/common/card_banner_list.vue";
import CommonToolbar from "@/components/common/toolbar.vue";
import professions from "@/assets/data/book_profession.json";
import { isPhone } from "@/utils/index";
import { omit, cloneDeep, concat } from "lodash";
import BookItem from "@/components/book/result/book_item.vue";
import BookCard from "@/components/book/BookCard.vue";
import ListHead from "@/components/book/result/list_head.vue";
import { mapState } from "vuex";
import { getList } from "@/service/book";

export default {
    name: "Index",
    components: { CardBannerList, CommonToolbar, BookCard, BookItem, ListHead, ListCross },
    data() {
        return {
            loading: false,
            keyword: "",
            active: 0,
            data: [],
            itemData: {
                color: "#324148",
                width: "250",
                height: "380",
            },
            list: [
                {
                    id: 8,
                    label: "最近阅读",
                    page: 1,
                    pages: 1,
                    total: 0,
                    list: [],
                },
                {
                    id: 11,
                    label: "杂集",
                    page: 1,
                    pages: 1,
                    total: 0,
                    list: [],
                },
                {
                    id: 10,
                    label: "道学",
                    page: 1,
                    pages: 1,
                    total: 0,
                    list: [],
                },
                {
                    id: 9,
                    label: "佛学",
                    page: 1,
                    pages: 1,
                    total: 0,
                    list: [],
                },
            ],

            page: 1, //当前页数
            total: 0, //总条目数
            per: 0, //每页条目
            count: 0, // 自动判断最多显示几个

            showTypes: [
                {
                    value: "list",
                    label: "列表",
                },
                {
                    value: "card",
                    label: "卡片",
                },
            ],
            showType: "card",

            appendMode: false,
        };
    },
    computed: {
        professions() {
            const _list = professions
                .filter((item) => item.id !== 8)
                .map((item) => {
                    item.label = item.name;
                    item.value = item.id;
                    return item;
                });
            return [{ id: 0, value: -1, name: "全部", label: "全部" }, ..._list];
        },
        ...mapState(["recentReadList"]),
        client() {
            return this.$store.state.client;
        },
        params() {
            const _params = { client: this.client };
            if (this.keyword) _params.keyword = this.keyword;
            if (this.active) _params.profession = this.active;
            return _params;
        },
        typeName() {
            return this.list.filter((e) => e.id == this.active)[0].label;
        },
        hasNextPage: function () {
            const pages = this.list.filter((e) => e.id == this.active)[0].pages;
            return pages > 1 && this.page < pages;
        },
        subList() {
            if (this.active === 0) return null;
            return this.list.filter((e) => e.id == this.active)[0].list;
        },
        isPhone() {
            return isPhone();
        },
        readingBook() {
            return localStorage.getItem("book_readings") || "[]";
        },
    },
    watch: {
        params: {
            deep: true,
            handler() {
                this.loadData();
            },
        },
        active: {
            immediate: true,
            handler: function () {
                this.page = 1;
            },
        },
    },
    methods: {
        updateToolbar(data) {
            const { type, search } = data;
            this.keyword = search;
            this.clickTabs(type);
        },
        clickTabs(id) {
            this.active = id == -1 ? 0 : id;
            this.list = this.list.map((e) => {
                e.page = 1;
                return e;
            });
            this.page = 1;
        },
        listId(list) {
            if (!list?.length) return [];
            return list.map((e) => e.ID);
        },
        changePage(i) {
            this.page = i;
            this.loadData();
        },
        setItem(item) {
            const list = localStorage.getItem("book_readings") || "[]";
            const _list = [item, ...JSON.parse(list)];
            this.list[0].list.unshift(item);
            localStorage.setItem("book_readings", JSON.stringify(_list));
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
            const page = this.list.filter((e) => e.id == type)[0].page;
            let params = cloneDeep(this.params);
            params.page = page + 1;
            params.per = append ? this.count * 3 : this.per;
            params.profession = type;
            this.loadList(params, type);
        },
        loadData() {
            this.loading = true;
            let params = omit(this.params, ["profession"]);
            if (this.active === 0) {
                const list = this.list.filter((e) => e.id !== 8);
                list.forEach((e) => {
                    params.page = e.page;
                    params.profession = e.id;
                    params.per = this.per;
                    this.loadList(params, e.id);
                });
            } else {
                params.page = this.page;
                params.per = this.count * 3;
                this.loadList({ ...params, profession: this.active }, this.active);
            }
        },
        // 加载type对应的数据
        loadList(params, key) {
            const index = this.list.findIndex((e) => e.id == key);
            if (this.list[index].pages < params.page && this.active === 0) params.page = 1;
            getList(params)
                .then((res) => {
                    const { list, total, pages, page, per } = res.data;
                    const _list = this.appendMode ? concat(this.list[index].list, list) : list;
                    this.list[index].list = _list || [];
                    this.list[index].page = page || 1;
                    this.list[index].pages = pages || 1;
                    this.list[index].total = total || 0;
                    if (this.active !== 0) this.page = page || 1;
                    this.total = total;
                    this.per = per;
                })
                .finally(() => {
                    this.loading = false;
                    this.appendMode = false;
                });
        },
    },
    mounted: function () {
        this.showCount();
        if (this.recentReadList.length) {
            this.list[0].list = this.recentReadList;
            this.list[0].total = this.recentReadList.length;
        }
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/tabs.less";
@import "~@/assets/css/book/home.less";
</style>
