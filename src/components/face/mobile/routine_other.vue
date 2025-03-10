<!--
 * @Author: zhusha
 * @Date: 2025-02-16 01:28:40
 * @LastEditors: zhusha
 * @LastEditTime: 2025-03-08 23:56:12
 * @Description: 小程序适配捏脸常规模组-其他作品
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <div class="p-face-routine" :style="{ gap: gap }">
        <div class="u-item" v-for="item in list" :key="item.id" :style="{ width: width + 'px', height: height + 'px' }">
            <a :href="`${link}/${item.id}`" :style="{ width: width + 'px', height: height + 'px' }">
                <div class="u-item_img">
                    <img :src="showImg(item)" />
                    <div class="u-item_name">{{ item.title }}</div>
                </div>
            </a>
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
export default {
    computed: {
        link() {
            return location.origin + "/body";
        },
    },
    components: {},
    props: {
        gap: {
            type: String,
            default: "8px",
        },
        size: {
            type: Number,
            default: 110,
        },
        isNumber: {
            type: Boolean,
            default: false,
        },
        number: {
            type: Number,
            default: 3,
        },
        list: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            width: 0,
            height: 0,
        };
    },
    created() { },
    mounted() {
        this.width = this.isNumber ? parseInt((document.body.clientWidth - 72) / this.number) : this.size;
        this.height = parseInt(this.width / 0.6);
    },
    methods: {
        getThumbnail,
        showImg(item) {
            return this.getThumbnail(item.images?.[0] || __imgPath + `image/face/null2.png`, [
                this.width,
                parseInt(this.width / 0.6),
            ]);
        },
        getMore() {
            this.$emit("getMore");
        },
    },
};
</script>

<style lang="less" scoped>
@black-80: rgba(28, 28, 28, 0.8);
@black-40: rgba(28, 28, 28, 0.4);
@color: #fafafa;
@color-dark: #282828;

.p-face-routine {
    .w(100%);
    .flex;
    overflow: auto;
    box-sizing: border-box;

    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    .u-item {
        .u-item_img {
            .r(4px);
            background: #d9d9d9;
            overflow: hidden;
            .pr;
            .size(100%, 100%);

            &::before {
                content: "";
                .pa;
                .size(100%, 100%);
                .lt(0);
                .dbi;
                .z(1);
                background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
            }

            img {
                .size(100%, 100%);
                object-fit: cover;
            }
        }

        .u-item_name {
            .pa;
            .z(2);
            .lb(6px);
            .bold(400);
            font-style: normal;
            .w(calc(100% - 12px));
            .fz(14px, 20px);
            .mb(4px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: @color;
            // @media screen and (width: 390px) {
            //     color: @color-dark;
            // }
            // @media (prefers-color-scheme: dark) {
            //     color: @color-dark;
            // }
        }
    }
}
</style>
