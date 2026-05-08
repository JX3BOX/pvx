<!--
 * @Author: zhusha
 * @Date: 2025-02-17 23:22:35
 * @LastEditors: zhusha
 * @LastEditTime: 2025-04-20 00:00:00
 * @Description: 小程序体型详情 - 重构版
 * 使用 MiniappSingleDetail 组件替换原有实现
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <MiniappSingleDetail
        :post="post"
        type="body"
        :randomList="randomList"
        :disabled="$route.query?.disabled === 'true'"
        :loading="loading"
        @go-to-data="goToBodydatMobile"
    />
</template>

<script>
import MiniappSingleDetail from "@/components/common/face-body/miniprogram/MiniappSingleDetail";
import { getOneBodyInfo, getRandomBody } from "@/service/body";
import { parseBodyData } from "@/utils/data-parser";

export default {
    name: "BodySingleMiniprogram",
    components: { MiniappSingleDetail },
    computed: {
        id() {
            return ~~this.$route.params.id;
        },
        bodydata() {
            return parseBodyData(this.post?.data) || { object: {} };
        },
    },
    data() {
        return {
            loading: false,
            post: {},
            randomList: [],
        };
    },
    created() {
        this.getData();
    },
    methods: {
        // 获取详情数据
        getData() {
            if (this.id) {
                this.loading = true;
                getOneBodyInfo(this.id)
                    .then((res) => {
                        this.post = res.data.data;
                        document.title = this.post.title + this.$t("pages.common.appendTitle");
                        this.getRandomBodyList();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        },
        // 获取随机作品列表
        getRandomBodyList() {
            const { user_id } = this.post;
            getRandomBody({
                user_id,
                list: 8,
            }).then((res) => {
                if (res.data.data.list && res.data.data.list.length > 0) {
                    this.randomList = res.data.data.list;
                }
            });
        },
        // 跳转到数据页
        goToBodydatMobile() {
            sessionStorage.setItem("bodyData", JSON.stringify(this.bodydata));
            this.$router.push({
                name: "bodydatMobile",
            });
        },
    },
};
</script>
