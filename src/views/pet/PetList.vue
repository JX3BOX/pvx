<template>
    <div class="p-pet-list p-common-list" v-loading="loading" ref="listRef">
        <!-- 宠物筛选标签组件 -->
        <petTabs @change="handleTabChange" :types="Type" :active="active" :Source="Source" :mapList="mapList" />
        <!-- 公告组件 -->
        <PublicNotice bckey="pet_ac" />

        <!-- 福缘宠物列表（仅首页显示） -->
        <template v-if="luckyList.length > 0 && !showAllList">
            <div class="m-pet-title u-type u-lucky-title">
                <div class="u-title">今日福缘</div>
            </div>
            <div class="m-lucky-list">
                <luckyItem v-for="item in luckyList" :key="item.id" :item="item"></luckyItem>
            </div>
        </template>

        <!-- 分类宠物列表（首页显示） -->
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

        <!-- 单分类全部列表（查看全部时显示） -->
        <template v-else>
            <div class="m-pet-title u-type">
                <div class="u-title">{{ typeName }}</div>
            </div>
            <div class="m-pet-list">
                <pet-item v-for="pet in list" :key="pet.id" :petObject="pet" />
            </div>
            <!-- 加载更多按钮 -->
            <el-button class="m-archive-more" v-show="hasNextPage" type="primary" @click="appendPage" :loading="loading"
                icon="el-icon-arrow-down">加载更多</el-button>
            <!-- 分页组件 -->
            <el-pagination class="m-archive-pages" background layout="total, prev, pager, next, jumper"
                :hide-on-single-page="true" :page-size="per_page" :total="total"
                v-model:current-page="page"></el-pagination>
        </template>

        <!-- 无结果提示 -->
        <el-alert v-if="isNoRes()" class="m-archive-null" title="没有找到相关宠物" type="info" center show-icon></el-alert>
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
    name: "PetList",
    components: {
        petTabs,
        petItem,
        luckyItem,
        PublicNotice,
    },
    data() {
        return {
            tabsData: {},          // 标签筛选数据
            active: "",            // 当前激活的分类ID
            Type,                  // 宠物类型配置
            Source,                // 宠物来源配置
            list: [],              // 单分类宠物列表
            page: 1,               // 当前页码
            per_page: 50,          // 每页显示数量
            pages: 1,              // 总页数
            total: 0,              // 总数量
            appendMode: false,     // 是否为追加模式（加载更多）
            loading: false,        // 加载状态
            luckyList: [],         // 福缘宠物列表
            typeName: "",          // 当前分类名称
            showAllList: false,    // 是否显示单分类全部列表
            mapList: [],           // 地图列表
            // 分类宠物列表（首页按分类展示）
            list_type: [
                { class: 1, type: 1, name: "水族", list: [] },
                { class: 2, type: 2, name: "禽鸟", list: [] },
                { class: 3, type: 3, name: "走兽", list: [] },
                { class: 4, type: 4, name: "机关", list: [] },
            ],
        };
    },
    computed: {
        // 当前客户端类型（正式服/怀旧服）
        client() {
            return this.$store.state.client;
        },
        // API请求参数
        params() {
            const _params = {
                ...this.tabsData,
                page: this.page || 1,
                client: this.client,
            };
            if (this.active) _params.Class = this.active;
            return _params;
        },
        // 是否有下一页
        hasNextPage() {
            return this.page < this.pages;
        },
        // 是否为手机端
        isPhone() {
            return isPhone();
        },
    },
    watch: {
        // 监听参数变化，重新加载数据
        params: {
            deep: true,
            handler(val) {
                this.$nextTick(() => {
                    this.getPetListInit(val);
                });
            },
        },
    },
    mounted() {
        this.getPetLucky();
        this.getMapList();
        // 首次加载数据
        this.$nextTick(() => {
            this.getPetListInit();
        });
    },
    methods: {
        /**
         * 获取地图列表
         * 用于筛选组件中的地图下拉框
         */
        getMapList() {
            getMapList().then((res) => {
                const data = res.data;
                this.mapList = Object.keys(data).map((key) => ({
                    label: data[key],
                    value: key
                }));
            });
        },

        /**
         * 判断是否无结果
         * @returns {Boolean} 是否无结果
         */
        isNoRes() {
            if (this.params.Class) {
                return this.list.length === 0;
            }
            return this.list_type.every(type => type.list.length === 0);
        },

        /**
         * 设置当前激活的分类（用于"查看全部"按钮）
         * @param {Number} val - 分类ID
         */
        setActive(val) {
            this.active = val;
            this.page = 1;
            document.documentElement.scrollTop = 0;
            this.typeName = this.getTypeName();
            this.Type = [...Type];
            // 同步更新 tabsData 中的 Class
            this.tabsData = { ...this.tabsData, Class: val };
        },

        /**
         * 获取类型名称
         * @returns {String} 类型名称
         */
        getTypeName() {
            const type = this.Type.find((item) => item.class == this.active);
            return type?.name || "所有种类";
        },

        /**
         * 初始化宠物列表
         * 根据是否有分类决定加载方式
         */
        getPetListInit() {
            if (!this.params.Class) {
                // 无分类时，加载各分类的首页数据
                this.showCount(1);
                this.showAllList = false;
                this.list_type.forEach((e) => {
                    const params = clone(this.params);
                    params.Class = e.class;
                    params.per = this.per_page;
                    this.getPetList(params);
                });
            } else {
                // 有分类时，加载该分类的全部数据
                this.showCount(4);
                const params = clone(this.params);
                params.per = this.per_page;
                this.getPetList(params);
            }
        },

        /**
         * 获取宠物列表
         * @param {Object} params - 请求参数
         */
        getPetList(params) {
            this.loading = true;

            // 非追加模式下清空列表
            if (!this.appendMode) {
                this.list = [];
            }

            getPets(params)
                .then((res) => {
                    this.handlePetListResponse(res, params);
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        /**
         * 处理宠物列表响应
         * @param {Object} res - 响应数据
         * @param {Object} params - 请求参数
         */
        handlePetListResponse(res, params) {
            // 过滤有效宠物数据
            const newList = res.data.list.filter((item) => {
                return item.NameFrame || item.Level;
            });

            // 追加模式
            if (this.appendMode) {
                this.list = this.list.concat(newList);
            } else {
                this.updateListData(newList, params);
            }

            // 更新分页信息
            if (this.params.Class) {
                this.appendMode = false;
                this.total = res.data.total;
                this.pages = res.data.pages;
            }
        },

        /**
         * 更新列表数据
         * @param {Array} newList - 新宠物列表
         * @param {Object} params - 请求参数
         */
        updateListData(newList, params) {
            if (!this.params.Class) {
                // 按类型分别赋值
                const typeIndex = this.list_type.findIndex(t => t.class === params.Class);
                if (typeIndex !== -1) {
                    this.list_type[typeIndex].list = newList || [];
                }
            } else {
                this.showAllList = true;
                this.list = newList || [];
            }
        },

        /**
         * 获取福缘宠物
         * 仅正式服有效
         */
        getPetLucky() {
            if (this.client !== "std") return;

            getPetLucky(this.client).then((res) => {
                const data = res.data;
                const dateIndex = dayjs.tz(new Date()).format("MDD");

                getSliders("slider", this.client, data[dateIndex].toString()).then((res) => {
                    this.luckyList = res.data.data.list || [];
                });
            });
        },

        /**
         * 加载更多
         * 切换到追加模式并增加页码
         */
        appendPage() {
            this.appendMode = true;
            this.page = this.page + 1;
        },

        /**
         * 处理标签变化
         * @param {Object} data - 标签数据
         */
        handleTabChange(data) {
            const isEvent = data instanceof Event;
            if (isEvent) return;

            // 如果 Class 参数存在且与当前 active 不同，更新 active
            if (data.Class && data.Class !== this.active) {
                this.active = data.Class;
                this.typeName = this.getTypeName();
                this.Type = [...Type];
                document.documentElement.scrollTop = 0;
            }

            this.page = 1;
            this.tabsData = data;
        },

        /**
         * 按宽度显示个数
         * 根据容器宽度计算每页显示的宠物数量
         * @param {Number} num - 基础倍数
         */
        showCount(num = 1) {
            if (this.isPhone) num += 8;
            const listWidth = this.$refs.listRef?.clientWidth;
            // 确保有有效的宽度值，否则使用默认值
            const width = listWidth || 1030;
            const calculatedPerPage = Math.floor(width / 206) * num;
            // 确保每页至少显示一定数量的数据
            this.per_page = Math.max(calculatedPerPage, 10);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pet/list.less";
</style>
