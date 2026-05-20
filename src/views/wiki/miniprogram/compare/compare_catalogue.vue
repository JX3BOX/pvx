<template>
    <div class="p-mini-leap_catalogue" v-loading="loading">
        <div class="m-info-top" ref="infoTop">
            <!-- 头像列表 -->
            <div class="m-avatar-list">
                <div class="m-avatar-item" @click="handleClickCategory">
                    <div class="u-avatar-placeholder">
                        <img :src="getIconPath(category?.sub)" class="u-category-icon-img" v-if="category?.sub" />
                    </div>
                    <div class="m-avatar-info">
                        <div class="u-avatar-name">{{ category?.name }}</div>
                    </div>
                </div>
                <div class="m-avatar-item" v-for="item in compareRoles" :key="item.jx3id"
                    @click="handleDeleteRole(item)">
                    <RoleAvatar class="u-avatar-img" :mount="item.mount" :body_type="item.body_type" />
                    <div class="m-avatar-info">
                        <div class="u-avatar-name">{{ item.name }}</div>
                        <div class="u-avatar-server">{{ item.server }}</div>
                    </div>
                </div>

                <!-- 添加占位符 -->
                <div class="m-avatar-item m-avatar-item--add" v-for="index in 3 - compareRoles.length"
                    :key="'add' + index" @click="addFriendRole(index)">
                    <img :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/quan.svg`)"
                        class="u-avatar-add-quan" svg-inline />
                    <img :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/jia.svg`)"
                        class="u-avatar-add-icon" svg-inline />
                </div>
            </div>

            <!-- 搜索框 -->
            <Search @submit="handleSearchClick" />
        </div>
        <!-- 分类卡片 -->
        <div class="m-category-section" :style="{ height: categoryHeight + 'px' }">
            <!-- 杂闻卡片 -->
            <div class="m-category-card" v-for="(item, index) in list" :key="index" @click="handleCategoryClick(item)">
                <div class="m-category-box">
                    <div class="u-category-title">{{ item.name }}</div>
                </div>
                <div class="m-category-box" v-for="(role, roleIndex) in compareRoles" :key="roleIndex">
                    <span class="u-value-text">{{ getUserProgress(role, item) }}</span>
                    <span class="u-percent-symbol">%</span>
                </div>
                <div class="m-category-box" v-for="noItem in 3 - compareRoles.length" :key="`noItem${noItem}`"></div>
            </div>
        </div>
        <!-- 分类卡片抽屉 -->
        <CataloguePop v-model:visible="drawerCatalogueVisible" :category="currentCategory" :compareRoles="compareRoles"
             @handleDetailClick="handleDetailClick" :showDetailBtn="showDetailBtn" />
        <!-- 添加对比好友 -->
        <AddFriend v-model:visible="drawerVisible" @confirmSelection="handleConfirmSelection" />
        <!-- 删除对比角色 -->
        <DeleteRole v-model:visible="delDrawerVisible" :role="deleteRoleInfo" @deleteRole="handleDeleteRoleConfirm" />
    </div>
</template>

