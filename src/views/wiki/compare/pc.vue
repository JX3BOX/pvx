<template>
    <div class="p-compare">
        <!-- 顶部信息 -->
        <div class="u-title">
            <div class="u-label">亲友对比</div>
            <div class="u-tip">
                <div class="u-select">
                    <el-select v-model="selectTab" placeholder="请选择" multiple collapse-tags clearable
                        @change="selectTabChange">
                        <el-option v-for="item in selectOptions" :key="item.type" :label="item.name" :value="item.type"
                            :disabled="isSelectDisabled(item.type)">
                        </el-option>
                    </el-select>
                </div>

                <!-- *根据成就未完成人数由多到少排序。 -->
                <el-input placeholder="输入成就名称/成就描述/称号/奖励物品「回车」进行搜索" v-model="searchKeyword" class="u-search-input"
                    @keydown.enter="searchHandle">
                    <template #prepend>
                        <slot><el-cascader v-model="searchMap" :options="mapList" @change="searchHandle"
                                :show-all-levels="false" clearable class="u-cascader"></el-cascader></slot>
                    </template>
                    <template #append><el-button icon="Search" class="u-btn"
                            @click="searchHandle"></el-button></template>
                </el-input>
            </div>
            <div class="u-export" @click="exportToExcel">
                导出当前表格
            </div>
        </div>
        <div class="m-compare-main">
            <!-- 左侧成就筛选 -->
            <div class="u-left">
                <ul class="u-zl-item" :class="{
                    active: item.sub == activeIndex,
                    show: item.sub == activeIndex && !activeShow,
                }" v-for="(item, index) in menuList" :key="index" @click="setActiveIndex(item.sub)">
                    <div class="u-zl-item_title">
                        {{ item.name }}
                        <!-- &nbsp;<el-icon :class="item.sub == activeIndex && activeShow ? 'el-icon-caret-top' : 'el-icon-caret-bottom'
                            " @click.stop="setActiveShow(item.sub)" /> -->
                    </div>
                    <li class="u-zl-item_children" :class="{ active: item2.detail == activeIndexChildren }"
                        v-for="(item2, index2) in item.children" :key="index2"
                        @click.stop="setActiveIndex(item.sub, item2.detail)">
                        {{ item2.name }}
                    </li>
                </ul>
            </div>
            <div class="u-right">
                <!-- 竖向布局 -->
                <div class="u-zl-box">
                    <div class="u-zl_table" :style="'width:' + (contrastKith.length + 1) * 200 + 'px'">
                        <div class="u-table_label ps">成就名称</div>
                        <!-- 对比亲友及自身 -->
                        <div class="u-table_label kith" v-for="(item, index) in contrastKith" :key="index">
                            <div class="u-name" :title="item.name + '·' + item.server">
                                {{ item.name }}·{{ item.server }}
                            </div>
                            <el-icon class="el-icon-circle-close" @click="delRole(item, index)" />
                        </div>
                    </div>
                    <!-- 总资历模块 -->
                    <div class="u-zl-number_table" :style="'width:' + (contrastKith.length + 1) * 200 + 'px'">
                        <div class="u-table_label ps">总资历</div>
                        <!-- 对比亲友及自身 -->
                        <div class="u-table_label kith" v-for="(item, index) in contrastKith" :key="index">
                            <div class="u-name" :title="item.name + '·' + item.server + '总资历：' + item.number">
                                {{ item.number }}
                            </div>
                        </div>
                    </div>
                    <div class="u-zl_cell" :style="'width:' + (contrastKith.length + 1) * 200 + 'px'"
                        v-loading="achievementsLoading">
                        <div class="u-zl-list ps">
                            <div class="u-zl-list_item" v-for="(item, index) in achievements" :key="index">
                                <el-tooltip effect="dark" :content="item.Desc" placement="top">
                                    <a :href="get_link(item.ID)" target="_blank">
                                        <div class="u-zl-list_item_box">
                                            <img class="u-icon" :src="icon_url(item?.IconID)" />
                                            <span class="u-name">{{ item?.Name }}</span>
                                        </div>
                                    </a>
                                </el-tooltip>
                            </div>
                        </div>
                        <div class="u-zl-list" v-for="(item, index) in contrastKith" :key="index">
                            <div class="u-zl-list_item kith" v-for="(item2, index2) in item.achievements" :key="index2">
                                <div class="u-self-checked" :class="{ finish: item2.value != '-1' }">
                                    <el-icon v-if="item2.value != '-1'"><Select color="#000000" /></el-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="u-zl-add_item" @click="addRole">
                    <img class="u-add-icon" :src="require('@/assets/img/wiki/compare/add.svg')" alt="" />
                    <div class="u-add-txt">添加角色</div>
                </div>
            </div>
        </div>
        <!-- 添加角色弹窗 -->
        <el-dialog v-model="showAddRole" title="添加角色" width="420px" draggable :close-on-click-modal="false">
            <el-form :model="kithForm" :rules="rules" ref="roleRef">
                <el-form-item label="角色类型" prop="roleType">
                    <el-radio-group v-model="kithForm.roleType" @input="
                        kithForm.userId = '';
                    kithForm.jx3Id = [];
                    ">
                        <el-radio label="1">自身</el-radio>
                        <el-radio label="2">亲友</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="我的亲友" prop="uid" v-if="kithForm.roleType == 2">
                    <el-select v-model="kithForm.uid" placeholder="请选择" @change="getKithRolesList">
                        <el-option :label="item?.kith_info?.display_name || '-'" :value="item.kith_id"
                            v-for="(item, index) in myKith" :key="index"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="对应角色" prop="jx3Id">
                    <el-select v-model="kithForm.jx3Id" placeholder="请选择对应角色" @change="setRoleInfo" multiple>
                        <el-option :label="item.name" :value="item.jx3id"
                            v-for="(item, index) in kithForm.roleType == 1 ? roleList : myKithRoles"
                            :key="index"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="u-tips">
                <div>
                    <el-icon class="el-icon-info" />&nbsp;提示
                </div>
                1. 添加亲友角色后，可对比亲友角色与自身角色的成就进度。<br />
                2. 去<a href="https://www.jx3box.com/dashboard/privacy?tab=whitelist" target="_blank">添加亲友</a>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showAddRole = false">取 消</el-button>
                    <el-button type="primary" @click="addRoleConfirm">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import {
    getRoleGameAchievements,
    getMenuAchievements,
    getMenus,
    getAchievementPoints,
    searchAchievements,
    getMapList,
} from "@/service/achievement";
import { getMyKith, getMyKithRoles } from "@/service/wiki";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { getUserRoles } from "@/service/team";
import { cloneDeep } from "lodash";
import * as XLSX from 'xlsx';
export default {
    components: {},
    data() {
        return {
            currentRole: {}, //当前角色
            menuList: [],
            selectTab: [],
            selectOptions: [
                {
                    name: "共同未完成的",
                    value: 1,
                    type: "1,1",
                },
            ],
            activeIndex: 1,
            activeShow: true,
            activeIndexChildren: null,
            achievements: [],
            achievements_bak: [],
            achievementsLoading: false,
            showAddRole: false,
            myKith: [],
            myKithRoles: [],
            roleList: [],
            kithForm: {
                uid: "",
                jx3Id: [],
            },
            rules: {
                roleType: { required: true, message: "请选择类型", trigger: "change" },
                uid: { required: true, message: "请选择亲友", trigger: "change" },
                jx3Id: { required: true, message: "请选择角色", trigger: "change" },
            },
            contrastKith: [], //对比的亲友及自身
            contrastKith_bak: [], //对比的亲友及自身备份
            pointsData: [],

            searchKeyword: "", //搜索成就关键字
            searchMap: [],
            mapList: [],
        };
    },

    created() {
        this.loadUserRoles();
        this.loadMapList();
    },
    mounted() { },
    methods: {
        get_link: function (id) {
            return getLink("achievement", id);
        },
        icon_url: function (id) {
            return iconLink(id);
        },
        setActiveShow(sub) {
            if (this.activeIndex == sub) {
                this.activeShow = !this.activeShow;
                return;
            }
            this.setActiveIndex(sub);
        },
        setActiveIndex(sub, detail) {
            if (this.achievementsLoading) return;
            if (this.activeIndex != sub && !detail) {
                this.activeShow = true;
            }

            this.activeIndex = sub;
            if (detail) {
                this.activeIndexChildren = detail;
            } else {
                this.activeIndexChildren = null;
            }
            this.getMenuAchievements(sub, detail);
        },
        //地图
        loadMapList() {
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
            });
        },
        //搜索
        searchHandle() {
            this.activeIndex = null;
            this.activeIndexChildren = null;
            this.getSearchAchievements();
        },
        //根据搜索获取成就
        getSearchAchievements() {
            this.achievementsLoading = true;
            let params = {
                keyword: this.searchKeyword,
                scene: this.searchMap?.[1] ?? "",
                client: this.$store.state.client,
                _no_page: 1,
                limit: 99999,
            };
            searchAchievements(params)
                .then((data) => {
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
                    this.achievements = arr;
                    this.achievements_bak = cloneDeep(this.achievements);
                    this.queryFinish();
                    this.selectTabChange();
                })
                .finally(() => {
                    this.achievementsLoading = false;
                });
        },
        // 获取成就对应点数
        getPoints() {
            return getAchievementPoints().then((res) => {
                const data = res.data.data.points;
                this.pointsData = data;
                this.getList();
            });
        },
        // 获取成就菜单列表
        getList() {
            getMenus({
                general: 1,
                client: this.$store.state.client,
            }).then((res) => {
                const data = res.data.data.menus;
                this.menuList = data;
                this.getMenuAchievements(1, "", 1);
            });
        },
        // 获取成就列表
        getMenuAchievements(sub = 1, detail, type) {
            this.achievementsLoading = true;
            getMenuAchievements(sub, detail)
                .then((data) => {
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
                    this.achievements = arr;
                    this.achievements_bak = cloneDeep(this.achievements);
                    //不是首次查询
                    if (type != 1) {
                        this.queryFinish();
                        this.selectTabChange();
                    } else {
                        if (this.currentRole?.jx3id) this.addRoleConfirm(this.currentRole.jx3id, 1); // 添加角色
                    }
                })
                .finally(() => {
                    this.achievementsLoading = false;
                });
        },
        addRole() {
            this.kithForm = {
                roleType: "1",
                userId: "",
                jx3Id: "",
                info: [],
            };
            this.showAddRole = true;
            this.$nextTick(() => {
                this.$refs.roleRef.clearValidate(); // 清除表单验证
            });
        },
        //获取我的亲友
        getMyKith() {
            getMyKith().then((res) => {
                this.myKith = res.data.data;
            });
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

                this.getMyKith(); //获取我的亲友
            });
        },
        getKithRolesList() {
            getMyKithRoles(this.kithForm.uid).then((res) => {
                this.myKithRoles = res.data.data;
                this.kithForm.jx3Id = "";
            });
        },
        //删除角色
        delRole(role, index) {
            this.contrastKith.splice(index, 1);
            this.selectTab = [];
            let arr = [],
                selectOptions = cloneDeep(this.selectOptions);
            selectOptions.forEach((item, index) => {
                if (item.value !== role.jx3id) {
                    arr.push(item);
                }
            });
            this.selectOptions = arr;
            this.selectTabChange(true);
        },
        setRoleInfo(value) {
            value.map((jx3Id, index) => {
                if (this.kithForm.roleType == 1) {
                    let info = this.roleList.find((item) => item.jx3id == jx3Id);
                    this.kithForm.info[index] = info;
                } else {
                    let info = this.myKithRoles.find((item) => item.jx3id == jx3Id);
                    this.kithForm.info[index] = info;
                }
            });

            // let info = this.myKithRoles.find((item) => item.jx3id == value);
            // this.kithForm.info = info;
        },
        //获取对应角色成就列表
        addRoleConfirm(jx3Id, type) {
            if (type == 1) {
                this.addRoleAndInfo(jx3Id, type);
            } else {
                // //判断是否已经存在
                // let flag = false,
                //     jx3IdArr = [];
                // this.contrastKith.forEach((item) => {
                this.kithForm.jx3Id.forEach((jx3Id) => {
                    let info = null;
                    if (this.kithForm.roleType == 1) {
                        info = this.roleList.find((item) => item.jx3id == jx3Id);
                    } else {
                        info = this.myKithRoles.find((item) => item.jx3id == jx3Id);
                    }
                    let flag = false;
                    this.contrastKith.forEach((item) => {
                        if (item.jx3id == jx3Id) {
                            flag = true;
                            return;
                        }
                    });
                    flag ? "" : this.addRoleAndInfo(jx3Id, type, info);
                });
            }
            this.showAddRole = false;
        },
        addRoleAndInfo(jx3Id, type, info) {
            // getRoleGameAchievements(type == 1 ? jx3Id : this.kithForm.jx3Id).then((res) => {
            getRoleGameAchievements(jx3Id).then((res) => {
                const my_achievements = (res.data?.data?.achievements || "").split(",");
                let contrastKith = {};
                //计算角色总资历
                let total = 0;
                my_achievements.forEach((item) => {
                    total = total + (this.pointsData[item] || 0);
                });
                if (type) {
                    contrastKith = {
                        ...this.currentRole,
                        my_achievements,
                        achievements: [],
                        number: total,
                    };
                } else {
                    contrastKith = {
                        ...info,
                        my_achievements,
                        achievements: [],
                        number: total,
                    };
                }

                //同时向select内追加个人选择
                this.selectOptions.push({
                    value: contrastKith.jx3id,
                    name: contrastKith.name + "未完成",
                    type: `${contrastKith.jx3id},1`,
                });
                this.selectOptions.push({
                    value: contrastKith.jx3id,
                    name: contrastKith.name + "已完成",
                    type: `${contrastKith.jx3id},2`,
                });
                if (type == 1 && this.contrastKith[0]) {
                    this.contrastKith[0] = contrastKith;
                } else {
                    this.contrastKith.push(contrastKith);
                }
                this.achievements = cloneDeep(this.achievements_bak);
                this.queryFinish();

                this.selectTabChange();
            });
        },
        //判断成就是否完成
        queryFinish(status) {
            let kith = this.contrastKith,
                achievements = this.achievements;
            kith.forEach((item, index) => {
                this.contrastKith[index].achievements = [];
                achievements.forEach((achievement, index2) => {
                    if (item.my_achievements.includes(achievement.ID.toString())) {
                        this.contrastKith[index].achievements.push({ key: index2, value: achievement.ID.toString() });
                    } else {
                        this.contrastKith[index].achievements.push({ key: index2, value: "-1" });
                    }
                });
            });
            if (!status) this.contrastKith_bak = cloneDeep(this.contrastKith);
        },
        //多数组取交集
        getIntersectionByKey(arrays, key) {
            if (arrays.length === 0) {
                return [];
            }
            // 将每个对象数组映射为只包含指定键值的数组
            const mappedArrays = arrays.map((array) => array.map((obj) => obj[key]));
            // if (typeof this.selectTab == "object" && this.selectTab instanceof Array && this.selectTab[0] != 1) {
            //     return [...new Set(mappedArrays.flat())];
            // }
            // 使用 reduce 方法进行交集操作
            return mappedArrays.reduce((acc, curr) => {
                return acc.filter((value) => curr.includes(value));
            });
        },
        //同一个角色不能同时选中完成和未完成
        isSelectDisabled(type) {
            let selectTab = cloneDeep(this.selectTab);
            let typeArr = type.split(",");
            let status = false;
            selectTab.forEach((item, index) => {
                let itemArr = item.split(",");
                if (itemArr[0] == typeArr[0] && itemArr[1] != typeArr[1]) status = true;
            });
            return status;
        },
        //根据条件筛选
        selectTabChange() {
            let selectTab = cloneDeep(this.selectTab),
                value = "";
            let achievements = cloneDeep(this.achievements_bak);
            let contrastKith = cloneDeep(this.contrastKith_bak);

            if (selectTab.length == 0) {
                this.achievements = achievements;
                this.queryFinish();
                return;
            }
            let all_select = "1,1";
            if (selectTab[selectTab.length - 1] == all_select) {
                value = all_select;
                selectTab = [all_select];
            }
            if (selectTab.length == 1 && selectTab[0] != all_select) value = selectTab[0];
            if (selectTab.length > 1 && selectTab[0] == all_select) {
                value = selectTab[selectTab.length - 1];
                selectTab = [value];
            }

            if (selectTab.length > 1 && (selectTab[0] != all_select || selectTab[selectTab.length - 1] != all_select))
                value = selectTab;
            this.selectTab = selectTab;
            let arr = [];
            let selectTabArr = [];
            if (typeof value == "string") selectTabArr = value.split(",");
            contrastKith.forEach((item, index) => {
                let a = [];
                const ach_filter = function (array, type = 1) {
                    array.forEach((item2, index2) => {
                        if ((item2.value == "-1" && type == 1) || (item2.value != "-1" && type == 2)) {
                            a.push({ key: item2.key, value: item2.value });
                        }
                    });
                    arr.push(a);
                };
                if (value == all_select) {
                    ach_filter(item.achievements, selectTabArr[1]);
                } else if (item.jx3id == selectTabArr[0]) {
                    ach_filter(item.achievements, selectTabArr[1]);
                } else if (typeof value == "object" && value instanceof Array) {
                    // && value.includes(item.jx3id)
                    value.forEach((item2) => {
                        let itemArr = item2.split(",");
                        if (item.jx3id == itemArr[0]) ach_filter(item.achievements, itemArr[1]);
                    });
                }
                item.achievements = a;
            });
            let keys = this.getIntersectionByKey(arr, "key");
            let achievementsFilter = [];
            keys.map((item) => {
                this.achievements_bak[item] ? achievementsFilter.push(this.achievements_bak[item]) : "";
            });
            this.achievements = achievementsFilter;
            this.queryFinish(true);
        },
        // 导出Excel功能
        exportToExcel() {
            try {
                // 验证必要数据
                if (!this.achievements || this.achievements.length === 0) {
                    this.$message.warning('暂无成就数据可导出');
                    return;
                }
                if (!this.contrastKith || this.contrastKith.length === 0) {
                    this.$message.warning('请先添加对比角色');
                    return;
                }

                // 获取共同完成情况描述
                let completionStatus = '全部成就';
                if (this.selectTab && this.selectTab.length > 0) {
                    if (this.selectTab.includes('1,1')) {
                        completionStatus = '共同未完成';
                    } else {
                        completionStatus = '自定义筛选';
                    }
                }

                // 构建角色列表字符串
                const roleNames = this.contrastKith.map(role => `${role.name}·${role.server}`).join('-');

                // 构建文件名（使用当前选中的分类）
                let mainCategoryName = '全部';
                let subCategoryName = '全部';
                console.log(this.menuList);
                if (this.menuList) {
                    //this.menuList 是一个对象，循环对象
                    let mainCategory = null;
                    for (let key in this.menuList) {
                        if (this.menuList.hasOwnProperty(key)) {
                            let element = this.menuList[key];
                            if (element.sub == this.activeIndex) {
                                mainCategoryName = element.name;
                                mainCategory = element;
                                break;
                            }
                        }
                    }
                    if (this.activeIndexChildren && mainCategory && mainCategory.children && Array.isArray(mainCategory.children)) {
                        const subCategory = mainCategory.children.find(
                            child => child.detail == this.activeIndexChildren
                        );
                        subCategoryName = subCategory ? subCategory.name : '全部';
                    }
                }

                let fileName = `剑网3资历对比-${mainCategoryName}-${subCategoryName}-${completionStatus}（${roleNames}）`;
                // 处理文件名中的特殊字符
                fileName = fileName.replace(/[\\/:*?"<>|]/g, '_');

                // 构建Excel数据
                const excelData = [];

                // 构建表头
                const headers = ['成就大类', '成就小类', '成就名称'];
                this.contrastKith.forEach(role => {
                    headers.push(`${role.name}·${role.server}`);
                });
                excelData.push(headers);

                // 辅助函数：根据成就的Sub和Detail获取分类名称
                const getCategoryNames = (achievement) => {
                    let mainCat = '未知';
                    let subCat = '';

                    if (this.menuList) {
                        // 查找成就大类
                        let mainCategory = null;
                        for (let key in this.menuList) {
                            if (this.menuList.hasOwnProperty(key)) {
                                let element = this.menuList[key];
                                if (element.sub == this.activeIndex) {
                                    mainCategory = element;
                                    break;
                                }
                            }
                        }
                        if (mainCategory) {
                            mainCat = mainCategory.name;

                            // 查找成就小类
                            if (achievement.Detail && mainCategory.children && Array.isArray(mainCategory.children)) {
                                const subCategory = mainCategory.children.find(
                                    child => child.detail === achievement.Detail
                                );
                                subCat = subCategory ? subCategory.name : '未知';
                            }
                        }
                    }

                    return { mainCat, subCat };
                };

                // 构建数据行
                this.achievements.forEach((achievement, achievementIndex) => {
                    const rowData = [];

                    // 获取该成就的分类信息
                    const { mainCat, subCat } = getCategoryNames(achievement);

                    // 成就大类
                    rowData.push(mainCat);

                    // 成就小类
                    rowData.push(subCat);

                    // 成就名称
                    rowData.push(achievement.Name || '');

                    // 各角色完成状态
                    this.contrastKith.forEach(role => {
                        const achievementStatus = role.achievements.find(a => a.key === achievementIndex);
                        const status = achievementStatus && achievementStatus.value !== '-1' ? '已完成' : '未完成';
                        rowData.push(status);
                    });

                    excelData.push(rowData);
                });


                // 创建工作簿
                const workbook = XLSX.utils.book_new();

                // 将数据转换为工作表
                const worksheet = XLSX.utils.aoa_to_sheet(excelData);

                // 设置列宽
                const colWidths = [
                    { wch: 15 }, // 成就大类
                    { wch: 15 }, // 成就小类
                    { wch: 30 }, // 成就名称
                ];
                this.contrastKith.forEach(() => {
                    colWidths.push({ wch: 12 }); // 角色列
                });
                worksheet['!cols'] = colWidths;

                // 添加工作表到工作簿
                XLSX.utils.book_append_sheet(workbook, worksheet, '资历对比');

                // 导出文件
                XLSX.writeFile(workbook, `${fileName}.xlsx`);

                // 提示成功
                this.$message.success('导出成功');
            } catch (error) {
                console.error('导出Excel失败:', error);
                this.$message.error('导出失败,请重试');
            }
        },
    },
};
</script>

