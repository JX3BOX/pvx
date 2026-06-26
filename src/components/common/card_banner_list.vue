<template>
    <div class="m-card-banner-list">
        <div class="m-card-banner-list_header">
            <div class="u-title">
                <slot name="title"> </slot>
            </div>
            <div class="u-action">
                <slot name="action"> </slot>
            </div>
        </div>
        <div class="m-card-banner-list_box" :count="count" :minw="minw">
            <div class="m-cardlist-items" :style="`grid-template-columns: repeat(${count}, 1fr)`">
                <div class="m-cardlist-item" v-for="(item, index) in list" :key="index">
                    <!-- 调用渲染函数来渲染子元素 -->
                    <slot :item="item" :index="index">
                        <!-- 默认的渲染方式，显示item的文本 -->
                        {{ item }}
                    </slot>
                </div>
                <!-- replace slot 放在 grid 内（用于 face 模块的"查看全部"卡片） -->
                <div class="m-cardlist-item m-cardlist-replace--inline" v-if="$slots.replace" @click="update">
                    <slot name="replace"></slot>
                </div>
            </div>
            <!-- 默认的侧边换一组按钮（body 模块使用） -->
            <div class="m-cardlist-replace" v-if="!$slots.replace" @click="update">
                <img svg-inline src="@/assets/img/common/replace.svg" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "CardBannerList",
    props: ["data", "count", "items", "minw"],
    emits: ["update:load"],
    data: function () {
        return {
            fill: "#E1E1E1",
            number: 0,
        };
    },
    computed: {
        color() {
            return this.data?.color || "";
        },
        height() {
            return this.data?.height || 0;
        },
        type() {
            return this.data?.type;
        },
        list() {
            // count 只控制网格列数，不限制显示数量
            return this.items;
        },
    },
    mounted() { },
    methods: {
        changeColor(newColor) {
            this.fill = newColor;
        },
        update() {
            this.$emit("update:load", this.type);
        },
    },
};
</script>

<style lang="less">
.m-card-banner-list {
    .m-card-banner-list_header {
        .flex;
        .mb(20px);
        justify-content: space-between;
        align-items: flex-end;

        &.m-card-banner-list_header:empty {
            .mb(0);
        }

        .u-title {
            .fz(24px, 1);
            .bold(700);
            color: #24292e;
        }

        .u-action {
            cursor: pointer;
            color: #a5a5a5;
            .fz(16px, 21px);
        }
    }

    .m-card-banner-list_box {
        .flex;
        gap: 10px;
        align-items: stretch;
        justify-content: space-between;
        width: 100%;

        .m-cardlist-items {
            flex: 1;
            .grid;
            gap: 10px;

            padding:10px 0;

            .m-cardlist-item {
                box-sizing: border-box;
                background: #fff;
                border: none;
                transition: 0.3s ease-out;
                // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

                // replace slot 在 grid 内的容器（用于"查看全部"卡片）
                &.m-cardlist-replace--inline {
                    .flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }
            }
        }

        .m-cardlist-replace {
            .pointer;
            .flex;
            .w(110px);
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            align-self: center;

            svg {
                transition: 0.3s ease-out;
                fill: #E1E1E1;
            }

            &:hover svg {
                fill: v-bind(color);
            }
        }
    }
}

@media screen and (max-width: @phone) {
    .m-card-banner-list {
        .m-card-banner-list_box {
            ::-webkit-scrollbar {
                display: none;
            }

            .m-cardlist-replace {
                .none;
            }
        }
    }
}
</style>
