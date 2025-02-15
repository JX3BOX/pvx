<template>
    <el-dialog title="设置关注清单" :visible.sync="dialogVisible" width="50%" @close="$emit('close')">
        <div class="m-price-goods-mygoods" v-loading="loading">
            <template v-if="myPlanList.length">
                <div
                    class="m-price-goods-mygoods-group"
                    v-for="group in myPlanList"
                    :key="group.id"
                    @click="choiceGroup(group)"
                >
                    {{ group.title }}
                    <el-checkbox v-model="group.checked" readonly></el-checkbox>
                </div>
            </template>
            <div v-else>
                <div class="m-price-goods-empty" @click="goItem">还没有清单，<span class="strong">去创建</span></div>
            </div>
        </div>

        <span slot="footer" class="dialog-footer">
            <el-button @click="$emit('close')">取 消</el-button>
            <el-button type="primary" @click="setMyFollowList">确 定</el-button>
        </span>
    </el-dialog>
</template>
<script>
import { getMyPlans } from "@/service/pvg/plan.js";
import User from "@jx3box/jx3box-common/js/user";
export default {
    props: {
        myFollowData: {},
    },
    data() {
        return {
            myPlanList: [],
            dialogVisible: true,
            loading: false,
        };
    },
    methods: {
        handleClose() {
            this.dialogVisible = false;
        },
        getPlanList() {
            this.loading = true;
            getMyPlans({ no_page: 1 }).then((res) => {
                this.loading = false;
                this.myPlanList = res.reverse() || [];
                this.myPlanList.forEach((item) => {
                    this.$set(item, "checked", this.followIdList.includes(item.id));
                });
            });
        },
        choiceGroup(group) {
            group.checked = !group.checked;
            if (group.checked) {
                this.followIdList.push(group.id);
            } else {
                const index = this.followIdList.indexOf(group.id);
                if (index > -1) {
                    this.followIdList.splice(this.followIdList.indexOf(group.id), 1);
                }
            }
        },
        setMyFollowList() {
            const myPlanIds = this.myPlanList.map((item) => item.id);
            const val = this.followIdList.filter((id) => myPlanIds.includes(id)).join(",");
            this.$emit("setMyFollowList", val);
        },
        goItem() {
            let host = location.origin;
            window.open(`${host}/pvg/manufacture`);
        },
    },
    mounted() {
        this.followIdList = JSON.parse(JSON.stringify(this.myFollowData));
        User.isLogin() && this.getPlanList();
    },
};
</script>
<style lang="less">
.m-price-goods-mygoods {
    padding-left: 10px;
    margin-bottom: 20px;
    .m-price-goods-mygoods-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #eee;
        cursor: pointer;
        &:hover {
            background: #eee;
        }
        .el-checkbox {
            pointer-events: none;
        }
    }
    .m-price-goods-empty {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 10px;
        margin-bottom: 10px;

        .strong {
            color: #0366d6;
            font-weight: bold;
            cursor: pointer;
        }
    }
}
</style>
