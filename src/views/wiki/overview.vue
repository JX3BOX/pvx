<template>
    <div class="p-achievement-overview" :class="{ is_mobile: mobile }" v-if="currentRole">
        <div class="m-overview-header" v-if="!mobile">
            <!-- 资历、选中用户信息 -->
            <div class="m-header-info">
                <!-- 用户信息展示 -->
                <div :style="{
                    opacity: currentRole ? 1 : 0.5,
                }" class="m-info-user">
                    <span class="u-name">{{ currentRole?.name }}
                        {{ currentRole?.server && "·" }}
                        {{ currentRole?.server }}</span>
                    <img width="30" height="30" :src="showSchoolIcon(currentRole?.mount)" alt="jx3logo" />
                    <el-dropdown trigger="click">
                        <div class="u-toggle-btn">
                            <div>
                                <span>切换角色</span>
                                <img src="@/assets/img/wiki/overview/toggle-user-icon.svg" alt="" />
                            </div>
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

                    <div v-if="viewAchievementsName" class="u-overview" @click="onSeeOverview">
                        <el-icon>
                            <Back />
                        </el-icon>
                        {{ showList ? "返回" : "返回总览" }}
                    </div>
                </div>

                <!-- 资历展示 -->
                <div class="m-info-zl">
                    <div class="m-info-zl__info">
                        <div>
                            <span class="u-title">{{ viewAchievementsName || "总" }}资历：</span>
                            <img width="32" height="32" src="@/assets/img/wiki/overview/zl-logo.svg" alt="资历logo" />
                            <span class="u-number">{{ ownPointsCount }}</span>
                        </div>
                        <div class="u-rate">{{ totalProgress }}%</div>
                    </div>
                    <div class="m-info-zl__progress">
                        <div class="u-active-progress" :style="{
                            width: `${totalProgress}%`,
                            background: getCurrentProgressBg(totalProgress),
                        }"></div>
                    </div>
                </div>
            </div>
            <div class="m-info-avatar" v-if="viewAchievementsName && !showList">
                <img class="u-achievement-icon" height="70"
                    :src="require(`@/assets/img/wiki/overview/title/${viewAchievementsName}.png`)" alt="" />
            </div>
            <!-- 头像 -->
            <div v-else class="m-info-avatar">
                <!-- TODO：头像边框 与 头像-->
                <img v-if="avatar_frame" class="u-avatar-border" :src="avatar_frame" alt="头像边框" />

                <RoleAvatar class="u-avatar-img" :mount="currentRole.mount" :body_type="currentRole.body_type" />
            </div>
        </div>
        <!-- 移动端角色信息 -->
        <div class="m-overview-header_mobile" v-if="mobile">
            <div class="u-name">
                {{ currentRole.name }}
                {{ currentRole.server && "·" }}
                {{ currentRole.server }}
                <img width="30" height="30" :src="showSchoolIcon(currentRole.mount)" alt="jx3logo" />
            </div>

            <el-dropdown trigger="click">
                <div class="u-toggle-btn">
                    <span>角色</span>
                    <img src="@/assets/img/wiki/overview/toggle-user-icon.svg" alt="" width="16px" height="16px" />
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <!-- <el-dropdown-item v-if="isLogin">
                        <div class="m-role-item" @click="onChangeRole(virtualRole)">
                            <span>{{ virtualRole.name }}</span>
                            <span>&lt;虚拟角色&gt;</span>
                        </div>
                    </el-dropdown-item> -->
                        <el-dropdown-item v-for="role in roleList" :key="role.ID">
                            <div @click="onChangeRole(role)" class="m-role-item" :class="{
                                active: role.jx3id === currentRole.jx3id,
                            }">
                                <span>{{ role.name }}·</span>
                                <span>{{ role.server }}</span>
                            </div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        <!-- 移动端查看总览位置 -->
        <div ref="overviewList" class="m-overview-main" :class="{ is_mobile: mobile, isScroll }"
            @scroll="overviewListScroll" v-if="!showList">
            <!-- 移动端资历总览 -->
            <div class="m-info-zl" v-if="mobile">
                <div class="m-info-zl__info" v-if="!isScroll">
                    <span class="u-title">{{ viewAchievementsName || "总" }}资历：<span class="u-number">{{
                        ownPointsCount
                    }}</span></span>

                    <span class="u-rate">{{ totalProgress }}%</span>
                </div>
                <div class="m-info-zl__progress">
                    <div class="u-active-progress" :style="{
                        width: `${totalProgress}%`,
                        background: getCurrentProgressBg(totalProgress),
                    }"></div>
                </div>
            </div>
            <!-- item -->
            <div class="m-cj-item" @click="onEnterCategory(item)" v-for="(item, i) in list" :key="i">
                <!-- 做边框 -->
                <img class="u-border" src="@/assets/img/wiki/overview/item-left-border.svg" alt="" />
                <div class="m-cj-wrapper">
                    <div class="m-cj-content">
                        <div class="u-cj-info">
                            <div class="u-name">{{ item.name }}</div>
                            <div class="u-rate">{{ getCurrentProgress(item.ownPoints, item.allPoints) }}%</div>
                        </div>
                        <div class="m-count-box">
                            <div class="m-count-inner">
                                <div class="u-item">
                                    <img width="14" height="14" src="@/assets/img/wiki/overview/cj-logo.svg"
                                        alt="成就logo" />
                                    <span>{{ item.ownAchievements.length }}/{{ item.allAchievements.length }}</span>
                                </div>
                                <div class="u-item">
                                    <img width="14" height="14" src="@/assets/img/wiki/overview/zl-logo.svg"
                                        alt="资历logo" />
                                    <span>{{ item.ownPoints }}/{{ item.allPoints }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 分类logo -->
                    <div class="u-logo" v-if="item.children">
                        <img height="70" :src="require(`@/assets/img/wiki/overview/item/${item.name}.png`)" alt="" />
                    </div>
                    <!-- 进度展示 -->
                    <div class="u-progress" :style="{
                        width: `${getCurrentProgress(item.ownPoints, item.allPoints)}%`,
                        background: getCurrentProgressBg(item.ownPoints, item.allPoints),
                    }"></div>
                </div>
            </div>
        </div>
        <!-- 最下级list -->
        <div class="m-cj-list" v-else>
            <el-table :data="achievements_list || []" style="width: 100%" stripe height="100%"
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
                <el-table-column label="成就简介" :width="mobile ? '200' : ''">
                    <template #default="scope"> {{ scope.row.ShortDesc || "-" }} </template>
                </el-table-column>
                <el-table-column label="资历点数" :width="mobile ? '80' : '100'">
                    <template #default="scope"> {{ scope.row.Point || 0 }} </template>
                </el-table-column>
                <el-table-column label="完成情况" :width="mobile ? '80' : '100'">
                    <template #default="scope">
                        <el-tag :type="scope.row.isCompleted == false ? 'danger' : 'success'">{{
                            scope.row.isCompleted == false ? "未完成" : "已完成"
                        }}</el-tag></template>
                </el-table-column>
                <el-table-column label="奖励" width="100">
                    <template #default="scope">
                        <el-tooltip placement="top" v-if="scope.row.ItemID">
                            <template #content>
                                <jx3-item :item_id="scope.row.ItemType + '_' + scope.row.ItemID.toString()" />
                            </template>
                            <img class="u-icon" :src="getIconRewards(scope.row)" />
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="m-zl-info_bottom" v-if="isScroll">
            <div class="m-box_bottom">
                <span class="u-title">{{ viewAchievementsName || "总" }}资历： <span
                        class="u-number">{{ ownPointsCount }}</span></span>

                <span class="u-rate">{{ totalProgress }}%</span>
            </div>
            <div class="m-info-zl__progress">
                <div class="u-active-progress" :style="{
                    width: `${totalProgress}%`,
                    background: getCurrentProgressBg(totalProgress),
                }"></div>
            </div>
        </div>
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { showSchoolIcon, iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import {
    getAchievementPoints,
    getVirtualRoleAchievements,
    getRoleGameAchievements,
    getMenus,
    getMenuAchievements,
} from "@/service/achievement";
import { getUserRoles } from "@/service/team";
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
import { getMyInfo } from "@/service/user";
import { __imgPath } from "@/utils/config";
import Item from "@jx3box/jx3box-editor/src/Item";
import { cloneDeep } from "lodash";
export default {
    name: "wiki-achievement-overview",
    props: [],
    // "jx3-item": Item
    components: { RoleAvatar, "jx3-item": Item },
    data: function () {
        return {
            userInfo: null,
            achievementData: {},
            pointsData: {},
            list: [],
            roleList: [],
            currentRole: null,
            isLogin: User.isLogin(),
            virtualRole: {
                ...User.getInfo(),
                jx3id: 0,
                ID: ~~User.getInfo().uid,
            },
            isScroll: false, //移动端滚动后总览数据移至底部
            showList: false,
            achievements_list: [],
            loading: false,
            list_bak: [],
            name_bak: "",
        };
    },
    computed: {
        mobile() {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = ["android", "iphone", "ipad", "ipod", "windows phone", "miniprogram"];
            return mobileKeywords.some((keyword) => userAgent.includes(keyword));
        },
        avatar_frame() {
            if (this.userInfo) {
                const { user_avatar_frame } = this.userInfo;
                if (user_avatar_frame) {
                    return __imgPath + `avatar/images/${user_avatar_frame}/${user_avatar_frame}.svg`;
                }
            }
            return null;
        },
        viewAchievementsName() {
            return this.$store.state.viewAchievementsName;
        },

        // 总进度
        totalProgress() {
            if (!this.ownPointsCount && !this.allPointsCount) return 0;
            return ((this.ownPointsCount / this.allPointsCount) * 100).toFixed(2);
        },
        // 总资历点数
        allPointsCount() {
            let count = 0;
            this.list.forEach((item) => {
                count += item.allPoints || 0;
            });
            return count;
        },
        // 我拥有的所有资历点数
        ownPointsCount() {
            if (!this.viewAchievementsName) {
                let total = 0,
                    my_achievements = this.$store.state.achievements;
                my_achievements.forEach((item) => {
                    const itemId = String(item);
                    const numId = Number(item);
                    total = total + (this.pointsData[itemId] || this.pointsData[numId] || 0);
                });
                return total;
            }
            let count = 0;
            this.list.forEach((item) => {
                count += item.ownPoints || 0;
            });
            return count;
        },
    },
    watch: {
        achievementData() {
            this.getRenderList();
        },
        pointsData: {
            handler(val) {
                if (val && Object.keys(val).length) {
                    this.getRenderList();
                }
            },
        },
        "$store.state.achievements": {
            handler(val) {
                if (val && val.length) {
                    this.getRenderList();
                }
            },
        },
        currentRole: {
            deep: true,
            immediate: true,
            handler(val) {
                if (!val) return;
                localStorage.setItem("wiki_last_sync", val.jx3id || 0);
                this.$store.commit("SET_STATE", { key: "role", value: val });
                const { jx3id } = val;
                console.log(jx3id);
                if (jx3id) {
                    this.$store.commit("SET_STATE", { key: "achievementsVirtual", value: [] });
                    this.loadRoleAchievements(jx3id);
                }
                this.getRenderList();
            },
        },
    },

    mounted() {
        this.getUserInfo();
    },
    methods: {
        iconLink,
        getLink,
        //成就奖励图标
        getIconRewards(row) {
            let key = `item-${this.$store.state.client}-${row.ItemType}_${row.ItemID}`;
            try {
                let item = JSON.parse(sessionStorage.getItem(key));
                return item?.IconID ? this.iconLink(item.IconID) : "";
            } catch (error) { }
        },
        overviewListScroll($event) {
            if (!this.mobile) return;
            if (this.$refs.overviewList.scrollTop > 70) {
                this.isScroll = true;
            } else {
                this.isScroll = false;
            }
        },
        getUserInfo() {
            if (!User.isLogin()) {
                this.$confirm("请先登录").then((_) => {
                    User.toLogin(window.location.href);
                });

                return;
            }
            getMyInfo().then((res) => {
                this.userInfo = res;
                this.loadData();
            });
        },
        onChangeRole(role) {
            this.currentRole = role;
            this.$nextTick(() => {
                this.$refs.overviewList.scrollTop = 0;
            });
        },
        showSchoolIcon,
        onEnterCategory(data) {
            this.name_bak = cloneDeep(this.viewAchievementsName);
            this.list_bak = cloneDeep(this.list);
            this.$store.commit("SET_STATE", { key: "viewAchievementsName", value: data.name });

            if (data.children) {
                this.getRenderList(data.children);
                this.$nextTick(() => {
                    this.$refs.overviewList.scrollTop = 0;
                });
            } else {
                this.list = [data];
                this.showList = true;
                this.getMenuAchievements(data);
            }
        },
        // 获取成就列表
        getMenuAchievements(menu) {
            this.loading = true;
            getMenuAchievements(menu.sub, menu.detail)
                .then((data) => {
                    let list = data.data.data.achievements || [];
                    let arr = [];
                    list.forEach((item) => {
                        item.isCompleted = menu.ownAchievements.includes(item.ID);
                        arr.push(item);
                        if (item.SeriesAchievementList) {
                            item.SeriesAchievementList.forEach((sub, index) => {
                                if (index > 0) {
                                    sub.isCompleted = menu.ownAchievements.includes(sub.ID);
                                    arr.push(sub);
                                }
                            });
                        }
                    });
                    this.achievements_list = arr;
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        onSeeOverview() {
            if (this.showList) {
                this.list = cloneDeep(this.list_bak);
                this.$store.commit("SET_STATE", { key: "viewAchievementsName", value: this.name_bak });
                this.showList = false;
                this.achievements_list = [];
                return;
            }
            this.showList = false;
            this.achievements_list = [];

            this.$store.commit("SET_STATE", { key: "viewAchievementsName", value: null });
            this.getRenderList();
            this.$nextTick(() => {
                this.$refs.overviewList.scrollTop = 0;
            });
        },
        loadData() {
            this.getList();

        },
        getRenderList(data) {
            data = data ? data : this.achievementData;
            const list = Object.keys(data).map((key) => {
                const item = data[key];
                const allData = this.getAllachievementsData(item);
                return {
                    sub: item.sub,
                    detail: item.detail,
                    name: item.name,
                    allAchievements: allData.allAchievements,
                    ownAchievements: allData.ownAchievements,
                    children: item.children,
                    allPoints: allData.allPoints,
                    ownPoints: allData.ownPoints,
                };
            });
            this.list = list;
        },
        getCurrentProgress(own, all) {
            return ((own / all) * 100).toFixed(2);
        },
        getCurrentProgressBg(own, all) {
            let n = 0;
            if (!all) {
                n = own;
            } else {
                n = ((own / all) * 100).toFixed(2);
            }
            if (n > 66) {
                return `linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(204, 184, 155, 1) 100%)`;
            } else if (n > 33) {
                return `linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(191, 191, 191, 1) 100%)`;
            } else {
                return `linear-gradient(90deg, rgba(247, 247, 247, 1) 0%, rgba(204, 177, 175, 1) 100%)`;
            }
        },
        // 回调获取所有成就
        getAllachievementsData(
            data,
            allAchievements = [],
            ownAchievements = [],
            countData = { allPoints: 0, ownPoints: 0 }
        ) {
            // 我完成的成就
            const ownAllAchievements = this.$store.state.achievements;
            // console.log("成就循环", data);
            data.achievements.forEach((aItem) => {
                // 判断aItem是否是数组
                if (Array.isArray(aItem)) {
                    aItem.forEach((item) => {
                        if (this.pointsData[item]) {
                            countData.allPoints += this.pointsData[item];
                            allAchievements.push(item);
                            if (ownAllAchievements.includes(String(item))) {
                                countData.ownPoints += this.pointsData[item];
                                ownAchievements.push(item);
                            }
                        }
                    });
                } else {
                    if (this.pointsData[aItem]) {
                        countData.allPoints += this.pointsData[aItem];
                        allAchievements.push(aItem);
                        if (ownAllAchievements.includes(String(aItem))) {
                            countData.ownPoints += this.pointsData[aItem];
                            ownAchievements.push(aItem);
                        }
                    }
                }
            });

            if (data.children) {
                data.children.forEach((item) => {
                    this.getAllachievementsData(item, allAchievements, ownAchievements, countData);
                });
            }

            // 去重
            return {
                allAchievements: allAchievements,
                allPoints: countData.allPoints,
                ownAchievements: ownAchievements,
                ownPoints: countData.ownPoints,
            };
        },
        // 获取成就列表
        getList() {
            return getMenus({
                general: 1,
                client: this.$store.state.client,
            }).then((res) => {
                const data = res.data.data.menus;
                this.achievementData = data;
                this.getPoints();
            });
        },
        // 获取成就对应点数
        getPoints() {
            return getAchievementPoints().then((res) => {
                const data = res.data.data.points;
                this.pointsData = data;
                this.loadUserRoles(); // 获取用户角色列表
            });
        },
        // 获取用户角色列表
        loadUserRoles() {
            this.isLogin &&
                getUserRoles().then((res) => {
                    this.roleList = res.data?.data?.list || [];
                    const wiki_last_sync_jx3id = localStorage.getItem("wiki_last_sync");

                    if (wiki_last_sync_jx3id && wiki_last_sync_jx3id !== "0") {
                        this.currentRole = this.roleList.find((item) => item.jx3id == wiki_last_sync_jx3id) || null;
                    } else {
                        if (this.roleList.length) {
                            this.currentRole = this.roleList[0];
                            this.$store.commit("SET_STATE", { key: "role", value: this.currentRole });
                        } else {
                            this.currentRole = this.virtualRole;
                            this.$store.commit("SET_STATE", { key: "role", value: this.virtualRole });
                            // this.loadVirtualAchievements();
                        }
                    }
                });
        },
        // 获取角色成就状态
        loadRoleAchievements(jx3id) {
            getRoleGameAchievements(jx3id).then((res) => {
                const achievements = res.data?.data?.achievements || "";
                const jx3id = res.data?.data?.jx3id;
                this.isSync = !!jx3id; // 是否在游戏中同步
                const list = achievements.split(",");
                this.$store.commit("SET_STATE", { key: "achievements", value: list, isSession: true });
            });
        },
        // 获取虚拟角色成就列表
        loadVirtualAchievements() {
            if (!this.currentRole || this.currentRole.jx3id) return;
            getVirtualRoleAchievements().then((res) => {
                const achievements = res.data?.data?.achievements || "";
                const list = achievements.split(",");
                this.$store.commit("SET_STATE", { key: "achievementsVirtual", value: list });
            });
        },
    },
};
</script>

<style lang="less">
.p-achievement-overview {
    // .pa;
    // bottom: 10px;
    .pt(86px);
    width: 960px;

    &.is_mobile {
        width: calc(100vw - 137px);
        height: 100%;
        .pt(0);

        .m-cj-list {
            height: calc(100% - 40px) !important;
            .pt(40px);

            .u-achievement-name {
                flex-direction: column;

                img {
                    padding-right: 0 !important;
                }
            }
        }
    }

    .m-overview-header {
        .mb(18px);
        .flex;
        justify-content: space-between;
        gap: 48px;

        .m-header-info {
            flex: 1;
            .pt(42px);

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
                    align-items: center;
                    justify-content: center;
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

            .m-info-zl {
                background: rgba(247, 247, 247, 1);
                padding: 12px 8px;

                .m-info-zl__info {
                    .mb(8px);
                    .flex;
                    width: 100%;
                    justify-content: space-between;
                    align-items: center;

                    >div {
                        .flex;
                        align-items: center;
                    }

                    .u-title,
                    .u-number {
                        .fz(32px, 47px);
                        .bold;
                    }

                    .u-number {
                        .ml(8px);
                        color: rgba(201, 146, 50, 1);
                    }

                    .u-rate {
                        .fz(24px, 35px);
                        .bold;
                        color: rgba(148, 126, 93, 1);
                    }
                }

                .m-info-zl__progress {
                    position: relative;
                    .size(100%, 12px);
                    background: white;

                    .u-active-progress {
                        position: absolute;
                        transition: 0.5s;
                        left: 0;
                        top: 0;
                        height: 100%;
                    }
                }
            }
        }

        .m-info-avatar {
            max-width: 205px;
            width: 205px;
            height: 200px;
            position: relative;

            .u-avatar-border {
                width: 100%;
                height: 100%;
                position: absolute;
                left: 0;
                top: 0;
                z-index: 2;
            }

            .u-achievement-icon {
                position: absolute;
                z-index: 1;
                width: 200px;
                height: 200px;
                border-radius: 100%;
                overflow: hidden;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }

            .u-avatar-img {
                position: absolute;
                z-index: 1;
                width: 175px;
                height: 175px;
                border-radius: 100%;
                overflow: hidden;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }

    //手机端用户信息
    .m-overview-header_mobile {
        position: fixed;
        .z(21);
        width: 100vw;
        .lt(0);
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
    }

    //移动端查看总览
    .u-overview_mobile {
        position: fixed;
        left: 12px;
        bottom: 12px;
        .fz(24px);
        .bold(900);
        color: #fff;
        text-decoration: underline;
        z-index: 9;

        &.isScroll {
            bottom: 92px;
        }
    }

    .m-overview-main {
        .grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(6, 1fr);
        height: 540px;
        overflow-y: auto;
        row-gap: 15px;
        column-gap: 12px;
        padding-right: 10px;

        /* 针对Webkit内核的浏览器 */
        &::-webkit-scrollbar {
            /* 设置滚动条的宽度 */
            width: 10px;
        }

        /* 滚动条轨道 - 背景颜色/白底 */
        &::-webkit-scrollbar-track {
            background: #595958;
            border-radius: 10px;
        }

        /* 滚动条的滑块部分 */
        &::-webkit-scrollbar-thumb {
            background: #e2d3b9;
            border-radius: 10px;
        }

        /* 当鼠标悬停在滚动条滑块上时改变颜色 */
        &::-webkit-scrollbar-thumb:hover {
            background: #e2d3b9;
        }

        .m-cj-item {
            .flex;
            .h(70px);
            cursor: pointer;

            .u-border {
                width: 4px;
                height: 100%;
            }

            .m-cj-wrapper {
                position: relative;
                flex: 1;
                background: #ebe5df;

                .m-cj-content {
                    .size(100%, 70px);
                    position: relative;
                    box-sizing: border-box;
                    padding: 10px 8px;
                    z-index: 3;

                    .u-cj-info {
                        .flex;
                        justify-content: space-between;
                        .mb(8px);

                        .u-name {
                            .fz(16px, 24px);
                            .bold;
                            color: rgba(61, 61, 61, 1);
                        }

                        .u-rate {
                            .fz(16px, 24px);
                            .bold;
                            color: rgba(112, 83, 45, 1);
                        }
                    }

                    .m-count-box {
                        .r(2px);
                        .dbi;
                        .fz(12px, 18px);
                        box-sizing: border-box;
                        padding: 0 4px;
                        color: rgba(161, 161, 161, 1);
                        background: rgba(255, 255, 255, 0.5);

                        .m-count-inner {
                            .flex;
                            gap: 12px;

                            .u-item {
                                height: 18px;
                                .flex;
                                align-items: center;

                                img {
                                    .mr(4px);
                                }
                            }
                        }
                    }
                }

                .u-progress {
                    transition: 0.5s;
                    position: absolute;
                    box-sizing: border-box;
                    border: 2px solid #f7f7f7;
                    border-left: 0;
                    z-index: 1;
                    left: 0;
                    top: 0;
                    height: 100%;
                }

                .u-logo {
                    position: absolute;
                    right: 12px;
                    top: 0;
                    z-index: 2;

                    img {
                        .h(70px);
                    }
                }
            }
        }

        //列表手机端
        &.is_mobile {
            .mt(40px);
            height: calc(100vh - 60px);
            .db;
            .pr(0);
            .pb(100px);

            &::-webkit-scrollbar {
                /* 设置滚动条的宽度 */
                width: 0;
            }

            .m-info-zl {
                .mt(20px);
                .mb(20px);
                .h(80px);
                padding: 12px 12px 12px 12px;
                box-sizing: border-box;
                background: rgba(247, 247, 247, 1);

                .u-title,
                .u-number,
                .u-rate {
                    .fz(20px, 28px);
                    .bold(700);
                }

                .m-info-zl__info {
                    .flex;
                    justify-content: space-between;
                }

                .u-title {
                    color: rgba(65, 65, 64, 1);
                }

                .u-number {
                    color: rgba(181, 148, 87, 1);
                }

                .u-rate {
                    color: rgba(148, 126, 93, 1);
                }

                .m-info-zl__progress {
                    .mt(8px);
                    position: relative;
                    .size(100%, 12px);
                    background: white;

                    .u-active-progress {
                        position: absolute;
                        transition: 0.5s;
                        left: 0;
                        top: 0;
                        height: 100%;
                    }
                }
            }

            .m-cj-item {
                .mb(12px);
            }
        }

        &.isScroll {
            height: calc(100vh - 140px);
        }
    }

    .m-cj-list,
    .el-table__body-wrapper {
        height: 560px;
        overflow-y: auto;

        /* 针对Webkit内核的浏览器 */
        &::-webkit-scrollbar {
            /* 设置滚动条的宽度 */
            width: 10px;
        }

        /* 滚动条轨道 - 背景颜色/白底 */
        &::-webkit-scrollbar-track {
            background: #595958;
            border-radius: 10px;
        }

        /* 滚动条的滑块部分 */
        &::-webkit-scrollbar-thumb {
            background: #e2d3b9;
            border-radius: 10px;
        }

        /* 当鼠标悬停在滚动条滑块上时改变颜色 */
        &::-webkit-scrollbar-thumb:hover {
            background: #e2d3b9;
        }

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
            // .x;
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
            // .x;
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

        .u-table-header_row {
            .gutter {
                display: none !important;
            }
        }

        .u-achievement-name {
            .flex;
            align-items: center;

            img {
                padding-right: 4px;
            }

            span {
                color: #70532d;
            }
        }
    }
}

.m-role-dropdown {
    ::v-deep {
        .el-dropdown-menu__item {
            padding: 0;
        }

        .popper__arrow {
            display: none;
        }
    }

    .m-role-item {
        .flex;
        justify-content: space-between;
        gap: 20px;
        min-width: 180px;
        padding: 0 12px;

        &:hover {
            background: linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(204, 184, 155, 1) 100%);
            color: #947e5d;
        }

        &.active {
            color: #947e5d;
            background: linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(204, 184, 155, 1) 100%);
        }
    }
}

//底部总览信息
.m-zl-info_bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    .size(100%, 80px);
    padding: 12px 12px 12px 12px;
    box-sizing: border-box;
    background: rgba(247, 247, 247, 1);
    z-index: 9;

    .m-box_bottom {
        .flex;
        justify-content: space-between;
    }

    .u-title,
    .u-number,
    .u-rate {
        .fz(20px, 28px);
        .bold(700);
    }

    .u-title {
        color: rgba(65, 65, 64, 1);
    }

    .u-number {
        color: rgba(181, 148, 87, 1);
    }

    .u-rate {
        color: rgba(148, 126, 93, 1);
    }

    .m-info-zl__progress {
        .mt(8px);
        position: relative;
        .size(100%, 12px);
        background: white;

        .u-active-progress {
            position: absolute;
            transition: 0.5s;
            left: 0;
            top: 0;
            height: 100%;
        }
    }
}

.v-miniprogram {

    // 资历宝典
    .m-achievement-content {
        width: 100%;
        min-width: 100%;
        margin-left: 0;
        padding: 0 10px;
        box-sizing: border-box;
    }

    .m-achievement-main {
        margin-top: 0;
        height: 100%;
        flex-direction: column;
        gap: 0;
    }

    .p-achievement-overview {
        padding-top: 0;
        width: 100%;

        .m-overview-main {
            grid-template-columns: repeat(1, 1fr);
            grid-template-rows: repeat(1, 1fr);
        }
    }

    .p-achievement-overview .m-overview-header .m-header-info {
        flex: none;
        width: calc(100% - 20px);
        margin: 0 10px;
    }

    .m-achievement-sidebar .m-sidebar-nav li ul {
        margin-left: 0;
    }
}

// @import "../../assets/css/miniprogram.less";</style>
