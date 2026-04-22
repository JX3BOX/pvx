<template>
    <div class="m-furniture-category">
        <!-- 二级分类标签 -->
        <div class="u-tabs" v-if="list.length">
            <div
                class="u-item"
                v-for="(item, i) in list"
                :key="i"
                :class="{ active: categoryKey == item.id }"
                @click="onCategoryKey(item.id)"
            >
                <i class="u-img" :class="'u-icon-' + item.icon"></i>
                <span>{{ item.name }}</span>
            </div>
        </div>

        <!-- 筛选条件 -->
        <div class="u-box">
            <!-- 来源途径 -->
            <div class="u-margin">
                <el-select v-model="source" placeholder="来源途径" clearable @change="onSourceChange">
                    <el-option v-for="item in categoryData.sourceList" :key="item" :label="item" :value="item"></el-option>
                </el-select>
            </div>

            <!-- 家园等级 -->
            <div class="u-margin">
                <el-select v-model="level" placeholder="家园等级" clearable @change="onLevelChange">
                    <el-option v-for="item in categoryData.levelList" :key="item" :label="item" :value="item"></el-option>
                </el-select>
            </div>

            <!-- 可交互 -->
            <div class="u-margin">
                <el-select v-model="interact" placeholder="可交互" clearable @change="onInteractChange">
                    <el-option label="是" :value="1"></el-option>
                    <el-option label="否" :value="0"></el-option>
                </el-select>
            </div>

            <!-- 庐园广记 -->
            <div class="u-margin">
                <el-select v-model="album" placeholder="庐园广记" clearable @change="onAlbumChange">
                    <el-option label="是" :value="1"></el-option>
                    <el-option label="否" :value="0"></el-option>
                </el-select>
            </div>

            <!-- 园宅会赛匹配 -->
            <div class="u-margin">
                <el-checkbox v-model="matchValue" @change="onMatchChange">园宅会赛匹配</el-checkbox>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * @description 家具分类筛选组件
 * @description 提供家具列表的二级分类标签和筛选条件
 * @author ymg
 * @version 1.0.0
 * 
 * @props
 * - list {Array} 二级分类列表
 * - isChange {Boolean} 是否切换了一级分类
 * - categoryData {Object} 筛选条件数据（来源列表、等级列表等）
 * - furniture {Array} 园宅会赛家具数据
 * 
 * @events
 * - onCategoryKey: 二级分类切换事件
 * - match: 园宅会赛匹配状态变化事件
 * 
 * @example
 * <FurnitureCategory
 *   :list="categoryList"
 *   :isChange="isChanging"
 *   :categoryData="filterData"
 *   :furniture="matchFurniture"
 *   @onCategoryKey="handleCategoryChange"
 *   @match="handleMatchChange"
 * />
 * 
 * @notes
 * - 支持来源途径、家园等级、可交互、庐园广记等筛选条件
 * - 园宅会赛匹配功能会自动筛选本周比赛所需家具类型
 * - 切换一级分类时会重置所有筛选条件
 */
export default {
    name: "FurnitureCategory",
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        isChange: {
            type: Boolean,
            default: false,
        },
        categoryData: {
            type: Object,
            default: () => ({}),
        },
        furniture: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            categoryKey: "",
            source: "",
            level: "",
            interact: "",
            album: "",
            matchValue: false,
        };
    },
    watch: {
        isChange(val) {
            if (val) {
                this.resetFilters();
            }
        },
    },
    methods: {
        onCategoryKey(id) {
            this.categoryKey = id;
            this.$emit("onCategoryKey", { nCatag2Index: id });
        },
        onSourceChange(val) {
            this.$emit("onCategoryKey", { szSource: val || undefined });
        },
        onLevelChange(val) {
            this.$emit("onCategoryKey", { LevelLimit: val || undefined });
        },
        onInteractChange(val) {
            this.$emit("onCategoryKey", { bInteract: val === "" ? undefined : val });
        },
        onAlbumChange(val) {
            this.$emit("onCategoryKey", { bAlbum: val === "" ? undefined : val });
        },
        onMatchChange(val) {
            this.$emit("match", val);
        },
        setMatch(val) {
            this.matchValue = val;
        },
        resetFilters() {
            this.categoryKey = "";
            this.source = "";
            this.level = "";
            this.interact = "";
            this.album = "";
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/furniture.less";
</style>
