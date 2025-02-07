<template>
    <div class="m-create-plan" v-if="list.length">
        <el-popover popper-class="m-plan-tips" placement="top" width="220" trigger="click">
            <el-divider>新建清单</el-divider>
            <div class="u-tips">
                <el-button size="mini" icon="el-icon-edit" @click="dialogVisible = true">编辑信息</el-button>
                <el-button size="mini" icon="el-icon-thumb" type="primary" @click="setMyPlan">直接保存</el-button>
            </div>
            <el-button slot="reference" type="success" icon="el-icon-document-checked" size="small">
                保存至我的清单
            </el-button>
        </el-popover>

        <el-dialog title="编辑清单" :visible.sync="dialogVisible" custom-class="m-plan-dialog">
            <el-form :inline="true" :model="plan" class="demo-form-inline">
                <el-form-item label="标题">
                    <el-input v-model="plan.title"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="plan.description"></el-input>
                </el-form-item>
                <el-form-item label="是否公开">
                    <el-switch v-model="plan.publics" active-value="1" inactive-value="0"></el-switch>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setMyPlan">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { addMyPlan } from "@/service/manufacture/plan";
import { getLink } from "@jx3box/jx3box-common/js/utils";
import { showTime } from "@/utils/moment";
import Bus from "@/store/bus.js";
export default {
    name: "CreatePlan",
    props: ["list"],
    data: function () {
        return {
            visible: false,
            dialogVisible: false,
            data: "",
            plan: {
                title: "",
                description: "",
                publics: true,
            },
        };
    },
    methods: {
        // 保存清单
        setMyPlan() {
            let recipe = [],
                materials = [];
            this.list.forEach((item) => {
                recipe.push({ id: item.itemKey, count: item.count, IconID: item.IconID, Name: item.Name });
                item.children.forEach((el) => {
                    materials.push({
                        id: el.priceID,
                        count: el.count * item.count,
                        IconID: el.IconID,
                        Name: el.Name,
                    });
                });
            }); 
            materials = this.merge(materials);

            let date = showTime(new Date());
            let { title, publics, description } = this.plan;

            let data = {
                title: title || `技艺助手成本计算 ${date}`,
                type: 1,
                public: Number(publics),
                description: description || "",
                relation: [
                    { title: "生产配方", data: recipe },
                    { title: "生产配方所需材料", data: materials },
                ],
            };
            addMyPlan(data)
                .then((res) => {
                    this.dialogVisible = false;
                    this.data = res.data.data;
                    this.$notify({
                        title: "清单创建成功",
                        type: "success",
                    });
                })
                .then(() => {
                    this.data = "";
                    this.$emit("clear");
                    Bus.$emit("update");
                });
        },

        // 合并所有材料的id和数量
        merge(list) {
            let _list = [];
            let _obj = {};
            list.forEach((el) => {
                if (_obj[el.id]) {
                    _obj[el.id].count += el.count;
                } else {
                    _obj[el.id] = {
                        IconID: el.IconID,
                        Name: el.Name,
                        count: el.count,
                    };
                }
            });
            for (const key in _obj) {
                _list.push({ id: key, ..._obj[key] });
            }
            return _list;
        },
    },
};
</script>
<style lang="less" scoped>
.m-create-plan {
    .x(right);

    .u-tip {
        .mt(10px);
    }
}
</style>
<style lang="less">
.m-plan-tips {
    .u-tips {
        .flex;
        justify-content: space-around;
    }
}
.m-plan-dialog {
    .el-dialog__header {
        .x(left);
    }
    .el-form {
        .flex;
    }
}
</style>
