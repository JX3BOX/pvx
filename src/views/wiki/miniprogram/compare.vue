<template>
    <div class="p-mini-leap" v-loading="loading">
        <div class="m-info-top" ref="infoTop">
            <!-- 头像列表 -->
            <div class="m-avatar-list">
                <div class="m-avatar-item">
                    <div class="u-avatar-placeholder"></div>
                    <div class="m-avatar-info">
                        <div class="u-avatar-name">亲友对比</div>
                    </div>
                </div>
                <div class="m-avatar-item" v-for="(item, index) in compareRoles" :key="'role' + index"
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

            <!-- 总进度、资历等信息-->

            <div class="m-progress-section m-progress-section--total">
                <div class="u-progress-label">总进度</div>
                <div class="m-progress-value" v-for="(role, roleIndex) in compareRoles" :key="roleIndex">
                    <div class="u-value-text">{{ role.totalProgress }}</div>
                    <div class="u-percent-symbol">%</div>
                </div>
            </div>

            <!-- 成就数信息 -->
            <div class="m-progress-section m-progress-section--achievement">
                <div class="u-progress-label">成就数</div>
                <div class="m-progress-value" v-for="(role, roleIndex) in compareRoles" :key="roleIndex">
                    <span class="u-value-text">{{ role.totalOwnAchievements }}</span>
                </div>

            </div>

            <!-- 总资历信息 -->
            <div class="m-progress-section m-progress-section--seniority">
                <div class="u-progress-label">总资历</div>
                <div class="m-progress-value" v-for="(role, roleIndex) in compareRoles" :key="roleIndex">
                    <!-- 截取数字万字位以上内容 -->
                    <span class="u-value-text w">{{ setNumber(role.totalOwnPoints, 'w') }}</span>
                    <!-- 截取数字万字位以下内容 -->
                    <span class="u-value-text">{{ setNumber(role.totalOwnPoints) }}</span>
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
                    <div class="u-category-icon">
                        <img :src="getIconPath(item.sub)" class="u-category-icon-img" v-if="item.sub" />
                    </div>
                    <div class="u-category-title">{{ item.name }}</div>
                </div>
                <div class="m-category-box" v-for="(role, roleIndex) in item.roleAchievements" :key="roleIndex">
                    <span class="u-value-text">{{ role.progress }}</span>
                    <span class="u-percent-symbol">%</span>
                </div>

            </div>
        </div>
        <!-- 角色列表 -->
        <AddFriend v-model="drawerVisible" @confirmSelection="handleConfirmSelection" />
        <!-- 删除对比角色 -->
        <DeleteRole v-model="delDrawerVisible" :role="deleteRoleInfo" @deleteRole="handleDeleteRoleConfirm" />
        <!-- 分类卡片抽屉 -->
        <CataloguePop v-model="drawerCatalogueVisible" :category="currentCategory" :compareRoles="compareRoles"
            @handleDetailClick="handleDetailClick" />
    </div>
</template>

