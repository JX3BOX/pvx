<template>
    <el-drawer
        :with-header="false"
        :visible.sync="visible"
        direction="btt"
        wrapper-closable
        append-to-body
        modal-append-to-body
        custom-class="m-ask-drawer"
        @close="onClose"
    >
        <div class="m-input">
            <el-input class="u-input" v-model="inputValue" size="mini" @focus="$event.target.select()">
                <template #suffix>
                    <img svg-inline src="@/assets/img/manufacture/edit.svg" />
                </template>
            </el-input>
        </div>
        <div class="m-actions">
            <div class="u-confirm" @click="ok">确定</div>
        </div>
    </el-drawer>
</template>

<script>
export default {
    name: "ManufacturePriceItemMobile",
    props: {},
    data: () => ({
        inputValue: "",
        visible: false,
        resolve: null,
        reject: null,
    }),
    methods: {
        open(payload) {
            const { value } = payload;
            this.inputValue = value;
            this.visible = true;
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        },
        ok() {
            this.resolve(this.inputValue);
            this.reject = null;
            this.visible = false;
        },
        onClose() {
            if (this.reject) {
                this.reject();
                this.reject = null;
            }
        },
    },
};
</script>

<style lang="less">
.m-ask-drawer {
    .m-input {
        display: flex;
        align-items: center;
        gap: 8px;

        .u-input {
            .el-input__inner {
                border-radius: 8px;
                background: var(--black-5, rgba(255, 255, 255, 0.1));

                border: 1px solid #2828280d;
                color: var(--black-40, rgba(255, 255, 255, 0.4));
                .fz(12px, 18px);
                font-weight: 700;
            }

            .el-input__suffix {
                display: inline-flex;
                align-items: center;
            }
        }
    }

    .m-actions {
        display: flex;
        justify-content: space-between;
        gap: 16px;

        .u-confirm {
            .pointer;
            flex-grow: 1;
            border-radius: 8px;
            padding: 8px 20px;
            .fz(12px, 18px);
            font-weight: 700;
            .x();
            background: var(--Primary-Brand-2, #fedaa3);
            color: var(--Primary-Brand-3, #24292e);
        }
    }
}
</style>
