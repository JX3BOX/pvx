<template>
    <el-drawer
        :with-header="false"
        :visible.sync="visible"
        direction="btt"
        wrapper-closable
        append-to-body
        modal-append-to-body
        custom-class="m-count-change-drawer"
    >
        <div class="m-input-group">
            <div class="m-title">
                <div>部分配方制作次数和产量不对等,</div>
                <div>如需修改请先填写制作次数再修改最终产量</div>
            </div>
            <div class="m-input">
                <span class="u-title">制作次数</span>
                <el-input-number v-model="count" @change="onChangeCount"></el-input-number>
            </div>
            <div class="m-input">
                <span class="u-title">最终产出</span>
                <el-input-number v-model="yield_count"></el-input-number>
            </div>
        </div>
        <div class="m-actions">
            <div class="u-confirm" @click="confirm">确定</div>
        </div>
    </el-drawer>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { iconLink } from "@jx3box/jx3box-common/js/utils.js";

export default {
    name: "ManufacturePriceItemMobile",
    props: {},
    data: () => ({
        visible: false,

        count: 1,
        yield_count: 1,
        yield_count_min: 1,
        yield_count_max: 1,

        resolve: null,
    }),
    methods: {
        iconLink,
        open(data = {}) {
            this.visible = true;
            this.count = data.count || 1;
            this.yield_count = data.yield_count || 1;
            this.yield_count_min = data.yield_count_min || 1;
            this.yield_count_max = data.yield_count_max || 1;
            return new Promise((resolve) => {
                this.resolve = resolve;
            });
        },
        confirm() {
            this.resolve([this.count, this.yield_count]);
            this.visible = false;
        },
        onChangeCount() {
            const min = this.count * this.yield_count_min;
            const max = this.count * this.yield_count_max;
            this.yield_count = Math.min(Math.max(min, this.yield_count), max);
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