<style lang="less">
/* 针对Webkit内核的浏览器 */
::-webkit-scrollbar {
    /* 设置滚动条的宽度 */
    width: 10px;
}

/* 滚动条轨道 - 背景颜色/白底 */
::-webkit-scrollbar-track {
    background: #595958;
    border-radius: 4px;
}

/* 滚动条的滑块部分 */
::-webkit-scrollbar-thumb {
    background: #e2d3b9;
    border-radius: 4px;
}

/* 当鼠标悬停在滚动条滑块上时改变颜色 */
::-webkit-scrollbar-thumb:hover {
    background: #e2d3b9;
}

.u-left {
    &::-webkit-scrollbar {
        /* 设置滚动条的宽度 */
        width: 2px;
    }
}

.p-compare {
    margin-top: 45px;
    // width: 960px;

    min-width: 1200px;
    max-width: 1620px;
    box-sizing: border-box;

    .m-info-user {
        .mb(8px);
        .flex;
        .h(35px);
        transition: 0.5s;
        align-items: center;
        color: rgba(255, 236, 204, 1);

        .u-name {
            .fz(24px, 35px);
            .mr(8px);
            .bold;
        }

        .u-toggle-btn {
            .r(4px);
            .size(96px, 28px);
            .ml(36px);
            .flex;
            .flex(o);
            border: 1px solid rgba(191, 184, 172, 1);
            color: #ffeccc;
            gap: 4px;
            cursor: pointer;

            >div {
                .flex;
                align-items: center;

                img {
                    .ml(4px);
                    width: 16px;
                    height: 16px;
                }
            }
        }

        .u-overview {
            .fz(24px, 35px);
            .bold;
            color: white;
            margin-left: auto;
            cursor: pointer;
            text-decoration: underline;
            position: relative;
            bottom: -5px;
        }
    }

    .u-title {
        .flex;
        align-items: center;
        .mb(8px);

        .u-label {
            .w(115px);
            flex-shrink: 0;
            mask-image: linear-gradient(180deg, rgba(255, 255, 255, 1) 43.06%, rgba(255, 255, 255, 0) 100%);
            .fz(26px);
            .bold(900);
            color: #fff;
        }

        .u-tip {
            flex: 1;
            .h(28px);
            gap: 12px;
            .flex;
            align-items: center;

            .u-select {
                width: 168px;
            }

            .el-select .el-select__wrapper {
                background-color: transparent;
                box-shadow: none;
                border: 1px solid rgba(217, 196, 167, 1);
                min-height: 28px;
            }

            .u-search-input {
                .w(600px);
            }

            .el-input-group__prepend {
                padding: 0 !important;
            }

            .el-input-group__append,
            .el-input-group__prepend {
                border: 0;
            }

            .el-input-group__prepend,
            .el-input__wrapper {
                background-color: transparent;
                box-shadow: none;
                border: 1px solid rgba(217, 196, 167, 1);
                min-height: 28px;
                .h(28px);

                .el-input__inner {
                    color: #D9C4A7;
                }
            }

            .u-cascader {
                .w(160px);
                border: none;
                // border: 1px solid rgba(217, 196, 167, 1);
                background-color: transparent;

                .el-input__wrapper {
                    border-right: none;
                }
            }

            .u-btn {
                .h(28px);
                background-color: rgba(255, 236, 204, 1);
                color: #000;
            }
        }

        .u-export {
            flex-shrink: 0;
            .size(168px, 28px);
            .r(4px);
            border: 1px solid rgba(217, 196, 167, 1);
            .flex;
            .flex(o);
            flex-direction: column;
            padding: 0px 12px 0px 12px;
            .fz(14px);
            font-weight: 400;
            letter-spacing: 0px;
            color: rgba(217, 196, 167, 1);

            &:hover {
                background: rgba(217, 196, 167, 1);
                color: rgba(82, 70, 61, 1);
                cursor: pointer;
            }
        }
    }

    .m-compare-main {
        height: calc(100vh - 170px);
        padding: 0;
        .flex;

        .u-left {
            flex: 0 0 106px;
            color: #ffeccc;
            background: #1b1814;
            height: 100%;
            overflow-y: auto;

            ul,
            li {
                padding: 0;
                margin: 0;
            }

            .u-zl-item {
                cursor: pointer;
                padding: 4px 4px 4px 2px;
                box-sizing: border-box;

                &.active {
                    .u-zl-item_title {
                        background: #3d342a;
                    }

                    .u-zl-item_children {
                        transition: display 0.5s ease-in;
                        display: block;
                    }
                }

                &.show {
                    .u-zl-item_children {
                        display: none;
                        transition: display 0.5s ease-out;
                    }
                }

                .u-zl-item_title {
                    .fz(14px);
                    padding: 4px;
                    .bold(700);
                }
            }

            .u-zl-item_children {
                .bold(400);
                .fz(12px);
                display: none;
                color: rgba(255, 236, 204, 1);
                padding: 4px 0 4px 20px;
                .pr;

                &.active {
                    background: #3d342a;

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

        .u-right {
            .h(100%);
            .flex;
            max-width: 1414px;
            min-width: 1093px;
            justify-content: space-between;

            .u-zl-box {
                .h(100%);
                // max-width: 642px;
                max-width: 912px;
                overflow: scroll;
                .pr;
                .fz(16px, 24px);
                .bold(400);
            }

            .u-zl_table {
                .flex;
                .w(100%);
                position: sticky;
                top: 0;
                .z(3);

                .u-table_label {
                    background-color: #463c34;
                    padding: 0px 12px 0px 12px;
                    box-sizing: border-box;
                    .size(200px, 50px);
                    flex-shrink: 0;
                    color: #ffeccc;

                    .flex;
                    .flex(o);

                    .u-name {
                        .mr(4px);
                        max-width: 170px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    &.kith {
                        justify-content: center;
                    }

                    &.ps {
                        position: sticky;
                        left: 0;
                    }

                    i {
                        cursor: pointer;
                    }
                }
            }

            .u-zl-number_table {
                .flex;
                .w(100%);

                .u-table_label {
                    background-color: #fff;
                    padding: 0px 12px 0px 12px;
                    box-sizing: border-box;
                    .size(200px, 36px);
                    flex-shrink: 0;
                    color: #846b4b;
                    .flex;
                    .flex(o);

                    .u-name {
                        .mr(4px);
                        max-width: 170px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    &.kith {
                        justify-content: center;
                    }

                    &.ps {
                        position: sticky;
                        left: 0;
                    }

                    i {
                        cursor: pointer;
                    }
                }
            }

            .u-zl_cell {
                .h(calc(100% - 86px));
                .flex;
                // .pr;
                .w(100%);
            }

            .u-zl-list {
                .size(200px, 100%);
                flex-shrink: 0;

                &.ps {
                    position: sticky;
                    left: 0;

                    .z(2);
                }

                .u-zl-list_item {
                    color: #ffeccc;
                    .w(100%);
                    min-height: 36px;
                    .flex;
                    align-items: center;

                    &:nth-child(odd) {
                        background: #ebe5df;
                    }

                    &:nth-child(even) {
                        background: #fff;
                    }

                    &.kith {
                        .flex(o);
                    }

                    .u-zl-list_item_box {
                        cursor: pointer;
                        .flex;
                        align-items: center;

                        .u-icon {
                            .size(22px);
                            margin: 0 18px 0 12px;
                        }

                        .u-name {
                            color: #846b4b;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            max-width: 140px;
                        }
                    }

                    .u-self-checked {
                        .size(24px);
                        background: #fff;
                        border: 1px solid #6e6e6d;
                        .r(4px);
                        .flex;
                        .flex(o);


                        &.finish {
                            background: linear-gradient(180deg, rgba(181, 148, 87, 1) 0%, rgba(227, 211, 191, 1) 100%);


                        }
                    }
                }
            }

            .u-zl-add_item {
                cursor: pointer;
                .size(168px, 100%);
                .fz(22px);
                .flex;
                .flex(o);
                flex-direction: column;
                border-radius: 10px;
                border: 1px solid #e2d3b9;
                .ml(12px);
                box-sizing: border-box;

                .u-add-icon {
                    margin-bottom: 12px;
                }

                .u-add-txt {
                    font-size: 24px;
                    font-weight: 400;
                    letter-spacing: 0px;
                    line-height: 34.75px;
                    color: rgba(226, 211, 185, 1);

                }
            }
        }
    }
}
</style>
