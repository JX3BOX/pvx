<template>
    <div class="v-homeland-furniture" v-loading="loading">
        <h1 class="m-furniture-title">家具大全</h1>

        <div class="m-furniture-search">
            <el-input placeholder="请输入搜索内容" v-model="search">
                <span slot="prepend">关键词</span>
                <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
        </div>

        <div class="m-furniture-container flexNormal">
            <div class="m-furniture-types">
                <div class="u-list">
                    <span class="u-item" @click="onDefault" :class="{ active: attKey == '-1' }"> 全部</span>
                    <span
                        class="u-item"
                        v-for="(item, i) in category"
                        :key="i"
                        :class="item.id == attKey ? 'active' : ''"
                        @click="onAttKey(item.id)"
                    >
                        {{ item.name }}
                    </span>
                </div>
            </div>

            <div class="m-furniture-box">
                <FurnitureCategory
                    :list="children(attKey)"
                    :isChange="isChange"
                    :categoryData="categoryData"
                    :furniture="furniture"
                    @onCategoryKey="onCategoryKey"
                    @match="setMatch"
                    ref="furnitureCategory"
                />

                <div class="m-furniture-list flexNormal" v-if="list.length">
                    <FurnitureCard v-for="(item, index) in list" :key="index" :item="item" />
                </div>

                <div class="m-furniture-null" v-else>
                    <el-alert center title="没有对应的家具" show-icon type="info"> </el-alert>
                </div>

                <div class="m-furniture-pages">
                    <el-button
                        class="m-archive-more"
                        v-show="hasNextPage"
                        type="primary"
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
                        :current-page.sync="page"
                        @current-change="changePage"
                    ></el-pagination>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import FurnitureCategory from "@/components/homeland/furniture_category.vue";
import FurnitureCard from "@/components/homeland/furniture_card.vue";
import { getFurnitureCategory, getFurnitureMatch } from "@/service/homeland.js";
import { getFurniture } from "@/service/furniture.js";
import { categoryCss } from "@/assets/data/furniture.json";
import { sourceList, levelList, categoryList } from "@/assets/data/furniture.json";

import dayjs from "@/plugins/day";

export default {
    name: "FurnitureList",
    components: { FurnitureCategory, FurnitureCard },
    data: function () {
        return {
            search: "",
            attKey: -1,
            category: [],
            list: [],
            furniture: [],
            match: false,

            page: 1,
            per: 20,
            total: 1,
            pages: 1,

            loading: false,
            append: false,
            isChange: false,
            client: "std",
            query: "",
            matchQuery: "",
        };
    },
    computed: {
        categoryData: function () {
            return {
                categoryCss: categoryCss[this.attKey],
                sourceList,
                levelList,
                categoryList,
            };
        },
        hasNextPage: function () {
            return this.pages > 1 && this.page < this.pages;
        },
        params: function () {
            let params = { page: this.page, per: this.per };
            if (this.attKey !== -1) params = { nCatag1Index: this.attKey, ...params };
            if (this.search) params = { name: this.search, ...params };
            if (Object.keys(this.query).length) params = { ...this.query, ...params };
            return params;
        },
        categoryFlat: function () {
            let arr = [];

            Object.entries(categoryCss).forEach(([key, value]) => {
                value.forEach((item) => {
                    arr.push({
                        ...item,
                        pId: ~~key,
                    });
                });
            });

            return arr;
        },
    },
    watch: {
        params: {
            handler: function (val) {
                this.getData();
            },
            deep: true,
        },
        match(val) {
            this.handleMatch(val);
        },
        $route(obj) {
            if (obj.params.search) this.search = obj.params.search;
        },
    },
    methods: {
        onCategoryKey: function (obj) {
            this.query = this.match ? { ...this.matchQuery, ...obj } : obj;
            this.isChange = false;
        },
        onAttKey: function (val) {
            this.$refs.furnitureCategory.setMatch(false);
            this.defaultParams();
            this.attKey = val;
            this.isChange = true;
        },
        getCategory: function () {
            getFurnitureCategory().then((res) => {
                this.category = res.data;
            });
        },
        onDefault: function () {
            this.$refs.furnitureCategory.setMatch(false);
            this.query = "";
            this.defaultParams();
        },
        getData() {
            this.loading = true;
            getFurniture(this.params)
                .then((res) => {
                    let list = [];
                    list = this.append ? this.list.concat(res.data.list) : res.data.list;

                    this.list = list;
                    this.pages = res.data.pages;
                    this.total = res.data.total;
                    this.append = false;
                    // 从首页跳转过来
                    if (this.$route.query?.match) {
                        this.$nextTick(() => {
                            this.$refs.furnitureCategory.setMatch(true);
                            this.match = true;

                            this.$router.push({ name: this.$route.name, query: {} });
                        });
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        setMatch(val) {
            this.match = val;
        },
        setFurniture(res) {
            let data = res.data.data.filter((item) => item);

            try {
                this.furniture = data;
            } catch (e) {
                this.furniture = [];
            }
        },
        // 园宅会赛
        loadFurniture: function () {
            try {
                let furniture = sessionStorage.getItem("furniture");

                furniture = furniture && JSON.parse(furniture);

                if (furniture) {
                    this.setFurniture(furniture);
                } else {
                    const params = {
                        subtypes: "category,property,next_match",
                        start: dayjs.tz().startOf("isoWeek").format("YYYY-MM-DD"),
                        end: dayjs.tz().endOf("isoWeek").format("YYYY-MM-DD"),
                    };
                    getFurnitureMatch(params).then((res) => {
                        this.setFurniture(res);

                        res.data?.data?.length && sessionStorage.setItem("furniture", JSON.stringify(res));
                    });
                }
            } catch (e) {
                console.error(e);
                this.furniture = [];
            }
        },
        // 处理园宅会赛
        handleMatch(val) {
            if (!val) {
                this.onDefault();
            } else {
                if (this.furniture?.length) {
                    let query = {};
                    // 类型
                    let classify = this.furniture?.find((item) => item.subtype === "category");

                    if (classify) {
                        let temp = [];
                        classify = classify.content.split("、");

                        classify.forEach((item) => {
                            let _temp = this.categoryFlat.find((c) => item.includes(c.name));
                            if (_temp) {
                                temp.push({
                                    nCatag1Index: _temp.pId,
                                    nCatag2Index: _temp.id,
                                });
                            }
                        });
                        query["match"] = JSON.stringify(temp);
                    }
                    query.isMatch = 1;

                    this.matchQuery = query;

                    this.onCategoryKey({});
                }
            }
        },
        defaultParams() {
            this.attKey = -1;
            this.page = 1;
        },
        children(id) {
            let list = [];
            for (const key in this.category) {
                if (this.category[key].id == id) {
                    list = this.category[key].children;
                }
            }
            return list;
        },
        appendPage() {
            this.append = true;
            this.page += 1;
        },
        changePage(i) {
            this.page = i;
        },
    },
    created: function () {
        this.getData();
        this.getCategory();
        this.loadFurniture();
    },
};
</script>
<style lang="less">
@import "~@/assets/css/homeland/furniture.less";
</style>
