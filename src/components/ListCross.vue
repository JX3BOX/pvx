<template>
    <div ref="wrap" class="cross-wrapper" :class="`m-${type}`">
        <template v-if="isShow">
            <div
                class="cross cross-left"
                :class="!isInLeft && 'active'"
                :style="{
                    width: width + 'px',
                    'border-top-left-radius': radius + 'px',
                    'border-bottom-left-radius': radius + 'px',
                }"
                @click.stop="toLeft"
            >
                <i class="el-icon-caret-left"></i>
            </div>
            <div
                class="cross cross-right"
                :class="!isInRight && 'active'"
                :style="{
                    width: width + 'px',
                    'border-top-right-radius': radius + 'px',
                    'border-bottom-right-radius': radius + 'px',
                }"
                @click.stop="toRight"
            >
                <i class="el-icon-caret-right"></i>
            </div>
        </template>
        <div ref="list" class="list">
            <div
                class="item"
                :style="{ 'margin-right': gap + 'px' }"
                v-for="(item, index) in list"
                :key="item.id || item.ID + item.ItemID || index"
            >
                <slot v-bind:item="item"></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Cross",
    props: {
        list: {
            type: Array,
            required: true,
        },
        width: {
            type: Number,
            default: 60,
        },
        gap: {
            type: Number,
            default: 20,
        },
        radius: {
            type: Number,
            default: 10,
        },
        offset: {
            type: Object,
            default: () => {
                return {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                };
            },
        },
        type: {
            // pvx menus 分类
            type: String,
            default: "rare",
        },
        arrow: {
            // 每次滚动的系数 默认为1 wrapper宽度的一半
            type: Number,
            default: 1,
        },
    },
    data() {
        return {
            scrollLeft: 0,
            isInLeft: true,
            isInRight: false,
            isShow: false,
        };
    },
    methods: {
        toLeft(e) {
            e.preventDefault();
            this.isInRight = false;
            this.scroll(-this.arrow);
        },
        toRight(e) {
            e.preventDefault();
            this.isInLeft = false;
            this.scroll(this.arrow);
        },
        scroll(arrow = 1) {
            const list = this.$refs.list;
            const nowLeft = list.scrollLeft;
            const width = list.scrollWidth;
            const wrapperWidth = list.clientWidth;
            const step = (wrapperWidth / 2) * arrow;
            let timer = null;
            timer = setInterval(() => {
                if (arrow === this.arrow) {
                    // 向右
                    if (list.scrollLeft < nowLeft + step) {
                        list.scrollLeft += Math.ceil(step / 100);
                    } else {
                        clearInterval(timer);
                    }
                    if (Math.ceil(list.scrollLeft + wrapperWidth) >= width) {
                        this.isInRight = true;
                        clearInterval(timer);
                    }
                } else if (arrow === -this.arrow) {
                    // 向左
                    if (list.scrollLeft > nowLeft + step) {
                        list.scrollLeft += Math.floor(step / 100);
                    } else {
                        clearInterval(timer);
                    }
                    if (list.scrollLeft <= 0) {
                        this.isInLeft = true;
                        clearInterval(timer);
                    }
                }
            }, 1);
        },
    },
    mounted() {
        this.$nextTick(() => {
            const list = this.$refs.list;
            const cWidth = list.clientWidth;
            const sWidth = list.scrollWidth;
            if (sWidth > cWidth) {
                this.isShow = true;
            }
        });
    },
};
</script>

<style lang="less">
@import "~@/assets/css/cross.less";
</style>
