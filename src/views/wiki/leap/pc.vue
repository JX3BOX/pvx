<template>
    <div class="p-leap-pc">
        <div class="m-title">
            <div class="u-label-box">
                <div class="u-label">渡劫方案</div>
                <div class="u-btn-created" v-show="list.length > 0" @click="showForm = true">
                    <LegacyIcon class="el-icon-circle-plus-outline u-add-icon" />定制方案
                </div>
            </div>

            <!-- 用户信息展示 -->
            <div :style="{
                opacity: currentRole ? 1 : 0.5,
            }" class="m-info-user">
                <span class="u-name">{{ currentRole.name }}
                    {{ currentRole.server && "·" }}
                    {{ currentRole.server }}</span>
                <el-dropdown trigger="click">
                    <div class="u-toggle-btn">
                        <img src="@/assets/img/wiki/overview/toggle-user-icon.svg" alt="" />
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu class="m-role-dropdown">
                            <el-dropdown-item v-for="role in roleList" :key="role.ID">
                                <div @click="onChangeRole(role)" class="m-role-item" :class="{
                                    active: role.jx3id === currentRole.jx3id,
                                }">
                                    <span>{{ role.name }}</span>
                                    <span>{{ role.server }}</span>
                                </div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <div class="u-user-all_achievement">
                    当前资历：<span>{{ currentRole.total || 0 }}</span>
                </div>
            </div>
        </div>
        <!-- 主要位置 -->
        <div class="m-main" v-if="!showDetail">
            <div class="u-tips">
                本功能提供自定义的渡劫成就速成方案<br />
                ①点击定制方案<br />
                ②输出方案名称，如地图，并输入你想达到的成就点数<br />
                ③在自选中，你可以通过选择总览按照分类或地图，选择相应的成就，系统将会按照难度从低到高排列生成
            </div>
            <div class="m-tables">
                <el-table :data="list" style="width: 100%" stripe row-class-name="u-table-row"
                    cell-class-name="u-table-cell" header-row-class-name="u-table-header_row"
                    header-cell-class-name="u-table-header_cell" v-loading="loading">
                    <el-table-column prop="title">
                        <template #header>
                            <div class="u-table-cell_left">方案名称</div>
                        </template>
                        <template #default="scope">
                            <router-link target="_blank" :to="{ name: 'leap', query: { id: scope.row.id } }">
                                <div style="text-align: left; height: 24px">{{ scope.row.title }}</div>
                            </router-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="方案资历总点数" width="180">
                        <template #default="scope"> {{ getSchemePoints(scope.row.schema)?.all || 0 }} </template>
                    </el-table-column>
                    <el-table-column width="180">
                        <template #header>
                            <div class="u-table-cell_right">可提升资历点数</div>
                        </template>
                        <template #default="scope">
                            <div style="text-align: right">{{ getSchemePoints(scope.row.schema)?.diffNum || 0 }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column width="180">
                        <template #header>
                            <div class="u-table-cell_right">来源</div>
                        </template>
                        <template #default="scope">
                            <div style="text-align: right">
                                {{ scope.row.is_official == 1 ? "魔盒" : "玩家" }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column width="180">
                        <template #header>
                            <div class="u-table-cell_right">操作</div>
                        </template>
                        <template #default="scope">
                            <div style="text-align: right">
                                <el-button type="danger" icon="Delete" size="small" round
                                    @click="deleteItem(scope.row)">删除</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="u-page">
                    <el-pagination background hide-on-single-page layout="prev, pager, next"
                        :page-size="queryParams.per" :total="pageTotal" @current-change="pageChange">
                    </el-pagination>
                </div>
            </div>
            <!-- 定制按钮 -->
            <div class="u-btn" @click="showForm = true" v-show="list.length == 0">
                <LegacyIcon class="el-icon-circle-plus-outline u-add-icon" />
                <div>定制方案</div>
            </div>
        </div>
        <!-- 方案弹窗 -->
        <createFrom :show="showForm" :currentRole="currentRole" :pointsData="pointsData" @reloadList="reloadList"
            @cancel="showForm = false"></createFrom>
        <!-- 方案详情 -->
        <detail v-if="showDetail && !isEmpty(currentRole)" :currentRole="currentRole" />
    </div>
</template>

<script>
import { getRoleGameAchievements, getAchievementPoints } from "@/service/achievement";
import { getWikiAchievementLeapSchemaList, deleteWikiAchievementLeapSchema } from "@/service/wiki";
import createFrom from "./form";
import detail from "./detail.vue";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { getUserRoles } from "@/service/team";
import { cloneDeep, isEmpty } from "lodash";

export default {
    components: { createFrom, detail },
    data() {
        return {
            currentRole: {}, //当前角色
            roleList: [],
            loading: false,
            //方案列表
            list: [],
            queryParams: { page: 1, per: 9 },
            pageTotal: 0, //总条数
            showForm: false,
            pointsData: {}, //成就点数
            //详情
            showDetail: false,
        };
    },
    watch: {},
    created() {
        this.loadUserRoles();
        if (this.$route.query.id) {
            this.showDetail = true;
        }
    },
    mounted() { },
    methods: {
        iconLink,
        getLink,
        isEmpty,
        reloadList() {
            this.showForm = false;
            this.getSchemaList(); //重新加载方案列表
        },
        // 获取当前用户角色列表
        loadUserRoles() {
            if (!User.isLogin()) {
                this.$confirm("请先登录").then((_) => {
                    User.toLogin(window.location.href);
                });

                return;
            }

            getUserRoles().then((res) => {
                this.roleList = res.data?.data?.list || [];
                this.currentRole = res.data?.data?.list[0] || {};
                this.getPoints();
            });
        },
        // 获取成就对应点数
        getPoints() {
            return getAchievementPoints().then((res) => {
                const data = res.data.data.points;
                this.pointsData = data;

                //获取方案列表
                this.getSchemaList();
            });
        },
        onChangeRole(val) {
            // this.currentRole = val;
            this.getRoleGameAchievements(val);
        },
        //获取当前角色成就
        getRoleGameAchievements(val) {
            getRoleGameAchievements(val?.jx3id || this.currentRole.jx3id).then((res) => {
                val ? (this.currentRole = val) : "";
                this.currentRole.achievements = res.data?.data?.achievements || [];
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
            this.loading = true;
            getWikiAchievementLeapSchemaList(this.queryParams)
                .then((res) => {
                    this.list = res.data?.data?.list || [];
                    this.pageTotal = res.data?.data?.total || 0;
                    if (!status) this.getRoleGameAchievements(); //获取当前角色成就
                })
                .finally(() => {
                    this.loading = false;
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
        //删除方案
        deleteItem(row) {
            this.$confirm(`是否确定要删除方案${row.title}?`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                deleteWikiAchievementLeapSchema(row.id).then((res) => {
                    this.$message.success("删除成功");
                    this.getSchemaList();
                });
            });
        },
    },
};
</script>

<style lang="less">
.p-leap-pc {
    padding-top: 45px;
    width: 960px;
    height: 97%;
    box-sizing: border-box;

    .m-info-user {
        .flex;
        .h(35px);
        transition: 0.5s;
        align-items: center;

        .u-name {
            .fz(16px, 25px);
            .mr(8px);
            .bold;
            color: #fff;
        }

        .u-toggle-btn {
            .flex;
            .flex(o);
            .size(28px);
            color: #ffeccc;
            cursor: pointer;
        }

        .u-user-all_achievement {
            .fz(16px, 25px);
            .ml(8px);
            color: #ffeccc;

            span {
                color: #fff;
            }
        }
    }

    .m-title {
        .flex;
        align-items: center;
        justify-content: space-between;
        .pb(12px);
        border-bottom: 2px solid #fff;

        // .mb(8px);
        .u-label-box {
            .flex;
            align-items: center;
            .w(130px);
            flex-shrink: 0;
        }

        .u-label {
            .w(115px);
            flex-shrink: 0;
            mask-image: linear-gradient(180deg, rgba(255, 255, 255, 1) 43.06%, rgba(255, 255, 255, 0) 100%);
            .fz(26px);
            .bold(900);
            color: #fff;
        }

        .u-btn-created {
            .size(120px, 20px);
            flex-shrink: 0;
            border: 1px solid #ffeccc;
            .r(10px);
            .flex;
            .flex(o);
            padding: 4px 0;
            color: #e2d3b9;
            cursor: pointer;
            .fz(14px);

            .u-add-icon {
                .fz(16px);
            }
        }

        .u-tip {
            flex: 1;
            color: rgba(255, 236, 204, 1);
            .fz(14px);
            .bold(400);
        }
    }

    .m-tables {
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

            .el-table__body tr:hover>td {
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
                background-color: #ffeccc;
                color: rgba(112, 83, 45, 1);
            }


            .el-pagination.is-background .el-pager li.is-active {
                background-color: #ffeccc;
                color: rgba(112, 83, 45, 1);
            }
        }
    }

    .m-main {
        .u-tips {
            .pt(10px);
            color: rgba(245, 224, 201, 1);
            .fz(14px, 24px);
        }

        .u-btn {
            border: 1px solid #ffeccc;
            .r(10px);
            .size(960px, 360px);
            .flex;
            .flex(o);
            flex-direction: column;
            color: #e2d3b9;
            cursor: pointer;

            .u-add-icon {
                .fz(42px);
            }
        }
    }
}
</style>
