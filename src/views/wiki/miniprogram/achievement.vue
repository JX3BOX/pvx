<!-- 成就列表 -->
<template>
    <div class="mini-program-achievement">
        <!-- 总进度条 -->
        <div class="total-progress">
            <div class="progress-info">
                <!-- 左右布局 -->
                <div class="progress-left">
                    <div class="progress-info-item">
                        <div class="progress-name">{{ info.name }}</div>
                        <div class="u-info">
                            <div class="u-num">
                                <img width="12" height="12"
                                    :src="require(`@/assets/img/wiki_miniprogram/${!isDark ? 'Dark' : 'Light'}/count.svg`)"
                                    alt="成就logo" />
                                {{ finishedCategoryCount || 0 }}/{{ categoryCount || 0 }}
                            </div>
                            <div class="u-num">
                                <img width="12" height="12"
                                    :src="require(`@/assets/img/wiki_miniprogram/${!isDark ? 'Dark' : 'Light'}/sum.svg`)"
                                    alt="资历logo" />
                                {{ ownPointsCount || 0 }}/{{ allPointsCount || 0 }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="progress-right">
                    <div class="progress-percentage">{{ totalProgress }}<span>%</span></div>
                    <div class="progress-value">

                        {{ ownPointsCountW }}<span>{{ ownPointsCountOther }}</span>
                    </div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: totalProgress + '%' }"></div>
            </div>
        </div>
        <!-- 筛选 -->
        <div class="m-filter">
            <div class="u-filter-item" @click="handleModeClick">
                <span>筛选</span>
                <img width="15" height="15"
                    :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/shaixuan.svg`)"
                    alt="筛选logo" />
            </div>
        </div>
        <!-- 进度概览 -->
        <div class="progress-overview" :class="{ 'simple-mode': isSimpleModeSelect != 'all' }">
            <!-- 列表卡片 -->
            <div class="category-progress">
                <!-- 暂无数据！ -->
                <div v-if="achievements_list.length === 0">暂无数据！</div>
                <div class="progress-card" v-for="(achievement, index) in achievements_list" :key="index"
                    :class="{ 'completed': achievement.isCompleted }" @click="handleClick(achievement)">
                    <!-- 左图标右内容 -->
                    <div class="u-top">
                        <div class="card-icon">
                            <img :src="iconLink(achievement.IconID)" alt="" class="hb-icon" svg-inline>
                        </div>
                        <div class="u-info">
                            <div class="card-title">
                                <span>
                                    {{ achievement.Name }}
                                </span>
                                <div class="u-desc">
                                    {{ achievement.ShortDesc }}
                                </div>
                            </div>

                            <div class="u-point">
                                <div>
                                    {{ achievement.Point }}
                                    <img width="14" height="14"
                                        :src="require(`@/assets/img/wiki_miniprogram/${!isDark ? 'Dark' : 'Light'}/count.svg`)"
                                        alt="成就logo" />
                                </div>
                                <div class="u-status" v-if="achievement.isCompleted">
                                    已完成
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 激活模式常驻显示 -->
        <div class="u-mode" v-if="isSimpleModeSelect != 'all'">
            <div class="u-mode-item" @click="handleModeClick">
                筛选已激活：{{ isSimpleModeSelectName() }}
            </div>
        </div>
        <!-- 模式切换 -->
        <el-drawer title="显示模式" :model-value="drawerModeVisible" direction="btt" size="360px" @close="handleModeClose"
            class="c-mode-list-drawer">
            <div class="mode-list-container">
                <div v-for="(item, index) in modeType" :key="index" class="mode-item" @click="toggleMode(item.value)"
                    :class="{ 'selected': isSimpleModeSelectBak == item.value }">
                    <div class="mode-name">{{ item.name }}</div>
                    <div class="mode-detail">{{ item.detail }}</div>
                </div>
            </div>
            <div class="mode-button-group">
                <el-button @click="resetMode" class="u-reset">重置</el-button>
                <el-button @click="confirmMode" class="u-submit">确定</el-button>
            </div>
        </el-drawer>
        <!-- 详细信息弹窗 -->
        <achievement_detail ref="achievementDetail" v-if="achievementDetailVisible"
            v-model:visible="achievementDetailVisible" v-model:current="current">
        </achievement_detail>
    </div>
</template>
<script>
/**
 * 成就列表组件
 * 展示用户成就列表、总进度和分类进度概览
 */
import { getMenuAchievements } from "@/service/achievement";
import { getRoleGameAchievementsList, getMenuAndPoints, getAchievementsFinishStatus } from "@/utils/wiki_miniprogram";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import { __imgPath } from "@/utils/config";
import { cloneDeep } from "lodash";
import achievement_detail from "@/views/wiki/miniprogram/components/achievement_detail.vue"
export default {
    name: "AchievementMiniProgram",
    components: {
        achievement_detail
    },
    // 数据定义
    data() {
        return {
            // 显示模式
            isSimpleModeSelect: 'all',
            isSimpleModeSelectBak: 'all',
            drawerModeVisible: false,
            modeType: [
                { name: '全部显示', value: 'all', detail: '' },
                { name: '已完成', value: 'finish', detail: '<隐藏掉未完成的成就>' },
                { name: '未完成', value: 'unfinish', detail: '<隐藏掉已完成的成就>' }
            ],
            //分类数据
            achievementData: [],
            //成就点数
            pointsData: {},
            //整合列表
            list: [],
            // 所有分类的总成就点数
            allPointsCount: 0,
            // 我拥有的所有资历点数
            ownPointsCount: 0,
            // 分类总数
            categoryCount: 0,
            // 我完成的分类树
            finishedCategoryCount: 0,
            // 我拥有的所有资历点数万字位以上
            ownPointsCountW: null,
            // 我拥有的所有资历点数其他位
            ownPointsCountOther: 0,
            info: {},
            achievements_list_all: [], //  全部成就
            achievements_list: [],//过滤后的成就，默认全部
            // 详细信息弹窗
            achievementDetailVisible: false,
            current: {}
        }
    },
    computed: {
        isDark() {
            // // 使用 window.matchMedia 检查系统是否启用了暗色模式
            const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
            return mediaQueryList.matches;
        },
        // 总进度
        totalProgress() {
            if (!this.ownPointsCount && !this.allPointsCount) return 0;
            return ((this.ownPointsCount / this.allPointsCount) * 100).toFixed(2);
        },
    },
    created() {
        this.getListInit();
    },
    methods: {
        iconLink,
        // 获取显示模式名称
        isSimpleModeSelectName() {
            return this.modeType.find(item => item.value == this.isSimpleModeSelect)?.name
        },
        handleModeClick() {
            this.drawerModeVisible = true;
        },
        /**
         * 处理抽屉关闭
         */
        handleModeClose() {
            this.drawerModeVisible = false;
        },
        // 切换显示模式
        toggleMode(value) {
            this.isSimpleModeSelectBak = value
        },
        resetMode() {
            this.isSimpleModeSelectBak = cloneDeep(this.isSimpleModeSelect)
        },
        confirmMode() {
            this.isSimpleModeSelect = cloneDeep(this.isSimpleModeSelectBak);
            let activeList = cloneDeep(this.achievements_list_all)
            //根据筛选条件过滤内容，isCompleted为true的为已完成，为false的为未完成
            let list = []
            if (this.isSimpleModeSelect === 'all') {
                this.achievements_list = activeList
            } else if (this.isSimpleModeSelect === 'finish') {
                list = activeList.filter(item => item.isCompleted)
                this.achievements_list = list
            } else if (this.isSimpleModeSelect === 'unfinish') {
                list = activeList.filter(item => !item.isCompleted)
                this.achievements_list = list
            }
            this.handleModeClose()
        },
        async getListInit() {
            //获取分类sub，根据sub获取分类数据
            let menuId = this.$route.query.menuId, detail = this.$route.query.detail, jx3id = this.$route.query.jx3id;
            //初始化菜单及成就点列表
            let menuAndPoints = await getMenuAndPoints(this.$store.state.client);
            let menuList = menuAndPoints.menuList || [];
            this.pointsData = menuAndPoints.pointsList || [];
            //从menuList中根据sub获取分类数据，menuInfo为对象
            Object.keys(menuList).forEach((key) => {
                let item = menuList[key];
                if (item.sub == menuId) {
                    //循环children根据detail比对
                    let info = item.children.find(child => child.detail == detail) || {};
                    if (info) {
                        this.info = info;
                        document.title = item.name + ' - ' + info.name;
                    }
                }
            })

            let achievements = await getRoleGameAchievementsList(jx3id);
            this.finishedAchievements = achievements.list || [];
            this.getRenderList();
        },
        // 获取成就列表
        getMenuAchievements() {
            let menu = this.info, finishedAchievements = this.finishedAchievements;
            getMenuAchievements(menu.sub, menu.detail)
                .then((data) => {
                    let list = data.data.data.achievements || [];
                    let arr = [];
                    list.forEach((item) => {
                        item.isCompleted = finishedAchievements.includes(String(item.ID));
                        arr.push(item);
                        if (item.SeriesAchievementList) {
                            item.SeriesAchievementList.forEach((sub, index) => {
                                if (index > 0) {
                                    sub.isCompleted = finishedAchievements.includes(String(sub.ID));
                                    arr.push(sub);
                                }
                            });
                        }
                    });
                    this.achievements_list_all = arr;
                    this.achievements_list = arr;
                })

        },
        /**
         * 处理成就点击
         * @param {object} achievement - 成就项
         */
        handleClick(achievement) {
            this.current = achievement
            this.achievementDetailVisible = true
        },
        /**
         * 获取图标路径
         * @param {string} sub - 分类子项
         * @returns {string} - 图标路径
         */
        getIconPath(sub) {
            return require(`@/assets/img/wiki_miniprogram/tog_${sub}.svg`);
        },

        getRenderList() {
            //获取   achievements，二维数组转成一维数组
            const achievements = this.info.achievements?.flat(Infinity) || [];
            this.categoryCount = achievements.length;

            const finishedAchievements = achievements.filter(item =>
                this.finishedAchievements?.includes(String(item))
            );
            this.finishedCategoryCount = finishedAchievements.length;

            const statistics = achievements.reduce((acc, achievementId) => {
                const points = this.pointsData?.[achievementId] || 0;
                acc.allPointsCount += points;

                if (this.finishedAchievements?.includes(String(achievementId))) {
                    acc.ownPointsCount += points;
                }

                return acc;
            }, { allPointsCount: 0, ownPointsCount: 0 });

            this.allPointsCount = statistics.allPointsCount;
            this.ownPointsCount = statistics.ownPointsCount;
            // 如果我的成就点数长度大于4，则截取后4位写在ownPointsCountOther，其余写在ownPointsCountW
            const pointsStr = this.ownPointsCount.toString();
            if (pointsStr.length > 4) {
                this.ownPointsCountW = pointsStr.slice(0, -4);
                this.ownPointsCountOther = pointsStr.slice(-4);
            } else {
                this.ownPointsCountW = '';
                this.ownPointsCountOther = pointsStr;
            }
            this.getMenuAchievements()

        },
        getCurrentProgress(own, all) {
            return ((own / all) * 100).toFixed(2);
        },
    }
}
</script>
<style lang="less">
.c-mode-list-drawer {
    overflow: auto;
    border-radius: 20px 20px 0 0;
    background: #24292e;

    .el-drawer__header {
        margin-bottom: 0;
        color: #72767b;
    }

    .el-drawer__body {
        padding: 0;
    }

    .mode-list-container {
        padding: 20px 20px 0 20px;

        .mode-item {
            padding: 16px;
            margin-bottom: 16px;
            border: 2px solid #30363D;
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
                ;
            }

            .mode-detail {
                font-size: 12px;
                line-height: 18px;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.8);
            }

            &.selected {
                border-color: #FEDAA3;
                background-color: rgba(255, 255, 255, 0.05);

                .mode-name,
                .mode-detail {
                    color: #FEDAA3;
                }

            }
        }
    }

    .mode-button-group {
        padding: 16px 20px;
        display: flex;
        justify-content: flex-end;
        gap: 20px;
        border-top: 1px solid #30363D;

        .el-button {
            margin-left: 0;
            border-radius: 12px;
        }

        .u-submit {
            flex: 1;
            background: #FEDAA3;
        }
    }
}

/**
 * 成就列表组件样式
 */
.mini-program-achievement {
    height: 100vh;
    background-color: #F5F5F5;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;

    // 总进度条
    .total-progress {
        background-color: #24292e;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 20px;

        .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;

            .progress-left {
                display: flex;
                align-items: center;

                .progress-info-item {
                    font-size: 16px;
                    font-weight: 700;
                    line-height: 24px;
                    color: #fedaa3;

                    .u-info {
                        display: flex;
                        align-items: center;
                        gap: 4px;

                        .u-num {
                            font-size: 12px;
                            font-weight: 400;
                        }
                    }
                }
            }

            .progress-right {
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

    // 筛选
    .m-filter {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 20px;

        .u-filter-item {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            color: rgba(28, 28, 28, 0.40);

        }
    }

    //激活常驻模式
    .u-mode {
        position: fixed;
        bottom: 0;
        left: 0;
        border-radius: 20px 20px 0 0;
        background: #24292E;
        width: 100%;
        display: flex;
        padding: 20px 0 36px 0;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;

        .u-mode-item {
            color: #FEDAA3;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 24px;
        }
    }

    // 进度概览
    .progress-overview {
        &.simple-mode {
            padding-bottom: 80px;
        }

        // 分类进度卡片
        .category-progress {
            display: flex;
            flex-wrap: wrap;

            .progress-card {
                padding: 12px;
                background-color: #ffffff;
                width: 100%;
                flex-shrink: 0;
                box-sizing: border-box;
                margin-bottom: 10px;
                border-radius: 8px;

                .u-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;

                    .card-icon {
                        width: 44px;
                        height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                    }

                    .u-info {
                        color: rgba(28, 28, 28, 0.80);
                        font-style: normal;
                        font-weight: 700;
                        flex: 1;
                        font-size: 14px;
                        line-height: 20px;
                        display: flex;
                        justify-content: space-between;

                        .card-title {
                            display: flex;
                            flex-direction: column;

                        }

                        .u-desc {
                            font-weight: 400;
                        }

                        .u-status {
                            color: #34C759;
                        }
                    }
                }

                &.completed {
                    .u-top {

                        .u-info {
                            //颜色虚化30%
                            color: rgba(28, 28, 28, 0.30);
                        }
                    }
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
    .mini-program-achievement {
        background-color: #000000;

        // 总进度条
        .total-progress {
            background-color: #ffd797;

            .progress-info {
                .progress-left {
                    .progress-info-item {
                        color: #24292E;
                    }
                }

                .progress-right {
                    color: #24292E;
                }
            }

            .progress-bar {
                .progress-fill {
                    background-color: #24292E;
                }
            }

        }

        .m-filter {
            .u-filter-item {
                color: rgba(255, 255, 255, 0.40);
            }
        }

        // 进度概览
        .progress-overview {

            // 分类进度卡片
            .category-progress {
                .progress-card {
                    background-color: #282828;

                    .u-top {
                        .u-info {
                            color: rgba(255, 255, 255, 0.8)
                        }
                    }

                    &.completed {
                        .u-top {
                            .u-info {
                                //颜色虚化30%
                                color: rgba(255, 255, 255, 0.30);
                            }
                        }
                    }
                }
            }
        }
    }
}

.not-on-bottom {
    &::after {
        bottom: 60px !important;
    }
}
</style>
