<template>
    <el-drawer :title="title" :model-value="drawerVisible" direction="btt" size="420px" @close="handleClose"
        class="c-role-list-drawer">
        <div class="role-list-wrapper">
            <div class="role-list-container" ref="roleListContainer">
                <!-- 初始角色类型 -->
                <div class="role-items" v-if="currentStep == 1">
                    <div class="role-item" @click="selectRoleType(role)" v-for="(role, index) in step1Options"
                        :key="index" :class="{ selected: selectCurrentStep == role.value }">
                        <div class="u-img">
                            <div class="role-name">{{ role.name }}</div>
                        </div>
                        <div class="role-info" v-html="`<${role.info}>`"></div>
                    </div>
                </div>
                <!-- 我的角色列表/亲友角色列表 -->
                <div class="role-items" v-if="currentStep == 2 || currentStep == 4">
                    <div class="role-item" v-for="(role, index) in roles" :key="index" @click="selectRole(role)"
                        :class="{ selected: selectedRole && selectedRole.jx3id == role.jx3id }">
                        <div class="u-img">
                            <RoleAvatar class="u-avatar-img" :mount="role.mount" :body_type="role.body_type" />
                            <div class="role-name">{{ role.name }}</div>
                        </div>
                        <div class="role-info" v-html="`<${role.server}>`"></div>
                    </div>
                </div>
                <!-- 亲友列表 -->
                <div class="role-items" v-if="currentStep == 3">
                    <div class="role-item" v-for="(friend, index) in friends" :key="index" @click="selectFriend(friend)"
                        :class="{ selected: selectedFriend && selectedFriend.kith_id == friend.kith_id }">
                        <div class="u-img">
                            <div class="role-name">{{ friend.kith_info?.display_name }}</div>
                        </div>
                        <div class="role-info" v-html="`<${'亲友UID' + friend.kith_id}>`"></div>
                    </div>
                </div>
            </div>
            <!-- 底部按钮 -->
            <div class="role-button-group">
                <div @click="resetSelection" class="u-reset">重置</div>
                <div @click="confirmSelection" class="u-submit">确定</div>
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
import { getUserRolesList } from "@/utils/wiki_miniprogram";
import { getMyKith, getMyKithRoles } from "@/service/wiki";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
export default {
    name: "AddFriend",
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
        /**
         * 抽屉标题
         */
        title() {
            return this.currentStep == 1 ? "选择角色" : this.currentStep == 2 ? "我的角色" : "亲友的角色";
        },
    },
    // 数据定义
    data() {
        return {
            //状态顺序 1，选择角色 2 我的角色 3 亲友列表 4 亲友角色列表
            currentStep: 1,
            selectCurrentStep: 1,
            step1Options: [
                {
                    name: "我的角色",
                    value: 2,
                    info: "从我的角色里面进行选择",
                },
                {
                    name: "亲友的角色",
                    value: 3,
                    info: "从亲友的角色里面进行选择",
                },
            ],
            // 角色列表数据
            roles: [],
            // 我的亲友数据
            friends: [],
            //选中亲友
            selectedFriend: null,
            // 亲友角色列表数据
            friendRoles: [],
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
            this.currentStep = 1;
            this.selectCurrentStep = 1;
            this.selectedRole = null;
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
    },
    beforeUnmount() {
        // 组件销毁前移除事件监听
        this.removeScrollListener();
    },
    created() { },
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
         * 选择角色类型
         * @param {object} role - 角色类型对象
         */
        selectRoleType(role) {
            this.selectCurrentStep = role.value;
        },
        /**
         * 获取自己的角色
         */
        async getSelfRoles() {
            // 从sessionStorage获取自己的角色列表，使用try catch处理异常
            try {
                // 从sessionStorage获取自己的角色列表
                let roles = JSON.parse(sessionStorage.getItem("wiki_my_roles")) || [];
                if (roles.length === 0) {
                    this.roles = await getUserRolesList();
                } else {
                    this.roles = roles;
                }
            } catch (error) {
                console.error("获取自己的角色列表失败:", error);
                this.roles = await getUserRolesList();
            }
        },

        /**
         * 获取我的亲友
         */
        getMyFriends() {
            getMyKith().then((res) => {
                this.friends = res.data.data;
            });
        },
        /**
         * 选择亲友
         * @param {object} friend - 亲友对象
         */
        selectFriend(friend) {
            this.selectedFriend = friend;
        },
        /**
         * 获取选择的亲友角色
         */
        getSelectedFriendRole() {
            getMyKithRoles(this.selectedFriend.kith_id).then((res) => {
                if (res.data.data.length === 0) {
                    this.$message("该亲友暂无同步游戏角色");
                    return;
                }
                this.currentStep = 2;
                this.roles = res.data.data;
            });
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
            switch (this.currentStep) {
                case 1:
                    if (this.selectCurrentStep === 1) {
                        this.$message("请先选择一个角色类型");
                        return;
                    }
                    if (this.selectCurrentStep === 2) {
                        this.getSelfRoles();
                    } else if (this.selectCurrentStep === 3) {
                        this.getMyFriends();
                    }
                    this.currentStep = this.selectCurrentStep;
                    break;
                case 2:
                    if (this.selectedRole !== null) {
                        this.$emit("confirmSelection", this.selectedRole);
                        this.drawerVisible = false;
                    }
                    break;
                case 3:
                    this.getSelectedFriendRole();

                    break;
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
        padding: 12px 20px 16px 20px;
        display: flex;
        justify-content: flex-end;
        gap: 20px;
        box-sizing: border-box;

        .u-reset,
        .u-submit {
            display: flex;
            padding: 12px 16px;
            justify-content: center;
            align-items: center;
            border-radius: 12px;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 24px;
        }

        .u-reset {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.4);
        }

        .u-submit {
            flex: 1;
            background: #fedaa3;
            color: #24292e;
            /* 150% */
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
