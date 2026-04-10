<template>
    <div class="m-pet-tabs">
        <div class="m-pet-tabs-wrapper">
            <PvxSearch :items="searchItems" :initValue="initFormData" @search="handleSearch" />
            <div v-if="!isMininote" class="m-pet-tabs-selectors">
                <el-select v-model="formData.map" :class="{ active: formData.map }" filterable class="u-select"
                    clearable placeholder="全部">
                    <el-option label="全部" value=""></el-option>
                    <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                    <template #prefix>地图</template>
                </el-select>
                <el-select v-model="formData.Source" :class="{ active: formData.Source }" filterable class="u-select"
                    clearable placeholder="全部">
                    <el-option v-for="(item, index) in Source" :key="'laiyuan' + index" :label="item.name"
                        :value="item.source">
                    </el-option>
                    <template #prefix>来源</template>
                </el-select>
            </div>
        </div>
        <div v-if="isMininote" class="m-pet-tabs-selectors m-pet-tabs-selectors__mobile">
            <el-select v-model="formData.map" :class="{ active: formData.map }" filterable class="u-select" clearable
                placeholder="全部">
                <el-option label="全部" value=""></el-option>
                <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
                <template #prefix>地图</template>
            </el-select>
            <el-select v-model="formData.Source" :class="{ active: formData.Source }" filterable class="u-select"
                clearable placeholder="全部">
                <el-option v-for="(item, index) in Source" :key="'laiyuan' + index" :label="item.name"
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
                type: item.class,
                name: item.name
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
.m-pet-tabs {
    .m-pet-tabs-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        padding: 10px 15px;
        background: #fff;

        .pvx-search-wrapper {
            box-shadow: none;
            padding: 0;
            height: auto;
            flex: 1;

            .search-group {
                flex-wrap: nowrap;
                align-items: center;
            }
        }
    }

    .m-pet-tabs-selectors {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-shrink: 0;

        .u-select {
            width: 160px;

            .el-select__wrapper {
                border-radius: 30px;
                height: 40px;
                border: 2px solid #f3f4f5;
                background: #f3f4f5;
                color: #b0b0b0;
                box-shadow: none;

                &.is-focused {
                    background: rgba(209, 100, 0, 0.1);
                    border: 2px solid #d16400;
                    box-shadow: none !important;

                    .el-select__prefix {
                        color: #d16400;
                    }
                }
            }

            .el-select__input {
                font-weight: 700;
                color: #000;
            }
        }
    }

    .m-pet-tabs-selectors__mobile {
        margin-top: 10px;
        padding: 0 15px;
        box-sizing: border-box;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        background: #fff;
    }
}

@media screen and (max-width: 1280px) {
    .m-pet-tabs {
        .m-pet-tabs-wrapper {
            flex-wrap: wrap;
            padding: 10px 15px;
        }
    }
}
</style>
