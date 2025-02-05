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
        <div class="m-card-banner-list_box" :count="count" :minw="minw" :isPhone="isPhone()">
            <div
                class="m-cardlist-items"
                :style="`grid-template-columns: repeat( ${isPhone() ? 8 : count}, ${
                    isPhone() ? minw + 'px' : '1fr'
                }  )`"
            >
                <div class="m-cardlist-item" v-for="(item, index) in list" :key="index">
                    <!-- 调用渲染函数来渲染子元素 -->
                    <slot :item="item" :index="index">
                        <!-- 默认的渲染方式，显示item的文本 -->
                        {{ item }}
                    </slot>
                </div>
            </div>
            <div
                class="m-cardlist-replace"
                :style="{ height: height + 'px' }"
                @mouseover="changeColor(color)"
                @mouseout="changeColor('#E1E1E1')"
                @click="update"
            >
                <img svg-inline src="@/assets/img/replace.svg" :fill="fill" />
            </div>
        </div>
    </div>
</template>

<script>
import { isPhone } from "@/utils";

export default {
    name: "CardBannerList",
    props: ["data", "count", "items", "minw"],
    emits: ["update:load"],
    data: function () {
        return {
            fill: "#E1E1E1",
            number: 0,
            isPhone,
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
            return this.count ? this.items.slice(0, this.count) : this.items;
        },
    },
    mounted() {},
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

<style lang="less" >
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
            .fz(24px,1);
            .bold(700);
            color: #24292e;
        }
        .u-action {
            cursor: pointer;
            color: #a5a5a5;
            .fz(16px,21px);
        }
    }
    .m-card-banner-list_box {
        .flex;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        .m-cardlist-items {
            flex: 1;
            .grid;
            gap: 20px;
            overflow-x: auto;
            .m-cardlist-item {
                box-sizing: border-box;
                background: #fff;
                border: 2px solid #fff;
                transition: 0.3s ease-out;
                // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
        }
        .m-cardlist-replace {
            .pointer;
            .flex;
            .w(110px);
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            svg {
                transition: 0.3s ease-out;
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
