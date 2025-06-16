<template>
    <div class="m-pvx-admin-drop" v-if="showAdmin">
        <el-dropdown trigger="click" @command="handleCommand">
            <el-button type="primary" class="c-admin-button c-admin-drop__button" size="medium"
                ><i class="el-icon-setting"></i> 管理<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-refresh" command="pictureTask">
                    <span>刷图</span>
                </el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script>
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { refreshQQBotImage } from "@/service/pvx";
export default {
    data() {
        return {};
    },
    computed: {
        showAdmin() {
            return !isMiniProgram() && User.isAdmin();
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
}
</style>
