<template>
    <el-drawer
        v-model="visible"
        direction="btt"
        :with-header="false"
        :modal-append-to-body="false"
        append-to-body
        class="c-drawer"
        @close="handleClose"
    >
        <!-- 体型切换区域 -->
        <transition :name="cutShowTra ? 'slide-up' : ''">
            <div class="m-cut" v-if="showCut">
                <!-- 全部体型选项 -->
                <div
                    class="u-cut-all"
                    :class="{ 'is-active': tempActive === -1 }"
                    @click="tempActive = -1"
                >
                    <img class="u-icon" src="@/assets/img/pvxsuspension/all.svg" svg-inline />
                    全部体型
                </div>
                
                <!-- 体型列表 -->
                <div class="u-cut-box">
                    <div
                        class="u-cut-item"
                        v-for="(item, index) in typeList"
                        :key="index"
                        :class="{ 'is-active': tempActive === item.value }"
                        @click="tempActive = item.value"
                    >
                        <img class="u-icon" :src="getTypeIcon(item.value)" svg-inline />
                        <span>{{ item.label }}</span>
                    </div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="u-cut-btn">
                    <div class="u-report-btn" @click="handleReset">重置</div>
                    <div class="u-confirm-btn" :class="{ active: showHighlightConfirm }" @click="handleConfirm">
                        确定
                    </div>
                </div>
            </div>
        </transition>
        
        <!-- 请先选择体型提示 -->
        <div class="m-no-body" v-if="noBody">
            <div class="u-icon">
                <img src="@/assets/img/pvxsuspension/report.svg" svg-inline />
                <div class="u-tips">请先选择体型</div>
            </div>
            <div class="u-btn" @click="handleSelectBody">选择体型</div>
        </div>
        
        <!-- 筛选区域 -->
        <div class="m-filtrate" v-if="showFiltrate">
            <!-- 类型筛选（仅脸型有写实/写意） -->
            <template v-if="showFaceTypeFilter">
                <div class="u-filtrate-title">类型</div>
                <div class="u-box">
                    <div
                        class="u-item"
                        :class="{ active: !filterParams.is_new_face }"
                        @click="toggleFilter('is_new_face', '')"
                    >
                        全部
                    </div>
                    <div
                        class="u-item"
                        :class="{ active: filterParams.is_new_face === '1' }"
                        @click="toggleFilter('is_new_face', '1')"
                    >
                        写实
                    </div>
                    <div
                        class="u-item"
                        :class="{ active: filterParams.is_new_face === '0' }"
                        @click="toggleFilter('is_new_face', '0')"
                    >
                        写意
                    </div>
                </div>
            </template>
            
            <!-- 标签筛选 -->
            <div class="u-filtrate-title">标签</div>
            <div class="u-box">
                <div
                    class="u-item all"
                    :class="{
                        active:
                            !filterParams.star &&
                            filterParams.price_type === '' &&
                            !filterParams.is_unlimited,
                    }"
                    @click="resetTagFilters"
                >
                    全部
                </div>
                <div
                    class="u-item"
                    :class="{ active: filterParams.star === '1' }"
                    @click="toggleFilter('star', '1', filterParams.star === '1')"
                >
                    精选
                </div>
                <div
                    class="u-item"
                    :class="{ active: filterParams.price_type === '0' }"
                    @click="toggleFilter('price_type', '0', filterParams.price_type === '0')"
                >
                    免费
                </div>
                <div
                    class="u-item"
                    :class="{ active: filterParams.is_unlimited === '1' }"
                    @click="toggleFilter('is_unlimited', '1', filterParams.is_unlimited === '1')"
                >
                    可新建
                </div>
            </div>
            
            <!-- 其他筛选 -->
            <div class="u-filtrate-title">其他</div>
            <div class="u-box">
                <div
                    class="u-item all"
                    :class="{ active: !filterParams.filter_empty_images }"
                    @click="resetOtherFilters"
                >
                    全部
                </div>
                <div
                    class="u-item"
                    :class="{ active: filterParams.filter_empty_images }"
                    @click="toggleFilter('filter_empty_images', '1')"
                >
                    只看有图
                </div>
                <!-- 脸型特有：只看捏脸码 -->
                <div
                    class="u-item"
                    v-if="type === 'face'"
                    :class="{ active: filterParams.code_mode }"
                    @click="toggleFilter('code_mode', '1')"
                >
                    只看捏脸码
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="u-btn">
                <div class="u-report-btn" @click="handleFiltrateReset">重置</div>
                <div class="u-confirm-btn" :class="{ active: showFiltrateConfirm }" @click="handleFiltrateConfirm">
                    确定
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
import { cloneDeep } from "lodash";

