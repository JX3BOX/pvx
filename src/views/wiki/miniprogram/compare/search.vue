<!-- 搜索组件 -->
<template>
    <div class="c-search-section">
        <div class="u-search-box" @click="handleSearchClick">
            <img :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/search.svg`)"
                class="u-search-icon" />
            <span class="u-search-text">{{ placeholder || "搜索" }}</span>
        </div>

        <!-- 筛选 -->
        <div class="u-filter-box" v-if="showFilter" @click="handleFilterClick()">
            <img :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/shaixuan.svg`)"
                class="u-search-icon" />
            <span class="u-search-text">筛选</span>
        </div>
        <!-- 地图、关键字搜索区域 -->
        <el-drawer :model-value="drawerSearchVisible" direction="btt" size="420px" @close="handleClose"
            class="p-search-drawer">
            <template #title>
                <div class="u-search-title">
                    {{ title }}<span v-if="sub_title && step != 1"> &nbsp;-&nbsp;{{ sub_title }}</span>
                </div>
            </template>
            <div class="search-list-wrapper" v-loading="loading">
                <!-- step:1 -->
                <div class="search-step" v-if="step == 1">
                    <!-- 地图区域  -->
                    <div class="u-map-box">
                        <div class="search-step-content u-first-map" @click="handleMapClick(null, 1)">
                            {{ selectMapName || "请选择地图" }}
                        </div>
                        <!-- 没有选择第一个时，透明度50%off的 -->
                        <div class="search-step-content u-two-map" :style="{ opacity: selectMapId ? 1 : 0.5 }"
                            @click="handleMapClick(null, 2)">
                            {{ selectSubName || "请选择地图" }}
                        </div>
                    </div>
                    <div class="u-search-title">关键词</div>
                    <div class="search-step-content">
                        <input type="text" placeholder="输入成就名称/成就描述/称号/奖励物品" v-model="searchKeyword" />
                    </div>
                    <!-- 底部按钮 -->
                    <div class="search-button-group">
                        <div class="u-reset" v-if="searchKeyword || selectMapId" @click="resetSelection">
                            清空搜索项
                        </div>
                        <div class="u-submit" @click="handleKeywordSearch()">
                            <img :src="require(`@/assets/img/wiki_miniprogram/search_black.svg`)"
                                class="u-search-icon" />
                            <span>搜索</span>
                        </div>
                    </div>
                </div>
                <div class="search-step" v-else>
                    <div class="search-list-container" :class="{ crosswise: step == 2 }" ref="searchListContainer">
                        <!-- 初始地图列表 -->
                        <div class="search-item" v-for="item in step == 2 ? mapList : childrenList" :key="item.value"
                            :class="{ selected: item.value == (step == 2 ? selectMapId : selectSubId) }"
                            @click="handleMapClick(item, 3)">
                            <div class="search-name">{{ item.label }}</div>
                        </div>
                    </div>

                    <div class="search-button-group">
                        <div @click="handleReset" class="u-reset">重置</div>
                        <div @click="handleSubmit" class="u-submit">确定</div>
                    </div>
                </div>

                <!-- 遮罩层 -->
                <div class="bottom-mask" v-if="showMask"></div>
            </div>
        </el-drawer>
        <!-- 筛选弹窗 -->
        <el-drawer :model-value="drawerFilterVisible" direction="btt" size="430px" @close="handleCloseFilter"
            class="p-search-drawer">
            <template #title>
                <div class="u-search-title">筛选</div>
            </template>

            <div class="search-list-wrapper">
                <div class="search-step">
                    <div class="search-list-container" ref="filterListContainer">
                        <!-- 初始地图列表 -->
                        <div class="search-item" v-for="item in filterOptions" :key="item.value"
                            :class="{ selected: item.value == selectFilterId }" @click="handleFilterClick(item)">
                            <div class="search-name">
                                {{ item.label }}
                                <div class="search-sub">{{ item.sub }}</div>
                            </div>
                            <div class="search-server" v-if="item.sub === '已完成'">
                                <span v-html="`<隐藏掉[${item.label}]未完成的成就>`"></span>
                            </div>
                            <div class="search-server" v-else-if="item.sub === '未完成'">
                                <span v-html="`<隐藏[${item.label}]已完成的成就>`"></span>
                            </div>
                        </div>
                    </div>

                    <div class="search-button-group">
                        <div @click="handleFilterReset" class="u-reset">重置</div>
                        <div @click="handleFilterSubmit" class="u-submit">确定</div>
                    </div>
                </div>
                <!-- 遮罩层 -->
                <div class="bottom-mask" v-if="showFilterMask"></div>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { searchAchievements, getMapList } from "@/service/achievement";
