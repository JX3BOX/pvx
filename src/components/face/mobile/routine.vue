<!--
 * @Author: zhusha 
 * @Date: 2025-02-16 01:28:40
 * @LastEditors: zhusha
 * @LastEditTime: 2025-02-16 01:53:32
 * @Description: 小程序适配常规模组
 * 
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved. 
-->
<template>
    <div class="p-face-routine">
        <div class="u-item" v-for="item in 12" :key="item">
            <div class="u-item_img">
                <img
                    src="https://cdn.jx3box.com/upload/post/2025/2/7/316126_4330747.png?x-oss-process=image/auto-orient,1/resize,m_fill,w_360,h_360/quality,Q_100"
                />
            </div>
            <div class="u-item_tag">
                <div class="u-tag_item green"></div>
                <div class="u-tag_item mint"></div>
                <div class="u-tag_item purple"></div>
            </div>
            <div class="u-item_name">作品名称</div>
            <div class="u-item_author">作者名称</div>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {};
    },
    created() {},
    mounted() {},
    methods: {},
};
</script>

<style lang="less" scoped>
@black-80: rgba(28, 28, 28, 0.8);
@black-40: rgba(28, 28, 28, 0.4);
.p-face-routine {
    .size(100%,182px);
    .flex;
    gap: 20px;
    overflow: auto;
    box-sizing: border-box;
    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    .u-item {
        .u-item_img {
            .size(120px,120px);
            border-radius: 4px;
            background: #d9d9d9;
            overflow: hidden;
            img {
                .size(100%,100%);
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
                    background: #ff72af;
                }
                &.purple {
                    background: #af52de;
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
            color: @black-80;
            .fz(14px,20px);
            .mb(4px);
        }
        .u-item_author {
            color: @black-40;
            .fz(12px,18px);
        }
    }
}
</style>
