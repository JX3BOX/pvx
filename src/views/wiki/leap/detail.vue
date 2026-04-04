<template>
    <!-- 详情区域 -->
    <div class="m-detail">
        <!-- 左侧列表，右侧table -->
        <!-- 左侧根据成就信息判断是否显示菜单 -->
        <div class="u-detail-left">
            <ul class="u-detail-left_item">
                <li
                    class="u-menu-parent u-menu-text"
                    :class="{ active: detailSelectMenu == null }"
                    @click="changeDetailMenu(null, 0)"
                >
                    全部
                </li>
            </ul>
            <div v-if="detail.meta?.createBy == 'map'">
                <div v-for="(item, index) in mapList" :key="index">
                    <ul v-if="item.show" class="u-detail-left_item">
                        <li class="u-menu-parent u-menu-text">
                            {{ item.label }}
                        </li>
                        <div
                            v-for="(item2, index2) in item.children"
                            :key="index2"
                            @click.stop="changeDetailMenu(item2, 2)"
                        >
                            <li
                                v-if="item2.show"
                                class="u-menu-item_children u-menu-text"
                                :class="{ active: detailSelectMenu == item2.value }"
                            >
                                {{ item2.label }}
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
            <div v-else>
                <div v-for="(item, index) in menuList" :key="index" @click="changeDetailMenu(item, 1)">
                    <ul v-if="item.show" class="u-detail-left_item">
                        <li class="u-menu-parent u-menu-text" :class="{ active: detailSelectMenu == item.id }">
                            {{ item.name }}
                        </li>
                        <div
                            v-for="(item2, index2) in item.children"
                            :key="index2"
                            @click.stop="changeDetailMenu(item2, 2)"
                        >
                            <li
                                v-if="item2.show"
                                class="u-menu-item_children u-menu-text"
                                :class="{ active: detailSelectMenu == item2.id }"
                            >
                                {{ item2.name }}
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
        <div class="u-detail-right">
            <el-table
                :data="detail.achievements || []"
                style="width: 100%"
                stripe
                height="100%"
                row-class-name="u-table-row"
                cell-class-name="u-table-cell"
                header-row-class-name="u-table-header_row"
                header-cell-class-name="u-table-header_cell"
                v-loading="loading"
            >
                <el-table-column prop="Name" label="成就名称">
                    <template #default="scope">
                        <a :href="getLink('achievement', scope.row.ID)" target="_blank">
                            <div class="u-achievement-name">
                                <img class="u-icon" :src="iconLink(scope.row?.IconID)" />
                                <span>{{ scope.row.Name }}</span>
                            </div></a
                        >
                    </template>
                </el-table-column>
                <el-table-column label="资历点数" width="100">
                    <template #default="scope"> {{ scope.row.Point || 0 }} </template>
                </el-table-column>

                <!-- <el-table-column label="全服完成度" width="260">
                    <template slot-scope="scope">
                        <div class="u-process-box">
                            <div class="u-process-item" :style="{ width: scope.row.process }"></div>
                            <div class="u-process-text">{{ scope.row.process }}</div>
                        </div></template
                    >
                </el-table-column> -->
                <el-table-column label="完成情况" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.isCompleted ? 'success' : 'danger'">{{
                            scope.row.isCompleted ? "已完成" : "未完成"
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="难度" width="140">
                    <template #default="scope">
                        <el-rate :model-value="scope.row.difficulty" disabled allow-half disabled-void-color="#574938">
                        </el-rate>
                    </template>
                </el-table-column>
                <el-table-column label="奖励" width="100">
                    <template #default="scope">
                        <el-tooltip placement="top" v-if="scope.row.item">
                            <template #content><jx3-item :item="scope.row.item" /></template>
                            <img class="u-icon" :src="iconLink(scope.row.item?.IconID)" />
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
import { getMenus, getAchievementsPost, getMapList } from "@/service/achievement";
import { getWikiAchievementLeapSchema, getWikiAchievementLeapSchemaProgress } from "@/service/wiki";
import Item from "@jx3box/jx3box-editor/src/Item";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import { cloneDeep, sortBy } from "lodash";
export default {
    components: { "jx3-item": Item },
    props: {
        currentRole: {
            type: Object,
        },
    },
    data() {
        return {
            menuList: [],
            // 地图列表
            mapList: [],
            //详情相关
            detail: {},
            detailSelectMenu: null,
            loading: false,
        };
    },
    watch: {
        currentRole: {
            deep: true,
            handler(val, old) {
                this.getSchemaDetail();
            },
        },
    },
    created() {},
    mounted() {},
    methods: {
        iconLink,
        getLink,
        //获取方案详情
        getSchemaDetail() {
            if (this.detail?.achievements?.length > 0) {
                let length = this.detail?.achievements?.length,
                    achievements = this.detail?.achievements,
                    currentRole_achievements = this.currentRole?.achievements?.split(",") || [];

                for (let i = 0; i < length; i++) {
                    achievements[i].isCompleted = currentRole_achievements.includes(achievements[i].ID.toString());
                }
                this.detail.achievements = achievements;
                this.detail.achievementsBak = cloneDeep(this.detail.achievements);
                return;
            }
            getWikiAchievementLeapSchema(this.$route.query.id).then((res) => {
                this.detail = res.data?.data || {};
                if (res?.data?.data?.schema?.length > 0) {
                    this.detail?.meta?.createBy == "map"
                        ? this.loadMapList(res?.data?.data?.schema)
                        : this.getMenuList(res?.data?.data?.schema);
                }
            });
        },
        //自选-地图查询
        loadMapList(schema) {
            const client = this.$store.state.client;
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
                this.getAchievements(schema);
            });
        },
        // 自选-总览获取成就菜单列表
        getMenuList(schema) {
            getMenus({
                general: 1,
                client: this.$store.state.client,
            }).then((res) => {
                const data = res.data.data.menus;
                this.menuList = data;
                this.getAchievements(schema);
            });
        },

        //根据成就ID获取成就列表,同时配置分类菜单
        getAchievements(data) {
            this.loading = true;
            let attributes = "Name,Sub,Detail,IconID,Point,ID";
            if (this.detail.meta?.createBy == "map") {
                attributes = "Name,IconID,Point,SceneID,ID";
            }
            getAchievementsPost({
                ids: data.toString(),
                attributes: attributes,
            }).then((res) => {
                let achievements = res.data?.data || [];
                let length = achievements.length,
                    currentRole_achievements = this.currentRole?.achievements?.split(",") || [],
                    ids = [];
                for (let i = 0; i < length; i++) {
                    ids.push(achievements[i].ID);
                    achievements[i].isCompleted = currentRole_achievements.includes(achievements[i].ID.toString());
                }
                //筛选可显示的分类，按总览及地图区分
                if (this.detail?.meta?.createBy == "map") {
                    let mapList = cloneDeep(this.mapList); //按地图分类

                    mapList.forEach((item) => {
                        item.children.forEach((item_c) => {
                            for (let i = 0; i < length; i++) {
                                let findItem = achievements.find((i) => i.SceneID == item_c.value);
                                if (findItem) {
                                    item_c.show = true;
                                    item.show = true;
                                }
                            }
                        });
                    });
                    this.mapList = mapList;
                } else {
                    let menu = cloneDeep(this.menuList);
                    Object.keys(menu).map((key) => {
                        menu[key].children.forEach((item_c) => {
                            for (let i = 0; i < length; i++) {
                                if (menu[key].sub == achievements[i].Sub) {
                                    menu[key].show = true;
                                }
                                if (achievements[i].Detail == item_c.detail) {
                                    item_c.show = true;
                                }
                            }
                        });
                    });

                    this.menuList = menu;
                }
                this.loading = false;
                this.getAchievementProgress(ids, achievements);
            });
        },
        //全服完成进度及难度
        getAchievementProgress(data, achievements) {
            this.loading = true;
            getWikiAchievementLeapSchemaProgress(data).then((res) => {
                let progressAndDifficulty = res.data?.data || [];
                this.detail.progressAndDifficulty = progressAndDifficulty;
                let arr = [];
                progressAndDifficulty.forEach((item, index) => {
                    let findItem = achievements.find((i) => i.ID == item.achievement_id);
                    if (findItem) {
                        item.difficulty = item.difficulty ? item.difficulty / 10 : 0;
                        arr.push(Object.assign(findItem, item));
                    }
                });
                this.detail.achievements = sortBy(arr, function (o) {
                    return o.difficulty;
                });
                this.detail.achievementsBak = cloneDeep(this.detail.achievements);
                this.loading = false;
            });
        },
        //TODO 全服完成度计算，暂时作废20250113
        getDifficulty() {
            let arr = [];
            this.detail.achievementsBak.forEach((item) => {
                let findInfo = this.detail.progressAndDifficulty.find((item2) => item2.achievement_id == item.ID);
                item.difficulty = (findInfo?.difficulty || 0) / 10;

                item.process =
                    (((findInfo.completed_role_count / findInfo.total_role_count) * 100).toFixed(2) || 0) + "%";
                arr.push(item);
            });
            this.detail.achievements = arr;
            this.$forceUpdate();
        },

        //详情界面时菜单分类切换
        changeDetailMenu(item, type) {
            if (type == 0) {
                this.detailSelectMenu = null;
                this.detail.achievements = cloneDeep(this.detail.achievementsBak);
                return;
            }
            if (this.detail.meta?.createBy == "map") {
                this.detailSelectMenu = item.value;
            }
            this.detail.meta?.createBy == "map"
                ? (this.detailSelectMenu = item.value)
                : (this.detailSelectMenu = item.id);

            let arr = [],
                achievementsBak = this.detail.achievementsBak,
                length = achievementsBak.length;
            for (let i = 0; i < length; i++) {
                if (this.detail.meta?.createBy == "map") {
                    if (achievementsBak[i].SceneID == item.value) {
                        arr.push(achievementsBak[i]);
                    }
                } else {
                    if (
                        (type == 1 && achievementsBak[i].Sub == item.sub) ||
                        (type == 2 && achievementsBak[i].Detail == item.detail)
                    ) {
                        arr.push(achievementsBak[i]);
                    }
                }
            }
            this.detail.achievements = arr;
        },
    },
};
</script>