import { cloneDeep } from "lodash";
export default {
    name: "CompareSearch",
    components: {},
    props: {
        //是否显示筛选
        showFilter: {
            type: Boolean,
            default: false,
        },
        //角色列表
        roles: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        /**
         * 是否为暗黑模式
         * @returns {boolean} - 是否为暗黑模式
         */
        isDark() {
            const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
            return mediaQueryList.matches;
        },
    },
    //setp切换不等于1时，启动滚动监听
    watch: {
        step(newVal, oldVal) {
            if (newVal !== 1) {
                this.$nextTick(() => {
                    if (this.$refs.searchListContainer) {
                        this.$refs.searchListContainer.addEventListener("scroll", this.checkScrollPosition);
                        // 初始化时检查一次
                        this.checkScrollPosition();
                    }
                });
            } else {
                // 步骤1时移除事件监听
                this.removeScrollListener();
            }
        },
        drawerFilterVisible(newVal, oldVal) {
            if (newVal) {
                this.$nextTick(() => {
                    if (this.$refs.filterListContainer) {
                        this.$refs.filterListContainer.addEventListener("scroll", this.checkScrollPosition);
                        // 初始化时检查一次
                        this.checkScrollPosition();
                    }
                });
            } else {
                // 筛选弹窗关闭时移除事件监听
                this.removeScrollListener();
            }
        },
        roles(newVal, oldVal) {
            if (newVal.length > 0) {
                this.handleRoleFilter();
            }
        },
    },
    beforeUnmount() {
        // 组件销毁前移除事件监听
        this.removeScrollListener();
    },
    data() {
        return {
            // 加载中
            loading: false,
            //搜索框占位符
            placeholder: "搜索",
            title: "地图",
            drawerSearchVisible: false,
            showMask: false,
            //当前步骤，1 初始激活 2进入地图选择 3进入二级地图选择 步骤三重置时回到步骤2
            step: 1,
            sub_title: null,
            //搜索关键词
            searchKeyword: null,
            //地图列表
            mapList: [],
            mapChildList: [],
            //当前选择的地图id
            selectMapId: null,
            selectMapName: null,
            //当前选择的二级地图id
            selectSubId: null,
            selectSubName: null,
            //地图综合筛选条件备份
            savedFilterOptions: {},
            //筛选的列表
            filterOptions: [],
            //当前选择的筛选项
            selectFilterId: null,
            //备份筛选id，用于未确定的重置还原
            savedFilterId: null,
            //是否显示筛选弹窗
            drawerFilterVisible: false,
            //筛选弹窗遮罩层
            showFilterMask: false,
        };
    },
    created() {
        this.loadMapList();
    },
    mounted() {
        // this.handleRoleFilter();
    },
    methods: {
        /**
         * 移除滚动事件监听
         */
        removeScrollListener() {
            if (this.$refs.searchListContainer) {
                this.$refs.searchListContainer.removeEventListener("scroll", this.checkScrollPosition);
            }
            if (this.$refs.filterListContainer) {
                this.$refs.filterListContainer.removeEventListener("scroll", this.checkFilterScrollPosition);
            }
        },
        /**
         * 检查滚动位置，控制遮罩层显示
         */
        checkScrollPosition() {
            if (this.$refs.searchListContainer) {
                const container = this.$refs.searchListContainer;
                const scrollHeight = container.scrollHeight;
                const clientHeight = container.clientHeight;
                const scrollTop = container.scrollTop;
                const distanceToBottom = scrollHeight - (clientHeight + scrollTop);
                // 距离底部大于40px时显示遮罩层
                this.showMask = distanceToBottom > 40;
            }
            if (this.$refs.filterListContainer) {
                const container = this.$refs.filterListContainer;
                const scrollHeight = container.scrollHeight;
                const clientHeight = container.clientHeight;
                const scrollTop = container.scrollTop;
                const distanceToBottom = scrollHeight - (clientHeight + scrollTop);
                // 距离底部大于40px时显示遮罩层
                this.showFilterMask = distanceToBottom > 40;
            }
        },
        /**
         * 角色筛选处理
         */
        handleRoleFilter() {
            // .要根据角色对比数来进行筛选每有一个角色增加2个分别为【全部】-【角色1的已完成】-【角色1的未完成】-【角色2的已完成】-【角色2的未完成】-【角色3...】
            let filterOptions = [
                {
                    label: "全部",
                    value: null,
                },
            ];
            this.roles.forEach((role) => {
                filterOptions.push({
                    label: role.name,
                    server: role.server,
                    sub: "已完成",
                    value: role.jx3id + "_completed",
                });
                filterOptions.push({
                    label: role.name,
                    server: role.server,
                    sub: "未完成",
                    value: role.jx3id + "_uncompleted",
                });
            });
            this.filterOptions = filterOptions;
        },
        /**
         * 处理筛选点击事件
         */
        handleFilterClick(item) {
            if (!item) {
                this.drawerFilterVisible = true;
                return;
            }
            this.selectFilterId = item.value;
        },
        /**
         * 处理筛选弹窗关闭事件
         */
        handleCloseFilter() {
            this.selectFilterId = this.savedFilterId;
            this.drawerFilterVisible = false;
        },
        /**
         * 处理筛选弹窗重置事件
         */
        handleFilterReset() {
            this.selectFilterId = null;
        },
        /**
         * 处理筛选弹窗提交事件
         */
        handleFilterSubmit() {
            //根据selectFilterId查询label
            let filter = this.filterOptions.find((item) => item.value == this.selectFilterId);
            this.$emit("filterSubmit", {
                filterId: this.selectFilterId,
                filterLabel: (filter?.label || "") + (filter?.sub || ""),
            });
            //备份当前筛选id
            this.savedFilterId = cloneDeep(this.selectFilterId);
            this.handleCloseFilter();
        },
        /**
         * 重置选择项
         */
        resetSelection() {
            this.searchKeyword = null;
            this.selectMapId = null;
            this.selectMapName = null;
            this.selectSubId = null;
            this.selectSubName = null;
            this.placeholder = "搜索";
        },
        /**
         * 处理搜索点击事件
         */
        handleSearchClick() {
            this.step = 1;
            this.drawerSearchVisible = true;
        },
        /**
         * 处理关键词搜索事件
         */
        handleKeywordSearch() {
            // if (!this.searchKeyword && !this.selectMapId) return this.$message.error('请输入关键词或选择地图');
            this.getSearchAchievements();
        },
        handleClose() {
            //恢复地图综合筛选条件
            this.searchKeyword = cloneDeep(this.savedFilterOptions.searchKeyword);
            this.selectMapId = cloneDeep(this.savedFilterOptions.selectMapId);
            this.selectMapName = cloneDeep(this.savedFilterOptions.selectMapName);
            this.selectSubId = cloneDeep(this.savedFilterOptions.selectSubId);
            this.selectSubName = cloneDeep(this.savedFilterOptions.selectSubName);
            this.sub_title = cloneDeep(this.savedFilterOptions.sub_title);
            this.childrenList = cloneDeep(this.savedFilterOptions.childrenList);
            this.placeholder = cloneDeep(this.savedFilterOptions.placeholder);
            this.drawerSearchVisible = false;
        },
        /**
         * 处理地图点击事件
         */
        handleMapClick(item, type) {
            if (!item && type == 1) return (this.step = 2);
            if (!item && type == 2 && this.selectMapId) return (this.step = 3);
            if (this.step == 2) {
                this.selectMapId = item.value;
                this.sub_title = item.label;
                this.selectMapName = item.label;
                this.childrenList = item.children || [];
                if (this.childrenList.length > 0) {
                    this.selectSubId = this.childrenList[0].value;
                    this.selectSubName = this.childrenList[0].label;
                }
            }
            if (this.step == 3) {
                this.selectSubId = item.value;
                this.selectSubName = item.label;
            }
        },
        /**
         * 处理重置事件
         */
        handleReset() {
            if (this.step == 2) {
                this.selectMapId = null;
                this.selectMapName = null;
                this.selectSubId = null;
                this.selectSubName = null;
                this.sub_title = null;
                this.childrenList = [];
            }
            if (this.step == 3) {
                this.selectSubId = this.childrenList[0].value;
                this.selectSubName = this.childrenList[0].label;
            }
        },

        /**
         * 处理提交事件
         */
        handleSubmit() {
            this.step = 1;
        },
        //地图
        loadMapList() {
            const client = this.$store.state.client || "std";
            const params = {
                client,
                _no_page: 1,
            };
            getMapList(params).then((res) => {
                const data = res.data.data || [];
                let regions = Object.values(
                    data.reduce((acc, cur) => {
                        if (!cur.RegionName) return acc;
                        if (!acc[cur.RegionName]) {
                            acc[cur.RegionName] = {
                                value: Number(cur.Region),
                                label: cur.RegionName,
                                children: [],
                            };
                        }
                        acc[cur.RegionName].children.push({
                            value: Number(cur.ID),
                            label: cur.MapName,
                            parent: Number(cur.Region),
                        });

                        return acc;
                    }, {})
                );

                this.mapList = regions;
            });
        },
        //根据搜索获取成就
        getSearchAchievements() {
            let params = {
                keyword: this.searchKeyword,
                scene: this.selectSubId,
                client: this.$store.state.client || "std",
                _no_page: 1,
                limit: 99999,
            };
            //设置加载中
            this.loading = true;
            searchAchievements(params)
                .then((data) => {
                    //设置加载完成
                    this.loading = false;
                    let list = data.data.data.achievements || [];
                    let arr = [];
                    list.forEach((item) => {
                        arr.push(item);
                        if (item.SeriesAchievementList) {
                            item.SeriesAchievementList.forEach((sub, index) => {
                                if (index > 0) {
                                    arr.push(sub);
                                }
                            });
                        }
                    });
                    //处理数据，回传父级，同时将搜索条件置于显示
                    this.$emit("submit", { data: arr, params });
                    this.placeholder = `${this.selectMapName || ""}${this.selectSubName ? "/" + this.selectSubName : ""
                        }${this.searchKeyword ? "/" + this.searchKeyword : ""}`;
                    this.drawerSearchVisible = false;
                    //备份地图综合筛选条件
                    this.savedFilterOptions = {
                        searchKeyword: cloneDeep(this.searchKeyword),
                        selectMapId: cloneDeep(this.selectMapId),
                        selectMapName: cloneDeep(this.selectMapName),
                        selectSubId: cloneDeep(this.selectSubId),
                        selectSubName: cloneDeep(this.selectSubName),
                        sub_title: cloneDeep(this.sub_title),
                        childrenList: cloneDeep(this.childrenList),
                        placeholder: cloneDeep(this.placeholder),
                    };
                })
                .finally(() => {
                    //设置加载完成
                    this.loading = false;
                });
        },
        //非achievements界面，通过ref直接调用此函数，将条件赋值后调用getSearchAchievements()
        handleOtherSearch(params) {
            this.searchKeyword = params.keyword || "";
            this.selectSubId = params.scene || "";
            this.getSearchAchievements();
        },
    },
};
</script>

