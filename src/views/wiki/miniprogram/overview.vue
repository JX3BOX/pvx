<template>
    <div class="mini-program-overview" v-if="currentRole">
        <!-- 用户信息区域 -->
        <div class="user-info-section">
            <div class="avatar-container">
                <div class="avatar-bg">
                    <img v-if="avatar_frame" class="u-avatar-border" :src="avatar_frame" alt="头像边框" />
                    <RoleAvatar class="u-avatar-img" :mount="currentRole.mount" :body_type="currentRole.body_type" />
                </div>
                <!-- <div class="avatar">1</div> -->
            </div>
            <div class="user-name" @click="openRoleDrawer">{{ currentRole.name }}</div>
            <div class="user-detail">
                <img width="30" height="30" :src="mpAvatar" class="hb-icon" />
                <span>
                    {{ xfName }}
                </span>
                <span>
                    {{ currentRole.server }}
                </span>
            </div>
        </div>

        <!-- 总进度条 -->
        <div class="total-progress">
            <div class="progress-info">
                <span class="progress-percentage">{{ totalProgress }}<span>%</span></span>
                <span class="progress-value">
                    <!-- 总点数万字位以上 -->
                    {{ ownPointsCountW }}<span>{{ ownPointsCountOther }}</span></span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: totalProgress + '%' }"></div>
            </div>
        </div>
        <!-- 亲友对比/渡劫方案 -->
        <div class="friend-comparison">
            <div class="section-title">
                <div class="title-content" @click="handleClickBtn('friendComparison')">
                    <img :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/comparison.svg`)"
                        class="u-icon-left" />
                    亲友对比
                </div>
                <img :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/right.svg`)"
                    class="u-icon-right" />
            </div>
            <div class="section-title disabled">
                <div class="title-content">
                    <img :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/improvement.svg`)"
                        class="u-icon-left" />
                    渡劫方案
                </div>
                <img :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/right.svg`)"
                    class="u-icon-right" />
            </div>
        </div>
        <!-- 进度概览 -->
        <div class="progress-overview">
            <div class="section-header">
                <div class="section-title">进度概览</div>
            </div>

            <!-- 分类进度卡片 -->
            <div class="category-progress">
                <div class="progress-card" v-for="(category, index) in list" :key="index"
                    @click="handleClick(category)">
                    <!-- 详细模式top -->
                    <div class="u-top-detailed">
                        <div class="u-name">{{ category.name }}</div>
                        <div class="progress-bar-small">
                            <div class="progress-fill"
                                :style="{ width: getCurrentProgress(category.ownPoints, category.allPoints) + '%' }">
                            </div>
                        </div>
                        <div class="progress-percentage-small">
                            {{ getCurrentProgress(category.ownPoints, category.allPoints) }}%
                        </div>
                        <div class="u-info">
                            <div class="u-num">
                                <img width="14" height="14" :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/count.svg`)
                                    " alt="成就logo" />
                                {{ category.ownAchievements.length }}/{{ category.allAchievements.length }}
                            </div>
                            <div class="u-num">
                                <img width="14" height="14"
                                    :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/sum.svg`)"
                                    alt="资历logo" />
                                {{ category.ownPoints }}/{{ category.allPoints }}
                            </div>
                        </div>
                    </div>

                    <div class="u-icon">
                        <img :src="getIconPath(category.sub)" alt="" class="hb-icon" svg-inline />
                    </div>
                </div>
            </div>
        </div>
        <!-- 角色列表 -->
        <RoleListVue v-model:visible="drawerVisible" :roles="roleList" :currentRole="currentRole"
            @confirmSelection="handleConfirmSelection">
        </RoleListVue>
    </div>
</template>
<script>
/**
 * 小程序概览组件
 * 展示用户信息、总进度和分类进度概览
 */
