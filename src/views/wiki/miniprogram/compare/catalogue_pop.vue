<!-- 二级目录弹窗 -->
<template>
    <el-drawer :model-value="visible" direction="btt" size="auto" @close="handleClose" class="c-catalogue-pop"
        @closed="handleClosed">
        <template #title>
            <div class="u-category-title" v-if="visible">
                <img :src="getIconPath(category.sub)" class="u-category-icon-img" />
                <span class="u-category-name">{{ category.name }}</span>
            </div>
        </template>
        <div class="m-info-top" ref="infoTop" v-if="visible">
            <!-- 头像列表 -->
            <div class="m-avatar-list">
                <div class="m-avatar-item">
                    <div class="u-avatar-placeholder">
                        <!-- <img :src="getIconPath(category.sub)" class="u-category-icon-img" /> -->
                    </div>
                    <div class="m-avatar-info">
                        <!-- <div class="u-avatar-name">{{ category.name }}</div> -->
                    </div>
                </div>
                <div class="m-avatar-item" v-for="item in compareRoles" :key="item.jx3id">
                    <RoleAvatar class="u-avatar-img" :mount="item.mount" :body_type="item.body_type" />
                    <div class="m-avatar-info">
                        <div class="u-avatar-name">{{ item.name }}</div>
                        <div class="u-avatar-server">{{ item.server }}</div>
                    </div>
                </div>

                <!-- 添加占位符 -->
                <div class="m-avatar-item m-avatar-item--add" v-for="index in 3 - compareRoles.length" :key="index">
                </div>
            </div>

            <!-- 总进度、资历等信息-->

            <div class="m-progress-section m-progress-section--total">
                <div class="u-progress-label">总进度</div>
                <div class="m-progress-value" v-for="(role, roleIndex) in category.roleAchievements || []"
                    :key="roleIndex">
                    <div class="u-value-text">{{ role.progress }}</div>
                    <div class="u-percent-symbol">%</div>
                </div>
            </div>

            <!-- 成就数信息 -->
            <div class="m-progress-section m-progress-section--achievement">
                <div class="u-progress-label">成就数</div>
                <div class="m-progress-value" v-for="(role, roleIndex) in category.roleAchievements || []"
                    :key="roleIndex">
                    <span class="u-value-text">{{ role?.ownAchievements?.length || role.achievementCount || 0 }}</span>
                </div>

            </div>

            <!-- 总资历信息 -->
            <div class="m-progress-section m-progress-section--seniority">
                <div class="u-progress-label">总资历</div>
                <div class="m-progress-value" v-for="(role, roleIndex) in category.roleAchievements || []"
                    :key="roleIndex">
                    <!-- 截取数字万字位以上内容 -->
                    <span class="u-value-text w">{{ setNumber(role.ownPoints, 'w') }}</span>
                    <!-- 截取数字万字位以下内容 -->
                    <span class="u-value-text">{{ setNumber(role.ownPoints) }}</span>
                </div>
            </div>
            <div class="u-btn" @click="handleDetailClick" v-if="showDetailBtn">
                查看详情
            </div>
        </div>
    </el-drawer>
</template>

<script>
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
export default {
    components: {
        RoleAvatar,
    },
    props: {
        category: {
            type: Object,
            default: () => ({}),
        },
        compareRoles: {
            type: Array,
            default: () => [],
        },
        visible: {
            type: Boolean,
            default: false,
        },
        //是否显示查看详情按钮
        showDetailBtn: {
            type: Boolean,
            default: true,
        },
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
    data() {
        return {
            title: '',
            list: [],
            isDetailClick: false,
        };
    },
    created() { },
    mounted() { },
    methods: {
        /**
         * 关闭抽屉
         */
        handleClose() {
            this.$emit("update:visible", false);
        },
        /**
         * 获取图标路径
         * @param {string} sub - 分类子项
         * @returns {string} - 图标路径
         */
        getIconPath(sub) {
            if (!sub) return ''
            return require(`@/assets/img/wiki_miniprogram/Dark/tog_${sub}.svg`);
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
        handleDetailClick() {
            this.isDetailClick = true;
            this.handleClose();
        },
        handleClosed() {
            if (this.isDetailClick) {
                this.$emit("handleDetailClick");
            }
        },
    },
};
</script>

<style lang="less">
.c-catalogue-pop {

    .m-info-top {
        padding: 0 12px 24px 12px;
    }

    border-radius: 20px 20px 0 0;
    background: #24292E;

    .el-drawer__header {
        margin-bottom: 0;
        color: #72767b;
    }

    .el-drawer__body {
        padding: 0;
    }

    .u-category-title {
        width: calc(100% - 20px);
        display: flex;
        align-items: center;

        gap: 4px;

        .u-category-icon-img {
            width: 24px;
            height: 24px;
        }

        .u-category-name {
            color: #FEDAA3;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 24px;
        }
    }

    // 头像列表
    .m-avatar-list {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;

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
                margin-bottom: 8px;
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
        padding: 16px 12px;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .u-progress-label,
        .m-progress-value {
            width: calc(100% / 4 - 8px);
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
            padding: 4px 8px;
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
        padding: 4px 12px;
    }

    //总资历
    .m-progress-section--seniority {
        padding: 4px 12px;

        .u-value-text {
            font-size: 12px;

            &.w {
                font-size: 14px;
            }
        }
    }

    .u-btn {
        width: 100%;
        padding: 12px 0;
        box-sizing: border-box;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.10);
        color: #fff;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 24px;
        text-align: center;
        margin-top: 14px;
    }
}
</style>
