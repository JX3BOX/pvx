<template>
    <div class="mini-program-catalogue">
        <!-- 总进度条 -->
        <div class="total-progress">
            <div class="progress-info">
                <!-- 左右布局 -->
                <div class="progress-left">
                    <img :src="getIconPath(info.sub)" alt="" class="hb-icon" svg-inline>
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

        <!-- 进度概览 -->
        <div class="progress-overview">
            <!-- 分类进度卡片 -->
            <div class="category-progress">
                <div class="progress-card" v-for="(category, index) in list" :key="index"
                    @click="handleClick(category)">

                    <div class="u-top-detailed">
                        <div class="u-name">{{ category.name }}</div>
                        <div class="u-info">
                            <div class="u-num">
                                {{ category?.ownAchievements?.length || 0 }}/{{ category.allAchievements?.length || 0 }}
                                <img width="14" height="14"
                                    :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/count.svg`)"
                                    alt="成就logo" />
                            </div>
                            <div class="u-num">
                                {{ category.ownPoints }}/{{ category.allPoints }}
                                <img width="14" height="14"
                                    :src="require(`@/assets/img/wiki_miniprogram/${isDark ? 'Dark' : 'Light'}/sum.svg`)"
                                    alt="资历logo" />
                            </div>
                        </div>
                    </div>
                    <div class="progress-bar-small">
                        <div class="progress-fill"
                            :style="{ width: getCurrentProgress(category.ownPoints, category.allPoints) + '%' }"></div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>
<script>
/**
 * 小程序概览组件
 * 展示用户信息、总进度和分类进度概览
 */
import { getRoleGameAchievementsList, getMenuAndPoints, getAchievementsFinishStatus } from "@/utils/wiki_miniprogram";
import { showSchoolIcon, } from "@jx3box/jx3box-common/js/utils";
import { __imgPath } from "@/utils/config";
import { mobileOpen } from "@/utils/minprogram";
export default {
    name: "CatalogueMiniProgram",
    components: {},
    // 数据定义
    data() {
        return {
            //我完成的成就
            finishedAchievements: [],
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
            info: {}
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
        showSchoolIcon,
        async getListInit() {
            //获取分类sub，根据sub获取分类数据
            const menuId = this.$route.query.menuId;
            //初始化菜单及成就点列表
            let menuAndPoints = await getMenuAndPoints(this.$store.state.client);
            let menuList = menuAndPoints.menuList || [];
            this.pointsData = menuAndPoints.pointsList || [];
            //从menuList中根据sub获取分类数据，menuInfo为对象
            Object.keys(menuList).forEach((key) => {
                let item = menuList[key];
                if (item.sub == menuId) {
                    this.info = item;
                    document.title = item.name;
                }
            })
            let jx3id = this.$route.query.jx3id;
            let achievements = await getRoleGameAchievementsList(jx3id);
            this.finishedAchievements = achievements.list || [];
            this.getRenderList();
        },

        /**************************角色相关*****************************/

        /**
         * 处理分类点击
         * @param {object} menu - 分类项
         */
        handleClick(menu) {
            // 小程序打开界面
            mobileOpen(this.$router.resolve({
                name: "list",
                query: {
                    menuId: menu.sub,
                    detail: menu.detail,
                    jx3id: this.$route.query.jx3id,
                }
            }).href);
        },
        /**
         * 获取图标路径
         * @param {string} sub - 分类子项
         * @returns {string} - 图标路径
         */
        getIconPath(sub) {
            if (!sub) return "";

            return require(`@/assets/img/wiki_miniprogram/${!this.isDark ? 'Dark' : 'Light'}/tog_${sub}.svg`);
        },
        getRenderList() {
            let menu = this.info.children || [], finishedAchievements = this.finishedAchievements || [];
            const list = menu.map((item) => {
                const allData = getAchievementsFinishStatus(item, finishedAchievements);
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
            this.calculateStatistics(list);
            this.formatPointsDisplay();
        },
        calculateStatistics(list) {
            const statistics = list.reduce((acc, cur) => {
                acc.allPointsCount += cur.allPoints || 0;
                acc.ownPointsCount += cur.ownPoints || 0;
                acc.categoryCount += cur.allAchievements?.length || 0;
                acc.finishedCategoryCount += cur.ownAchievements?.length || 0;
                return acc;
            }, { allPointsCount: 0, ownPointsCount: 0, categoryCount: 0, finishedCategoryCount: 0 });

            this.allPointsCount = statistics.allPointsCount;
            this.ownPointsCount = statistics.ownPointsCount;
            this.categoryCount = statistics.categoryCount;
            this.finishedCategoryCount = statistics.finishedCategoryCount;
        },
        formatPointsDisplay() {
            const pointsStr = this.ownPointsCount.toString();
            if (pointsStr.length > 4) {
                this.ownPointsCountW = pointsStr.slice(0, -4);
                this.ownPointsCountOther = pointsStr.slice(-4);
            } else {
                this.ownPointsCountW = '';
                this.ownPointsCountOther = pointsStr;
            }
        },
        getCurrentProgress(own, all) {
            if (!own && !all) return 0;
            return ((own / all) * 100).toFixed(2);
        },
    }
}
</script>
<style lang="less">
/**
 * 小程序目录组件样式
 */
.mini-program-catalogue {
    height: 100vh;
    background-color: #F5F5F5;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;

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

            .progress-left {
                display: flex;
                align-items: center;
                gap: 4px;

                .hb-icon {
                    width: 44px;
                    height: 44px;
                }

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

    // 进度概览
    .progress-overview {

        // 分类进度卡片
        .category-progress {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;

            .progress-card {
                padding: 12px;
                background-color: #ffffff;
                width: calc(50% - 5px);
                flex-shrink: 0;
                box-sizing: border-box;
                border-radius: 8px;

                .u-top {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;

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
                        text-align: right;

                        .card-title {
                            font-size: 14px;
                            line-height: 20px;

                        }

                        .progress-percentage-small {
                            font-size: 12px;
                            line-height: 18px;
                        }
                    }
                }

                .u-top-detailed {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    color: rgba(28, 28, 28, 0.80);
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
                        text-align: right;

                        .u-num {
                            width: 100%;
                            display: flex;
                            justify-content: flex-end;
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

                    .progress-fill {
                        height: 100%;
                        background-color: rgba(28, 28, 28, 0.8);
                        border-radius: 4px;
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
    .mini-program-catalogue {
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

        // 进度概览
        .progress-overview {

            // 分类进度卡片
            .category-progress {
                .progress-card {
                    background-color: #282828;

                    .card-title {
                        color: rgba(255, 255, 255, 0.80);
                    }

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
