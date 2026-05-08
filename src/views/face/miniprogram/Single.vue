<!--
 * @Author: zhusha
 * @Date: 2025-02-17 23:22:35
 * @LastEditors: zhusha
 * @LastEditTime: 2026-04-20 13:07:26
 * @Description: 小程序捏脸详情 - 重构版
 * 使用 MiniappSingleDetail 组件替换原有实现
 *
 * Copyright (c) 2025 by zhusha, email: no email, All Rights Reserved.
-->
<template>
    <MiniappSingleDetail
        :post="post"
        type="face"
        :randomList="randomList"
        :disabled="$route.query?.disabled === 'true'"
        :loading="loading"
        @go-to-data="goToFaceDataMobile"
    />
</template>

<script>
import MiniappSingleDetail from "@/components/common/face-body/miniprogram/MiniappSingleDetail";
import { getOneFaceInfo, getRandomFace } from "@/service/face";
import { buildFaceAllData } from "@/utils/data-parser";

export default {
    name: "FaceSingleMiniprogram",
    components: { MiniappSingleDetail },
    computed: {
        id() {
            return ~~this.$route.params.id;
        },
        facedata() {
            return buildFaceAllData(this.post?.data);
        },
        faceAllData() {
            return this.facedata;
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
                getOneFaceInfo(this.id)
                    .then((res) => {
                        this.post = res.data.data;
                        document.title = this.post.title + this.$t("pages.common.appendTitle");
                        this.getRandomFaceList();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        },
        // 获取随机作品列表
        getRandomFaceList() {
            const { user_id } = this.post;
            getRandomFace({
                user_id,
                list: 8,
            }).then((res) => {
                if (res.data.data.list && res.data.data.list.length > 0) {
                    this.randomList = res.data.data.list;
                }
            });
        },
        // 跳转到数据页
        goToFaceDataMobile() {
            sessionStorage.setItem("faceData", JSON.stringify(this.faceAllData));
            this.$router.push({
                name: "faceDataMobile",
            });
        },
    },
};
</script>
