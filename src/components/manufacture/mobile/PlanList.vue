<template>
    <el-drawer
        :with-header="false"
        direction="btt"
        :wrapper-closable="true"
        append-to-body
        class="m-manufacture-plan-mobile"
        @close="handleClose"
        v-model="visible"
    >
        <div class="m-manufacture-plan-body">
            <div class="m-manufacture-plan-title">{{ $t("pages.pvg.manufacture.ui.cart.plans") }}</div>
            <div v-if="loading" class="m-manufacture-plan-empty">{{ $t("pages.pvg.manufacture.ui.common.loading") }}</div>
            <div v-else-if="!isLogin" class="m-manufacture-plan-empty">
                {{ $t("pages.pvg.manufacture.ui.empty.login") }}
            </div>
            <div v-else-if="!plans.length" class="m-manufacture-plan-empty">
                {{ $t("pages.pvg.manufacture.ui.empty.plans") }}
            </div>
            <div v-else class="m-manufacture-plan-list">
                <button
                    type="button"
                    class="m-manufacture-plan-item"
                    v-for="plan in plans"
                    :key="plan.id"
                    @click="go(plan)"
                >
                    {{ plan.title }}
                </button>
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
    data() {
        return {
            visible: false,
            plans: [],
            isLogin: User.isLogin(),
            loading: false,
        };
    },
    computed: {},
    methods: {
        open() {
            this.visible = true;
            this.load();
        },
        handleClose() {
            this.visible = false;
            this.$emit("close");
        },
        async load() {
            if (!this.isLogin) return;
            this.loading = true;
            try {
                const res = await getPlans({ no_page: 1 });
                this.plans =
                    (Array.isArray(res) ? [...res] : []).reverse().map((item) => ({
                        ...item,
                        time_type: "created",
                    })) || [];
            } catch (e) {
                this.plans = [];
                this.$message.error(this.$t("pages.pvg.manufacture.ui.plans.loadFailed"));
            } finally {
                this.loading = false;
            }
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

    .m-manufacture-plan-title {
        margin-bottom: 14px;
        color: var(--black-100, #17233c);
        font-size: 18px;
        line-height: 26px;
        font-weight: 700;
    }

    .m-manufacture-plan-empty {
        display: flex;
        min-height: 120px;
        align-items: center;
        justify-content: center;
        color: var(--black-40, #8b98ad);
    }

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
        min-height: 48px;
        padding: 12px 14px;
        align-items: center;
        border-radius: 8px;
        border: 1px solid var(--black-10, #e7ecf3);
        background: var(--black-5, rgba(28, 28, 28, 0.05));
        color: var(--black-80, rgba(28, 28, 28, 0.8));
        cursor: pointer;
        text-align: left;
        font-weight: 700;

        &:active {
            border-color: #8b8cff;
            background: #f2f2ff;
        }
    }
}
</style>
