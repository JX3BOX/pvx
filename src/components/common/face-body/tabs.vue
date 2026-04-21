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
    <div class="m-pvx-face-tabs">
        <PvxSearch :items="searchItems" :initValue="initSearchValue" :active="filterOpen" @search="handleSearch"
            ref="pvxSearchRef" popperClass="m-pvx-face-filter-popover">
            <template #extra>
                <div class="m-pvx-toolbar-item m-pvx-toolbar-publish">
                    <a :href="link.data" target="_blank">
                        <el-button type="primary" class="u-pvx-analysis"> 数据解析 </el-button>
                    </a>
                    <a :href="publish_link(link.key)" target="_blank">
                        <div class="u-pvx-face-publish">
                            <img svg-inline src="@/assets/img/face/face-publish.svg" class="u-pvx-img" />
                            <span>发布作品</span>
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
                        name: item.label,
                    })),
                });
            }
            const filterOptions = [];
            if (this.client === "std") {
                filterOptions.push({
                    type: "radio",
                    key: "is_new_face",
                    name: "脸型风格",
                    options: [
                        { key: -1, value: "全部" },
                        { key: 1, value: "写实" },
                        { key: 0, value: "写意" },
                    ],
                });
            }
            filterOptions.push({
                type: "checkbox",
                key: "filter_flags",
                name: "筛选条件",
                options: [
                    { label: "全部", value: "all" },
                    { label: "精选", value: "star" },
                    { label: "免费", value: "price_type" },
                    { label: "可新建", value: "is_unlimited" },
                ],
            });
            filterOptions.push({
                type: "radio",
                key: "filter_empty_images",
                name: "图片筛选",
                options: [
                    { key: 0, value: "全部" },
                    { key: 1, value: "有图" },
                ],
            });
            filterOptions.push({
                type: "radio",
                key: "code_mode",
                name: "捏脸码",
                options: [
                    { key: "", value: "全部" },
                    { key: 1, value: "捏脸码" },
                ],
            });
            items.push({
                type: "filter",
                options: filterOptions,
            });
            items.push({
                key: "title",
                name: "搜索内容",
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
            console.log("参数变化", data, this.queryParams);
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
                if (this.hasOwnProperty(key)) {
                    this[key] = this.$route.query[key];
                }
            });
        }
    },
};
</script>

<style lang="less">
.m-pvx-face-tabs {
    .pvx-search-wrapper {
        .type-list {
            .type-item {

                &:hover,
                &.is-active {
                    background-color: @faceColor !important;

                    .el-radio-button__inner {
                        background-color: @faceColor !important;

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

    .m-pvx-toolbar-publish {
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

    .u-pvx-face-publish {
        .pr;
        .pointer;
        .bold;
        .pr(10px);
        .size(130px, 38px);
        .fz(16px, 38px);
        .r(5px);
        background: @faceColor;
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

.m-pvx-face-filter-popover {
    .filter-content {

        .is-active,
        .is-checked {

            .el-radio-button__inner,
            .el-checkbox-button__inner {
                background-color: @faceColor !important;
                border-color: @faceColor !important;
                color: #fff;

                &:hover {
                    background-color: @faceColor !important;
                    color: #fff;
                }
            }
        }

        .el-radio-button__inner,
        .el-checkbox-button__inner {
            &:hover {
                background-color: @faceColor !important;
                color: #fff;
            }
        }

    }
}

@media screen and (max-width: @ipad-y) {
    .m-pvx-face-tabs {

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

            .type-item {
                &:first-child {
                    margin-right: 0 !important;
                    width: 100% !important;
                    flex-shrink: 0;
                }

                &:not(:first-child) {
                    width: calc(50% - 20px) !important;
                }
            }
        }

        .m-pvx-toolbar-publish {
            order: -1;
            flex-direction: row-reverse;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 10px;
        }
    }
}
</style>