<style lang="less">
// 搜索框
.c-search-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 12px;
    margin-bottom: 4px;

    .u-search-box,
    .u-filter-box {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .u-search-box {
        flex: 1;
    }

    .u-search-icon {
        width: 16px;
        height: 16px;
        margin-right: 4px;
    }

    .u-search-text {
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 20px;
        color: rgba(28, 28, 28, 0.4);
    }

    .p-search-drawer {
        border-radius: 20px 20px 0 0;
        background: #24292e;

        .el-drawer__header {
            margin-bottom: 0;
            color: #72767b;
        }

        .el-drawer__body {
            padding: 0;
            overflow: hidden;
        }

        .u-search-title {
            width: calc(100% - 20px);
            display: flex;
            align-items: center;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-style: normal;
            font-weight: 700;
            line-height: 20px;
        }

        .search-list-wrapper {
            width: 100%;
            height: 100%;
            padding: 0 20px 20px 20px;
        }

        .search-step {
            height: 100%;
            position: relative;

            &:first-child {
                margin-top: 12px;
            }

            .u-map-box {
                display: flex;
                align-items: center;
                width: 100%;
                gap: 10px;

                .u-first-map {
                    width: 100px;
                    flex-shrink: 0;
                }

                .u-two-map {
                    flex: 1;
                }
            }

            .u-search-title {
                margin: 12px 0;
            }

            .search-step-content {
                display: flex;
                padding: 16px 12px;
                align-items: flex-start;
                gap: 10px;
                align-self: stretch;
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.1);
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: 20px;
                color: rgba(255, 255, 255, 0.2);

                input {
                    width: 100%;
                    height: 100%;
                    color: #fff;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 20px;
                    background: transparent;
                    border: none;
                }
            }

            .search-button-group {
                position: absolute;
                bottom: 0;
                width: 100%;
                padding: 0;
            }
        }

        .search-list-container {
            height: 300px;
            overflow-y: auto;

            &.crosswise {
                //每行2个
                display: flex;
                flex-wrap: wrap;
                gap: 12px;

                .search-item {
                    width: calc(50% - 6px);
                    margin-bottom: 0 !important;
                }
            }

            // 地图列表样式
            .search-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 24px;
                box-sizing: border-box;
                margin-bottom: 12px;
                transition: all 0.3s ease;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
                gap: 12px;

                &.selected {
                    border: 4px solid #fedaa3;
                }

                .search-name {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 16px;
                    font-weight: 700;
                    line-height: 24px;
                }

                .search-server {
                    color: rgba(255, 255, 255, 0.8);
                    text-align: center;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 18px;
                }
            }
        }

        // 底部按钮样式
        .search-button-group {
            padding: 12px 20px 16px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 20px;

            .u-reset,
            .u-submit {
                display: flex;
                padding: 12px 16px;
                justify-content: center;
                align-items: center;
                border-radius: 12px;
                font-size: 16px;
                font-style: normal;
                font-weight: 700;
                line-height: 24px;
            }

            .u-reset {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.4);
            }

            .u-submit {
                flex: 1;
                background: #fedaa3;
                color: #24292e;
                /* 150% */
            }
        }

        // 底部遮罩层样式
        .bottom-mask {
            position: fixed;
            bottom: 60px;
            left: 0;
            width: 100%;
            height: 60px;
            background: linear-gradient(180deg, rgba(36, 41, 46, 0) 0%, #24292e 73.94%);
        }
    }
}

/**
 * 暗黑模式样式@media screen and (width: 390px)
 */
// @media (prefers-color-scheme: dark)
@media (prefers-color-scheme: dark) {
    .c-search-section {
        .u-search-text {
            color: rgba(255, 255, 255, 0.4);
        }
    }
}
</style>