<script>
import { getRoleGameAchievementsList, getMenuAndPoints, getAchievementsFinishStatus } from "@/utils/wiki_miniprogram";
import CataloguePop from '@/views/wiki/miniprogram/compare/catalogue_pop.vue'
import AddFriend from '@/views/wiki/miniprogram/compare/addFriend.vue'
import DeleteRole from '@/views/wiki/miniprogram/compare/deleteRole.vue'
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
import Search from "@/views/wiki/miniprogram/compare/search.vue";
import { cloneDeep } from "lodash";
import { mobileOpen } from "@/utils/minprogram";
export default {
    name: "CompareCatalogue",
    components: {
        RoleAvatar,
        CataloguePop,
        Search,
        AddFriend,
        DeleteRole,
    },
    data() {
        return {
            // 加载中
            loading: false,
            // 容器高度
            categoryHeight: 0,
            // 抽屉是否可见
            drawerVisible: false,
            // 自己的角色列表
            roles: [],
            //对比角色列表
            compareRoles: [],

            //成就点数据
            pointsData: {},
            //需要运算角色的成就ID数组，用于getAllAchievementsData
            compareAchievements: [],
            //列表
            list: [],
            category: null,
            //当前点击的分类
            currentCategory: null,
            //分类卡片抽屉是否可见
            drawerCatalogueVisible: false,
            //是否显示查看详情按钮
            showDetailBtn: true,
            //点击删除的角色
            deleteRoleInfo: null,
            //删除对比角色抽屉是否可见
            delDrawerVisible: false,
        };
    },
    computed: {
        /**
         * 是否为暗黑模式
         * @returns {boolean} - 是否为暗黑模式
         */
        isDark() {
            const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
            return mediaQueryList.matches;
        }
    },
    created() {
        this.init()
    },
    methods: {
        /**
         * 添加对比角色
         */
        addFriendRole(index) {
            this.drawerVisible = true;
        },
        /**
         * 角色选择确认
         */
        async handleConfirmSelection(role) {
            // 检查是否已存在
            if (this.compareRoles.find(item => item.jx3id == role.jx3id)) {
                this.$message({
                    message: "已添加该角色",
                    type: "warning",
                });
                return;
            }
            // 检查数量限制
            if (this.compareRoles.length >= 3) {
                this.$message({
                    message: "最多对比3个角色",
                    type: "warning",
                });
                return;
            }
            // 加载角色成就数据
            const achievements = await getRoleGameAchievementsList(role.jx3id);
            const newRole = {
                ...role,
                finishedAchievements: achievements.list || []
            };
            this.compareRoles.push(newRole);
            this.drawerVisible = false;
        },
        /**
         * 删除对比角色
         */
        handleDeleteRole(item) {
            if (this.compareRoles.length == 1) {
                this.$message({
                    message: "至少保留一个角色",
                    type: "warning",
                });
                return;
            }
            this.deleteRoleInfo = item;
            this.delDrawerVisible = true;
        },
        /**
         * 删除对比角色确认
         */
        handleDeleteRoleConfirm() {
            let index = this.compareRoles.findIndex((role) => role.jx3id == this.deleteRoleInfo.jx3id);
            if (index != -1) {
                this.compareRoles.splice(index, 1);
            }
            this.delDrawerVisible = false;
        },
        //点击了分类执行弹出对比抽屉（使用分类抽屉隐藏详情按钮）
        handleClickCategory() {
            this.showDetailBtn = false
            //设置当前点击的分类
            this.currentCategory = cloneDeep(this.category)
            this.drawerCatalogueVisible = true
        },
        //搜索点击事件
        handleSearchClick(res) {
            let query_role = []
            this.compareRoles.forEach((role, index) => {
                query_role.push(`${role.jx3id}|${role.server}|${role.mount}|${role.body_type}|${role.name}`)
            })
            let params = res.params || {}
            //跳转到compare/achievement
            mobileOpen(this.$router.resolve({
                name: "compare/achievement",
                query: {
                    //来源
                    source: 1, //1 非achievement当前页面，需要执行另一套list检索
                    roles: query_role.join(','),
                    keyword: params.keyword || '',
                    scene: params.scene || '',
                }
            }).href);
        },
        //初始化操作
        async init() {
            //设置加载中
            this.loading = true;
            //获取对比角色列表this.$route.query.roles使用url解码
            let roles = decodeURIComponent(decodeURIComponent(decodeURIComponent(this.$route.query.roles))).split(','), menuId = this.$route.query.menuId;
            const compareRoles = await Promise.all(roles.map(async (role) => {
                const roleInfo = role.split('|');
                const achievements = await getRoleGameAchievementsList(roleInfo[0]);
                return {
                    jx3id: roleInfo[0],
                    server: roleInfo[1],
                    mount: roleInfo[2],
                    body_type: roleInfo[3],
                    name: roleInfo[4],
                    finishedAchievements: achievements.list || []
                };
            }));

            this.compareRoles = compareRoles;
            //初始化菜单及成就点列表
            let menuAndPoints = await getMenuAndPoints(this.$store.state.client);
            let menuList = menuAndPoints.menuList || [];
            this.pointsData = menuAndPoints.pointsList || [];
            //从menuList中根据sub获取分类数据，menuInfo为对象
            Object.keys(menuList).forEach((key) => {
                let item = menuList[key];
                if (item.sub == menuId) {
                    this.category = item;
                    this.list = item.children || []
                }
            })
            this.$nextTick(() => {
                // 计算分类卡片的高度,通过获取整个body高度减去m-info-top即info-top的高度
                this.categoryHeight = document.querySelector('body').offsetHeight - document.querySelector('.m-info-top').offsetHeight
            })
            //设置加载完成
            this.loading = false;
        },
        /**
         * 获取图标路径
         * @param {string} sub - 分类子项
         * @returns {string} - 图标路径
         */
        getIconPath(sub) {
            if (!sub) return '';
            return require(`@/assets/img/wiki_miniprogram/${!this.isDark ? 'Dark' : 'Light'}/tog_${sub}.svg`);
        },
        setNumber(num, type) {
            if (!num) return ''
            const pointsStr = num.toString();
            if (type == 'w') {
                // 截取数字万字位以上内容
                return pointsStr.length > 4 ? pointsStr.slice(0, -4) : '';
            } else {
                // 截取数字万字位以下内容
                return pointsStr.length > 4 ? pointsStr.slice(-4) : pointsStr;
            }
        },
        // 分类卡片点击事件
        handleCategoryClick(item) {
            //设置是否显示查看详情按钮
            this.showDetailBtn = true
            this.currentCategory = cloneDeep(item);
            this.currentCategory.name = this.category.name + '-' + this.currentCategory.name
            let roleAchievements = []
            this.compareRoles.forEach(role => {
                //运算信息
                let progressInfo = this.getUserProgress(role, item, 2)
                roleAchievements.push({
                    ...role,
                    progress: progressInfo.progress,
                    achievementCount: progressInfo.achievementCount,
                    allPoints: progressInfo.allPoints,
                    ownPoints: progressInfo.ownPoints
                })
            });
            this.currentCategory.roleAchievements = roleAchievements
            this.drawerCatalogueVisible = true;
        },
        // 分类抽屉查看详情点击事件
        handleDetailClick() {
            this.drawerCatalogueVisible = false;

            let query_role = []
            this.compareRoles.forEach((role, index) => {
                query_role.push(`${role.jx3id}|${role.server}|${role.mount}|${role.body_type}|${role.name}`)
            })
            mobileOpen(this.$router.resolve({
                name: "compare/achievement",
                query: {
                    // roles: this.$route.query.roles,
                    roles: query_role.join(','),
                    sub: this.currentCategory.sub,
                    detail: this.currentCategory.detail,
                }
            }).href);
        },
        /*******************************成就点数及计算相关函数*****************************/
        /**
         * 获取用户进度
         * @param {object} role - 角色对象
         * @param {object} item - 分类子项
         * @param {number} type - 进度类型，1为界面渲染，2为详情弹窗，需要输出进度、成就数、总资历
         * @returns {string} - 用户进度
         */
        getUserProgress(role, item, type = 1) {
            if (!role || !item || !this.pointsData) {
                return '0.00';
            }

            let allPoints = 0;
            let ownPoints = 0;
            let achievementCount = 0;
            const calculateAchievements = (achievements) => {
                achievements.forEach(achievement => {
                    if (Array.isArray(achievement)) {
                        calculateAchievements(achievement);
                    } else {
                        const points = this.pointsData[achievement] || 0;
                        allPoints += points;
                        achievementCount++;
                        if (role.finishedAchievements && role.finishedAchievements.includes(String(achievement))) {
                            ownPoints += points;
                        }
                    }
                });
            };

            calculateAchievements(item.achievements);

            if (allPoints === 0) {
                return '0.00';
            }

            return type == 1 ? (ownPoints / allPoints * 100).toFixed(2) : {
                progress: (ownPoints / allPoints * 100).toFixed(2),
                achievementCount: achievementCount,
                allPoints: allPoints,
                ownPoints: ownPoints
            };
        },
    }
};
</script>

