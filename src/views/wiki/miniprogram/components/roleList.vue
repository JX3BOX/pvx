<template>
    <el-drawer title="选择角色" :model-value="drawerVisible" direction="btt" size="420px" @close="handleClose"
        class="c-role-list-drawer">
        <div class="role-list-wrapper">
            <div class="role-list-container" ref="roleListContainer">
                <!-- 角色列表 -->
                <div class="role-items">
                    <div class="role-item" v-for="(role, index) in roles" :key="index" @click="selectRole(role)"
                        :class="{ selected: selectedRole.jx3id == role.jx3id }">
                        <div class="u-img">
                            <RoleAvatar class="u-avatar-img" :mount="role.mount" :body_type="role.body_type" />
                            <div class="role-name">{{ role.name }}</div>
                        </div>
                        <div class="role-info" v-html="`<${role.server}>`"></div>
                    </div>
                </div>
            </div>
            <!-- 底部按钮 -->
            <div class="role-button-group">
                <el-button @click="resetSelection" class="u-reset">重置</el-button>
                <el-button @click="confirmSelection" class="u-submit">确定</el-button>
            </div>
            <!-- 遮罩层 -->
            <div class="bottom-mask" v-if="showMask"></div>
        </div>
    </el-drawer>
</template>

<script>
/**
 * 角色选择组件
 */
import { showSchoolIcon, iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
export default {
    name: "RoleList",
    components: {
        RoleAvatar,
    },
    // 组件属性
    props: {
        /**
         * 控制抽屉是否可见
         */
        visible: {
            type: Boolean,
            default: false,
        },
        /**
         * 角色列表数据
         */
        roles: {
            type: Array,
            default: () => [],
        },
        currentRole: {
            type: Object,
            default: () => ({}),
        },
    },
    // 计算属性
    computed: {
        /**
         * 双向绑定抽屉可见状态
         */
        drawerVisible: {
            get() {
                return this.visible;
            },
            set(val) {
                this.$emit("update:visible", val);
            },
        },
    },
    // 数据定义
    data() {
        return {
            // 选中的角色
            selectedRole: null,
            // 遮罩层显示状态
            showMask: false,
        };
    },
    // 监听属性变化
    watch: {
        /**
         * 监听抽屉可见状态变化
         */
        drawerVisible(newVal) {
            if (newVal) {
                // 抽屉打开后，在下一个DOM更新周期获取元素并添加事件监听
                this.$nextTick(() => {
                    if (this.$refs.roleListContainer) {
                        this.$refs.roleListContainer.addEventListener("scroll", this.checkScrollPosition);
                        // 初始化时检查一次
                        this.checkScrollPosition();
                    }
                });
            } else {
                // 抽屉关闭时移除事件监听
                this.removeScrollListener();
            }
        },
        currentRole: {
            handler(newVal) {
                if (newVal) {
                    this.selectedRole = newVal;
                }
            },
            deep: true,
            immediate: true,
        },
    },
    beforeUnmount() {
        // 组件销毁前移除事件监听
        this.removeScrollListener();
    },
    // 方法定义
    methods: {
        showSchoolIcon,
        /**
         * 移除滚动事件监听
         */
        removeScrollListener() {
            if (this.$refs.roleListContainer) {
                this.$refs.roleListContainer.removeEventListener("scroll", this.checkScrollPosition);
            }
        },
        /**
         * 选择角色
         * @param {object} role - 角色对象
         */
        selectRole(role) {
            this.selectedRole = role;
        },

        /**
         * 重置选择
         */
        resetSelection() {
            this.selectedRole = this.currentRole;
        },

        /**
         * 确认选择
         */
        confirmSelection() {
            if (this.selectedRole !== null) {
                this.$emit("confirmSelection", this.selectedRole);
                this.drawerVisible = false;
            }
        },

        /**
         * 处理抽屉关闭
         */
        handleClose() {
            this.drawerVisible = false;
        },
        /**
         * 检查滚动位置，控制遮罩层显示
         */
        checkScrollPosition() {
            if (this.$refs.roleListContainer) {
                const container = this.$refs.roleListContainer;
                const scrollHeight = container.scrollHeight;
                const clientHeight = container.clientHeight;
                const scrollTop = container.scrollTop;
                const distanceToBottom = scrollHeight - (clientHeight + scrollTop);
                // 距离底部大于40px时显示遮罩层
                this.showMask = distanceToBottom > 40;
            }
        },
    },
};
</script>

<style lang="less">
.c-role-list-drawer {
    border-radius: 20px 20px 0 0;
    background: #24292e;

    .el-drawer__header {
        margin-bottom: 0;
        color: #72767b;
    }

    .el-drawer__body {
        padding: 0;
    }

    .role-list-wrapper {
        width: 100%;
        height: 100%;
    }

    .role-list-container {
        padding: 20px 20px 0 20px;
        box-sizing: border-box;
        height: 300px;
        overflow-y: auto;

        // 角色列表样式
        .role-items {
            .role-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px;
                margin-bottom: 12px;
                transition: all 0.3s ease;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);

                &.selected {
                    border: 4px solid #fedaa3;
                }

                .u-img {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;

                    .u-avatar-img {
                        width: 48px;
                        height: 48px;
                    }

                    .role-name {
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 16px;
                        font-weight: 700;
                        line-height: 24px;
                    }
                }

                // 角色信息样式
                .role-info {
                    color: rgba(255, 255, 255, 0.8);
                    text-align: center;
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 18px;
                }
            }
        }
    }

    // 底部按钮样式
    .role-button-group {
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

    // 底部遮罩层样式
    .bottom-mask {
        position: fixed;
        bottom: 72px;
        left: 0;
        width: 100%;
        height: 76px;
        background: linear-gradient(180deg, rgba(36, 41, 46, 0) 0%, #24292e 73.94%);
    }
}
</style>
