<template>
    <div class="m-myList">
        <div class="m-manufacture-title m-manufacture-title-plans">
            <span class="u-title">{{ $t("pages.pvg.manufacture.ui.cart.plans") }}</span>
            <span class="u-op">
                <el-checkbox
                    v-model="selectMode"
                    @change="onSelectModeChange"
                >
                    {{ $t("pages.pvg.manufacture.ui.plans.batchSelect") }}
                </el-checkbox>
                <span v-if="selectMode" class="u-selected-count">
                    {{ $t("pages.pvg.manufacture.ui.plans.selectedCount", { count: selected.length }) }}
                </span>
                <el-dropdown
                    trigger="click"
                    :disabled="!isLogin || !list.length || listLoading"
                    @command="handleCommand"
                >
                    <el-button
                        class="u-plan-settings"
                        plain
                        size="small"
                        link
                        :aria-label="$t('pages.pvg.manufacture.ui.plans.actions')"
                    >
                        <el-icon class="u-del"><Setting /></el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="cancel-select" :disabled="!selected.length">
                                {{ $t("pages.pvg.manufacture.ui.plans.cancelSelection") }}
                            </el-dropdown-item>
                            <el-dropdown-item command="select-all" :disabled="selected.length === list.length">
                                {{ $t("pages.pvg.manufacture.ui.plans.selectAll") }}
                            </el-dropdown-item>
                            <el-dropdown-item command="select-yesterday" :disabled="!hasHistoricalPlans">
                                {{ $t("pages.pvg.manufacture.ui.plans.selectHistorical") }}
                            </el-dropdown-item>
                            <el-dropdown-item command="delete-select" :disabled="!selected.length" divided>
                                {{ $t("pages.pvg.manufacture.ui.plans.deleteSelected") }}
                            </el-dropdown-item>
                            <el-dropdown-item command="merge-select" :disabled="!selected.length">
                                {{ $t("pages.pvg.manufacture.ui.plans.mergeSelected") }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-button
                    v-if="drawerMode"
                    class="u-drawer-close"
                    plain
                    circle
                    :aria-label="$t('pages.pvg.manufacture.ui.actions.close')"
                    @click="$emit('close')"
                >
                    <el-icon><Close /></el-icon>
                </el-button>
            </span>
        </div>
        <div class="m-box" v-loading="listLoading || loading">
            <template v-if="isLogin && list.length">
                <div
                    class="m-item"
                    v-for="item in list"
                    :key="item.id"
                    :class="{ 'is-selected': selected.includes(item.id) }"
                    @click="change(item.id)"
                >
                    <div class="u-title">
                        <span>{{ item.title }}</span>
                        <div
                            class="u-meta"
                            @click.stop="item.time_type = item.time_type == 'created' ? 'updated' : 'created'"
                        >
                            <template v-if="item.time_type == 'created'">
                                {{ $t("pages.pvg.manufacture.ui.plans.createdAt") }}
                                {{ showTime(new Date(item.created * 1000)) }}
                            </template>
                            <template v-else>
                                {{ $t("pages.pvg.manufacture.ui.plans.updatedAt") }}
                                {{ showTime(new Date(item.updated * 1000)) }}
                            </template>
                        </div>
                    </div>
                    <template v-if="selectMode">
                        <el-checkbox
                            :model-value="selected.includes(item.id)"
                            :aria-label="item.title"
                            @click.stop
                            @change="toggleSelection(item.id)"
                        />
                    </template>
                </div>
            </template>
            <span class="m-null" v-else-if="isLogin">{{ $t("pages.pvg.manufacture.ui.empty.plans") }}</span>
            <span class="m-null" v-else>{{ $t("pages.pvg.manufacture.ui.empty.login") }}</span>
        </div>
    </div>
</template>

<script>
import { getPlan, getPlans, batchDeletePlan, getPlansByIds } from "@/service/manufacture/plan";
import User from "@jx3box/jx3box-common/js/user";
import { showTime } from "@/utils/moment";

export default {
    name: "MyList",
    props: {
        drawerMode: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            list: [],
            isLogin: User.isLogin(),
            loading: false,
            listLoading: false,
            selectMode: false,
            selected: [],
        };
    },
    computed: {
        hasHistoricalPlans() {
            const today = new Date().setHours(0, 0, 0, 0);
            return this.list.some((item) => Number(item.created) * 1000 < today);
        },
    },
    methods: {
        showTime,
        load() {
            if (!this.isLogin) return Promise.resolve();
            this.listLoading = true;
            return getPlans({ no_page: 1 })
                .then((res) => {
                    const list = Array.isArray(res) ? res : [];
                    this.list = list
                        .slice()
                        .reverse()
                        .map((item) => ({
                        ...item,
                        time_type: "created",
                        }));
                    const availableIds = new Set(this.list.map((item) => item.id));
                    this.selected = this.selected.filter((id) => availableIds.has(id));
                })
                .catch(() => {
                    this.$message.error(this.$t("pages.pvg.manufacture.ui.plans.loadFailed"));
                })
                .finally(() => {
                    this.listLoading = false;
                });
        },
        onSelectModeChange(enabled) {
            if (!enabled) this.selected = [];
        },
        toggleSelection(id) {
            if (this.selected.includes(id)) {
                this.selected = this.selected.filter((item) => item !== id);
            } else {
                this.selected = [...this.selected, id];
            }
        },
        change(id) {
            if (this.selectMode) {
                return this.toggleSelection(id);
            }
            if (this.loading) return;
            this.loading = true;
            getPlan(id)
                .then((res) => {
                    if (!res) throw new Error("Plan not found");
                    this.$emit("view-plan", res);
                })
                .catch(() => {
                    this.$message.error(this.$t("pages.pvg.manufacture.ui.plans.detailLoadFailed"));
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        handleCommand(command) {
            if (command == "cancel-select") {
                this.selected = [];
            } else if (command == "select-all") {
                this.selectMode = true;
                this.selected = this.list.map((item) => item.id);
            } else if (command == "select-yesterday") {
                this.selectMode = true;
                this.selected = Array.from(new Set([
                    ...this.selected,
                    ...this.list
                        .filter((item) => Number(item.created) * 1000 < new Date().setHours(0, 0, 0, 0))
                        .map((item) => item.id),
                ]));
            } else if (command == "delete-select") {
                if (!this.selected.length) {
                    return this.$message.warning(this.$t("pages.pvg.manufacture.ui.plans.selectBeforeDelete"));
                }
                this.$confirm(this.$t("pages.pvg.manufacture.ui.plans.deleteConfirm", { count: this.selected.length }), this.$t("pages.pvg.manufacture.ui.plans.confirmTitle"), {
                    confirmButtonText: this.$t("pages.pvg.manufacture.ui.actions.confirm"),
                    cancelButtonText: this.$t("pages.pvg.manufacture.ui.actions.cancel"),
                    type: "warning",
                })
                    .then(() => {
                        this.listLoading = true;
                        return batchDeletePlan(this.selected.join(","));
                    })
                    .then(() => {
                        this.$message.success(this.$t("pages.pvg.manufacture.ui.plans.deleteSuccess"));
                        this.selected = [];
                        this.selectMode = false;
                        return this.load();
                    })
                    .catch((error) => {
                        if (error === "cancel" || error === "close") return;
                        this.$message.error(this.$t("pages.pvg.manufacture.ui.plans.deleteFailed"));
                    })
                    .finally(() => {
                        this.listLoading = false;
                    })
            } else if (command == "merge-select") {
                if (!this.selected.length) {
                    return this.$message.warning(this.$t("pages.pvg.manufacture.ui.plans.selectBeforeMerge"));
                }
                this.$confirm(this.$t("pages.pvg.manufacture.ui.plans.mergeConfirm", { count: this.selected.length }), this.$t("pages.pvg.manufacture.ui.plans.confirmTitle"), {
                    confirmButtonText: this.$t("pages.pvg.manufacture.ui.actions.confirm"),
                    cancelButtonText: this.$t("pages.pvg.manufacture.ui.actions.cancel"),
                    type: "warning",
                })
                    .then(() => {
                        this.listLoading = true;
                        return getPlansByIds(this.selected.join(","));
                    })
                    .then((list) => {
                        const relation = (Array.isArray(list) ? list : [])
                            .flatMap((item) => (Array.isArray(item.relation) ? item.relation : []));
                        if (!relation.length) throw new Error("No plan items");
                        this.$emit("merge-plan", relation);
                        this.$message.success(this.$t("pages.pvg.manufacture.ui.plans.mergeSuccess"));
                        this.selected = [];
                        this.selectMode = false;
                    })
                    .catch((error) => {
                        if (error === "cancel" || error === "close") return;
                        this.$message.error(this.$t("pages.pvg.manufacture.ui.plans.mergeFailed"));
                    })
                    .finally(() => {
                        this.listLoading = false;
                    })
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
            padding: 5px 20px;
            background: #fff;

            .u-title {
                .fz(13px);
                .db;
                .nobreak;
                flex-grow: 1;
                .mr(10px);
                display: flex;
                flex-direction: column;

                .u-meta {
                    display: inline;
                    .fz(10px, 1.2);
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
