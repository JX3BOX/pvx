<template>
    <div class="pvx-search-wrapper" :class="{ 'pvx-search-wrapper--modern': variant === 'modern' }">
        <div class="search-group">
            <slot></slot>
            <div class="search-item" :class="{
                'type-list': item.type === 'radio',
                'filter-wrap': item.type === 'filter',
                'select-wrap': item.type === 'select',
                'input-wrap': !item.type,
                'select-active-wrap': item.type === 'select' && item.showActive,
            }" v-for="item in items" :key="item.key">
                <template v-if="item.type === 'radio'">
                    <el-radio-group v-model="formData[item.key]">
                        <el-radio-button class="type-item" :class="{ active: typeItem.type === formData[item.key] }"
                            v-for="typeItem in item.options.filter((rItem) => !rItem.link)" :key="typeItem.type"
                            :label="typeItem.type">{{ typeItem.name }}</el-radio-button>
                    </el-radio-group>
                    <template v-if="item.options.filter((rItem) => rItem.link).length">
                        <a :href="typeItem.link" target="blank" class="type-item"
                            v-for="typeItem in item.options.filter((rItem) => rItem.link)"
                            :key="typeItem.type">{{ typeItem.name }}</a>
                    </template>
                </template>
                <template v-if="item.type === 'filter' && item.options.length">
                    <el-popover ref="popover" :placement="isPhone() ? 'right' : 'bottom'" :width="!isPhone() && 420"
                        trigger="click" v-model="filterValue" :popper-class="popperClass">
                        <div class="filter-content">
                            <div class="filter-item" v-for="fItem in item.options" :key="fItem.key">
                                <el-select v-if="fItem.type === 'select'" :id="fItem.remote" class="select-wrapper"
                                    v-model="formData[fItem.key]" :multiple="fItem.multiple"
                                    :collapse-tags="fItem.multiple" clearable :filterable="fItem.filterable"
                                    :placeholder="`请${fItem.remote ? '输入' : '选择'}${fItem.name}`"
                                    :remote="Boolean(fItem.remote)" :remote-method="remoteMethod"
                                    :loading="selectLoading === fItem.remote" :default-first-option="true"
                                    @focus="selectFocus" style="width: 100%">
                                    <el-option v-for="option in fItem.remote ? fItem.options : fItem.options"
                                        :key="option.value" :label="fItem.showValue ? option.label + '(' + option.value + ')' : option.label
                                            " :value="option.value">
                                    </el-option>
                                </el-select>
                                <div v-if="fItem.type === 'checkbox'" class="check-box-wrapper">
                                    <div class="name">{{ fItem.name }}</div>
                                    <el-checkbox-group v-model="checkboxData[fItem.key]"
                                        @change="checkboxChange(fItem.key)">
                                        <el-checkbox-button v-for="option in fItem.options" :label="option.value"
                                            :key="option.value" :custom-label="option.label"
                                            @mouseenter="labelSet($event)" @mouseleave="labelRemove($event)">
                                            {{
                                                customLabel === option.label
                                                    ? customLabel
                                                    : option.label.indexOf("·") > -1
                                                        ? option.label.split("·")[1]
                                                        : option.label
                                            }}
                                        </el-checkbox-button>
                                    </el-checkbox-group>
                                </div>
                                <div v-if="fItem.type === 'radio'" class="check-box-wrapper">
                                    <div class="name">{{ fItem.name }}</div>
                                    <el-radio-group v-model="formData[fItem.key]">
                                        <el-radio-button
                                            class="type-item"
                                            :class="{ active: radioItem.value === formData[fItem.key] }"
                                            v-for="radioItem in fItem.options"
                                            :key="radioItem.key || radioItem.value"
                                            :label="radioItem.key"
                                            :disabled="radioItem.disabled"
                                        >
                                            {{ radioItem.value }}
                                        </el-radio-button>
                                    </el-radio-group>
                                </div>
                            </div>
                            <el-row v-if="item.options.length">
                                <el-col :offset="20" :span="4">
                                    <el-button size="small" type="info" plain @click="reset">重置</el-button>
                                </el-col>
                            </el-row>
                        </div>
                        <template #reference>
                            <div class="filter-img" :class="filterValue && 'active'">
                                <img svg-inline src="@/assets/img/common/filter.svg" />
                            </div>
                        </template>
                    </el-popover>
                </template>
                <template v-if="item.type === 'select' && item.options.length">
                    <label v-if="item.showLabel">{{ item.name }}</label>
                    <el-select :id="item.remote" class="select-wrapper" v-model="formData[item.key]"
                        :multiple="item.multiple" :collapse-tags="item.multiple" :filterable="item.filterable"
                        :placeholder="!item.noPlaceholder ? `请${item.remote ? '输入' : '选择'}${item.name}` : '请选择'"
                        :remote="Boolean(item.remote)" :remote-method="remoteMethod"
                        :loading="selectLoading === item.remote" :default-first-option="true" @focus="selectFocus"
                        :style="!item.showLabel && 'width: 100%'">
                        <el-option v-for="option in item.remote ? item.options : item.options" :key="option.value"
                            :label="item.showValue ? option.label + '(' + option.value + ')' : option.label"
                            :value="option.value">
                        </el-option>
                    </el-select>
                </template>
                <template v-if="!item.type">
                    <el-input v-model="formData[item.key]" class="search-input" :placeholder="`输入${item.name}搜索`"
                        clearable>
                        <template #suffix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                </template>
            </div>
        </div>
        <slot name="extra"></slot>
    </div>
