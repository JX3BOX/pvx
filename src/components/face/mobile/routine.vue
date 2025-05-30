<!--
 * @Author: zhusha
 * @Date: 2025-02-16 01:28:40
 * @LastEditors: zhusha
 * @LastEditTime: 2025-03-20 21:51:05
 * @Description: 小程序适配捏脸常规模组
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <div class="p-face-routine" :style="{ gap: gap }" :class="{ 'p-face-routine_one': isOne }" @scroll="handleScroll">
        <div class="u-item" v-for="item in list" :key="item.id"
            :style="{ width: isOne ? 'calc(calc(100vw - 64px) / 3)' : size  }">
            <a :href="`${link}/${item.id}`">
                <div class="u-item_img" :style="{
                    width: isOne ? '100%' : size,
                    height: isOne ? 'calc(calc(100vw - 64px) / 3)' : size ,
                }">
                    <el-image class="u-pic" :src="showImg(item)" fit="cover">
                        <div slot="error" class="image-slot">
                            <img src="@/assets/img/body_null.png" />
                        </div>
                    </el-image>
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
        <!-- <div class="u-more" v-if="isOne && list.length < total">
            <el-link type="primary" @click="getMore">加载更多</el-link>
        </div> -->
    </div>
</template>

<script>
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
export default {
    computed: {
        link() {
            return location.origin + `/${this.type}`
        },
    },
    components: {},
    props: {
        gap: {
            type: String,
            default: "0.889rem",
        },
        size: {
            type: String,
            default: '6.667rem',
        },
        list: {
            type: Array,
            default: () => [],
        },
        total: {
            type: Number,
            default: 0,
        },
        isOne: {
            type: Boolean,
            default: false,
        },
        loadingList: {
            type: Boolean,
            default: false,
        },
        type:{
            type: String,
            default: 'face'
        }
    },
    data() {
        return {
        };
    },
    created() {

    },
    mounted() { },
    methods: {
        getThumbnail,
        showImg(item) {
            let width = parseInt((document.body.clientWidth - 64) / 3);
            return this.getThumbnail(
                item.images?.[0] || __imgPath + `image/face/null2.png`,
                this.isOne ? this.getImgSize(width) : this.getImgSize(this.size)
            );
        },
        getImgSize(w){
            if(typeof w=='number') return w;
          if(w.indexOf('px')>-1){
              return Math.ceil(w.substring(0,w.length - 2))
          }else if(w.indexOf('rem')>-1){
              let str=this.convertRemPx(w.substring(0, w.length - 3),'px')
              return Math.ceil(str.substring(0,str.length - 2))
          }
        },
        convertRemPx(value, mode) {
            // 获取根元素font-size大小
            const htmlFontSize = window.getComputedStyle(
                document.documentElement,
            ).fontSize;

            if (mode === "rem") {
                // 转rem
                return `${value / parseFloat(htmlFontSize)}rem`;
            } else if (mode === "px") {
                // 转px
                return `${value * parseFloat(htmlFontSize)}px`;
            } else {
                console.error("参数错误！");
            }
        },
        getMore() {
            this.$emit("getMore");
        },
        handleScroll(event) {
            const { target } = event;
            if (this.loadingList) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.getMore();
            }
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
    .size(100%, 182px);
    .flex;
    overflow: auto;
    box-sizing: border-box;
    padding: 0 1.25rem;
    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    &.p-face-routine_one {
        flex-wrap: wrap;
        height: calc(100vh - 4.222rem);
        // .mt(10px);
    }

    .u-item {
        .u-item_img {
            .r(0.444rem);
            background: #d9d9d9;
            overflow: hidden;

            img {
                object-fit: contain;
            }
        }

        .u-item_tag {
            .flex;
            gap: 0.222rem;
            padding: 0.222rem 0.111rem;
            box-sizing: border-box;

            .u-tag_item {
                .size(0.667rem, 0.111rem);
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
            padding: 0 0.111rem;
            box-sizing: border-box;
            .bold(400);
            font-style: normal;
        }

        .u-item_name {
            .w(100%);
            color: @titleColor;
            .fz(0.778rem, 1.333rem);
            .mb(0.222rem);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .u-item_author {
            color: @nameColor;
            .fz(0.667rem, 1rem);
        }

        // @media screen and (width: 390px) {
        //     .u-item_name {
        //         color: @titleColor-dark;
        //     }
        //     .u-item_author {
        //         color: @nameColor-dark;
        //     }
        // }
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
