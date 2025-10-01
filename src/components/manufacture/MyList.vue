<template>
    <div class="m-myList">
        <div class="m-manufacture-title m-manufacture-title-plans">
            <span class="u-title">我的账单</span>
            <el-checkbox v-model="selectMode" label="选择模式" border></el-checkbox>
            <el-dropdown trigger="click" @command="handleCommand">
                <el-button class="u-del" plain type="info" size="mini" icon="el-icon-setting"> </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="cancel-select">取消选中</el-dropdown-item>
                    <el-dropdown-item command="select-all">全部选中</el-dropdown-item>
                    <el-dropdown-item command="select-yesterday">选中昨日及以前所有账单</el-dropdown-item>
                    <el-dropdown-item command="delete-select">删除选中账单</el-dropdown-item>
                    <el-dropdown-item command="merge-select">合并选中账单</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <div class="m-box">
            <template v-if="isLogin">
                <div class="m-item" v-for="(item, i) in list" :key="i" @click="change(item.id)">
                    <div class="u-title">
                        <span>{{ item.title }}</span>
                        <div
                            class="u-meta"
                            @click.stop="item.time_type = item.time_type == 'created' ? 'updated' : 'created'"
                        >
                            <template v-if="item.time_type == 'created'">
                                创建于 {{ showTime(new Date(item.created * 1000)) }}
                            </template>
                            <template v-else> 编辑于 {{ showTime(new Date(item.updated * 1000)) }} </template>
                        </div>
                    </div>
                    <template v-if="selectMode">
                        <el-checkbox :value="selected.includes(item.id)" @change="change(item.id)"></el-checkbox>
                    </template>
                </div>
            </template>
            <span class="m-null" v-else>- 请登录后查看 -</span>
        </div>
    </div>
</template>

<script>
import { getPlan, getPlans, batchDeletePlan, getPlansByIds } from "@/service/manufacture/plan";
import { __Root } from "@/utils/config";
import User from "@jx3box/jx3box-common/js/user";
import { showTime } from "@/utils/moment";

export default {
    name: "MyList",
    data: function () {
        return {
            list: [],
            isLogin: User.isLogin(),
            planId: "",
            visible: false,

            loading: false,
            selectMode: false,
            selected: [],
        };
    },
    methods: {
        showTime,
        load() {
            if (!this.isLogin) return;
            getPlans({ no_page: 1 }).then((res) => {
                this.list =
                    res.reverse().map((item) => ({
                        ...item,
                        time_type: "created",
                    })) || [];
            });
        },
        change(id) {
            if (this.selectMode) {
                if (this.selected.includes(id)) {
                    this.selected = this.selected.filter((item) => item != id);
                } else {
                    this.selected.push(id);
                }

                return;
            }
            if (this.loading) return;
            this.loading = true;
            getPlan(id)
                .then((res) => {
                    this.$emit("view-plan", res);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        handleCommand(command) {
            if (command == "cancel-select") {
                this.selected = [];
            } else if (command == "select-all") {
                this.selected = this.list.map((item) => item.id);
            } else if (command == "select-yesterday") {
                this.selected = [
                    ...this.selected,
                    ...this.list
                        .filter((item) => new Date(item.created * 1000).getTime() < new Date().setHours(0, 0, 0, 0))
                        .map((item) => item.id),
                ];
            } else if (command == "delete-select") {
                if (!this.selected.length) {
                    return this.$message.error("请先选择要删除的账单");
                }
                this.$confirm(`确定要删除选中的 ${this.selected.length} 条账单记录？删除后不可恢复！`, "确认", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                })
                    .then(() => {
                        batchDeletePlan(this.selected.join(",")).then(() => {
                            this.load();
                        });
                    })
                    .catch(() => {});
            } else if (command == "merge-select") {
                if (!this.selected.length) {
                    return this.$message.error("请先选择要合并的账单");
                }
                this.$confirm(`确定要将选中的 ${this.selected.length} 条账单记录合并为一条新账单？`, "确认", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                })
                    .then(() => {
                        getPlansByIds(this.selected.join(",")).then((list) => {
                            const relation = list.map((item) => item.relation).flat();
                            this.$emit("merge-plan", relation);
                            this.$notify({
                                title: "选中的账单内容已加入当前成本计算器，若有需要请手动删除选中的账单。",
                                type: "success",
                            });
                        });
                    })
                    .catch(() => {});
            }
        },
    },
    mounted() {
        this.load();
    },
};
</script>

<style lang="less">
.m-myList {
    .w(100%);
    min-width: 300px;
    max-width: 420px;
    .m-box {
        .flex;
        .pr(10px);
        .fz(14px);
        flex-direction: column;
        gap: 20px;
        overflow: auto;
        min-height: 700px;
        max-height: calc(100vh - 260px);

        .m-item {
            .flex;
            align-items: center;
            .pointer;
            .color( #24292e,#07ad36);
            .lh(30px);
            .r(10px);
            padding: 0 20px;
            background: #fff;

            .u-title {
                .db;
                .nobreak;
                flex-grow: 1;
                .mr(10px);
                display: flex;
                flex-direction: column;

                .u-meta {
                    display: inline;
                    .fz(10px, 10px);
                    .mb(6px);
                    .color(#999);
                    .pointer;
                    width: fit-content;
                }
            }
        }
        .m-null {
            .x;
            .r(10px);
            color: #999;
            background: #fff;
            line-height: 200px;
        }
    }
}
</style>