import User from "@jx3box/jx3box-common/js/user";
import { showSchoolIcon, iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import schoolid from "@jx3box/jx3box-data/data/xf/schoolid.json";

import { getMyInfo } from "@/service/user";
import { __imgPath, __cdn } from "@/utils/config";
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
import RoleListVue from "@/views/wiki/miniprogram/components/roleList.vue";
import { mobileOpen } from "@/utils/minprogram";
import {
    getUserRolesList,
    getRoleGameAchievementsList,
    getMenuAndPoints,
    getAchievementsFinishStatus,
} from "@/utils/wiki_miniprogram";
export default {
    name: "OverviewMiniProgram",
    components: {
        RoleAvatar,
        RoleListVue,
    },
    // 数据定义
    data() {
        return {
            // 用户信息
            userInfo: {},
            //角色列表
            roleList: [],
            currentRole: {},
            drawerVisible: false,
            //分类数据
            menuList: [],
            //成就点数
            pointsData: {},
            //整合列表
            list: [],
            allPointsCount: 0,
            ownPointsCount: 0,
            // 我拥有的所有资历点数万字位以上
            ownPointsCountW: null,
            // 我拥有的所有资历点数其他位
            ownPointsCountOther: 0,
        };
    },
    computed: {
        isDark() {
            // // 使用 window.matchMedia 检查系统是否启用了暗色模式
            const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
            return mediaQueryList.matches;
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
        // 总进度
        totalProgress() {
            if (!this.ownPointsCount && !this.allPointsCount) return 0;
            return ((this.ownPointsCount / this.allPointsCount) * 100).toFixed(2);
        },
        xfName() {
            if (this.currentRole.mount) {
                return schoolid[this.currentRole.mount] || "";
            }
            return "";
        },
        mpAvatar() {
            if (this.currentRole.mount) {
                return __cdn + `design/vector/school/${this.currentRole.mount}.svg`;
            }
            return null;
        },
    },
    watch: {
        currentRole: {
            deep: true,
            handler(val) {
                if (!val) return;
                const { jx3id } = val;
                if (jx3id) {
                    this.loadRoleAchievements(jx3id);
                }
            },
        },
    },
    created() {
        this.getUserInfo();
    },
    methods: {
        showSchoolIcon,
        /**
         * 处理按钮点击
         * @param {string} btn - 按钮名称
         */
        handleClickBtn(btn) {
            if (btn === "friendComparison") {
                mobileOpen(
                    this.$router.resolve({
                        name: "compare",
                        query: { jx3id: this.currentRole.jx3id },
                    }).href
                );
            }
        },
        /**
         * 处理分类点击
         * @param {object} menu - 分类项
         */
        handleClick(menu) {
            // 小程序打开界面
            mobileOpen(
                this.$router.resolve({
                    name: "catalogue",
                    query: { menuId: menu.sub, jx3id: this.currentRole.jx3id },
                }).href
            );
        },
        /**
         * 获取图标路径
         * @param {string} sub - 分类子项
         * @returns {string} - 图标路径
         */
        getIconPath(sub) {
            return require(`@/assets/img/wiki_miniprogram/${this.isDark ? "Dark" : "Light"}/tog_${sub}.svg`);
        },

        getCurrentProgress(own, all) {
            return ((own / all) * 100).toFixed(2);
        },
        getUserInfo() {
            if (!User.isLogin()) {
                this.$confirm("请先登录再使用");
                return;
            }
            getMyInfo().then((res) => {
                this.userInfo = res;
                this.init();
            });
        },
        /**
         * 初始化数据
         */
        async init() {
            //初始化菜单及成就点列表
            let menuAndPoints = await getMenuAndPoints(this.$store.state.client);
            this.menuList = menuAndPoints.menuList || [];
            this.pointsData = menuAndPoints.pointsList || [];
            //初始化用户角色列表
            this.roleList = await getUserRolesList();
            if (this.roleList.length) {
                this.currentRole = this.roleList[0];
            }
        },
        /**
         * 加载角色成就列表
         * @param {string} jx3id - 角色JX3ID
         */
        async loadRoleAchievements(jx3id) {
            let achievements = await getRoleGameAchievementsList(jx3id);
            this.isSync = achievements.isSync;
            this.currentRole.achievements = achievements.list || [];
            this.getRenderList();
        },
        /**************************角色相关*****************************/
        /**
         * 打开角色选择抽屉
         */
        openRoleDrawer() {
            this.drawerVisible = true;
        },
        /**
         * 处理角色选择确认
         * @param {Object} role - 选中的角色
         */
        handleConfirmSelection(role) {
            this.currentRole = role;
            this.drawerVisible = false;
        },
        /*****************************获取成就列表********************************/

        getRenderList() {
            let menuList = this.menuList || [];
            const my_achievements = this.currentRole.achievements || [];
            const list = Object.keys(menuList).map((key) => {
                const item = menuList[key];
                const allData = getAchievementsFinishStatus(item, my_achievements);
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
            this.allPointsCount = list.reduce((acc, item) => acc + item.allPoints, 0);
            this.ownPointsCount = my_achievements.reduce((acc, item) => acc + (this.pointsData[item] || 0), 0);
            // 如果我的成就点数长度大于4，则截取后4位写在ownPointsCountOther，其余写在ownPointsCountW
            const pointsStr = this.ownPointsCount.toString();
            if (pointsStr.length > 4) {
                this.ownPointsCountW = pointsStr.slice(0, -4);
                this.ownPointsCountOther = pointsStr.slice(-4);
            } else {
                this.ownPointsCountW = "";
                this.ownPointsCountOther = pointsStr;
            }
        },
    },
};
</script>
<style lang="less">
.c-mode-list-drawer {
    overflow: auto;

    .el-drawer {
        border-radius: 20px 20px 0 0;
        background: #24292e;
    }

    .el-drawer__header {
        margin-bottom: 0;
    }

    .mode-list-container {
        padding: 20px 20px 0 20px;

        .mode-item {
            padding: 16px;
            margin-bottom: 16px;
            border: 2px solid #30363d;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            justify-content: space-between;
            align-items: center;

            &:last-child {
                margin-bottom: 2px;
            }

            .mode-name {
                font-size: 16px;
                font-weight: 700;
                line-height: 24px;
                color: rgba(255, 255, 255, 0.8);
            }

            .mode-detail {
                font-size: 12px;
                line-height: 18px;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.8);
            }

            &.selected {
                border-color: #fedaa3;
                background-color: rgba(255, 255, 255, 0.05);

                .mode-name,
                .mode-detail {
                    color: #fedaa3;
                }
            }
        }
    }

    .mode-button-group {
        padding: 16px 20px;
        display: flex;
        justify-content: flex-end;
        gap: 20px;
        border-top: 1px solid #30363d;

        .el-button {
            margin-left: 0;
            border-radius: 12px;
        }

        .u-submit {
            flex: 1;
            background: #fedaa3;
        }
    }
}

/**
 * 小程序概览组件样式
 */
.mini-program-overview {
    height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;

    // 用户信息区域
    .user-info-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 16px;

        .avatar-container {
            position: relative;
            width: 160px;
            height: 160px;
            margin-bottom: 12px;

            .avatar-bg {
                width: 100%;
                height: 100%;
                // background-color: #AEA6A6;
                position: absolute;
                top: 0;
                left: 0;
            }

            .u-avatar-img {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                overflow: hidden;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .u-avatar-border {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }

        .user-name {
            font-size: 18px;
            font-weight: 700;
            line-height: 28px;
            color: #1c1c1c;
        }

        .user-detail {
            font-size: 14px;
            line-height: 20px;
            font-weight: 400;
            color: rgba(28, 28, 28, 0.4);
            display: flex;
            align-items: center;
            gap: 4px;

            .hb-icon {
                width: 20px;
                height: 20px;
            }
        }
    }

    // 亲友对比/渡劫方案区域
    .friend-comparison {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;

        .section-title {
            border-radius: 8px;
            background: #24292e;
            padding: 12px;
            width: calc(50% - 6px);
            display: flex;
            align-items: center;
            justify-content: space-between;

            .title-content {
                color: #fedaa3;
                font-size: 16px;
                font-style: normal;
                font-weight: 700;
                line-height: 24px;
                display: flex;
                align-items: center;
                gap: 8px;

                .u-icon-left {
                    height: 24px;
                }
            }

            .u-icon-right {
                height: 14px;
            }

            &.disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }
        }
    }

    // 总进度条
    .total-progress {
        background-color: #24292e;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;

        .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 4px;

            .progress-percentage {
                font-size: 24px;
                font-weight: 700;
                line-height: 30px;
                color: #fedaa3;

                span {
                    font-size: 16px;
                    line-height: 24px;
                }
            }

            .progress-value {
                font-size: 14px;
                font-weight: 700;
                line-height: 20px;
                color: #fedaa3;

                span {
                    font-size: 12px;
                    font-weight: 18px;
                }
            }
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 4px;
            overflow: hidden;

            .progress-fill {
                height: 100%;
                background-color: #fedaa3;
                border-radius: 4px;
            }
        }
    }

    // 进度概览
    .progress-overview {
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .section-title {
                font-size: 14px;
                font-weight: 700;
                line-height: 20px;
                color: rgba(28, 28, 28, 0.8);
            }

            .toggle-mode {
                display: flex;
                align-items: center;
                font-size: 14px;
                font-weight: 700;
                line-height: 20px;
                color: rgba(28, 28, 28, 0.4);
                cursor: pointer;
                margin-right: 4px;
                //禁止选中
                user-select: none;

                .u-switch {
                    //翻转90度
                    transform: rotate(90deg);
                }
            }
        }

        // 分类进度卡片
        .category-progress {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;

            .progress-card {
                border-radius: 8px;
                padding: 12px;
                background-color: #ffffff;
                width: 100%;
                box-sizing: border-box;
                display: flex;
                justify-content: space-between;
                gap: 40px;

                .u-icon {
                    width: 100px;
                    height: 100px;
                    flex-shrink: 0;

                    .hb-icon {
                        width: 100%;
                        height: 100%;
                    }
                }

                //详细模式
                .u-top-detailed {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                    color: rgba(28, 28, 28, 0.8);
                    font-style: normal;

                    .u-name {
                        font-size: 14px;
                        font-weight: 700;
                        line-height: 20px;
                    }

                    .u-info {
                        font-size: 12px;
                        font-weight: 400;
                        line-height: 18px;
                        text-align: left;

                        .u-num {
                            width: 100%;
                            display: flex;
                            justify-content: flex-start;
                            align-items: center;
                            gap: 4px;
                        }
                    }
                }

                .progress-bar-small {
                    width: 100%;
                    height: 4px;
                    margin-top: 4px;
                    background-color: rgba(28, 28, 28, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;

                    .progress-fill {
                        height: 100%;
                        background-color: rgba(28, 28, 28, 0.8);
                        border-radius: 4px;
                    }
                }

                .progress-percentage-small {
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 20px;
                }
            }
        }
    }
}

/**
 * 暗黑模式样式@media screen and (width: 390px)
 */
// @media (prefers-color-scheme: dark)
@media (prefers-color-scheme: dark) {
    .mini-program-overview {
        background-color: #000000;
        color: #ffffff;

        // 用户信息区域
        .user-info-section {
            .user-name {
                color: #ffffff;
            }

            .user-detail {
                color: #cccccc;
            }

            .avatar-container {
                .avatar {
                    background-color: #555555;
                }
            }
        }

        // 总进度条
        .total-progress {
            background-color: #fedaa3;

            .progress-info {
                .progress-percentage {
                    color: #24292e;
                }

                .progress-value {
                    color: #24292e;
                }
            }

            .progress-bar {
                background-color: rgba(255, 255, 255, 0.2);

                .progress-fill {
                    background-color: #24292e;
                }
            }
        }

        // 进度概览
        .progress-overview {
            .section-header {
                .section-title {
                    color: rgba(255, 255, 255, 0.8);
                }

                .toggle-mode {
                    color: rgba(255, 255, 255, 0.4);
                }
            }

            // 分类进度卡片
            .category-progress {
                .progress-card {
                    background-color: #282828;

                    .u-top,
                    .u-top-detailed {
                        color: rgba(255, 255, 255, 0.8);

                        .u-info {
                            color: rgba(255, 255, 255, 0.8);
                        }
                    }

                    .progress-bar-small {
                        background-color: rgba(255, 255, 255, 0.1);

                        .progress-fill {
                            background-color: rgba(255, 255, 255, 0.8);
                        }
                    }
                }
            }
        }
    }
}
</style>
