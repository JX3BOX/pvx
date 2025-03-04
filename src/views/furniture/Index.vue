<template>
    <div ref="listRef" class="p-furniture" v-loading="loading">
        <PvxSearch
            ref="search"
            :items="isPhone ? searchProps.slice(0, 1) : searchProps"
            :initValue="initValue"
            :active="isActive"
            class="m-furniture-search"
            @search="searchEvent($event)"
        >
            <template slot="default">
                <div class="u-furniture-select" :class="version && 'is-selected'">
                    <label v-if="!isPhone">庐园广记</label>
                    <el-select v-model="version" :placeholder="isPhone ? '庐园广记' : ''">
                        <el-option
                            v-for="item in versions"
                            :key="item.nDlcID"
                            :value="item.nDlcID"
                            :label="item.name"
                        ></el-option>
                    </el-select>
                </div>
            </template>
        </PvxSearch>
        <template v-if="isPhone">
            <PvxSearch
                style="margin-top: 40px"
                ref="search"
                :items="searchProps.slice(2, 3)"
                :initValue="initValue"
                :active="isActive"
                class="m-furniture-search"
                @search="searchEvent($event)"
            >
            </PvxSearch>
        </template>
        <div v-if="childCategory.length" class="m-child-category">
            <div class="u-item" :class="!childActive && 'is-active'" @click="setIndex('')">全部</div>
            <div
                class="u-item"
                :class="item.nCatag2Index === childActive ? 'is-active' : ''"
                v-for="item in childCategory"
                :key="item.dwTableID"
                @click.stop="setIndex(item.nCatag2Index)"
            >
                {{ item.szName }}
            </div>
        </div>
        <div v-if="list.length" class="m-furniture-list" :class="!childCategory.length && 'm-no-child'">
            <!--            <FurnitureItem :item="item" v-for="item in list" :key="item.ID" :copy="hasCopy"></FurnitureItem>-->
            <furnitureSet :data="item" v-for="item in list" :key="item.ID" :category="categoryObj" :copy="hasCopy" />
            <div class="m-furniture-null" v-if="!list.length">
                <el-alert center title="没有对应的家具" show-icon type="info"> </el-alert>
            </div>
        </div>
        <div v-if="setList.length" class="m-furniture-wrap">
            <div class="u-set-item" v-for="setItem in setList" :key="setItem.dwSetID">
                <div class="u-title">{{ setItem.szName }}</div>
                <div class="u-furniture-list">
                    <furnitureSet
                        :data="item"
                        v-for="item in setItem.furnitures"
                        :key="item.ID"
                        :category="categoryObj"
                    />
                </div>
            </div>
        </div>
        <div v-if="list.length" class="m-furniture-pages">
            <el-button
                class="m-archive-more"
                v-show="hasNextPage"
                @click="appendPage"
                :loading="loading"
                icon="el-icon-arrow-down"
                :style="{ width: buttonWidth ? buttonWidth + 'px' : '100%' }"
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
        <PvxBacktop color="#fff" bgColor="#07ad36"></PvxBacktop>
    </div>
</template>

<script>
import PvxSearch from "@/components/PvxSearch.vue";
// import FurnitureItem from "@/components/furniture/FurnitureItem.vue";
import furnitureSet from "@/components/furniture/furniture_set.vue";
import PvxBacktop from "@/components/PvxBacktop.vue";

import { __imgPath, __dataPath } from "@jx3box/jx3box-common/data/jx3box.json";
import { getFurnitureCategory, getFurnitureMatch } from "@/service/homeland.js";
import { getFurniture, getFurnitureSet } from "@/service/furniture.js";
import { deleteNull, isPhone } from "@/utils/index";
import { sourceList, levelList, categoryList, categoryCss } from "@/assets/data/furniture.json";

import dayjs from "@/plugins/day";

