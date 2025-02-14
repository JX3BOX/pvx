<template>
    <div class="m-myList">
        <div class="m-manufacture-title m-manufacture-title__myList">
            <span class="u-title">我的清单</span>
            <a class="fr el-button el-button--success el-button--mini" @click="onAddPlan" v-if="isLogin">
                <i class="el-icon-document-add"></i>
                <span>创建</span>
            </a>
        </div>
        <div class="m-box">
            <template v-if="isLogin">
                <div class="m-item" v-for="(item, i) in list" :key="i" @click="change(item.id)">
                    <span> <i :class="item.public ? 'el-icon-caret-right' : 'el-icon-lock'"></i> {{ item.title }}</span>
                </div>
            </template>
            <span class="m-null" v-else>- 请登录后查看 -</span>
        </div>
        <Plan :planId="planId" :visible="visible" @close="close" />
    </div>
</template>

<script>
import { getMyPlans, addMyPlan } from "@/service/manufacture/plan";
import { __Root } from "@jx3box/jx3box-common/data/jx3box.json";
import User from "@jx3box/jx3box-common/js/user";
import Bus from "@/store/bus.js";
import Plan from "@/components/manufacture/Plan.vue";
export default {
    name: "MyList",
    data: function () {
        return {
            list: [],
            isLogin: User.isLogin(),
            planId: "",
            visible: false,
        };
    },
    components: { Plan },
    methods: {
        load() {
            getMyPlans({ no_page: 1 }).then((res) => {
                this.list = res.reverse() || [];
            });
        },
        change(id) {
            this.planId = id;
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        onAddPlan() {
            this.$prompt("请输入清单名称", "创建空白清单", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPlaceholder: "请输入清单名称",
                inputValidator: (value) => {
                    if (!value) {
                        return "请输入清单名称";
                    }
                },
                callback: (action, instance) => {
                    if (action === "confirm") {
                        const data = {
                            title: instance.inputValue,
                            type: 1, // 1: 物品清单
                            public: 1,
                            relation: [],
                            description: "",
                        };
                        addMyPlan(data).then((res) => {
                            this.$message({
                                message: "创建成功",
                                type: "success",
                            });
                            this.list.unshift(res.data.data);
                        });
                    }
                },
            });
        },
    },
    mounted() {
        this.isLogin && this.load();
        Bus.$on("update", () => {
            this.load();
        });
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
            .pointer;
            .db;
            .color( #24292e,#07ad36);
            .lh(30px);
            .r(10px);
            background: #fff;
            padding: 0 20px;

            span {
                .db;
                .nobreak;
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
