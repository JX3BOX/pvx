<template>
    <div class="p-leap-mobile" :class="{ fold: isFold }">
        <!-- 用户信息及切换筛选位置、 -->
        <div class="m-overview-header_mobile">
            <div class="u-name">
                <!-- 折叠侧栏按钮 -->
                <el-icon v-show="isFold" @click="changeFold">
                    <Expand />
                </el-icon>
                <el-icon v-show="!isFold" @click="changeFold">
                    <Fold />
                </el-icon>
            </div>

            <div class="u-select">
                <el-dropdown trigger="click">
                    <div class="u-select-btn">
                        <span>{{ currentRole.name }}
                            {{ currentRole.server && "·" }}
                            {{ currentRole.server }}</span>
                        <img src="@/assets/img/wiki/overview/toggle-user-icon.svg" alt="" width="16px" height="16px" />
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="role in roleList" :key="role.ID">
                                <div @click="onChangeRole(role)" class="m-role-item">
                                    <span>{{ role.name }}</span>
                                    <span>{{ role.server }}</span>
                                </div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
        <!--成就分类 -->
        <div class="m-achievement-tab" v-if="!isFold && isDetail && detail.meta?.createBy == 'map'">
            <ul class="u-zl-item" :class="{ active: detailSelectMenu == null }">
                <div class="u-zl-item_title" @click="changeDetailMenu(null, 0)">全部</div>
            </ul>
            <div v-for="(item, index) in mapList" :key="index">
                <ul class="u-zl-item" v-if="item.show">
                    <div class="u-zl-item_title">{{ item.label }}</div>
                    <div v-for="(item2, index2) in item.children" :key="index2"
                        @click.stop="changeDetailMenu(item2, 2)">
                        <li class="u-zl-item_children" v-if="item2.show"
                            :class="{ active: detailSelectMenu == item2.id }">
                            {{ item2.label }}
                        </li>
                    </div>
                </ul>
            </div>
        </div>
        <div class="m-achievement-tab" v-else>
            <ul class="u-zl-item" :class="{ active: detailSelectMenu == null }">
                <div class="u-zl-item_title" @click="changeDetailMenu(null, 0)">全部</div>
            </ul>
            <div v-for="(item, index) in menuList" :key="index" @click="changeDetailMenu(item, 1)">
                <ul class="u-zl-item" v-if="item.show" :class="{ active: detailSelectMenu == item.id }">
                    <div class="u-zl-item_title">{{ item.name }}</div>
                    <div v-for="(item2, index2) in item.children" :key="index2"
                        @click.stop="changeDetailMenu(item2, 2)">
                        <li class="u-zl-item_children" v-if="item2.show"
                            :class="{ active: detailSelectMenu == item2.id }">
                            {{ item2.name }}
                        </li>
                    </div>
                </ul>
            </div>
        </div>
        <!-- 列表主要位置，左侧收缩后展开为最宽调整p-leap-mobile类包裹的宽度 -->
        <div class="m-leap-main" v-if="!isDetail">
            <el-table :data="list" style="width: 100%; max-height: calc(100vh - 85px)" height="100%" stripe
                row-class-name="u-table-row" cell-class-name="u-table-cell" header-row-class-name="u-table-header_row"
                header-cell-class-name="u-table-header_cell">
                <el-table-column prop="title" label="方案名称" width="160">
                    <template #default="scope">
                        <router-link target="_blank" :to="{ name: 'leap', query: { id: scope.row.id } }">
                            {{ scope.row.title }}
                        </router-link>
                    </template>
                </el-table-column>
                <el-table-column label="方案资历总点数" width="120">
                    <template #default="scope"> {{ getSchemePoints(scope.row.schema)?.all || 0 }} </template>
                </el-table-column>
                <el-table-column label="可提升资历点数" width="120">
                    <template #default="scope"> {{ getSchemePoints(scope.row.schema)?.diffNum || 0 }} </template>
                </el-table-column>
                <el-table-column label="来源" width="80">
                    <template #default="scope"> {{ scope.row.is_official == 1 ? "魔盒" : "玩家" }} </template>
                </el-table-column>
            </el-table>
            <div class="u-page">
                <el-pagination background hide-on-single-page layout="prev, pager, next" :page-size="queryParams.per"
                    :total="pageTotal" @current-change="pageChange">
                </el-pagination>
            </div>
        </div>
        <!-- 详情界面 -->
        <div class="m-leap-detail" v-else>
            <el-table :data="detail.achievements || []" style="width: 100%" stripe height="100%"
                row-class-name="u-table-row" cell-class-name="u-table-cell" header-row-class-name="u-table-header_row"
                header-cell-class-name="u-table-header_cell" v-loading="loading">
                <el-table-column prop="Name" label="成就名称">
                    <template #default="scope">
                        <a :href="getLink('achievement', scope.row.ID)" target="_blank">
                            <div class="u-achievement-name">
                                <img class="u-icon" :src="iconLink(scope.row?.IconID)" />
                                <span>{{ scope.row.Name }}</span>
                            </div>
                        </a>
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
                <el-table-column label="奖励" width="60">
                    <template #default="scope">
                        <el-popover placement="right" width="400" trigger="click" v-if="scope.row.item">
                            <div><jx3-item :item="scope.row.item" /></div>
                            <template #reference><img class="u-icon"
                                    :src="iconLink(scope.row.item?.IconID)" /></template>
                        </el-popover>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
