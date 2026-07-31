<template>
    <PvxPageShell class="p-pvx-furniture-list" v-loading="loading">
        <div ref="listRef" class="m-pvx-furniture-layout">
            <PvxSearch
                ref="search"
                :items="isPhone ? searchProps.slice(0, 1) : searchProps"
                :initValue="initValue"
                :active="isActive"
                class="m-furniture-search"
                popperClass="u-pvx-furniture-filter"
                variant="modern"
                i18n-scope="pages.furniture.ui.search"
                inline-search-icon
                defer-filter-submit
                @search="searchEvent($event)"
            >
                <template #default>
                    <div class="u-furniture-select" :class="{ 'is-selected': version }">
                        <label v-if="!isPhone">{{ $t("pages.furniture.ui.catalogLabel") }}</label>
                        <el-select
                            v-model="version"
                            :placeholder="isPhone ? $t('pages.furniture.ui.catalogLabel') : ''"
                        >
                            <el-option
                                v-for="item in versions"
                                :key="item.nDlcID"
                                :value="item.nDlcID"
                                :label="item.name"
                            />
                        </el-select>
                    </div>
                </template>
            </PvxSearch>

            <PvxSearch
                v-if="isPhone"
                ref="searchMobile"
                :items="searchProps.slice(1, 3)"
                :initValue="initValue"
                :active="isActive"
                class="m-furniture-search m-furniture-search--mobile"
                popperClass="u-pvx-furniture-filter"
                variant="modern"
                i18n-scope="pages.furniture.ui.search"
                inline-search-icon
                defer-filter-submit
                @search="searchEvent($event)"
            />

            <PvxSurface v-if="childCategory.length" class="m-child-category" padding="small">
                <button type="button" class="u-item" :class="{ 'is-active': !childActive }" @click="setIndex('')">
                    {{ $t("pages.furniture.ui.all") }}
                </button>
                <button
                    v-for="item in childCategory"
                    :key="item.dwTableID"
                    type="button"
                    class="u-item"
                    :class="{ 'is-active': item.nCatag2Index === childActive }"
                    @click.stop="setIndex(item.nCatag2Index)"
                >
                    {{ item.szName }}
                </button>
            </PvxSurface>

            <PvxSurface v-if="list.length" class="m-pvx-furniture-section" padding="medium">
                <PvxSectionHeader
                    :title="$t('pages.furniture.ui.listTitle')"
                    level="h2"
                    class="m-pvx-furniture-section-header"
                >
                    <template #action>
                        <span class="u-pvx-furniture-result-count">
                            {{ $t("pages.furniture.ui.resultCount", { count: total }) }}
                        </span>
                    </template>
                </PvxSectionHeader>
                <div class="m-furniture-list">
                    <furnitureSet
                        v-for="item in list"
                        :key="item.ID"
                        :data="item"
                        :category="categoryObj"
                        :copy="hasCopy"
                        variant="modern"
                    />
                </div>
                <div class="m-furniture-pages">
                    <el-button class="m-archive-more" v-show="hasNextPage" @click="appendPage" :loading="loading">
                        <el-icon v-if="!loading" class="el-icon--left"><ArrowDown /></el-icon>
                        {{ $t("pages.furniture.ui.loadMore") }}
                    </el-button>
                    <el-pagination
                        class="m-archive-pages"
                        background
                        layout="total, prev, pager, next, jumper"
                        :hide-on-single-page="true"
                        :page-size="per"
                        :total="total"
                        v-model:current-page="page"
                        @current-change="changePage"
                    />
                </div>
            </PvxSurface>

            <div v-if="setList.length" class="m-furniture-wrap">
                <PvxSurface
                    v-for="setItem in setList"
                    :key="setItem.dwSetID"
                    class="u-set-item"
                    padding="medium"
                >
                    <PvxSectionHeader :title="setItem.szName" level="h2" class="m-pvx-furniture-section-header" />
                    <div class="u-furniture-list">
                        <furnitureSet
                            v-for="item in setItem.furnitures"
                            :key="item.ID"
                            :data="item"
                            :category="categoryObj"
                            variant="modern"
                        />
                    </div>
                </PvxSurface>
            </div>

            <PvxSurface v-if="!loading && !list.length && !setList.length" padding="medium">
                <PvxEmptyState
                    illustrated
                    :title="$t('pages.furniture.ui.empty.title')"
                    :description="$t('pages.furniture.ui.empty.description')"
                />
            </PvxSurface>

        </div>
    </PvxPageShell>
