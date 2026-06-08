<template>
    <div class="m-pvx-admin-drop" v-if="showAdmin">
        <el-dropdown trigger="click" @command="handleCommand">
            <el-button type="primary" class="c-admin-button c-admin-drop__button">
                <span class="c-admin-drop__button-inner">
                    <i class="el-icon-setting"></i>
                    <span>管理</span>
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="pictureTask">
                        <span class="c-admin-drop__item">
                            <el-icon><Refresh /></el-icon>
                            <span>刷图</span>
                        </span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script>
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { refreshQQBotImage } from "@/service/pvx";
export default {
    data() {
        return {};
    },
    computed: {
        showAdmin() {
            return !(isMiniProgram() || isApp()) && User.isAdmin();
        },
    },
    methods: {
        handleCommand(command) {
            this[command]();
        },
        pictureTask() {
            const pathname = location.pathname;
            const pattern = /\/([^/]+)\/([\d_]+)/;
            const match = pathname.match(pattern);
            let task_type = "";
            let task_target_id = "";
            if (match) {
                task_type = match[1];
                task_target_id = match[2];
            }
            if (task_type === "horse" && new URLSearchParams(location.search).get("type") === "2") {
                task_target_id = `${task_target_id}_2`;
            }
            if (task_type && task_target_id) {
                refreshQQBotImage({
                    task_type,
                    task_target_id,
                }).then((res) => {
                    if (!res.data.code) {
                        this.$message.success("QQ机器人图片生成提交成功");
                    }
                });
            } else {
                this.$message.error("参数不正确");
            }
        },
    },
};
</script>
<style lang="less">
.m-pvx-admin-drop {
    .flex;
    align-items: center;
    .el-icon-setting {
        margin-right: 0;
    }
}

.c-admin-drop__button-inner,
.c-admin-drop__item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    line-height: 1;

    i,
    .el-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

    .el-icon--right {
        margin-left: 0;
    }
}
</style>
