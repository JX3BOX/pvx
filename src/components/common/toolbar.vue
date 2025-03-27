<template>
    <div class="m-common-toolbar">
        <div class="m-toolbar-tool">
            <slot name="tool"> </slot>
        </div>
        <div class="m-toolbar-box">
            <slot name="prefix"></slot>
            <div class="m-toolbar-item" v-if="types.length">
                <template v-if="!isMiniProgram">
                    <div
                        class="u-item"
                        :style="style(item.value)"
                        @mouseover="handleMouseOver(item.value)"
                        @mouseout="handleMouseOut"
                        v-for="(item, i) in types"
                        :key="i"
                        @click="changeType(item.value)"
                    >
                        {{ item.label }}
                    </div>
                </template>
                <template v-else>
                    <div class="m-toolbar-item__mobile">
                        <!-- 第一项 -->
                        <div class="u-current-item">
                            <div class="u-item" :style="style(activeType.value)">{{ activeType.label }}</div>
                            <div class="u-more" :class="{ 'is-active': showMore }" @click="showMore = !showMore">
                                <i class="el-icon-more"></i>
                            </div>
                        </div>
                        <div class="u-item-options" v-if="showMore">
                            <template v-for="(item, i) in types">
                                <div
                                    class="u-item"
                                    :key="i"
                                    v-if="item.value != active"
                                    @click="
                                        changeType(item.value);
                                        showMore = false;
                                    "
                                    :style="style(item.value)"
                                >
                                    {{ item.label }}
                                </div>
                            </template>
                        </div>
                        <div class="u-search">
                            <el-input
                                placeholder="请输入搜索内容"
                                v-model="title"
                                suffix-icon="el-icon-search"
                                class="u-search-input"
                            />
                        </div>
                    </div>
                </template>
            </div>
            <slot name="prepend"></slot>
            <div class="m-toolbar-item m-toolbar-search" v-if="search && !isMiniProgram">
                <slot name="filter"></slot>
                <div class="u-search">
                    <el-input
                        placeholder="请输入搜索内容"
                        v-model="title"
                        suffix-icon="el-icon-search"
                        class="u-search-input"
                    />
                </div>
            </div>
            <slot name="append"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "toolbar",
    inject: ["isMiniProgram"],
    props: {
        types: {
            type: Array,
            default: () => [],
        },
        search: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: "#6b52ff",
        },
        actColor: {
            type: String,
            default: "#ffffff",
        },
        active: {
            type: [String, Number],
            default: null,
        },
    },
    data: function () {
        return {
            type: null,
            hover: null,
            title: "",
            showMore: false,
        };
    },
    computed: {
        params() {
            const _params = {
                type: this.type,
            };
            if (this.title) _params.search = this.title;
            return _params;
        },
        activeType() {
            return this.types.find((item) => item.value === this.active);
        },
    },

    methods: {
        changeType(type) {
            this.type = type;
        },
        handleMouseOver(val) {
            this.hover = val;
        },
        handleMouseOut() {
            this.hover = null;
        },
        style(val) {
            const has = this.hover === val || this.type === val;
            const backgroundColor = has ? this.color : "#fff";
            const color = has ? this.actColor : "#949494";
            return { backgroundColor, color };
        },
    },
    watch: {
        params: {
            deep: true,
            handler: function (obj) {
                this.$emit("update", obj);
            },
        },
        types: {
            immediate: true,
            deep: true,
            handler: function (list) {
                if (list && list.length) {
                    this.type = this.active || list[0].value;
                }
            },
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/toolbar.less";
</style>
