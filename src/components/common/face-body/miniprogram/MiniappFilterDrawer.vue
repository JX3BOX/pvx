<!--
 * MiniappFilterDrawer - 小程序筛选抽屉组件
 * 
 * @description 用于微信小程序 webview 环境的列表页筛选功能，包含体型切换和条件筛选
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 体型切换功能（成男/成女/正太/萝莉）
 * - 多条件筛选（推荐、首发、原创等）
 * - face特有筛选（写实/写意、只看捏脸码）
 * - 支持重置筛选条件
 * 
 * @props
 * - modelValue: Boolean - 控制抽屉显示
 * - showCut: Boolean - 显示体型切换
 * - showFiltrate: Boolean - 显示筛选面板
 * - noBody: Boolean - 无体型提示
 * - typeList: Array - 体型列表配置
 * - active: Number - 当前激活的体型
 * - filterParams: Object - 筛选参数
 * - type: 'face' | 'body' - 模块类型
 * 
 * @events
 * - update:modelValue: 更新显示状态
 * - confirm: 确认体型选择
 * - filtrate-confirm: 确认筛选
 * - select-body: 选择体型
 -->
<template>
    <el-drawer v-model="visible" direction="btt" :with-header="false" :modal-append-to-body="false" append-to-body
        class="c-drawer" @close="handleClose">
        <!-- 体型切换区域 -->
        <transition :name="cutShowTra ? 'slide-up' : ''">
            <div class="m-pvx-fb-cut" v-if="showCut">
                <!-- 全部体型选项 -->
                <div class="u-pvx-fb-cut-all" :class="{ 'is-active': tempActive === -1 }" @click="tempActive = -1">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/all.svg" svg-inline />
                    全部体型
                </div>

                <!-- 体型列表 -->
                <div class="u-pvx-fb-cut-box">
                    <div class="u-pvx-fb-cut-item" v-for="(item, index) in typeList" :key="index"
                        :class="{ 'is-active': tempActive === item.value }" @click="tempActive = item.value">
                        <img class="u-icon" v-if="item.value === 1" src="@/assets/img/pvxsuspension/man.svg" svg-inline />
                        <img class="u-icon" v-else-if="item.value === 2" src="@/assets/img/pvxsuspension/woman.svg" svg-inline />
                        <img class="u-icon" v-else-if="item.value === 5" src="@/assets/img/pvxsuspension/boy.svg" svg-inline />
                        <img class="u-icon" v-else-if="item.value === 6" src="@/assets/img/pvxsuspension/girl.svg" svg-inline />
                        <span>{{ item.label }}</span>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="u-pvx-fb-cut-btn">
                    <div class="u-report-btn" @click="handleReset">重置</div>
                    <div class="u-confirm-btn" :class="{ 'is-active': showHighlightConfirm }" @click="handleConfirm">
                        确定
                    </div>
                </div>
            </div>
        </transition>

        <!-- 请先选择体型提示 -->
        <div class="m-pvx-fb-no-body" v-if="noBody">
            <div class="u-icon">
                <img src="@/assets/img/pvxsuspension/report.svg" svg-inline />
                <div class="u-tips">请先选择体型</div>
            </div>
            <div class="u-btn" @click="handleSelectBody">选择体型</div>
        </div>

        <!-- 筛选区域 -->
        <div class="m-pvx-fb-filtrate" v-if="showFiltrate">
            <!-- 类型筛选（仅脸型有写实/写意） -->
            <template v-if="showFaceTypeFilter">
                <div class="u-pvx-fb-filtrate-title">类型</div>
                <div class="u-box">
                    <div class="u-pvx-fb-filtrate-item" :class="{ 'is-active': !localFilterParams.is_new_face }"
                        @click="toggleFilter('is_new_face', '')">
                        全部
                    </div>
                    <div class="u-pvx-fb-filtrate-item" :class="{ 'is-active': localFilterParams.is_new_face === '1' }"
                        @click="toggleFilter('is_new_face', '1', localFilterParams.is_new_face === '1')">
                        写实
                    </div>
                    <div class="u-pvx-fb-filtrate-item" :class="{ 'is-active': localFilterParams.is_new_face === '0' }"
                        @click="toggleFilter('is_new_face', '0', localFilterParams.is_new_face === '0')">
                        写意
                    </div>
                </div>
            </template>

            <!-- 标签筛选 -->
            <div class="u-pvx-fb-filtrate-title">标签</div>
            <div class="u-box">
                <div class="u-pvx-fb-filtrate-item all" :class="{
                    'is-active':
                        !localFilterParams.star &&
                        localFilterParams.price_type === '' &&
                        !localFilterParams.is_unlimited,
                }" @click="resetTagFilters">
                    全部
                </div>
                <div class="u-pvx-fb-filtrate-item" :class="{ 'is-active': localFilterParams.star === '1' }"
                    @click="toggleFilter('star', '1', localFilterParams.star === '1')">
                    精选
                </div>
                <div class="u-pvx-fb-filtrate-item" :class="{ 'is-active': localFilterParams.price_type === '0' }"
                    @click="toggleFilter('price_type', '0', localFilterParams.price_type === '0')">
                    免费
                </div>
                <div class="u-pvx-fb-filtrate-item" :class="{ 'is-active': localFilterParams.is_unlimited === '1' }"
                    @click="toggleFilter('is_unlimited', '1', localFilterParams.is_unlimited === '1')">
                    可新建
                </div>
            </div>

            <!-- 其他筛选 -->
            <div class="u-pvx-fb-filtrate-title">其他</div>
            <div class="u-box">
                <div class="u-pvx-fb-filtrate-item all" :class="{ 'is-active': !localFilterParams.filter_empty_images }"
                    @click="resetOtherFilters">
                    全部
                </div>
                <div class="u-pvx-fb-filtrate-item" :class="{ 'is-active': localFilterParams.filter_empty_images }"
                    @click="toggleFilter('filter_empty_images', '1')">
                    只看有图
                </div>
                <!-- 脸型特有：只看捏脸码 -->
                <div class="u-pvx-fb-filtrate-item" v-if="type === 'face'" :class="{ 'is-active': localFilterParams.code_mode }"
                    @click="toggleFilter('code_mode', '1')">
                    只看捏脸码
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="m-pvx-fb-filtrate__btn">
                <div class="u-report-btn" @click="handleFiltrateReset">重置</div>
                <div class="u-confirm-btn" :class="{ 'is-active': showFiltrateConfirm }" @click="handleFiltrateConfirm">
                    确定
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
import { isEqual } from "lodash";

