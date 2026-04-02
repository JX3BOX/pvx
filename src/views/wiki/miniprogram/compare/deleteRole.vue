<!-- 删除对比角色 -->
<template>
    <el-drawer :model-value="visible" direction="btt" size="auto" @close="handleClose" class="c-role-delete-drawer">
        <!-- 第一步删除提示 -->
        <div class="m-delete-role_first" v-if="role && step == 1">
            <RoleAvatar class="u-avatar-img" :mount="role.mount" :body_type="role.body_type" />
            <div class="m-avatar-info">
                <div class="u-avatar-name">{{ role.name }}</div>
                <div class="u-avatar-server">
                    <!-- <img width="13" height="13" :src="mpAvatar" class="hb-icon" svg-inline> -->
                    {{ xfName }} · {{ role.server }}
                </div>
            </div>
            <div class="u-first-btn" @click="step = 2">
                删除角色
            </div>
        </div>
        <!-- 第二步确认 -->
        <div class="m-delete-role_second" v-if="step == 2">
            <img width="90" :src="require(`@/assets/img/wiki_miniprogram/warning.svg`)" class="u-warning-icon">
            <div class="u-tips">即将从对比中删除</div>
            <div class="u-role-info">{{ role.name }}@{{ role.server }}</div>
            <div class="u-btns">
                <div class="u-btn-item" @click="handleClose">取消</div>
                <div class="u-btn-item" @click="handleDelete">确定</div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
import schoolid from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { __cdn } from "@/utils/config";
import RoleAvatar from "@/components/wiki/RoleAvatar.vue";
export default {
    components: {
        RoleAvatar,
    },
    props: {
        role: {
            type: Object,
            default: () => { },
        },
        visible: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        xfName() {
            if (this.role.mount) {
                return schoolid[this.role.mount] || '';
            }
            return "";
        },
        mpAvatar() {
            if (this.role.mount) {
                return __cdn + `design/vector/school/${this.role.mount}.svg`;
            }
            return null;
        },
    },
    data() {
        return {
            step: 1,
        };
    },
    created() { },
    mounted() { },
    methods: {
        /**
         * 关闭抽屉
         */
        handleClose() {
            this.step = 1;
            this.$emit("update:visible", false);
        },
        handleDelete() {
            this.handleClose()
            this.$emit("deleteRole", this.role);
        }
    },
};
</script>

<style lang="less">
.c-role-delete-drawer {
    border-radius: 20px 20px 0 0;
    background: #24292e;

    .el-drawer__header {
        margin-bottom: 0;
        color: #72767b;
    }

    .el-drawer__body {
        padding: 0;
    }

    // 第一步删除提示
    .m-delete-role_first {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        padding: 0 12px 24px 12px;
        box-sizing: border-box;

        .u-avatar-img {
            width: 120px;
            height: 120px;
            margin-bottom: 20px;
        }

        .m-avatar-info {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;

            .u-avatar-name {
                color: #FEDAA3;
                font-size: 18px;
                font-style: normal;
                font-weight: 700;
                line-height: 28px;
                margin-bottom: 12px;
            }

            .u-avatar-server {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                color: rgba(255, 255, 255, 0.40);
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: 20px;
            }
        }

        .u-first-btn {
            width: 100%;
            padding: 12px 0;
            box-sizing: border-box;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.10);
            color: rgba(255, 255, 255, 0.40);
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 24px;
            text-align: center;
            margin-top: 14px;
        }
    }

    // 第二步确认
    .m-delete-role_second {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        padding: 0 12px 24px 12px;
        box-sizing: border-box;

        .u-warning-icon {
            margin-bottom: 20px;
        }

        .u-tips {
            color: rgba(255, 255, 255, 0.40);
            text-align: center;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 24px;
        }

        .u-role-info {
            margin-top: 20px;
            color: #FEDAA3;
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 24px;
        }

        .u-btns {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-top: 20px;
            width: 100%;

            .u-btn-item {
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.10);
                width: calc(50% - 10px);
                padding: 12px 16px;
                color: rgba(255, 255, 255, 0.40);
                font-size: 16px;
                font-style: normal;
                font-weight: 700;
                line-height: 24px;
                text-align: center;
            }
        }
    }

}
</style>