</template>

<script>
import { ArrowDown } from "@element-plus/icons-vue";
import PvxSearch from "@/components/PvxSearch.vue";
import furnitureSet from "@/components/furniture/furniture_set.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";

import { __imgPath, __dataPath } from "@/utils/config";
import { getFurnitureCategory } from "@/service/homeland.js";
import { getFurniture, getFurnitureSet } from "@/service/furniture.js";
import { deleteNull } from "@/utils/index";
import furnitureData from "@/assets/data/furniture.json";
import { debounce } from "lodash";
import { loadFurnitureMatch } from "@/utils/furniture";
const { sourceList, levelList, categoryList, categoryCss } = furnitureData;
const COST_PERFORMANCE_KEY = "__costPerf";
const COST_PERFORMANCE_SOURCE = "\u56ed\u5b85\u5e01";
const COST_PERFORMANCE_FILTER = "scoreCostPerformance";

function getSourceOptions(t, locked = false) {
    return sourceList.map((item) => {
        const key = item.name === "全部" ? "" : item.name;
        return {
            key,
            value: t(`pages.furniture.ui.sources.${item.id || "all"}`),
            disabled: locked && key !== COST_PERFORMANCE_SOURCE,
        };
    });
}

export default {
    name: "Index",
    components: {
        PvxSearch,
        furnitureSet,
        PvxEmptyState,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        ArrowDown,
    },
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
            count: 5,
            viewportWidth: window.innerWidth,
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
                    name: this.$t("pages.furniture.ui.filters.category"),
                    type: "radio",
                    options: [],
                },
                {
                    type: "filter",
                    key: "filter",
                    name: this.$t("pages.furniture.ui.filters.filter"),
                    options: [
                        // {
                        //     key: "attribute",
                        //     type: "radio",
                        //     name: "家具属性",
                        //     options: categoryList.map((item) => {
                        //         return {
                        //             key: item.key,
                        //             value: item.name,
                        //         };
                        //     }),
                        // },
                        {
                            key: "decorationScore",
                            type: "radio",
                            name: this.$t("pages.furniture.ui.score"),
                            options: [
                                {
                                    key: COST_PERFORMANCE_FILTER,
                                    value: this.$t("pages.furniture.ui.filters.costPerformance"),
                                },
                            ],
                        },
                        {
                            key: "szSource",
                            type: "radio",
                            name: this.$t("pages.furniture.ui.source"),
                            options: getSourceOptions((key, params) => this.$t(key, params)),
                        },
                        {
                            key: "LevelLimit",
                            type: "radio",
                            name: this.$t("pages.furniture.ui.filters.homelandLevel"),
                            options: levelList.map((item) => {
                                return {
                                    key: item.level,
                                    value: item.level
                                        ? this.$t("pages.furniture.ui.levelValue", { level: item.level })
                                        : this.$t("pages.furniture.ui.all"),
                                };
                            }),
                        },
                        {
                            key: "other",
                            type: "radio",
                            name: this.$t("pages.furniture.ui.filters.other"),
                            options: [
                                {
                                    key: "bInteract",
                                    value: this.$t("pages.furniture.ui.filters.interactive"),
                                },
                                {
                                    key: "isSet",
                                    value: this.$t("pages.furniture.ui.catalogLabel"),
                                },
                                {
                                    key: "isMatch",
                                    value: this.$t("pages.furniture.ui.filters.homelandContest"),
                                },
                            ],
                        },
                    ],
                },
                {
                    key: "name",
                    name: this.$t("pages.furniture.ui.filters.keyword"),
                },
            ],
            active: "",
            childActive: "",
            isSourceLockedByCostPerformance: false,
            furniture: [],
            versions: [
                {
                    name: "丝路风雨(130级)",
                    nDlcID: 8,
                },
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
            version: 8,
        };
    },
    filters: {
        formatMatchFurniture(val) {
            return val.replace("+", "");
        },
    },
    computed: {
        isPhone() {
            return this.viewportWidth <= 720;
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
            if (!this.$refs.search) return;

            if (this.version) {
                this.$refs.search.reset();
                this.$refs.search.formData.nCatag1Index = "";
                this.$refs.search.formData.name = "";
                this.childActive = "";
                this.active = "";
                this.search = {};
                this.list = [];
                this.childCategory = [];
                this.getFurnitureSet();
            } else if (this.search.name) {
                this.$refs.search.formData.nCatag1Index = "1";
            }
        },
        search: {
            deep: true,
            handler: function (val) {
                if (!val || !Object.keys(val).length) return;
                this.page = 1;
                this.getData();
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
            if (newData.decorationScore === COST_PERFORMANCE_FILTER) {
                newData.szSource = COST_PERFORMANCE_SOURCE;
                newData.order_key = COST_PERFORMANCE_KEY;
                newData.order_by = "DESC";
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
            delete newData.decorationScore;
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
            this.search.nCatag2Index = i;
        },
        setCostPerformanceSourceLocked(locked) {
            const filter = this.searchProps.find((item) => item.type === "filter");
            const sourceFilter = filter?.options.find((item) => item.key === "szSource");
            if (!sourceFilter) return;
            sourceFilter.options = getSourceOptions((key, params) => this.$t(key, params), locked);
        },
        setSearchSourceValue(value) {
            const refs = [this.$refs.search, this.$refs.searchMobile].filter(Boolean);
            refs.forEach((item) => {
                if (Object.prototype.hasOwnProperty.call(item.formData || {}, "szSource")) {
                    item.formData.szSource = value;
                }
            });
        },
        syncCostPerformanceSource(data) {
            const isCostPerformance = data?.decorationScore === COST_PERFORMANCE_FILTER;
            this.setCostPerformanceSourceLocked(isCostPerformance);

            if (isCostPerformance) {
                this.isSourceLockedByCostPerformance = true;
                if (data.szSource !== COST_PERFORMANCE_SOURCE) {
                    this.setSearchSourceValue(COST_PERFORMANCE_SOURCE);
                    return true;
                }
                return false;
            }

            if (this.isSourceLockedByCostPerformance) {
                this.isSourceLockedByCostPerformance = false;
                if (data.szSource) {
                    this.setSearchSourceValue("");
                    return true;
                }
            }

            return false;
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
                this.syncCategoryControlType();

                if (this.initValue.nCatag1Index) {
                    const category = this.category.find((item) => item.id === this.initValue.nCatag1Index);
                    const children = category?.children || [];
                    this.childCategory = children;
                }
            });
        },
        syncCategoryControlType() {
            if (!this.category.length) return;
            if (this.viewportWidth > 1680) {
                this.searchProps[0].type = "radio";
                this.searchProps[0].options = this.category;
                return;
            }
            this.searchProps[0].type = "select";
            this.searchProps[0].options = this.category.map((item) => {
                return {
                    id: item.id,
                    value: item.type,
                    label: item.name,
                    children: item.children,
                };
            });
        },
        getData() {
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
            if (this.syncCostPerformanceSource(data)) {
                data = {
                    ...data,
                    szSource:
                        data.decorationScore === COST_PERFORMANCE_FILTER ? COST_PERFORMANCE_SOURCE : "",
                };
            }
            const newData = this.doPrams(data);
            const hasSearchValue = Object.values(newData || {}).some((value) => {
                if (Array.isArray(value)) return value.length;
                return ![undefined, null, ""].includes(value);
            });

            if (!hasSearchValue) {
                this.active = "";
                this.search = {};
                this.list = [];
                this.childCategory = [];
                this.getFurnitureSet();
                return;
            }
            this.active = data.nCatag1Index;
            this.search = newData;
        },
        loadFurniture() {
            loadFurnitureMatch().then((data) => {
                this.furniture = data;
            });
        },
        // 仅计算每行列数和每页条数，不加载数据
        calcCount() {
            const listEl = this.$refs.listRef;
            const listWidth = listEl?.clientWidth || 1200;
            const cardWidth = 180;
            const cardGap = 12;
            const sectionInlinePadding = 48;
            const availableWidth = Math.max(listWidth - sectionInlinePadding, cardWidth);
            const fittedCount = Math.max(1, Math.floor((availableWidth + cardGap) / (cardWidth + cardGap)));

            // 与 horse / face 保持一致：小屏至少准备 6 条，分类结果一次请求两行。
            this.count = Math.max(6, fittedCount);
            this.per = this.count * 2;
        },
        // 列表card模式下按宽度显示个数
        showCount() {
            this.viewportWidth = window.innerWidth;
            this.syncCategoryControlType();
            this.calcCount();
            if (this.list.length || Object.keys(this.search).length) this.getData();
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
        this.$nextTick(() => {
            this.calcCount();
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
@import "~@/assets/css/furniture/pc/index.less";
@import "~@/assets/css/miniprogram.less";
@import "~@/assets/css/modules/furniture-list-theme.less";
</style>
