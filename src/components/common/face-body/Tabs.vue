<!--
 * tabs - 列表页标签筛选组件
 * 
 * @description 用于脸型/体型列表页的搜索和筛选功能，包含搜索框、筛选器、发布入口
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @features
 * - 支持face和body两种类型
 * - 集成PvxSearch搜索组件
 * - 支持多条件筛选
 * - 支持数据解析入口
 * - 支持发布作品入口
 * 
 * @props
 * - type: 'face' | 'body' - 模块类型
 * - active: Number - 当前激活标签
 * - searchItems: Array - 搜索项配置
 * - initSearchValue: Object - 初始搜索值
 * - filterOpen: Boolean - 筛选面板是否打开
 * 
 * @events
 * - change: 筛选条件变化事件
 * 
 * @styles
 * - 样式文件: assets/css/face/list.less 或 assets/css/body/list.less
 -->
<template>
    <div class="m-pvx-fb__tabs" :class="{ 'm-pvx-fb__tabs--modern': variant === 'modern' }">
        <PvxSearch :items="searchItems" :initValue="initSearchValue" :active="filterOpen" @search="handleSearch"
            ref="pvxSearchRef" popperClass="m-pvx-fb__filter-popover" :variant="variant">
            <template #extra>
                <div class="m-pvx-toolbar__item m-pvx-toolbar__publish">
                    <a :href="link.data" target="_blank">
                        <el-button type="primary" class="u-pvx-analysis">{{ $t("pages.faceBody.actions.parse") }}</el-button>
                    </a>
                    <a :href="publish_link(link.key)" target="_blank">
                        <div class="u-pvx-fb-publish">
                            <img svg-inline src="@/assets/img/face/face-publish.svg" class="u-pvx-img" />
                            <span>{{ $t("pages.faceBody.actions.publish") }}</span>
                        </div>
                    </a>
                </div>
            </template>
        </PvxSearch>
    </div>
</template>

<script>
import { publishLink } from "@jx3box/jx3box-common/js/utils";
import PvxSearch from "@/components/PvxSearch.vue";
import { debounce, isEqual, cloneDeep } from "lodash";