<script>
import AddFriend from '@/views/wiki/miniprogram/compare/addFriend.vue'
import DeleteRole from '@/views/wiki/miniprogram/compare/deleteRole.vue'
import CataloguePop from '@/views/wiki/miniprogram/compare/catalogue_pop.vue'
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
import Search from "@/views/wiki/miniprogram/compare/search.vue";
import { getUserRolesList, getRoleGameAchievementsList, getMenuAndPoints, getAchievementsFinishStatus } from "@/utils/wiki_miniprogram";
import { cloneDeep } from "lodash";
import { mobileOpen } from "@/utils/minprogram";
export default {
    name: "Compare",
    components: {
        AddFriend,
        RoleAvatar,
        DeleteRole,
        CataloguePop,
        Search,
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
            //成就菜单列表
            menuList: [],
            //成就点数据
            pointsData: {},
            //需要运算角色的成就ID数组，用于getAllAchievementsData
            compareAchievements: [],
            //列表
            list: [],
            //点击删除的角色
            deleteRoleInfo: null,
            //删除对比角色抽屉是否可见
            delDrawerVisible: false,
            //当前点击的分类
            currentCategory: null,
            //分类卡片抽屉是否可见
            drawerCatalogueVisible: false,
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
    mounted() {
        // 计算分类卡片的高度,通过获取整个body高度减去m-info-top即info-top的高度
        this.categoryHeight = document.querySelector('body').offsetHeight - document.querySelector('.m-info-top').offsetHeight
    },
    methods: {
        //初始化操作
        async init() {
            //设置加载中
            this.loading = true;
            //初始化菜单及成就点列表
            let menuAndPoints = await getMenuAndPoints(this.$store.state.client);
            this.menuList = menuAndPoints.menuList || [];
            this.pointsData = menuAndPoints.pointsList || [];
            //初始化我的角色列表
            this.roles = await getUserRolesList();
            //获取jx3id
            let jx3id = this.$route.query.jx3id;
            if (jx3id) {
                let role = this.roles.find(role => role.jx3id == jx3id);
                if (role) {
                    this.compareRoles.push(role);
                }
            } else {
                //如果没有jx3id，默认对比第一个角色
                if (this.roles.length > 0) {
                    this.compareRoles.push(this.roles[0]);
                }
            }
            //初始化我的角色成就信息
            await this.loadRoleAchievements(this.compareRoles[0].jx3id)
            //设置加载完成
            this.loading = false;
        },
        /**
         * 获取图标路径
         * @param {string} sub - 分类子项
         * @returns {string} - 图标路径
         */
        getIconPath(sub) {
            return require(`@/assets/img/wiki_miniprogram/${this.isDark ? 'Dark' : 'Light'}/tog_${sub}.svg`);
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

        /**
       * 添加对比角色
       */
        addFriendRole(index) {
            // 处理添加对比角色的逻辑
            // 打开抽屉
            this.drawerVisible = true;
        },
        //角色选择确认
        handleConfirmSelection(role) {
            //判断是否已添加该角色
            if (this.compareRoles.find((item) => item.jx3id == role.jx3id)) {
                this.$message({
                    message: "已添加该角色",
                    type: "warning",
                });
                return;
            }
            // 处理确认选择角色的逻辑
            this.compareRoles.push(role);
            this.loadRoleAchievements(role.jx3id)
            // 关闭抽屉
            this.drawerVisible = false;
        },
        //删除对比角色
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
        //删除对比角色确认
        handleDeleteRoleConfirm() {
            let index = this.compareRoles.findIndex((role) => role.jx3id == this.deleteRoleInfo.jx3id);
            if (index != -1) {
                this.compareRoles.splice(index, 1);
                this.list = this.list.map((item) => {
                    item.roleAchievements.splice(index, 1);
                    return item;
                });
            }
            this.delDrawerVisible = false;
        },
        // 分类卡片点击事件
        handleCategoryClick(item) {
            this.currentCategory = item;
            this.drawerCatalogueVisible = true;
        },
        // 分类抽屉查看详情点击事件
        handleDetailClick() {
            // this.drawerCatalogueVisible = false;
            let query_role = []
            this.compareRoles.forEach((role, index) => {
                query_role.push(`${role.jx3id}|${role.server}|${role.mount}|${role.body_type}|${role.name}`)
            })
            mobileOpen(this.$router.resolve({
                name: "compare/catalogue",
                query: {
                    roles: query_role.join(','),
                    menuId: this.currentCategory.sub,
                }
            }).href);
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

        /*******************************成就点数及计算相关函数*****************************/

        // 获取指定角色成就状态
        async loadRoleAchievements(jx3id) {
            let achievements = await getRoleGameAchievementsList(jx3id);
            this.compareAchievements = achievements.list;
            this.getRenderList(jx3id);
        },
        getRenderList(jx3id) {
            let menuList = cloneDeep(this.menuList);
            //根据jx3获取到对比角色的index填充至roleAchievements保持下标不变
            let index = this.compareRoles.findIndex(role => role.jx3id == jx3id);
            let finishAchievements = this.compareAchievements;
            const list = Object.keys(menuList).map((key) => {
                const item = menuList[key];
                //获取到所有成就数据
                const allData = getAchievementsFinishStatus(item, finishAchievements);
                //重组菜单数据合并成就数据
                let roleAchievements = []
                roleAchievements.push({
                    jx3id: jx3id, //角色jx3id
                    allAchievements: allData.allAchievements, //根据菜单梳理所有成就ID
                    ownAchievements: allData.ownAchievements, //角色在该分类下完成的成就
                    ownPoints: allData.ownPoints, //当前菜单完成的成就点数
                    progress: (allData.ownPoints / allData.allPoints * 100).toFixed(2), //当前菜单完成进度
                }) //角色的成就数据
                return {
                    sub: item.sub,
                    detail: item.detail,
                    name: item.name,
                    children: item.children,
                    allPoints: allData.allPoints, //当前菜单成就点数
                    roleAchievements: roleAchievements
                };
            });
            if (this.list.length > 0) {
                this.list = cloneDeep(this.list).map((item, i) => {
                    return {
                        ...item,
                        roleAchievements: item.roleAchievements.concat(list[i].roleAchievements)
                    };
                });
            } else {
                this.list = list;
            }
            //成就总数ownAchievements.length
            let totalOwnAchievements = 0;
            list.forEach((item) => {
                totalOwnAchievements += item.roleAchievements[0].ownAchievements.length;
            });
            this.compareRoles[index].totalOwnAchievements = totalOwnAchievements;
            this.compareRoles[index].totalAllPoints = list.reduce((acc, item) => acc + item.allPoints, 0);
            this.compareRoles[index].totalOwnPoints = this.compareAchievements.reduce((acc, item) => acc + (this.pointsData[item] || 0), 0);
            this.compareRoles[index].totalProgress = (this.compareRoles[index].totalOwnPoints / this.compareRoles[index].totalAllPoints * 100).toFixed(2);
        },
        // 回调获取所有成就
        getAllAchievementsData(
            data,
            allAchievements = [],
            ownAchievements = [],
            countData = { allPoints: 0, ownPoints: 0 }
        ) {
            // 完成的成就
            const ownAllAchievements = this.compareAchievements;
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
                    this.getAllAchievementsData(item, allAchievements, ownAchievements, countData);
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
    }
};
</script>

<style lang="less" scoped>
.p-mini-leap {
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


    // 进度信息区域通用样式
    .m-progress-section {
        background-color: #2d333b;
        padding: 16px 0;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .u-progress-label,
        .m-progress-value {
            width: calc(100% / 4);
            text-align: center;
        }

        .u-progress-label,
        .m-progress-value {
            color: #FEDAA3;
            font-weight: 700;
            font-style: normal;
        }

        .u-progress-label {
            font-size: 14px;
            line-height: 20px;
        }

        .m-progress-value {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px 0;
            font-weight: 700;
            font-size: 14px;
        }
    }

    //总进度
    .m-progress-section--total {
        .m-progress-value {
            flex-direction: column;

            .u-value-text {
                font-size: 24px;
            }

            .u-percent-symbol {
                font-size: 12px;
            }
        }
    }

    //成就数
    .m-progress-section--achievement {
        padding: 4px 0;
    }

    //总资历
    .m-progress-section--seniority {
        padding: 4px 0;

        .u-value-text {
            font-size: 12px;

            &.w {
                font-size: 14px;
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
            width: 100%;
            // &:last-child {
            //     margin-bottom: 0;
            // }

            .m-category-box {
                padding: 12px;
                box-sizing: border-box;
                width: calc(100% / 4);
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
    .p-mini-leap {
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