/**
 * MobileFilterDrawer - 移动端筛选抽屉组件
 * 用于脸型/体型移动端列表页的体型切换和筛选功能
 */
export default {
    name: "MobileFilterDrawer",
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
            return JSON.stringify(this.localFilterParams) !== JSON.stringify(this.filterParams);
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
                this.localFilterParams = cloneDeep(val);
            },
            immediate: true,
            deep: true,
        },
    },
    methods: {
        // 获取体型图标
        getTypeIcon(value) {
            const iconMap = {
                1: require("@/assets/img/pvxsuspension/man.svg"),
                2: require("@/assets/img/pvxsuspension/woman.svg"),
                5: require("@/assets/img/pvxsuspension/boy.svg"),
                6: require("@/assets/img/pvxsuspension/girl.svg"),
            };
            return iconMap[value] || "";
        },
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
            this.$emit("filtrate-confirm", cloneDeep(this.localFilterParams));
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

<style lang="less" scoped>
@fontColorLightMuted: rgba(255, 255, 255, 0.8);
@fontColorLightDisabled: rgba(255, 255, 255, 0.4);
@primaryColor: #fedaa3;
@primaryBg: #24292e;

.m-cut {
    .w(calc(100% - 1.5rem));
    margin: 0 auto;

    .u-cut-all {
        .flex;
        .flex(o);
        .mb(1rem);
        .r(0.75rem);
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        color: @fontColorLightMuted;
        .fz(1rem, 1.5rem);
        .bold(700);
        box-sizing: border-box;

        .u-icon {
            .w(1.25rem);
            .mr(0.25rem);
        }

        &.is-active {
            background: @primaryColor;
            color: @primaryBg;
        }
    }

    .u-cut-box {
        .flex;
        .mb(1rem);
        gap: 0.75rem;
        align-content: center;
        justify-content: space-between;

        .u-cut-item {
            .flex;
            .flex(o);
            .r(0.75rem);
            flex-direction: column;
            flex: 1;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            color: @fontColorLightMuted;
            box-sizing: border-box;

            &.is-active {
                background: @primaryColor;
                color: @primaryBg;
            }
        }
    }

    .u-cut-btn {
        .flex;
        .fz(1rem, 1.5rem);
        .bold(700);
        gap: 1.25rem;

        .u-report-btn {
            .r(0.75rem);
            flex-shrink: 0;
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            color: @fontColorLightMuted;
            box-sizing: border-box;
        }

        .u-confirm-btn {
            .r(0.75rem);
            flex: 1;
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            color: @fontColorLightDisabled;
            text-align: center;
            box-sizing: border-box;

            &.active {
                background: @primaryColor;
                color: @primaryBg;
            }
        }
    }
}

.m-no-body {
    .flex;
    .flex(o);
    flex-direction: column;

    .u-tips {
        color: @fontColorLightDisabled;
        .fz(0.875rem, 1.25rem);
        .bold(700);
        .flex;
        .flex(o);
    }

    .u-btn {
        .flex;
        .flex(o);
        .mt(1.25rem);
        padding: 0.75rem 1rem;
        gap: 0.5rem;
        align-self: stretch;
        .r(0.75rem);
        background: rgba(255, 255, 255, 0.1);
        color: @fontColorLightDisabled;
    }
}

.m-filtrate {
    padding: 0.75rem;
    box-sizing: border-box;

    .u-filtrate-title {
        .mb(0.75rem);
        color: rgba(255, 255, 255, 0.6);
    }

    .u-box {
        .flex;
        .mb(0.75rem);
        gap: 0.5rem;
        align-content: center;
        justify-content: space-between;

        .u-item {
            .flex;
            .flex(o);
            .r(0.75rem);
            flex: 1;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.05);
            color: @fontColorLightMuted;
            .fz(0.875rem, 1.25rem);
            .bold(400);
            box-sizing: border-box;

            &.active {
                background: @primaryColor;
                color: @primaryBg;
            }
        }
    }

    .u-btn {
        .flex;
        .fz(1rem, 1.5rem);
        .bold(700);
        gap: 1.25rem;

        .u-report-btn {
            .r(0.75rem);
            flex-shrink: 0;
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            color: @fontColorLightMuted;
            box-sizing: border-box;
        }

        .u-confirm-btn {
            .r(0.75rem);
            flex: 1;
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            color: @fontColorLightDisabled;
            text-align: center;
            box-sizing: border-box;

            &.active {
                background: @primaryColor;
                color: @primaryBg;
            }
        }
    }
}

// 滑入动画
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>
