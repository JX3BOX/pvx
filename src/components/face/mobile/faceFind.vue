<!--
 * @Author: zhusha 
 * @Date: 2025-02-16 01:28:40
 * @LastEditors: zhusha
 * @LastEditTime: 2025-02-17 23:17:44
 * @Description: 小程序适配捏脸 发现模块样式
 * 
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved. 
-->
<template>
    <div class="p-face-find">
        <div class="u-item" v-for="item in 12" :key="item">
            <div class="u-item_img">
                <img
                    src="https://cdn.jx3box.com/upload/post/2025/2/7/316126_4330747.png?x-oss-process=image/auto-orient,1/resize,m_fill,w_335,h_335/quality,Q_100"
                />
            </div>
            <div class="u-author">
                <div class="u-author_img">
                    <img
                        src="https://cdn.jx3box.com/upload/avatar/2024/11/1/316126_6226256.jpg?x-oss-process=style/avatar_s"
                    />
                </div>
                <div class="u-author_info">
                    <div class="u-author_name">作品名称</div>
                    <div class="u-author_art">作者名称</div>
                </div>
            </div>
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
.p-face-find {
    .size(335px,335px);
    margin: 0 auto;
    .u-item {
        .pr;
        .mb(12px);
        .x;
        .u-item_img {
            .size(335px,335px);
            .r(4px);
            overflow: hidden;
            .pr;
            &::before {
                content: "";
                .pa;
                .size(100%,100%);
                .lt(0);
                .dbi;
                .z(1);
                background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
            }
            img {
                object-fit: contain;
            }
        }
        .u-author {
            .pa;
            .z(2);
            .lt(12px);
            .flex;
            .flex(o);
            .u-author_img {
                .size(60px,60px);
                .r(8px);
                background: #595959;
                overflow: hidden;
                .mr(14px);
            }
        }
        .u-author_info {
        }
        .u-author_name {
            color: #fff;
            .mb(4px);
            .fz(14px,20px);
            .bold(700);
        }
        .u-author_art {
            color: rgba(255, 255, 255, 0.4);
            .fz(12px,18px);
            .bold(400);
        }
    }
}
</style>