<style lang="less" scoped>
.p-mini-leap_catalogue {
    height: 100vh;
    background-color: #F5F5F5;
    overflow: hidden;

    // 头像列表
    .m-avatar-list {
        display: flex;
        justify-content: space-between;
        background-color: #24292e;
        margin-bottom: 4px;
        padding: 12px 0;

        .m-avatar-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            //一行4个
            width: calc(100% / 4);

            &.m-avatar-item--add {
                position: relative;

                .u-avatar-add-quan,
                .u-avatar-add-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .u-avatar-add-icon {
                    z-index: 2;
                }
            }

            .u-category-icon-img {
                width: 80px;
                height: 80px;
                margin-bottom: 4px;
            }

            .u-avatar-img {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                margin-bottom: 8px;
            }

            .m-avatar-info {
                text-align: center;

                .u-avatar-name {
                    color: #FEDAA3;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 700;
                    line-height: 20px;
                }

                .u-avatar-server {
                    color: rgba(255, 255, 255, 0.40);
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 20px;
                }
            }
        }
    }

    // 分类卡片区域
    .m-category-section {
        overflow-y: auto;

        .m-category-card {
            background-color: #FFFFFF;

            box-sizing: border-box;
            margin-bottom: 12px;
            display: flex;
            justify-content: flex-start;
            // &:last-child {
            //     margin-bottom: 0;
            // }

            .m-category-box {
                padding: 12px;
                box-sizing: border-box;
                width: calc(100% / 4);
                min-height: 100px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-right: 0.5px solid rgba(28, 28, 28, 0.05);
                border-left: 1px solid rgba(28, 28, 28, 0.05);

                &:first-child {
                    border-left: none;
                }

                &:last-child {
                    border-right: none;
                }
            }

            .u-category-icon-img {
                width: 100%;
            }

            .u-category-title {
                // color: rgba(28, 28, 28, 0.40);
                color: #24292E;
                font-size: 14px;
                font-style: normal;
                font-weight: 700;
                line-height: 20px;
            }

            .u-value-text,
            .u-percent-symbol {
                color: rgba(28, 28, 28, 0.80);
                font-style: normal;
                font-weight: 700;
            }

            .u-value-text {
                font-size: 24px;
                line-height: 30px;
            }

            .u-percent-symbol {
                font-size: 12px;
                line-height: 18px;
            }
        }
    }
}

/**
 * 暗黑模式样式@media screen and (width: 390px)
 */
// @media (prefers-color-scheme: dark)

@media (prefers-color-scheme: dark) {
    .p-mini-leap_catalogue {
        background-color: #000;

        .m-avatar-list {
            background-color: #fedaa3;

            .m-avatar-item {
                .m-avatar-info {
                    .u-avatar-name {
                        color: #24292e;
                    }

                    .u-avatar-server {
                        color: rgba(28, 28, 28, 0.40);
                    }
                }
            }

        }

        .m-progress-section {
            background-color: #fedaa3;

            .u-progress-label,
            .m-progress-value {
                color: #24292e;
            }
        }

        .m-category-section {
            .m-category-card {

                background: #282828;

                .m-category-box {
                    border: 0.5px solid rgba(255, 255, 255, 0.10);

                }

                .u-category-title {
                    color: rgba(255, 255, 255, 0.40);
                }

                .u-value-text,
                .u-percent-symbol {
                    color: rgba(255, 255, 255, 0.80);
                }
            }
        }
    }
}
</style>
