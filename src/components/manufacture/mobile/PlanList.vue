<template>
    <el-drawer
        :with-header="false"
        direction="btt"
        wrapper-closable
        append-to-body
        modal-append-to-body
        custom-class="m-manufacture-plan-mobile"
        @close="$emit('close')"
        :visible.sync="visible"
    >
        <div class="m-manufacture-plan-body">
            <div class="m-manufacture-plan-list">
                <div class="m-manufacture-plan-item" v-for="(plan, index) in plans" :key="index" @click="go(plan)">
                    {{ plan.title }}
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
import { getPlans } from "@/service/manufacture/plan";
import User from "@jx3box/jx3box-common/js/user";

export default {
    name: "ManufacturePlanListMobile",
    components: {},
    props: {},
    data: () => ({
        visible: false,
        plans: [],
        isLogin: User.isLogin(),
    }),
    computed: {},
    methods: {
        open() {
            this.visible = true;
            this.load();
        },
        load() {
            if (!this.isLogin) return;
            getPlans({ no_page: 1 }).then((res) => {
                this.plans =
                    res.reverse().map((item) => ({
                        ...item,
                        time_type: "created",
                    })) || [];
            });
        },
        go(plan) {
            this.$emit("go-plan", {
                plan_id: plan.id,
            });
            this.visible = false;
        },
    },
};
</script>

<style lang="less">
.m-manufacture-plan-body {
    height: 400px;
    .fz(12px, 18px);

    .m-manufacture-plan-list {
        overflow-y: auto;
        .scrollbar;

        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 12px;
    }

    .m-manufacture-plan-item {
        display: flex;
        box-sizing: border-box;
        width: 100%;
        padding: 12px;
        align-items: center;
        border-radius: 8px;
        background: var(--black-5, rgba(28, 28, 28, 0.05));
        color: var(--black-80, rgba(28, 28, 28, 0.8));

        font-weight: 700;
    }
}
</style>