export default {
    name: "tabs",
    emits: ["change"],
    props: {
        type: {
            type: String,
            default: "face",
            validator: (val) => ["face", "body"].includes(val),
        },
        body_types: {
            type: Array,
            default: () => [],
        },
        active: {
            type: [String, Number],
            required: true,
        },
        link: {
            type: Object,
            default: () => ({}),
        },
        variant: {
            type: String,
            default: "legacy",
            validator: (value) => ["legacy", "modern"].includes(value),
        },
    },
    components: { PvxSearch },
    data: function () {
        return {
            star: false,
            is_unlimited: false,
            price_type: false,
            filter_empty_images: 0,
            is_new_face: -1,
            code_mode: "",
            title: "",
            filterOpen: false,
            queryParams: {},
            localBodyType: this.active,
            isFirstSearch: true,
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        filterFlagsArray() {
            const flags = [];
            if (!this.star && !this.price_type && !this.is_unlimited) {
                flags.push("all");
            } else {
                if (this.star) flags.push("star");
                if (this.price_type) flags.push("price_type");
                if (this.is_unlimited) flags.push("is_unlimited");
            }
            return flags;
        },
        searchItems() {
            const items = [];
            if (this.body_types && this.body_types.length) {
                items.push({
                    type: "radio",
                    key: "body_type",
                    options: this.body_types.map((item) => ({
                        type: item.value,
                        name: item.labelKey ? this.$t(item.labelKey) : item.label,
                    })),
                });
            }
            const filterOptions = [];
            if (this.body_types && this.body_types.length) {
                filterOptions.push({
                    type: "radio",
                    key: "body_type",
                    name: this.$t("pages.faceBody.filters.roleCategory"),
                    phoneOnly: true,
                    options: this.body_types.map((item) => ({
                        key: item.value,
                        value: item.labelKey ? this.$t(item.labelKey) : item.label,
                        default: item.value === -1,
                    })),
                });
            }
            if (this.client === "std" && this.type === "face") {
                filterOptions.push({
                    type: "radio",
                    key: "is_new_face",
                    name: this.$t("pages.face.ui.filters.style"),
                    options: [
                        { key: -1, value: this.$t("pages.faceBody.filters.all"), default: true },
                        { key: 1, value: this.$t("pages.face.ui.filters.realistic") },
                        { key: 0, value: this.$t("pages.face.ui.filters.artistic") },
                    ],
                });
            }
            filterOptions.push({
                type: "checkbox",
                key: "filter_flags",
                name: this.$t("pages.faceBody.filters.conditions"),
                options: [
                    { label: this.$t("pages.faceBody.filters.all"), value: "all", default: true },
                    { label: this.$t("pages.faceBody.filters.featured"), value: "star" },
                    { label: this.$t("pages.faceBody.filters.free"), value: "price_type" },
                    { label: this.$t("pages.faceBody.filters.recreatable"), value: "is_unlimited" },
                ],
            });
            filterOptions.push({
                type: "radio",
                key: "filter_empty_images",
                name: this.$t("pages.faceBody.filters.images"),
                options: [
                    { key: 0, value: this.$t("pages.faceBody.filters.all"), default: true },
                    { key: 1, value: this.$t("pages.faceBody.filters.withImages") },
                ],
            });
            if (this.type === "face") {
                filterOptions.push({
                    type: "radio",
                    key: "code_mode",
                    name: this.$t("pages.face.ui.filters.faceCode"),
                    options: [
                        { key: "", value: this.$t("pages.faceBody.filters.all"), default: true },
                        { key: 1, value: this.$t("pages.face.ui.filters.faceCode") },
                    ],
                });
            }
            items.push({
                type: "filter",
                options: filterOptions,
            });
            items.push({
                key: "title",
                name: this.$t("pages.faceBody.search.content"),
            });
            return items;
        },
        initSearchValue() {
            return {
                body_type: this.localBodyType,
                title: this.title,
                is_new_face: this.is_new_face,
                filter_empty_images: this.filter_empty_images,
                code_mode: this.code_mode,
                filter_flags: this.filterFlagsArray,
            };
        },
        params() {
            const _params = {};
            if (this.star) _params.star = 1;
            if (this.is_unlimited) _params.is_unlimited = 1;
            if (this.title) _params.title = this.title;
            if (this.price_type) _params.price_type = 0;
            if (this.filter_empty_images) _params.filter_empty_images = true;
            _params.is_new_face = this.is_new_face;
            _params.body_type = this.localBodyType;
            if (this.code_mode) {
                _params.code_mode = this.code_mode;
            }
            return _params;
        },
    },

    watch: {
        active: {
            handler(val) {
                this.localBodyType = val;
            },
            immediate: true,
        },
    },

    created() {
        this.emitChange = debounce((params) => {
            if (!params || typeof params !== "object" || params instanceof Event) return;
            this.$emit("change", params);
        }, 300);
    },

    methods: {
        publish_link(key) {
            return publishLink(key);
        },
        syncSearchState(data) {
            this.title = data.title || "";
            this.is_new_face = data.is_new_face !== undefined ? data.is_new_face : -1;
            this.filter_empty_images = data.filter_empty_images !== undefined ? data.filter_empty_images : 0;
            this.code_mode = data.code_mode !== undefined ? data.code_mode : "";

            let filterFlags = data.filter_flags || [];
            if (typeof filterFlags === "string") {
                filterFlags = filterFlags.split(",").filter(Boolean);
            }
            const hasAll = filterFlags.includes("all");
            this.star = !hasAll && filterFlags.includes("star");
            this.price_type = !hasAll && filterFlags.includes("price_type");
            this.is_unlimited = !hasAll && filterFlags.includes("is_unlimited");

            if (data.body_type !== undefined) {
                this.localBodyType = data.body_type;
            }
        },
        handleSearch(data) {
            if (!data || typeof data !== "object" || data instanceof Event) return;

            if (isEqual(data, this.queryParams)) return;
            this.queryParams = cloneDeep(data);

            this.syncSearchState(data);

            if (this.isFirstSearch) {
                this.isFirstSearch = false;
                return;
            }

            this.emitChange(this.params);
        },
    },
    mounted() {
        if (this.$route.query) {
            Object.keys(this.$route.query).forEach((key) => {
                const value = this.$route.query[key];
                if (key === "body_type") {
                    const bodyType = Number(value);
                    if (this.body_types.some((item) => item.value === bodyType)) {
                        this.localBodyType = bodyType;
                    }
                } else if (["is_new_face", "filter_empty_images"].includes(key)) {
                    this[key] = Number(value);
                } else if (Object.prototype.hasOwnProperty.call(this, key)) {
                    this[key] = value;
                }
            });
        }
    },
};
</script>

<style lang="less">
.m-pvx-fb__tabs {
    .pvx-search-wrapper {
        .type-list {
            .type-item {

                &:hover,
                &.is-active {
                    // !important: 覆写 ElementPlus el-radio-button 内部样式
                    background-color: @pvx-color-face !important;

                    .el-radio-button__inner {
                        // !important: 覆写 ElementPlus el-radio-button__inner 内联样式
                        background-color: @pvx-color-face !important;

                    }
                }
            }
        }

        .filter-wrap {
            .filter-img {
                svg {
                    fill: #949494;
                    background-color: #fff;
                    border-radius: 50%;
                }
            }
        }
    }

    .m-pvx-toolbar__publish {
        .flex;
    }

    .u-pvx-analysis {
        .r(5px);
        .fz(16px);
        .h(38px);
        background-color: #e54059;
        border-color: #e54059;
        transition: 0.3s ease-out;
        margin-right: 10px;

        &:hover {
            filter: brightness(1.1);
        }
    }

    .u-pvx-fb-publish {
        .pr;
        .pointer;
        .bold;
        .pr(10px);
        .size(130px, 38px);
        .fz(16px, 38px);
        .r(5px);
        background: @pvx-color-face;
        color: #fff;

        span {
            .fr;
        }

        .u-pvx-img {
            .pa;
            .lb(0);
            .w(65px);
        }

        &:hover {
            filter: brightness(1.1);
        }
    }

}

.m-pvx-fb__filter-popover {
    .filter-content {

        .is-active,
        .is-checked {

            .el-radio-button__inner,
            .el-checkbox-button__inner {
                // !important: 覆写 ElementPlus 按钮组件内部样式
                background-color: @pvx-color-face !important;
                border-color: @pvx-color-face !important;
                color: #fff;

                &:hover {
                    // !important: 覆写 ElementPlus hover 内联样式
                    background-color: @pvx-color-face !important;
                    color: #fff;
                }
            }
        }

        .el-radio-button__inner,
        .el-checkbox-button__inner {
            &:hover {
                background-color: @pvx-color-face !important;
                color: #fff;
            }
        }

    }
}

@media screen and (max-width: @ipad-y) {
    .m-pvx-fb__tabs {

        .pvx-search-wrapper {
            flex-direction: column;

            .search-group {
                flex-wrap: wrap;
                flex-direction: row;

                .filter-wrap {
                    width: 40px;
                    flex-shrink: 0;
                    margin-right: 0;
                }

                .input-wrap {
                    width: calc(100% - 40px);
                    flex-shrink: 0;
                }

            }
        }

        .type-list {
            width: 100%;

            .el-radio-group {
                flex-wrap: nowrap;
            }

            .type-item {
                width: auto !important;
                min-width: 72px;
                flex: none;
            }
        }

        .m-pvx-toolbar__publish {
            order: -1;
            flex-direction: row-reverse;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 10px;
        }
    }
}

@media screen and (max-width: @phone) {
    .m-pvx-fb__tabs {
        .pvx-search-wrapper .search-group {
            display: grid;
            grid-template-columns: 40px minmax(0, 1fr);
            gap: 8px;

            .type-list {
                display: none;
            }

            .filter-wrap {
                grid-column: 1;
                width: 40px;
            }

            .input-wrap {
                grid-column: 2;
                width: 100%;
                min-width: 0;
            }
        }
    }
}
</style>