import {
    getRoleGameAchievements,
    getMenus,
    getAchievementPoints,
    getAchievementsPost,
    getMapList,
} from "@/service/achievement";
import {
    getWikiAchievementLeapSchemaList,
    getWikiAchievementLeapSchema,
    getWikiAchievementLeapSchemaProgress,
} from "@/service/wiki";
import Item from "@jx3box/jx3box-editor/src/Item";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { getUserRoles } from "@/service/team";
import { cloneDeep, sortBy } from "lodash";
export default {
    components: { "jx3-item": Item },
    data() {
        return {
            isFold: false, //侧栏是否隐藏
            isDetail: false, //是否是详情界面
            currentRole: {}, //当前角色
            roleList: [],
            loading: false,
            menuList: [],
            selectMenuItem: {},
            selectMenuChildrenItem: {},
            achievements: [],
            //方案列表
            list: [],
            queryParams: { page: 1, per: 20 },
            pageTotal: 0, //总条数
            //自选方案配置列表
            customList: [],
            //详情相关
            detail: {},
            detailSelectMenu: null,
            detailPageTotal: 0,
            // 地图列表
            mapList: [],
        };
    },
    created() {
        this.loadUserRoles();
    },
    mounted() { },
    methods: {
        changeFold() {
            this.isFold = !this.isFold;
            this.$store.commit("SET_STATE", { key: "is_fold", value: this.isFold });
        },
        iconLink,
        getLink,
        // 获取成就菜单列表
        getMenuList(schema) {
            getMenus({
                general: 1,
                client: this.$store.state.client,
            }).then((res) => {
                const data = res.data.data.menus;
                this.menuList = data;
                if (this.isDetail) this.getAchievements(schema);
            });
        },
        // 获取当前用户角色列表
        loadUserRoles() {
            User.isLogin() &&
                getUserRoles().then((res) => {
                    this.roleList = res.data?.data?.list || [];
                    this.currentRole = res.data?.data?.list[0] || {};

                    if (this.$route.query.id) {
                        this.isDetail = true;
                        this.getRoleGameAchievements();
                    } else {
                        this.getPoints();
                    }
                });
        },
        // 获取成就对应点数
        getPoints() {
            return getAchievementPoints().then((res) => {
                const data = res.data.data.points;
                this.pointsData = data;
                this.getRoleGameAchievements(); //获取当前角色成就
            });
        },
        onChangeRole(val) {
            this.currentRole = val;
            this.getRoleGameAchievements();
        },
        //获取当前角色成就
        getRoleGameAchievements() {
            getRoleGameAchievements(this.currentRole.jx3id).then((res) => {
                this.currentRole.achievements = res.data?.data?.achievements || [];

                if (this.isDetail) {
                    if (this.detail?.achievements?.length > 0) {
                        let length = this.detail?.achievements?.length,
                            achievements = this.detail?.achievements,
                            currentRole_achievements = this.currentRole?.achievements?.split(",") || [];

                        for (let i = 0; i < length; i++) {
                            achievements[i].isCompleted = currentRole_achievements.includes(
                                achievements[i].ID.toString()
                            );
                        }
                        this.detail.achievements = achievements;
                        this.detail.achievementsBak = cloneDeep(this.detail.achievements);
                        return;
                    }
                    this.getSchemaDetail();
                    return;
                }
                //计算角色总资历
                let total = 0,
                    arr = cloneDeep(this.currentRole.achievements).split(",") || [];
                arr.forEach((item) => {
                    total = total + (this.pointsData[item] || 0);
                });
                this.currentRole.total = total;
            });
        },
        pageChange(page) {
            this.queryParams.page = page;
            this.getSchemaList(true);
        },

        //获取方案列表
        getSchemaList(status) {
            getWikiAchievementLeapSchemaList(this.queryParams).then((res) => {
                this.list = res.data?.data?.list || [];
                this.pageTotal = res.data?.data?.total || 0;
                if (!status) this.getRoleGameAchievements(); //获取当前角色成就
            });
        },
        //根据方案列表获取方案的成就ID及对应Point
        getSchemePoints(schema) {
            let pointsData = this.pointsData;

            let schemaArr = [];
            schema.forEach((item) => {
                schemaArr.push({ ID: item, Point: pointsData[item] });
            });
            let info = this.schemeCompute(schemaArr);
            return { all: info.all, diffNum: info.diffNum };
        },
        //获取方案详情
        getSchemaDetail() {
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
        getAchievementProgress(data, achievements) {
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
            });
        },

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
        //方案计算
        schemeCompute(data) {
            let all = 0,
                diffNum = 0;
            let _this = this;
            let customList = data || this.customList;

            //计算成就差值
            let arr = customList.filter(function (v) {
                all = all + v.Point;
                return _this.currentRole.achievements?.indexOf(v.ID) == -1 || false;
            });
            arr.forEach((item) => {
                diffNum = diffNum + item.Point;
            });
            return {
                all,
                diffNum,
            };
        },
    },
};
</script>

