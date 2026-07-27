<template>
    <div class="m-pvx-pet-tabs">
        <PvxSearch
            :items="searchItems"
            :initValue="initFormData"
            variant="modern"
            inline-search-icon
            i18n-scope="pages.pet.ui.search"
            popper-class="m-pvx-pet-filter-popover"
            @search="handleSearch"
        />
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
            queryParams: {},
            isFirstSearch: true
        };
    },
    computed: {
        typeOptions() {
            return [
                {
                    type: "",
                    name: this.$t("pages.pet.ui.types.all"),
                },
                ...this.types.filter((item) => item.class !== "").map(item => ({
                    type: item.class,
                    name: this.$t(`pages.pet.ui.types.${item.class}`),
                })),
            ];
        },
        sourceOptions() {
            return this.Source.map(item => ({
                source: item.source ?? item.ID,
                name: item.source === "" ? this.$t("pages.pet.ui.filters.allSources") : item.name || item.TypeName
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
                    type: "filter",
                    options: [
                        {
                            type: "select",
                            key: "map",
                            name: this.$t("pages.pet.ui.filters.map"),
                            filterable: true,
                            showLabel: true,
                            popperClass: "m-pvx-pet-map-select-popper",
                            options: this.mapList,
                        },
                        {
                            type: "radio",
                            key: "Source",
                            name: this.$t("pages.pet.ui.filters.source"),
                            options: this.sourceOptions.map((item) => ({
                                key: item.source,
                                value: item.name,
                                default: item.source === "",
                            })),
                        },
                    ],
                },
                {
                    key: "Name",
                    name: this.$t("pages.pet.ui.search.petName")
                }
            ];
        },
        initFormData() {
            return {
                Class: this.active || "",
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
                this.formData.Class = val || "";
            }
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
            this.formData = {
                ...this.formData,
                ...data,
            };

            // 首次搜索不触发事件
            if (this.isFirstSearch) {
                this.isFirstSearch = false;
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
    }
};
</script>
