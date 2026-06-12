<template>
    <div class="m-pvx-pet-tabs">
        <div class="m-pvx-pet-tabs__wrapper">
            <PvxSearch :items="searchItems" :initValue="initFormData" @search="handleSearch" />
            <div v-if="!isMininote" class="m-pvx-pet-tabs__selectors">
                <el-select v-model="formData.map" :class="{ 'is-active': formData.map }" filterable class="u-select"
                    clearable placeholder="全部">
                    <el-option label="全部" value=""></el-option>
                    <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                    <template #prefix>地图</template>
                </el-select>
                <el-select v-model="formData.Source" :class="{ 'is-active': formData.Source }" filterable class="u-select"
                    clearable placeholder="全部">
                    <el-option v-for="(item, index) in sourceOptions" :key="'laiyuan' + index" :label="item.name"
                        :value="item.source">
                    </el-option>
                    <template #prefix>来源</template>
                </el-select>
            </div>
        </div>
        <div v-if="isMininote" class="m-pvx-pet-tabs__selectors m-pvx-pet-tabs__selectors--mobile">
            <el-select v-model="formData.map" :class="{ 'is-active': formData.map }" filterable class="u-select" clearable
                placeholder="全部">
                <el-option label="全部" value=""></el-option>
                <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
                <template #prefix>地图</template>
            </el-select>
            <el-select v-model="formData.Source" :class="{ 'is-active': formData.Source }" filterable class="u-select"
                clearable placeholder="全部">
                <el-option v-for="(item, index) in sourceOptions" :key="'laiyuan' + index" :label="item.name"
                    :value="item.source">
                </el-option>
                <template #prefix>来源</template>
            </el-select>
        </div>
    </div>
</template>

<script>
import PvxSearch from "@/components/PvxSearch.vue";
import { debounce, isEqual, cloneDeep } from "lodash";

export default {
    name: "tabs",
    components: { PvxSearch },
    props: {
        types: {
            type: Array,
            default: () => []
        },
        Source: {
            type: Array,
            default: () => []
        },
        active: {
            type: [String, Number],
            default: ""
        },
        mapList: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            formData: {
                Class: "",
                Name: "",
                map: "",
                Source: ""
            },
            screenWidth: window.innerWidth,
            queryParams: {},
            isFirstSearch: true
        };
    },
    computed: {
        isMininote() {
            return this.screenWidth <= 1280;
        },
        typeOptions() {
            return this.types.map(item => ({
                type: item.class ?? item.ID,
                name: item.name || item.TypeName
            }));
        },
        sourceOptions() {
            return this.Source.map(item => ({
                source: item.source ?? item.ID,
                name: item.name || item.TypeName
            }));
        },
        searchItems() {
            return [
                {
                    type: "radio",
                    key: "Class",
                    options: this.typeOptions
                },
                {
                    key: "Name",
                    name: "宠物名称"
                }
            ];
        },
        initFormData() {
            return {
                Class: this.active || (this.types[0]?.class || ""),
                Name: "",
                map: "",
                Source: ""
            };
        },
        // 计算最终请求参数
        params() {
            const params = {};
            if (this.formData.Source) {
                params.Source = this.formData.Source;
            }
            if (this.formData.Name) {
                params.Name = this.formData.Name;
            }
            if (this.formData.map) {
                params.map = this.formData.map;
            }
            if (this.formData.Class) {
                params.Class = this.formData.Class;
            }
            return params;
        }
    },
    watch: {
        active: {
            immediate: true,
            handler(val) {
                this.formData.Class = val || (this.types[0]?.class || "");
            }
        },
        // 监听地图和来源的变化
        'formData.map'() {
            this.handleFilterChange();
        },
        'formData.Source'() {
            this.handleFilterChange();
        }
    },
    created() {
        // 使用防抖函数，避免频繁触发事件
        this.emitChange = debounce((params) => {
            if (!params || typeof params !== "object" || params instanceof Event) return;
            this.$emit("change", params);
        }, 300);
    },
    methods: {
        // 处理搜索事件
        handleSearch(data) {
            if (!data || typeof data !== "object" || data instanceof Event) return;

            // 检查参数是否变化
            if (isEqual(data, this.queryParams)) return;

            this.queryParams = cloneDeep(data);

            // 同步表单数据
            this.formData.Class = data.Class;
            this.formData.Name = data.Name;

            // 首次搜索不触发事件
            if (this.isFirstSearch) {
                this.isFirstSearch = false;
                return;
            }

            // 构建并触发 change 事件
            const params = this.buildParams(this.formData);
            this.emitChange(params);
        },

        // 处理地图和来源的变化
        handleFilterChange() {
            // 首次搜索不触发事件
            if (this.isFirstSearch) {
                return;
            }

            // 构建并触发 change 事件
            const params = this.buildParams(this.formData);
            this.emitChange(params);
        },

        // 构建请求参数
        buildParams(formData) {
            const params = {};
            if (formData.Source) {
                params.Source = formData.Source;
            }
            if (formData.Name) {
                params.Name = formData.Name;
            }
            if (formData.map) {
                params.map = formData.map;
            }
            if (formData.Class) {
                params.Class = formData.Class;
            }
            return params;
        },

        handleResize() {
            this.screenWidth = window.innerWidth;
        }
    },
    mounted() {
        window.addEventListener("resize", this.handleResize);
    },
    unmounted() {
        window.removeEventListener("resize", this.handleResize);
    }
};
</script>

<style lang="less">
@import "~@/assets/css/pet/pc/tabs.less";
</style>
