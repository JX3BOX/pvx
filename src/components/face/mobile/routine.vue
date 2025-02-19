<!--
 * @Author: zhusha 
 * @Date: 2025-02-16 01:28:40
 * @LastEditors: zhusha
 * @LastEditTime: 2025-02-19 23:47:21
 * @Description: 小程序适配捏脸常规模组
 * 
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved. 
-->
<template>
    <div class="p-face-routine" :style="{ gap: gap }" :class="{ 'p-face-routine_one': isOne }">
        <div
            class="u-item"
            v-for="item in list"
            :key="item.id"
            :style="{ width: isOne ? 'calc(calc(100% - 24px) / 3)' : size + 'px' }"
        >
            <a :href="`${link}/${item.id}`">
                <div
                    class="u-item_img"
                    :style="{
                        width: isOne ? '100%' : size + 'px',
                        height: isOne ? 'calc(calc(100vw - 64px) / 3)' : size + 'px',
                    }"
                >
                    <img :src="showImg(item)" />
                </div>
                <div class="u-item_tag">
                    <div class="u-tag_item green" v-if="item.is_new_face"></div>
                    <div class="u-tag_item mint" v-else></div>
                    <div class="u-tag_item new" v-if="!!item.is_unlimited"></div>
                    <div class="u-tag_item purple" v-if="!!item.star"></div>
                </div>
                <div class="u-item_name">{{ item.title }}</div>
                <div class="u-item_author">{{ item.display_name || "匿名" }}</div>
            </a>
        </div>
        <div class="u-more" v-if="isOne">
            <el-link type="primary" @click="getMore">加载更多</el-link>
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
export default {
    computed: {
        link() {
            return location.origin + "/face/singleMobile";
        },
    },
    components: {},
    props: {
        gap: {
            type: String,
            default: "20px",
        },
        size: {
            type: Number,
            default: 120,
        },
        list: {
            type: Array,
            default: () => [],
        },
        isOne: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    created() {},
    mounted() {},
    methods: {
        getThumbnail,
        showImg(item) {
            let width = parseInt((document.body.clientWidth - 64) / 3);
            return this.getThumbnail(
                item.images?.[0] || __imgPath + `image/face/null2.png`,
                this.isOne ? width : this.size
            );
        },
        getMore() {
            this.$emit("getMore");
        },
    },
};
</script>

<style lang="less" scoped>
@titleColor: rgba(28, 28, 28, 0.8);
@nameColor: rgba(28, 28, 28, 0.4);
@titleColor-dark: rgba(255, 255, 255, 0.8);
@nameColor-dark: rgba(255, 255, 255, 0.4);
.p-face-routine {
    .size(100%,182px);
    .flex;
    overflow: auto;
    box-sizing: border-box;
    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
    &.p-face-routine_one {
        flex-wrap: wrap;
        height: calc(100vh - 116px);
    }
    .u-item {
        .u-item_img {
            .r(4px);
            background: #d9d9d9;
            overflow: hidden;
            img {
                object-fit: contain;
            }
        }
        .u-item_tag {
            .flex;
            gap: 4px;
            padding: 4px 2px;
            box-sizing: border-box;
            .u-tag_item {
                .size(12px,2px);
                border-radius: 100px;
                &.green {
                    background: #34c759;
                }
                &.mint {
                    background: #23abe5;
                }
                &.purple {
                    background: #af52de;
                }
                &.new {
                    background: #ff72af;
                }
            }
        }
        .u-item_name,
        .u-item_author {
            padding: 0 2px;
            box-sizing: border-box;
            .bold(400);
            font-style: normal;
        }
        .u-item_name {
            .w(100%);
            color: @titleColor;
            .fz(14px,20px);
            .mb(4px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .u-item_author {
            color: @nameColor;
            .fz(12px,18px);
        }
        @media screen and (width: 390px) {
            .u-item_name {
                color: @titleColor-dark;
            }
            .u-item_author {
                color: @nameColor-dark;
            }
        }
        @media (prefers-color-scheme: dark) {
            .u-item_name {
                color: @titleColor-dark;
            }
            .u-item_author {
                color: @nameColor-dark;
            }
        }
    }

    .u-more {
        .x;
        .w(100%);
    }
}
</style>
