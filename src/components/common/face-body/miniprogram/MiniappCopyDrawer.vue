<template>
    <el-drawer v-model="visible" direction="btt" :with-header="false" :modal-append-to-body="false"
        append-to-body class="c-drawer">
        <div class="m-pvx-face-data-copy m-pvx-fb-data-copy">
            <div class="u-copy-box m-pvx-fb-data-copy__box" v-if="post.code_mode">
                <div class="u-copy-top u-fb-data-copy-top">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/copy_touchbar_120.svg" svg-inline />
                    <div class="u-label u-fb-data-copy-label">复制{{ typeLabel }}码</div>
                </div>
                <div class="u-number u-fb-data-copy-number">{{ post.code }}</div>
                <div class="u-copy-btn u-fb-data-copy-btn" @click="handleCopy">复制</div>
            </div>
            <div class="u-data-box m-pvx-fb-data-copy__data" v-else>
                <div class="u-copy-top u-fb-data-copy-top">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/report.svg" svg-inline />
                    <div class="u-label u-fb-data-copy-label">非{{ typeLabel }}码作品，无法直接复制</div>
                </div>
                <div class="u-no-data-btn u-fb-data-copy-no-data-btn" @click="handleGoToData">查看{{ typeLabel }}数据</div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
export default {
    name: "MiniappCopyDrawer",
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        post: {
            type: Object,
            default: () => ({}),
        },
        typeLabel: {
            type: String,
            default: "脸型",
        },
    },
    emits: ["update:modelValue", "go-to-data"],
    computed: {
        visible: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$emit("update:modelValue", val);
            },
        },
    },
    methods: {
        handleCopy() {
            navigator.clipboard.writeText(this.post.code).then(() => {
                this.visible = false;
                this.$notify({
                    title: "复制成功",
                    message: "内容：" + this.post.code,
                    type: "success",
                });
            });
        },
        handleGoToData() {
            this.$emit("go-to-data");
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/drawer.less";
@import "~@/assets/css/common/face-body/miniprogram/drawer.less";
@import "~@/assets/css/common/face-body/miniprogram/dark-mode.less";
</style>