</template>

<script>
import { Search } from "@element-plus/icons-vue";
import { isPhone } from "@/utils/index";
import { cloneDeep } from "lodash";
export default {
    name: "PvxSearch",
    components: { Search },
    props: {
        items: {
            type: Array,
            required: true,
        },
        initValue: {
            type: Object,
            default: () => { },
        },
        active: {
            type: Boolean,
            default: false,
        },
        popperClass: {
            type: String,
            default: "",
        },
        variant: {
            type: String,
            default: "legacy",
            validator: (value) => ["legacy", "modern"].includes(value),
        },
    },
    data() {
        return {
            filterValue: false,
            formData: {},
            currentMethod: "",
            currentOptions: [],
            selectLoading: "",
            checkboxData: {},
            customLabel: "",
        };
    },
    watch: {
        formData: {
            deep: true,
            handler(data) {
                this.$emit("search", data);
            },
        },
        initValue: {
            immediate: true,
            deep: true,
            handler: function (initValue) {
                const items = this.items;
                const formData = {};
                items.forEach((item) => {
                    if (item.type !== "filter") {
                        formData[item.key] = "";
                    } else {
                        const options = item.options;
                        options.forEach((oItem) => {
                            formData[oItem.key] = "";
                            let arr = [];
                            if (initValue && initValue[oItem.key]) {
                                const val = initValue[oItem.key];
                                if (Array.isArray(val)) {
                                    arr = val;
                                } else if (typeof val === "string") {
                                    arr = val.split(",").filter(Boolean);
                                }
                            }
                            this.checkboxData[oItem.key] = arr;
                        });
                    }
                });
                this.formData = { ...formData, ...initValue };
            },
        },
    },
    methods: {
        labelSet(e) {
            const label = e.target.getAttribute("custom-label");
            this.customLabel = label;
        },
        labelRemove(e) {
            this.customLabel = "";
        },
        isPhone,
        selectFocus(e) {
            this.currentMethod = e.target.id;
        },
        checkboxChange(key) {
            const value = this.checkboxData[key];
            const filterOptions = this.items.find((item) => item.type === "filter")?.options || [];
            const checkboxOption = filterOptions.find((item) => item.key === key);
            const hasAllOption = checkboxOption?.options?.some((opt) => opt.value === "all");
            if (hasAllOption && value.length > 0) {
                const lastSelected = value[value.length - 1];
                if (lastSelected === "all") {
                    this.checkboxData[key] = ["all"];
                } else {
                    const filtered = value.filter((v) => v !== "all");
                    this.checkboxData[key] = filtered;
                }
            }
            this.formData[key] = this.checkboxData[key].join(",");
        },
        reset() {
            const filterOptions = this.items.find((item) => item.type === "filter")?.options || [];
            filterOptions.forEach((item) => {
                if (item.type === "radio") {
                    const resetOption = item.options.find((option) => option.key === "" || option.value === "全部");
                    this.formData[item.key] = resetOption ? resetOption.key : "";
                } else if (item.type === "checkbox") {
                    const allOption = item.options.find((opt) => opt.value === "all");
                    if (allOption) {
                        this.checkboxData[item.key] = ["all"];
                        this.formData[item.key] = "all";
                    } else {
                        this.checkboxData[item.key] = [];
                        this.formData[item.key] = "";
                    }
                }
            });
            this.filterValue = false;
            this.$router.push({ query: "" });
        },
        async remoteMethod(query) {
            const currentMethod = this.currentMethod;
            this.selectLoading = currentMethod;
            await this.$parent[currentMethod]({ name: query }).then(() => {
                this.selectLoading = "";
            });
        },
    },
    mounted() {
        this.filterValue = this.active;
        if (this.active && this.$route.name === "furniture") {
            // 初始化激活搜索popover特殊处理
            document.getElementsByClassName("type-list")[0].style.width = "1080px";
        }
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/search.less";
</style>