<style lang="less">
.m-detail {
    height: calc(100% - 42px) !important;
    .el-table {
        &::before {
            height: 0;
        }
    }
    .el-table,
    .u-table-header_row,
    .u-table-header_cell {
        background-color: transparent;
        .el-table__body tr:hover > td {
            background-color: #f3f0ed;
        }
    }

    .u-table-header_cell {
        .x;
        color: rgba(245, 224, 201, 1);
        .u-table-cell_left {
            padding-left: 0;
            padding-right: 0;
            .w(100%);
            text-align: left;
        }
        .u-table-cell_right {
            padding-left: 0;
            padding-right: 0;
            .w(100%);
            text-align: right;
        }
    }
    .u-table-cell {
        .x;
        color: rgba(112, 83, 45, 1);
        a {
            color: rgba(112, 83, 45, 1);
        }
    }
    .u-table-row {
        //奇偶选择器
        &:nth-child(odd) {
            background: #ebe5df;
        }
        &:nth-child(even) {
            background: #fff;
        }
    }
    .u-page {
        .mt(6px);
        text-align: right;

        .el-pagination.is-background .el-pager li:not(.disabled):hover {
            color: rgba(112, 83, 45, 1);
        }
        .el-pagination.is-background .el-pager li:not(.disabled).active {
            background-color: #ffeccc;
            color: rgba(112, 83, 45, 1);
        }
    }
    .h(100%);
    .flex;
    border-top: 2px solid #ffeccc;
    .u-detail-left,
    .u-detail-right .el-table__body-wrapper {
        /* 针对Webkit内核的浏览器 */
        &::-webkit-scrollbar {
            /* 设置滚动条的宽度 */
            width: 10px;
        }

        /* 滚动条轨道 - 背景颜色/白底 */
        &::-webkit-scrollbar-track {
            background: #595958;
            border-radius: 4px;
        }

        /* 滚动条的滑块部分 */
        &::-webkit-scrollbar-thumb {
            background: #e2d3b9;
            border-radius: 4px;
        }

        /* 当鼠标悬停在滚动条滑块上时改变颜色 */
        &::-webkit-scrollbar-thumb:hover {
            background: #e2d3b9;
        }
    }
    .u-detail-left {
        .h(100%);
        .w(120px);
        .fz(14px);
        .bold(400);
        overflow-y: auto;
        padding: 6px;
        box-sizing: border-box;
        color: rgba(255, 236, 204, 1);
        flex-shrink: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(87, 73, 56, 1) 100%);

        .u-detail-left_item {
            margin: 0;
            padding: 0;
            list-style-type: none;
            .u-menu-text {
                .mb(8px);
                padding: 2px;
                box-sizing: border-box;
                cursor: pointer;
                &:hover {
                    color: #fff;
                    .bold(700);
                    background: linear-gradient(90deg, #3d342a 0%, #806241 52.78%, #3d342a 100%);
                }
                &.active {
                    color: #fff;
                    .bold(700);
                    background: linear-gradient(90deg, #3d342a 0%, #806241 52.78%, #3d342a 100%);
                }
            }
        }
        .u-menu-parent_name {
            .mb(8px);
        }
        .u-menu-item_children {
            .ml(10px);
        }
    }
    .u-detail-right {
        .w(calc(100% - 120px));
        .u-table-header_row {
            .gutter {
                display: none !important;
            }
        }
        .u-achievement-name {
            .flex;
            align-items: center;
            span {
                color: #70532d;
            }
        }
        .u-icon {
            .size(24px);
            .mr(4px );
        }
        .u-process-box {
            background-color: #574938;
            .h(18px);
            .pr;
            .u-process-text {
                .pa;
                .lt(0);
                .size(100%,100%);
                color: #fff;
                .fz(16px,18px);

                .x;
                .bold(700);
                z-index: 3;
            }
            .u-process-item {
                .h(100%);

                background: linear-gradient(90deg, #3d342a 0%, #cbb79a 100%);
            }
        }
    }
}
</style>
