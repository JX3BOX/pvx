<template>
    <div class="p-pet-list p-common-list" v-loading="loading" ref="listRef">
        <petTabs
            @change="handleTabChange"
            :types="Type"
            :active="active"
            :Source="Source"
            @setActive="setActive"
            :mapList="mapList"
        />
        <PublicNotice bckey="pet_ac" />
        <template v-if="luckyList.length > 0 && !showAllList">
            <div class="m-pet-title u-type u-lucky-title">
                <div class="u-title">今日福缘</div>
            </div>
            <div class="m-lucky-list">
                <luckyItem v-for="item in luckyList" :key="item.id" :item="item"></luckyItem>
            </div>
        </template>
        <template v-if="!showAllList">
            <div v-for="(item, index) in list_type" :key="'l' + index">
                <div class="m-pet-title u-type" v-if="item.list.length > 0">
                    <div class="u-title">{{ item.name }}</div>
                    <div class="u-all" @click="setActive(item.class)">查看全部</div>
                </div>
                <div class="m-pet-list">
                    <pet-item v-for="pet in item.list" :key="pet.id" :petObject="pet" />
                </div>
            </div>
        </template>
        <template v-else>
            <div class="m-pet-title u-type">
                <div class="u-title">{{ typeName }}</div>
            </div>
            <div class="m-pet-list">
                <pet-item v-for="pet in list" :key="pet.id" :petObject="pet" />
            </div>
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
                :page-size="per_page"
                :total="total"
                :current-page.sync="page"
            ></el-pagination>
        </template>
        <el-alert
            v-if="isNoRes()"
            class="m-archive-null"
            title="没有找到相关宠物"
            type="info"
            center
            show-icon
        ></el-alert>
    </div>
</template>
<script>
import PublicNotice from "@/components/PublicNotice";
import petTabs from "@/components/pet/tabs";
import petItem from "@/components/pet/item";
import luckyItem from "@/components/pet/lucky";
import { clone } from "lodash";
import { isPhone } from "@/utils/index";
import Type from "@/assets/data/pet_type.json";
import Source from "@/assets/data/pet_source.json";

import { __imgPath } from "@/utils/config";
import { getPets, getPetLucky, getSliders, getMapList } from "@/service/pet";

import dayjs from "@/plugins/day";
export default {
    name: "face",
    components: {
        petTabs,
        petItem,
        luckyItem,
        PublicNotice,
    },
    data() {
        return {
            tabsData: {},
            active: "",
            Type,
            Source,
            list: [],
            page: 1,
            per_page: 50,
            pages: 1,
            total: 0,
            appendMode: false,
            loading: false, //是否显示单独某项全部
            luckyList: [],
            typeName: "",
            showAllList: false, //是否显示单独某项全部
            mapList: [],
            list_type: [
                {
                    class: 1,
                    type: 1,
                    name: "水族",
                    list: [],
                },
                {
                    class: 2,
                    type: 2,
                    name: "禽鸟",
                    list: [],
                },
                {
                    class: 3,
                    type: 3,
                    name: "走兽",
                    list: [],
                },
                {
                    class: 4,
                    type: 4,
                    name: "机关",
                    list: [],
                },
            ],
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        params({ tabsData }) {
            const _params = {
                ...tabsData,
                page: this.page || 1,
                client: this.client,
            };
            if (this.active) _params.Class = this.active;
            return _params;
        },

        hasNextPage() {
            return this.page < this.pages;
        },
        isPhone() {
            return isPhone();
        },
    },
    watch: {
        params: {
            deep: true,
            handler(val) {
                this.getPetListInit(val);
            },
        },
    },
    created() {
        this.showCount();
        this.getPetLucky();
        this.getMapList();
    },
    mounted: function () {},
    methods: {
        getMapList() {
            getMapList().then((res) => {
                let data = res.data;
                this.mapList = Object.keys(data).map((key, i) => ({ label: data[key], value: key }));
            });
        },
        isNoRes() {
            let type = this.params.Class;
            if (!type) {
                // return false;
                return (
                    this.list_type[0].list.length == 0 &&
                    this.list_type[1].list.length == 0 &&
                    this.list_type[2].list.length == 0 &&
                    this.list_type[3].list.length == 0
                );
            }
            return this.list.length > 0 ? false : true;
        },
        setActive(val) {
            this.active = val;
            this.page = 1;
            document.documentElement.scrollTop = 0;
            this.typeName = this.getTypeName();
            this.Type = [...Type];
        },
        getTypeName() {
            let type = this.Type.filter((item) => item.class == this.active);
            return type[0].name || "所有种类";
        },
        getPetListInit() {
            if (!this.params.Class) {
                this.showCount(1);
                this.showAllList = false;
                this.list_type.forEach((e) => {
                    let params = clone(this.params);
                    params.Class = e.class;
                    params.per = this.per_page;
                    this.getPetList(params);
                });
            } else {
                this.showCount(4);
                let params = clone(this.params);
                params.per = this.per_page;
                this.getPetList(params);
            }
        },
        // 获取宠物列表
        getPetList: function (params) {
            this.loading = true;
            if (!this.appendMode) {
                this.list = [];
            }
            getPets(params)
                .then((res) => {
                    let newList = res.data.list.filter((item) => {
                        return item.NameFrame || item.Level;
                    });
                    if (this.appendMode) {
                        this.list = this.list.concat(newList);
                    } else {
                        if (!this.params.Class) {
                            //分别赋值
                            const typesMap = {
                                1: () => (this.list_type[0].list = newList || []),
                                2: () => (this.list_type[1].list = newList || []),
                                3: () => (this.list_type[2].list = newList || []),
                                4: () => (this.list_type[3].list = newList || []),
                            };
                            typesMap[params.Class]();
                        } else {
                            this.showAllList = true;
                            this.list = newList || [];
                        }
                    }
                    if (this.params.Class) {
                        this.appendMode = false;
                        this.total = res.data.total;
                        this.pages = res.data.pages;
                    }
                    this.$forceUpdate();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 获取福缘宠物id
        getPetLucky: function () {
            // 只有正式服有这玩意
            if (this.client === "std")
                getPetLucky(this.client).then((res) => {
                    let data = res.data;
                    let dateIndex = dayjs.tz(new Date()).format("MDD");
                    // this.luckyList = data[dateIndex];
                    getSliders("slider", this.client, data[dateIndex].toString()).then((res) => {
                        this.luckyList = res.data.data.list || [];
                    });
                });
        },
        appendPage: function () {
            this.appendMode = true;
            this.page = this.page + 1;
        },
        handleTabChange: function (data) {
            this.page = 1;
            this.tabsData = data;
        },
        // 按宽度显示个数
        showCount(num = 1) {
            if (this.isPhone) num += 8;
            const listWidth = this.$refs.listRef?.clientWidth;
            this.per_page = Math.floor(listWidth / 206) * num;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pet/list.less";
</style>
