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
        <div class="m-actions">
            <div class="u-button u-delete" @click="ok('delete')">删除项目</div>
            <div class="u-button u-confirm" @click="ok('count')">修改数量</div>
            <div class="u-button u-confirm" @click="ok('price')">修改价格</div>
        </div>
    </el-drawer>
</template>

<script>
export default {
    name: "ManufacturePriceItemMobile",
    props: {},
    data: () => ({
        visible: false,
        resolve: null,
        reject: null,
    }),
    methods: {
        open() {
            this.visible = true;
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        },
        ok(type) {
            this.resolve(type);
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
    .m-actions {
        display: flex;
        justify-content: space-between;
        gap: 16px;

        .u-button {
            .pointer;
            flex-grow: 1;
            border-radius: 8px;
            padding: 8px 20px;
            .fz(12px, 18px);
            font-weight: 700;
            .x();
        }
        .u-confirm {
            background: var(--Primary-Brand-2, #fedaa3);
            color: var(--Primary-Brand-3, #24292e);
        }
        .u-delete {
            background: var(--black-5, rgba(255, 255, 255, 0.1));
            color: var(--black-80, rgba(255, 255, 255, 0.8));
        }
    }
}
</style>
