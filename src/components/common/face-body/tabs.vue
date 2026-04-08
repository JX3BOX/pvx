<template>
    <div class="m-face-tabs">
        <PvxSearch :items="searchItems" :initValue="initSearchValue" :active="filterOpen" @search="handleSearch"
            ref="pvxSearchRef" popperClass="m-face-filter-popover">
            <template #extra>
                <div class="m-toolbar-item m-toolbar-publish">
                    <a :href="link.data" target="_blank">
                        <el-button type="primary" class="u-analysis"> 数据解析 </el-button>
                    </a>
                    <a :href="publish_link(link.key)" target="_blank">
                        <div class="u-face-publish">
                            <img svg-inline src="@/assets/img/face/face-publish.svg" class="u-img" />
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
import { __imgPath } from "@/utils/config";
import PvxSearch from "@/components/PvxSearch.vue";
import { debounce } from "lodash";

export default {
    name: "tabs",
    props: ["body_types", "active", "link"],
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
            screenWidth: window.innerWidth,
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
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
            const value = {
                body_type: this.active,
                title: this.title,
                is_new_face: this.is_new_face,
                filter_empty_images: this.filter_empty_images,
                code_mode: this.code_mode,
            };
            const filterFlags = [];
            if (!this.star && !this.price_type && !this.is_unlimited) {
                filterFlags.push("all");
            } else {
                if (this.star) filterFlags.push("star");
                if (this.price_type) filterFlags.push("price_type");
                if (this.is_unlimited) filterFlags.push("is_unlimited");
            }
            value.filter_flags = filterFlags;
            return value;
        },
        params() {
            const _params = {};
            if (this.star) _params.star = 1;
            if (this.is_unlimited) _params.is_unlimited = 1;
            if (this.title) _params.title = this.title;
            if (this.price_type) _params.price_type = 0;
            if (this.filter_empty_images) _params.filter_empty_images = true;
            _params.is_new_face = this.is_new_face;
            _params.body_type = this.active;
            if (this.code_mode) {
                _params.code_mode = this.code_mode;
            }
            return _params;
        },
    },

    created() {
        this.emitChange = debounce((params) => {
            this.$emit("change", params);
        }, 300);
    },

    methods: {
        getThumbnail: function (filename) {
            return __imgPath + "image/face/" + filename + ".jpg";
        },
        publish_link(key) {
            return publishLink(key);
        },
        handleSearch(data) {
            if (data.body_type !== undefined && data.body_type !== this.active) {
                this.$emit("setActive", data.body_type);
            }
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
            this.emitChange(this.params);
        },
        handleResize() {
            this.screenWidth = window.innerWidth;
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
        window.addEventListener("resize", this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
};
</script>

<style lang="less">
.m-face-tabs {
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

    .m-toolbar-publish {
        .flex;
    }

    .u-analysis {
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

    .u-face-publish {
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

        .u-img {
            .pa;
            .lb(0);
            .w(65px);
        }

        &:hover {
            filter: brightness(1.1);
        }
    }

}

.m-face-filter-popover {
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
    .m-face-tabs {

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

            // 移动端布局时，第一个占满全屏
            .type-item {
                &:first-child {
                    margin-right: 0 !important;
                    width: 100% !important;
                    flex-shrink: 0;
                }

                // 其他项宽度自适应
                &:not(:first-child) {
                    width: calc(50% - 20px) !important;
                }
            }
        }

        .m-toolbar-publish {
            order: -1;
            flex-direction: row-reverse;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 10px;
        }
    }
}
</style>
