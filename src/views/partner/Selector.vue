<!--
 * Partner Selector - 侠客行左侧选择组件
 *
 * @description 侠客行模块的左侧选择区，包含搜索框、分类标签卡片、展开/收起
 * 对齐 Figma Component 15 设计稿
 *
 * @features
 * - fixed 布局，固定位置不随浏览器滚动
 * - 搜索框支持防抖搜索（300ms）
 * - 分类标签卡片（圆形头像 + 名字，选中态紫色背景白字）
 * - 自定义滚动条（Figma: 15px宽，轨道 rgba(0,0,0,0.05)，滑块 rgba(0,0,0,0.12)）
 * - 展开 / 收起（底部三角形指示器）
 *
 * @emits
 * - select: 选择侠客时触发，参数为 partner 对象
 * - filterChange: 筛选标签切换时触发
 -->
<template>
    <div class="m-pvx-partner-selector">
        <div class="m-partner-selector__body" :style="bodyStyle">
            <!-- 搜索框（Figma: 前进后退, 40px高, 圆角30px, 背景 rgba(243,244,245,0.96)） -->
            <div class="m-partner-selector__search">
                <div class="u-partner-search-box">
                    <input
                        v-model="searchKeyword"
                        class="u-partner-search-input"
                        :placeholder="$t('pages.partner.ui.searchPlaceholder')"
                        @input="handleSearch"
                    />
                    <img class="u-partner-search-icon" src="@/assets/img/partner/search.svg" alt="" />
                </div>
            </div>

            <!-- 分类标签卡片区域（Figma: Frame 323, 水平布局, gap 20px） -->
            <div class="m-partner-selector__categories">
                <!-- 标签行（每行2个，Figma: Frame 289/291） -->
                <div
                    v-for="(row, rowIndex) in categoryRows"
                    :key="rowIndex"
                    class="m-partner-category-row"
                >
                    <div
                        v-for="partner in row"
                        :key="partner.id"
                        class="u-partner-category-item"
                        :class="{ 'is-active': selectedId === partner.id }"
                        @click="handleSelect(partner)"
                    >
                        <!-- 圆形头像（Figma: Ellipse 4, 75x75, 灰色占位） -->
                        <div class="u-partner-category-avatar">
                            <img v-if="partner.avatar" :src="partner.avatar" :alt="partner.name" />
                        </div>
                        <!-- 名字（Figma: 选中 Bold 16px 白, 未选中 Regular 14px 黑 opacity 0.6） -->
                        <span class="u-partner-category-name">{{ partner.name }}</span>
                    </div>
                </div>

                <!-- 空态 -->
                <div v-if="filteredList.length === 0" class="u-partner-category-empty">
                    {{ $t("pages.partner.ui.noMatchingPartners") }}
                </div>
            </div>
        </div>

        <!-- 展开 / 收起（Figma: Frame 290, 居中三角形 12x12, 底部 padding 10px） -->
        <div class="m-partner-selector__toggle" @click="toggleExpand">
            <svg class="u-partner-toggle-arrow" :class="{ 'is-collapsed': !expanded }" width="12" height="12" viewBox="0 0 12 12" fill="#D9D9D9">
                <polygon points="6,2 10,8 2,8" />
            </svg>
        </div>
    </div>
</template>

<script>
import { LIST_EXPANDED_MAX_HEIGHT, LIST_COLLAPSED_MIN_HEIGHT } from "./const";

export default {
    name: "PartnerSelector",
    props: {
        // 侠客列表
        partnerList: {
            type: Array,
            default: () => [],
        },
        // 当前选中的侠客 ID
        selectedId: {
            type: [Number, String],
            default: null,
        },
        // 外部控制的展开状态（受控）
        expanded: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["select", "search", "toggleExpand", "filterChange"],
    data() {
        return {
            searchKeyword: "",
            // 每行显示的分类卡片数量（Figma: 每行2个）
            itemsPerRow: 2,
        };
    },
    computed: {
        // 控制列表主体高度
        bodyStyle() {
            const max = this.expanded ? LIST_EXPANDED_MAX_HEIGHT : LIST_COLLAPSED_MIN_HEIGHT;
            return { maxHeight: `${max}px` };
        },
        // 客户端实时过滤
        filteredList() {
            const keyword = this.searchKeyword.trim().toLowerCase();
            if (!keyword) return this.partnerList;
            return this.partnerList.filter((p) => {
                return (
                    (p.name && p.name.toLowerCase().includes(keyword)) ||
                    (p.nickname && p.nickname.toLowerCase().includes(keyword)) ||
                    (p.introduce && p.introduce.toLowerCase().includes(keyword))
                );
            });
        },
        // 将列表按每行2个分组（Figma: Frame 289/291 各含2个分类卡片）
        categoryRows() {
            const rows = [];
            for (let i = 0; i < this.filteredList.length; i += this.itemsPerRow) {
                rows.push(this.filteredList.slice(i, i + this.itemsPerRow));
            }
            return rows;
        },
    },
    methods: {
        handleSearch() {
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(() => {
                this.$emit("search", this.searchKeyword.trim());
            }, 300);
        },
        handleSelect(partner) {
            if (this.selectedId === partner.id) return;
            this.$emit("select", partner);
        },
        toggleExpand() {
            this.$emit("toggleExpand", !this.expanded);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/partner/partner-selector.less";
</style>
