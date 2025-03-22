<!--
 * @Author: zhusha
 * @Date: 2025-02-17 22:25:34
 * @LastEditors: zhusha
 * @LastEditTime: 2025-03-22 09:38:34
 * @Description: 小程序适配体型常规模组
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <div class="p-pvx-habitus">
        <div class="u-item" v-for="(item, index) in list" :key="index"
            :style="{ width: 'calc(calc(100vw - 70px) / 4)' }" @click="$emit('toTab', item)">
            <div class="u-item_img">
                <el-image class="u-pic" :src="showImg(item)" fit="cover">
                    <div slot="error" class="image-slot">
                        <img src="@/assets/img/body_null.png" />
                    </div>
                </el-image>
            </div>

            <div class="u-item_type">{{ showBodyTypeLabel(item.body_type) }}</div>
        </div>
    </div>
</template>

<script>
import { bodyMap } from "@jx3box/jx3box-data/data/role/body.json";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
export default {
    props: {
        list: {
            type: Array,
            default: () => [],
        },
    },
    components: {},
    data() {
        return {};
    },
    created() { },
    mounted() { },
    methods: {
        getThumbnail,
        showBodyTypeLabel(val) {
            return bodyMap[val];
        },
        showImg(item) {
            let width = parseInt((document.body.clientWidth - 70) / 4);
            return this.getThumbnail(item.images?.[0] || __imgPath + `image/face/null2.png`, [width, 156]);
        },
    },
};
</script>

<style lang="less" scoped>
@titleColor: #fafafa;
@titleColor-dark: rgba(255, 255, 255, 0.8);

.p-pvx-habitus {
    .flex;
    gap: 10px;

    // overflow: auto;
    // box-sizing: border-box;
    // &::-webkit-scrollbar {
    //     width: 0;
    //     height: 0;
    // }
    .u-item {
        .pr;
        .h(156px);

        .u-item_img {
            .size(100%);
            .r(8px);
            .pr;
            overflow: hidden;

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
                .size(100%);
                object-fit: cover;
            }
        }

        .u-item_type {
            color: @titleColor;
            .fz(14px, 15px);
            .bold(400);
            font-style: normal;
            .pa;
            .z(2);
            .lb(0, 4px);
            padding: 0 6px;

            // @media screen and (width: 390px) {
            //     color: @titleColor-dark;
            // }
            @media (prefers-color-scheme: dark) {
                color: @titleColor-dark;
            }
        }
    }
}
</style>