/**
 * MiniappFilterDrawer - 小程序筛选抽屉组件
 * 用于脸型/体型小程序列表页的体型切换和筛选功能
 */
export default {
    name: "MiniappFilterDrawer",
    props: {
        // 是否显示抽屉
        modelValue: {
            type: Boolean,
            default: false,
        },
        // 显示体型切换
        showCut: {
            type: Boolean,
            default: false,
        },
        // 显示筛选
        showFiltrate: {
            type: Boolean,
            default: false,
        },
        // 显示未选择体型提示
        noBody: {
            type: Boolean,
            default: false,
        },
        // 体型列表
        typeList: {
            type: Array,
            default: () => [],
        },
        // 当前激活的体型
        active: {
            type: Number,
            default: -1,
        },
        // 筛选参数
        filterParams: {
            type: Object,
            default: () => ({}),
        },
        // 类型标识
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
    },
    emits: ["update:modelValue", "confirm", "filtrate-confirm"],
    data() {
        return {
            tempActive: -1,         // 临时选中的体型
            cutShowTra: false,      // 是否显示切换动画
            localFilterParams: {},  // 本地筛选参数
        };
    },
    computed: {
        visible: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$emit("update:modelValue", val);
            },
        },
        // 是否高亮确定按钮（体型切换）
        showHighlightConfirm() {
            return this.tempActive !== this.active;
        },
        // 是否高亮确定按钮（筛选）
        showFiltrateConfirm() {
            return !isEqual(this.localFilterParams, this.filterParams);
        },
        // 是否显示脸型类型筛选（写实/写意）
        showFaceTypeFilter() {
            return this.type === "face";
        },
    },
    watch: {
        // 监听 active 变化，同步到临时变量
        active: {
            handler(val) {
                this.tempActive = val;
            },
            immediate: true,
        },
        // 监听筛选参数变化
        filterParams: {
            handler(val) {
                this.localFilterParams = { ...val };
            },
            immediate: true,
            deep: true,
        },
    },
    methods: {
        // 切换筛选参数
        toggleFilter(key, value, isActive = false) {
            if (typeof key === "string") {
                this.localFilterParams[key] = isActive ? "" : value;
            } else if (Array.isArray(key)) {
                key.forEach((k) => {
                    this.localFilterParams[k] = value;
                });
            }
        },
        // 重置标签筛选
        resetTagFilters() {
            this.localFilterParams.star = "";
            this.localFilterParams.price_type = "";
            this.localFilterParams.is_unlimited = "";
        },
        // 重置其他筛选
        resetOtherFilters() {
            this.localFilterParams.filter_empty_images = "";
            this.localFilterParams.code_mode = "";
        },
        // 重置体型选择
        handleReset() {
            this.tempActive = -1;
        },
        // 确认体型选择
        handleConfirm() {
            if (!this.showHighlightConfirm) {
                this.visible = false;
                return;
            }
            this.$emit("confirm", this.tempActive);
            this.visible = false;
        },
        // 重置筛选
        handleFiltrateReset() {
            this.localFilterParams = {
                filter_empty_images: "1",
                star: "",
                price_type: "",
                is_unlimited: "",
                is_new_face: "",
                code_mode: "",
            };
        },
        // 确认筛选
        handleFiltrateConfirm() {
            if (!this.showFiltrateConfirm) {
                this.visible = false;
                return;
            }
            this.$emit("filtrate-confirm", { ...this.localFilterParams });
            this.visible = false;
        },
        // 选择体型（从提示区域点击）
        handleSelectBody() {
            this.cutShowTra = true;
            this.$emit("select-body");
        },
        // 关闭抽屉
        handleClose() {
            this.cutShowTra = false;
        },
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/common/drawer.less";
</style>

<style lang="less">
@import "~@/assets/css/common/face-body/miniprogram/list.less";
@import "~@/assets/css/common/face-body/miniprogram/dark-mode.less";
</style>