export default {
    name: "Index",
    components: { PvxSearch, furnitureSet, PvxBacktop },
    provide: {
        __imgRoot: __imgPath + "homeland/",
        __dataRoot: __dataPath + "pvx/",
    },
    data() {
        return {
            loading: false,
            search: {},
            page: 1,
            per: 20,
            pages: 0,
            total: 0,
            categoryObj: {},
            category: [],
            childCategory: [],
            // initValue: { nCatag1Index: "1" },
            initValue: {},
            append: false,
            list: [],
            setList: [],
            isActive: false, // 额外搜索是否激活
            searchProps: [
                {
                    key: "nCatag1Index",
                    name: "分类",
                    type: "radio",
                    options: [],
                },
                {
                    type: "filter",
                    key: "filter",
                    name: "过滤",
                    options: [
                        {
                            key: "attribute",
                            type: "radio",
                            name: "家具属性",
                            options: categoryList.map((item) => {
                                return {
                                    key: item.key,
                                    value: item.name,
                                };
                            }),
                        },
                        {
                            key: "szSource",
                            type: "radio",
                            name: "来源途径",
                            options: sourceList.map((item) => {
                                return {
                                    key: item.name === "全部" ? "" : item.name,
                                    value: item.name,
                                };
                            }),
                        },
                        {
                            key: "LevelLimit",
                            type: "radio",
                            name: "家园等级",
                            options: levelList.map((item) => {
                                return {
                                    key: item.level,
                                    value: item.name,
                                };
                            }),
                        },
                        {
                            key: "other",
                            type: "radio",
                            name: "其它",
                            options: [
                                {
                                    key: "bInteract",
                                    value: "可交互",
                                },
                                {
                                    key: "isSet",
                                    value: "庐园广记",
                                },
                                {
                                    key: "isMatch",
                                    value: "园宅会赛",
                                },
                            ],
                        },
                    ],
                },
                {
                    key: "name",
                    name: "家具名称",
                },
            ],
            active: "",
            childActive: "",
            furniture: [],
            buttonWidth: 0,
            versions: [
                {
                    name: "横刀断浪(120级)",
                    nDlcID: 7,
                },
                {
                    name: "奉天证道(110级)",
                    nDlcID: 6,
                },
                {
                    name: "世外蓬莱(100级)",
                    nDlcID: 5,
                },
            ],
            version: 7,
        };
    },
    filters: {
        formatMatchFurniture(val) {
            return val.replace("+", "");
        },
    },
    computed: {
        isPhone() {
            return isPhone();
        },
        hasNextPage: function () {
            return this.pages > 1 && this.page < this.pages;
        },
        hasCopy() {
            return Object.values(this.search).filter(Boolean).length ? true : false;
        },
        matchFurniture() {
            return (this.furniture && this.furniture.find((item) => item.subtype === "category")) || "";
        },
        matchProperty() {
            return (this.furniture && this.furniture.find((item) => item.subtype === "property")) || "";
        },
        client() {
            return this.$store.state.client;
        },
        categoryFlat() {
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
        params() {
            return {
                per: this.per,
                page: this.page,
                client: this.client,
                ...this.search,
            };
        },
    },
    watch: {
        active(type) {
            // 重置子类
            this.childActive = "";
            delete this.search.nCatag2Index;
            this.page = 1;

            const category = this.category.find((item) => item.id === type);
            const children = category?.children || [];
            this.childCategory = children;
        },
        "$route.query": {
            immediate: true,
            deep: true,
            handler(query) {
                const { match } = query;
                if (match === "1") {
                    this.initValue = {
                        other: "isMatch",
                    };
                    this.isActive = true;
                }
            },
        },
        version() {
            if (this.version) {
                this.$refs.search.reset();
                this.$refs.search.formData.nCatag1Index = "";
                this.$refs.search.formData.name = "";
                this.childActive = "";
                this.active = "";
                this.getFurnitureSet();
            } else if (this.search.name) {
                this.$refs.search.formData.nCatag1Index = "1";
            }
        },
        search: {
            deep: true,
            handler: function (val) {
                this.showCount();
            },
        },
    },
    methods: {
        appendPage() {
            this.append = true;
            this.page += 1;
            this.getData();
        },
        changePage(i) {
            this.page = i;
            this.getData();
        },
        doPrams(data) {
            let newData = Object.assign({}, data);
            if (newData.other === "bInteract") {
                newData.bInteract = 1;
            }
            if (newData.other === "isSet") {
                newData.isSet = 1;
            }
            if (newData.other === "isMatch") {
                newData = Object.assign({}, this.setMatch());
            }
            if (newData.attribute) {
                for (const key in newData) {
                    if (key.includes("Attribute")) {
                        delete newData[key];
                    }
                }
                newData[`Attribute${newData.attribute}`] = 1;
                delete newData.attribute;
            }
            delete newData.other;
            return newData;
        },
        setMatch() {
            if (this.matchFurniture) {
                // 家园属性
                const attr = categoryList.find((item) => this.matchProperty?.content.includes(item.name))?.key || "1";
                let temp = [];
                const classify = this.matchFurniture?.content ? this.matchFurniture.content.split("、") : [];

                classify.forEach((item) => {
                    let _temp = this.categoryFlat.find((c) => item.includes(c.name));
                    if (_temp) {
                        temp.push({
                            nCatag1Index: _temp.pId,
                            nCatag2Index: _temp.id,
                        });
                    }
                });
                // this.$set(this.initValue, "other", "isMatch");
                // this.$set(this.initValue, "attribute", attr);
                return {
                    isMatch: 1,
                    match: JSON.stringify(temp),
                    [`Attribute${attr}`]: 1,
                };
            }
        },
        setIndex(i) {
            this.childActive = i;
            this.$set(this.search, "nCatag2Index", i);
        },
        getCategory() {
            getFurnitureCategory().then((res) => {
                this.categoryObj = res?.data || {};
                const list = Object.values(res?.data || {});
                // list.unshift({
                //     id: "",
                //     name: "全部",
                // });
                this.category = list.map((item) => {
                    return {
                        type: item.id,
                        ...item,
                    };
                });
                if (window.innerWidth > 1680) {
                    this.searchProps[0].options = this.category;
                } else {
                    this.searchProps[0].type = "select";
                    this.searchProps[0].options = this.category.map((i) => {
                        return {
                            id: i.id,
                            value: i.type,
                            label: i.name,
                            children: i.children,
                        };
                    });
                }

                if (this.initValue.nCatag1Index) {
                    const category = this.category.find((item) => item.id === this.initValue.nCatag1Index);
                    const children = category?.children || [];
                    this.childCategory = children;
                }
            });
        },
        getData() {
            this.version = "";
            this.setList = [];
            const params = deleteNull(this.params);
            this.loading = true;
            getFurniture(params)
                .then((res) => {
                    let list = [];
                    list = this.append ? this.list.concat(res.data.list) : res.data.list;

                    this.list = list;
                    this.pages = res.data.pages;
                    this.total = res.data.total;
                    this.append = false;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        searchEvent(data) {
            // 广记会将search置空
            let isAllEmpty = Object.values(data).every((item) => !item);
            if (!isAllEmpty) {
                this.active = data.nCatag1Index;
                const newData = this.doPrams(data);
                this.search = newData;
            }
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
        loadFurniture() {
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
        // 列表card模式下按宽度显示个数
        showCount() {
            this.$nextTick(() => {
                const listWidth = this.$refs.listRef?.clientWidth;
                const base = 348;
                this.per = Math.floor(listWidth / base) * 4;
                // 加载更多按钮的实际宽度
                if (!this.isPhone) {
                    this.buttonWidth = (this.per / 4) * (base + 20) - 20;
                }
                this.getData();
            });
        },
        getFurnitureSet() {
            this.list = [];
            this.pages = 0;
            this.total = 0;
            this.page = 1;

            const cache = sessionStorage.getItem(`FurnitureSet_${this.version}`);
            if (cache) {
                this.setList = JSON.parse(cache);
            } else {
                this.loading = true;
                getFurnitureSet({ nDlcID: this.version, details: 1 })
                    .then((res) => {
                        const list = res?.data || [];
                        this.setList = list;
                        sessionStorage.setItem(`FurnitureSet_${this.version}`, JSON.stringify(list));
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        },
    },
    mounted() {
        this.getFurnitureSet();
        this.getCategory();
        this.loadFurniture();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/furniture/index.less";
.pvx-search-wrapper .search-group .search-item.filter-wrap {
    margin: 0;
}
.p-furniture .u-furniture-select {
    margin: 0;
}
@media screen and (max-width: @ipad) {
    .pvx-search-wrapper {
        height: auto;
        padding-left: 15px;
        .search-group {
            flex-wrap: wrap;
            flex-direction: row;
            .search-item {
                input {
                    width: 100% !important;
                }
            }
        }
    }
}
</style>
