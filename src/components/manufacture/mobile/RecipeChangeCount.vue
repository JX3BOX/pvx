<template>
    <el-drawer
        :with-header="false"
        v-model="visible"
        direction="btt"
        wrapper-closable
        append-to-body
        modal-append-to-body
        class="m-count-change-drawer"
        @close="onClose"
    >
        <div class="m-input-group">
            <div class="m-title">
                <strong>{{ $t("pages.pvg.manufacture.ui.countDialog.title") }}</strong>
                <span>{{ $t("pages.pvg.manufacture.ui.countDialog.description") }}</span>
            </div>
            <div class="m-input">
                <span class="u-title">{{ $t("pages.pvg.manufacture.ui.countDialog.craftCount") }}</span>
                <el-input-number v-model="count" :min="1" @change="onChangeCount"></el-input-number>
            </div>
            <div class="m-input">
                <span class="u-title">{{ $t("pages.pvg.manufacture.ui.countDialog.finalOutput") }}</span>
                <el-input-number v-model="yield_count" :min="yieldMin" :max="yieldMax"></el-input-number>
            </div>
        </div>
        <div class="m-actions">
            <button type="button" class="u-confirm" @click="confirm">
                {{ $t("pages.pvg.manufacture.ui.actions.confirm") }}
            </button>
        </div>
    </el-drawer>
</template>

<script>
export default {
    name: "ManufactureRecipeCountMobile",
    props: {},
    data: () => ({
        visible: false,

        count: 1,
        yield_count: 1,
        yield_count_min: 1,
        yield_count_max: 1,

        resolve: null,
        reject: null,
    }),
    computed: {
        yieldMin() {
            return Math.max(1, this.count * this.yield_count_min);
        },
        yieldMax() {
            return Math.max(this.yieldMin, this.count * this.yield_count_max);
        },
    },
    methods: {
        open(data = {}) {
            this.visible = true;
            this.count = data.count || 1;
            this.yield_count = data.yield_count || 1;
            this.yield_count_min = data.yield_count_min || 1;
            this.yield_count_max = data.yield_count_max || 1;
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        },
        confirm() {
            this.count = Math.max(1, Number(this.count) || 1);
            this.yield_count = Math.min(
                Math.max(this.yieldMin, Number(this.yield_count) || this.yieldMin),
                this.yieldMax
            );
            this.resolve?.([this.count, this.yield_count]);
            this.resolve = null;
            this.reject = null;
            this.visible = false;
        },
        onChangeCount() {
            const min = this.count * this.yield_count_min;
            const max = this.count * this.yield_count_max;
            this.yield_count = Math.min(Math.max(min, this.yield_count), max);
        },
        onClose() {
            if (this.reject) this.reject(new Error("cancelled"));
            this.resolve = null;
            this.reject = null;
        },
    },
};
</script>

<style lang="less">
.el-drawer__wrapper {
    .pf;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
.m-count-change-drawer {
    .m-title {
        display: flex;
        flex-direction: column;
        gap: 16px;
        color: var(--Primary-Brand-2, #24292e);
        .fz(12px, 18px);
        font-weight: 400;
    }

    .m-input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .m-input {
        display: flex;
        align-items: center;
        gap: 8px;

        .u-title {
            color: var(--black-100, #1c1c1c);
            .fz(12px, 18px);

            font-weight: 700;
            border: 0;
        }
        .el-input-number {
            flex-grow: 1;
        }
        .el-input-number__decrease,
        .el-input-number__increase {
            display: flex;
            width: 34px;
            height: 24px;
            padding: 8px 0px;
            justify-content: center;
            align-items: center;
            border: none;
            background-color: transparent;

            color: var(--black-100, #fff);
            .fz(12px, 18px);
            font-weight: 700;
        }
        .el-input__inner {
            height: 32px;
            border-radius: 8px;
            background: var(--black-5, rgba(255, 255, 255, 0.1));

            border: 1px solid #2828280d;
            color: var(--black-100, rgba(255, 255, 255, 0.4));
            .fz(12px, 18px);
            font-weight: 700;
        }
    }

    .m-actions {
        display: flex;
        gap: 16px;

        .u-confirm {
            .pointer;
            .fz(12px, 18px);
            .x();
            flex-grow: 1;
            border-radius: 8px;
            padding: 8px 20px;
            font-weight: 700;
            background: var(--Primary-Brand-2, #f0ddc0);
            color: var(--Primary-Brand-3, #24292e);
        }
    }
}
</style>