<style lang="less">
.p-leap-mobile {
    height: calc(100vh - 104px);
    width: calc(100vw - 137px);

    &.fold {
        width: 100vw;
    }

    .m-overview-header_mobile {
        position: fixed;
        .z(21);
        width: 100vw;
        left: 0;
        top: 64px;
        background-color: #fff;
        .h(40px);
        padding: 8px 24px;
        box-sizing: border-box;
        .flex;
        align-items: center;
        justify-content: space-between;

        .u-name {
            .fz(16px, 24px);
            .bold(400);
            color: rgba(181, 148, 87, 1);
            .flex;
            .flex(o);
        }

        .u-toggle-btn {
            .size(60px, 18px);
            .r(4px);
            border: 1px solid #bfb8ac;
            .flex;
            .flex(o);
            .fz(12px);
            .bold(400);
            color: rgba(191, 184, 172, 1);
        }

        .u-select {
            border: 1px solid #bfb8ac;
            padding: 0 4px;
            .r(4px);
            .flex;
            .flex(o);
            box-sizing: border-box;

            .u-select-btn {
                .flex;
                .flex(o);
                .fz(12px);
                .bold(400);
                color: rgba(191, 184, 172, 1);
            }
        }

        .u-add-btn {
            .size(24px);
            color: #e2d3b9;

            .u-add-icon {
                .fz(24px);
            }
        }
    }

    // 成就分类
    .m-achievement-tab {
        position: fixed;
        left: 10px;
        bottom: 10px;
        height: calc(100vh - 440px);
        .w(127px);
        overflow: auto;
        background: linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
        padding: 0 14px;
        box-sizing: border-box;

        .u-zl-item {
            color: #ffeccc;
            padding: 0;
            list-style-type: none;

            &.active {
                .u-zl-item_title {
                    color: #fff;
                    background: #3d342a;
                }
            }

            .u-zl-item_title {
                .fz(14px);
                padding: 4px;
                .bold(700);
            }

            .u-zl-item_children {
                .bold(400);
                .fz(12px);
                // display: none;
                color: rgba(255, 236, 204, 1);
                margin: 4px 0;
                padding: 4px 0 4px 10px;
                .pr;

                &.active {
                    background: #3d342a;
                    color: #fff;

                    &::before {
                        content: "";
                        .ps;
                        .lt(0, 50%);
                        .size(4px);
                        transform: translateY(-50%);
                        background-color: #fff;
                        .r(50%);
                        .dbi;
                    }
                }
            }
        }
    }

    .m-leap-main,
    .m-leap-detail {
        .pt(40px);
        .size(100%, calc(100% - 40px));
        .mb(8px);

        .el-table {
            &::before {
                height: 0;
            }
        }

        .el-table,
        .u-table-header_row,
        .u-table-header_cell {
            background-color: transparent;
        }

        .el-table__fixed::before {
            background-color: transparent;
        }

        .u-table-header_cell {
            .x;
            color: rgba(245, 224, 201, 1);
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

            :deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
                background-color: #ffeccc;
                color: rgba(112, 83, 45, 1);
            }
        }
    }

    .m-leap-detail {
        .u-table-header_row {
            .gutter {
                display: none !important;
            }
        }

        .u-achievement-name {
            .flex;
            flex-direction: column;
            align-items: center;

            span {
                color: #70532d;
            }
        }

        .u-icon {
            .size(24px);
            .mr(4px);
        }

        .u-process-box {
            background-color: #574938;
            .h(18px);
            .pr;

            .u-process-text {
                .pa;
                .lt(0);
                .size(100%, 100%);
                color: #fff;
                .fz(16px, 18px);

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
