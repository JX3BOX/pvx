<template>
    <el-dialog title="美人图查询" :visible.sync="show" width="90%" custom-class="m-mrt-dialog" @close="close">
        <div class="m-toolbar">
            <el-select v-model="server" filterable>
                <template #prefix>
                    <div class="u-select-label">区服</div>
                </template>
                <el-option v-for="(item, i) in servers" :key="i" :label="item" :value="item"></el-option>
            </el-select>
            <el-select v-model="school_id" filterable>
                <template #prefix>
                    <div class="u-select-label">门派</div>
                </template>
                <el-option
                    v-for="item in schoolList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
            </el-select>
            <el-select v-model="body_id" filterable>
                <template #prefix>
                    <div class="u-select-label">体型</div>
                </template>
                <el-option
                    v-for="item in bodyList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
            </el-select>
            <!-- <el-input class="u-input" v-model="desc" clearable placeholder="请输入画像 例如 英少"></el-input> -->
            <el-button type="primary" :loading="loading" :disabled="loading" @click="onSearch">查询</el-button>
        </div>
        <div class="m-content">
            <div class="u-content" v-if="data.date">
                <div class="u-title">{{ schoolMap[school_id] }}{{ data.item.desc }}画像</div>
                <!-- eslint-disable-next-line vue/no-parsing-error -->
                <div class="u-date">下个日期： {{ `< ${data.date} >` }}{{ `< ${getWeek(data.date)} >` }}</div>
            </div>
            <el-empty v-else></el-empty>
        </div>
    </el-dialog>
</template>
<script>
import { getMeirentuPredict } from "@/service/pvg/gonggao";
import { bodyMap } from "@jx3box/jx3box-data/data/role/body.json";
import schoolMap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import servers_std from "@jx3box/jx3box-data/data/server/server_std.json";
import servers_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import dayjs from "@/utils/day";
export default {
    name: "MrtDialog",
    props: ["visible", "currentServer"],
    components: {},
    data: function () {
        return {
            loading: false,
            server: "",
            desc: "",
            school_id: "",
            body_id: "",
            data: {
                date: "",
                item: {},
            },
            schoolMap,
        };
    },
    computed: {
        show: {
            get() {
                return this.visible;
            },
            set() {
                this.close();
            },
        },
        bodyList() {
            return Object.entries(bodyMap).map(([value, label]) => {
                return {
                    value,
                    label,
                };
            });
        },
        schoolList() {
            return Object.entries(schoolMap)
                .map(([value, label]) => {
                    return {
                        value,
                        label,
                    };
                })
                .filter((item) => item.value != 0);
        },
        client: function () {
            return this.$store.state.client || "std";
        },
        servers: function () {
            if (this.client == "std") {
                return servers_std;
            } else {
                return servers_origin;
            }
        },
    },
    watch: {
        visible: {
            immediate: true,
            handler() {
                console.log(this.visible);
                if (this.visible && !this.server) {
                    this.server = this.currentServer;
                }
            },
        },
    },
    methods: {
        close() {
            this.$emit("close");
        },
        getWeek(date) {
            var data = dayjs.tz(date).day();
            var week = ["日", "一", "二", "三", "四", "五", "六"];
            return "周" + week[data];
        },
        onSearch() {
            if (!this.server || !this.school_id || !this.body_id) {
                return this.$message.error("请选择查询条件");
            }
            const params = {
                client: this.client,
                server: this.server,
                school_id: this.school_id,
                body_id: this.body_id,
                _no_cache: 1,
            };
            this.loading = true;
            getMeirentuPredict(params)
                .then((res) => {
                    this.data = res.data.data || {};
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
};
</script>
<style lang="less">
.m-mrt-dialog {
    .m-toolbar {
        .flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    .u-select-label {
        color: #606266;
        line-height: 38px;
        padding: 0 10px;
    }
    .el-input--prefix .el-input__inner {
        padding-left: 50px;
    }
    .u-input {
        width: 228px;
    }
    @media screen and (max-width: @phone) {
        .el-select,
        .el-button {
            width: 100%;
        }
    }
    .m-content {
        padding: 60px 40px 40px;
        .flex;
        align-items: center;
        justify-content: center;
        .u-content {
            .flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
        .u-title {
            font-size: 20px;
            color: #ffad31;
            .bold;
        }
    }
}
</style>
