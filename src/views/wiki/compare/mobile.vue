<template>
    <div class="p-compare-mobile" :class="{ fold: isFold }">
        <!-- 用户信息及切换筛选位置、 -->
        <div class="m-overview-header_mobile">
            <div class="u-name">
                <!-- 折叠侧栏按钮 -->
                <!-- el-icon-s-fold -->
                <el-icon v-show="isFold" @click="changeFold">
                    <Expand />
                </el-icon>
                <el-icon v-show="!isFold" @click="changeFold">
                    <Fold />
                </el-icon>
            </div>

            <div class="u-select">
                <el-select v-model="selectTab" placeholder="请选择" multiple collapse-tags clearable
                    @change="selectTabChange">
                    <el-option v-for="item in selectOptions" :key="item.type" :label="item.name" :value="item.type"
                        :disabled="isSelectDisabled(item.type)">
                    </el-option>
                </el-select>
            </div>
        </div>
        <!--成就分类 -->
        <div class="m-achievement-tab" v-show="!isFold">
            <ul class="u-zl-item"
                :class="{ active: item.sub == activeIndex, show: item.sub == activeIndex && !activeShow }"
                v-for="(item, index) in menuList" :key="index" @click="setActiveIndex(item.sub)">
                <div class="u-zl-item_title">
                    {{ item.name }}&nbsp;
                    <el-icon
                        :class="item.sub == activeIndex && activeShow ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"
                        @click.stop="setActiveShow(item.sub)" />
                </div>
                <li class="u-zl-item_children" :class="{ active: item2.detail == activeIndexChildren }"
                    v-for="(item2, index2) in item.children" :key="index2"
                    @click.stop="setActiveIndex(item.sub, item2.detail)">
                    {{ item2.name }}
                </li>
            </ul>
        </div>
        <!-- 对比主要位置，左侧收缩后展开为最宽调整p-compare-mobile类包裹的宽度 -->
        <div class="m-compare-main">
            <!-- 竖向布局 -->
            <div class="u-zl-box">
                <div class="u-zl_table" :style="'max-width:' + (contrastKith.length + 1) * 60 + 120 + 'px'">
                    <div class="u-table_label ps">
                        <span class="u-compare-title">亲友对比</span>
                    </div>
                    <!-- 对比亲友及自身 -->
                    <div class="u-table_label kith" v-for="(item, index) in contrastKith" :key="index">
                        <!-- <div class="u-name" v-if="index == 0">{{ item.name.slice(0, 1) }}</div> -->
                        <el-dropdown trigger="click">
                            <div class="u-name">{{ item.name.slice(0, 1) }}</div>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item>
                                        <div @click="delRole(item, index)">删除</div>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                    <div class="u-table_label add" @click="addRole">
                        <el-icon class="el-icon-circle-plus-outline u-add-icon" />
                    </div>
                </div>
                <div class="u-zl_cell" :style="'max-width:' + (contrastKith.length + 1) * 60 + 120 + 'px'">
                    <div class="u-zl-list ps">
                        <div class="u-zl-list_item" v-for="(item, index) in achievements" :key="index">
                            <span class="u-name">[{{ item?.Name }}]</span>
                        </div>
                    </div>
                    <div class="u-zl-list" v-for="(item, index) in contrastKith" :key="index">
                        <div class="u-zl-list_item kith" v-for="(item2, index2) in item.achievements" :key="index2">
                            <div class="u-self-checked" :class="{ finish: item2.value != '-1' }">
                                <el-icon v-if="item2.value != '-1'"><Select color="#000000" /></el-icon>
                            </div>
                        </div>
                    </div>
                    <div class="u-zl-list add">
                        <div class="u-zl-list_item kith" v-for="(item2, index2) in achievements" :key="index2"></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 添加角色弹窗 -->
        <el-dialog v-model="showAddRole" title="添加角色" width="90vw" draggable :close-on-click-modal="false">
            <el-form :model="kithForm" :rules="rules" ref="roleRef">
                <el-form-item label="角色类型" prop="roleType">
                    <el-radio-group v-model="kithForm.roleType" @input="
                        kithForm.userId = '';
                    kithForm.jx3Id = '';
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
                    <el-select v-model="kithForm.jx3Id" placeholder="请选择对应角色" @change="setRoleInfo">
                        <el-option :label="item.name" :value="item.jx3id"
                            v-for="(item, index) in kithForm.roleType == 1 ? roleList : myKithRoles"
                            :key="index"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
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
import { getRoleGameAchievements, getMenuAchievements, getMenus, getAchievementPoints } from "@/service/achievement";
import { getMyKith, getMyKithRoles } from "@/service/wiki";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { getUserRoles } from "@/service/team";
import { cloneDeep } from "lodash";
export default {
    components: {},
    data() {
        return {
            isFold: false, //侧栏是否隐藏
            currentRole: {}, //当前角色
            menuList: [],
            selectTab: [],
            selectTabName: "请选择筛选条件",
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
            showAddRole: false,
            myKith: [],
            myKithRoles: [],
            roleList: [],
            kithForm: {
                uid: "",
                jx3Id: "",
            },
            rules: {
                roleType: { required: true, message: "请选择类型", trigger: "change" },
                uid: { required: true, message: "请选择亲友", trigger: "change" },
                jx3Id: { required: true, message: "请选择角色", trigger: "change" },
            },
            contrastKith: [], //对比的亲友及自身
            contrastKith_bak: [], //对比的亲友及自身
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
            // this.selectTab = "";
            this.getMenuAchievements(sub, detail);
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
            getMenuAchievements(sub, detail).then((data) => {
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
            });
        },
        addRole() {
            this.kithForm = {
                roleType: "1",
                userId: "",
                jx3Id: "",
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
            this.selectTabChange();
        },
        setRoleInfo(value) {
            if (this.kithForm.roleType == 1) {
                let info = this.roleList.find((item) => item.jx3id == value);
                this.kithForm.info = info;
            } else {
                let info = this.myKithRoles.find((item) => item.jx3id == value);
                this.kithForm.info = info;
            }
            // let info = this.myKithRoles.find((item) => item.jx3id == value);
            // this.kithForm.info = info;
        },
        //获取对应角色成就列表
        addRoleConfirm(jx3Id, type) {
            //判断是否已经存在
            let flag = false;
            this.contrastKith.forEach((item) => {
                if (item.jx3id == (type == 1 ? jx3Id : this.kithForm.jx3Id)) {
                    flag = true;
                }
            });
            if (flag) {
                this.$message.warning("该角色已存在");
                return;
            }
            getRoleGameAchievements(type == 1 ? jx3Id : this.kithForm.jx3Id).then((res) => {
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
                        ...this.kithForm.info,
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
                this.showAddRole = false;
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
            // if (typeof this.selectTab == "object" && this.selectTab instanceof Array) {
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
            console.log(arr);
            let keys = this.getIntersectionByKey(arr, "key");
            let achievementsFilter = [];
            keys.map((item) => {
                this.achievements_bak[item] ? achievementsFilter.push(this.achievements_bak[item]) : "";
            });
            this.achievements = achievementsFilter;
            this.queryFinish(true);
        },
    },
};
</script>

<style lang="less" scoped>
.p-compare-mobile {
    height: calc(100vh - 104px);
    width: calc(100vw - 137px);

    &.fold {
        width: 100vw;
    }

    // padding-top: 40px;
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
            // border: 1px solid #bfb8ac;
            .h(32px);
            box-sizing: border-box;
            min-width: 140px;
            .flex;
            .flex(o);

            .el-select {
                .h(100%);

                :deep(.el-input),
                :deep(.el-input__inner) {
                    .h(100%);
                }

                :deep(.el-input__suffix) {
                    .flex;
                    .flex(o);
                }

                :deep(.el-select__tags) {
                    max-width: 100% !important;
                }
            }

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

            &.active {
                .u-zl-item_title {
                    color: #fff;
                    background: #3d342a;
                }

                .u-zl-item_children {
                    transition: display 0.5s ease-out;
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

            .u-zl-item_children {
                .bold(400);
                .fz(12px);
                display: none;
                color: rgba(255, 236, 204, 1);
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

    .m-compare-main {
        .size(100%, 100%);
        .pt(40px);
        .flex;

        .u-zl-box {
            .h(100%);
            max-width: 642px;
            overflow: auto;
            .pr;
            .fz(14px);
            .bold(400);
        }

        // 表格顶部
        .u-zl_table {
            .flex;
            .w(100%);
            position: sticky;
            top: 0;
            .z(3);

            .u-table_label {
                // .size(120px,50px);
                .h(50px);
                flex-shrink: 0;
                background-color: #12100e;
                padding: 0px 12px 0px 12px;
                box-sizing: border-box;
                color: #ffeccc;
                .flex;
                .flex(o);

                .u-name {
                    color: #fff;
                    .size(28px);
                    border-radius: 14px;
                    background: rgba(181, 148, 87, 1);
                    .flex;
                    .flex(o);
                }

                &.kith,
                &.add {
                    .w(60px);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    justify-content: center;
                }

                &.add {
                    .fz(24px);
                }

                &.ps {
                    .w(120px);
                    position: sticky;
                    left: 0;
                    .z(2);

                    .u-compare-title {
                        .fz(20px);
                        color: #fff;
                        mask-image: linear-gradient(180deg, rgba(255, 255, 255, 1) 43.06%, rgba(255, 255, 255, 0) 100%);
                    }
                }

                i {
                    cursor: pointer;
                }
            }
        }

        .u-zl_cell {
            .h(calc(100% - 50px));
            .flex;
            .w(100%);
        }

        .u-zl-list {
            .size(60px, 100%);
            flex-shrink: 0;

            &.ps {
                .w(120px);
                position: sticky;
                left: 0;

                .z(2);

                .u-zl-list_item {
                    .pl(12px);
                    align-items: center;
                }
            }

            &.add {}

            .u-zl-list_item {
                color: #ffeccc;
                .w(100%);
                min-height: 36px;
                .flex;

                &:nth-child(odd) {
                    background: #ebe5df;
                }

                &:nth-child(even) {
                    background: #fff;
                }

                &.kith {
                    .flex(o);
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

            .u-name {
                color: #846b4b;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 140px;
            }
        }
    }
}
</style>
